"use client";

import * as React from "react";
import {
  Building2,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Send,
  Key,
  BadgeCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WHATSAPP_CONFIG } from "@/lib/constants";

export default function ListPropertyPage() {
  const [formData, setFormData] = React.useState({
    fullName: "",
    phone: "",
    email: "",
    location: "",
    flatType: "2bhk",
    furnishingStatus: "fully-furnished",
    message: "",
  });

  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Prepare WhatsApp message
    const inquiryText = `Hello Flatel Acquisitions Team, I would like to list my property with Flatel:
- Name: ${formData.fullName}
- Phone: ${formData.phone}
- Email: ${formData.email || "N/A"}
- Location: ${formData.location}
- Flat Type: ${formData.flatType.toUpperCase()}
- Furnishing: ${formData.furnishingStatus}
- Details: ${formData.message || "Ready for inspection"}`;

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);

      // Open WhatsApp inquiry in new tab
      const whatsappUrl = WHATSAPP_CONFIG.getUrl(inquiryText);
      window.open(whatsappUrl, "_blank");
    }, 600);
  };

  const partnerWhatsappUrl = WHATSAPP_CONFIG.getUrl(
    "Hello Flatel Hospitality, I want to discuss partnering with you to list my property."
  );

  return (
    <div className="min-h-screen bg-canvas text-fg flex flex-col font-sans selection:bg-gold/20 selection:text-gold">
      <SiteHeader />

      <main id="main-content" tabIndex={-1} className="flex-1 w-full">
        {/* ========================================================= */}
        {/* HERO SECTION                                              */}
        {/* ========================================================= */}
        <section className="relative pt-16 pb-14 sm:pt-20 sm:pb-16 bg-surface/90 overflow-hidden">
          <div
            className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--gold)_9%,transparent),transparent_70%)] -z-10"
            aria-hidden="true"
          />

          <div className="container-page text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface border border-line text-gold text-xs font-sans font-medium uppercase tracking-[0.18em] mb-4">
              <Building2 className="w-3.5 h-3.5 text-gold" />
              <span>Property Owner Partnership</span>
            </div>

            <h1 className="font-heading text-fg heading-page">
              List Your Property with <span className="text-gold">Flatel</span>
            </h1>

            <p className="mt-3 text-sm sm:text-base text-fg-muted max-w-2xl mx-auto leading-relaxed">
              Partner with Flatel to host short and extended stay guests. We manage guest arrivals, regular cleaning, and daily property maintenance.
            </p>
          </div>
        </section>

        {/* ========================================================= */}
        {/* VALUE PILLARS & OWNER BENEFITS                            */}
        {/* ========================================================= */}
        <section className="py-12 sm:py-16 bg-surface/60">
          <div className="container-page">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="border-t border-line pt-6">
                <div className="w-10 h-10 rounded-xl bg-surface border border-line text-gold flex items-center justify-center mb-4">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h2 className="font-heading text-base font-medium text-fg">
                  Consistent Bookings
                </h2>
                <p className="mt-2 text-xs text-fg-muted leading-relaxed">
                  We host medical attendants, vacationing families, and business professionals seeking quality serviced apartments in Hyderabad.
                </p>
              </div>

              <div className="border-t border-line pt-6">
                <div className="w-10 h-10 rounded-xl bg-surface border border-line text-gold flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h2 className="font-heading text-base font-medium text-fg">
                  Regular Cleaning & Care
                </h2>
                <p className="mt-2 text-xs text-fg-muted leading-relaxed">
                  Our professional housekeeping team cleans and inspects the apartment between stays to keep your asset in good order.
                </p>
              </div>

              <div className="border-t border-line pt-6">
                <div className="w-10 h-10 rounded-xl bg-surface border border-line text-gold flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h2 className="font-heading text-base font-medium text-fg">
                  Verified Guests Only
                </h2>
                <p className="mt-2 text-xs text-fg-muted leading-relaxed">
                  Every adult guest must present a valid government-issued photo ID or passport before check-in.
                </p>
              </div>

              <div className="border-t border-line pt-6">
                <div className="w-10 h-10 rounded-xl bg-surface border border-line text-gold flex items-center justify-center mb-4">
                  <Key className="w-5 h-5" />
                </div>
                <h2 className="font-heading text-base font-medium text-fg">
                  Operations Handled
                </h2>
                <p className="mt-2 text-xs text-fg-muted leading-relaxed">
                  We manage key handovers, guest communications, payment collection, and routine inquiries from check-in to departure.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SUBMISSION FORM & DIRECT CONTACT                          */}
        {/* ========================================================= */}
        <section className="py-14 sm:py-20">
          <div className="container-page">
            <div className="max-w-3xl mx-auto rounded-3xl bg-raised/85 border border-line p-6 sm:p-10 shadow-2xl backdrop-blur-md">
              <div className="max-w-xl mx-auto text-center mb-8">
                <span className="text-xs font-sans font-medium tracking-[0.18em] text-gold uppercase">
                  Free Property Evaluation
                </span>
                <h2 className="mt-1 font-heading text-fg heading-section">
                  Submit Property Details
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-fg-muted">
                  Fill out the form below. Our property acquisition team will review your apartment and reach out within 24 hours.
                </p>
              </div>

              {isSubmitted ? (
                <div className="p-8 rounded-2xl bg-raised/90 border border-line text-center space-y-4 animate-in fade-in">
                  <div className="w-14 h-14 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto border border-line-strong">
                    <BadgeCheck className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-normal text-fg">
                    Thank You! Your Inquiry Has Been Received.
                  </h3>
                  <p className="text-xs sm:text-sm text-fg-muted max-w-md mx-auto">
                    We have received your listing request and opened WhatsApp chat with our team. Our property team will review your apartment specifications.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-line text-gold bg-surface hover:bg-raised text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Submit Another Property
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="owner-full-name" className="block text-xs font-medium uppercase tracking-wider text-fg-muted mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        id="owner-full-name"
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        placeholder="e.g. Mohammed Farhan"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface/90 border border-line text-fg text-xs sm:text-sm placeholder-fg-faint focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="owner-phone" className="block text-xs font-medium uppercase tracking-wider text-fg-muted mb-1.5">
                        Contact Phone / WhatsApp *
                      </label>
                      <input
                        id="owner-phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+91 93464 13282"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface/90 border border-line text-fg text-xs sm:text-sm placeholder-fg-faint focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="owner-email" className="block text-xs font-medium uppercase tracking-wider text-fg-muted mb-1.5">
                        Email Address (Optional)
                      </label>
                      <input
                        id="owner-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="owner@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface/90 border border-line text-fg text-xs sm:text-sm placeholder-fg-faint focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="property-location" className="block text-xs font-medium uppercase tracking-wider text-fg-muted mb-1.5">
                        Property Location in Hyderabad *
                      </label>
                      <input
                        id="property-location"
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        placeholder="e.g. Barkas / Moghal Pura / Chandrayangutta"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface/90 border border-line text-fg text-xs sm:text-sm placeholder-fg-faint focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="property-size" className="block text-xs font-medium uppercase tracking-wider text-fg-muted mb-1.5">
                        Apartment Size / Configuration *
                      </label>
                      <select
                        id="property-size"
                        value={formData.flatType}
                        onChange={(e) =>
                          setFormData({ ...formData, flatType: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface/90 border border-line text-fg text-xs sm:text-sm focus:border-gold focus:outline-none transition-colors"
                      >
                        <option value="1bhk" className="bg-surface text-fg">1 BHK Furnished Flat</option>
                        <option value="2bhk" className="bg-surface text-fg">2 BHK Furnished Flat</option>
                        <option value="3bhk" className="bg-surface text-fg">3 BHK Furnished Flat</option>
                        <option value="4bhk" className="bg-surface text-fg">4 BHK Furnished Flat</option>
                        <option value="building" className="bg-surface text-fg">Full Apartment Building / Multiple Units</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="property-furnishing" className="block text-xs font-medium uppercase tracking-wider text-fg-muted mb-1.5">
                        Furnishing Status *
                      </label>
                      <select
                        id="property-furnishing"
                        value={formData.furnishingStatus}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            furnishingStatus: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface/90 border border-line text-fg text-xs sm:text-sm focus:border-gold focus:outline-none transition-colors"
                      >
                        <option value="fully-furnished" className="bg-surface text-fg">Fully Furnished (AC, Beds, Kitchen)</option>
                        <option value="semi-furnished" className="bg-surface text-fg">Semi-Furnished</option>
                        <option value="unfurnished" className="bg-surface text-fg">Unfurnished (Fit-out needed)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="property-details" className="block text-xs font-medium uppercase tracking-wider text-fg-muted mb-1.5">
                      Additional Details / Expected Rental Terms
                    </label>
                    <textarea
                      id="property-details"
                      rows={3}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Floor number, parking availability, elevator, expected rental range, etc."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface/90 border border-line text-fg text-xs sm:text-sm placeholder-fg-faint focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gold to-gold-deep hover:brightness-110 text-ink font-bold text-xs sm:text-sm transition-all shadow-md shadow-gold/15 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? "Submitting..." : "Submit Property & Connect on WhatsApp"}</span>
                    </button>

                    <a
                      href={partnerWhatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-line hover:border-gold text-gold bg-surface hover:bg-raised text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                    >
                      <span>Direct WhatsApp</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
