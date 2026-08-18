from abc import ABC, abstractmethod
from typing import Optional
from app.domain.modules.session.entity import Session

class ISessionRepository(ABC):
    @abstractmethod
    async def get_by_id(self, session_id: str) -> Optional[Session]:
        pass

    @abstractmethod
    async def create(self, session: Session) -> Session:
        pass

    @abstractmethod
    async def update(self, session: Session) -> Session:
        pass
