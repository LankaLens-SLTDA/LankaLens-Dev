from supabase import Client, create_client

from app.config import settings

SUPABASE_URL = settings.SUPABASE_URL
SUPABASE_KEY = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY

supabase: Client = None

if SUPABASE_URL and SUPABASE_KEY and "your-supabase" not in SUPABASE_URL:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("[LankaLens Supabase] Client initialized successfully.")
    except Exception as e:
        print(f"[LankaLens Supabase] Failed to initialize Supabase client: {e}")
else:
    print(
        "[LankaLens Supabase] Warning: SUPABASE_URL or SUPABASE_KEY not configured or using default placeholders."
    )
