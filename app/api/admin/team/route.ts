import { NextResponse } from "next/server";
import { getTeamMembers, saveTeamMember } from "@/lib/db";

export async function GET() {
  try {
    const team = await getTeamMembers();
    return NextResponse.json({ success: true, data: team });
  } catch (error) {
    console.error("[Admin Team GET Error]", error);
    return NextResponse.json({ success: false, message: "Failed to fetch team" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, title, role, bio, image_url, order_index, is_active, id, linkedin_url } = body;

    if (!name || !title || !role) {
      return NextResponse.json({ success: false, message: "Name, title, and role are required" }, { status: 400 });
    }

    const savedId = await saveTeamMember({
      id: id ? Number(id) : undefined,
      name,
      title,
      role,
      bio: bio || "",
      image_url: image_url || "/team/laiba-baig.jpg",
      order_index: order_index ? Number(order_index) : 0,
      is_active: is_active !== undefined ? Boolean(is_active) : true,
      linkedin_url: linkedin_url || "",
    });

    return NextResponse.json({ success: true, id: savedId });
  } catch (error) {
    console.error("[Admin Team POST Error]", error);
    return NextResponse.json({ success: false, message: "Failed to save team member" }, { status: 500 });
  }
}
