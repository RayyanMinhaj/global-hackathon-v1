#!/usr/bin/env python3
"""
Test script for SRS Agent - System Architecture Diagram Generation
"""

import requests
import json

def test_srs_agent():
    """Test the SRS agent endpoint"""
    
    # Test data
    test_data = {
        "requirements": """
        Build a modern e-commerce platform with the following requirements:
        
        1. User Management:
           - User registration and authentication
           - User profiles and preferences
           - Role-based access control (admin, customer, vendor)
        
        2. Product Management:
           - Product catalog with categories
           - Product search and filtering
           - Inventory management
           - Product reviews and ratings
        
        3. Shopping Features:
           - Shopping cart functionality
           - Wishlist management
           - Checkout process with multiple payment methods
           - Order tracking and history
        
        4. Vendor Management:
           - Vendor registration and approval
           - Product listing management
           - Sales analytics and reporting
        
        5. Admin Features:
           - Dashboard with analytics
           - User and vendor management
           - Order management
           - System configuration
        
        6. External Integrations:
           - Payment gateway integration
           - Email notification service
           - SMS notifications
           - Social media login
        """,
        "technology_stack": "React, Node.js, PostgreSQL, Redis, Docker, AWS",
        "deployment_type": "web"
    }
    
    # API endpoint
    url = "http://127.0.0.1:5000/api/generate_architecture"
    
    try:
        print("🚀 Testing SRS Agent...")
        print(f"📡 Sending request to: {url}")
        print(f"📋 Requirements: {test_data['requirements'][:100]}...")
        
        # Make the request
        response = requests.post(
            url,
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Success!")
            print(f"🏗️  Architecture Diagram Generated: {len(result.get('architecture_diagram', ''))} characters")
            print(f"📝 Component Summary: {len(result.get('component_summary', ''))} characters")
            
            # Save results to files
            with open('architecture_diagram.mmd', 'w') as f:
                f.write(result.get('architecture_diagram', ''))
            print("💾 Architecture diagram saved to: architecture_diagram.mmd")
            
            with open('component_summary.txt', 'w') as f:
                f.write(result.get('component_summary', ''))
            print("💾 Component summary saved to: component_summary.txt")
            
            # Display a preview
            print("\n" + "="*50)
            print("🏗️  ARCHITECTURE DIAGRAM PREVIEW:")
            print("="*50)
            print(result.get('architecture_diagram', '')[:500] + "...")
            
            print("\n" + "="*50)
            print("📝 COMPONENT SUMMARY PREVIEW:")
            print("="*50)
            print(result.get('component_summary', '')[:300] + "...")
            
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure the Flask server is running on http://127.0.0.1:5000")
    except requests.exceptions.Timeout:
        print("❌ Timeout Error: The request took too long")
    except Exception as e:
        print(f"❌ Unexpected Error: {str(e)}")

def test_minimal_requirements():
    """Test with minimal requirements"""
    
    minimal_data = {
        "requirements": "A simple blog application with user authentication, post creation, and comments.",
        "deployment_type": "web"
    }
    
    url = "http://127.0.0.1:5000/api/generate_architecture"
    
    try:
        print("\n🧪 Testing with minimal requirements...")
        
        response = requests.post(
            url,
            json=minimal_data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Minimal test successful!")
            print(f"🏗️  Generated diagram: {len(result.get('architecture_diagram', ''))} characters")
        else:
            print(f"❌ Minimal test failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Minimal test error: {str(e)}")

if __name__ == "__main__":
    print("🔬 SRS Agent Test Suite")
    print("=" * 50)
    
    # Test with full requirements
    test_srs_agent()
    
    # Test with minimal requirements
    test_minimal_requirements()
    
    print("\n" + "=" * 50)
    print("🏁 Test suite completed!")
    print("💡 Tip: View the generated .mmd file in Mermaid Live Editor: https://mermaid.live/")
