import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export interface UploadResult {
  url: string;
}

function s3Configured(): boolean {
  return Boolean(
    process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY
  );
}

/**
 * Upload an image to the configured object storage.
 *
 * When S3_* environment variables are set the file is stored in an
 * S3-compatible bucket. Otherwise it falls back to the local
 * `public/uploads` directory, which keeps local development dependency-free.
 */
export async function uploadImage(
  file: File,
  folder = "uploads"
): Promise<UploadResult> {
  if (!file || file.size === 0) {
    throw new Error("Aucun fichier fourni.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("Fichier trop volumineux (maximum 5 Mo).");
  }
  if (!ALLOWED_MIME.includes(file.type as (typeof ALLOWED_MIME)[number])) {
    throw new Error("Format non supporté (JPG, PNG, WEBP ou GIF).");
  }

  const extension = EXT_BY_MIME[file.type] ?? "bin";
  const key = `${folder}/${randomUUID()}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (s3Configured()) {
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const region = process.env.S3_REGION || "us-east-1";
    const endpoint = process.env.S3_ENDPOINT || undefined;
    const bucket = process.env.S3_BUCKET as string;

    const client = new S3Client({
      region,
      endpoint,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
      },
    });

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: bytes,
        ContentType: file.type,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    const base = (
      process.env.S3_PUBLIC_URL ||
      `${endpoint || `https://s3.${region}.amazonaws.com`}/${bucket}`
    ).replace(/\/$/, "");

    return { url: `${base}/${key}` };
  }

  const dir = path.join(process.cwd(), "public", folder);
  await mkdir(dir, { recursive: true });
  const filename = key.split("/").pop() as string;
  await writeFile(path.join(dir, filename), bytes);

  return { url: `/${folder}/${filename}` };
}
