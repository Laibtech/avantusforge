import { NextResponse } from "next/server";
import { createLead } from "@/lib/db";

interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  budget?: string;
  message: string;
  lead_source?: string;
}

// In-memory rate limiting: 5 submissions per minute per IP/identifier
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + 60000 });
    return false;
  }
  if (record.count >= 5) {
    return true;
  }
  record.count += 1;
  return false;
}

export async function POST(request: Request) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "client";

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many inquiries submitted from this connection. Please wait one minute before submitting again.",
        },
        { status: 429 }
      );
    }

    const body: ContactPayload = await request.json();

    const { name, email, phone, company, service, budget, message, lead_source } = body;

    // Field validations
    const errors: Record<string, string> = {};

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      errors.name = "Please provide your full name (at least 2 characters).";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
      errors.email = "Please provide a valid business email address.";
    }

    if (!message || typeof message !== "string" || message.trim().length < 10) {
      errors.message = "Please describe your project or challenge (at least 10 characters).";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          errors,
          message: "Validation failed. Please review the highlighted fields.",
        },
        { status: 400 }
      );
    }

    // Persist lead directly into the database
    const leadId = await createLead({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || "",
      company: company?.trim() || "",
      service: service || "Custom Software Development",
      budget: budget || "Not specified",
      message: message.trim(),
      status: "New",
      priority: budget && budget.includes("50k") ? "High" : "Normal",
      lead_source: lead_source || "Contact Page",
      assigned_to: "Unassigned",
      internal_notes: "",
      follow_up_date: "",
    });

    console.log(`[AvantusForge Lead Saved] ID: ${leadId} from ${email.trim()}`);

    // Optional webhook forwarding if environment webhook is configured
    if (process.env.CONTACT_WEBHOOK_URL) {
      try {
        await fetch(process.env.CONTACT_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: leadId, name: name.trim(), email: email.trim(), phone, company, service, budget, message, lead_source }),
        });
      } catch (webhookErr) {
        console.error("[AvantusForge Webhook Forwarding Error]", webhookErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Thank you for contacting AvantusForge. Your project inquiry has been received. A senior technology partner will review your requirements and respond within 24 business hours.",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[AvantusForge Contact Route Error]", err);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while processing your request. Please email us directly at info@avantusforge.com.",
      },
      { status: 500 }
    );
  }
}
