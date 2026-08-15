from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, Sequence
import operator
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]

class PortfolioAgent:
    def __init__(self, llm_provider, knowledge_repo):
        self.llm = llm_provider
        self.knowledge = knowledge_repo
        self.graph = self._build_graph()

    def _build_graph(self):
        workflow = StateGraph(AgentState)
        
        async def call_model(state: AgentState):
            messages = state['messages']
            try:
                response = await self.llm.llm.ainvoke(messages)
            except Exception as e:
                response = AIMessage(content=f"LLM Error: {str(e)}")
            return {"messages": [response]}
            
        workflow.add_node("agent", call_model)
        workflow.set_entry_point("agent")
        workflow.add_edge("agent", END)
        
        return workflow
        
    async def run(self, message: str, session_id: str, db_url: str):
        from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
        workflow = self._build_graph()
        
        async with AsyncPostgresSaver.from_conn_string(db_url) as checkpointer:
            # Note: assuming schema already exists via checkpoint_migrations table
            graph = workflow.compile(checkpointer=checkpointer)
            
            inputs = {"messages": [HumanMessage(content=message)]}
            config = {"configurable": {"thread_id": session_id}}
            async for output in graph.astream(inputs, config=config):
                pass
            
            # Return final messages
            return output["agent"]["messages"]
