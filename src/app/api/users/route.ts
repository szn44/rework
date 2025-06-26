import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userIds = searchParams.getAll("userIds");

    if (!userIds || !Array.isArray(userIds)) {
      return new NextResponse("Missing or invalid userIds", { status: 400 });
    }

    const supabase = await createClient();

    // Get user profiles from Supabase auth.users
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json([], { status: 200 }); // Return empty array on error
    }

    // Map the requested user IDs to user info
    const userInfos = userIds.map((userId) => {
      const user = users.users.find(u => u.id === userId);
      if (user) {
        return {
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown User',
          avatar: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`,
          color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Random color
        };
      }
      return null;
    }).filter(Boolean);

    return NextResponse.json(userInfos, { status: 200 });
  } catch (error) {
    console.error("Error in users API:", error);
    return NextResponse.json([], { status: 200 }); // Return empty array on error
  }
}
