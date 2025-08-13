import { Access, Config } from "payload/config";
import { TenancyOptions } from "../options";
import { getAuthorizedTenants } from "../utils/getAuthorizedTenants";
import { limitAccess } from "../utils/limitAccess";
import { createDefaultAccess } from "../utils/defaultAccess";
import { RequestWithTenant } from "../utils/requestWithTenant";

/**
 * Limits tenant access to users that belong to the same or above tenant.
 *
 * @returns Collection access control for tenants
 */
export const createTenantReadAccess =
  ({
    options,
    original,
  }: {
    options: TenancyOptions;
    config: Config;
    original?: Access;
  }): Access =>
  async (args) => {
    if (!original) {
      original = createDefaultAccess({ options, payload: args.req.payload });
    }

    if (["path", "domain"].includes(options.isolationStrategy)) {
      // Limit requested tenant or its sub-tenants.
      try {
        return limitAccess(await original(args), {
          id: {
            in: await getAuthorizedTenants({
              options,
              payload: args.req.payload,
              tenantId: (args.req as RequestWithTenant).tenant.id,
            }),
          },
        });
      } catch (error) {
        console.error("Error in tenant read access:", error);
        return false;
      }
    }

    // User must be logged in.
    if (!args.req.user) {
      return true; // Allow during initial setup
    }

    // Initial user doesn't have an assigned tenant during installation
    // process, so it's allowed to access tenants to create one.
    if (!args.req.user.tenant) {
      return true;
    }

    // Limit access to users's tenant or its sub-tenants.
    try {
      return limitAccess(await original(args), {
        id: {
          in: await getAuthorizedTenants({
            options,
            payload: args.req.payload,
            tenantId: args.req.user.tenant.id || args.req.user.tenant,
          }),
        },
      });
    } catch (error) {
      console.error("Error getting authorized tenants:", error);
      return false;
    }
  };

/**
 * Limits deletion of current tenant or above tenants.
 *
 * @param original Original access control to take into account.
 * @returns Collection access control for tenants
 */
export const createTenantDeleteAccess =
  ({
    options,
    original,
  }: {
    options: TenancyOptions;
    config: Config;
    original?: Access;
  }): Access =>
  async (args) => {
    if (!original) {
      original = createDefaultAccess({ options, payload: args.req.payload });
    }

    // User must be logged in and have assigned tenant.
    if (!args.req.user?.tenant) {
      return false;
    }

    if (["path", "domain"].includes(options.isolationStrategy)) {
      // Allow deletion of tenants below requested tenant.
      try {
        return limitAccess(await original(args), {
          parent: {
            in: await getAuthorizedTenants({
              options,
              payload: args.req.payload,
              tenantId: (args.req as RequestWithTenant).tenant.id,
            }),
          },
        });
      } catch (error) {
        console.error("Error in tenant delete access:", error);
        return false;
      }
    }

    // Allow deletion of tenants below users's tenant.
    try {
      return limitAccess(await original(args), {
        parent: {
          in: await getAuthorizedTenants({
            options,
            payload: args.req.payload,
            tenantId: args.req.user.tenant.id || args.req.user.tenant,
          }),
        },
      });
    } catch (error) {
      console.error("Error in tenant delete access:", error);
      return false;
    }
  };
