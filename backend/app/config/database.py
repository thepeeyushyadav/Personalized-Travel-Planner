from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


def get_client() -> Client:
    """Returns Supabase client with anon key (normal user operations)."""
    return create_client(SUPABASE_URL, SUPABASE_ANON_KEY)


def get_service_client() -> Client:
    """Returns Supabase client with service role key (admin operations)."""
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
