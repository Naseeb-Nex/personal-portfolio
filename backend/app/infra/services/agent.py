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
        
        return workflow.compile()
        
    async def run(self, message: str):
        inputs = {"messages": [HumanMessage(content=message)]}
        async for output in self.graph.astream(inputs):
            pass
        # Return final messages
        return output["agent"]["messages"]
