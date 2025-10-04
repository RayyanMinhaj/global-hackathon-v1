import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base configuration class"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    HOST = os.environ.get('FLASK_HOST', '0.0.0.0')
    PORT = int(os.environ.get('FLASK_PORT', 5000))
    
    # Environment type (dev/prod)
    ENVIRONMENT_TYPE = os.environ.get('ENVIRONMENT_TYPE', 'dev').lower()
    
    # Database configuration (if needed later)
    DATABASE_URL = os.environ.get('DATABASE_URL')
    
    # Server URLs based on environment
    BACKEND_URL_DEV = os.environ.get('BACKEND_URL_DEV', 'http://127.0.0.1:5000')
    FRONTEND_URL_DEV = os.environ.get('FRONTEND_URL_DEV', 'http://localhost:3000')
    BACKEND_URL_PROD = os.environ.get('BACKEND_URL_PROD', 'https://desirable-gentleness-production.up.railway.app')
    FRONTEND_URL_PROD = os.environ.get('FRONTEND_URL_PROD', 'https://global-hackathon-v1-production.up.railway.app')
    
    # Dynamic URL selection based on environment
    @property
    def BACKEND_URL(self):
        return self.BACKEND_URL_PROD if self.ENVIRONMENT_TYPE == 'prod' else self.BACKEND_URL_DEV
    
    @property
    def FRONTEND_URL(self):
        return self.FRONTEND_URL_PROD if self.ENVIRONMENT_TYPE == 'prod' else self.FRONTEND_URL_DEV
    
    # CORS configuration - dynamic based on environment
    @property
    def CORS_ORIGINS(self):
        cors_env = os.environ.get('CORS_ORIGINS')
        if cors_env:
            return cors_env.split(',')
        
        # Default CORS origins based on environment
        if self.ENVIRONMENT_TYPE == 'prod':
            return [self.FRONTEND_URL_PROD, 'http://localhost:5000', 'http://127.0.0.1:5000']
        else:
            return ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173']
    
    # Logging configuration
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FILE = os.environ.get('LOG_FILE', 'app.log')

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    LOG_LEVEL = 'DEBUG'

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    LOG_LEVEL = 'WARNING'

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True
    LOG_LEVEL = 'DEBUG'

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
