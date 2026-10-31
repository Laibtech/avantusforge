import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revokeCurrentSession } from "@/lib/auth";

export async function POST() {
  try {
    await revokeCurrentSession();
    const cookieStore = await cookies();
    cookieStore.delete("avantus_admin_session");

    return NextResponse.json({ success: true, message: "Logged out successfully." });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Logout failed" }, { status: 500 });
  }
}
