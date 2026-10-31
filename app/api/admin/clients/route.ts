import { NextResponse } from "next/server";
import { getCurrentAdminSession } from "@/lib/auth";
import { getDbPool } from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export async function GET(req: Request) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const p = getDbPool();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";

    let query = `
      SELECT c.*, 
        (SELECT COUNT(*) FROM business_projects p WHERE p.client_name = c.company_name) as projects_count,
        (SELECT COUNT(*) FROM finance_invoices i WHERE i.client_id = c.id OR i.client_name = c.company_name) as invoices_count,
        (SELECT COALESCE(SUM(balance_due), 0) FROM finance_invoices i WHERE (i.client_id = c.id OR i.client_name = c.company_name) AND i.status != 'Cancelled') as outstanding_balance
      FROM crm_clients c
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status !== "ALL") {
      query += " AND c.status = ?";
      params.push(status);
    }

    if (search.trim()) {
      query += " AND (c.company_name LIKE ? OR c.contact_name LIKE ? OR c.email LIKE ? OR c.country LIKE ?)";
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    query += " ORDER BY c.created_at DESC";

    const [rows] = await p.query<RowDataPacket[]>(query, params);

    return NextResponse.json({
      success: true,
      clients: rows,
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

  try {
    const body = await req.json();
    const {
      id,
      company_name,
      contact_name,
      email,
      phone = "",
      address = "",
      country = "United Kingdom",
      website = "",
      status = "Active",
      account_manager = "Usman Farooq",
      notes = "",
    } = body;

    if (!company_name?.trim() || !contact_name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { success: false, message: "Company name, contact person, and email are required." },
        { status: 400 }
      );
    }

    const p = getDbPool();

    if (id) {
      // Update existing client
      await p.query(
        `UPDATE crm_clients 
         SET company_name = ?, contact_name = ?, email = ?, phone = ?, address = ?, country = ?, website = ?, status = ?, account_manager = ?, notes = ?
         WHERE id = ?`,
        [
          company_name.trim(),
          contact_name.trim(),
          email.trim().toLowerCase(),
          phone?.trim() || null,
          address?.trim() || null,
          country?.trim(),
          website?.trim() || null,
          status,
          account_manager?.trim() || null,
          notes?.trim() || null,
          id,
        ]
      );

      await p.query(
        "INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'CLIENT_UPDATED', 'Client', ?, ?)",
        [session.user.username, String(id), `Updated client records for ${company_name}`]
      );

      return NextResponse.json({ success: true, message: "Client profile updated successfully." });
    } else {
      // Create new client
      const [result] = await p.query<ResultSetHeader>(
        `INSERT INTO crm_clients 
         (company_name, contact_name, email, phone, address, country, website, status, account_manager, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          company_name.trim(),
          contact_name.trim(),
          email.trim().toLowerCase(),
          phone?.trim() || null,
          address?.trim() || null,
          country?.trim(),
          website?.trim() || null,
          status,
          account_manager?.trim() || null,
          notes?.trim() || null,
        ]
      );

      await p.query(
        "INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'CLIENT_CREATED', 'Client', ?, ?)",
        [session.user.username, String(result.insertId), `Registered new client entity: ${company_name}`]
      );

      return NextResponse.json({
        success: true,
        message: "New client registered successfully.",
        clientId: result.insertId,
      });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const force = searchParams.get("force") === "true";

    if (!id) {
      return NextResponse.json({ success: false, message: "Client ID required" }, { status: 400 });
    }

    const p = getDbPool();

    // Safety check: verify active projects or unpaid invoices
    const [clientRows] = await p.query<RowDataPacket[]>("SELECT company_name FROM crm_clients WHERE id = ?", [id]);
    if (!clientRows || clientRows.length === 0) {
      return NextResponse.json({ success: false, message: "Client not found." }, { status: 404 });
    }
    const company = clientRows[0].company_name;

    const [invoices] = await p.query<RowDataPacket[]>(
      "SELECT id, invoice_number, balance_due FROM finance_invoices WHERE (client_id = ? OR client_name = ?) AND balance_due > 0",
      [id, company]
    );

    if (invoices.length > 0 && !force) {
      return NextResponse.json(
        {
          success: false,
          hasOutstanding: true,
          message: `Cannot delete client '${company}'. They have ${invoices.length} unpaid invoices with outstanding balance. Please settle or archive instead.`,
        },
        { status: 409 }
      );
    }

    await p.query("DELETE FROM crm_clients WHERE id = ?", [id]);

    await p.query(
      "INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'CLIENT_DELETED', 'Client', ?, ?)",
      [session.user.username, String(id), `Deleted client record: ${company}`]
    );

    return NextResponse.json({ success: true, message: `Client '${company}' safely deleted.` });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
