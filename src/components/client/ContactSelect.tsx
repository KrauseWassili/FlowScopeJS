"use client";

import { Profile } from "@/lib/auth/profile";

type ContactSelectProps = {
  users: Profile[];
  value?: string;
  onChange: (userId: string) => void;
};

export default function ContactSelect({
  users,
  value,
  onChange,
}: ContactSelectProps) {
  return (
    <select
      className="border px-2 py-1 text-xs rounded"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="" disabled>
        Select user
      </option>

      {users.map((u) => (
        <option key={u.id} value={u.id}>
          {u.fullName ?? u.email}
        </option>
      ))}
    </select>
  );
}
