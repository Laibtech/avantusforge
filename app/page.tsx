import React from "react";
import type { Metadata } from "next";
import { getPageBySlug, getPageMetadata } from "@/lib/cms-pages";
import SectionRenderer from "@/components/cms/SectionRenderer";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("home");
}

export default async function HomePage(props: {
  searchParams?: Promise<{ preview?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const isPreview = searchParams.preview === "true";

  const page = await getPageBySlug("home", { preview: isPreview });
  const sections = page?.sections || [];

  return (
    <main className="min-h-screen">
      {sections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          pageSlug="home"
          isDraft={isPreview}
        />
      ))}
    </main>
  );
}
