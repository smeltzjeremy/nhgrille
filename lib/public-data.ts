import { prisma } from './prisma';
import { AssetFolder } from '@prisma/client';

/**
 * Public data fetchers — only returns visible content, sorted correctly.
 * Used by the homepage and dedicated public pages.
 */

export async function getPublicBeers(limit?: number) {
  return prisma.beer.findMany({
    where: { isVisible: true },
    include: { asset: true },
    orderBy: { sortOrder: 'asc' },
    take: limit,
  });
}

export async function getPublicMenu() {
  const categories = await prisma.menuCategory.findMany({
    where: { isVisible: true },
    include: {
      items: {
        where: { isVisible: true },
        include: { asset: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });
  return categories.filter(c => c.items.length > 0);
}

export async function getCurrentSpecial() {
  return prisma.special.findFirst({
    where: { isVisible: true },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getSiteSettings() {
  const rows = await prisma.siteSetting.findMany();
  const map: Record<string, string> = {};
  rows.forEach(r => { map[r.key] = r.value; });
  return map;
}
