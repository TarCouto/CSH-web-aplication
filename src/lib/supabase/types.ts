export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      products: {
        Row: {
          id: string
          slug: string
          name: string
          tagline: string | null
          description: string | null
          features: Json
          tech_stack: Json
          price_cents: number
          currency: string
          cover_image: string | null
          stripe_product_id: string | null
          stripe_price_id: string | null
          storage_path: string | null
          status: 'draft' | 'published'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          tagline?: string | null
          description?: string | null
          features?: Json
          tech_stack?: Json
          price_cents?: number
          currency?: string
          cover_image?: string | null
          stripe_product_id?: string | null
          stripe_price_id?: string | null
          storage_path?: string | null
          status?: 'draft' | 'published'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          tagline?: string | null
          description?: string | null
          features?: Json
          tech_stack?: Json
          price_cents?: number
          currency?: string
          cover_image?: string | null
          stripe_product_id?: string | null
          stripe_price_id?: string | null
          storage_path?: string | null
          status?: 'draft' | 'published'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          user_id: string
          product_id: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent: string | null
          amount_cents: number | null
          currency: string | null
          status: 'pending' | 'paid' | 'refunded'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent?: string | null
          amount_cents?: number | null
          currency?: string | null
          status?: 'pending' | 'paid' | 'refunded'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent?: string | null
          amount_cents?: number | null
          currency?: string | null
          status?: 'pending' | 'paid' | 'refunded'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'orders_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'orders_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      entitlements: {
        Row: {
          id: string
          user_id: string
          product_id: string
          order_id: string | null
          download_count: number
          download_limit: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          order_id?: string | null
          download_count?: number
          download_limit?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          order_id?: string | null
          download_count?: number
          download_limit?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'entitlements_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'entitlements_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'entitlements_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      downloads: {
        Row: {
          id: string
          entitlement_id: string | null
          user_id: string
          product_id: string
          ip: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          entitlement_id?: string | null
          user_id: string
          product_id: string
          ip?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          entitlement_id?: string | null
          user_id?: string
          product_id?: string
          ip?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'downloads_entitlement_id_fkey'
            columns: ['entitlement_id']
            isOneToOne: false
            referencedRelation: 'entitlements'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type Entitlement = Database['public']['Tables']['entitlements']['Row']
export type Download = Database['public']['Tables']['downloads']['Row']
