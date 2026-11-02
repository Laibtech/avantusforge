"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Briefcase,
  Building,
  DollarSign,
  FileText,
  Search,
  Filter,
  Printer,
  Shield,
  Edit2,
  X,
  Save,
  AlertCircle,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminAlert,
} from "@/components/admin/ui";

interface Employee {
  id: number;
  employee_code: string;
  full_name: string;
  email: string;
  phone?: string;
  department: string;
  designation: string;
  date_of_joining: string;
  employment_type: string;
  status: "Active" | "On Leave" | "Resigned";
  base_salary: number;
  currency: string;
  emergency_contact?: string;
}

interface AttendanceRow {
  id: number;
  employee_id: number;
  full_name: string;
  employee_code: string;
  department: string;
  date: string;
  check_in?: string;
  check_out?: string;
  status: "Present" | "Late" | "Half-day" | "Absent" | "On Leave";
  notes?: string;
}

interface LeaveRequest {
  id: number;
  employee_id: number;
  full_name: string;
  employee_code: string;
  department: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  approved_by?: string;
  created_at: string;
}

interface PayrollRun {
  id: number;
  month_year: string;
  period_start: string;
  period_end: string;
  total_gross: number;
  total_deductions: number;
  total_net: number;
  currency: string;
  status: string;
  approved_by: string;
  notes?: string;
}

interface Payslip {
  id: number;
  payroll_run_id: number;
  employee_id: number;
  full_name: string;
  employee_code: string;
  designation: string;
  department: string;
  email: string;
  base_salary: number;
  gross_amount: number;
  net_amount: number;
  payment_method: string;
  status: string;
}

const DEPARTMENTS = [
  "Executive Leadership",
  "Engineering",
  "Operations",
  "Design & Creative",
  "Growth & Marketing",
  "Finance & Legal",
];

const LEAVE_TYPES = [
  "Annual Paid Leave",
  "Medical / Sick Leave",
  "Casual Leave",
  "Unpaid Leave",
];

export default function AdminHRMSPage() {
  const [activeTab, setActiveTab] = useState<"directory" | "attendance" | "leaves" | "payroll">("directory");
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [summary, setSummary] = useState<any>({ totalStaff: 0, activeStaff: 0, pendingLeaves: 0, isPayrollAuthorized: false });

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Employee Modal State
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Partial<Employee> | null>(null);

  // Leave Submit Modal State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    employee_id: "",
    leave_type: "Annual Paid Leave",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split("T")[0],
    total_days: 2,
    reason: "",
  });

  // Payroll Run Modal State
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [payrollForm, setPayrollForm] = useState({
    month_year: "October 2025",
    period_start: "2025-10-01",
    period_end: "2025-10-31",
    currency: "PKR",
    notes: "Official monthly compensation cycle for staff.",
  });

  // Payslip Slip Preview
  const [viewingSlip, setViewingSlip] = useState<{ slip: Payslip; run?: PayrollRun } | null>(null);

  const fetchHRMSData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/hrms?date=${selectedDate}`);
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees || []);
        setAttendance(data.attendance || []);
        setLeaves(data.leaves || []);
        setPayrollRuns(data.payrollRuns || []);
        setPayslips(data.payslips || []);
        setSummary(data.summary || {});
      } else {
        setFeedback({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: "Error loading HRMS data: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHRMSData();
  }, [selectedDate]);

  // Handle Save Employee
  const handleOpenCreateEmp = () => {
    const nextCode = `AF-${String(employees.length + 1).padStart(3, "0")}`;
    setEditingEmp({
      employee_code: nextCode,
      full_name: "",
      email: "",
      phone: "",
      department: "Engineering",
      designation: "Software Engineer",
      date_of_joining: new Date().toISOString().split("T")[0],
      employment_type: "Full-time",
      status: "Active",
      base_salary: 150000,
      currency: "PKR",
    });
    setIsEmpModalOpen(true);
  };

  const handleOpenEditEmp = (emp: Employee) => {
    setEditingEmp({ ...emp });
    setIsEmpModalOpen(true);
  };

  const handleSaveEmp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/hrms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_employee", ...editingEmp }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", text: data.message });
        setIsEmpModalOpen(false);
        fetchHRMSData();
      } else {
        setFeedback({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: "Save failed: " + err.message });
    }
  };

  // Quick Mark Attendance
  const handleMarkAttendance = async (empId: number, status: string) => {
    try {
      const res = await fetch("/api/admin/hrms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "log_attendance",
          employee_id: empId,
          date: selectedDate,
          status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchHRMSData();
      }
    } catch {
      // ignore
    }
  };

  // Handle Leave Update
  const handleUpdateLeaveStatus = async (id: number, status: "Approved" | "Rejected") => {
    try {
      const res = await fetch("/api/admin/hrms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_leave_status", id, status }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", text: data.message });
        fetchHRMSData();
      } else {
        setFeedback({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    }
  };

  // Submit Leave
  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/hrms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit_leave", ...leaveForm }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", text: data.message });
        setIsLeaveModalOpen(false);
        fetchHRMSData();
      } else {
        setFeedback({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    }
  };

  // Create Payroll Run
  const handleCreatePayrollRun = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/hrms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_payroll_run", ...payrollForm }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", text: data.message });
        setIsPayrollModalOpen(false);
        fetchHRMSData();
      } else {
        setFeedback({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    }
  };

  const filteredEmployees = employees.filter(
    (e) =>
      e.full_name.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase()) ||
      e.designation.toLowerCase().includes(search.toLowerCase()) ||
      e.employee_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-16">
      {/* Header */}
      <AdminPageHeader
        breadcrumbs={[{ label: "Overview", href: "/admin" }, { label: "HRMS & Payroll" }]}
        eyebrow="Human Resources & Talent Operations"
        title="HRMS, Attendance & Payroll Management"
        description="Employee profiles, daily attendance tracking, leave requests, and automated monthly payroll cycles."
        badge={`${summary.totalStaff} Personnel`}
        badgeColor="burgundy"
      >
        <div className="flex items-center gap-2.5">
          <AdminButton
            variant="outline"
            size="sm"
            onClick={() => setIsLeaveModalOpen(true)}
            icon={Calendar}
          >
            Request Leave
          </AdminButton>

          <AdminButton
            variant="primary"
            size="sm"
            onClick={handleOpenCreateEmp}
            icon={Plus}
          >
            Onboard Employee
          </AdminButton>
        </div>
      </AdminPageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 hover:border-[#74102E]/30 transition-all">
          <div className="flex items-center justify-between text-[#777078]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
              Total Workforce
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] flex items-center justify-center text-[#777078]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#24151B]">{summary.totalStaff}</div>
          <div className="text-xs text-[#777078]">Registered personnel</div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 hover:border-[#74102E]/30 transition-all">
          <div className="flex items-center justify-between text-[#777078]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
              Active Staff
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#159B70]">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#159B70]">{summary.activeStaff}</div>
          <div className="text-xs text-[#159B70] font-semibold">Currently on active duty</div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 hover:border-[#74102E]/30 transition-all">
          <div className="flex items-center justify-between text-[#777078]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
              Pending Leaves
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D69A32]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#D69A32]">{summary.pendingLeaves}</div>
          <div className="text-xs text-[#777078]">Awaiting management approval</div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 hover:border-[#74102E]/30 transition-all">
          <div className="flex items-center justify-between text-[#777078]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
              Payroll Authorization
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#159B70]">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#74102E]">
            {summary.isPayrollAuthorized ? "Access Granted" : "Restricted Role"}
          </div>
          <div className="text-xs text-[#777078]">Strict HR &amp; Finance protection</div>
        </div>
      </div>

      {feedback && (
        <AdminAlert
          variant={feedback.type}
          message={feedback.text}
          onDismiss={() => setFeedback(null)}
        />
      )}

      {/* Tabs */}
      <div className="border-b border-[#EADFE3] flex items-center gap-6">
        <button
          type="button"
          onClick={() => setActiveTab("directory")}
          className={`pb-2.5 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${activeTab === "directory"
            ? "border-[#74102E] text-[#74102E]"
            : "border-transparent text-[#777078] hover:text-[#24151B]"
            }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Staff Directory ({employees.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("attendance")}
          className={`pb-2.5 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${activeTab === "attendance"
            ? "border-[#74102E] text-[#74102E]"
            : "border-transparent text-[#777078] hover:text-[#24151B]"
            }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Daily Attendance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("leaves")}
          className={`pb-2.5 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${activeTab === "leaves"
            ? "border-[#74102E] text-[#74102E]"
            : "border-transparent text-[#777078] hover:text-[#24151B]"
            }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Leave Requests ({leaves.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("payroll")}
          className={`pb-2.5 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${activeTab === "payroll"
            ? "border-[#74102E] text-[#74102E]"
            : "border-transparent text-[#777078] hover:text-[#24151B]"
            }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Payroll Runs & Payslips</span>
        </button>
      </div>

      {/* TAB 1: DIRECTORY */}
      {activeTab === "directory" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-xl border border-[#EADFE3]">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#777078] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff by name, department, role, or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
              />
            </div>

            <button
              type="button"
              onClick={fetchHRMSData}
              className="px-3 py-2 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] hover:bg-white text-xs font-semibold text-[#4D4245] transition-colors cursor-pointer"
            >
              Refresh
            </button>
          </div>

          <div className="bg-white rounded-xl border border-[#EADFE3] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F7] border-b border-[#EADFE3] text-[#777078] font-mono uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-bold">Code</th>
                    <th className="py-3 px-4 font-bold">Employee Name</th>
                    <th className="py-3 px-4 font-bold">Department & Designation</th>
                    <th className="py-3 px-4 font-bold">Joined</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    {summary.isPayrollAuthorized && <th className="py-3 px-4 font-bold">Base Salary</th>}
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFE3]">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-[#FAF7F7]/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#74102E]">{emp.employee_code}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#24151B]">{emp.full_name}</div>
                        <div className="text-[11px] text-[#777078]">{emp.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#24151B]">{emp.designation}</div>
                        <div className="text-[11px] text-[#74102E]">{emp.department}</div>
                      </td>
                      <td className="py-3.5 px-4 text-[#4D4245]">
                        {new Date(emp.date_of_joining).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${emp.status === "Active"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                            }`}
                        >
                          {emp.status}
                        </span>
                      </td>
                      {summary.isPayrollAuthorized && (
                        <td className="py-3.5 px-4 font-mono font-bold text-[#24151B]">
                          {emp.currency} {Number(emp.base_salary).toLocaleString()}
                        </td>
                      )}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEditEmp(emp)}
                          className="p-1.5 rounded-md hover:bg-[#FAF7F7] text-[#777078] hover:text-[#24151B] transition-colors cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE */}
      {activeTab === "attendance" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#EADFE3]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#24151B]">Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs text-[#24151B]"
              />
            </div>
            <div className="text-xs text-[#777078]">
              {attendance.length} record{attendance.length === 1 ? "" : "s"} logged for this date.
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#EADFE3] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F7] border-b border-[#EADFE3] text-[#777078] font-mono uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-bold">Employee</th>
                    <th className="py-3 px-4 font-bold">Department</th>
                    <th className="py-3 px-4 font-bold">Check-In</th>
                    <th className="py-3 px-4 font-bold">Check-Out</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold text-right">Quick Mark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFE3]">
                  {employees.map((emp) => {
                    const record = attendance.find((a) => a.employee_id === emp.id);
                    const currentStatus = record?.status || "Unrecorded";

                    return (
                      <tr key={emp.id} className="hover:bg-[#FAF7F7]/60 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-[#24151B]">{emp.full_name}</span>{" "}
                          <span className="font-mono text-[10px] text-[#74102E]">({emp.employee_code})</span>
                        </td>
                        <td className="py-3 px-4 text-[#777078]">{emp.department}</td>
                        <td className="py-3 px-4 font-mono text-[#4D4245]">
                          {record?.check_in || "—"}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#4D4245]">
                          {record?.check_out || "—"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${currentStatus === "Present"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : currentStatus === "Late"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : currentStatus === "Absent"
                                  ? "bg-rose-50 text-rose-800 border-rose-200"
                                  : "bg-gray-100 text-gray-600 border-gray-200"
                              }`}
                          >
                            {currentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleMarkAttendance(emp.id, "Present")}
                              className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 cursor-pointer"
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMarkAttendance(emp.id, "Late")}
                              className="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200 cursor-pointer"
                            >
                              Late
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMarkAttendance(emp.id, "Absent")}
                              className="px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-200 cursor-pointer"
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LEAVES */}
      {activeTab === "leaves" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#EADFE3]">
            <div className="text-xs font-bold text-[#24151B]">Employee Leave Requests & Clearances</div>
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#74102E] text-white hover:bg-[#5C0C23] text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit Leave Request</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-[#EADFE3] overflow-hidden shadow-2xs">
            {leaves.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#777078]">No leave applications pending.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F7] border-b border-[#EADFE3] text-[#777078] font-mono uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4 font-bold">Employee</th>
                      <th className="py-3 px-4 font-bold">Leave Type</th>
                      <th className="py-3 px-4 font-bold">Duration</th>
                      <th className="py-3 px-4 font-bold">Reason</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                      <th className="py-3 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EADFE3]">
                    {leaves.map((l) => (
                      <tr key={l.id} className="hover:bg-[#FAF7F7]/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#24151B]">{l.full_name}</div>
                          <div className="text-[10px] text-[#777078]">{l.department}</div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#74102E]">{l.leave_type}</td>
                        <td className="py-3.5 px-4 text-[#4D4245]">
                          <div>
                            {new Date(l.start_date).toLocaleDateString()} – {new Date(l.end_date).toLocaleDateString()}
                          </div>
                          <div className="text-[10px] text-[#777078]">({l.total_days} days)</div>
                        </td>
                        <td className="py-3.5 px-4 text-[#4D4245] max-w-xs truncate">{l.reason}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${l.status === "Approved"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : l.status === "Pending"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-rose-50 text-rose-800 border-rose-200"
                              }`}
                          >
                            {l.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {l.status === "Pending" ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateLeaveStatus(l.id, "Approved")}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateLeaveStatus(l.id, "Rejected")}
                                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-[#777078]">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PAYROLL */}
      {activeTab === "payroll" && (
        <div className="space-y-4">
          {!summary.isPayrollAuthorized ? (
            <div className="p-12 text-center bg-white rounded-xl border border-[#EADFE3] space-y-2">
              <Shield className="w-8 h-8 text-rose-600 mx-auto" />
              <div className="text-sm font-bold text-[#24151B]">Restricted Administrative Area</div>
              <p className="text-xs text-[#777078] max-w-md mx-auto">
                Payroll execution and individual compensation records require Super Administrator or HR Manager roles.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#EADFE3]">
                <div>
                  <div className="text-xs font-bold text-[#24151B]">Monthly Compensation Runs</div>
                  <div className="text-[10px] text-[#777078]">Batch salary calculations and approved payslips</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPayrollModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#74102E] text-white hover:bg-[#5C0C23] text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Execute Monthly Payroll</span>
                </button>
              </div>

              {/* Payroll Cycles Table */}
              <div className="bg-white rounded-xl border border-[#EADFE3] overflow-hidden shadow-2xs">
                {payrollRuns.length === 0 ? (
                  <div className="p-12 text-center text-xs text-[#777078]">No payroll cycles executed yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF7F7] border-b border-[#EADFE3] text-[#777078] font-mono uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="py-3 px-4 font-bold">Cycle / Period</th>
                          <th className="py-3 px-4 font-bold">Total Gross</th>
                          <th className="py-3 px-4 font-bold">Deductions</th>
                          <th className="py-3 px-4 font-bold">Net Payout</th>
                          <th className="py-3 px-4 font-bold">Status</th>
                          <th className="py-3 px-4 font-bold">Authorized By</th>
                          <th className="py-3 px-4 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EADFE3]">
                        {payrollRuns.map((run) => (
                          <tr key={run.id} className="hover:bg-[#FAF7F7]/60 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-[#24151B]">{run.month_year}</div>
                              <div className="text-[10px] text-[#777078]">
                                {run.period_start} to {run.period_end}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[#4D4245]">
                              {run.currency} {Number(run.total_gross).toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-rose-700">
                              -{run.currency} {Number(run.total_deductions).toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                              {run.currency} {Number(run.total_net).toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {run.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-[#777078]">{run.approved_by}</td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  const matchingSlip = payslips.find((s) => s.payroll_run_id === run.id);
                                  if (matchingSlip) {
                                    setViewingSlip({ slip: matchingSlip, run });
                                  }
                                }}
                                className="px-2.5 py-1 rounded bg-[#FAF7F7] hover:bg-[#F7EEF1] text-[#74102E] font-semibold text-[11px] border border-[#EADFE3] cursor-pointer"
                              >
                                View Payslips
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Generated Payslips */}
              {payslips.length > 0 && (
                <div className="space-y-2 pt-4">
                  <div className="text-xs font-bold text-[#24151B]">
                    Individual Employee Payslips ({payslips.length})
                  </div>
                  <div className="bg-white rounded-xl border border-[#EADFE3] overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF7F7] border-b border-[#EADFE3] text-[#777078] font-mono uppercase text-[9.5px]">
                        <tr>
                          <th className="py-2.5 px-4 font-bold">Staff Member</th>
                          <th className="py-2.5 px-4 font-bold">Department & Role</th>
                          <th className="py-2.5 px-4 font-bold">Net Salary</th>
                          <th className="py-2.5 px-4 font-bold">Method</th>
                          <th className="py-2.5 px-4 font-bold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EADFE3]">
                        {payslips.map((slip) => (
                          <tr key={slip.id} className="hover:bg-[#FAF7F7]/60 transition-colors">
                            <td className="py-2.5 px-4 font-bold text-[#24151B]">{slip.full_name}</td>
                            <td className="py-2.5 px-4 text-[#777078]">
                              {slip.designation} • {slip.department}
                            </td>
                            <td className="py-2.5 px-4 font-mono font-bold text-emerald-700">
                              PKR {Number(slip.net_amount).toLocaleString()}
                            </td>
                            <td className="py-2.5 px-4 text-[#777078]">{slip.payment_method}</td>
                            <td className="py-2.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => setViewingSlip({ slip })}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#74102E] hover:underline cursor-pointer"
                              >
                                <Printer className="w-3 h-3" />
                                <span>Payslip Slip</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ONBOARD EMPLOYEE MODAL */}
      {isEmpModalOpen && editingEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-[#EADFE3] shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-[#EADFE3] flex items-center justify-between bg-[#FAF7F7]">
              <h3 className="text-sm font-bold text-[#24151B]">
                {editingEmp.id ? "Edit Employee Record" : "Onboard New Employee"}
              </h3>
              <button
                type="button"
                onClick={() => setIsEmpModalOpen(false)}
                className="p-1 rounded-md text-[#777078] hover:text-[#24151B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEmp} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Employee Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingEmp.employee_code}
                    onChange={(e) => setEditingEmp({ ...editingEmp, employee_code: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] font-mono text-xs text-[#24151B]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingEmp.full_name}
                    onChange={(e) => setEditingEmp({ ...editingEmp, full_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs text-[#24151B]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={editingEmp.email}
                    onChange={(e) => setEditingEmp({ ...editingEmp, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs text-[#24151B]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Direct Phone
                  </label>
                  <input
                    type="text"
                    value={editingEmp.phone || ""}
                    onChange={(e) => setEditingEmp({ ...editingEmp, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs text-[#24151B]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Department *
                  </label>
                  <select
                    value={editingEmp.department}
                    onChange={(e) => setEditingEmp({ ...editingEmp, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs text-[#24151B]"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Designation / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingEmp.designation}
                    onChange={(e) => setEditingEmp({ ...editingEmp, designation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs text-[#24151B]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Date of Joining *
                  </label>
                  <input
                    type="date"
                    required
                    value={editingEmp.date_of_joining}
                    onChange={(e) => setEditingEmp({ ...editingEmp, date_of_joining: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs text-[#24151B]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Employment Type
                  </label>
                  <select
                    value={editingEmp.employment_type}
                    onChange={(e) => setEditingEmp({ ...editingEmp, employment_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs text-[#24151B]"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Status
                  </label>
                  <select
                    value={editingEmp.status}
                    onChange={(e) => setEditingEmp({ ...editingEmp, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs text-[#24151B]"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Resigned">Resigned</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Monthly Base Salary (PKR)
                  </label>
                  <input
                    type="number"
                    value={editingEmp.base_salary}
                    onChange={(e) => setEditingEmp({ ...editingEmp, base_salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] font-mono text-xs text-[#24151B]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#EADFE3] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEmpModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#EADFE3] text-xs font-semibold text-[#4D4245] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#74102E] text-white hover:bg-[#5C0C23] text-xs font-semibold cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REQUEST LEAVE MODAL */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#EADFE3] shadow-xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFE3]">
              <h3 className="text-sm font-bold text-[#24151B]">Submit Leave Application</h3>
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(false)}
                className="p-1 rounded-md text-[#777078] hover:text-[#24151B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitLeave} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                  Employee *
                </label>
                <select
                  required
                  value={leaveForm.employee_id}
                  onChange={(e) => setLeaveForm({ ...leaveForm, employee_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs text-[#24151B]"
                >
                  <option value="">Select Employee</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.full_name} ({e.employee_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                  Leave Type *
                </label>
                <select
                  value={leaveForm.leave_type}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs text-[#24151B]"
                >
                  {LEAVE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveForm.start_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs text-[#24151B]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveForm.end_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs text-[#24151B]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                  Reason / Purpose *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="State the reason for leave request..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs text-[#24151B]"
                />
              </div>

              <div className="pt-3 border-t border-[#EADFE3] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#EADFE3] text-xs font-semibold text-[#4D4245] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-[#74102E] text-white hover:bg-[#5C0C23] text-xs font-semibold cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXECUTE PAYROLL RUN MODAL */}
      {isPayrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#EADFE3] shadow-xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFE3]">
              <h3 className="text-sm font-bold text-[#24151B]">Generate Monthly Payroll Run</h3>
              <button
                type="button"
                onClick={() => setIsPayrollModalOpen(false)}
                className="p-1 rounded-md text-[#777078] hover:text-[#24151B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePayrollRun} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                  Cycle Identifier (Month / Year) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. October 2025"
                  value={payrollForm.month_year}
                  onChange={(e) => setPayrollForm({ ...payrollForm, month_year: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs text-[#24151B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Period Start *
                  </label>
                  <input
                    type="date"
                    required
                    value={payrollForm.period_start}
                    onChange={(e) => setPayrollForm({ ...payrollForm, period_start: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs text-[#24151B]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Period End *
                  </label>
                  <input
                    type="date"
                    required
                    value={payrollForm.period_end}
                    onChange={(e) => setPayrollForm({ ...payrollForm, period_end: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs text-[#24151B]"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] space-y-1">
                <div className="text-[10px] font-mono uppercase text-[#777078] font-bold">Automatic Calculation</div>
                <div className="text-xs text-[#4D4245]">
                  This will generate verified payslips for all <span className="font-bold">{summary.activeStaff} active staff members</span> using their configured base salaries.
                </div>
              </div>

              <div className="pt-3 border-t border-[#EADFE3] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayrollModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#EADFE3] text-xs font-semibold text-[#4D4245] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer"
                >
                  Approve & Generate Run
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE PAYSLIP MODAL */}
      {viewingSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-[#EADFE3] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-[#EADFE3] flex items-center justify-between bg-[#FAF7F7] print:hidden">
              <span className="text-xs font-bold text-[#24151B]">Employee Payslip Preview</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#74102E] text-white text-xs font-semibold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Payslip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingSlip(null)}
                  className="p-1 rounded-md text-[#777078] hover:text-[#24151B] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6 text-xs text-[#24151B] bg-white">
              {/* Header */}
              <div className="flex items-start justify-between pb-6 border-b border-[#EADFE3]">
                <div>
                  <div className="text-xl font-bold tracking-tight text-[#74102E]">AVANTUSFORGE</div>
                  <div className="text-[10px] font-mono text-[#777078] uppercase tracking-wider">
                    Official Salary Disbursal Voucher
                  </div>
                  <div className="text-[11px] text-[#4D4245] mt-1">HRMS & Compensation Management</div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-[#24151B]">CONFIDENTIAL PAYSLIP</div>
                  <div className="text-xs font-mono text-[#74102E] font-bold">
                    ID: {viewingSlip.slip.employee_code}
                  </div>
                </div>
              </div>

              {/* Employee Details Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#FAF7F7] border border-[#EADFE3]">
                <div>
                  <div className="text-[10px] font-mono uppercase text-[#777078] font-bold">Staff Member</div>
                  <div className="font-bold text-[#24151B] text-sm">{viewingSlip.slip.full_name}</div>
                  <div className="text-[11px] text-[#777078]">{viewingSlip.slip.email}</div>
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase text-[#777078] font-bold">Designation & Team</div>
                  <div className="font-semibold text-[#24151B]">{viewingSlip.slip.designation}</div>
                  <div className="text-[11px] text-[#74102E]">{viewingSlip.slip.department}</div>
                </div>
              </div>

              {/* Breakdown */}
              <div className="border border-[#EADFE3] rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F7] border-b border-[#EADFE3] text-[#777078] font-mono uppercase text-[9.5px]">
                    <tr>
                      <th className="py-2.5 px-3 font-bold">Earnings & Allowances</th>
                      <th className="py-2.5 px-3 font-bold text-right">Amount (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EADFE3]">
                    <tr>
                      <td className="py-2 px-3 text-[#24151B]">Base Basic Salary</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-[#24151B]">
                        {Number(viewingSlip.slip.base_salary).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-[#24151B]">Standard Professional Allowance</td>
                      <td className="py-2 px-3 text-right font-mono text-[#777078]">0.00</td>
                    </tr>
                    <tr className="bg-[#FAF7F7]/60 font-bold">
                      <td className="py-2.5 px-3 text-[#24151B]">Total Gross Earnings</td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#24151B]">
                        {Number(viewingSlip.slip.gross_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Net Payout */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase font-bold text-emerald-900">
                    Net Disbursed Compensation
                  </div>
                  <div className="text-[11px] text-emerald-800">Direct Bank Deposit / Wire Clear</div>
                </div>
                <div className="text-xl font-bold font-mono text-emerald-900">
                  PKR {Number(viewingSlip.slip.net_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="pt-6 border-t border-[#EADFE3] flex items-center justify-between text-[10px] text-[#777078]">
                <div>Authorized by Executive HR Directorate</div>
                <div className="font-mono">AvantusForge Enterprise Security Seal</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
