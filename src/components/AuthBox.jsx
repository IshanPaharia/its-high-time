import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function AuthBox({ ownerUuid }) {
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | sending | sent | error
  const [user, setUser] = useState(null);

  useEffect(() => {
    // initial
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    // listen for auth changes (handles magic link)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setPhase("idle");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function sendMagicLink(e) {
    e.preventDefault();
    if (!email) return;
    setPhase("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) {
      console.error(error.message);
      setPhase("error");
    } else {
      setPhase("sent");
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const isOwner = user?.id === ownerUuid;

  if (user) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-neutral-300">
          Signed in as <span className="font-medium">{user.email || user.id}</span>
        </div>
        <div
          className={`text-xs inline-flex items-center rounded-md px-2 py-1 ${
            isOwner
              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-600/30"
              : "bg-neutral-800 text-neutral-300 border border-neutral-700"
          }`}
        >
          {isOwner ? "Owner: write access" : "Viewer: read-only"}
        </div>
        <button
          onClick={signOut}
          className="w-full text-sm px-3 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={sendMagicLink} className="space-y-3">
      <label className="text-xs text-neutral-400">Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        required
      />
      <button
        type="submit"
        disabled={phase === "sending"}
        className="w-full text-sm px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-60"
      >
        {phase === "sending" ? "Sending..." : "Send magic link"}
      </button>
      {phase === "sent" && <div className="text-xs text-neutral-400">Check your email for the sign-in link.</div>}
      {phase === "error" && <div className="text-xs text-red-400">Couldn’t send email. Check console & Supabase Auth.</div>}
    </form>
  );
}
