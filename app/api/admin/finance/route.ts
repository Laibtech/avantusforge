import { NextResponse } from "next/server";
import { getCurrentAdminSession } from "@/lib/auth";
import { getDbPool } from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

// Permission check: Super Admin, Administrator, or Finance Manager
function isAuthorizedFinanceRole(role: string): boolean {
  return ["super_admin", "admin", "finance_manager"].includes(role);
}

export async function GET(req: Request) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!isAuthorizedFinanceRole(session.user.role)) {
    return NextResponse.json(
      { success: false, message: "Access Denied: Requires Finance Manager or Super Administrator privileges." },
      { status: 403 }
    );
  }

  try {
    const p = getDbPool();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all";

    // 1. Fetch Invoices
    const [invoices] = await p.query<RowDataPacket[]>(
      `SELECT * FROM finance_invoices ORDER BY created_at DESC`
    );

    // 2. Fetch Expenses
    const [expenses] = await p.query<RowDataPacket[]>(
      `SELECT * FROM finance_expenses ORDER BY expense_date DESC`
    );

    // 3. Fetch Payments
    const [payments] = await p.query<RowDataPacket[]>(
      `SELECT p.*, i.invoice_number, i.client_name 
       FROM finance_payments p 
       JOIN finance_invoices i ON p.invoice_id = i.id 
       ORDER BY p.payment_date DESC`
    );

    // Summary calculations
    let totalInvoiced = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;
    let totalExpenses = 0;

    for (const inv of invoices) {
      if (inv.status !== "Cancelled") {
        totalInvoiced += Number(inv.total_amount || 0);
        totalOutstanding += Number(inv.balance_due || 0);
        totalCollected += Number(inv.total_amount || 0) - Number(inv.balance_due || 0);
      }
    }

    for (const exp of expenses) {
      totalExpenses += Number(exp.amount || 0);
    }

    const netOperatingBalance = totalCollected - totalExpenses;

    return NextResponse.json({
      success: true,
      invoices,
      expenses,
      payments,
      summary: {
        totalInvoiced: totalInvoiced.toFixed(2),
        totalCollected: totalCollected.toFixed(2),
        totalOutstanding: totalOutstanding.toFixed(2),
        totalExpenses: totalExpenses.toFixed(2),
        netOperatingBalance: netOperatingBalance.toFixed(2),
        invoicesCount: invoices.length,
        expensesCount: expenses.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!isAuthorizedFinanceRole(session.user.role)) {
    return NextResponse.json(
      { success: false, message: "Access Denied: Requires Finance Manager or Super Administrator privileges." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { action } = body;
    const p = getDbPool();

    if (action === "create_invoice" || action === "update_invoice") {
      const {
        id,
        invoice_number,
        client_id,
        client_name,
        client_email,
        project_id,
        issue_date,
        due_date,
        currency = "USD",
        tax_rate = 0,
        notes = "",
        status = "Sent",
        line_items = [],
      } = body;

      if (!invoice_number || !client_name || !issue_date || !due_date) {
        return NextResponse.json(
          { success: false, message: "Invoice number, client name, issue date, and due date are required." },
          { status: 400 }
        );
      }

      // Calculate totals with strict 2-decimal precision
      let subtotal = 0;
      for (const item of line_items) {
        const qty = Number(item.quantity) || 1;
        const rate = Number(item.unit_price) || 0;
        const itemTotal = qty * rate;
        item.total = Number(itemTotal.toFixed(2));
        subtotal += itemTotal;
      }

      const taxRateNum = Number(tax_rate) || 0;
      const taxAmount = Number(((subtotal * taxRateNum) / 100).toFixed(2));
      const totalAmount = Number((subtotal + taxAmount).toFixed(2));

      if (id) {
        // Find existing payments to retain balance
        const [payRows] = await p.query<RowDataPacket[]>(
          "SELECT COALESCE(SUM(amount), 0) as paid FROM finance_payments WHERE invoice_id = ?",
          [id]
        );
        const alreadyPaid = Number(payRows[0]?.paid || 0);
        const newBalance = Math.max(0, Number((totalAmount - alreadyPaid).toFixed(2)));
        let updatedStatus = status;
        if (newBalance === 0) updatedStatus = "Paid";
        else if (alreadyPaid > 0) updatedStatus = "Partially Paid";

        await p.query(
          `UPDATE finance_invoices
           SET invoice_number = ?, client_id = ?, client_name = ?, client_email = ?, project_id = ?, 
               issue_date = ?, due_date = ?, currency = ?, subtotal = ?, tax_rate = ?, tax_amount = ?, 
               total_amount = ?, balance_due = ?, status = ?, notes = ?, line_items_json = ?
           WHERE id = ?`,
          [
            invoice_number.trim(),
            client_id || null,
            client_name.trim(),
            client_email.trim(),
            project_id || null,
            issue_date,
            due_date,
            currency,
            subtotal.toFixed(2),
            taxRateNum.toFixed(2),
            taxAmount.toFixed(2),
            totalAmount.toFixed(2),
            newBalance.toFixed(2),
            updatedStatus,
            notes,
            JSON.stringify(line_items),
            id,
          ]
        );

        await p.query(
          "INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'INVOICE_UPDATED', 'Finance', ?, ?)",
          [session.user.username, String(id), `Updated invoice ${invoice_number} for ${client_name}`]
        );

        return NextResponse.json({ success: true, message: `Invoice ${invoice_number} updated successfully.` });
      } else {
        const balanceDue = totalAmount;

        const [res] = await p.query<ResultSetHeader>(
          `INSERT INTO finance_invoices 
           (invoice_number, client_id, client_name, client_email, project_id, issue_date, due_date, currency, subtotal, tax_rate, tax_amount, total_amount, balance_due, status, notes, line_items_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            invoice_number.trim(),
            client_id || null,
            client_name.trim(),
            client_email.trim(),
            project_id || null,
            issue_date,
            due_date,
            currency,
            subtotal.toFixed(2),
            taxRateNum.toFixed(2),
            taxAmount.toFixed(2),
            totalAmount.toFixed(2),
            balanceDue.toFixed(2),
            status,
            notes,
            JSON.stringify(line_items),
          ]
        );

        await p.query(
          "INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'INVOICE_CREATED', 'Finance', ?, ?)",
          [session.user.username, String(res.insertId), `Generated invoice ${invoice_number} ($${totalAmount.toFixed(2)})`]
        );

        return NextResponse.json({ success: true, message: `Invoice ${invoice_number} created successfully.` });
      }
    } else if (action === "record_payment") {
      const {
        invoice_id,
        amount,
        currency = "USD",
        payment_date,
        payment_method = "Bank Wire Transfer",
        transaction_reference = "",
        notes = "",
      } = body;

      const paymentAmt = Number(amount);
      if (!invoice_id || isNaN(paymentAmt) || paymentAmt <= 0 || !payment_date) {
        return NextResponse.json(
          { success: false, message: "Valid invoice, payment amount, and payment date are required." },
          { status: 400 }
        );
      }

      // Check invoice
      const [invRows] = await p.query<RowDataPacket[]>("SELECT * FROM finance_invoices WHERE id = ?", [invoice_id]);
      if (!invRows || invRows.length === 0) {
        return NextResponse.json({ success: false, message: "Invoice not found." }, { status: 404 });
      }
      const inv = invRows[0];

      // Insert payment record
      await p.query(
        `INSERT INTO finance_payments 
         (invoice_id, amount, currency, payment_date, payment_method, transaction_reference, notes, recorded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          invoice_id,
          paymentAmt.toFixed(2),
          currency,
          payment_date,
          payment_method,
          transaction_reference.trim() || null,
          notes.trim() || null,
          session.user.username,
        ]
      );

      // Recalculate balance
      const [payRows] = await p.query<RowDataPacket[]>(
        "SELECT COALESCE(SUM(amount), 0) as total_paid FROM finance_payments WHERE invoice_id = ?",
        [invoice_id]
      );
      const totalPaid = Number(payRows[0]?.total_paid || 0);
      const remainingBalance = Math.max(0, Number((Number(inv.total_amount) - totalPaid).toFixed(2)));

      let newStatus = inv.status;
      if (remainingBalance <= 0) {
        newStatus = "Paid";
      } else {
        newStatus = "Partially Paid";
      }

      await p.query(
        "UPDATE finance_invoices SET balance_due = ?, status = ? WHERE id = ?",
        [remainingBalance.toFixed(2), newStatus, invoice_id]
      );

      await p.query(
        "INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'PAYMENT_RECORDED', 'Finance', ?, ?)",
        [
          session.user.username,
          String(invoice_id),
          `Recorded payment of ${currency} ${paymentAmt.toFixed(2)} for ${inv.invoice_number}`,
        ]
      );

      return NextResponse.json({
        success: true,
        message: `Payment of ${currency} ${paymentAmt.toFixed(2)} recorded successfully. New balance: ${remainingBalance.toFixed(2)}.`,
      });
    } else if (action === "create_expense") {
      const {
        category,
        description,
        amount,
        currency = "USD",
        expense_date,
        vendor_name = "",
        payment_method = "Corporate Card",
        receipt_url = "",
      } = body;

      const amtNum = Number(amount);
      if (!category || !description || isNaN(amtNum) || amtNum <= 0 || !expense_date) {
        return NextResponse.json(
          { success: false, message: "Category, description, valid amount, and expense date are required." },
          { status: 400 }
        );
      }

      const [res] = await p.query<ResultSetHeader>(
        `INSERT INTO finance_expenses 
         (category, description, amount, currency, expense_date, vendor_name, payment_method, receipt_url, approved_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          category,
          description.trim(),
          amtNum.toFixed(2),
          currency,
          expense_date,
          vendor_name.trim() || null,
          payment_method,
          receipt_url.trim() || null,
          session.user.username,
        ]
      );

      await p.query(
        "INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'EXPENSE_LOGGED', 'Finance', ?, ?)",
        [session.user.username, String(res.insertId), `Logged expense '${description}' ($${amtNum.toFixed(2)})`]
      );

      return NextResponse.json({ success: true, message: "Expense recorded successfully." });
    } else if (action === "delete_expense") {
      const { id } = body;
      await p.query("DELETE FROM finance_expenses WHERE id = ?", [id]);
      await p.query(
        "INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'EXPENSE_DELETED', 'Finance', ?, ?)",
        [session.user.username, String(id), `Removed expense record ID ${id}`]
      );
      return NextResponse.json({ success: true, message: "Expense record deleted." });
    } else if (action === "delete_invoice") {
      const { id } = body;
      // Check if payments exist
      const [payments] = await p.query<RowDataPacket[]>("SELECT COUNT(*) as c FROM finance_payments WHERE invoice_id = ?", [id]);
      if (payments[0]?.c > 0) {
        return NextResponse.json(
          { success: false, message: "Cannot delete invoice with recorded payments. Please cancel it instead to preserve financial history." },
          { status: 400 }
        );
      }

      await p.query("DELETE FROM finance_invoices WHERE id = ?", [id]);
      await p.query(
        "INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'INVOICE_DELETED', 'Finance', ?, ?)",
        [session.user.username, String(id), `Deleted invoice ID ${id}`]
      );
      return NextResponse.json({ success: true, message: "Invoice removed successfully." });
    }

    return NextResponse.json({ success: false, message: "Unsupported action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
