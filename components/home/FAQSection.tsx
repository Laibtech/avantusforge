"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { Plus, Minus } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: "faq-1",
    question: "What type of businesses do you work with?",
    answer:
      "We partner with ambitious SMEs, growing ecommerce retailers, established mid-market companies, and scaling startups across the UK, USA, UAE, Kuwait, and Pakistan. Our clients value high engineering standards, operational longevity, and a technology partner that understands business strategy.",
  },
  {
    id: "faq-2",
    question: "Can you build custom business software?",
    answer:
      "Yes. A core pillar of AvantusForge is building custom software tailored precisely to your internal workflows. Whether you need internal operational portals, bespoke ERP/CRM modules, automated vendor dispatch boards, or specialized database architectures, we build secure, maintainable software from the ground up.",
  },
  {
    id: "faq-3",
    question: "Do you work with international clients?",
    answer:
      "Absolutely. We routinely operate across multiple time zones including the UK (GMT), North America (EST/PST), GCC (Gulf Standard Time), and South Asia (PKT). We utilize async workflows, structured sprint planning, and dedicated Slack/Teams communication channels to keep all stakeholders fully aligned.",
  },
  {
    id: "faq-4",
    question: "Do you provide website maintenance?",
    answer:
      "Yes. We offer long-term maintenance, uptime monitoring, security patching, and ongoing performance tuning. We treat launch day as day one of our collaboration, ensuring your systems remain fast, secure, and compatible with emerging browser and operating system standards.",
  },
  {
    id: "faq-5",
    question: "Can you build Shopify stores?",
    answer:
      "Yes, we build custom Shopify and Shopify Plus stores. Rather than relying on rigid bloated themes, we craft custom, high-converting Liquid themes, headless Shopify storefronts, bespoke checkout apps, and automated inventory sync integrations.",
  },
  {
    id: "faq-6",
    question: "Do you provide SEO and digital marketing?",
    answer:
      "Yes. Our digital growth team complements engineering with technical SEO, page-speed optimization, paid acquisition management (search and social), and conversion rate optimization (CRO) to ensure your digital platform generates measurable business returns.",
  },
  {
    id: "faq-7",
    question: "How does a project start?",
    answer:
      "We begin with a thorough technical and operational discovery session to understand your business objectives and current hurdles. Following this, we supply a detailed technical scope, architectural diagram, and phased milestone timeline. Once approved, development kicks off with structured bi-weekly demos.",
  },
];

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>("faq-1");

  const toggleFAQ = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="bg-white py-20 sm:py-28 border-b border-[#E8DDE0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="FAQ"
            title="Questions?"
            accentTitle="Let's make it simple."
            description="Clear answers about our development process, tech stack, and partnership models."
            align="center"
          />
        </Reveal>

        <div className="mt-8 space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openId === faq.id;

            return (
              <Reveal key={faq.id} delay={0.06 * (index + 1)}>
                <div
                  className={`rounded-xl border transition-colors duration-200 overflow-hidden ${
                    isOpen
                      ? "border-[#750F2C]/60 bg-[#FCFAF8] shadow-xs"
                      : "border-[#E8DDE0] bg-white hover:border-[#750F2C]/30"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFAQ(faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${faq.id}`}
                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#750F2C]"
                  >
                    <span className="text-base sm:text-lg font-bold text-[#191416] pr-4">
                      {faq.question}
                    </span>
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
                        isOpen
                          ? "bg-[#750F2C] text-white"
                          : "bg-[#F7EEF1] text-[#750F2C]"
                      }`}
                    >
                      {isOpen ? (
                        <Minus className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-answer-${faq.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: "easeInOut" }}
                      >
                        <div className="px-5 sm:px-6 pb-6 pt-1 text-sm sm:text-base text-[#6F6568] leading-relaxed border-t border-[#E8DDE0]/50">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
