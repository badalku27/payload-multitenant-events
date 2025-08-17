import dotenv from 'dotenv'
import path from 'path'

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
})

import express from 'express'
import payload from 'payload'

const app = express()

app.get('/', (_, res) => {
  res.redirect('/admin')
})

const start = async (): Promise<void> => {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    express: app,
    config: require('./payload-minimal.config').default,
  })

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000
  app.listen(port, () => {
    console.log(`Server started on port ${port}`)
    console.log(`Admin: http://localhost:${port}/admin`)
  })
}

start()
