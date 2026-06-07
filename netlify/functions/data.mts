import { getStore } from '@netlify/blobs'
import type { Config, Context } from '@netlify/functions'

export default async (req: Request, context: Context) => {
  const store = getStore({
    name: 'gold-loss-store',
    consistency: 'strong',
  })

  try {
    if (req.method === 'GET') {
      const casting = await store.get('gold_loss_casting', { type: 'json' }) || []
      const treeCasting = await store.get('gold_loss_tree_casting', { type: 'json' }) || []
      const rolling = await store.get('gold_loss_rolling', { type: 'json' }) || []
      const production = await store.get('gold_loss_production', { type: 'json' }) || []

      return Response.json({
        casting,
        treeCasting,
        rolling,
        production,
      })
    }

    if (req.method === 'POST') {
      const body = await req.json()
      const { key, data } = body

      if (!key || !Array.isArray(data)) {
        return new Response(JSON.stringify({ error: 'Invalid payload' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      await store.setJSON(key, data)
      return Response.json({ success: true })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error in blobs-api:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const config: Config = {
  path: '/api/data',
}
