import {
  fetchAllUsers,
  fetchUserById,
  updateUserById,
  deleteUserById,
} from '#controllers/users.controller.js';
import { authenticateToken, requireRole } from '#middleware/auth.middleware.js';
import express from 'express';

const router = express.Router();

// 1. Require authentication for ALL routes in this file
router.use(authenticateToken);

// 2. Define routes with specific role permissions applied
router.get('/', requireRole(['admin']), fetchAllUsers);
router.get('/:id', fetchUserById);
router.put('/:id', updateUserById); // Controller handles the "can only update self" logic
router.delete('/:id', requireRole(['admin']), deleteUserById);

export default router;
