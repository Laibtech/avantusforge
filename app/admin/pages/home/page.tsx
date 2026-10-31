import AdminPageDetailEditor from "../[slug]/page";

export default function AdminHomePageEditor() {
  return <AdminPageDetailEditor params={Promise.resolve({ slug: "home" })} />;
}
