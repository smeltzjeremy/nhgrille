'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { AssetFolder } from '@prisma/client';

export async function getBeers() {
  return prisma.beer.findMany({
    include: { asset: true },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function getBeerPhotos() {
  // Only photos from the BEERS folder for easy selection
  return prisma.asset.findMany({
    where: { folder: AssetFolder.BEERS },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createBeer(data: {
  name: string;
  type: string;
  price: number;
  description?: string;
  abv?: number;
  assetId?: string;
}) {
  const maxSort = await prisma.beer.aggregate({
    _max: { sortOrder: true },
  });
  const nextSort = (maxSort._max.sortOrder ?? 0) + 1;

  const beer = await prisma.beer.create({
    data: {
      name: data.name,
      type: data.type,
      price: data.price,
      description: data.description || null,
      abv: data.abv || null,
      assetId: data.assetId || null,
      sortOrder: nextSort,
      isVisible: true,
    },
    include: { asset: true },
  });

  revalidatePath('/admin/beers');
  revalidatePath('/');
  return beer;
}

export async function updateBeer(
  id: string,
  data: {
    name: string;
    type: string;
    price: number;
    description?: string;
    abv?: number;
    assetId?: string | null;
  }
) {
  const beer = await prisma.beer.update({
    where: { id },
    data: {
      name: data.name,
      type: data.type,
      price: data.price,
      description: data.description || null,
      abv: data.abv || null,
      assetId: data.assetId || null,
    },
    include: { asset: true },
  });

  revalidatePath('/admin/beers');
  revalidatePath('/');
  return beer;
}

export async function deleteBeer(id: string) {
  await prisma.beer.delete({ where: { id } });
  revalidatePath('/admin/beers');
  revalidatePath('/');
  return { success: true };
}

export async function toggleBeerVisibility(id: string, isVisible: boolean) {
  const beer = await prisma.beer.update({
    where: { id },
    data: { isVisible },
  });
  revalidatePath('/admin/beers');
  revalidatePath('/');
  return beer;
}

export async function reorderBeers(orderedIds: string[]) {
  // Update sortOrder based on array position (1-based for simplicity)
  const updates = orderedIds.map((id, index) =>
    prisma.beer.update({
      where: { id },
      data: { sortOrder: index + 1 },
    })
  );

  await prisma.$transaction(updates);
  revalidatePath('/admin/beers');
  revalidatePath('/');
  return { success: true };
}
