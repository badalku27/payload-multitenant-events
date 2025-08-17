import type { CollectionConfig } from "payload/types";

import { superAdmins } from "../../access/superAdmins";
import { tenantAdmins } from "./access/tenantAdmins";

export const Tenants: CollectionConfig = {
  slug: "tenants",
  // Remove all access controls for initial setup
  admin: {
    useAsTitle: "name",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "domains",
      type: "array",
      index: true,
      fields: [
        {
          name: "domain",
          type: "text",
          required: true,
        },
      ],
    },
  ],
};
