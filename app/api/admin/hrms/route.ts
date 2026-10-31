import { NextResponse } from "next/server";
import { getCurrentAdminSession } from "@/lib/auth";
import { getDbPool } from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

// Strict Role Checks
function canViewHRMS(role: string): boolean {
  return ["super_admin", "admin", "hr_manager", "ops_manager"].includes(role);
}

function canManagePayroll(role: string): boolean {
  return ["super_admin", "admin", "hr_manager", "finance_manager"].includes(role);
}

export async function GET(req: Request) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!canViewHRMS(session.user.role)) {
    return NextResponse.json(
      { success: false, message: "Access Denied: Requires HR Manager or Administrator privileges." },
      { status: 403 }
    );
  }

  try {
    const p = getDbPool();
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date") || new Date().toISOString().split("T")[0];

    // 1. Fetch Employees
    const [employees] = await p.query<RowDataPacket[]>(
      `SELECT * FROM hrms_employees ORDER BY id ASC`
    );

    // Mask base salary if role is not authorized for payroll
    const isPayrollAuthorized = canManagePayroll(session.user.role);
    const sanitizedEmployees = employees.map((emp) => {
      if (!isPayrollAuthorized) {
        return { ...emp, base_salary: 0, bank_details_json: null };
      }
      return emp;
    });

    // 2. Fetch Attendance for specified date
    const [attendance] = await p.query<RowDataPacket[]>(
      `SELECT a.*, e.full_name, e.employee_code, e.department 
       FROM hrms_attendance a
       JOIN hrms_employees e ON a.employee_id = e.id
       WHERE a.date = ?
       ORDER BY e.id ASC`,
      [dateParam]
    );

    // 3. Fetch Leave Requests
    const [leaves] = await p.query<RowDataPacket[]>(
      `SELECT l.*, e.full_name, e.employee_code, e.department 
       FROM hrms_leave_requests l
       JOIN hrms_employees e ON l.employee_id = e.id
       ORDER BY l.created_at DESC`
    );

    // 4. Fetch Payroll Runs
    let payrollRuns: RowDataPacket[] = [];
    let payslips: RowDataPacket[] = [];
    if (isPayrollAuthorized) {
      const [runs] = await p.query<RowDataPacket[]>(
        `SELECT * FROM hrms_payroll_runs ORDER BY period_end DESC`
      );
      payrollRuns = runs;

      const [slips] = await p.query<RowDataPacket[]>(
        `SELECT s.*, e.full_name, e.employee_code, e.designation, e.department, e.email 
         FROM hrms_payslips s
         JOIN hrms_employees e ON s.employee_id = e.id
         ORDER BY s.id DESC`
      );
      payslips = slips;
    }

    // Summary counts
    const activeStaff = employees.filter((e) => e.status === "Active").length;
    const pendingLeaves = leaves.filter((l) => l.status === "Pending").length;

    return NextResponse.json({
      success: true,
      employees: sanitizedEmployees,
      attendance,
      leaves,
      payrollRuns,
      payslips,
      summary: {
        totalStaff: employees.length,
        activeStaff,
        pendingLeaves,
        isPayrollAuthorized,
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

  if (!canViewHRMS(session.user.role)) {
    return NextResponse.json({ success: false, message: "Access Denied" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action } = body;
    const p = getDbPool();

    // ACTION: SAVE / UPDATE EMPLOYEE
    if (action === "save_employee") {
      const {
        id,
        employee_code,
        full_name,
        email,
        phone = "",
        department,
        designation,
        date_of_joining,
        employment_type = "Full-time",
        status = "Active",
        base_salary = 0,
        currency = "PKR",
        emergency_contact = "",
      } = body;

      if (!employee_code || !full_name || !email || !department || !designation || !date_of_joining) {
        return NextResponse.json(
          { success: false, message: "Code, full name, email, department, designation, and joining date are required." },
          { status: 400 }
        );
      }

      const salaryNum = Number(base_salary) || 0;

      if (id) {
        await p.query(
          `UPDATE hrms_employees 
           SET employee_code = ?, full_name = ?, email = ?, phone = ?, department = ?, designation = ?, 
               date_of_joining = ?, employment_type = ?, status = ?, base_salary = ?, currency = ?, emergency_contact = ?
           WHERE id = ?`,
          [
            employee_code.trim(),
            full_name.trim(),
            email.trim().toLowerCase(),
            phone.trim() || null,
            department.trim(),
            designation.trim(),
            date_of_joining,
            employment_type,
            status,
            salaryNum.toFixed(2),
            currency,
            emergency_contact.trim() || null,
            id,
          ]
        );

        await p.query(
          "INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'EMPLOYEE_UPDATED', 'HRMS', ?, ?)",
          [session.user.username, String(id), `Updated profile for ${full_name} (${employee_code})`]
        );

        return NextResponse.json({ success: true, message: `Employee record for ${full_name} updated successfully.` });
      } else {
        const [res] = await p.query<ResultSetHeader>(
          `INSERT INTO hrms_employees 
           (employee_code, full_name, email, phone, department, designation, date_of_joining, employment_type, status, base_salary, currency, emergency_contact)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            employee_code.trim(),
            full_name.trim(),
            email.trim().toLowerCase(),
            phone.trim() || null,
            department.trim(),
            designation.trim(),
            date_of_joining,
            employment_type,
            status,
            salaryNum.toFixed(2),
            currency,
            emergency_contact.trim() || null,
          ]
        );

        await p.query(
          "INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'EMPLOYEE_CREATED', 'HRMS', ?, ?)",
          [session.user.username, String(res.insertId), `Onboarded employee ${full_name} (${employee_code})`]
        );

        return NextResponse.json({ success: true, message: `New employee ${full_name} registered successfully.` });
      }
    }

    // ACTION: LOG ATTENDANCE
    else if (action === "log_attendance") {
      const { employee_id, date, check_in = "09:00", check_out = "18:00", status = "Present", notes = "" } = body;

      if (!employee_id || !date) {
        return NextResponse.json({ success: false, message: "Employee and date are required." }, { status: 400 });
      }

      await p.query(
        `INSERT INTO hrms_attendance (employee_id, date, check_in, check_out, status, notes)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE check_in = VALUES(check_in), check_out = VALUES(check_out), status = VALUES(status), notes = VALUES(notes)`,
        [employee_id, date, check_in || null, check_out || null, status, notes || null]
      );

      return NextResponse.json({ success: true, message: "Attendance status updated." });
    }

    // ACTION: SUBMIT LEAVE REQUEST
    else if (action === "submit_leave") {
      const { employee_id, leave_type, start_date, end_date, total_days = 1, reason } = body;

      if (!employee_id || !leave_type || !start_date || !end_date || !reason) {
        return NextResponse.json({ success: false, message: "All leave request details are required." }, { status: 400 });
      }

      await p.query(
        `INSERT INTO hrms_leave_requests (employee_id, leave_type, start_date, end_date, total_days, reason, status)
         VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
        [employee_id, leave_type, start_date, end_date, total_days, reason.trim()]
      );

      return NextResponse.json({ success: true, message: "Leave request submitted for review." });
    }

    // ACTION: APPROVE / REJECT LEAVE
    else if (action === "update_leave_status") {
      const { id, status } = body;
      if (!id || !["Approved", "Rejected", "Pending"].includes(status)) {
        return NextResponse.json({ success: false, message: "Invalid leave status update." }, { status: 400 });
      }

      await p.query(
        "UPDATE hrms_leave_requests SET status = ?, approved_by = ? WHERE id = ?",
        [status, session.user.username, id]
      );

      await p.query(
        "INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'LEAVE_STATUS_UPDATED', 'HRMS', ?, ?)",
        [session.user.username, String(id), `Set leave request ID ${id} to ${status}`]
      );

      return NextResponse.json({ success: true, message: `Leave request marked as ${status}.` });
    }

    // ACTION: GENERATE PAYROLL RUN
    else if (action === "create_payroll_run") {
      if (!canManagePayroll(session.user.role)) {
        return NextResponse.json({ success: false, message: "Permission denied for payroll generation." }, { status: 403 });
      }

      const { month_year, period_start, period_end, currency = "PKR", notes = "" } = body;

      if (!month_year || !period_start || !period_end) {
        return NextResponse.json({ success: false, message: "Month/Year and period dates are required." }, { status: 400 });
      }

      // Check if run already exists
      const [existingRun] = await p.query<RowDataPacket[]>(
        "SELECT id FROM hrms_payroll_runs WHERE month_year = ?",
        [month_year]
      );
      if (existingRun.length > 0) {
        return NextResponse.json(
          { success: false, message: `A payroll cycle for ${month_year} already exists.` },
          { status: 409 }
        );
      }

      // Fetch all active employees
      const [activeEmployees] = await p.query<RowDataPacket[]>(
        "SELECT id, full_name, base_salary, currency FROM hrms_employees WHERE status = 'Active'"
      );

      if (activeEmployees.length === 0) {
        return NextResponse.json({ success: false, message: "No active employees found to generate payroll." }, { status: 400 });
      }

      let totalGross = 0;
      let totalDeductions = 0;
      let totalNet = 0;

      for (const emp of activeEmployees) {
        const base = Number(emp.base_salary) || 0;
        const gross = base;
        const deductions = 0; // Configurable per employee
        const net = gross - deductions;

        totalGross += gross;
        totalDeductions += deductions;
        totalNet += net;
      }

      // Insert payroll run
      const [runRes] = await p.query<ResultSetHeader>(
        `INSERT INTO hrms_payroll_runs 
         (month_year, period_start, period_end, total_gross, total_deductions, total_net, currency, status, approved_by, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Approved', ?, ?)`,
        [
          month_year,
          period_start,
          period_end,
          totalGross.toFixed(2),
          totalDeductions.toFixed(2),
          totalNet.toFixed(2),
          currency,
          session.user.username,
          notes || `Monthly payroll cycle for ${month_year}`,
        ]
      );

      const runId = runRes.insertId;

      // Insert individual payslips
      for (const emp of activeEmployees) {
        const base = Number(emp.base_salary) || 0;
        await p.query(
          `INSERT INTO hrms_payslips 
           (payroll_run_id, employee_id, base_salary, gross_amount, net_amount, payment_method, status)
           VALUES (?, ?, ?, ?, ?, 'Direct Bank Deposit', 'Generated')`,
          [runId, emp.id, base.toFixed(2), base.toFixed(2), base.toFixed(2)]
        );
      }

      await p.query(
        "INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'PAYROLL_GENERATED', 'HRMS', ?, ?)",
        [session.user.username, String(runId), `Generated & approved payroll cycle for ${month_year} (${currency} ${totalNet.toFixed(2)})`]
      );

      return NextResponse.json({
        success: true,
        message: `Payroll run for ${month_year} generated with ${activeEmployees.length} payslips.`,
      });
    }

    return NextResponse.json({ success: false, message: "Unsupported HRMS action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
