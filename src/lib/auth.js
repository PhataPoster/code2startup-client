// code2startup/src/lib/auth.js
// Better Auth server configuration for StartupForge.
// Uses MongoDB adapter, email+password, optional Google social login,
// and the JWT plugin so role claim is available in the cookie token.

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || "code2startup";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set. Add it to .env.local before running.");
}

// One shared client for both Better Auth and any future server queries.
const client = new MongoClient(MONGODB_URI);
const db = client.db(DB_NAME);

export const auth = betterAuth({
  appName: "StartupForge",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,

  // Better Auth MongoDB adapter accepts the connected `db` instance.
  database: mongodbAdapter(db),

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 6,
  },

  // Additional fields are persisted on the Better Auth `user` collection.
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "collaborator",
        returned: true,
        input: true,
      },
      isBlocked: {
        type: "boolean",
        required: false,
        defaultValue: false,
        returned: true,
        input: false,
      },
    },
  },

  // Force role on user creation to one of the allowed values.
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const role = ["founder", "collaborator", "admin"].includes(user.role)
            ? user.role
            : "collaborator";
          return { data: { ...user, role } };
        },
      },
    },
  },

  // Google OAuth — only enabled when keys are present so local dev without keys still works.
  socialProviders:
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : undefined,

  // JWT plugin lets us mint tokens with role for the Express server to verify.
  plugins: [
    jwt({
      claims: {
        role: (user) => user.role,
        isBlocked: (user) => user.isBlocked,
      },
    }),
  ],

  // Cookie/session config lives under `advanced` in Better Auth v1.x.
  advanced: {
    cookies: {
      session_token: {
        attributes: {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        },
      },
    },
    crossSubDomainCookies: { enabled: false },
  },

  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
  ],
});