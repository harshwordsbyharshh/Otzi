"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { submitLeadAction } from "./actions";
import { ALLOWED_DISCIPLINES } from "@/types/lead";

const disciplines = [...ALLOWED_DISCIPLINES];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDisciplineToggle = (item: string) => {
    setSelectedDisciplines((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  const handleReset = () => {
    setSubmitted(false);
    setSelectedDisciplines([]);
    setFullName("");
    setOrganization("");
    setEmail("");
    setDetails("");
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await submitLeadAction({
        full_name: fullName,
        organization: organization || null,
        email,
        disciplines: selectedDisciplines,
        details,
      });

      if (!result.success) {
        setErrorMessage(
          result.error || "Unable to submit your enquiry at this time. Please try again."
        );
        setIsSubmitting(false);
        return;
      }

      setSubmitted(true);
      setIsSubmitting(false);
    } catch {
      setErrorMessage(
        "An unexpected transmission failure occurred. Please try again or email us directly."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-black min-h-screen">
      {/* ====================================================================
          1. CONTACT HERO
          ==================================================================== */}
      <section
        className="w-full bg-black border-b border-[#262626] pt-16 md:pt-24 lg:pt-28 pb-14 md:pb-20"
        aria-labelledby="contact-heading"
      >
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10">
          <div className="flex flex-col gap-6 md:gap-8">
            <div className="flex items-center gap-2 font-label-mono text-label-mono uppercase tracking-widest text-primary font-bold">
              <span className="w-2 h-2 bg-primary inline-block" aria-hidden="true" />
              <span>DIRECT ENGAGEMENT</span>
            </div>

            <h1
              id="contact-heading"
              className="font-display-xl text-display-xl uppercase tracking-tighter text-white m-0 max-w-6xl leading-none select-none"
            >
              BOOK OUR SERVICES.
            </h1>

            <p className="font-body-lg text-body-lg text-paper-dim leading-relaxed max-w-2xl m-0 border-t border-[#262626] pt-6">
              ÖTZI is open for selective brand commissions, ongoing social ecosystem management, dynamic motion infrastructure, and creative production.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. SPLIT INQUIRY SECTION: STUDIO INFO & ACCESSIBLE FORM
          ==================================================================== */}
      <section className="w-full bg-black border-b border-[#262626] py-16 md:py-24" aria-label="Contact Interface">
        <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Direct Inquiries & Channels */}
            <div className="lg:col-span-5 space-y-10">
              <div className="space-y-3">
                <span className="font-label-mono text-label-mono uppercase tracking-widest text-paper-dim font-bold block">
                  PRIMARY EMAIL INQUIRIES
                </span>
                <a
                  href="mailto:otzimagency@gmail.com"
                  className="font-headline-md text-headline-md uppercase text-white hover:text-primary transition-colors font-bold tracking-tight inline-block"
                >
                  OTZIMAGENCY@GMAIL.COM
                </a>
                <p className="font-body-sm text-body-sm text-paper-dim leading-relaxed m-0 pt-2">
                  We review brand inquiries and production requests directly. Include project overview, target channels, and estimated timeline.
                </p>
              </div>

              {/* Direct Channels */}
              <div className="border border-[#262626] p-6 bg-surface-container-low space-y-4">
                <span className="font-label-mono text-label-mono uppercase tracking-widest text-primary font-bold block">
                  NETWORKS &amp; BROADCAST
                </span>
                <div className="space-y-3 font-label-action text-label-action uppercase text-sm">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-white hover:text-primary transition-colors border-b border-[#262626] pb-2 min-h-[44px]"
                  >
                    <span>INSTAGRAM</span>
                    <span aria-hidden="true">→</span>
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-white hover:text-primary transition-colors min-h-[44px]"
                  >
                    <span>LINKEDIN</span>
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Accessible Inquiry Form */}
            <div className="lg:col-span-7">
              <div className="border border-[#262626] p-6 md:p-10 bg-surface-container-low">
                {submitted ? (
                  <div
                    role="alert"
                    className="py-12 flex flex-col items-start gap-4"
                  >
                    <span className="font-label-mono text-label-mono uppercase tracking-widest text-primary font-bold">
                      INQUIRY RECORDED
                    </span>
                    <h2 className="font-headline-md text-headline-md uppercase text-white tracking-tight m-0 font-bold">
                      THANK YOU FOR YOUR INQUIRY.
                    </h2>
                    <p className="font-body-md text-body-md text-paper-dim leading-relaxed max-w-xl m-0">
                      Your inquiry parameters have been registered on the client interface. For immediate direct correspondence, you may also email us directly at{" "}
                      <a
                        href="mailto:otzimagency@gmail.com"
                        className="text-white underline hover:text-primary"
                      >
                        otzimagency@gmail.com
                      </a>
                      .
                    </p>
                    <div className="pt-6">
                      <Button
                        type="button"
                        variant="primary"
                        onClick={handleReset}
                      >
                        RESET FORM
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6" noValidate={false}>
                    <div className="border-b border-[#262626] pb-4">
                      <h2 className="font-title-sm text-title-sm uppercase text-white tracking-tight m-0 font-bold">
                        COMMISSION PARAMETERS
                      </h2>
                    </div>

                    {/* Accessible Error Banner */}
                    {errorMessage && (
                      <div
                        role="alert"
                        className="border border-primary bg-[#1f0d14] p-4 flex items-center gap-3 text-white text-sm font-label-mono"
                      >
                        <span className="text-primary font-bold" aria-hidden="true">!</span>
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* Name & Organization */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label
                          htmlFor="name"
                          className="font-label-mono text-label-mono uppercase tracking-wider text-paper-dim block"
                        >
                          FULL NAME <span className="text-primary">*</span>
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="YOUR NAME"
                          className="w-full bg-black border border-[#6b6b6b] text-white px-4 py-3 font-body-md text-body-md placeholder:text-[#555] focus:outline-none focus:border-white transition-colors min-h-[44px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="organization"
                          className="font-label-mono text-label-mono uppercase tracking-wider text-paper-dim block"
                        >
                          BRAND / ORGANIZATION
                        </label>
                        <input
                          id="organization"
                          name="organization"
                          type="text"
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          placeholder="BRAND NAME"
                          className="w-full bg-black border border-[#6b6b6b] text-white px-4 py-3 font-body-md text-body-md placeholder:text-[#555] focus:outline-none focus:border-white transition-colors min-h-[44px]"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="font-label-mono text-label-mono uppercase tracking-wider text-paper-dim block"
                      >
                        EMAIL ADDRESS <span className="text-primary">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="NAME@ORGANIZATION.COM"
                        className="w-full bg-black border border-[#6b6b6b] text-white px-4 py-3 font-body-md text-body-md placeholder:text-[#555] focus:outline-none focus:border-white transition-colors min-h-[44px]"
                      />
                    </div>

                    {/* Discipline Selection */}
                    <div className="space-y-3 pt-2">
                      <span className="font-label-mono text-label-mono uppercase tracking-wider text-paper-dim block">
                        DISCIPLINES OF INTEREST
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {disciplines.map((d) => {
                          const isSelected = selectedDisciplines.includes(d);
                          return (
                            <button
                              key={d}
                              type="button"
                              onClick={() => handleDisciplineToggle(d)}
                              aria-pressed={isSelected}
                              className={`flex items-center gap-3 p-3 border transition-colors text-left select-none cursor-pointer min-h-[44px] ${
                                isSelected
                                  ? "border-primary bg-surface-container-high text-white"
                                  : "border-[#262626] bg-black text-paper-dim hover:border-paper-dim hover:text-white"
                              }`}
                            >
                              <span
                                className={`w-3.5 h-3.5 border flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? "border-primary bg-primary text-white"
                                    : "border-[#6b6b6b] bg-transparent"
                                }`}
                                aria-hidden="true"
                              >
                                {isSelected && "✓"}
                              </span>
                              <span className="font-label-mono text-xs uppercase tracking-wider">
                                {d}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="space-y-2 pt-2">
                      <label
                        htmlFor="details"
                        className="font-label-mono text-label-mono uppercase tracking-wider text-paper-dim block"
                      >
                        PROJECT OVERVIEW &amp; TIMELINE <span className="text-primary">*</span>
                      </label>
                      <textarea
                        id="details"
                        name="details"
                        rows={5}
                        required
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="OUTLINE OBJECTIVES, TARGET CHANNELS, AND ESTIMATED TIMELINE..."
                        className="w-full bg-black border border-[#6b6b6b] text-white p-4 font-body-md text-body-md placeholder:text-[#555] focus:outline-none focus:border-white transition-colors resize-y"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 border-t border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-8 py-4 text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "TRANSMITTING..." : "BOOK OUR SERVICES"}
                      </Button>
                      <span className="font-label-mono text-[11px] text-paper-dim uppercase tracking-wider">
                        DIRECT BRAND INQUIRIES
                      </span>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
