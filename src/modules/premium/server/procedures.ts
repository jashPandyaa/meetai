import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { polarClient } from "@/lib/polar";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { count, eq } from "drizzle-orm";

export const premiumRouter = createTRPCRouter({
    getCurrentSubscription: protectedProcedure.query(async ({ ctx }) => {
        try {
            // First, try to get the customer from Polar
            const customer = await polarClient.customers.getStateExternal({
                externalId: ctx.auth.user.id,
            });

            // Check if the activeSubscriptions array exists and has items
            if (!customer.activeSubscriptions || customer.activeSubscriptions.length === 0) {
                // If not, the user has no active subscription. This is a valid state.
                return null;
            }

            // Safely get the subscription ONLY if the array is not empty
            const subscription = customer.activeSubscriptions[0];
            
            // Now that we know 'subscription' exists, we can safely get the product
            const product = await polarClient.products.get({
                id: subscription.productId,
            });
            
            return product;

        } catch (error) {
            // This catch block will handle errors if the customer is not found in Polar
            // or if there's any other API communication issue.
            console.error("Polar API error in getCurrentSubscription:", error);
            // Return null to indicate no active subscription was found.
            return null;
        }
    }),

    getProducts : protectedProcedure.query(async () => {
        const products = await polarClient.products.list({
            isArchived: false,
            isRecurring: true,
            sorting: ["price_amount"],
        })
        return products.result.items;
    }),

    getFreeUsage: protectedProcedure.query(async ({ ctx }) => {
        try {
            // Try to get customer subscription status
            const customer = await polarClient.customers.getStateExternal({
                externalId: ctx.auth.user.id,
            });

            const subscription = customer.activeSubscriptions[0];

            // If user has active subscription, they don't need free usage data
            if (subscription) {
                return null;
            }

            // Get user's current usage
            const [userMeeting] = await db
                .select({
                    count: count(meetings.id),
                })
                .from(meetings)
                .where(eq(meetings.userId, ctx.auth.user.id));

            const [userAgents] = await db
                .select({
                    count: count(agents.id),
                })
                .from(agents)
                .where(eq(agents.userId, ctx.auth.user.id));

            return {
                meetingCount: userMeeting.count,
                agentCount: userAgents.count,
            };

        } catch (error) {
            // If there's an error with Polar (network issues, etc.),
            // still return usage data so the UI can function
            console.error("Error fetching subscription status:", error);

            const [userMeeting] = await db
                .select({
                    count: count(meetings.id),
                })
                .from(meetings)
                .where(eq(meetings.userId, ctx.auth.user.id));

            const [userAgents] = await db
                .select({
                    count: count(agents.id),
                })
                .from(agents)
                .where(eq(agents.userId, ctx.auth.user.id));

            return {
                meetingCount: userMeeting.count,
                agentCount: userAgents.count,
            };
        }
    })
});