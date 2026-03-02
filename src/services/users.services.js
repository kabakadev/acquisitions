import { db } from '#config/database.js';
import logger from '#config/logger.js';
import { users } from '#models/user.model.js';
import { eq, and, ne } from 'drizzle-orm';

export const getAllUsers = async () => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users);

    return allUsers;
  } catch (e) {
    logger.error('Error getting users', e);
    throw e;
  }
};

export const getUserById = async id => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, id));

    return user || null;
  } catch (e) {
    logger.error(`Error getting user by id ${id}`, e);
    throw e;
  }
};

export const updateUser = async (id, updates) => {
  try {
    // NEW: Email uniqueness validation
    if (updates.email) {
      const [existingUser] = await db
        .select()
        .from(users)
        .where(and(eq(users.email, updates.email), ne(users.id, id)));

      if (existingUser) {
        throw new Error('Email already in use');
      }
    }

    const updatePayload = {
      ...updates,
      updated_at: new Date(),
    };

    const [updatedUser] = await db
      .update(users)
      .set(updatePayload)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        updated_at: users.updated_at,
      });

    if (!updatedUser) {
      throw new Error('User not found');
    }
    return updatedUser;
  } catch (e) {
    logger.error(`Error updating user ${id}`, e);
    throw e; // Preserving the original throw e as specified in the screenshot
  }
};

export const deleteUser = async id => {
  try {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (!deletedUser) {
      throw new Error('User not found');
    }
    return true;
  } catch (e) {
    logger.error(`Error deleting user ${id}`, e);
    throw e;
  }
};
