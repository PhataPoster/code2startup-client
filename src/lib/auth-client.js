import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

/**
 * Browser-side Better Auth client.
 * - baseURL defaults to the current page origin so /api/auth/* works on Vercel/Render.
 * - jwtClient() exposes authClient.token() which we use to call our Express API.
 */
export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [jwtClient()],
});

export const { signIn, signUp, signOut, useSession, token } = authClient;