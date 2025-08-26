// Environment configuration and validation

interface EnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  backend: {
    url: string;
  };
  app: {
    environment: string;
    isProduction: boolean;
    isDevelopment: boolean;
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate environment variables
 */
export const validateEnvironment = (): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required environment variables
  const requiredVars = {
    'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL,
    'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY,
    'VITE_BACKEND_URL': import.meta.env.VITE_BACKEND_URL,
  };

  // Check for missing required variables
  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  });

  // Validate Supabase URL format
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
    warnings.push('VITE_SUPABASE_URL should use HTTPS in production');
  }

  // Validate Supabase anon key format (should be a JWT-like string)
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (supabaseKey && !supabaseKey.includes('.')) {
    warnings.push('VITE_SUPABASE_ANON_KEY format appears invalid');
  }

  // Validate backend URL
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  if (backendUrl) {
    try {
      new URL(backendUrl);
    } catch {
      errors.push('VITE_BACKEND_URL is not a valid URL');
    }
  }

  // Check for development vs production warnings
  const isProduction = import.meta.env.PROD;
  if (isProduction) {
    if (backendUrl?.includes('localhost')) {
      warnings.push('Backend URL points to localhost in production');
    }
    if (supabaseUrl?.includes('localhost')) {
      warnings.push('Supabase URL points to localhost in production');
    }
  } else {
    if (backendUrl?.includes('https://') && !backendUrl.includes('localhost')) {
      warnings.push('Using production backend URL in development');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Check environment and log results
 */
export const checkEnvironment = (): void => {
  const validation = validateEnvironment();
  
  if (validation.isValid) {
    console.log('✅ Environment validation passed');
    
    if (validation.warnings.length > 0) {
      console.warn('⚠️ Environment warnings:', validation.warnings);
    }
  } else {
    console.error('❌ Environment validation failed:', validation.errors);
    
    // In production, throw error to prevent app from starting
    if (import.meta.env.PROD) {
      throw new Error(`Environment validation failed: ${validation.errors.join(', ')}`);
    }
  }
};

/**
 * Get environment configuration
 */
export const getEnvironmentConfig = (): EnvironmentConfig => {
  const validation = validateEnvironment();
  
  if (!validation.isValid) {
    throw new Error(`Cannot get environment config: ${validation.errors.join(', ')}`);
  }

  return {
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL!,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY!,
    },
    backend: {
      url: import.meta.env.VITE_BACKEND_URL!,
    },
    app: {
      environment: import.meta.env.MODE || 'development',
      isProduction: import.meta.env.PROD,
      isDevelopment: import.meta.env.DEV,
    },
  };
};

/**
 * Check if all required services are available
 */
export const checkServicesHealth = async (): Promise<{
  supabase: boolean;
  backend: boolean;
}> => {
  const config = getEnvironmentConfig();
  
  try {
    // Check Supabase health
    const supabaseHealth = await fetch(`${config.supabase.url}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': config.supabase.anonKey,
        'Authorization': `Bearer ${config.supabase.anonKey}`
      }
    }).then(res => res.ok).catch(() => false);

    // Check backend health
    const backendHealth = await fetch(`${config.backend.url}/api/health`)
      .then(res => res.ok)
      .catch(() => false);

    return {
      supabase: supabaseHealth,
      backend: backendHealth
    };
  } catch (error) {
    console.error('Service health check failed:', error);
    return {
      supabase: false,
      backend: false
    };
  }
};

/**
 * Get environment-specific configuration
 */
export const getEnvironmentSpecificConfig = () => {
  const config = getEnvironmentConfig();
  
  if (config.app.isProduction) {
    return {
      logLevel: 'warn',
      enableDebug: false,
      enableAnalytics: true,
      enableErrorReporting: true,
      corsOrigin: config.backend.url,
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100
      }
    };
  }
  
  return {
    logLevel: 'debug',
    enableDebug: true,
    enableAnalytics: false,
    enableErrorReporting: false,
    corsOrigin: '*',
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000
    }
  };
};

// Export default config
export default getEnvironmentConfig;
