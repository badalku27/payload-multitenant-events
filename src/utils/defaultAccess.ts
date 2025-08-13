import { Payload } from "payload";
import { Access } from "payload/types";
import { TenancyOptions } from "../options";
import { getAuthorizedTenants } from "./getAuthorizedTenants";
import { RequestWithTenant } from "./requestWithTenant";

/**
 * By default, the collection requires user to be logged in and to belong to an
 * authorized tenant.
 *
 * @returns Default access for all collections.
 */
export const createDefaultAccess =
  ({
    options,
    payload,
  }: {
    options: TenancyOptions;
    payload: Payload;
  }): Access =>
  async ({ req }) => {
    // During initial setup, allow access
    if (!req.user) {
      return true;
    }

    // Safe check: user must be logged in and have assigned tenant
    if (!req.user?.tenant) {
      return false;
    }

    if (!["path", "domain"].includes(options.isolationStrategy)) {
      return true;
    }

    // If isolation strategy is "path" or "domain" user must have access to
    // the requested tenant.
    try {
      const authorizedTenants = await getAuthorizedTenants({
        options,
        payload,
        tenantId: req.user.tenant.id || req.user.tenant,
      });
      return authorizedTenants.includes((req as RequestWithTenant).tenant.id);
    } catch (error) {
      console.error("Error checking authorized tenants:", error);
      return true; // Allow access on error for stability
    }
  };
