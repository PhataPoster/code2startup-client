"use client";

import { useEffect, useState } from "react";
import { authClient } from "./auth-client";

/**
 * useSession — client hook that returns `{ user, loading, error, refresh }`.
 * Uses Better Auth's `useSession` under the hood if available, otherwise
 * falls back to a one-shot fetch via `getSession`.
 */
export function useSession() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authClient.getSession();
      const next = res?.data?.user ?? null;
      // Treat blocked accounts as signed-out: drop the cached user, clear
      // local storage, and let the layout redirect to /login. This stops
      // already-logged-in blocked users from continuing to interact with
      // the app via the cached client session.
      if (next?.isBlocked) {
        try {
          localStorage.removeItem("code2startup_token");
        } catch {
          /* ignore */
        }
        await authClient.signOut().catch(() => null);
        setUser(null);
        return;
      }
      setUser(next);
    } catch (err) {
      setError(err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, loading, error, refresh };
}