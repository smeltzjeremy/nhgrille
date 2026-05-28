'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type SiteSettingKey =
  | 'hero_headline'
  | 'hero_subheadline'
  | 'hours_text'
  | 'address_text'
  | 'phone'
  | 'instagram_url'
  | 'facebook_url';

export async function getSettings() {
  const rows = await prisma.siteSetting.findMany();
  const map: Record<string, string> = {};
  rows.forEach(r => { map[r.key] = r.value; });
  return map;
}

export async function updateSetting(key: SiteSettingKey, value: string) {
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value: value.trim() },
    create: { key, value: value.trim() },
  });
  revalidatePath('/admin/settings');
  revalidatePath('/');
  return { success: true };
}

export async function updateMultipleSettings(updates: Record<SiteSettingKey, string>) {
  const ops = Object.entries(updates).map(([key, value]) =>
    prisma.siteSetting.upsert({
      where: { key },
      update: { value: (value as string).trim() },
      create: { key, value: (value as string).trim() },
    })
  );
  await prisma.$transaction(ops);
  revalidatePath('/admin/settings');
  revalidatePath('/');
  return { success: true };
}
