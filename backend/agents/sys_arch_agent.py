from pydantic_ai import Agent
from pydantic import BaseModel
import asyncio
import os
import json
from config import Config

# API key imported here
os.environ['OPENAI_API_KEY'] = Config.OPENAI_API_KEY

GENERATE_SYSTEM_ARCHITECTURE_PROMPT = """
You are an expert in generating system architecture diagrams from system requirements and specifications.
Given the following system requirements, generate a comprehensive system architecture diagram in Mermaid syntax.

The system requirements will be provided as input. Generate a proper Mermaid system architecture diagram showing:
1. All major system components (frontend, backend, database, external services)
2. Data flow between components
3. Technology stack for each component
4. External integrations and APIs
5. User interactions and interfaces
6. Security layers and authentication
7. Deployment architecture (if specified)

Focus on:
- Clear component separation
- Proper data flow arrows
- Technology labels for each component
- User interaction flows
- API connections
- Database relationships

Return only the Mermaid diagram code with proper syntax.

Example mermaid output:

```mermaid
graph LR
    User[User UI] --> Web[Web Frontend]
    Web --> API[API Server]
    API --> Auth[Auth Service]
    API --> DB[(Primary DB)]
    API --> External[Third-Party API]
```

Example component summary output:

component_summary:
{
    "Web Frontend": "React SPA served via CDN",
    "API Server": "Node/Python backend handling business logic",
    "Auth Service": "OAuth2/JWT authentication",
    "Primary DB": "Relational database for core data"
}
"""


class SystemRequirements(BaseModel):
    requirements: str
    technology_stack: str = ""
    deployment_type: str = "web"

class ArchitectureOutput(BaseModel):
    architecture_diagram: str
    component_summary: str

srs_agent = Agent(
    'openai:gpt-4o',
    deps_type=SystemRequirements,
    result_type=ArchitectureOutput,
    system_prompt=GENERATE_SYSTEM_ARCHITECTURE_PROMPT,
)

async def generate_system_architecture(requirements: str, technology_stack: str = "", deployment_type: str = "web") -> dict:
    max_retries = 3
    last_error = None
    
    for attempt in range(max_retries):
        try:
            # Create the input message with system requirements
            message = f"""
            Generate a system architecture diagram based on these requirements:
            
            Requirements: {requirements}
            
            Technology Stack: {technology_stack if technology_stack else "Not specified - use modern web technologies"}
            
            Deployment Type: {deployment_type}
            
            Please create a comprehensive system architecture diagram showing all components, data flows, and integrations.
            """
            
            # Create deps object
            deps = SystemRequirements(
                requirements=requirements,
                technology_stack=technology_stack,
                deployment_type=deployment_type
            )
            
            # Run the agent with the message and deps
            result = await srs_agent.run(message, deps=deps)

            return {
                'architecture_diagram': result.data.architecture_diagram,
                'component_summary': result.data.component_summary
            }
        except Exception as e:
            last_error = e
            print(f"Attempt {attempt + 1} failed for system architecture generation: {str(e)}")
            if attempt < max_retries - 1:
                print(f"Retrying... ({attempt + 2}/{max_retries})")
                await asyncio.sleep(1)  # Brief delay between retries
    
    print(f"All {max_retries} attempts failed for system architecture generation: {str(last_error)}")
    return {
        'architecture_diagram': f"Error generating architecture diagram after {max_retries} attempts: {str(last_error)}",
        'component_summary': f"Error after {max_retries} attempts: {str(last_error)}"
    }

def generate_system_architecture_sync(requirements: str, technology_stack: str = "", deployment_type: str = "web") -> dict:
    """
    Synchronous wrapper for generating system architecture diagrams
    
    Args:
        requirements: System requirements and specifications
        technology_stack: Optional technology stack information
        deployment_type: Type of deployment (web, mobile, desktop, etc.)
    
    Returns:
        dict: Contains 'architecture_diagram' and 'component_summary'
    """
    return asyncio.run(generate_system_architecture(requirements, technology_stack, deployment_type))
