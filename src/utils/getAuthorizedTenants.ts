import { Payload } from "payload";
import { TenancyOptions } from "../options";

/**
 * @returns All tenant IDs that the tenant has access to. Output will be the
 *   inputted tenant ID and all sub-tenant IDs.
 */
export const getAuthorizedTenants = async ({
  options,
  payload,
  tenantId,
}: {
  options: TenancyOptions;
  payload: Payload;
  /** The tenant who's authorization to list */
  tenantId: string;
}): Promise<string[]> => {
  if (!tenantId) return [];

  try {
    const childTenants = await payload.find({
      collection: options.tenantCollection,
      where: { parent: { equals: tenantId } },
    });

    const childTenantIds = await Promise.all(
      childTenants.docs.map((tenant) =>
        getAuthorizedTenants({
          options,
          payload,
          tenantId: tenant.id as string,
        }),
      ),
    );

    return [tenantId, ...childTenantIds.flat()];
  } catch (error) {
    console.error("Error getting authorized tenants:", error);
    return [tenantId]; // Return at least the current tenant ID
  }
};
