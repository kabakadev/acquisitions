import jwt from 'jsonwebtoken';

// Verifies JWT tokens from cookies and extracts user information
export const authenticateToken = (req, res, next) => {
  try {
    // Check cookies first, fallback to Authorization header if needed
    const token =
      req.cookies?.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user payload (id, role, etc.) to the request
    next();
  } catch (e) {
    return res
      .status(403)
      .json({ message: 'Forbidden: Invalid or expired token' });
  }
};

// Role-based access control middleware
export const requireRole = allowedRoles => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};
