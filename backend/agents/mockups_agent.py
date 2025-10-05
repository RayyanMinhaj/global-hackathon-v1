from pydantic_ai import Agent
from pydantic import BaseModel
import asyncio
import os
from config import Config

# Ensure API key is available
os.environ['OPENAI_API_KEY'] = Config.OPENAI_API_KEY

GENERATE_MOCKUPS_PROMPT = """
You are an expert UI/UX designer and frontend developer. Given a description of application screens/pages and optional design preferences, generate complete HTML/CSS mockups for each screen.

IMPORTANT (formatting rules):
- Return ONLY a JSON object containing screen mockups — DO NOT include markdown fences, explanatory text, or any other commentary. The frontend will parse the returned JSON directly.
- Each mockup should be complete HTML with embedded CSS (no external dependencies)
- All styling should be inline or in <style> tags within the HTML
- Design should be modern, clean, and professional
- No need for responsiveness - design for desktop/standard screen size
- Include realistic content and placeholder data

The JSON structure should be:
{
  "mockups": [
    {
      "screen_name": "Home",
      "description": "Landing page with hero section and features",
      "html_content": "<!DOCTYPE html>..."
    },
    {
      "screen_name": "Dashboard", 
      "description": "User dashboard with metrics and data",
      "html_content": "<!DOCTYPE html>..."
    }
  ],
  "design_summary": {
    "color_scheme": "Primary colors and theme used",
    "style": "Design approach and aesthetic",
    "components": "Key UI components included"
  }
}

Generate mockups that include:
1. Complete HTML structure with DOCTYPE
2. Embedded CSS with modern styling
3. Navigation elements
4. Realistic content and placeholders
5. Forms, buttons, and interactive elements (visually)
6. Cards, layouts, and modern UI patterns
7. Consistent color scheme and typography

Example screens to consider (generate based on description):
- Home/Landing page
- Dashboard/Admin panel
- User Profile
- Settings page
- Login/Register forms
- Product/Service pages
- About/Contact pages
"""

class MockupsInput(BaseModel):
    description: str
    design_preferences: str = ""
    screens: str = ""

class MockupsOutput(BaseModel):
    mockups_data: str
    design_summary: str

mockups_agent = Agent(
    'openai:gpt-4o',
    deps_type=MockupsInput,
    result_type=MockupsOutput,
    system_prompt=GENERATE_MOCKUPS_PROMPT,
)

async def generate_mockups(description: str, design_preferences: str = "", screens: str = "") -> dict:
    max_retries = 3
    last_error = None
    
    for attempt in range(max_retries):
        try:
            message = f"""
            Generate HTML/CSS screen mockups for the following application:

            Description: {description}
            Design Preferences: {design_preferences if design_preferences else 'Modern, clean, professional design'}
            Specific Screens: {screens if screens else 'Generate appropriate screens based on description'}

            Please return a JSON object with complete HTML mockups and design summary.
            """

            deps = MockupsInput(description=description, design_preferences=design_preferences, screens=screens)
            result = await mockups_agent.run(message, deps=deps)

            return {
                'mockups_data': result.data.mockups_data,
                'design_summary': result.data.design_summary
            }
        except Exception as e:
            last_error = e
            print(f"Attempt {attempt + 1} failed for mockups generation: {str(e)}")
            if attempt < max_retries - 1:
                print(f"Retrying... ({attempt + 2}/{max_retries})")
                await asyncio.sleep(1)  # Brief delay between retries
    
    print(f"All {max_retries} attempts failed for mockups generation: {str(last_error)}")
    return {
        'mockups_data': f"Error generating mockups after {max_retries} attempts: {str(last_error)}",
        'design_summary': f"Error after {max_retries} attempts: {str(last_error)}"
    }

def generate_mockups_sync(description: str, design_preferences: str = "", screens: str = "") -> dict:
    """
    Synchronous wrapper for generating screen mockups
    
    Args:
        description: Description of the application and its purpose
        design_preferences: Optional design style preferences and constraints
        screens: Optional specific screens to generate
    
    Returns:
        dict: Contains 'mockups_data' and 'design_summary'
    """
    return asyncio.run(generate_mockups(description, design_preferences, screens))
