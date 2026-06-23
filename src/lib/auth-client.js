import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

/**
 * Browser-side Better Auth client.
 * The `baseURL` defaults to the Next.js origin (the API route is mounted at /api/auth/*).
 * Add NEXT_PUBLIC_BETTER_AUTH_URL to override when client and server are on different hosts.
 */
export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [jwtClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;