const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";

export async function uploadToImgbb(file: File): Promise<string> {
  if (!IMGBB_API_KEY) {
    throw new Error(
      "imgbb API key is missing. Add NEXT_PUBLIC_IMGBB_API_KEY to .env.local."
    );
  }

  const form = new FormData();
  form.append("image", file);

  const res = await fetch(`${IMGBB_UPLOAD_URL}?key=${IMGBB_API_KEY}`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error("Image upload failed. Please try again.");
  }

  const json = (await res.json()) as {
    success?: boolean;
    data?: { display_url?: string; url?: string };
  };

  const url = json.data?.display_url ?? json.data?.url;
  if (!json.success || !url) {
    throw new Error("Image upload failed. Please try again.");
  }

  return url;
}
