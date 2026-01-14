"use client";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/auth/supabaseClient";

function getInitials(email?: string, name?: string) {
  if (name) {
    return name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return "?";
}

export default function UserStatus() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <div className="text-xs opacity-60">Not logged in</div>;

  const avatarUrl =
    user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

  const name = user.user_metadata?.full_name;
  const initials = getInitials(user.email, name);

  return (
    <div className="flex items-center gap-2 text-xs">
      {/* Avatar */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="avatar"
          className="h-6 w-6 rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-semibold text-gray-700">
          {initials}
        </div>
      )}

      <span className="opacity-70">{name ?? user.email}</span>

      <button className="underline" onClick={() => supabase.auth.signOut()}>
        Logout
      </button>
    </div>
  );
}
