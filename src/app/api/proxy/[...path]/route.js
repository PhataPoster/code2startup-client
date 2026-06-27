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
  // 1. Build the upstream URL first — public reads (featured-*, filters/*)
  //    don't need any auth.
  // In Next.js 16 both `headers()` and route `params` are async — must await.
  const hdrs = await headers();
  const { path: rawPath } = await params;
  const pathSegments = (rawPath || []).map(encodeURIComponent).join("/");
  const url = new URL(req.url);
  const upstream = `${BACKEND}/${pathSegments}${url.search}`;

  // 2. Read the session if one exists. We don't gate on it — public browse
  //    pages need to fetch featured startups / opportunities / filters
  //    without being signed in. The Express backend is the authority on
  //    who is allowed to read what; we just forward whatever session we
  //    can find and attach the JWT if there is one.
  let token = "";
  try {
    const session = await auth.api.getSession({ headers: hdrs });
    if (session?.user) {
      const jwt = await auth.api.getToken({ headers: hdrs });
      token = jwt?.token || "";
    }
  } catch {
    // No session / cookie invalid — proceed anonymously. The upstream will
    // reject with 401/403 if the endpoint actually requires auth.
  }

  // 3. Assemble the forwarded request.
  const method = req.method.toUpperCase();
  const forwardHeaders = {
    ...pickForwardHeaders(req.headers),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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