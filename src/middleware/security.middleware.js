import aj from '#config/arcjet.js';
import logger from '#config/logger.js';
import { slidingWindow } from '@arcjet/node';

const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || 'guest';
    let limit = 5;

    // Simplified logic for setting the limit
    if (role === 'admin') limit = 20;
    else if (role === 'user') limit = 10;

    const client = aj.withRule(
      slidingWindow({
        mode: 'LIVE',
        interval: '1m',
        max: limit,
        name: `${role}-rate-limit`,
      })
    );

    const decision = await client.protect(req);

    if (decision.isDenied()) {
      if (decision.reason.isBot()) {
        logger.warn('Bot request blocked', {
          ip: req.ip,
          deniedReason: decision.reason, // Log the full reason object
        });
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Automated requests are not allowed',
        });
      }

      if (decision.reason.isShield()) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'request blocked by security policy',
        });
      }

      if (decision.reason.isRateLimit()) {
        return res.status(429).json({
          // Use 429 for Rate Limits
          error: 'Too Many Requests',
          message: 'Rate limit exceeded',
        });
      }
    }

    next();
  } catch (e) {
    // CRITICAL: Change this so you can see why it's failing!
    logger.error('Arcjet middleware error details:', e);
    res.status(500).json({
      error: 'Internal server error',
      message: e.message, // Temporarily show message to debug
    });
  }
};
export default securityMiddleware;
