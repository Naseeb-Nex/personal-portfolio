# Product Requirements Document (PRD): Portfolio Chat Agent

## 1. Product Overview
The Portfolio Chat Agent is an interactive, AI-driven conversational interface integrated into a personal portfolio website. It allows visitors to seamlessly query project details, skills, and resume information. The system leverages Agentic Orchestration to provide rich, structured responses (including dynamic UI components) based on a Retrieval-Augmented Generation (RAG) architecture.

## 2. Target Audience
- Recruiters seeking detailed information on professional experience.
- Hiring Managers evaluating technical skills and past projects.
- Developers and peers exploring portfolio implementations.

## 3. Core Features & Requirements

### 3.1. Real-Time Chat Experience
- **SSE Streaming**: Deliver fast, real-time Server-Sent Events (SSE) streaming of chat responses to the frontend widget (React + Vite).
- **Stateless/Session-Based Access**: Enable public access via secure API endpoints without requiring traditional user account creation.

### 3.2. Agentic Orchestration
- **Workflow Management**: Utilize LangGraph for intelligent orchestration of multi-step reasoning and workflows.
- **Tool Execution**: Agent can invoke specific tools (e.g., fetch project details, get skills) to enhance answers.

### 3.3. Dynamic UI Generation
- **Structured Output**: The backend will instruct the frontend to render structured UI components (e.g., "Project Card", "Skill List") by streaming specific JSON schemas during the chat session.

### 3.4. AI & Knowledge Base (RAG)
- **Provider-Agnostic AI**: Core logic built against an abstract LLM interface (`ILLMProvider`). Initial launch uses Gemini models, with architecture supporting future swaps.
- **Vector Search Engine**: Semantic search over portfolio data, resume content, and past project details. Uses abstracted vector database (`IKnowledgeRepository`), initially ChromaDB.
- **Data Management**: Manual data updates for the knowledge base in the initial phase (future dashboard planned).

## 4. Security & Performance (Non-Functional Requirements)

### 4.1. Session & History Management
- **JWT Sessions**: Use short-lived/ephemeral JSON Web Tokens (JWT) upon session initialization.
- **Persistence & Resilience**: Frontend persists session tokens (localStorage/cookies). Backend provides an endpoint to fetch chat history, ensuring conversation continuity on page refresh.

### 4.2. Abuse Prevention
- **Rate Limiting**: Redis-backed rate limiting to mitigate spam and API abuse.
- **Bot Protection**: Track and mitigate abusive behavior from public IP addresses.

## 5. Deployment & Infrastructure
- **Frontend Setup**: React and Vite, deployed on Vercel.
- **Backend Setup**: FastAPI deployed via Docker infrastructure.
- **Persistence**: Reliable storage using PostgreSQL (with native async PostgreSQL connectors) for chat transcripts, session metadata, and abuse logs.
- **Monitoring**: Standard logs monitoring for initial launch.

## 6. Future Scope
- Interactive dashboard for analytics and monitoring.
- Admin panel for automated RAG data updates.
