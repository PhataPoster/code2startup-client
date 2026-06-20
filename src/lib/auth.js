// server/src/config/auth.js
import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("code2startup");

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),

  emailAndPassword: { enabled: true },

  user: {
    fields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "collaborator",
        enum: ["founder", "collaborator", "admin"],
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (userData) => {
          const role = ["founder", "collaborator", "admin"].includes(userData.role)
            ? userData.role
            : "collaborator";

          return {
            data: {
              ...userData,
              role,
            },
          };
        },
      },
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },

  jwt: {
    claims: {
      role: (user) => user.role,
    },
  },

  cookies: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
});