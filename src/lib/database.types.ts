/**
 * Database Types — Auto-generated from Supabase schema.
 * Simplified for the Disclosure app which only has one table.
 */

export interface Database {
  public: {
    Tables: {
      sightings: {
        Row: {
          city: string | null;
          country: string | null;
          created_at: string | null;
          date_time: string | null;
          description: string | null;
          duration: string | null;
          id: number;
          latitude: number | null;
          longitude: number | null;
          posted: string | null;
          shape: string | null;
          source: string | null;
          state: string | null;
          summary: string | null;
        };
        Insert: {
          city?: string | null;
          country?: string | null;
          created_at?: string | null;
          date_time?: string | null;
          description?: string | null;
          duration?: string | null;
          id?: number;
          latitude?: number | null;
          longitude?: number | null;
          posted?: string | null;
          shape?: string | null;
          source?: string | null;
          state?: string | null;
          summary?: string | null;
        };
        Update: {
          city?: string | null;
          country?: string | null;
          created_at?: string | null;
          date_time?: string | null;
          description?: string | null;
          duration?: string | null;
          id?: number;
          latitude?: number | null;
          longitude?: number | null;
          posted?: string | null;
          shape?: string | null;
          source?: string | null;
          state?: string | null;
          summary?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      sighting_day: { Args: { ts: string }; Returns: number };
      sighting_month: { Args: { ts: string }; Returns: number };
      get_sightings_by_shape: { Args: Record<string, never>; Returns: { shape: string; count: number }[] };
      get_sightings_by_state: { Args: Record<string, never>; Returns: { state: string; count: number }[] };
      get_sightings_by_year: { Args: Record<string, never>; Returns: { year: number; count: number }[] };
      get_sightings_by_hour: { Args: Record<string, never>; Returns: { hour: number; count: number }[] };
      get_sightings_by_month: { Args: Record<string, never>; Returns: { month: number; count: number }[] };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

/** Convenience type alias for a sighting row */
export type Sighting = Database["public"]["Tables"]["sightings"]["Row"];
