export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          diff: Json | null
          id: number
          row_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          diff?: Json | null
          id?: number
          row_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          diff?: Json | null
          id?: number
          row_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      blog_post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category_id: string | null
          content_md: string | null
          cover_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          reading_minutes: number | null
          seo_description: string | null
          seo_og_image: string | null
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["publish_status"]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content_md?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          reading_minutes?: number | null
          seo_description?: string | null
          seo_og_image?: string | null
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["publish_status"]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content_md?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          reading_minutes?: number | null
          seo_description?: string | null
          seo_og_image?: string | null
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["publish_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_activities: {
        Row: {
          actor_id: string | null
          created_at: string
          id: string
          lead_id: string
          payload: Json
          type: Database["public"]["Enums"]["lead_activity_type"]
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: string
          lead_id: string
          payload?: Json
          type: Database["public"]["Enums"]["lead_activity_type"]
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string
          payload?: Json
          type?: Database["public"]["Enums"]["lead_activity_type"]
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          budget_max_idr: number | null
          budget_min_idr: number | null
          created_at: string
          email: string | null
          full_name: string
          guest_count: number | null
          id: string
          landing_page: string | null
          message: string | null
          package_interest_id: string | null
          phone: string
          referrer: string | null
          source: Database["public"]["Enums"]["lead_source"]
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          venue_type: string | null
          wedding_date: string | null
          wedding_type: string | null
        }
        Insert: {
          assigned_to?: string | null
          budget_max_idr?: number | null
          budget_min_idr?: number | null
          created_at?: string
          email?: string | null
          full_name: string
          guest_count?: number | null
          id?: string
          landing_page?: string | null
          message?: string | null
          package_interest_id?: string | null
          phone: string
          referrer?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          venue_type?: string | null
          wedding_date?: string | null
          wedding_type?: string | null
        }
        Update: {
          assigned_to?: string | null
          budget_max_idr?: number | null
          budget_min_idr?: number | null
          created_at?: string
          email?: string | null
          full_name?: string
          guest_count?: number | null
          id?: string
          landing_page?: string | null
          message?: string | null
          package_interest_id?: string | null
          phone?: string
          referrer?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          venue_type?: string | null
          wedding_date?: string | null
          wedding_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_package_interest_id_fkey"
            columns: ["package_interest_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          alt: string | null
          created_at: string
          height: number | null
          id: string
          mime: string | null
          size_bytes: number | null
          storage_bucket: string
          storage_path: string
          uploaded_by: string | null
          url: string
          width: number | null
        }
        Insert: {
          alt?: string | null
          created_at?: string
          height?: number | null
          id?: string
          mime?: string | null
          size_bytes?: number | null
          storage_bucket: string
          storage_path: string
          uploaded_by?: string | null
          url: string
          width?: number | null
        }
        Update: {
          alt?: string | null
          created_at?: string
          height?: number | null
          id?: string
          mime?: string | null
          size_bytes?: number | null
          storage_bucket?: string
          storage_path?: string
          uploaded_by?: string | null
          url?: string
          width?: number | null
        }
        Relationships: []
      }
      package_benefits: {
        Row: {
          icon: string | null
          id: string
          label: string
          package_id: string
          sort_order: number
        }
        Insert: {
          icon?: string | null
          id?: string
          label: string
          package_id: string
          sort_order?: number
        }
        Update: {
          icon?: string | null
          id?: string
          label?: string
          package_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "package_benefits_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      package_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      package_faqs: {
        Row: {
          answer: string
          id: string
          package_id: string
          question: string
          sort_order: number
        }
        Insert: {
          answer: string
          id?: string
          package_id: string
          question: string
          sort_order?: number
        }
        Update: {
          answer?: string
          id?: string
          package_id?: string
          question?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "package_faqs_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      package_media: {
        Row: {
          alt: string | null
          created_at: string
          id: string
          package_id: string
          sort_order: number
          url: string
        }
        Insert: {
          alt?: string | null
          created_at?: string
          id?: string
          package_id: string
          sort_order?: number
          url: string
        }
        Update: {
          alt?: string | null
          created_at?: string
          id?: string
          package_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_media_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      package_rules: {
        Row: {
          budget_max_idr: number | null
          budget_min_idr: number | null
          created_at: string
          id: string
          is_active: boolean
          max_guests: number | null
          min_guests: number | null
          notes: string | null
          package_id: string
          priority: number
          updated_at: string
          venue_type: string | null
          wedding_type: string | null
        }
        Insert: {
          budget_max_idr?: number | null
          budget_min_idr?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          max_guests?: number | null
          min_guests?: number | null
          notes?: string | null
          package_id: string
          priority?: number
          updated_at?: string
          venue_type?: string | null
          wedding_type?: string | null
        }
        Update: {
          budget_max_idr?: number | null
          budget_min_idr?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          max_guests?: number | null
          min_guests?: number | null
          notes?: string | null
          package_id?: string
          priority?: number
          updated_at?: string
          venue_type?: string | null
          wedding_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "package_rules_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      package_tag_mappings: {
        Row: {
          package_id: string
          tag_id: string
        }
        Insert: {
          package_id: string
          tag_id: string
        }
        Update: {
          package_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_tag_mappings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_tag_mappings_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "package_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      package_tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      package_videos: {
        Row: {
          created_at: string
          id: string
          package_id: string
          sort_order: number
          title: string | null
          video_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          package_id: string
          sort_order?: number
          title?: string | null
          video_url: string
        }
        Update: {
          created_at?: string
          id?: string
          package_id?: string
          sort_order?: number
          title?: string | null
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_videos_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          category_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          normal_price_idr: number
          promo_ends_at: string | null
          promo_label: string | null
          promo_price_idr: number | null
          promo_starts_at: string | null
          seo_description: string | null
          seo_og_image: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["publish_status"]
          subtitle: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          normal_price_idr: number
          promo_ends_at?: string | null
          promo_label?: string | null
          promo_price_idr?: number | null
          promo_starts_at?: string | null
          seo_description?: string | null
          seo_og_image?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["publish_status"]
          subtitle?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          normal_price_idr?: number
          promo_ends_at?: string | null
          promo_label?: string | null
          promo_price_idr?: number | null
          promo_starts_at?: string | null
          seo_description?: string | null
          seo_og_image?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["publish_status"]
          subtitle?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "packages_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "package_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      portfolio_category_mappings: {
        Row: {
          category_id: string
          portfolio_id: string
        }
        Insert: {
          category_id: string
          portfolio_id: string
        }
        Update: {
          category_id?: string
          portfolio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_category_mappings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "portfolio_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_category_mappings_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_media: {
        Row: {
          alt: string | null
          id: string
          portfolio_id: string
          sort_order: number
          url: string
        }
        Insert: {
          alt?: string | null
          id?: string
          portfolio_id: string
          sort_order?: number
          url: string
        }
        Update: {
          alt?: string | null
          id?: string
          portfolio_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_media_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_story: {
        Row: {
          hasil: string | null
          masalah: string | null
          portfolio_id: string
          solusi: string | null
          updated_at: string
        }
        Insert: {
          hasil?: string | null
          masalah?: string | null
          portfolio_id: string
          solusi?: string | null
          updated_at?: string
        }
        Update: {
          hasil?: string | null
          masalah?: string | null
          portfolio_id?: string
          solusi?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_story_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: true
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_videos: {
        Row: {
          id: string
          portfolio_id: string
          sort_order: number
          video_url: string
        }
        Insert: {
          id?: string
          portfolio_id: string
          sort_order?: number
          video_url: string
        }
        Update: {
          id?: string
          portfolio_id?: string
          sort_order?: number
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_videos_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          cover_url: string | null
          created_at: string
          created_by: string | null
          event_date: string | null
          id: string
          location: string | null
          seo_description: string | null
          seo_og_image: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["publish_status"]
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          event_date?: string | null
          id?: string
          location?: string | null
          seo_description?: string | null
          seo_og_image?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["publish_status"]
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          event_date?: string | null
          id?: string
          location?: string | null
          seo_description?: string | null
          seo_og_image?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["publish_status"]
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          client_name: string
          content: string | null
          created_at: string
          created_by: string | null
          event_type: string | null
          featured: boolean
          id: string
          media_url: string | null
          rating: number
          sort_order: number
          status: Database["public"]["Enums"]["testimonial_status"]
          type: Database["public"]["Enums"]["testimonial_type"]
          updated_at: string
          video_url: string | null
        }
        Insert: {
          client_name: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          event_type?: string | null
          featured?: boolean
          id?: string
          media_url?: string | null
          rating?: number
          sort_order?: number
          status?: Database["public"]["Enums"]["testimonial_status"]
          type: Database["public"]["Enums"]["testimonial_type"]
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          client_name?: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          event_type?: string | null
          featured?: boolean
          id?: string
          media_url?: string | null
          rating?: number
          sort_order?: number
          status?: Database["public"]["Enums"]["testimonial_status"]
          type?: Database["public"]["Enums"]["testimonial_type"]
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      venue_types: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      wedding_types: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_any_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "content_admin"
        | "sales_admin"
        | "wedding_planner"
      lead_activity_type:
        | "note"
        | "call"
        | "whatsapp"
        | "status_change"
        | "assignment"
      lead_source:
        | "whatsapp"
        | "form"
        | "calculator"
        | "portfolio"
        | "package"
        | "other"
      lead_status: "new" | "contacted" | "qualified" | "booked" | "lost"
      publish_status: "draft" | "published" | "archived"
      testimonial_status: "pending" | "approved" | "rejected"
      testimonial_type: "video" | "photo" | "text"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "content_admin",
        "sales_admin",
        "wedding_planner",
      ],
      lead_activity_type: [
        "note",
        "call",
        "whatsapp",
        "status_change",
        "assignment",
      ],
      lead_source: [
        "whatsapp",
        "form",
        "calculator",
        "portfolio",
        "package",
        "other",
      ],
      lead_status: ["new", "contacted", "qualified", "booked", "lost"],
      publish_status: ["draft", "published", "archived"],
      testimonial_status: ["pending", "approved", "rejected"],
      testimonial_type: ["video", "photo", "text"],
    },
  },
} as const
