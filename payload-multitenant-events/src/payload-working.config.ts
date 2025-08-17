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
      fields: [
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
  ],
  typescript: {
    outputFile: 'src/payload-types.ts',
  },
  db: mongooseAdapter({
    url: process.env.MONGODB_URI,
  }),
})
