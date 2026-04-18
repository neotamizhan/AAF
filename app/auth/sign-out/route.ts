import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const supabase = getServerSupabase();

  await supabase.auth.signOut();

  return NextResponse.redirect(new URL("/", requestUrl.origin), {
    status: 303
  });
}
