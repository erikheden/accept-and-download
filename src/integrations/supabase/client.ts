// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qmfapuvgfswpbbqskvlo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtZmFwdXZnZnN3cGJicXNrdmxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwMTk3ODIsImV4cCI6MjA0OTU5NTc4Mn0.4K1bohPk2BXzucI0iowcnjaSCuZd_zhJu13Iv9vFpXg";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);