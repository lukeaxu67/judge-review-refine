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
      annotation_data: {
        Row: {
          account: string | null
          case_id: number
          dimension: string
          filename: string
          fingerprint: string
          human_action: string | null
          human_judgement: string | null
          human_reasoning: string | null
          id: string
          llm_judgement: string | null
          llm_other01: string | null
          llm_other02: string | null
          llm_other03: string | null
          llm_other04: string | null
          llm_other05: string | null
          llm_other06: string | null
          llm_other07: string | null
          llm_other08: string | null
          llm_other09: string | null
          llm_other10: string | null
          llm_reasoning: string | null
          target1: Json | null
          target1_other01: string | null
          target1_other02: string | null
          target1_other03: string | null
          target1_other04: string | null
          target1_other05: string | null
          target1_other06: string | null
          target1_other07: string | null
          target1_other08: string | null
          target1_other09: string | null
          target1_other10: string | null
          target2: Json | null
          target2_other01: string | null
          target2_other02: string | null
          target2_other03: string | null
          target2_other04: string | null
          target2_other05: string | null
          target2_other06: string | null
          target2_other07: string | null
          target2_other08: string | null
          target2_other09: string | null
          target2_other10: string | null
          taskhash: string
          timestamp: string
        }
        Insert: {
          account?: string | null
          case_id: number
          dimension: string
          filename: string
          fingerprint: string
          human_action?: string | null
          human_judgement?: string | null
          human_reasoning?: string | null
          id?: string
          llm_judgement?: string | null
          llm_other01?: string | null
          llm_other02?: string | null
          llm_other03?: string | null
          llm_other04?: string | null
          llm_other05?: string | null
          llm_other06?: string | null
          llm_other07?: string | null
          llm_other08?: string | null
          llm_other09?: string | null
          llm_other10?: string | null
          llm_reasoning?: string | null
          target1?: Json | null
          target1_other01?: string | null
          target1_other02?: string | null
          target1_other03?: string | null
          target1_other04?: string | null
          target1_other05?: string | null
          target1_other06?: string | null
          target1_other07?: string | null
          target1_other08?: string | null
          target1_other09?: string | null
          target1_other10?: string | null
          target2?: Json | null
          target2_other01?: string | null
          target2_other02?: string | null
          target2_other03?: string | null
          target2_other04?: string | null
          target2_other05?: string | null
          target2_other06?: string | null
          target2_other07?: string | null
          target2_other08?: string | null
          target2_other09?: string | null
          target2_other10?: string | null
          taskhash: string
          timestamp?: string
        }
        Update: {
          account?: string | null
          case_id?: number
          dimension?: string
          filename?: string
          fingerprint?: string
          human_action?: string | null
          human_judgement?: string | null
          human_reasoning?: string | null
          id?: string
          llm_judgement?: string | null
          llm_other01?: string | null
          llm_other02?: string | null
          llm_other03?: string | null
          llm_other04?: string | null
          llm_other05?: string | null
          llm_other06?: string | null
          llm_other07?: string | null
          llm_other08?: string | null
          llm_other09?: string | null
          llm_other10?: string | null
          llm_reasoning?: string | null
          target1?: Json | null
          target1_other01?: string | null
          target1_other02?: string | null
          target1_other03?: string | null
          target1_other04?: string | null
          target1_other05?: string | null
          target1_other06?: string | null
          target1_other07?: string | null
          target1_other08?: string | null
          target1_other09?: string | null
          target1_other10?: string | null
          target2?: Json | null
          target2_other01?: string | null
          target2_other02?: string | null
          target2_other03?: string | null
          target2_other04?: string | null
          target2_other05?: string | null
          target2_other06?: string | null
          target2_other07?: string | null
          target2_other08?: string | null
          target2_other09?: string | null
          target2_other10?: string | null
          taskhash?: string
          timestamp?: string
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
