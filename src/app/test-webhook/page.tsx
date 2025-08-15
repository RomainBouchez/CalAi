'use client'

import { useState, useEffect } from 'react'

export default function TestWebhookPage() {
  const [envStatus, setEnvStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkEnvironment()
  }, [])

  const checkEnvironment = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/test-webhook')
      if (response.ok) {
        const data = await response.json()
        setEnvStatus(data)
      } else {
        setError('Erreur lors de la vérification de l\'environnement')
      }
    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const testDatabaseConnection = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/check-tables')
      if (response.ok) {
        const data = await response.json()
        alert(`Connexion DB réussie! Tables trouvées: ${data.tables.join(', ')}`)
      } else {
        alert('Erreur de connexion à la base de données')
      }
    } catch (err) {
      alert('Erreur lors du test de connexion')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Chargement...</div>
  }

  if (error) {
    return <div className="p-8 text-red-600">Erreur: {error}</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Test Webhook Clerk & Configuration</h1>
      
      <div className="grid gap-6">
        {/* Statut des variables d'environnement */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Variables d'environnement</h2>
          {envStatus && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>DATABASE_URL:</span>
                <span className={envStatus.DATABASE_URL === 'Set' ? 'text-green-600' : 'text-red-600'}>
                  {envStatus.DATABASE_URL}
                </span>
              </div>
              <div className="flex justify-between">
                <span>CLERK_WEBHOOK_SECRET:</span>
                <span className={envStatus.CLERK_WEBHOOK_SECRET === 'Set' ? 'text-green-600' : 'text-red-600'}>
                  {envStatus.CLERK_WEBHOOK_SECRET}
                </span>
              </div>
              <div className="flex justify-between">
                <span>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:</span>
                <span className={envStatus.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === 'Set' ? 'text-green-600' : 'text-red-600'}>
                  {envStatus.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Test de connexion à la base de données */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Test Base de Données</h2>
          <button
            onClick={testDatabaseConnection}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Tester la connexion DB
          </button>
        </div>

        {/* Instructions pour tester le webhook */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Test Webhook Clerk</h2>
          <div className="space-y-4">
            <p className="text-gray-700">
              Pour tester le webhook Clerk, vous devez :
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Aller sur le dashboard Clerk</li>
              <li>Configurer l'URL du webhook : <code className="bg-gray-100 px-2 py-1 rounded">https://cal-hk7p7jcev-romainbouchezs-projects.vercel.app/api/webhooks/clerk</code></li>
              <li>Créer un nouvel utilisateur via l'interface Clerk</li>
              <li>Vérifier les logs dans le dashboard Vercel</li>
            </ol>
          </div>
        </div>

        {/* URL du webhook */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">URL du Webhook</h2>
          <div className="bg-gray-100 p-4 rounded">
            <code className="break-all">
              https://cal-hk7p7jcev-romainbouchezs-projects.vercel.app/api/webhooks/clerk
            </code>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Copiez cette URL dans la configuration de votre webhook Clerk
          </p>
        </div>
      </div>
    </div>
  )
}
