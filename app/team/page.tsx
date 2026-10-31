import React from "react";
import type { Metadata } from "next";
import { getPageBySlug, getPageMetadata } from "@/lib/cms-pages";
import { getTeamMembers } from "@/lib/db";
import SectionRenderer from "@/components/cms/SectionRenderer";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("team");
}

export default async function TeamPage(props: {
  searchParams?: Promise<{ preview?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const isPreview = searchParams.preview === "true";

  const [page, teamMembers] = await Promise.all([
    getPageBySlug("team", { preview: isPreview }),
    getTeamMembers(),
  ]);
  const sections = page?.sections || [];

  return (
    <div className="bg-[#FCFAF8] min-h-screen">
      {sections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          pageSlug="team"
          isDraft={isPreview}
          teamMembers={teamMembers}
        />
      ))}
    </div>
  );
}
