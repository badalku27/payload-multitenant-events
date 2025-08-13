import { buildConfig } from "payload/config";
import { tenancy } from "../../../src/plugin";
import { createBaseConfig } from "../../baseConfig";

const baseConfig = createBaseConfig();

export default buildConfig({
  ...baseConfig,
  plugins: [tenancy({ isolationStrategy: "user" })],
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
  admin: {
    ...baseConfig.admin,
    user: "users",
  },
});
