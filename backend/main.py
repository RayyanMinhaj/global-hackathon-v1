from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import logging
from config import config
from agents.sample_agent import generate_erd_diagram_sync
from agents.sys_arch_agent import generate_system_architecture_sync

logger = logging.getLogger(__name__)

def create_app(config_name=None):
    """Application factory pattern"""
    
    # Create Flask app
    app = Flask(__name__)
    
    # Load configuration
    config_name = config_name or os.environ.get('FLASK_ENV', 'default')
    app.config.from_object(config[config_name])
    
    # Initialize CORS with dynamic origins
    CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "https://global-hackathon-v1-production.up.railway.app", "https://desirable-gentleness-production.up.railway.app", "http://localhost:5000"])
    
    # Configure basic logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Log app creation
    logger.info(f"Flask app created with config: {config_name}")
    
    # Basic routes
    @app.route('/')
    def home():
        """Home endpoint"""
        logger.info("Home endpoint accessed")
        return jsonify({
            'message': 'Welcome to the Flask Backend API',
            'status': 'success',
            'version': '1.0.0'
        })
    
    @app.route('/health')
    def health_check():
        """Health check endpoint"""
        logger.info("Health check endpoint accessed")
        return jsonify({
            'status': 'healthy',
            'message': 'Server is running',
            'timestamp': str(os.environ.get('FLASK_ENV', 'development'))
        })
    
    @app.route('/api/test')
    def test_endpoint():
        """Test endpoint for API functionality"""
        logger.info("Test endpoint accessed")
        
        # Log request details
        logger.debug(f"Request method: {request.method}")
        logger.debug(f"Request headers: {dict(request.headers)}")
        
        return jsonify({
            'message': 'API test successful',
            'method': request.method,
            'timestamp': str(os.environ.get('FLASK_ENV', 'development'))
        })
    
    @app.route('/api/echo', methods=['POST', 'GET'])
    def echo():
        """Echo endpoint that returns the request data"""
        logger.info("Echo endpoint accessed")
        
        try:
            data = request.get_json()
            logger.debug(f"Received data: {data}")
            
            return jsonify({
                'message': 'Echo successful',
                'received_data': data,
                'status': 'success'
            })
        except Exception as e:
            logger.error(f"Error in echo endpoint: {str(e)}")
            return jsonify({
                'message': 'Error processing request',
                'error': str(e),
                'status': 'error'
            }), 400
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        logger.warning(f"404 error: {request.url}")
        return jsonify({
            'message': 'Endpoint not found',
            'status': 'error',
            'code': 404
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"500 error: {str(error)}")
        return jsonify({
            'message': 'Internal server error',
            'status': 'error',
            'code': 500
        }), 500
    
    @app.route('/favicon.ico')
    def favicon():
        """Favicon endpoint to prevent 500 errors"""
        logger.debug("Favicon request received")
        return '', 204

    # endpoint for erd diagram generation
    @app.route('/api/generate_erd', methods=['POST'])
    def generate_erd():
        """Endpoint to generate ERD diagram"""
        try:
            data = request.get_json()
            if not data:
                return jsonify({
                    'error': 'No JSON data provided',
                    'status': 'error'
                }), 400
                
            table_definitions = data.get('table_definitions', [])
            if not table_definitions:
                return jsonify({
                    'error': 'No table_definitions provided',
                    'status': 'error'
                }), 400

            logger.info(f"Generating ERD for {len(table_definitions)} tables")
            erd_diagram = generate_erd_diagram_sync(table_definitions)
            
            return jsonify({
                'erd_diagram': erd_diagram,
                'status': 'success'
            })
        except Exception as e:
            logger.error(f"Error in generate_erd endpoint: {str(e)}")
            return jsonify({
                'error': str(e),
                'status': 'error'
            }), 500

    # endpoint for system architecture diagram generation
    @app.route('/api/generate_architecture', methods=['POST'])
    def generate_architecture():
        """Endpoint to generate system architecture diagram"""
        try:
            data = request.get_json()
            if not data:
                return jsonify({
                    'error': 'No JSON data provided',
                    'status': 'error'
                }), 400
                
            requirements = data.get('requirements', '')
            if not requirements:
                return jsonify({
                    'error': 'No requirements provided',
                    'status': 'error'
                }), 400

            # Optional parameters
            technology_stack = data.get('technology_stack', '')
            deployment_type = data.get('deployment_type', 'web')

            logger.info(f"Generating system architecture for: {requirements[:100]}...")
            result = generate_system_architecture_sync(requirements, technology_stack, deployment_type)
            
            return jsonify({
                'architecture_diagram': result['architecture_diagram'],
                'component_summary': result['component_summary'],
                'status': 'success'
            })
        except Exception as e:
            logger.error(f"Error in generate_architecture endpoint: {str(e)}")
            return jsonify({
                'error': str(e),
                'status': 'error'
            }), 500

    # Log successful app creation
    logger.info("Flask application created successfully")
    
    return app

  
# Create the app instance
app = create_app()

if __name__ == '__main__':
    logger.info("Starting Flask development server")
    
    # Get configuration
    config_class = config.get(os.environ.get('FLASK_ENV', 'default'))
    host = getattr(config_class, 'HOST', '127.0.0.1')
    port = getattr(config_class, 'PORT', 5000)
    debug = getattr(config_class, 'DEBUG', True)
    
    logger.info(f"Server starting on {host}:{port} (debug={debug})")
    
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))