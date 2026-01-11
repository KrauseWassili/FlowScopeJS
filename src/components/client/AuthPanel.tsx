"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPanel() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInGoogle = async () => {
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      // options: { redirectTo: `${location.origin}/` }, // обычно не нужно
    });
    if (error) setError(error.message);
    setBusy(false);
  };

  const submit = async () => {
    setBusy(true);
    setError(null);

    const { error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (error) setError(error.message);
    setBusy(false);
  };

  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Login / Registration</div>
        <button
          className="text-xs underline disabled:opacity-50"
          disabled={busy}
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "Create account" : "Have an account? Login"}
        </button>
      </div>

      <button
        className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
        disabled={busy}
        onClick={signInGoogle}
      >
        Continue with Google
      </button>

      <div className="text-xs opacity-60">or</div>

      <input
        className="rounded-md border px-3 py-2 text-sm"
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={busy}
      />
      <input
        className="rounded-md border px-3 py-2 text-sm"
        placeholder="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={busy}
      />

      <button
        className="rounded-md bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
        disabled={busy || !email || !password}
        onClick={submit}
      >
        {mode === "login" ? "Login" : "Register"}
      </button>

      {error && <div className="text-xs text-red-600">{error}</div>}
    </div>
  );
}
