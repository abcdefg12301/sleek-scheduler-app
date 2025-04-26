
// Define TypeScript interfaces that match the database schema
export interface DbTables {
  calendars: {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    show_holidays: boolean;
    created_at: string;
    updated_at: string;
  };
  
  events: {
    id: string;
    calendar_id: string;
    title: string;
    description: string | null;
    location: string | null;
    start_time: string;
    end_time: string;
    all_day: boolean;
    color: string | null;
    is_holiday: boolean;
    is_segment: boolean;
    segment_type: string | null;
    is_recurrence_instance: boolean;
    original_event_id: string | null;
    created_at: string;
    updated_at: string;
  };
  
  recurrences: {
    id: string;
    event_id: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    end_date: string | null;
    count: number | null;
    created_at: string;
    updated_at: string;
  };
}

// Define the Database type for Supabase
export interface Database {
  public: {
    Tables: {
      calendars: {
        Row: DbTables['calendars'];
        Insert: Omit<DbTables['calendars'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DbTables['calendars'], 'id' | 'created_at' | 'updated_at'>>;
      };
      events: {
        Row: DbTables['events'];
        Insert: Omit<DbTables['events'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DbTables['events'], 'id' | 'created_at' | 'updated_at'>>;
      };
      recurrences: {
        Row: DbTables['recurrences'];
        Insert: Omit<DbTables['recurrences'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DbTables['recurrences'], 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
