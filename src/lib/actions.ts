'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        f_name: true,
        l_name: true,
        email: true,
        role: true,
      }
    });
    return users;
  } catch (error) {
    throw new Error('Failed to fetch users');
  }
}

export async function createUser(formData: FormData) {
  const f_name = formData.get('f_name') as string;
  const l_name = formData.get('l_name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        f_name,
        l_name,
        email,
        password: hashedPassword,
        role,
      },
    });
    revalidatePath('/Adminhome');
    return { success: true, user };
  } catch (error) {
    return { success: false, error: 'Failed to create user' };
  }
}

export async function updateUser(id: string, formData: FormData) {
  const f_name = formData.get('f_name') as string;
  const l_name = formData.get('l_name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  try {
    const updateData: any = {
      f_name,
      l_name,
      email,
      role,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    revalidatePath('/Adminhome');
    return { success: true, user };
  } catch (error) {
    return { success: false, error: 'Failed to update user' };
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    });
    revalidatePath('/Adminhome');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete user' };
  }
}

export async function searchMembers(searchTerm: string) {
  try {
    if (!searchTerm) return [];
    
    const members = await prisma.fnmember.findMany({
      where: {
        OR: [
          { first_name: { contains: searchTerm, mode: 'insensitive' } },
          { last_name: { contains: searchTerm, mode: 'insensitive' } },
          { t_number: { contains: searchTerm, mode: 'insensitive' } },
          { contact_number: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        created: true,
        updated: true,
        birthdate: true,
        first_name: true,
        last_name: true,
        t_number: true,
        gender: true,
        o_r_status: true,
        house_number: true,
        community: true,
        contact_number: true,
        option: true,
        email: true,
      }
    });
    
    // Serialize dates before returning
    return members.map(member => ({
      ...member,
      created: member.created.toISOString(),
      updated: member.updated.toISOString(),
      birthdate: member.birthdate.toISOString(),
    }));
  } catch (error) {
    console.error('Search error:', error);
    throw new Error('Failed to search members');
  }
}

export async function getItems() {
  try {
    const items = await prisma.fnmember.findMany({
      select: {
        id: true,
        created: true,
        updated: true,
        birthdate: true,
        first_name: true,
        last_name: true,
        t_number: true,
        gender: true,
        o_r_status: true,
        house_number: true,
        community: true,
        contact_number: true,
        option: true,
        email: true,
      }
    });
    return items;
  } catch (error) {
    console.error('Error fetching items:', error);
    throw new Error('Failed to fetch items');
  }
}
