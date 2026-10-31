import React from "react";
import type { Metadata } from "next";
import { getPageBySlug, getPageMetadata } from "@/lib/cms-pages";
import SectionRenderer from "@/components/cms/SectionRenderer";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("amazon-services");
}

export default async function AmazonServicesLandingPage(props: {
  searchParams?: Promise<{ preview?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const isPreview = searchParams.preview === "true";

  const page = await getPageBySlug("amazon-services", { preview: isPreview });
  const sections = page?.sections || [];

  return (
    <div className="bg-[#FCFAF8] min-h-screen">
      {sections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          pageSlug="amazon-services"
          isDraft={isPreview}
        />
      ))}
    </div>
  );
}
