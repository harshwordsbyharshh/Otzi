"use client";

import React, { useState } from "react";
import { LeadRecord, LeadStatus, LeadFilterStatus } from "@/types/lead";
import { updateLeadStatusAction, deleteLeadAction } from "./actions";

interface LeadsListClientProps {
  initialLeads: LeadRecord[];
}

export function LeadsListClient({ initialLeads }: LeadsListClientProps) {
  const [leads, setLeads] = useState<LeadRecord[]>(initialLeads);
  const [filter, setFilter] = useState<LeadFilterStatus>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const newCount = leads.filter((l) => l.status === "new").length;
  const contactedCount = leads.filter((l) => l.status === "contacted").length;
  const archivedCount = leads.filter((l) => l.status === "archived").length;

  const filteredLeads = leads.filter((l) => {
    if (filter === "all") return true;
    return l.status === filter;
  });

  const handleStatusChange = async (id: string, newStatus: LeadStatus) => {
    try {
      setActionError(null);
      setActionSuccess(null);
      setUpdatingId(id);

      const res = await updateLeadStatusAction(id, newStatus);
      if (!res.success) {
        setActionError(res.error || "Failed to update lead status.");
        return;
      }

      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
      );
      setActionSuccess(`Lead status updated to ${newStatus.toUpperCase()}.`);
    } catch {
      setActionError("Unexpected failure while updating lead status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setActionError(null);
      setActionSuccess(null);
      setDeletingId(id);

      const res = await deleteLeadAction(id);
      if (!res.success) {
        setActionError(res.error || "Failed to delete lead.");
        setConfirmDeleteId(null);
        return;
      }

      setLeads((prev) => prev.filter((l) => l.id !== id));
      setConfirmDeleteId(null);
      setActionSuccess("Lead record permanently removed.");
    } catch {
      setActionError("Unexpected failure while deleting lead.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Feedback Messages */}
      {actionError && (
        <div
          role="alert"
          className="border border-primary bg-[#1f0d14] p-4 text-white text-sm font-label-mono flex items-center justify-between"
        >
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-paper-dim hover:text-white uppercase text-xs"
          >
            [DISMISS]
          </button>
        </div>
      )}

      {actionSuccess && (
        <div
          role="status"
          className="border border-[#262626] bg-[#141414] p-4 text-white text-sm font-label-mono flex items-center justify-between"
        >
          <span className="text-primary font-bold">{actionSuccess}</span>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            className="text-paper-dim hover:text-white uppercase text-xs"
          >
            [DISMISS]
          </button>
        </div>
      )}

      {/* Filter Tabs Matrix */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#262626] pb-4">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-4 py-2 font-label-mono text-xs uppercase tracking-wider transition-colors border ${
            filter === "all"
              ? "border-primary bg-primary text-white font-bold"
              : "border-[#262626] bg-black text-paper-dim hover:text-white hover:border-[#6b6b6b]"
          }`}
        >
          ALL LEADS ({leads.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter("new")}
          className={`px-4 py-2 font-label-mono text-xs uppercase tracking-wider transition-colors border ${
            filter === "new"
              ? "border-primary bg-primary text-white font-bold"
              : "border-[#262626] bg-black text-paper-dim hover:text-white hover:border-[#6b6b6b]"
          }`}
        >
          NEW ({newCount})
        </button>

        <button
          type="button"
          onClick={() => setFilter("contacted")}
          className={`px-4 py-2 font-label-mono text-xs uppercase tracking-wider transition-colors border ${
            filter === "contacted"
              ? "border-primary bg-primary text-white font-bold"
              : "border-[#262626] bg-black text-paper-dim hover:text-white hover:border-[#6b6b6b]"
          }`}
        >
          CONTACTED ({contactedCount})
        </button>

        <button
          type="button"
          onClick={() => setFilter("archived")}
          className={`px-4 py-2 font-label-mono text-xs uppercase tracking-wider transition-colors border ${
            filter === "archived"
              ? "border-primary bg-primary text-white font-bold"
              : "border-[#262626] bg-black text-paper-dim hover:text-white hover:border-[#6b6b6b]"
          }`}
        >
          ARCHIVED ({archivedCount})
        </button>
      </div>

      {/* Leads List */}
      {filteredLeads.length === 0 ? (
        <div className="border border-[#262626] p-12 bg-surface-container-low text-center">
          <span className="font-label-mono text-xs uppercase tracking-widest text-paper-dim block mb-2">
            NO RECORDS FOUND
          </span>
          <p className="font-body-md text-sm text-[#777] m-0">
            {filter === "all"
              ? "No enquiries recorded in the database yet."
              : `No leads currently classified under "${filter.toUpperCase()}".`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredLeads.map((lead) => {
            const isUpdating = updatingId === lead.id;
            const isDeleting = deletingId === lead.id;
            const isConfirming = confirmDeleteId === lead.id;

            const dateStr = new Date(lead.created_at).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={lead.id}
                className="border border-[#262626] bg-surface-container-low p-6 md:p-8 flex flex-col gap-6 transition-colors hover:border-[#444]"
              >
                {/* Header Row: Name, Status Badge, Date */}
                <div className="border-b border-[#262626] pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-headline-md text-xl md:text-2xl uppercase text-white font-bold tracking-tight m-0">
                        {lead.full_name}
                      </h3>
                      {lead.organization && (
                        <span className="font-label-mono text-xs uppercase tracking-wider text-paper-dim border border-[#262626] px-2 py-0.5">
                          {lead.organization}
                        </span>
                      )}
                    </div>
                    <a
                      href={`mailto:${lead.email}`}
                      className="font-label-mono text-xs uppercase text-paper-dim hover:text-primary transition-colors tracking-wider"
                    >
                      {lead.email} ↗
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    <span
                      className={`font-label-mono text-[11px] uppercase tracking-widest px-3 py-1 font-bold border ${
                        lead.status === "new"
                          ? "border-primary bg-[#1f0d14] text-primary"
                          : lead.status === "contacted"
                          ? "border-white bg-black text-white"
                          : "border-[#444] bg-black text-[#777]"
                      }`}
                    >
                      ● {lead.status.toUpperCase()}
                    </span>

                    <span className="font-label-mono text-xs text-[#777] uppercase tracking-wider">
                      {dateStr}
                    </span>
                  </div>
                </div>

                {/* Disciplines Requested */}
                {lead.disciplines && lead.disciplines.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="font-label-mono text-[10px] text-paper-dim uppercase tracking-wider">
                      DISCIPLINES OF INTEREST:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {lead.disciplines.map((disc) => (
                        <span
                          key={disc}
                          className="font-label-mono text-xs uppercase tracking-wider border border-[#262626] bg-black px-3 py-1 text-white"
                        >
                          {disc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Project Details / Overview */}
                <div className="border border-[#1e1e1e] bg-black p-4">
                  <span className="font-label-mono text-[10px] text-paper-dim uppercase tracking-wider block mb-2">
                    COMMISSION PARAMETERS &amp; OVERVIEW:
                  </span>
                  <p className="font-body-md text-sm text-paper-dim leading-relaxed whitespace-pre-wrap m-0">
                    {lead.details}
                  </p>
                </div>

                {/* Footer Controls: Status Transition & Delete */}
                <div className="border-t border-[#262626] pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Status Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-label-mono text-[11px] text-paper-dim uppercase tracking-wider mr-1">
                      UPDATE STATUS:
                    </span>
                    {(["new", "contacted", "archived"] as LeadStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStatusChange(lead.id, st)}
                        disabled={isUpdating || lead.status === st}
                        className={`font-label-mono text-xs uppercase tracking-wider px-3 py-1.5 border transition-colors cursor-pointer disabled:cursor-not-allowed ${
                          lead.status === st
                            ? "border-primary bg-primary text-white font-bold opacity-100"
                            : "border-[#262626] bg-black text-paper-dim hover:border-white hover:text-white disabled:opacity-30"
                        }`}
                      >
                        {isUpdating && lead.status !== st ? "..." : st.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {/* Delete Action with 2-step confirmation */}
                  <div className="flex items-center gap-2">
                    {isConfirming ? (
                      <div className="flex items-center gap-2">
                        <span className="font-label-mono text-xs text-primary font-bold uppercase">
                          CONFIRM DELETE?
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDelete(lead.id)}
                          disabled={isDeleting}
                          className="border border-primary bg-primary hover:bg-white hover:text-black text-white px-3 py-1 font-label-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
                        >
                          {isDeleting ? "DELETING..." : "YES, DELETE"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          disabled={isDeleting}
                          className="border border-[#262626] text-paper-dim hover:text-white px-3 py-1 font-label-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          CANCEL
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(lead.id)}
                        className="font-label-mono text-xs text-[#777] hover:text-primary uppercase tracking-wider px-2 py-1 transition-colors cursor-pointer"
                      >
                        DELETE RECORD
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
