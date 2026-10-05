export interface Recipe {
  id: string;
  owner_id: string;
  owner_name: string;
  title: string;
  description?: string;
  ingredients: string;
  steps: string;
  servings?: number;
  prep_time_minutes?: number;
  category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type RecipeInput = Omit<
  Recipe,
  'id' | 'owner_id' | 'owner_name' | 'is_active' | 'created_at' | 'updated_at'
>;
