// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://iqltacewwdcfpxusyfci.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxbHRhY2V3d2RjZnB4dXN5ZmNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzODE2MjYsImV4cCI6MjA1OTk1NzYyNn0.EPUHgOyhjHW0vp2D6_U50AjsDGNEsZy76yDU0DM7Xdk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);