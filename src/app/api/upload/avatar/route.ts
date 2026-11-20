import { NextResponse } from "next/server";

const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";

export async function POST(request: Request) {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ message: "ImgBB API key is missing." }, { status: 500 });
  }

  const form = await request.formData();
  const file = form.get("image") as File | null;
  if (!file) {
    return NextResponse.json({ message: "No image file provided." }, { status: 400 });
  }

  const allowed = ["image/jpeg", "image/png"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ message: "Only JPG or PNG images are allowed." }, { status: 400 });
  }
  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json({ message: "Image must be 4MB or smaller." }, { status: 400 });
  }

  const fd = new FormData();
  fd.append("image", file);

  const res = await fetch(`${IMGBB_UPLOAD_URL}?key=${apiKey}`, {
    method: "POST",
    body: fd,
  });
  const json = (await res.json()) as {
    success?: boolean;
    data?: { display_url?: string; url?: string };
  };
  const url = json.data?.display_url ?? json.data?.url;
  if (!res.ok || !json.success || !url) {
    return NextResponse.json({ message: "Image upload failed." }, { status: 502 });
  }

  return NextResponse.json({ url });
}
