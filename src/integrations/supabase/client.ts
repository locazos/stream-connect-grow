
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://vafynmudxzjojvuzaeoq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhZnlubXVkeHpqb2p2dXphZW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NzAzMTksImV4cCI6MjA2MDU0NjMxOX0._GTTgiA5wbougH2h-9AIS2o1NFPLKMr6lsBjzZONLmc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
