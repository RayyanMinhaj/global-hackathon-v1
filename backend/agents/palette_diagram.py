from pydantic_ai import Agent
from pydantic import BaseModel
import asyncio
import os
import json
from config import Config

# Ensure API key is available
os.environ['OPENAI_API_KEY'] = Config.OPENAI_API_KEY

GENERATE_PALETTE_PROMPT = """
You are an expert UX/UI designer and colorist. Given a short description of an application and optional style hints (tone, audience, brand), recommend a concise color palette (3-6 hex colors) that suits the product.

IMPORTANT (formatting rules):
- Return ONLY the Mermaid flowchart string (no markdown fences or commentary). The frontend will render the returned Mermaid string directly.
- Also include a JSON object named "color_summary" mapping role -> hex and a short justification. Return this JSON after the Mermaid string.

Produce a Mermaid flowchart that lays out colored boxes horizontally — one box per color — each labeled with the hex code and a short role (e.g., Primary, Accent, Background).

Do NOT ask the user for hex values; infer/recommend them from the description and hints.

Example output (exact format expected):

flowchart TD
    A["Primary (#1E3A8A)"] --> B["Secondary (#D97706)"] --> C["Accent (#059669)"] --> D["Background (#D1D5DB)"] --> E["Alert (#E11D48)"]

    style A fill:#1E3A8A,stroke:#333,stroke-width:2px,color:#fff
    style B fill:#D97706,stroke:#333,stroke-width:2px,color:#fff
    style C fill:#059669,stroke:#333,stroke-width:2px,color:#fff
    style D fill:#D1D5DB,stroke:#333,stroke-width:2px,color:#000
    style E fill:#E11D48,stroke:#333,stroke-width:2px,color:#fff

color_summary:
{
    "Primary": "#1E3A8A - Brand primary, high contrast",
    "Secondary": "#D97706 - Warm accent",
    "Accent": "#059669 - Success/positive actions",
    "Background": "#D1D5DB - Neutral background",
    "Alert": "#E11D48 - Error/alert color"
}
"""

class PaletteInput(BaseModel):
    description: str
    style_hints: str = ""

class PaletteOutput(BaseModel):
    palette_diagram: str
    color_summary: str

palette_agent = Agent(
    'openai:gpt-4o',
    deps_type=PaletteInput,
    result_type=PaletteOutput,
    system_prompt=GENERATE_PALETTE_PROMPT,
)

async def generate_palette(description: str, style_hints: str = "") -> dict:
    max_retries = 3
    last_error = None
    
    for attempt in range(max_retries):
        try:
            message = f"""
            Recommend a color palette and return a Mermaid flowchart for these inputs:

            Description: {description}
            Style hints: {style_hints}

            Please return a Mermaid flowchart (horizontal boxes) and a JSON color summary mapping roles to hex colors and short justifications.
            """

            deps = PaletteInput(description=description, style_hints=style_hints)
            result = await palette_agent.run(message, deps=deps)

            return {
                'palette_diagram': result.data.palette_diagram,
                'color_summary': result.data.color_summary
            }
        except Exception as e:
            last_error = e
            print(f"Attempt {attempt + 1} failed for palette diagram generation: {str(e)}")
            if attempt < max_retries - 1:
                print(f"Retrying... ({attempt + 2}/{max_retries})")
                await asyncio.sleep(1)  # Brief delay between retries
    
    print(f"All {max_retries} attempts failed for palette diagram generation: {str(last_error)}")
    return {
        'palette_diagram': f"Error generating palette diagram after {max_retries} attempts: {str(last_error)}",
        'color_summary': f"Error after {max_retries} attempts: {str(last_error)}"
    }

def generate_palette_sync(description: str, style_hints: str = "") -> dict:
    """Synchronous wrapper for palette generation (description + optional style_hints)"""
    return asyncio.run(generate_palette(description, style_hints))
