import React from "react";
import type { Metadata } from "next";
import { getPageBySlug, getPageMetadata } from "@/lib/cms-pages";
import SectionRenderer from "@/components/cms/SectionRenderer";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("about");
}

export default async function AboutPage(props: {
  searchParams?: Promise<{ preview?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const isPreview = searchParams.preview === "true";

  const page = await getPageBySlug("about", { preview: isPreview });
  const sections = page?.sections || [];

  return (
    <div className="bg-[#FCFAF8] min-h-screen">
      {sections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          pageSlug="about"
          isDraft={isPreview}
        />
      ))}
    </div>
  );
}
