import { webpackBundler } from '@payloadcms/bundler-webpack'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { slateEditor } from '@payloadcms/richtext-slate'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
})

import { buildConfig } from 'payload/config'
import { Tenants } from './collections/Tenants'
import Users from './collections/Users/minimal'
import { Pages } from './collections/Pages'

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || `http://localhost:${process.env.PORT || 3000}`,
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
    webpack: config => ({
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          dotenv: path.resolve(__dirname, './dotenv.js'),
        },
      },
    }),
  },
  editor: slateEditor({}),
  db: mongooseAdapter({
    url: process.env.MONGODB_URI,
  }),
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  collections: [
    Pages,
    Tenants,
    Users,
  ],
})
