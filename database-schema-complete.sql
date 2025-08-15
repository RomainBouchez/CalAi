-- ========================================
-- SCHÉMA COMPLET POUR CALAI + CLERK + NEON
-- ========================================
-- À exécuter dans la console SQL de Neon

-- 1. TABLE USERS (synchronisée avec Clerk)
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Clerk user ID
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. TABLE FOOD_ENTRIES (journal alimentaire)
-- ============================================
CREATE TABLE IF NOT EXISTS food_entries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein DECIMAL(8,2) NOT NULL,
  carbs DECIMAL(8,2) NOT NULL,
  fats DECIMAL(8,2) NOT NULL,
  estimated_weight_grams INTEGER,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  image_url TEXT,
  vitamins TEXT[], -- Array pour stocker les vitamines
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  date_consumed DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_food_entries_user_id ON food_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_food_entries_created_at ON food_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_food_entries_date_consumed ON food_entries(date_consumed);
CREATE INDEX IF NOT EXISTS idx_food_entries_user_date ON food_entries(user_id, date_consumed);
CREATE INDEX IF NOT EXISTS idx_food_entries_meal_type ON food_entries(meal_type);

-- 3. TABLE NUTRITION_GOALS (objectifs nutritionnels)
-- ===================================================
CREATE TABLE IF NOT EXISTS nutrition_goals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('daily', 'breakfast', 'lunch', 'dinner', 'snack')),
  calories INTEGER NOT NULL DEFAULT 2000,
  protein DECIMAL(8,2) NOT NULL DEFAULT 150,
  carbs DECIMAL(8,2) NOT NULL DEFAULT 250,
  fats DECIMAL(8,2) NOT NULL DEFAULT 65,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, goal_type) -- Un seul objectif par type par utilisateur
);

-- Index pour les objectifs
CREATE INDEX IF NOT EXISTS idx_nutrition_goals_user_id ON nutrition_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_goals_goal_type ON nutrition_goals(goal_type);

-- 4. FONCTIONS UTILITAIRES
-- =========================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. TRIGGERS
-- ============

-- Trigger pour users
CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour nutrition_goals
CREATE TRIGGER update_nutrition_goals_updated_at 
BEFORE UPDATE ON nutrition_goals
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. FONCTION POUR CRÉER LES OBJECTIFS PAR DÉFAUT
-- ================================================
CREATE OR REPLACE FUNCTION create_default_nutrition_goals(user_id_param TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO nutrition_goals (user_id, goal_type, calories, protein, carbs, fats) 
    VALUES 
      (user_id_param, 'daily', 2000, 150, 250, 65),
      (user_id_param, 'breakfast', 400, 30, 50, 13),
      (user_id_param, 'lunch', 600, 45, 75, 20),
      (user_id_param, 'dinner', 700, 53, 88, 23),
      (user_id_param, 'snack', 300, 22, 37, 9)
    ON CONFLICT (user_id, goal_type) DO NOTHING;
END;
$$ language 'plpgsql';

-- 7. TRIGGER POUR CRÉER AUTOMATIQUEMENT LES OBJECTIFS
-- ====================================================
CREATE OR REPLACE FUNCTION create_user_defaults()
RETURNS TRIGGER AS $$
BEGIN
    -- Créer les objectifs nutritionnels par défaut
    PERFORM create_default_nutrition_goals(NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger qui s'exécute après insertion d'un utilisateur
CREATE TRIGGER create_user_defaults_trigger
AFTER INSERT ON users
FOR EACH ROW EXECUTE FUNCTION create_user_defaults();

-- 8. VUES UTILES (optionnel)
-- ===========================

-- Vue pour obtenir les statistiques quotidiennes d'un utilisateur
CREATE OR REPLACE VIEW user_daily_stats AS
SELECT 
    user_id,
    date_consumed,
    COUNT(*) as total_entries,
    SUM(calories) as total_calories,
    SUM(protein) as total_protein,
    SUM(carbs) as total_carbs,
    SUM(fats) as total_fats,
    COUNT(CASE WHEN meal_type = 'breakfast' THEN 1 END) as breakfast_entries,
    COUNT(CASE WHEN meal_type = 'lunch' THEN 1 END) as lunch_entries,
    COUNT(CASE WHEN meal_type = 'dinner' THEN 1 END) as dinner_entries,
    COUNT(CASE WHEN meal_type = 'snack' THEN 1 END) as snack_entries
FROM food_entries
GROUP BY user_id, date_consumed;

-- 9. DONNÉES DE TEST (optionnel - à supprimer en production)
-- ===========================================================

-- Créer un utilisateur de test (optionnel)
-- INSERT INTO users (id, email, first_name, last_name) 
-- VALUES ('test-user-123', 'test@example.com', 'Test', 'User')
-- ON CONFLICT (id) DO NOTHING;

-- ========================================
-- VÉRIFICATION DE L'INSTALLATION
-- ========================================

-- Vérifier que toutes les tables sont créées
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN ('users', 'food_entries', 'nutrition_goals')
ORDER BY tablename;

-- Vérifier les contraintes
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    conrelid::regclass as table_name
FROM pg_constraint 
WHERE conrelid IN (
    'users'::regclass, 
    'food_entries'::regclass, 
    'nutrition_goals'::regclass
)
ORDER BY table_name, constraint_name;