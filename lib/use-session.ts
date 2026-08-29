"use client";
import { useEffect, useState } from "react";

export type SessionUser = { id: string; email: string; name: string; role: string };

export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((payload) => { if (!cancelled) setUser(payload.data); })
      .catch(() => { if (!cancelled) setUser(null); })
      .finally(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
  }, []);

  return { user, checking, setUser };
}
