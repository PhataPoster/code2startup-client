import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Backend base URL (Express server).
const BACKEND = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");

// Methods that carry no body.
const NO_BODY = new Set(["GET", "HEAD"]);

// Only forward the headers the backend actually needs.
function pickForwardHeaders(incoming) {
  const out = {};
  const allow = ["content-type", "accept", "accept-language"];
  for (const k of allow) {
    const v = incoming.get(k);
    if (v) out[k] = v;
  }
  return out;
}

async function forward(req, { params }) {
  // 1. Authn gate — never proxy for an unauthenticated caller.
  const hdrs = await headers();
  let session = null;
  try {
    session = await auth.api.getSession({ headers: hdrs });
  } catch {
    session = null;
  }
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Build the upstream URL.
  const pathSegments = (params?.path || []).map(encodeURIComponent).join("/");
  const url = new URL(req.url);
  const upstream = `${BACKEND}/${pathSegments}${url.search}`;

  // 3. Mint (or reuse) the JWT for this user. The JWT carries role/isBlocked
  // so the Express backend can re-check authorization server-side.
  let token = "";
  try {
    const jwt = await auth.api.getToken({ headers: hdrs });
    token = jwt?.token || "";
  } catch {
    token = "";
  }
  if (!token) {
    return Response.json({ error: "Token unavailable" }, { status: 401 });
  }

  // 4. Assemble the forwarded request.
  const method = req.method.toUpperCase();
  const forwardHeaders = {
    ...pickForwardHeaders(req.headers),
    Authorization: `Bearer ${token}`,
  };

  const init = { method, headers: forwardHeaders };
  if (!NO_BODY.has(method) && req.body) {
    init.body = req.body;
    init.duplex = "half";
  }

  let upstreamRes;
  try {
    upstreamRes = await fetch(upstream, init);
  } catch (err) {
    return Response.json({ error: "Upstream fetch failed", detail: String(err) }, { status: 502 });
  }

  // 5. Stream the upstream response back verbatim.
  const respHeaders = new Headers();
  const ct = upstreamRes.headers.get("content-type");
  if (ct) respHeaders.set("content-type", ct);
  const cl = upstreamRes.headers.get("content-length");
  if (cl) respHeaders.set("content-length", cl);

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    headers: respHeaders,
  });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
export const OPTIONS = forward;