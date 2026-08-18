from dataclasses import dataclass
from datetime import datetime

@dataclass
class Session:
    id: str
    ip_address: str
    user_agent: str
    created_at: datetime
    last_active_at: datetime
    is_active: bool

    def deactivate(self) -> None:
        self.is_active = False
