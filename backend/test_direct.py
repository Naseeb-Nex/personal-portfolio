import asyncio
from app.infra.services.agent import PortfolioAgent
from app.infra.adapters.llm import GeminiLLMProvider
from app.infra.adapters.vector_store import ChromaDBAdapter
from app.infra.database.database import DB_URL

# Patch agent run method for local testing
async def run_patched(self, message: str, session_id: str, db_url: str):
    from langgraph.checkpoint.memory import MemorySaver
    from langchain_core.messages import HumanMessage
    workflow = self._build_graph()
    
    checkpointer = MemorySaver()
    graph = workflow.compile(checkpointer=checkpointer)
    config = {"configurable": {"thread_id": session_id}}
    await graph.ainvoke(
        {"messages": [HumanMessage(content=message)], "ui_component": None},
        config=config
    )
    
    state = await graph.aget_state(config)
    return {
        "messages": state.values.get("messages", []), 
        "ui_component": state.values.get("ui_component")
    }

PortfolioAgent.run = run_patched

async def test_agent_direct():
    llm = GeminiLLMProvider()
    repo = ChromaDBAdapter()
    agent = PortfolioAgent(llm, repo)
    
    session_id = "test-direct-session-1"
    
    queries = [
        "Tell me about yourself (summary)",
        "What is your education?"
    ]
    
    for q in queries:
        print(f"\n--- Query: {q} ---")
        try:
            result = await asyncio.wait_for(agent.run(q, session_id, DB_URL), timeout=30.0)
            
            ui_comp = result.get("ui_component")
            if ui_comp:
                print(f"UI Emitted: {ui_comp['type']}")
            
            messages = result.get("messages", [])
            if messages:
                print(f"Agent Text: {messages[-1].content}")
        except asyncio.TimeoutError:
            print("ERROR: agent.run() timed out!")
        except Exception as e:
            print(f"ERROR: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_agent_direct())
