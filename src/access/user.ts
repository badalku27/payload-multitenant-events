import { Access, Config } from "payload/config";
import { TenancyOptions } from "../options";
import { createDefaultAccess } from "../utils/defaultAccess";
import { getAuthorizedTenants } from "../utils/getAuthorizedTenants";
import { limitAccess } from "../utils/limitAccess";
import { RequestWithTenant } from "../utils/requestWithTenant";

/**
 * Limits user access to users that belong to the same or above tenant.
 *
 * @returns Collection access control for users
 */
export const createUserReadAccess =
  ({
    options,
    /** Original access control to take into account. */
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
          or: [
            {
              tenant: {
                in: await getAuthorizedTenants({
                  options,
                  payload: args.req.payload,
                  tenantId: (args.req as RequestWithTenant).tenant.id,
                }),
              },
            },
            // Current user must be always accessible.
            {
              id: {
                equals: args.req.user?.id,
              },
            },
          ],
        });
      } catch (error) {
        console.error("Error in user read access:", error);
        return false;
      }
    }

    // User must be logged in.
    if (!args.req.user) {
      return true; // Allow during initial setup
    }

    // Initial user doesn't have an assigned tenant during installation
    // process, and must be allowed to access it's own profile.
    if (!args.req.user.tenant) {
      return true;
    }

    // Limit access to users's tenant or its sub-tenants.
    try {
      return limitAccess(await original(args), {
        tenant: {
          in: await getAuthorizedTenants({
            options,
            payload: args.req.payload,
            tenantId: args.req.user.tenant.id || args.req.user.tenant,
          }),
        },
      });
    } catch (error) {
      console.error("Error getting authorized tenants for user access:", error);
      return false;
    }
  };

/**
 * Limits user creation to users with tenant.
 *
 * @param original Original access control to take into account.
 * @returns Collection access control for users
 */
export const createUserCreateAccess =
  ({
    options,
    original,
  }: {
    options: TenancyOptions;
    config: Config;
    original?: Access;
  }): Access =>
  (args) => {
    if (!original) {
      original = createDefaultAccess({ options, payload: args.req.payload });
    }

    if (["path", "domain"].includes(options.isolationStrategy)) {
      return original(args);
    }

    // User must be logged in and have assigned tenant.
    return Boolean(args.req.user?.tenant) && original(args);
  };
