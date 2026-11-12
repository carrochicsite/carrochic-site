/// <reference types="astro/client" />
import type { SupabaseClient, User } from '@supabase/supabase-js';

declare global {
  namespace App {
    interface Locals {
      sb: SupabaseClient;
      user: User;
    }
  }
}
