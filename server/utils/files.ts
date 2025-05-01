import { writeFile as fsWriteFile } from "fs/promises";
import { join } from "path";

import { env } from "./env";

export async function writeFile(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = join(process.cwd(), "public", "uploads", fileName);

  await fsWriteFile(filePath, buffer);

  return `${env.SERVER_BASE_URL}/uploads/${fileName}`;
}
