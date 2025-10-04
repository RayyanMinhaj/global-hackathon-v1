from pydantic_ai import Agent
from pydantic import BaseModel
import asyncio
import os
from config import Config

# API key imported here
os.environ['OPENAI_API_KEY'] = Config.OPENAI_API_KEY


GENERATE_ERD_DIAGRAM_PROMPT = """
You are an expert in generating database ERD diagrams from table definitions.
Given the following table definitions, generate an ERD diagram in Mermaid syntax.

The table definitions will be provided as input. Each table has a name and columns with attributes.
Generate a proper Mermaid ERD diagram showing:
1. All entities (tables)
2. All attributes (columns) with their types
3. Primary keys marked appropriately
4. Foreign key relationships between tables

Return only the Mermaid diagram code.
"""

class TableDefinition(BaseModel):
    table_definitions: str

class OutputType(BaseModel):
    erd_diagram: str

erd_agent = Agent(
    'openai:gpt-4o',
    deps_type=TableDefinition,
    result_type=OutputType,
    system_prompt=GENERATE_ERD_DIAGRAM_PROMPT,
)

async def generate_erd_diagram(table_definitions: str) -> str:
    try:
        # Create the input message with table definitions
        message = f"Generate an ERD diagram for these tables: {table_definitions}"
        
        # Create deps object
        deps = TableDefinition(table_definitions=table_definitions)
        
        # Run the agent with the message and deps
        result = await erd_agent.run(message, deps=deps)

        return result.data.erd_diagram
    except Exception as e:
        print(f"Error generating ERD diagram: {str(e)}")
        return f"Error generating ERD diagram: {str(e)}"
    
def generate_erd_diagram_sync(table_definitions: list) -> str:
    return asyncio.run(generate_erd_diagram(table_definitions))