import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { uploadImage } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    const kind = String(form.get("kind") || "avatar");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Aucun fichier fourni." },
        { status: 400 }
      );
    }

    const folder = kind === "logo" ? "logos" : "avatars";
    const { url } = await uploadImage(file, folder);
    return NextResponse.json({ url });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Erreur lors de l'upload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
