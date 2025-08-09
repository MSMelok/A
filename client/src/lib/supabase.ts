import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password: string;
          name: string;
          role: 'agent' | 'admin';
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password: string;
          name: string;
          role?: 'agent' | 'admin';
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password?: string;
          name?: string;
          role?: 'agent' | 'admin';
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_quote_id: string;
          date: string;
          status: 'quote' | 'in_process' | 'dispatched' | 'canceled' | 'booked';
          agent_id: string;
          agent_name: string;
          total_amount: string;
          broker_fee: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_quote_id: string;
          date: string;
          status: 'quote' | 'in_process' | 'dispatched' | 'canceled' | 'booked';
          agent_id: string;
          agent_name: string;
          total_amount: string;
          broker_fee: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_quote_id?: string;
          date?: string;
          status?: 'quote' | 'in_process' | 'dispatched' | 'canceled' | 'booked';
          agent_id?: string;
          agent_name?: string;
          total_amount?: string;
          broker_fee?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
