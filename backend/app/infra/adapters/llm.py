import logging
from typing import List, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from app.domain.modules.agent.repository import ILLMProvider
from app.domain.modules.agent.entity import ChatMessage
from app.config import settings

try:
    import redis.asyncio as redis
except ImportError:
    redis = None

logger = logging.getLogger(__name__)

class ModelWrapper:
    def __init__(self, provider, tools=None):
        self.provider = provider
        self.tools = tools

    async def ainvoke(self, messages):
        return await self.provider.invoke_with_fallback(messages, self.tools)

    def bind_tools(self, tools):
        return ModelWrapper(self.provider, tools)

class GeminiLLMProvider(ILLMProvider):
    def __init__(self):
        self.models = settings.GEMINI_MODELS
        self.api_keys = list(settings.GEMINI_FALLBACK_API_KEYS)
        
        if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY not in self.api_keys:
            self.api_keys.insert(0, settings.GEMINI_API_KEY)
            
        self.redis_client = None
        if redis and settings.REDIS_URL:
            self.redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

    @property
    def llm(self):
        return ModelWrapper(self)

    def _get_llm(self, model: str, api_key: str):
        return ChatGoogleGenerativeAI(
            model=model,
            temperature=0,
            google_api_key=api_key
        )

    async def invoke_with_fallback(self, messages: Any, tools: List[Any] = None) -> Any:
        last_exception = None
        for api_key in self.api_keys:
            for model in self.models:
                cache_key = f"exhausted:gemini:{api_key}:{model}"
                
                if self.redis_client:
                    try:
                        is_exhausted = await self.redis_client.get(cache_key)
                        if is_exhausted:
                            logger.info(f"Skipping exhausted model {model} with key {api_key[:10]}...")
                            continue
                    except Exception as e:
                        logger.error(f"Redis get error: {e}")

                try:
                    llm = self._get_llm(model, api_key)
                    if tools:
                        llm = llm.bind_tools(tools)
                    return await llm.ainvoke(messages)
                except Exception as e:
                    error_msg = str(e).lower()
                    if "429" in error_msg or "quota" in error_msg or "exhausted" in error_msg or "resource" in error_msg:
                        logger.warning(f"Quota exceeded for model {model} with API key starting with {api_key[:10]}... Switching...")
                        last_exception = e
                        
                        if self.redis_client:
                            try:
                                await self.redis_client.setex(cache_key, 86400, "true")  # 86400 seconds = 24h
                            except Exception as re:
                                logger.error(f"Redis set error: {re}")
                        continue
                    else:
                        raise e
        
        if last_exception:
            raise Exception("All API keys and models exhausted quota.") from last_exception

    async def generate_response(self, messages: List[ChatMessage], tools: List[Any] = None) -> Any:
        formatted = [(m.role, m.content) for m in messages]
        return await self.invoke_with_fallback(formatted, tools)
