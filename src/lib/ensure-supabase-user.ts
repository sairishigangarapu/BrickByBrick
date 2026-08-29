import type { User } from "@clerk/nextjs/server";

import { supabaseAdmin } from "./supabase";

type ClerkUser = User | null;

const VALID_ROLES = ["user", "admin", "investment_provider", "accredited_investor"] as const;
type ValidRole = typeof VALID_ROLES[number];

function coerceRole(value: unknown): ValidRole {
  if (typeof value === "string" && (VALID_ROLES as readonly string[]).includes(value)) {
    return value as ValidRole;
  }
  return "user";
}

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
      role: coerceRole(user.publicMetadata?.role),
    });

    if (insertError) {
      // Ignore duplicate key errors (race condition - user was created between check and insert)
      if (insertError.code === "23505") {
        return;
      }
      // Surface unexpected errors in dev so we notice them
      if (process.env.NODE_ENV !== "production") {
        console.error("[ensureSupabaseUser] insert error:", insertError.message);
      }
    }
  } catch (err) {
    // Sync failed
  }
}
