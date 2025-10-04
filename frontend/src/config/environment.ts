// Environment configuration utility
interface Config {
  environment: 'dev' | 'prod';
  backendUrl: string;
  frontendUrl: string;
  appName: string;
  appVersion: string;
}

// Get environment type from Vite environment variables
const getEnvironment = (): 'dev' | 'prod' => {
  const envType = import.meta.env.VITE_ENVIRONMENT_TYPE || 'dev';
  return envType.toLowerCase() as 'dev' | 'prod';
};

// Get backend URL based on environment
const getBackendUrl = (): string => {
  const environment = getEnvironment();
  
  if (environment === 'prod') {
    return import.meta.env.VITE_BACKEND_URL_PROD || 'https://desirable-gentleness-production.up.railway.app';
  } else {
    return import.meta.env.VITE_BACKEND_URL_DEV || 'http://127.0.0.1:5000';
  }
};

// Get frontend URL based on environment
const getFrontendUrl = (): string => {
  const environment = getEnvironment();
  
  if (environment === 'prod') {
    return import.meta.env.VITE_FRONTEND_URL_PROD || 'https://global-hackathon-v1-production.up.railway.app';
  } else {
    return import.meta.env.VITE_FRONTEND_URL_DEV || 'http://localhost:5173';
  }
};

// Main configuration object
export const config: Config = {
  environment: getEnvironment(),
  backendUrl: getBackendUrl(),
  frontendUrl: getFrontendUrl(),
  appName: import.meta.env.VITE_APP_NAME || 'Hackathon App',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
};

// Helper functions for easy access
export const isDevelopment = () => config.environment === 'dev';
export const isProduction = () => config.environment === 'prod';
export const getApiUrl = (endpoint: string = '') => `${config.backendUrl}${endpoint}`;

// Log configuration in development
if (isDevelopment()) {
  console.log('🔧 Frontend Configuration:', {
    environment: config.environment,
    backendUrl: config.backendUrl,
    frontendUrl: config.frontendUrl,
  });
}