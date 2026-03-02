import logger from '#config/logger.js';
import {
  getAllUsers,
  getUserById as getUserByIdService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
} from '#services/users.services.js';
import {
  userIdSchema,
  updateUserSchema,
} from '#validations/users.validation.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting users...');
    const allUsers = await getAllUsers();

    res.json({
      message: 'successfully retrieved users',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (e) {
    logger.error(e);
    next(e);
  }
};

export const fetchUserById = async (req, res, next) => {
  try {
    const { params } = userIdSchema.parse({ params: req.params });
    const { id } = params;

    logger.info(`Getting user ${id}...`);
    const user = await getUserByIdService(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User retrieved successfully', user });
  } catch (e) {
    logger.error(e);
    if (e.name === 'ZodError')
      return res.status(400).json({ errors: e.errors });
    next(e);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    const { params } = userIdSchema.parse({ params: req.params });
    const { body: updates } = updateUserSchema.parse({ body: req.body });
    const targetUserId = params.id;

    // Fallback in case auth middleware isn't wired up yet
    const requestingUser = req.user;
    if (!requestingUser) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: No user session found' });
    }

    // Auth Check: Must be the user themselves or an admin
    if (requestingUser.id !== targetUserId && requestingUser.role !== 'admin') {
      return res
        .status(403)
        .json({ message: 'Forbidden: You can only update your own profile' });
    }

    // Role change check: Only admins can change roles
    if (updates.role && requestingUser.role !== 'admin') {
      return res
        .status(403)
        .json({ message: 'Forbidden: Only admins can change roles' });
    }

    logger.info(`Updating user ${targetUserId}...`);
    const updatedUser = await updateUserService(targetUserId, updates);

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (e) {
    logger.error(e);
    if (e.message === 'User not found')
      return res.status(404).json({ message: e.message });
    if (e.name === 'ZodError')
      return res.status(400).json({ errors: e.errors });
    next(e);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    const { params } = userIdSchema.parse({ params: req.params });
    const { id } = params;

    const requestingUser = req.user;
    if (!requestingUser) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: No user session found' });
    }

    // Check if user is deleting themselves or is an admin
    if (requestingUser.id !== id && requestingUser.role !== 'admin') {
      return res
        .status(403)
        .json({ message: 'Forbidden: You can only delete your own profile' });
    }

    logger.info(`Deleting user ${id}...`);
    await deleteUserService(id);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (e) {
    logger.error(e);
    if (e.message === 'User not found')
      return res.status(404).json({ message: e.message });
    if (e.name === 'ZodError')
      return res.status(400).json({ errors: e.errors });
    next(e);
  }
};
