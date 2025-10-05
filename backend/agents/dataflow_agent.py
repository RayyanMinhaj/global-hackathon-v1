from pydantic_ai import Agent
from pydantic import BaseModel
import asyncio
import os
import json
from config import Config

# API key imported here
os.environ['OPENAI_API_KEY'] = Config.OPENAI_API_KEY

GENERATE_DATAFLOW_DIAGRAM_PROMPT = """
You are an expert in generating dataflow diagrams from system component descriptions.
Given a description of a system (components, data sources, sinks, and interactions), generate a clear Data Flow Diagram (DFD) in Mermaid syntax.

IMPORTANT (formatting rules):
- The agent MUST return a valid Mermaid diagram string only — DO NOT include markdown fences (```), explanatory text, or any other commentary.
- The returned Mermaid string will be rendered directly by the frontend as a Mermaid diagram, so it must be syntactically correct and renderable.
- Also include a small JSON object named "component_summary" containing role -> short description. The runtime expects two output fields: the Mermaid text (string) and the component_summary (JSON/string).

Produce a Mermaid diagram illustrating:
1. All components (processes/services)
2. External entities (users, third-party services)
3. Data stores (databases, files)
4. Data flows between components and entities
5. Labels for important data flows and protocols where applicable

Example output (exact format expected):

Mermaid (single string, no fences):
flowchart LR
  User[User] --> Frontend[Frontend]
  Frontend --> API[API Gateway]
  API --> Auth[Auth Service]
  API --> Orders[Order Service]
  Orders --> DB[(Orders DB)]
  Auth --> UserDB[(User DB)]

component_summary:
{
  "Frontend": "React app handling UI",
  "API Gateway": "Routes requests to services",
  "Auth Service": "Handles authentication and sessions",
  "Order Service": "Processes orders and interacts with Orders DB",
  "Orders DB": "Primary datastore for orders",
  "User DB": "Stores user profiles and credentials"
}
"""

class DataflowInput(BaseModel):
	description: str
	components: str = ""

class DataflowOutput(BaseModel):
	dataflow_diagram: str
	component_summary: str

dataflow_agent = Agent(
	'openai:gpt-4o',
	deps_type=DataflowInput,
	result_type=DataflowOutput,
	system_prompt=GENERATE_DATAFLOW_DIAGRAM_PROMPT,
)

async def generate_dataflow(description: str, components: str = "") -> dict:
	max_retries = 3
	last_error = None
	
	for attempt in range(max_retries):
		try:
			message = f"""
			Generate a dataflow diagram for the following system description:

			Description: {description}

			Components: {components if components else 'Not specified - infer components from description'}

			Please return a Mermaid dataflow diagram and a concise JSON summary of components.
			"""

			deps = DataflowInput(description=description, components=components)

			result = await dataflow_agent.run(message, deps=deps)

			return {
				'dataflow_diagram': result.data.dataflow_diagram,
				'component_summary': result.data.component_summary
			}
		except Exception as e:
			last_error = e
			print(f"Attempt {attempt + 1} failed for dataflow diagram generation: {str(e)}")
			if attempt < max_retries - 1:
				print(f"Retrying... ({attempt + 2}/{max_retries})")
				await asyncio.sleep(1)  # Brief delay between retries
	
	print(f"All {max_retries} attempts failed for dataflow diagram generation: {str(last_error)}")
	return {
		'dataflow_diagram': f"Error generating dataflow diagram after {max_retries} attempts: {str(last_error)}",
		'component_summary': f"Error after {max_retries} attempts: {str(last_error)}"
	}

def generate_dataflow_sync(description: str, components: str = "") -> dict:
	"""
	Synchronous wrapper for generating dataflow diagrams

	Args:
		description: A textual description of the system and flows
		components: Optional component list or hints

	Returns:
		dict: Contains 'dataflow_diagram' and 'component_summary'
	"""
	return asyncio.run(generate_dataflow(description, components))
