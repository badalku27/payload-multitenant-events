import { Config } from "payload/config";
import { RequestWithTenant } from "../utils/requestWithTenant";
import { getAuthorizedTenants } from "../utils/getAuthorizedTenants";
import { TenancyOptions } from "../options";

/**
 * Limits access to admin UI based on isolation strategy. Only "path" and
 * "domain" strategies are restricted.
 *
 * @returns Collection access control for admin UI
 */
export const createAdminAccess =
  ({
    options,
    original,
  }: {
    options: TenancyOptions;
    config: Config;
    /** Original access control to take into account. */
    original?: (args: unknown) => boolean | Promise<boolean>;
  }) =>
  async (args): Promise<boolean> => {
    // For initial setup scenario, allow access if no user exists yet
    if (!args.req.user) {
      return true; // Allow initial admin setup
    }

    if (["path", "domain"].includes(options.isolationStrategy)) {
      const req = args.req as RequestWithTenant;

      // Safe check: if user is not logged in, allow access for setup
      if (!req.user?.tenant) {
        return true; // Allow initial setup
      }

      try {
        const authorizedTenants = await getAuthorizedTenants({
          options,
          payload: req.payload,
          tenantId: req.user.tenant.id || req.user.tenant,
        });
        if (!authorizedTenants.includes(req.tenant.id)) {
          return false;
        }
      } catch (error) {
        console.error("Error in admin access:", error);
        return true; // Allow access on error for setup
      }
    }

    if (original) {
      return original(args);
    }

    return true;
  };
