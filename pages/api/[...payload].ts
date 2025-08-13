import { NextApiRequest, NextApiResponse } from 'next'
import payload from 'payload'

// Initialize Payload CMS
let payloadInitialized = false

const initPayload = async () => {
  if (!payloadInitialized) {
    await payload.init({
      secret: process.env.PAYLOAD_SECRET || 'fallback-secret',
      express: undefined,
      onInit: () => {
        console.log('Payload initialized for Vercel')
      },
    })
    payloadInitialized = true
  }
}

// This endpoint handles all Payload CMS API routes
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await initPayload()
  
  // Handle the request through Payload's built-in API
  return payload.authenticate(req, res)
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    externalResolver: true,
  },
}
