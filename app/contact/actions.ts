"use server";

import { createClient } from "@/lib/supabase/server";
import { LeadInput, LeadActionResult, ALLOWED_DISCIPLINES } from "@/types/lead";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitLeadAction(
  data: LeadInput
): Promise<LeadActionResult> {
  try {
    // 1. Sanitize and trim inputs
    const fullName = data.full_name?.trim() || "";
    const organization = data.organization?.trim() || null;
    const email = data.email?.trim().toLowerCase() || "";
    const details = data.details?.trim() || "";
    const rawDisciplines = Array.isArray(data.disciplines) ? data.disciplines : [];

    // 2. Validate required string fields
    if (!fullName) {
      return { success: false, error: "Full name is required." };
    }
    if (fullName.length > 150) {
      return { success: false, error: "Full name must be 150 characters or less." };
    }

    if (!email) {
      return { success: false, error: "Email address is required." };
    }
    if (email.length > 255 || !EMAIL_REGEX.test(email)) {
      return { success: false, error: "A valid email address is required." };
    }

    if (organization && organization.length > 150) {
      return { success: false, error: "Organization name must be 150 characters or less." };
    }

    if (!details) {
      return { success: false, error: "Project overview and timeline are required." };
    }
    if (details.length > 5000) {
      return { success: false, error: "Project details must be 5000 characters or less." };
    }

    // 3. Validate disciplines strictly against allowed options
    const allowedSet = new Set<string>(ALLOWED_DISCIPLINES);
    for (const d of rawDisciplines) {
      if (typeof d !== "string" || !allowedSet.has(d.trim())) {
        return {
          success: false,
          error: "One or more selected disciplines are invalid.",
        };
      }
    }
    const sanitizedDisciplines = rawDisciplines.map((d) => d.trim());

    // 4. Ingest into Supabase via authenticated/anonymous server client
    const supabase = await createClient();

    const { error: insertError } = await supabase.from("leads").insert({
      full_name: fullName,
      organization,
      email,
      disciplines: sanitizedDisciplines,
      details,
      status: "new",
    });

    if (insertError) {
      // Do not leak database internals, log server-side if needed
      return {
        success: false,
        error: "Unable to record your enquiry at this time. Please try again or reach out directly.",
      };
    }

    return { success: true };
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred while transmitting your enquiry. Please try again.",
    };
  }
}
