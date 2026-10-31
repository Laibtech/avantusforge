"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface FormState {
  name: string;
  email: string;
  company: string;
  phone: string;
  service: string;
  budget: string;
  message: string;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  service?: string;
  message?: string;
}

const INITIAL_STATE: FormState = {
  name: "",
  email: "",
  company: "",
  phone: "",
  service: "Custom Software & Systems",
  budget: "$15,000 - $30,000",
  message: "",
};

export default function ContactForm() {
  const [formData, setFormData] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = "Please enter your full name.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address (e.g. name@company.com).";
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = "Please describe your project or challenge (at least 10 characters).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error when user begins typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent duplicate submissions

    if (!validate()) {
      return;
    }

    setLoading(true);
    setServerError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
      } else {
        setServerError(
          data.message ||
            "Unable to submit inquiry at this time. Please email us directly at info@avantusforge.com."
        );
        if (data.errors) {
          setErrors(data.errors);
        }
      }
    } catch {
      setServerError(
        "Network connection error. Please email us directly at info@avantusforge.com or try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white border border-[#E8DDE0] p-8 sm:p-12 text-center rounded-xl shadow-xs">
        <div className="w-14 h-14 rounded-full bg-[#FAF3F5] text-[#750F2C] mx-auto flex items-center justify-center mb-5 border border-[#750F2C]/15">
          <CheckCircle2 className="w-7 h-7 text-[#750F2C]" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#191416] mb-3 tracking-tight">
          Inquiry Successfully Received
        </h3>
        <p className="text-sm text-[#6F6568] max-w-md mx-auto leading-relaxed mb-6">
          Thank you for reaching out, <span className="font-semibold text-[#191416]">{formData.name}</span>.
          A senior technology partner will review your project requirements and respond to{" "}
          <span className="font-semibold text-[#750F2C]">{formData.email}</span> within 24 business hours.
        </p>

        <div className="bg-[#FCFAF8] border border-[#E8DDE0] rounded-lg p-4 max-w-md mx-auto text-left text-xs text-[#5C5256] space-y-1.5 mb-6">
          <div><span className="font-bold text-[#191416]">Service:</span> {formData.service}</div>
          {formData.company && <div><span className="font-bold text-[#191416]">Company:</span> {formData.company}</div>}
          {formData.phone && <div><span className="font-bold text-[#191416]">Phone:</span> {formData.phone}</div>}
          <div><span className="font-bold text-[#191416]">Budget Range:</span> {formData.budget}</div>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormData(INITIAL_STATE);
            setSubmitted(false);
          }}
          className="text-xs font-bold text-[#750F2C] hover:text-[#52091E] underline cursor-pointer"
        >
          Submit another project inquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white border border-[#E8DDE0] p-8 sm:p-10 rounded-xl space-y-6 shadow-xs"
    >
      {serverError && (
        <div className="bg-[#FAF3F5] border border-[#750F2C]/20 p-4 rounded-lg flex items-start gap-3 text-xs text-[#750F2C]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Name & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-bold uppercase tracking-wider text-[#191416] mb-2"
          >
            Name <span className="text-[#750F2C]">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="Jane Doe"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-[#FCFAF8] border text-sm text-[#191416] placeholder-[#6F6568]/50 focus:outline-none rounded-lg transition-colors ${
              errors.name
                ? "border-red-500 focus:border-red-600 bg-red-50/20"
                : "border-[#E8DDE0] focus:border-[#750F2C]"
            }`}
          />
          {errors.name && (
            <p className="text-[11px] text-red-600 mt-1.5 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errors.name}</span>
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-xs font-bold uppercase tracking-wider text-[#191416] mb-2"
          >
            Email Address <span className="text-[#750F2C]">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="jane@company.com"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-[#FCFAF8] border text-sm text-[#191416] placeholder-[#6F6568]/50 focus:outline-none rounded-lg transition-colors ${
              errors.email
                ? "border-red-500 focus:border-red-600 bg-red-50/20"
                : "border-[#E8DDE0] focus:border-[#750F2C]"
            }`}
          />
          {errors.email && (
            <p className="text-[11px] text-red-600 mt-1.5 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errors.email}</span>
            </p>
          )}
        </div>
      </div>

      {/* Company & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="company"
            className="block text-xs font-bold uppercase tracking-wider text-[#191416] mb-2"
          >
            Company
          </label>
          <input
            type="text"
            id="company"
            name="company"
            placeholder="Acme Corp"
            value={formData.company}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#FCFAF8] border border-[#E8DDE0] text-sm text-[#191416] placeholder-[#6F6568]/50 focus:outline-none focus:border-[#750F2C] rounded-lg transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-xs font-bold uppercase tracking-wider text-[#191416] mb-2"
          >
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="+92 327 4074472"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#FCFAF8] border border-[#E8DDE0] text-sm text-[#191416] placeholder-[#6F6568]/50 focus:outline-none focus:border-[#750F2C] rounded-lg transition-colors"
          />
        </div>
      </div>

      {/* Service & Budget */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="service"
            className="block text-xs font-bold uppercase tracking-wider text-[#191416] mb-2"
          >
            Service
          </label>
          <select
            id="service"
            name="service"
            value={formData.service}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#FCFAF8] border border-[#E8DDE0] text-sm text-[#191416] focus:outline-none focus:border-[#750F2C] rounded-lg transition-colors"
          >
            <option>Custom Software &amp; Systems</option>
            <option>Websites &amp; E-Commerce</option>
            <option>SaaS, ERP &amp; CRM</option>
            <option>Mobile Applications</option>
            <option>Digital Marketing &amp; SEO</option>
            <option>UI/UX &amp; Conversion Optimization</option>
            <option>Business Automation &amp; Workflows</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="budget"
            className="block text-xs font-bold uppercase tracking-wider text-[#191416] mb-2"
          >
            Anticipated Budget (USD)
          </label>
          <select
            id="budget"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#FCFAF8] border border-[#E8DDE0] text-sm text-[#191416] focus:outline-none focus:border-[#750F2C] rounded-lg transition-colors"
          >
            <option>$5,000 - $15,000</option>
            <option>$15,000 - $30,000</option>
            <option>$30,000 - $50,000</option>
            <option>$50,000+</option>
          </select>
        </div>
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="message"
          className="block text-xs font-bold uppercase tracking-wider text-[#191416] mb-2"
        >
          Project Details / Operational Challenge <span className="text-[#750F2C]">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder="Tell us what you are trying to build, automate or scale..."
          value={formData.message}
          onChange={handleChange}
          className={`w-full px-4 py-3 bg-[#FCFAF8] border text-sm text-[#191416] placeholder-[#6F6568]/50 focus:outline-none rounded-lg transition-colors ${
            errors.message
              ? "border-red-500 focus:border-red-600 bg-red-50/20"
              : "border-[#E8DDE0] focus:border-[#750F2C]"
          }`}
        />
        {errors.message && (
          <p className="text-[11px] text-red-600 mt-1.5 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{errors.message}</span>
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#750F2C] hover:bg-[#52091E] disabled:bg-[#750F2C]/60 text-white px-8 py-4 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-150 shadow-xs hover:shadow cursor-pointer disabled:cursor-not-allowed group"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting Inquiry...</span>
            </>
          ) : (
            <>
              <span>Send Project Inquiry</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
