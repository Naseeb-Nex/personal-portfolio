import asyncio
import os
from psycopg_pool import AsyncConnectionPool
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

# Pull database credentials from .env
DB_URI = os.environ.get("DATABASE_URL")
if not DB_URI:
    raise ValueError("DATABASE_URL environment variable is not set")

async def init_database():
    print("Connecting to the database...")
    
    # 1. Create a connection pool
    # 'autocommit=True' is strictly required by LangGraph's setup() method
    async with AsyncConnectionPool(
        DB_URI, 
        max_size=10, 
        kwargs={"autocommit": True} 
    ) as pool:
        
        # 2. Setup LangGraph Checkpointer tables automatically
        print("1/3 Setting up LangGraph native tables...")
        checkpointer = AsyncPostgresSaver(pool)
        await checkpointer.setup()
            
        # 3. Create Custom App Tables (sessions & abuse_events)
        print("2/3 Creating custom application tables...")
        async with pool.connection() as conn:
            
            # Notice we use 'TEXT' for sessions.id to match LangGraph's thread_id
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    id TEXT PRIMARY KEY, 
                    ip_address VARCHAR(45),
                    user_agent TEXT,
                    created_at TIMESTAMP DEFAULT now(),
                    last_active_at TIMESTAMP DEFAULT now(),
                    is_active BOOLEAN DEFAULT true
                );
                
                CREATE TABLE IF NOT EXISTS abuse_events (
                    id UUID PRIMARY KEY,
                    ip_address VARCHAR(45),
                    event_type VARCHAR(100),
                    details JSONB,
                    created_at TIMESTAMP DEFAULT now()
                );
            """)
            
            # 4. Bridge the Relationship Gap
            # We apply Foreign Keys so that deleting a row in 'sessions' 
            # cascade-deletes the thread history in LangGraph's tables.
            print("3/3 Bridging the relationship gap with Foreign Keys...")
            
            # Depending on the langgraph-checkpoint-postgres version, the exact tables 
            # created might vary slightly. We loop through the known tables.
            langgraph_tables = ["checkpoints", "checkpoint_writes", "checkpoint_blobs"]
            
            for table in langgraph_tables:
                try:
                    # Drop it if it exists (for idempotency)
                    await conn.execute(f"""
                        ALTER TABLE {table} 
                        DROP CONSTRAINT IF EXISTS fk_session_{table};
                    """)
                    
                    # Add the cascading constraint
                    await conn.execute(f"""
                        ALTER TABLE {table} 
                        ADD CONSTRAINT fk_session_{table} 
                        FOREIGN KEY (thread_id) REFERENCES sessions(id) ON DELETE CASCADE;
                    """)
                    print(f" -> Successfully linked '{table}' to 'sessions'")
                except Exception as e:
                    # Catch and ignore if a table (like checkpoint_blobs) isn't used in your specific package version
                    print(f" -> Skipped linking '{table}': Table might not exist in this LangGraph version. Error: {e}")

    print("\n✅ Database schema successfully initialized!")

if __name__ == "__main__":
    asyncio.run(init_database())
