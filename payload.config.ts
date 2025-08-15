import { buildConfig } from "payload/config";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { slateEditor } from "@payloadcms/richtext-slate";
import { webpackBundler } from "@payloadcms/bundler-webpack";
import { tenancy } from "./src/plugin";

export default buildConfig({
  admin: {
    bundler: webpackBundler(),
    user: "users",
  },
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || "mongodb://127.0.0.1/payload-multitenant",
  }),
  editor: slateEditor({}),
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || "http://localhost:3000",
  secret: process.env.PAYLOAD_SECRET || "your-secret-here",
  plugins: [
    tenancy({ 
      isolationStrategy: "user" 
    })
  ],
  collections: [
    {
      slug: "users",
      auth: true,
      fields: [],
    },
    {
      slug: "tenants",
      fields: [],
    },
    {
      slug: "posts",
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
        },
        {
          name: "content",
          type: "textarea",
        },
        {
          name: "status",
          type: "select",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Published", value: "published" },
          ],
          defaultValue: "draft",
        },
      ],
    },
  ],
  typescript: {
    outputFile: "./payload-types.ts",
  },
});
