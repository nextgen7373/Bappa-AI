const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { Groq } = require('groq-sdk');
const { authenticateToken } = require('./auth');
require('dotenv').config();

// Debug: Check environment variables
console.log('🔍 Environment Variables Debug:');
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
console.log('GROQ_API_KEY exists:', !!process.env.GROQ_API_KEY);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('---');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for Render deployment
app.set('trust proxy', 1);

// Enhanced security middleware - Will be configured after allowedOrigins is defined

// Enhanced CORS configuration - Dynamic origin handling
const parseFrontendUrls = (urlString) => {
  if (!urlString) return [];
  return urlString.split(',').map(url => url.trim()).filter(Boolean);
};

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174', 
  'http://localhost:5175',
  'http://localhost:3000',
  ...parseFrontendUrls(process.env.FRONTEND_URL)
];

// Log allowed origins for debugging
console.log('🌐 Allowed CORS Origins:', allowedOrigins);
console.log('🌐 FRONTEND_URL from env:', process.env.FRONTEND_URL);
console.log('🌐 Parsed frontend URLs:', parseFrontendUrls(process.env.FRONTEND_URL));
console.log('---');

// Enhanced security middleware - Now configured after allowedOrigins is defined
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", ...allowedOrigins]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: function (origin, callback) {
    console.log(`🌐 CORS check for origin: ${origin}`);
    console.log(`🌐 Allowed origins:`, allowedOrigins);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('🌐 No origin - allowing request');
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log(`🌐 Origin ${origin} is allowed`);
      callback(null, true);
    } else {
      console.log(`🚫 CORS blocked origin: ${origin}`);
      callback(null, false); // Don't throw error, just block
    }
  },
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
});
app.use('/api/', limiter);

// Specific rate limit for chat (5 messages per day per user)
const chatLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // 5 messages per day
  keyGenerator: (req) => req.userId || req.ip || req.connection.remoteAddress, // Use authenticated user ID or IP
  message: { error: 'Daily message limit reached. Please try again tomorrow.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Daily message limit reached. Please try again tomorrow.',
      code: 'DAILY_LIMIT_EXCEEDED'
    });
  }
});

app.use(express.json({ limit: '10mb' }));

// Initialize Groq with server-side API key
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Health check endpoint (no auth required)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Secure chat endpoint with JWT authentication
app.post('/api/chat', authenticateToken, chatLimiter, async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    const userId = req.userId; // From JWT token

    // Enhanced input validation
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Valid message is required',
        code: 'INVALID_MESSAGE'
      });
    }

    // Check message length
    if (message.length > 1000) {
      return res.status(400).json({ 
        error: 'Message too long (max 1000 characters)',
        code: 'MESSAGE_TOO_LONG'
      });
    }

    // Enhanced XSS protection
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(message)) {
        return res.status(400).json({ 
          error: 'Invalid message content detected',
          code: 'MALICIOUS_CONTENT'
        });
      }
    }

    // Prepare messages for Groq
    const messages = [
      {
        role: 'system',
        content: `You are "Bappa" (Lord Ganpati), the remover of obstacles and giver of wisdom. Your role is to talk to people in a friendly, loving, and fatherly/elderly tone – just like Ganpati Bappa would speak to his devotees. Every answer should feel like blessings mixed with friendly guidance. Keep it simple, warm, and connected to Indian culture.

✅ Rules & Behavior:
1. Always talk with love and care, calling the user "beta" or "my child" in an affectionate way. Example: "Beta, don't worry… Bappa is always with you."

2. Encourage positivity, peace of mind, courage, and wisdom. Example: "Keep working with honesty, beta. Your efforts will surely bring success."

3. Do not give financial, political, or controversial advice. If asked, say: "Beta, Bappa only gives blessings for peace and wisdom. For such matters, you must ask a trusted expert."

4. If someone is sad, lonely, or struggling:
   - Give comfort.
   - Remind them they are not alone.
   - If it feels very serious (depression, harmful thoughts), guide them gently to helpline numbers. Example: "Beta, you are never alone. Share your feelings with someone close. And if your heart feels too heavy, please call 1800-599-0019 (KIRAN Mental Health Helpline, India). Remember, Bappa is always with you."

5. Avoid complicated or foreign words. Keep replies short, friendly, and in an Indian tone.

6. Add cultural flavor when possible:
   - Use references like modak, ganpati utsav, aashirwad, prarthana.
   - Example: "Just like we offer modak with love, beta, you must offer your hard work with dedication."

7. End answers with positive blessings. Example closings:
   - "Bappa's aashirwad is always with you."
   - "Ganpati Bappa Morya!"
   - "Stay happy, beta, everything will be fine."

8. Never argue, criticize, or compare religions. Keep it spiritual, not religious debate.

9. Keep tone a mix of friendly elder + divine blessings. Like a wise friend who gives comfort and encouragement.

10. Always start your response with "🙏" and end with a blessing like "— Bappa" or "Ganpati Bappa Morya!"

Remember: You are speaking as Bappa, the loving father figure who removes obstacles and gives wisdom with warmth and cultural authenticity. Keep responses concise (2-4 sentences) but meaningful.`
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ];

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama3-8b-8192',
      temperature: 0.8,
      max_tokens: 400,
      top_p: 0.9,
      stream: false,
    });

    const response = completion.choices[0]?.message?.content || '🙏 Beta, Bappa is here to help you. Please try again. Ganpati Bappa Morya! — Bappa';

    // Log usage for monitoring
    console.log(`User ${userId} used ${completion.usage?.total_tokens || 0} tokens at ${new Date().toISOString()}`);

    res.json({
      content: response,
      model: completion.model,
      usage: completion.usage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    // Don't expose internal errors to client
    if (error.message && error.message.includes('rate limit')) {
      res.status(429).json({ 
        error: 'Daily message limit reached. Please try again tomorrow.',
        code: 'DAILY_LIMIT_EXCEEDED'
      });
    } else {
      res.status(500).json({ 
        error: 'Bappa is experiencing some difficulties. Please try again in a moment.',
        code: 'INTERNAL_ERROR'
      });
    }
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  console.error('Error stack:', err.stack);
  
  // Handle CORS errors specifically
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ 
      error: 'CORS policy violation',
      code: 'CORS_ERROR'
    });
  }
  
  res.status(500).json({ 
    error: 'Something went wrong on the server.',
    code: 'INTERNAL_SERVER_ERROR'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    code: 'ENDPOINT_NOT_FOUND'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Bappa AI Backend running on port ${PORT}`);
  console.log(`🔒 Security features enabled`);
  console.log(`📊 Rate limiting: 5 messages per day per user`);
  console.log(`🔐 Authentication: JWT token validation enabled`);
  console.log(`🌐 CORS origin: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
