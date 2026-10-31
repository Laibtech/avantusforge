export type SectionType =
  | "announcement"
  | "hero"
  | "text_image"
  | "rich_text"
  | "services_grid"
  | "portfolio_showcase"
  | "team_grid"
  | "testimonials"
  | "faq_accordion"
  | "statistics"
  | "logo_strip"
  | "process_steps"
  | "cta_banner"
  | "contact_form"
  | "blog_listing"
  | "custom";

export interface SectionButton {
  text: string;
  href: string;
  target?: "_self" | "_blank";
  variant?: "primary" | "secondary" | "outline" | "gold";
}

export interface SectionImage {
  url: string;
  alt?: string;
  caption?: string;
}

export interface SectionRepeatableItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  number?: string;
  icon?: string;
  linkText?: string;
  linkHref?: string;
  imageUrl?: string;
  imageAlt?: string;
  badge?: string;
  rating?: number;
  authorName?: string;
  authorRole?: string;
  authorCompany?: string;
  authorCountry?: string;
  deliverables?: string[];
  enabled?: boolean;
}

export interface CMSSection {
  id: string;
  type: SectionType;
  name: string;
  enabled: boolean;
  orderIndex?: number;
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  description?: string;
  bodyContent?: string; // Rich text / markdown / editorial
  primaryBtn?: SectionButton;
  secondaryBtn?: SectionButton;
  primaryImage?: SectionImage;
  secondaryImage?: SectionImage;
  bgStyle?: "default" | "white" | "burgundy" | "tint" | "bordered";
  contentWidth?: "standard" | "wide" | "narrow" | "center";
  items?: SectionRepeatableItem[];
  customSettings?: Record<string, any>;
}

export interface CMSPageData {
  id?: number;
  slug: string;
  title: string;
  route: string;
  seo_title: string;
  meta_description: string;
  og_image?: string;
  og_title?: string;
  og_description?: string;
  canonical_url?: string;
  robots_indexing?: string;
  schema_json?: string;
  status: "published" | "draft";
  sections: CMSSection[];
  draft_sections?: CMSSection[];
  updated_at?: string;
  updated_by?: string;
}

export interface CMSPageRevision {
  id: number;
  page_id?: number;
  slug: string;
  title: string;
  seo_title?: string;
  meta_description?: string;
  sections_json: string;
  status: string;
  created_by: string;
  created_at: string;
}
