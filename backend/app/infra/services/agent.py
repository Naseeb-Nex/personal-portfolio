from typing import TypedDict, Annotated, Sequence, Dict, Any, List
import operator
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage
from langgraph.graph import StateGraph, END, START
from langgraph.prebuilt import ToolNode
from langchain_core.tools import tool
import json

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    ui_component: Dict[str, Any]

# Hardcoded Resume Data
DATA_SUMMARY = {
    "name": "Muhammed Naseeb",
    "role": "AI Engineer",
    "bio": "AI Engineer with 2+ years of hands-on experience architecting and shipping production-grade Generative AI systems across AWS, Azure, and GCP. Deep expertise in LLM Orchestration, Multi-Agent Frameworks, and RAG pipeline engineering."
}

DATA_EDUCATION = [
    {"school": "College of Engineering Karunagappally", "degree": "BTech Computer Science", "period": "Sep 2021 - Jul 2024"},
    {"school": "Carmel Polytechnic College", "degree": "Diploma Computer Engineering", "period": "Jul 2019 - Apr 2021"}
]

DATA_SKILLS = {
    "languages": ["Python", "SQL", "C++"],
    "gen_ai": ["OpenAI GPT", "Claude", "LLaMA", "Gemini Pro", "RAG"],
    "frameworks": ["LangGraph", "LangChain", "Semantic Kernel"],
    "cloud": ["AWS", "Azure", "GCP"]
}

DATA_WORK = [
    {"company": "Smart Analytica", "role": "AI Engineer", "duration": "Jan 2025 - Present", "bullets": ["Engineered multiple enterprise-grade AI products end-to-end", "Architected Multi-Agent GenBI platform using Microsoft Agent Framework"]},
    {"company": "FIA Global Technology", "role": "Data Analyst - AI Engineer", "duration": "Feb 2024 - Jan 2025", "bullets": ["Developed AI financial wellbeing tool using GPT-4 and Pinecone", "Built context-aware RAG chatbot"]}
]

DATA_CERTIFICATIONS = [
    {"name": "IBM AI Developer Professional Certificate", "year": "2026"},
    {"name": "Outstanding Performance in Enterprise AI", "year": "Sep 2025"}
]

DATA_PROJECTS = [
    {"name": "Beach Sand Mineral Segmentation & Classification", "tech": ["Deep Learning", "OpenCV", "Data Augmentation"], "description": "AI-driven segmentation system for KMML identifying microscopic minerals. Improved accuracy by 22%."}
]

@tool
def get_summary() -> str:
    """Get the profile summary, bio and title."""
    return json.dumps({"type": "SummaryCard", "data": DATA_SUMMARY})

@tool
def get_education() -> str:
    """Get the education history."""
    return json.dumps({"type": "EducationCard", "data": DATA_EDUCATION})

@tool
def get_skills() -> str:
    """Get the technical skills."""
    return json.dumps({"type": "SkillsCard", "data": DATA_SKILLS})

@tool
def get_work() -> str:
    """Get the work experience and job history."""
    return json.dumps({"type": "ExperienceCard", "data": DATA_WORK})

@tool
def get_certifications() -> str:
    """Get the certifications."""
    return json.dumps({"type": "CertificationsCard", "data": DATA_CERTIFICATIONS})

@tool
def get_projects() -> str:
    """Get the projects."""
    return json.dumps({"type": "ProjectsCard", "data": DATA_PROJECTS})

tools = [get_summary, get_education, get_skills, get_work, get_certifications, get_projects]

class CustomToolNode:
    def __init__(self, tools_list):
        self.tool_node = ToolNode(tools_list)
        
    async def __call__(self, state: AgentState):
        result = await self.tool_node.ainvoke(state)
        last_msg = result["messages"][-1]
        ui_comp = None
        if isinstance(last_msg, ToolMessage):
            try:
                ui_comp = json.loads(last_msg.content)
            except json.JSONDecodeError:
                pass
        return {"messages": result["messages"], "ui_component": ui_comp}

class PortfolioAgent:
    def __init__(self, llm_provider, knowledge_repo):
        self.llm = llm_provider
        self.knowledge = knowledge_repo
        self.graph = self._build_graph()

    def _build_graph(self):
        workflow = StateGraph(AgentState)
        model_with_tools = self.llm.llm.bind_tools(tools)
        
        async def call_model(state: AgentState):
            messages = state['messages']
            
            # Prevent infinite loop: if we just came from a tool, don't bind tools again
            if messages and hasattr(messages[-1], "type") and messages[-1].type == "tool":
                model_to_use = self.llm.llm
            else:
                model_to_use = model_with_tools
                
            try:
                # system prompt
                from langchain_core.messages import SystemMessage
                sys_msg = SystemMessage(content="You are a helpful AI assistant representing Muhammed Naseeb. Use tools to fetch information and return a short, friendly message telling the user to look at the UI card. Do not repeat the data from the tool in your text.")
                response = await model_to_use.ainvoke([sys_msg] + list(messages))
            except Exception as e:
                response = AIMessage(content=f"LLM Error: {str(e)}")
            return {"messages": [response]}
            
        def should_continue(state: AgentState):
            messages = state['messages']
            last_message = messages[-1]
            if getattr(last_message, 'tool_calls', None):
                return "tools"
            return END
            
        workflow.add_node("agent", call_model)
        workflow.add_node("tools", CustomToolNode(tools))
        
        workflow.add_edge(START, "agent")
        workflow.add_conditional_edges("agent", should_continue, {"tools": "tools", END: END})
        workflow.add_edge("tools", "agent")
        
        return workflow
        
    async def run(self, message: str, session_id: str, db_url: str):
        from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
        workflow = self._build_graph()
        
        async with AsyncPostgresSaver.from_conn_string(db_url) as checkpointer:
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
