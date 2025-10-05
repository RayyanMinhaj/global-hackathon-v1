#!/usr/bin/env python3
"""
Test script for mockups agent
"""
import sys
import os
import json

# Add the backend directory to Python path
sys.path.append('/Users/macbookair/Desktop/Hackathon/global-hackathon-v1/backend')

from agents.mockups_agent import generate_mockups_sync

def test_mockups_agent():
    """Test the mockups agent with a simple description"""
    description = "A simple banking app with login, dashboard, and account management"
    design_preferences = "Modern, clean, blue and white theme"
    screens = "Login, Dashboard, Account Details"
    
    print("Testing mockups agent...")
    print(f"Description: {description}")
    print(f"Design preferences: {design_preferences}")
    print(f"Screens: {screens}")
    print("-" * 50)
    
    try:
        result = generate_mockups_sync(description, design_preferences, screens)
        print("Result received:")
        print(f"Type: {type(result)}")
        print(f"Keys: {result.keys() if isinstance(result, dict) else 'Not a dict'}")
        
        if 'mockups_data' in result:
            mockups_data = result['mockups_data']
            print(f"Mockups data type: {type(mockups_data)}")
            print(f"Mockups data (first 200 chars): {str(mockups_data)[:200]}...")
            
            # Try to parse as JSON if it's a string
            if isinstance(mockups_data, str):
                try:
                    parsed_data = json.loads(mockups_data)
                    print("Successfully parsed as JSON!")
                    print(f"Parsed data keys: {parsed_data.keys() if isinstance(parsed_data, dict) else 'Not a dict'}")
                    if 'mockups' in parsed_data:
                        print(f"Number of mockups: {len(parsed_data['mockups'])}")
                except json.JSONDecodeError as e:
                    print(f"Failed to parse as JSON: {e}")
            else:
                print("Mockups data is not a string")
        
        if 'design_summary' in result:
            design_summary = result['design_summary']
            print(f"Design summary type: {type(design_summary)}")
            print(f"Design summary: {design_summary}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_mockups_agent()