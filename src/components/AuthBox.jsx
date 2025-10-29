import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function AuthBox({ ownerUuid }) {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function sendMagicLink(e) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) alert(error.message);
    else alert("Check your email for the sign-in link.");
  }

  return user ? (
    <div className="flex items-center gap-2 text-sm text-neutral-300">
      <span>
        {user.email}
        {user.id === ownerUuid ? " (editor)" : " (read-only)"}
      </span>
      <button
        className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700"
        onClick={() => supabase.auth.signOut()}
      >
        Sign out
      </button>
    </div>
  ) : (
    <form onSubmit={sendMagicLink} className="flex items-center gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1"
      />
      <button className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500">
        Sign in
      </button>
    </form>
  );
}
