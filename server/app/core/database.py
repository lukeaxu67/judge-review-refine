"""
Database configuration and initialization
"""
import aiosqlite
from pathlib import Path
from contextlib import asynccontextmanager
from config.settings import settings
from app.core.logger import log

class Database:
    def __init__(self):
        self.db_path = settings.DATABASE_PATH
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
    
    @asynccontextmanager
    async def get_connection(self):
        """Get database connection context manager"""
        conn = await aiosqlite.connect(self.db_path)
        conn.row_factory = aiosqlite.Row
        try:
            await conn.execute("PRAGMA foreign_keys = ON")
            yield conn
        finally:
            await conn.close()
    
    async def init_tables(self):
        """Initialize database tables"""
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS annotations (
            id TEXT PRIMARY KEY,
            
            -- Task identification
            task_hash TEXT NOT NULL,
            file_hash TEXT NOT NULL,
            filename TEXT NOT NULL,
            dimension TEXT,
            
            -- Data location
            case_id INTEGER NOT NULL,
            
            -- User info
            browser_fingerprint TEXT NOT NULL,
            account_name TEXT,
            
            -- Original data (JSON)
            original_data TEXT NOT NULL,
            
            -- LLM judgement
            llm_judgement TEXT,
            llm_reasoning TEXT,
            
            -- Human annotation
            human_action TEXT NOT NULL CHECK(human_action IN ('agree', 'disagree', 'skip')),
            human_judgement TEXT,
            human_reasoning TEXT,
            
            -- Metadata
            annotation_type TEXT,
            evaluation_type TEXT,
            labels TEXT,  -- JSON
            metadata TEXT,  -- JSON
            
            -- Timestamps
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        # Create indexes
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_task_hash ON annotations(task_hash);",
            "CREATE INDEX IF NOT EXISTS idx_file_hash ON annotations(file_hash);",
            "CREATE INDEX IF NOT EXISTS idx_fingerprint ON annotations(browser_fingerprint);",
            "CREATE INDEX IF NOT EXISTS idx_account ON annotations(account_name);",
            "CREATE INDEX IF NOT EXISTS idx_action ON annotations(human_action);",
            "CREATE INDEX IF NOT EXISTS idx_created ON annotations(created_at);",
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_annotation ON annotations(task_hash, case_id, browser_fingerprint);"
        ]
        
        try:
            async with self.get_connection() as conn:
                # Create table
                await conn.execute(create_table_sql)
                log.info("Created annotations table")
                
                # Create indexes
                for index_sql in indexes:
                    await conn.execute(index_sql)
                log.info("Created database indexes")
                
                await conn.commit()
                log.info("Database initialization completed")
                
        except Exception as e:
            log.error(f"Failed to initialize database: {e}")
            raise
    
    async def execute(self, query: str, params: tuple = None):
        """Execute a query"""
        async with self.get_connection() as conn:
            cursor = await conn.execute(query, params or ())
            await conn.commit()
            return cursor
    
    async def fetchone(self, query: str, params: tuple = None):
        """Fetch one row"""
        async with self.get_connection() as conn:
            cursor = await conn.execute(query, params or ())
            return await cursor.fetchone()
    
    async def fetchall(self, query: str, params: tuple = None):
        """Fetch all rows"""
        async with self.get_connection() as conn:
            cursor = await conn.execute(query, params or ())
            return await cursor.fetchall()

# Create database instance
db = Database()