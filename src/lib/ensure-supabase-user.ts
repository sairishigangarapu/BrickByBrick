import type { User } from "@clerk/nextjs/server";

import { supabaseAdmin } from "./supabase";

type ClerkUser = User | null;

const buildFullName = (user: User): string | null => {
  if (user.fullName) return user.fullName;
  const parts = [user.firstName, user.lastName].filter(Boolean) as string[];
  if (parts.length === 0) return null;
  return parts.join(" ");
};

export async function ensureSupabaseUser(user: ClerkUser) {
  if (!user) return;

  try {
    const { data: existing, error: lookupError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("clerk_id", user.id)
      .maybeSingle();

    if (lookupError) {
      return;
    }

    if (existing) return;

    const email =
      user.primaryEmailAddress?.emailAddress ??
      user.emailAddresses?.[0]?.emailAddress ??
      null;

    if (!email) {
      return;
    }

    const { error: insertError } = await supabaseAdmin.from("users").insert({
      clerk_id: user.id,
      email,
      full_name: buildFullName(user),
      avatar_url: user.imageUrl,
      role: typeof user.publicMetadata?.role === "string" ? (user.publicMetadata.role as string) : "student",
    });

    if (insertError) {
      // Ignore duplicate key errors (race condition - user was created between check and insert)
      if (insertError.code === '23505') {
        return;
      }
    }
  } catch (err) {
    // Sync failed
  }
}
