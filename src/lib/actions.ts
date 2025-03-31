'use server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { itemSchema, userSchema } from '@/lib/validation';
import { hash } from 'bcrypt';

export async function getItems() {
  try{
    return prisma.fnmember.findMany({ orderBy: { id: 'desc' } });
  }catch(e){
    console.log(e);
  }finally{
    await prisma.$disconnect();
  }
}

export async function searchMembers(searchTerm: string) {
  try {
    if (!searchTerm.trim()) {
      return [];
    }

    const members = await prisma.fnmember.findMany({
      where: {
        OR: [
          {
            first_name: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          {
            last_name: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          {
            t_number: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        ]
      },
      orderBy: {
        last_name: 'asc'
      }
    });

    return members;
  } catch (e) {
    console.error('Search error:', e);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

export async function getUsers() {
  try{
    return prisma.user.findMany({ orderBy: { id: 'desc' } });
  }catch(e){
    console.log(e);
  }finally{
    await prisma.$disconnect();
  }
}

export async function createUser(data: FormData) {
  const parsed = userSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) {
    throw new Error('Validation Error');
  }
  const { f_name, l_name, email, password, role } = parsed.data;

  try {
    const result = await prisma.user.create({
      data: {
        f_name,
        l_name,
        email,
        password,
        role,
      },
    });
    return result;
  } catch (e) {
    console.error('Error creating item:', e);
    throw new Error('Failed to create user');
  } finally {
    await prisma.$disconnect();
  }
}

export async function updateUser(id: string, data: FormData) {
  const parsed = userSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) {
    throw new Error('Validation Error');
  }
  const { f_name, l_name, email, password, role, } = parsed.data;
  const post = await prisma.user.findUnique({ where: { id } });
  if (!post) {
    throw new Error('User not found');
  }
  return prisma.user.update({ where: { id }, data: { f_name, l_name, email, password, role,  } });
}

export async function deleteUser(id: string): Promise<void> {
  const post = await prisma.user.findUnique({ where: { id } });
  if (!post) {
    throw new Error('User not found');
  }
  await prisma.user.delete({ where: { id } });
}