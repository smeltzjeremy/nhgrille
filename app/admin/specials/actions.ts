'use server';

import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';

const SPECIALS_DIR = join(process.cwd(), 'public', 'uploads', 'specials');

export async function getSpecials() {
  // Return the most recent / active special (we'll treat the latest as "current")
  return prisma.special.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 5,
  });
}

export async function uploadSpecialsPdf(formData: FormData) {
  const file = formData.get('file') as File;
  const title = (formData.get('title') as string) || 'Daily Specials';

  if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
    return { error: 'Please upload a PDF file' };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await mkdir(SPECIALS_DIR, { recursive: true });

  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}-specials.pdf`;
  const fullPath = join(SPECIALS_DIR, filename);
  await writeFile(fullPath, buffer);

  const publicPath = `/uploads/specials/${filename}`;

  // Create or update the "current" special record.
  // For simplicity we create a new one each time they upload a fresh sheet.
  // The newest one with isVisible=true is considered live.
  const special = await prisma.special.create({
    data: {
      title: title.trim(),
      pdfPath: publicPath,
      isVisible: true,
    },
  });

  revalidatePath('/admin/specials');
  revalidatePath('/');
  return { success: true, special };
}

export async function toggleSpecialVisibility(id: string, isVisible: boolean) {
  const updated = await prisma.special.update({
    where: { id },
    data: { isVisible },
  });
  revalidatePath('/admin/specials');
  revalidatePath('/');
  return updated;
}

export async function deleteSpecial(id: string) {
  const special = await prisma.special.findUnique({ where: { id } });
  if (special?.pdfPath) {
    const full = join(process.cwd(), 'public', special.pdfPath);
    await unlink(full).catch(() => {});
  }
  await prisma.special.delete({ where: { id } });
  revalidatePath('/admin/specials');
  revalidatePath('/');
  return { success: true };
}

export async function updateSpecialTitle(id: string, title: string) {
  const updated = await prisma.special.update({
    where: { id },
    data: { title: title.trim() },
  });
  revalidatePath('/admin/specials');
  revalidatePath('/');
  return updated;
}
