"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "@/components/ui/Reveal";

const TESTIMONIALS = [
  {
    quote:
      "“AvantusForge built our Shopify store and helped us improve our online presence.”",
    name: "Shehzod Ghafoor",
    role: "Ecommerce Partner",
    initials: "SG",
  },
  {
    quote:
      "“They understood our vision and helped us create a clean, high-performing website.”",
    name: "Rashid Khan",
    role: "Business Director",
    initials: "RK",
  },
  {
    quote:
      "“Great communication and timely delivery. Highly recommended for businesses.”",
    name: "AB Raza",
    role: "Operations Lead",
    initials: "AR",
  },
];

const FAQS = [
  {
    id: "faq-1",
    question: "What type of businesses do you work with?",
    answer:
      "We work with startups, ecommerce brands, service businesses and established companies.",
  },
  {
    id: "faq-2",
    question: "Can you build custom business software?",
    answer:
      "Yes. We design and develop custom software around your specific business workflows.",
  },
  {
    id: "faq-3",
    question: "Do you work with international clients?",
    answer:
      "Yes, we work with businesses across multiple international markets.",
  },
  {
    id: "faq-4",
    question: "Do you provide website maintenance?",
    answer:
      "Yes. Maintenance and ongoing support can be included with projects.",
  },
  {
    id: "faq-5",
    question: "Can you manage Shopify stores after launch?",
    answer:
      "Yes. We can provide ongoing Shopify development and optimization.",
  },
];

export default function TestimonialsFAQSection() {
  const [openFaq, setOpenFaq] = useState<string | null>("faq-1");

  const toggleFaq = (id: string) => {
    setOpenFaq((prev) => (prev === id ? null : id));
  };

  return (
    <section id="insights" className="py-20 sm:py-24 bg-[#FCFAF8] border-b border-[#E8DDE0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-14 items-start">
          {/* Left Column: Testimonials */}
          <div>
            <Reveal>
              <div className="text-[10px] sm:text-xs font-extrabold tracking-[1.5px] uppercase text-[#750F2C] mb-3">
                Testimonials
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#191416] tracking-tight leading-tight mb-8">
                What Our <span className="text-[#750F2C]">Clients Say</span>
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {TESTIMONIALS.map((t, idx) => (
                <Reveal key={t.name} delay={0.1 * (idx + 1)}>
                  <div className="bg-white border border-[#E8DDE0] rounded-lg p-4 sm:p-5 flex flex-col justify-between h-full hover:border-[#750F2C]/40 transition-colors">
                    <p className="text-xs text-[#6F6568] leading-relaxed mb-4">
                      {t.quote}
                    </p>
                    <div className="flex items-center gap-2.5 pt-2 border-t border-[#F2E8EB]">
                      <div className="w-7 h-7 rounded-full bg-[#750F2C] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                        {t.initials}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-[#191416] truncate">
                          {t.name}
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Right Column: FAQ Accordion */}
          <div>
            <Reveal delay={0.15}>
              <div className="text-[10px] sm:text-xs font-extrabold tracking-[1.5px] uppercase text-[#750F2C] mb-3">
                FAQ
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#191416] tracking-tight leading-tight mb-8">
                Frequently <span className="text-[#750F2C]">Asked Questions</span>
              </h2>
            </Reveal>

            <div className="space-y-1">
              {FAQS.map((faq) => {
                const isOpen = openFaq === faq.id;

                return (
                  <div
                    key={faq.id}
                    className="border-b border-[#E8DDE0] py-3.5 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full flex items-center justify-between text-left cursor-pointer focus:outline-none focus-visible:text-[#750F2C] py-1"
                    >
                      <span className="text-xs sm:text-sm font-semibold text-[#191416] pr-4">
                        {faq.question}
                      </span>
                      <span className="text-sm font-bold text-[#750F2C] select-none flex-shrink-0">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <p className="pt-2 pb-1 text-xs text-[#6F6568] leading-relaxed">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
