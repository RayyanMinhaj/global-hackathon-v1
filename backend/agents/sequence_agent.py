from pydantic_ai import Agent
from pydantic import BaseModel
import asyncio
import os
from config import Config

# Ensure API key is available to the agent
os.environ['OPENAI_API_KEY'] = Config.OPENAI_API_KEY

GENERATE_SEQUENCE_DIAGRAM_PROMPT = """
You are an expert in generating sequence diagrams from interaction descriptions.
Given a description of interactions between actors, services, and data stores, generate a clear sequence diagram in Mermaid syntax.

The input will contain a textual description and optional actor list. Produce a Mermaid sequenceDiagram illustrating:
1. All actors and participants
2. Messages between participants with labels
3. Lifelines for long-running processes where applicable
4. Notes or annotations for important steps

Return only the Mermaid diagram code and a short JSON summary of participants.
"""

class SequenceInput(BaseModel):
    description: str
    actors: str = ""

class SequenceOutput(BaseModel):
    sequence_diagram: str
    participant_summary: str

sequence_agent = Agent(
    'openai:gpt-4o',
    deps_type=SequenceInput,
    result_type=SequenceOutput,
    system_prompt=GENERATE_SEQUENCE_DIAGRAM_PROMPT,
)

async def generate_sequence(description: str, actors: str = "") -> dict:
    try:
        message = f"""
        Generate a sequence diagram for the following interaction description:

        Description: {description}

        Actors: {actors if actors else 'Not specified - infer actors from description'}

        Please return a Mermaid sequenceDiagram and a concise JSON summary of participants.
        """

        deps = SequenceInput(description=description, actors=actors)

        result = await sequence_agent.run(message, deps=deps)

        return {
            'sequence_diagram': result.data.sequence_diagram,
            'participant_summary': result.data.participant_summary
        }
    except Exception as e:
        print(f"Error generating sequence diagram: {str(e)}")
        return {
            'sequence_diagram': f"Error generating sequence diagram: {str(e)}",
            'participant_summary': f"Error: {str(e)}"
        }

def generate_sequence_sync(description: str, actors: str = "") -> dict:
    """
    Synchronous wrapper for generating sequence diagrams
    """
    return asyncio.run(generate_sequence(description, actors))
