"use server";

import { revalidatePath } from "next/cache";
import { verifyAdminAuth } from "../projects/actions";
import { LeadStatus } from "@/types/lead";

const VALID_STATUSES: LeadStatus[] = ["new", "contacted", "archived"];

export async function updateLeadStatusAction(
  id: string,
  status: LeadStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAdminAuth();

    if (!id || !status || !VALID_STATUSES.includes(status)) {
      return { success: false, error: "Invalid status or missing lead ID." };
    }

    const { error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/leads");
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return { success: false, error: message };
  }
}

export async function deleteLeadAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAdminAuth();

    if (!id) {
      return { success: false, error: "Lead ID is required." };
    }

    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/leads");
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return { success: false, error: message };
  }
}
