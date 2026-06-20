// Minimal client-side helper to upload images to imgbb (optional)
// If `NEXT_PUBLIC_IMGBB_KEY` is not set, the function resolves to an empty string.
export async function uploadToImgbb(file) {
  const key = process.env.NEXT_PUBLIC_IMGBB_KEY;
  if (!key) return "";

  const form = new FormData();
  form.append("image", file);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
    method: "POST",
    body: form,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Upload failed");
  return data.data?.url || "";
}