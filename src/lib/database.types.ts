
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          games: string[] | null
          description: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          games?: string[] | null
          description?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          games?: string[] | null
          description?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      swipes: {
        Row: {
          id: number
          swiper_id: string
          target_id: string
          direction: 'left' | 'right'
          created_at: string
        }
        Insert: {
          id?: number
          swiper_id: string
          target_id: string
          direction: 'left' | 'right'
          created_at?: string
        }
        Update: {
          id?: number
          swiper_id?: string
          target_id?: string
          direction?: 'left' | 'right'
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: number
          user_a: string
          user_b: string
          created_at: string
        }
        Insert: {
          id?: number
          user_a: string
          user_b: string
          created_at?: string
        }
        Update: {
          id?: number
          user_a?: string
          user_b?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_match: {
        Args: {
          user_1: string
          user_2: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
