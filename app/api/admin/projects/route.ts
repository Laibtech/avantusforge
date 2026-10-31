import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getCurrentAdminSession } from "@/lib/auth";
import { getDbPool } from "@/lib/db";
import { logSecurityEvent } from "@/lib/security";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

const LOCAL_PROJECTS_FILE = path.join(process.cwd(), "data", "business-projects.json");

interface BusinessProject {
  id: number;
  title: string;
  client_name: string;
  budget: string;
  status: string;
  health: string;
  milestones_json: string;
  team_assigned: string;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_PROJECTS: BusinessProject[] = [
  {
    id: 1,
    title: "HRMS & Custom Business Management Suite",
    client_name: "Global Workforce Operations",
    budget: "$45,000",
    status: "In Progress",
    health: "On Track",
    milestones_json: JSON.stringify([
      "Phase 1: Architecture & RBAC - Completed",
      "Phase 2: Payroll Engine - Active",
      "Phase 3: Mobile Companion - Scheduled",
    ]),
    team_assigned: "Bilal (Technical Director)",
  },
  {
    id: 2,
    title: "Caremon D2C Wellness Flagship",
    client_name: "Caremon Group UK",
    budget: "$28,000",
    status: "Completed",
    health: "Delivered",
    milestones_json: JSON.stringify([
      "Theme 2.0 Engineering",
      "Conversion Architecture",
      "PDP Sub-second Loading",
    ]),
    team_assigned: "Maira (Design) & Muzamil (Operations Director)",
  },
  {
    id: 3,
    title: "Oasis Global Consulting Digital Presence",
    client_name: "Oasis Global Consulting (Pvt.) Ltd.",
    budget: "$22,000",
    status: "Completed",
    health: "Delivered",
    milestones_json: JSON.stringify([
      "Corporate Architecture",
      "Regulatory Trust Signals",
      "Encrypted Client Intake",
    ]),
    team_assigned: "Bilal & CEO Office",
  },
];

export async function GET() {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const p = getDbPool();
    const [rows] = await p.query<RowDataPacket[]>(
      "SELECT * FROM business_projects ORDER BY id DESC"
    );
    if (rows && rows.length > 0) {
      return NextResponse.json({ success: true, projects: rows });
    }
  } catch (err: any) {
    console.warn("[AvantusForge DB] MySQL business_projects fallback to JSON:", err.message);
  }

  // Fallback to local JSON
  if (fs.existsSync(LOCAL_PROJECTS_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(LOCAL_PROJECTS_FILE, "utf8"));
      return NextResponse.json({ success: true, projects: data });
    } catch {}
  }

  // Default initial projects
  return NextResponse.json({ success: true, projects: DEFAULT_PROJECTS });
}

export async function POST(req: Request) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, title, client_name, budget, status, health, milestones, team_assigned } = body;

    if (!title || !client_name) {
      return NextResponse.json(
        { success: false, message: "Project title and client name are required." },
        { status: 400 }
      );
    }

    const milestonesJson = typeof milestones === "string" ? milestones : JSON.stringify(milestones || []);

    if (id) {
      // Update existing project
      try {
        const p = getDbPool();
        await p.query(
          `UPDATE business_projects 
           SET title = ?, client_name = ?, budget = ?, status = ?, health = ?, milestones_json = ?, team_assigned = ?
           WHERE id = ?`,
          [title, client_name, budget || "", status || "In Progress", health || "On Track", milestonesJson, team_assigned || "", id]
        );
      } catch (err: any) {
        console.warn("[AvantusForge DB] MySQL update project failed, saving JSON fallback:", err.message);
      }
    } else {
      // Create new project
      try {
        const p = getDbPool();
        await p.query(
          `INSERT INTO business_projects (title, client_name, budget, status, health, milestones_json, team_assigned)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [title, client_name, budget || "", status || "In Progress", health || "On Track", milestonesJson, team_assigned || ""]
        );
      } catch (err: any) {
        console.warn("[AvantusForge DB] MySQL insert project failed, saving JSON fallback:", err.message);
      }
    }

    await logSecurityEvent({
      event_type: "PROJECT_RECORD_UPDATED",
      severity: "INFO",
      actor: session.user.username,
      source_ip: "127.0.0.1",
      detection_reason: `Administrator updated project entry: '${title}' (${client_name}).`,
      action_taken: "Database state synchronized.",
    });

    return NextResponse.json({ success: true, message: "Project saved successfully." });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
