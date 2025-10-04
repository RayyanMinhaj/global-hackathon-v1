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
Tables:

Ensure the diagram includes entities, attributes, and relationships.
"""

class TableDefinition(BaseModel):
    table_definitions: list

class OutputType(BaseModel):
    erd_diagram: str

erd_agent = Agent(
    'openai:gpt-4o',
    deps_type=TableDefinition,
    result_type=OutputType,
    system_prompt=GENERATE_ERD_DIAGRAM_PROMPT,
)

async def generate_erd_diagram(table_definitions: list) -> str:
    try:
        table_def_deps = TableDefinition(table_definitions=table_definitions)

        result = await erd_agent.run(table_def_deps, deps=table_def_deps)

        return result.erd_diagram
    except Exception as e:
        print(f"Error generating ERD diagram: {str(e)}")
        return "Error generating ERD diagram."
    
def generate_erd_diagram_sync(table_definitions: list) -> str:
    return asyncio.run(generate_erd_diagram(table_definitions))