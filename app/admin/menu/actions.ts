'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { AssetFolder } from '@prisma/client';

export async function getMenuData() {
  const categories = await prisma.menuCategory.findMany({
    include: {
      items: {
        include: { asset: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });
  return categories;
}

export async function getMenuPhotos() {
  return prisma.asset.findMany({
    where: { folder: AssetFolder.MENU },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createCategory(name: string) {
  const max = await prisma.menuCategory.aggregate({ _max: { sortOrder: true } });
  const next = (max._max.sortOrder ?? 0) + 1;

  const cat = await prisma.menuCategory.create({
    data: { name: name.trim(), sortOrder: next, isVisible: true },
  });
  revalidatePath('/admin/menu');
  revalidatePath('/');
  return cat;
}

export async function updateCategory(id: string, name: string) {
  const cat = await prisma.menuCategory.update({
    where: { id },
    data: { name: name.trim() },
  });
  revalidatePath('/admin/menu');
  revalidatePath('/');
  return cat;
}

export async function deleteCategory(id: string) {
  await prisma.menuCategory.delete({ where: { id } });
  revalidatePath('/admin/menu');
  revalidatePath('/');
  return { success: true };
}

export async function toggleCategoryVisibility(id: string, isVisible: boolean) {
  const cat = await prisma.menuCategory.update({ where: { id }, data: { isVisible } });
  revalidatePath('/admin/menu');
  revalidatePath('/');
  return cat;
}

export async function createMenuItem(data: {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  assetId?: string;
}) {
  const max = await prisma.menuItem.aggregate({
    where: { categoryId: data.categoryId },
    _max: { sortOrder: true },
  });
  const next = (max._max.sortOrder ?? 0) + 1;

  const item = await prisma.menuItem.create({
    data: {
      categoryId: data.categoryId,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      price: data.price,
      assetId: data.assetId || null,
      sortOrder: next,
      isVisible: true,
    },
    include: { asset: true },
  });
  revalidatePath('/admin/menu');
  revalidatePath('/');
  return item;
}

export async function updateMenuItem(
  id: string,
  data: {
    name: string;
    description?: string;
    price: number;
    assetId?: string | null;
  }
) {
  const item = await prisma.menuItem.update({
    where: { id },
    data: {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      price: data.price,
      assetId: data.assetId || null,
    },
    include: { asset: true },
  });
  revalidatePath('/admin/menu');
  revalidatePath('/');
  return item;
}

export async function deleteMenuItem(id: string) {
  await prisma.menuItem.delete({ where: { id } });
  revalidatePath('/admin/menu');
  revalidatePath('/');
  return { success: true };
}

export async function toggleMenuItemVisibility(id: string, isVisible: boolean) {
  const item = await prisma.menuItem.update({ where: { id }, data: { isVisible } });
  revalidatePath('/admin/menu');
  revalidatePath('/');
  return item;
}

export async function reorderCategories(orderedIds: string[]) {
  const updates = orderedIds.map((id, idx) =>
    prisma.menuCategory.update({ where: { id }, data: { sortOrder: idx + 1 } })
  );
  await prisma.$transaction(updates);
  revalidatePath('/admin/menu');
  revalidatePath('/');
  return { success: true };
}

export async function reorderItemsInCategory(categoryId: string, orderedIds: string[]) {
  const updates = orderedIds.map((id, idx) =>
    prisma.menuItem.update({ where: { id }, data: { sortOrder: idx + 1 } })
  );
  await prisma.$transaction(updates);
  revalidatePath('/admin/menu');
  revalidatePath('/');
  return { success: true };
}
