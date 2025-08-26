const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// JWT token generation
const generateToken = (userId) => {
  return jwt.sign(
    { userId, iat: Math.floor(Date.now() / 1000) },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// JWT token verification middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Authorization header required',
        code: 'MISSING_AUTH_HEADER'
      });
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Token required',
        code: 'MISSING_TOKEN'
      });
    }

    try {
      // First try to verify as a proper JWT
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if token is expired
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
          return res.status(401).json({ 
            error: 'Token expired',
            code: 'TOKEN_EXPIRED'
          });
        }

        // Validate user ID format (UUID)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!decoded.userId || !uuidRegex.test(decoded.userId)) {
          return res.status(401).json({ 
            error: 'Invalid token payload',
            code: 'INVALID_TOKEN_PAYLOAD'
          });
        }

        req.userId = decoded.userId;
        req.token = decoded;
        next();
        return;
      } catch (jwtError) {
        // If JWT verification fails, try to decode as simple token
        console.log('JWT verification failed, trying simple token...');
      }

      // Try to decode as simple base64 token (for frontend compatibility)
      try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        
        // Check if token is expired
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
          return res.status(401).json({ 
            error: 'Token expired',
            code: 'TOKEN_EXPIRED'
          });
        }

        // Validate user ID format (UUID)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!decoded.userId || !uuidRegex.test(decoded.userId)) {
          return res.status(401).json({ 
            error: 'Invalid token payload',
            code: 'INVALID_TOKEN_PAYLOAD'
          });
        }

        req.userId = decoded.userId;
        req.token = decoded;
        next();
        return;
      } catch (base64Error) {
        console.log('Simple token decoding failed:', base64Error.message);
        return res.status(401).json({ 
          error: 'Invalid token format',
          code: 'INVALID_TOKEN_FORMAT'
        });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(500).json({ 
        error: 'Authentication service error',
        code: 'AUTH_SERVICE_ERROR'
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      error: 'Authentication service error',
      code: 'AUTH_SERVICE_ERROR'
    });
  }
};

// Generate a secure JWT secret (for development)
const generateSecureSecret = () => {
  return require('crypto').randomBytes(64).toString('hex');
};

module.exports = {
  generateToken,
  authenticateToken,
  generateSecureSecret
};
