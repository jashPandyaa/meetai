import { db } from '@/db';
import { agents, meetings } from '@/db/schema';
import { auth } from '@/lib/auth';
import { polarClient } from '@/lib/polar';
import { MAX_FREE_AGENTS, MAX_FREE_MEETINGS } from '@/modules/premium/constants';
import { initTRPC, TRPCError } from '@trpc/server';
import { count, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { cache } from 'react';

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return { userId: 'user_123' };
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  // transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const session = await auth.api.getSession({
      headers : await headers(),
    });

    if( !session ){
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are Unauthorized here!"
      });
    }
    return next({
      ctx: { ...ctx, auth : session}
    })
});

export const premiumProcedure = (entity: "meetings" | "agents") =>
  protectedProcedure.use(async ({ ctx, next }) => {
    try {
      // Check if user has active subscription
      const customer = await polarClient.customers.getStateExternal({
        externalId: ctx.auth.user.id,
      });

      const isPremium = customer.activeSubscriptions.length > 0;

      // If user has premium subscription, allow the action
      if (isPremium) {
        return next({ ctx: { ...ctx, customer } });
      }

      // If not premium, check free tier limits
      if (entity === "agents") {
        const [userAgents] = await db
          .select({
            count: count(agents.id),
          })
          .from(agents)
          .where(eq(agents.userId, ctx.auth.user.id));

        if (userAgents.count >= MAX_FREE_AGENTS) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You have reached your free limit. Please upgrade to premium to add more agents."
          });
        }
      }

      if (entity === "meetings") {
        const [userMeetings] = await db
          .select({
            count: count(meetings.id),
          })
          .from(meetings)
          .where(eq(meetings.userId, ctx.auth.user.id));

        if (userMeetings.count >= MAX_FREE_MEETINGS) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You have reached your free limit. Please upgrade to premium to add more meetings."
          });
        }
      }

      // If within free limits, allow the action
      return next({ ctx: { ...ctx, customer } });

    } catch (error) {
      // If the error is already a TRPCError (like our limit checks), re-throw it
      if (error instanceof TRPCError) {
        throw error;
      }

      // If there's an error checking subscription status (like network issues),
      // fall back to free tier limits check
      console.error("Error checking subscription status:", error);

      if (entity === "agents") {
        const [userAgents] = await db
          .select({
            count: count(agents.id),
          })
          .from(agents)
          .where(eq(agents.userId, ctx.auth.user.id));

        if (userAgents.count >= MAX_FREE_AGENTS) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You have reached your free limit. Please upgrade to premium to add more agents."
          });
        }
      }

      if (entity === "meetings") {
        const [userMeetings] = await db
          .select({
            count: count(meetings.id),
          })
          .from(meetings)
          .where(eq(meetings.userId, ctx.auth.user.id));

        if (userMeetings.count >= MAX_FREE_MEETINGS) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You have reached your free limit. Please upgrade to premium to add more meetings."
          });
        }
      }

      // If within limits or other error, allow to proceed
      return next({ 
        ctx: { 
          ...ctx, 
          customer: { activeSubscriptions: [] } // Default empty customer object
        } 
      });
    }
  });