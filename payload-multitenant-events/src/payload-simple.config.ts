import { webpackBundler } from '@payloadcms/bundler-webpack'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { slateEditor } from '@payloadcms/richtext-slate'
import { buildConfig } from 'payload/config'

export default buildConfig({
  serverURL: `http://localhost:${process.env.PORT || 3000}`,
  admin: {
    user: 'users',
    bundler: webpackBundler(),
  },
  editor: slateEditor({}),
  collections: [
    {
      slug: 'users',
      auth: true,
      access: {
        read: () => true,
        create: () => true,
        update: () => true,
        delete: () => true,
        admin: () => true,
      },
      fields: [
        {
          name: 'role',
          type: 'select',
          options: ['admin', 'user'],
          defaultValue: 'user',
        },
      ],
    },
  ],
  typescript: {
    outputFile: 'src/payload-types.ts',
  },
  graphQL: {
    schemaOutputFile: 'src/generated-schema.graphql',
  },
  db: mongooseAdapter({
    url: process.env.MONGODB_URI,
  }),
})
