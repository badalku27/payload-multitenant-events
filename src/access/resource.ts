import { Access, Config } from "payload/config";
import { TenancyOptions } from "../options";
import { limitAccess } from "../utils/limitAccess";
import { createDefaultAccess } from "../utils/defaultAccess";
import { RequestWithTenant } from "../utils/requestWithTenant";

/**
 * Limits resource access to resources that belong to the same tenant based on
 * user's tenant ("user" strategy) or requested tenant ("path" or "domain"
 * strategy).
 *
 * @returns Collection access control for generic resources
 */
export const createResourceReadAccess =
  ({
    options,
    original,
  }: {
    options: TenancyOptions;
    config: Config;
    /** Original access control to take into account. */
    original?: Access;
  }): Access =>
  async (args) => {
    if (!original) {
      original = createDefaultAccess({ options, payload: args.req.payload });
    }

    if (["path", "domain"].includes(options.isolationStrategy)) {
      // Limit requested tenant.
      try {
        return limitAccess(await original(args), {
          tenant: {
            equals: (args.req as RequestWithTenant).tenant.id,
          },
        });
      } catch (error) {
        console.error("Error in resource read access:", error);
        return false;
      }
    }

    // User must be logged in and have assigned tenant.
    if (!args.req.user?.tenant) {
      // During initial setup, if user is logged in but has no tenant, allow access
      if (args.req.user) {
        console.log("User has no tenant assigned, but allowing access for initial setup");
        return true;
      }
      return false;
    }

    // Limit access to users's tenant.
    try {
      return limitAccess(await original(args), {
        tenant: {
          equals: args.req.user.tenant.id || args.req.user.tenant,
        },
      });
    } catch (error) {
      console.error("Error in resource read access:", error);
      return false;
    }
  };

/**
 * Limits resource creation to users with tenant.
 *
 * @param original Original access control to take into account.
 * @returns Collection access control for generic resources
 */
export const createResourceCreateAccess =
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
    if (!args.req.user?.tenant) {
      // During initial setup, allow logged-in users to create resources
      if (args.req.user) {
        console.log("User has no tenant for resource creation, allowing for initial setup");
        return original ? original(args) : true;
      }
      return false;
    }

    // User must be logged in and have assigned tenant.
    return Boolean(args.req.user?.tenant) && original(args);
  };
