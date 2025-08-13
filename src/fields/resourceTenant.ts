import { Config } from "payload/config";
import { CollectionConfig, Field, GlobalConfig } from "payload/types";
import { TenancyOptions } from "../options";
import { RequestWithTenant } from "../utils/requestWithTenant";
import { mergeObjects } from "../utils/mergeObjects";

/** @returns Tenant field for generic resources. */
export const createResourceTenantField = ({
  options: { tenantCollection },
  collection,
  global,
}: {
  options: TenancyOptions;
  config: Config;
  collection?: CollectionConfig;
  global?: GlobalConfig;
}): Field =>
  mergeObjects<Field>(
    {
      type: "relationship",
      name: "tenant",
      relationTo: tenantCollection,
      hidden: true,
      hooks: {
        beforeChange: [
          ({ req }) => {
            // Assign tenant to the document when it's created (or updated).
            const { tenant, user } = req as RequestWithTenant;

            // Safely handle cases where user might be undefined
            if (tenant?.id) {
              return tenant.id;
            }

            if (user?.tenant?.id) {
              return user.tenant.id;
            }

            if (user?.tenant) {
              return user.tenant;
            }

            // Return null if no tenant can be determined
            return null;
          },
        ],
      },
    },
    (collection ?? global)?.fields.find(
      (field) => "name" in field && field.name === "tenant",
    ),
  );
