import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { validateEvidenceFile } from "./validations";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "evidence");

const EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export interface StoredEvidence {
  readonly url: string;
  readonly size: number;
  readonly mimeType: string;
  readonly filename: string;
}

export async function saveEvidenceFile(file: File): Promise<StoredEvidence> {
  const validation = validateEvidenceFile({
    name: file.name,
    size: file.size,
    type: file.type,
  });

  if (!validation.valid) {
    throw new Error(validation.error || "File tidak valid");
  }

  const ext = EXTENSION_MAP[file.type] || "jpg";
  const uniqueFilename = `${crypto.randomUUID()}.${ext}`;
  const filePath = path.join(UPLOAD_DIR, uniqueFilename);

  await mkdir(UPLOAD_DIR, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await writeFile(filePath, buffer);

  return {
    url: `/uploads/evidence/${uniqueFilename}`,
    size: file.size,
    mimeType: file.type,
    filename: uniqueFilename,
  };
}

