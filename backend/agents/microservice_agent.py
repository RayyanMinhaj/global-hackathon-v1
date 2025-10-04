from pydantic_ai import Agent
from pydantic import BaseModel
import asyncio
import os
from config import Config

# Ensure API key is available
os.environ['OPENAI_API_KEY'] = Config.OPENAI_API_KEY

GENERATE_MICROSERVICES_PROMPT = """
You are an expert in designing microservices architectures. Given system requirements and optional constraints (scale, data consistency, protocols), generate a clear microservices architecture diagram in Mermaid syntax.

The diagram should include:
1. Individual services (with clear names, feel free to ouse modern big name brands like AWS, GCP, Azure, etc. if relevant)
2. Datastores and dataflow between services
3. API gateways or ingress points
4. Messaging components (queues, event buses) where appropriate
5. External integrations and third-party services
6. Deployment hints (k8s, containers) if requested

Return the Mermaid diagram code and a concise JSON summary of services and their responsibilities.

Example mermaid output:

```mermaid
graph TB
    API[API Gateway] --> Auth[Auth Service]
    API --> Orders[Order Service]
    Orders --> OrdersDB[(Orders DB)]
    API --> Inventory[Inventory Service]
    Inventory --> InventoryDB[(Inventory DB)]
```

Example service summary output:

service_summary:
{
    "Auth Service": "Handles authentication and JWT issuance",
    "Order Service": "Processes orders and writes to Orders DB",
    "Inventory Service": "Manages stock levels and inventory DB",
    "API Gateway": "Ingress and routing, rate-limiting"
}
"""

class MicroservicesInput(BaseModel):
    requirements: str
    scale: str = "medium"
    consistency: str = "eventual"

class MicroservicesOutput(BaseModel):
    architecture_diagram: str
    service_summary: str

microservice_agent = Agent(
    'openai:gpt-4o',
    deps_type=MicroservicesInput,
    result_type=MicroservicesOutput,
    system_prompt=GENERATE_MICROSERVICES_PROMPT,
)

async def generate_microservices(requirements: str, scale: str = "medium", consistency: str = "eventual") -> dict:
    try:
        message = f"""
        Generate a microservices architecture diagram according to these inputs:

        Requirements: {requirements}
        Scale: {scale}
        Consistency: {consistency}

        Please return a Mermaid diagram and a JSON service summary.
        """

        deps = MicroservicesInput(requirements=requirements, scale=scale, consistency=consistency)
        result = await microservice_agent.run(message, deps=deps)

        return {
            'architecture_diagram': result.data.architecture_diagram,
            'service_summary': result.data.service_summary
        }
    except Exception as e:
        print(f"Error generating microservices architecture: {str(e)}")
        return {
            'architecture_diagram': f"Error generating architecture diagram: {str(e)}",
            'service_summary': f"Error: {str(e)}"
        }

def generate_microservices_sync(requirements: str, scale: str = "medium", consistency: str = "eventual") -> dict:
    return asyncio.run(generate_microservices(requirements, scale, consistency))
