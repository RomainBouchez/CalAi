# 🔗 Configuration Webhook Clerk → Neon

## 📋 **Étapes à suivre dans l'ordre :**

### **1. Exécuter le schéma SQL dans Neon Console**
1. Ouvrez votre [console Neon](https://console.neon.tech)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Copiez et exécutez le contenu de `database-schema-complete.sql`
5. Vérifiez que toutes les tables sont créées

### **2. Vérifier les variables d'environnement**
Dans votre fichier `.env.local`, vous devez avoir :
```env
# Clerk Keys (depuis votre dashboard Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database
DATABASE_URL="postgres://..."

# Webhook (vous le récupérerez à l'étape 4)
CLERK_WEBHOOK_SECRET=whsec_...

# URLs Clerk
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/signin
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### **3. Déployer votre application sur Vercel**
```bash
# Dans votre terminal
vercel --prod

# Ou connectez votre repo GitHub à Vercel
# Et configurez les variables d'environnement dans Vercel Dashboard
```

### **4. Configurer le webhook dans Clerk Dashboard**

1. **Accédez à votre [dashboard Clerk](https://dashboard.clerk.com)**

2. **Sélectionnez votre application**

3. **Allez dans "Webhooks" dans la sidebar**

4. **Cliquez sur "Add Endpoint"**

5. **Configurez l'endpoint :**
   - **Endpoint URL :** `https://votre-app.vercel.app/api/webhooks/clerk`
   - **Description :** "Neon Database Sync"
   
6. **Sélectionnez les événements :**
   - ✅ `user.created`
   - ✅ `user.updated` 
   - ✅ `user.deleted`

7. **Cliquez sur "Create"**

8. **Copiez le Webhook Secret**
   - Cliquez sur l'endpoint créé
   - Copiez la valeur "Signing Secret"
   - Ajoutez-la à vos variables d'environnement : `CLERK_WEBHOOK_SECRET=whsec_...`

### **5. Tester l'intégration**

#### **Test 1 : Vérifier l'endpoint**
```bash
curl https://votre-app.vercel.app/api/test-webhook
```

#### **Test 2 : Créer un compte de test**
1. Allez sur votre app : `https://votre-app.vercel.app`
2. Cliquez sur "Sign Up" dans le Dock
3. Créez un compte de test
4. Vérifiez dans votre base Neon que :
   - L'utilisateur est créé dans `users`
   - Les objectifs par défaut sont créés dans `nutrition_goals`

#### **Test 3 : Vérifier les logs**
1. Dans Vercel Dashboard → Functions → Logs
2. Cherchez les logs du webhook
3. Vérifiez qu'il n'y a pas d'erreurs

### **6. Résolution des problèmes courants**

#### **❌ Webhook ne se déclenche pas :**
- Vérifiez que l'URL est correcte
- Vérifiez que l'app est déployée
- Vérifiez les événements sélectionnés

#### **❌ Erreur de vérification :**
- Vérifiez que `CLERK_WEBHOOK_SECRET` est correct
- Vérifiez qu'il n'y a pas d'espaces dans la variable

#### **❌ Erreur base de données :**
- Vérifiez que `DATABASE_URL` est correct
- Vérifiez que le schéma SQL a été exécuté
- Vérifiez que les tables existent

#### **❌ Utilisateur non créé :**
- Vérifiez les logs Vercel
- Vérifiez que la fonction `create_default_nutrition_goals` existe
- Testez manuellement la création d'utilisateur

### **7. Commandes SQL de débogage**

```sql
-- Vérifier que les tables existent
SELECT tablename FROM pg_tables WHERE tablename IN ('users', 'food_entries', 'nutrition_goals');

-- Vérifier qu'un utilisateur a été créé
SELECT * FROM users ORDER BY created_at DESC LIMIT 5;

-- Vérifier que les objectifs ont été créés
SELECT * FROM nutrition_goals WHERE user_id = 'ID_UTILISATEUR_CLERK';

-- Vérifier les triggers
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE event_object_table IN ('users', 'nutrition_goals');

-- Test manuel de création d'objectifs
SELECT create_default_nutrition_goals('test-user-id');
```

### **8. Vérification finale**

✅ **L'application fonctionne si :**
- Vous pouvez créer un compte
- L'utilisateur apparaît dans la table `users`
- 5 objectifs nutritionnels sont créés dans `nutrition_goals`
- Le bouton "Compte" apparaît dans le Dock
- Vous pouvez accéder à `/profile` sans erreur

---

## 🚨 **Support**

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans Vercel
2. Testez l'endpoint `/api/test-webhook`
3. Vérifiez que toutes les variables d'environnement sont configurées
4. Exécutez les commandes SQL de débogage