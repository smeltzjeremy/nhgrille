'use server';

import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';
import { AssetFolder } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';

const UPLOAD_BASE = join(process.cwd(), 'public', 'uploads');

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
}

export async function uploadPhotos(formData: FormData) {
  const files = formData.getAll('files') as File[];
  const folder = formData.get('folder') as AssetFolder;

  if (!files.length) {
    return { error: 'No files provided' };
  }
  if (!Object.values(AssetFolder).includes(folder)) {
    return { error: 'Invalid folder' };
  }

  const results = [];

  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      results.push({ error: `${file.name} is not an image` });
      continue;
    }

    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const base = sanitizeName(file.name.replace(/\.[^/.]+$/, ''));
      const filename = `${Date.now()}-${randomUUID().slice(0, 8)}-${base}.${ext}`;

      const folderDir = join(UPLOAD_BASE, folder.toLowerCase());
      await mkdir(folderDir, { recursive: true });

      const fullPath = join(folderDir, filename);
      await writeFile(fullPath, buffer);

      const publicPath = `/uploads/${folder.toLowerCase()}/${filename}`;

      const asset = await prisma.asset.create({
        data: {
          filename,
          original: file.name,
          folder,
          path: publicPath,
          size: file.size,
          mimeType: file.type,
        },
      });

      results.push({ success: true, asset });
    } catch (e) {
      console.error('Upload failed for', file.name, e);
      results.push({ error: `Failed to save ${file.name}` });
    }
  }

  revalidatePath('/admin/media');
  return { results };
}

export async function deleteAsset(id: string) {
  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset) return { error: 'Not found' };

  try {
    const fullPath = join(process.cwd(), 'public', asset.path);
    await unlink(fullPath).catch(() => {}); // ignore missing file
  } catch (e) {
    console.error('File delete error (non-fatal):', e);
  }

  await prisma.asset.delete({ where: { id } });
  revalidatePath('/admin/media');

  return { success: true };
}

export async function getAssets(folder?: AssetFolder) {
  return prisma.asset.findMany({
    where: folder ? { folder } : undefined,
    orderBy: { createdAt: 'desc' },
  });
}
