from pydantic_ai import Agent
from pydantic import BaseModel
import asyncio
import os
from config import Config

# Ensure API key is available
os.environ['OPENAI_API_KEY'] = Config.OPENAI_API_KEY

GENERATE_SRS_PROMPT = """
You are an expert technical writer and software engineer. Produce a comprehensive Software Requirements Specification (SRS) document using the IEEE recommended structure tailored to the provided project description and requirements.

Required sections and content (return these as structured fields):
1. Document purpose - short high-level statement
2. Product Scope - features and boundaries
3. Intended Audience - roles and stakeholders
4. Product Perspective - system context and relationships
5. Functional Requirements - numbered list of requirements with IDs and brief acceptance criteria
6. Non Functional Requirements - performance, security, accessibility, reliability, etc.
7. User Stories + Epics - group by epics and list user stories with IDs
8. Software Quality Attributes - list and short explanations (maintainability, scalability, etc.)
9. Architectural Spike - include one spike (problem statement, complex use case, approach, and success criteria)

Instructions:
- Infer a short project name from the provided description; do not require the user to supply the project name.
- Use project-specific language based on the input description and optional requirements/audience.
- Provide concise numbered lists where appropriate and include acceptance criteria for functional requirements and user stories.
- Return the SRS structured as fields in the agent output so the runtime can extract them (e.g., srs_document: "...full text...", and srs_summary: JSON mapping of top-level points).
"""

class SRSInput(BaseModel):
    description: str
    requirements: str = ""
    audience: str = ""

class SRSOutput(BaseModel):
    srs_document: str
    srs_summary: str

srs_agent = Agent(
    'openai:gpt-4o',
    deps_type=SRSInput,
    result_type=SRSOutput,
    system_prompt=GENERATE_SRS_PROMPT,
)

async def generate_srs(description: str, requirements: str = "", audience: str = "") -> dict:
    try:
        message = f"""
        Generate a Software Requirements Specification for the project inferred from this description. Infer a short, descriptive project name.

        Description: {description}
        Requirements: {requirements}
        Audience: {audience}

        Follow the SRS structure and return the full SRS text and a JSON summary mapping the main sections to short bullets. Include the inferred project name at the top of the document.
        """

        deps = SRSInput(description=description, requirements=requirements, audience=audience)
        result = await srs_agent.run(message, deps=deps)

        return {
            'srs_document': result.data.srs_document,

            'srs_summary': result.data.srs_summary
        }
    except Exception as e:
        print(f"Error generating SRS document: {str(e)}")
        return {
            'srs_document': f"Error generating SRS document: {str(e)}",
            'srs_summary': f"Error: {str(e)}"
        }

def generate_srs_sync(description: str, requirements: str = "", audience: str = "") -> dict:
    return asyncio.run(generate_srs(description, requirements, audience))
