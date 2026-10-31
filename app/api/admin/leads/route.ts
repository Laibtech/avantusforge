import { NextResponse } from "next/server";
import { getCurrentAdminSession } from "@/lib/auth";
import { getAllLeads, updateLeadStatus, getDbPool } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

export async function GET(request: Request) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const sourceFilter = searchParams.get("source");
    const searchQuery = searchParams.get("q")?.toLowerCase();

    let leads = await getAllLeads();

    if (statusFilter && statusFilter !== "All") {
      leads = leads.filter((l) => l.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (sourceFilter && sourceFilter !== "All") {
      leads = leads.filter((l) => l.lead_source?.toLowerCase().includes(sourceFilter.toLowerCase()));
    }

    if (searchQuery) {
      leads = leads.filter(
        (l) =>
          l.name.toLowerCase().includes(searchQuery) ||
          l.email.toLowerCase().includes(searchQuery) ||
          (l.company && l.company.toLowerCase().includes(searchQuery)) ||
          (l.service && l.service.toLowerCase().includes(searchQuery))
      );
    }

    // Counts by status
    const all = await getAllLeads();
    const stats = {
      total: all.length,
      new: all.filter((l) => l.status === "New").length,
      inProgress: all.filter((l) => l.status === "In Progress" || l.status === "Qualified" || l.status === "Proposal Sent").length,
      contacted: all.filter((l) => l.status === "Contacted").length,
      converted: all.filter((l) => l.status === "Converted" || l.status === "Won").length,
      closed: all.filter((l) => l.status === "Closed" || l.status === "Lost").length,
    };

    // Also fetch newsletter subscribers
    let subscribers: any[] = [];
    try {
      const p = getDbPool();
      const [subRows] = await p.query<RowDataPacket[]>("SELECT * FROM newsletter_subscribers ORDER BY id DESC LIMIT 50");
      subscribers = subRows;
    } catch {}

    return NextResponse.json({
      success: true,
      data: leads,
      subscribers,
      stats,
    });
  } catch (error) {
    console.error("[Admin Leads GET Error]", error);
    return NextResponse.json({ success: false, message: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, priority, assigned_to, internal_notes, follow_up_date } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "Missing lead id" }, { status: 400 });
    }

    const updated = await updateLeadStatus(Number(id), {
      status,
      priority,
      assigned_to,
      internal_notes,
      follow_up_date,
    });

    if (!updated) {
      return NextResponse.json({ success: false, message: "Lead not found" }, { status: 404 });
    }

    try {
      const p = getDbPool();
      await p.query(
        "INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'LEAD_UPDATED', 'Lead', ?, ?)",
        [session.user.username, String(id), `Updated lead #${id} status: ${status || 'N/A'}, assigned to: ${assigned_to || 'N/A'}`]
      );
    } catch {}

    return NextResponse.json({ success: true, message: "Lead updated successfully" });
  } catch (error) {
    console.error("[Admin Leads PATCH Error]", error);
    return NextResponse.json({ success: false, message: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "Missing id" }, { status: 400 });

    const p = getDbPool();
    await p.query("DELETE FROM contact_inquiries WHERE id = ?", [id]);

    await p.query(
      "INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'LEAD_DELETED', 'Lead', ?, ?)",
      [session.user.username, id, `Deleted inquiry #${id}`]
    );

    return NextResponse.json({ success: true, message: "Lead inquiry deleted." });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
