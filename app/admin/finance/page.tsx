"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Plus,
  Receipt,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Printer,
  Trash2,
  Edit2,
  X,
  Save,
  ArrowUpRight,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminAlert,
} from "@/components/admin/ui";

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Invoice {
  id: number;
  invoice_number: string;
  client_id?: number;
  client_name: string;
  client_email: string;
  project_id?: number;
  issue_date: string;
  due_date: string;
  currency: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  balance_due: number;
  status: "Draft" | "Sent" | "Partially Paid" | "Paid" | "Overdue" | "Cancelled";
  notes?: string;
  line_items_json?: string;
  created_at?: string;
}

interface Expense {
  id: number;
  category: string;
  description: string;
  amount: number;
  currency: string;
  expense_date: string;
  vendor_name?: string;
  receipt_url?: string;
  payment_method: string;
  approved_by: string;
}

interface PaymentRecord {
  id: number;
  invoice_id: number;
  invoice_number: string;
  client_name: string;
  amount: number;
  currency: string;
  payment_date: string;
  payment_method: string;
  transaction_reference?: string;
  notes?: string;
}

const EXPENSE_CATEGORIES = [
  "Cloud Infrastructure & Hosting",
  "Software Licenses & SaaS",
  "Engineering Contractors & Freelancers",
  "Office & Telecoms",
  "Marketing & Public Relations",
  "Legal & Accounting",
  "Travel & Client Relations",
];

const PAYMENT_METHODS = [
  "Bank Wire Transfer (SWIFT / IBAN)",
  "Credit Card (Stripe)",
  "Corporate Debit Card",
  "PayPal Business",
  "Direct Deposit",
];

export default function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState<"invoices" | "expenses" | "payments">("invoices");
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [summary, setSummary] = useState<any>({
    totalInvoiced: "0.00",
    totalCollected: "0.00",
    totalOutstanding: "0.00",
    totalExpenses: "0.00",
    netOperatingBalance: "0.00",
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Invoice Modal State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "Enterprise Web Development Sprint", quantity: 1, unit_price: 2500, total: 2500 },
  ]);

  // Payment Recording Modal State
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_date: new Date().toISOString().split("T")[0],
    payment_method: "Bank Wire Transfer (SWIFT / IBAN)",
    transaction_reference: "",
    notes: "",
  });

  // Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: "Cloud Infrastructure & Hosting",
    description: "",
    amount: "",
    currency: "USD",
    expense_date: new Date().toISOString().split("T")[0],
    vendor_name: "",
    payment_method: "Corporate Debit Card",
    receipt_url: "",
  });

  // Invoice Print / View Slip Modal
  const [viewingSlipInvoice, setViewingSlipInvoice] = useState<Invoice | null>(null);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/finance");
      const data = await res.json();
      if (data.success) {
        setInvoices(data.invoices || []);
        setExpenses(data.expenses || []);
        setPayments(data.payments || []);
        setSummary(data.summary || {});
      } else {
        setFeedback({ type: "error", text: data.message || "Failed to load finance data." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: "Error loading finance records: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  // Invoice Handling
  const handleOpenCreateInvoice = () => {
    const nextNum = `INV-2025-${String(invoices.length + 101).padStart(3, "0")}`;
    const today = new Date().toISOString().split("T")[0];
    const due = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split("T")[0];

    setEditingInvoice({
      invoice_number: nextNum,
      client_name: "",
      client_email: "",
      issue_date: today,
      due_date: due,
      currency: "USD",
      tax_rate: 0,
      status: "Sent",
      notes: "Payment due within 14 business days. Bank wire instructions provided upon request.",
    });
    setLineItems([{ description: "Custom Software Architecture & Delivery", quantity: 1, unit_price: 3500, total: 3500 }]);
    setIsInvoiceModalOpen(true);
  };

  const handleOpenEditInvoice = (inv: Invoice) => {
    let parsed: LineItem[] = [];
    try {
      parsed = inv.line_items_json ? JSON.parse(inv.line_items_json) : [];
    } catch {
      parsed = [];
    }
    if (!parsed.length) {
      parsed = [{ description: "Professional Services", quantity: 1, unit_price: Number(inv.subtotal), total: Number(inv.subtotal) }];
    }
    setLineItems(parsed);
    setEditingInvoice({ ...inv });
    setIsInvoiceModalOpen(true);
  };

  const updateLineItem = (index: number, field: keyof LineItem, val: any) => {
    const next = [...lineItems];
    next[index] = { ...next[index], [field]: val };
    const q = Number(next[index].quantity) || 0;
    const p = Number(next[index].unit_price) || 0;
    next[index].total = Number((q * p).toFixed(2));
    setLineItems(next);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, unit_price: 0, total: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        action: editingInvoice.id ? "update_invoice" : "create_invoice",
        ...editingInvoice,
        line_items: lineItems,
      };
      const res = await fetch("/api/admin/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", text: data.message });
        setIsInvoiceModalOpen(false);
        fetchFinanceData();
      } else {
        setFeedback({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: "Error saving invoice: " + err.message });
    }
  };

  // Payment Handling
  const handleOpenRecordPayment = (inv: Invoice) => {
    setPaymentModalInvoice(inv);
    setPaymentForm({
      amount: String(inv.balance_due),
      payment_date: new Date().toISOString().split("T")[0],
      payment_method: "Bank Wire Transfer (SWIFT / IBAN)",
      transaction_reference: "",
      notes: `Settlement for ${inv.invoice_number}`,
    });
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;

    try {
      const res = await fetch("/api/admin/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record_payment",
          invoice_id: paymentModalInvoice.id,
          currency: paymentModalInvoice.currency,
          ...paymentForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", text: data.message });
        setPaymentModalInvoice(null);
        fetchFinanceData();
      } else {
        setFeedback({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: "Error recording payment: " + err.message });
    }
  };

  // Expense Handling
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_expense",
          ...expenseForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", text: data.message });
        setIsExpenseModalOpen(false);
        setExpenseForm({
          category: "Cloud Infrastructure & Hosting",
          description: "",
          amount: "",
          currency: "USD",
          expense_date: new Date().toISOString().split("T")[0],
          vendor_name: "",
          payment_method: "Corporate Debit Card",
          receipt_url: "",
        });
        fetchFinanceData();
      } else {
        setFeedback({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: "Error saving expense: " + err.message });
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (!confirm("Are you sure you want to delete this expense record?")) return;
    try {
      const res = await fetch("/api/admin/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_expense", id }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", text: data.message });
        fetchFinanceData();
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    }
  };

  const handleDeleteInvoice = async (id: number) => {
    if (!confirm("Are you sure you want to delete this invoice? Invoices with recorded payments cannot be deleted.")) return;
    try {
      const res = await fetch("/api/admin/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_invoice", id }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", text: data.message });
        fetchFinanceData();
      } else {
        setFeedback({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    }
  };

  // Filter Invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      inv.client_name.toLowerCase().includes(search.toLowerCase()) ||
      inv.client_email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-16">
      {/* Header */}
      <AdminPageHeader
        breadcrumbs={[{ label: "Overview", href: "/admin" }, { label: "Finance & Invoicing" }]}
        eyebrow="Commercial Accounting"
        title="Financial Management & Invoicing"
        description="Enterprise client billing, multi-currency invoices, payment settlements, and operational expenses."
        badge={`$${Number(summary.netOperatingBalance).toLocaleString()} Net Operating`}
        badgeColor={Number(summary.netOperatingBalance) >= 0 ? "burgundy" : "warning"}
      >
        <div className="flex items-center gap-2.5">
          <AdminButton
            variant="outline"
            size="sm"
            onClick={() => setIsExpenseModalOpen(true)}
            icon={Receipt}
          >
            Log Expense
          </AdminButton>

          <AdminButton
            variant="primary"
            size="sm"
            onClick={handleOpenCreateInvoice}
            icon={Plus}
          >
            Create Invoice
          </AdminButton>
        </div>
      </AdminPageHeader>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 hover:border-[#74102E]/30 transition-all">
          <div className="flex items-center justify-between text-[#777078]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
              Total Invoiced
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] flex items-center justify-center text-[#777078]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#24151B]">${Number(summary.totalInvoiced).toLocaleString()}</div>
          <div className="text-xs text-[#777078]">{summary.invoicesCount || 0} Invoices Issued</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 hover:border-[#74102E]/30 transition-all">
          <div className="flex items-center justify-between text-[#777078]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
              Settled / Collected
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#159B70]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#159B70]">${Number(summary.totalCollected).toLocaleString()}</div>
          <div className="text-xs text-[#159B70] font-semibold">Deposited into account</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 hover:border-[#74102E]/30 transition-all">
          <div className="flex items-center justify-between text-[#777078]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
              Outstanding Due
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D69A32]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#D69A32]">${Number(summary.totalOutstanding).toLocaleString()}</div>
          <div className="text-xs text-amber-800 font-semibold">Receivables pending</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 hover:border-[#74102E]/30 transition-all">
          <div className="flex items-center justify-between text-[#777078]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
              Operating Expenses
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-[#C43D4D]">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#C43D4D]">${Number(summary.totalExpenses).toLocaleString()}</div>
          <div className="text-xs text-[#777078]">{summary.expensesCount || 0} Expenses Logged</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 col-span-1 sm:col-span-2 lg:col-span-1 hover:border-[#74102E]/30 transition-all">
          <div className="flex items-center justify-between text-[#777078]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
              Net Cash Balance
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FBF4F6] border border-[#EADFE3] flex items-center justify-center text-[#74102E]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl font-black ${
              Number(summary.netOperatingBalance) >= 0 ? "text-[#74102E]" : "text-[#C43D4D]"
            }`}
          >
            ${Number(summary.netOperatingBalance).toLocaleString()}
          </div>
          <div className="text-xs text-[#777078]">Collected minus expenses</div>
        </div>
      </div>

      {feedback && (
        <AdminAlert
          variant={feedback.type}
          message={feedback.text}
          onDismiss={() => setFeedback(null)}
        />
      )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-mono opacity-60 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-[#EADFE3] flex items-center gap-6">
        <button
          type="button"
          onClick={() => setActiveTab("invoices")}
          className={`pb-2.5 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
            activeTab === "invoices"
              ? "border-[#74102E] text-[#74102E]"
              : "border-transparent text-[#777078] hover:text-[#24151B]"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Client Invoices ({invoices.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("expenses")}
          className={`pb-2.5 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
            activeTab === "expenses"
              ? "border-[#74102E] text-[#74102E]"
              : "border-transparent text-[#777078] hover:text-[#24151B]"
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Expenses ({expenses.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("payments")}
          className={`pb-2.5 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
            activeTab === "payments"
              ? "border-[#74102E] text-[#74102E]"
              : "border-transparent text-[#777078] hover:text-[#24151B]"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Payment Ledger ({payments.length})</span>
        </button>
      </div>

      {/* TAB 1: INVOICES */}
      {activeTab === "invoices" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-xl border border-[#EADFE3]">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#777078] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search invoices by number or client name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-[#777078]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs font-medium text-[#24151B] focus:outline-none focus:border-[#74102E] cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <button
                type="button"
                onClick={fetchFinanceData}
                className="px-3 py-2 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] hover:bg-white text-xs font-semibold text-[#4D4245] transition-colors cursor-pointer"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-xl border border-[#EADFE3] overflow-hidden shadow-2xs">
            {loading ? (
              <div className="p-12 text-center text-xs text-[#777078]">Loading invoices...</div>
            ) : filteredInvoices.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <FileText className="w-8 h-8 text-[#777078] mx-auto opacity-50" />
                <p className="text-xs font-bold text-[#24151B]">No invoices created yet</p>
                <p className="text-[11px] text-[#777078]">Click &quot;Create Invoice&quot; to issue your first client billing statement.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F7] border-b border-[#EADFE3] text-[#777078] font-mono uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4 font-bold">Invoice #</th>
                      <th className="py-3 px-4 font-bold">Client / Recipient</th>
                      <th className="py-3 px-4 font-bold">Dates</th>
                      <th className="py-3 px-4 font-bold">Total Amount</th>
                      <th className="py-3 px-4 font-bold">Balance Due</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                      <th className="py-3 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EADFE3]">
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-[#FAF7F7]/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => setViewingSlipInvoice(inv)}
                            className="font-mono font-bold text-[#74102E] hover:underline cursor-pointer block"
                          >
                            {inv.invoice_number}
                          </button>
                          <span className="text-[10px] text-[#777078]">{inv.currency}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#24151B]">{inv.client_name}</div>
                          <div className="text-[11px] text-[#777078]">{inv.client_email}</div>
                        </td>

                        <td className="py-3.5 px-4 text-[#4D4245]">
                          <div>Issued: {new Date(inv.issue_date).toLocaleDateString()}</div>
                          <div className="text-[10px] text-[#777078]">
                            Due: {new Date(inv.due_date).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-[#24151B]">
                          ${Number(inv.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`font-bold ${
                              Number(inv.balance_due) > 0 ? "text-amber-700" : "text-emerald-700"
                            }`}
                          >
                            ${Number(inv.balance_due).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                              inv.status === "Paid"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : inv.status === "Partially Paid"
                                ? "bg-blue-50 text-blue-800 border-blue-200"
                                : inv.status === "Sent"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : inv.status === "Draft"
                                ? "bg-gray-100 text-gray-700 border-gray-200"
                                : "bg-rose-50 text-rose-800 border-rose-200"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {Number(inv.balance_due) > 0 && (
                              <button
                                type="button"
                                onClick={() => handleOpenRecordPayment(inv)}
                                className="px-2.5 py-1 rounded-md bg-[#74102E] hover:bg-[#5C0C23] text-white font-semibold text-[11px] transition-colors cursor-pointer"
                              >
                                Record Pay
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setViewingSlipInvoice(inv)}
                              className="p-1.5 rounded-md hover:bg-[#FAF7F7] text-[#777078] hover:text-[#24151B] transition-colors cursor-pointer"
                              title="Print / View Invoice"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditInvoice(inv)}
                              className="p-1.5 rounded-md hover:bg-[#FAF7F7] text-[#777078] hover:text-[#24151B] transition-colors cursor-pointer"
                              title="Edit Invoice"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteInvoice(inv.id)}
                              className="p-1.5 rounded-md hover:bg-rose-50 text-[#777078] hover:text-rose-700 transition-colors cursor-pointer"
                              title="Delete Invoice"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

      {/* TAB 2: EXPENSES */}
      {activeTab === "expenses" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#EADFE3]">
            <div className="text-xs font-bold text-[#24151B]">Logged Operating Expenditures</div>
            <button
              type="button"
              onClick={() => setIsExpenseModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#74102E] text-white hover:bg-[#5C0C23] text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log New Expense</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-[#EADFE3] overflow-hidden shadow-2xs">
            {expenses.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#777078]">No expenses logged yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F7] border-b border-[#EADFE3] text-[#777078] font-mono uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4 font-bold">Category</th>
                      <th className="py-3 px-4 font-bold">Description</th>
                      <th className="py-3 px-4 font-bold">Vendor / Recipient</th>
                      <th className="py-3 px-4 font-bold">Date</th>
                      <th className="py-3 px-4 font-bold">Method</th>
                      <th className="py-3 px-4 font-bold">Amount</th>
                      <th className="py-3 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EADFE3]">
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-[#FAF7F7]/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#74102E]">{exp.category}</td>
                        <td className="py-3 px-4 text-[#24151B] font-medium">{exp.description}</td>
                        <td className="py-3 px-4 text-[#777078]">{exp.vendor_name || "N/A"}</td>
                        <td className="py-3 px-4 text-[#4D4245]">
                          {new Date(exp.expense_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-[#777078]">{exp.payment_method}</td>
                        <td className="py-3 px-4 font-bold text-rose-700">
                          ${Number(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="p-1 rounded text-[#777078] hover:text-rose-700 cursor-pointer"
                            title="Delete Expense"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* TAB 3: PAYMENTS LEDGER */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#EADFE3] overflow-hidden shadow-2xs">
            {payments.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#777078]">No payment transactions recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F7] border-b border-[#EADFE3] text-[#777078] font-mono uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4 font-bold">Transaction Date</th>
                      <th className="py-3 px-4 font-bold">Invoice Ref</th>
                      <th className="py-3 px-4 font-bold">Client Organization</th>
                      <th className="py-3 px-4 font-bold">Payment Method</th>
                      <th className="py-3 px-4 font-bold">Bank Reference</th>
                      <th className="py-3 px-4 font-bold text-right">Settled Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EADFE3]">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-[#FAF7F7]/60 transition-colors">
                        <td className="py-3 px-4 text-[#4D4245]">
                          {new Date(p.payment_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#74102E]">{p.invoice_number}</td>
                        <td className="py-3 px-4 font-semibold text-[#24151B]">{p.client_name}</td>
                        <td className="py-3 px-4 text-[#4D4245]">{p.payment_method}</td>
                        <td className="py-3 px-4 font-mono text-[#777078]">{p.transaction_reference || "N/A"}</td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-700">
                          +${Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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

      {/* INVOICE CREATE / EDIT MODAL */}
      {isInvoiceModalOpen && editingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-[#EADFE3] shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-[#EADFE3] flex items-center justify-between bg-[#FAF7F7]">
              <h3 className="text-sm font-bold text-[#24151B]">
                {editingInvoice.id ? "Edit Invoice" : "Generate Client Invoice"}
              </h3>
              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(false)}
                className="p-1 rounded-md text-[#777078] hover:text-[#24151B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Invoice Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingInvoice.invoice_number}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, invoice_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] font-mono text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Currency
                  </label>
                  <select
                    value={editingInvoice.currency}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, currency: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="AED">AED (AED)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="PKR">PKR (Rs)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingInvoice.client_name}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, client_name: e.target.value })}
                    placeholder="e.g. Caremon Wellness Ltd"
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Client Billing Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={editingInvoice.client_email}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, client_email: e.target.value })}
                    placeholder="billing@caremon.co.uk"
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={editingInvoice.issue_date}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, issue_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={editingInvoice.due_date}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, due_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  />
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold">
                    Billable Deliverables & Line Items
                  </label>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="text-[11px] font-bold text-[#74102E] hover:underline cursor-pointer"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {lineItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Item description / milestone"
                        value={item.description}
                        onChange={(e) => updateLineItem(idx, "description", e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs text-[#24151B]"
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(idx, "quantity", e.target.value)}
                        className="w-16 px-2 py-1.5 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs text-center text-[#24151B]"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Rate"
                        value={item.unit_price}
                        onChange={(e) => updateLineItem(idx, "unit_price", e.target.value)}
                        className="w-24 px-2 py-1.5 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs text-right text-[#24151B]"
                      />
                      <div className="w-24 text-right font-bold text-[#24151B] px-1 font-mono">
                        ${item.total.toFixed(2)}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLineItem(idx)}
                        disabled={lineItems.length === 1}
                        className="p-1 rounded text-[#777078] hover:text-rose-700 disabled:opacity-30 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax & Total Calculation */}
              <div className="p-4 rounded-xl bg-[#FAF7F7] border border-[#EADFE3] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#777078]">Subtotal:</span>
                  <span className="font-mono font-bold text-[#24151B]">
                    ${lineItems.reduce((acc, curr) => acc + curr.total, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#777078]">Tax Rate (%):</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={editingInvoice.tax_rate}
                      onChange={(e) => setEditingInvoice({ ...editingInvoice, tax_rate: e.target.value })}
                      className="w-16 px-2 py-1 rounded bg-white border border-[#EADFE3] text-xs text-center"
                    />
                  </div>
                  <span className="font-mono text-[#777078]">
                    +$
                    {(
                      (lineItems.reduce((acc, curr) => acc + curr.total, 0) * (Number(editingInvoice.tax_rate) || 0)) /
                      100
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#EADFE3] flex items-center justify-between text-sm font-bold">
                  <span className="text-[#24151B]">Total Amount Due:</span>
                  <span className="font-mono text-[#74102E]">
                    $
                    {(
                      lineItems.reduce((acc, curr) => acc + curr.total, 0) *
                      (1 + (Number(editingInvoice.tax_rate) || 0) / 100)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                  Terms & Payment Instructions
                </label>
                <textarea
                  rows={2}
                  value={editingInvoice.notes || ""}
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs text-[#24151B]"
                />
              </div>

              <div className="pt-4 border-t border-[#EADFE3] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#EADFE3] hover:bg-gray-50 text-xs font-semibold text-[#4D4245] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#74102E] text-white hover:bg-[#5C0C23] text-xs font-semibold cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Invoice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#EADFE3] shadow-xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFE3]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#74102E] font-bold">Record Settlement</span>
                <h3 className="text-sm font-bold text-[#24151B]">
                  Invoice: {paymentModalInvoice.invoice_number}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPaymentModalInvoice(null)}
                className="p-1 rounded-md text-[#777078] hover:text-[#24151B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                  Payment Amount ({paymentModalInvoice.currency}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  max={paymentModalInvoice.balance_due}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] font-mono font-bold text-xs text-[#24151B]"
                />
                <span className="text-[10px] text-[#777078]">
                  Current balance due: ${paymentModalInvoice.balance_due}
                </span>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                  Settlement Date *
                </label>
                <input
                  type="date"
                  required
                  value={paymentForm.payment_date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs text-[#24151B]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs text-[#24151B]"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                  Bank Reference / Wire Transaction ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. WIRE-89410294"
                  value={paymentForm.transaction_reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transaction_reference: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] font-mono text-xs text-[#24151B]"
                />
              </div>

              <div className="pt-3 border-t border-[#EADFE3] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalInvoice(null)}
                  className="px-3 py-1.5 rounded-lg border border-[#EADFE3] text-xs font-semibold text-[#4D4245] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer"
                >
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG EXPENSE MODAL */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#EADFE3] shadow-xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFE3]">
              <h3 className="text-sm font-bold text-[#24151B]">Log Operating Expenditure</h3>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1 rounded-md text-[#777078] hover:text-[#24151B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                  Category *
                </label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs text-[#24151B]"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                  Description / Purpose *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Production Cluster Hosting"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs text-[#24151B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Amount ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] font-mono font-bold text-xs text-[#24151B]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={expenseForm.expense_date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs text-[#24151B]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                  Vendor / Payee
                </label>
                <input
                  type="text"
                  placeholder="e.g. Amazon Web Services Inc."
                  value={expenseForm.vendor_name}
                  onChange={(e) => setExpenseForm({ ...expenseForm, vendor_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs text-[#24151B]"
                />
              </div>

              <div className="pt-3 border-t border-[#EADFE3] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#EADFE3] text-xs font-semibold text-[#4D4245] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-[#74102E] text-white hover:bg-[#5C0C23] text-xs font-semibold cursor-pointer"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE INVOICE SLIP MODAL */}
      {viewingSlipInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-[#EADFE3] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header / Actions */}
            <div className="p-4 border-b border-[#EADFE3] flex items-center justify-between bg-[#FAF7F7] print:hidden">
              <span className="text-xs font-bold text-[#24151B]">Invoice Preview</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#74102E] text-white text-xs font-semibold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingSlipInvoice(null)}
                  className="p-1 rounded-md text-[#777078] hover:text-[#24151B] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-8 space-y-6 text-xs text-[#24151B] bg-white">
              {/* Letterhead */}
              <div className="flex items-start justify-between pb-6 border-b border-[#EADFE3]">
                <div>
                  <div className="text-xl font-bold tracking-tight text-[#74102E]">AVANTUSFORGE</div>
                  <div className="text-[10px] font-mono text-[#777078] uppercase tracking-wider">
                    Enterprise Software & Digital Architecture
                  </div>
                  <div className="text-[11px] text-[#4D4245] mt-2">
                    71-75 Shelton Street, Covent Garden
                    <br />
                    London WC2H 9JQ, United Kingdom
                    <br />
                    billing@avantusforge.com
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-2xl font-bold tracking-tight text-[#24151B]">INVOICE</div>
                  <div className="text-xs font-mono font-bold text-[#74102E]">
                    #{viewingSlipInvoice.invoice_number}
                  </div>
                  <div className="text-[10px] text-[#777078]">
                    Date: {new Date(viewingSlipInvoice.issue_date).toLocaleDateString()}
                  </div>
                  <div className="text-[10px] text-[#777078]">
                    Due: {new Date(viewingSlipInvoice.due_date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-[10px] font-mono uppercase font-bold text-[#777078] mb-1">Billed To</div>
                  <div className="font-bold text-[#24151B] text-sm">{viewingSlipInvoice.client_name}</div>
                  <div className="text-[#777078]">{viewingSlipInvoice.client_email}</div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-mono uppercase font-bold text-[#777078] mb-1">Status</div>
                  <span
                    className={`inline-block px-3 py-1 rounded text-xs font-mono font-bold border ${
                      viewingSlipInvoice.status === "Paid"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}
                  >
                    {viewingSlipInvoice.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="border border-[#EADFE3] rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F7] border-b border-[#EADFE3] text-[#777078] font-mono uppercase text-[9.5px]">
                    <tr>
                      <th className="py-2.5 px-3 font-bold">Description</th>
                      <th className="py-2.5 px-3 font-bold text-center">Qty</th>
                      <th className="py-2.5 px-3 font-bold text-right">Unit Price</th>
                      <th className="py-2.5 px-3 font-bold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EADFE3]">
                    {(() => {
                      let items: LineItem[] = [];
                      try {
                        items = viewingSlipInvoice.line_items_json
                          ? JSON.parse(viewingSlipInvoice.line_items_json)
                          : [];
                      } catch {
                        items = [];
                      }
                      if (!items.length) {
                        items = [
                          {
                            description: "Custom Engineering Deliverables",
                            quantity: 1,
                            unit_price: Number(viewingSlipInvoice.subtotal),
                            total: Number(viewingSlipInvoice.subtotal),
                          },
                        ];
                      }
                      return items.map((it, i) => (
                        <tr key={i}>
                          <td className="py-2 px-3 font-medium text-[#24151B]">{it.description}</td>
                          <td className="py-2 px-3 text-center text-[#777078]">{it.quantity}</td>
                          <td className="py-2 px-3 text-right font-mono text-[#777078]">
                            ${Number(it.unit_price).toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-[#24151B]">
                            ${Number(it.total).toFixed(2)}
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#777078]">
                    <span>Subtotal:</span>
                    <span className="font-mono">${Number(viewingSlipInvoice.subtotal).toFixed(2)}</span>
                  </div>
                  {Number(viewingSlipInvoice.tax_amount) > 0 && (
                    <div className="flex justify-between text-[#777078]">
                      <span>Tax ({viewingSlipInvoice.tax_rate}%):</span>
                      <span className="font-mono">+${Number(viewingSlipInvoice.tax_amount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-[#24151B] pt-1.5 border-t border-[#EADFE3]">
                    <span>Total Amount:</span>
                    <span className="font-mono text-[#74102E]">
                      ${Number(viewingSlipInvoice.total_amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-amber-800">
                    <span>Balance Due:</span>
                    <span className="font-mono">${Number(viewingSlipInvoice.balance_due).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="pt-4 border-t border-[#EADFE3] text-[11px] text-[#777078] leading-relaxed">
                <span className="font-bold text-[#24151B]">Settlement Terms: </span>
                {viewingSlipInvoice.notes ||
                  "Payment via bank wire or credit card within agreed contract milestone schedule."}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
