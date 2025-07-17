import { router, publicProcedure, protectedProcedure } from "../server/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Dependencies } from "../provideDependencies.types";

export const buildCalendarEventsRouter = (deps: Dependencies) => {
    const { calendarEventsService } = deps;
    const calendarEventsRouter = router({
        // Create a calendar event (community owners only)
        create: protectedProcedure
            .input(z.object({
                title: z.string().min(1),
                desc: z.string().optional(),
                location: z.string().optional(),
                startDt: z.string().datetime(),
                endDt: z.string().datetime(),
                timezone: z.string().optional(),
                slug: z.string(),
                publish: z.boolean().optional()
            }))
            .mutation(async ({ input, ctx }) => {
                // Look up community by slug
                const community = await deps.prisma.community.findUnique({ where: { slug: input.slug } });
                if (!community) throw new TRPCError({ code: 'NOT_FOUND', message: 'Community not found' });
                const event = await calendarEventsService.createCalendarEvent({
                    title: input.title,
                    desc: input.desc,
                    location: input.location,
                    startDt: new Date(input.startDt),
                    endDt: new Date(input.endDt),
                    timezone: input.timezone,
                    communityId: community.id,
                }, ctx.userId);
                if (input.publish) {
                    // Publish the event
                    await calendarEventsService.publishCalendarEvent(event.id, ctx.userId);
                }
                return event;
            }),

        // View a calendar event (published events for everyone, unpublished for owners)
        view: publicProcedure
            .input(z.object({ eventId: z.string().uuid() }))
            .query(async ({ input, ctx }) => {
                return calendarEventsService.viewCalendarEvent(input.eventId, ctx.userId ?? undefined);
            }),

        // Update a calendar event (community owners only)
        update: protectedProcedure
            .input(z.object({
                eventId: z.string().uuid(),
                title: z.string().min(1).optional(),
                desc: z.string().optional(),
                location: z.string().optional(),
                startDt: z.string().datetime().optional(),
                endDt: z.string().datetime().optional(),
                timezone: z.string().optional(),
            }))
            .mutation(async ({ input, ctx }) => {
                return calendarEventsService.updateCalendarEvent(input.eventId, {
                    title: input.title,
                    desc: input.desc,
                    location: input.location,
                    startDt: input.startDt ? new Date(input.startDt) : undefined,
                    endDt: input.endDt ? new Date(input.endDt) : undefined,
                    timezone: input.timezone,
                }, ctx.userId);
            }),

        // Cancel a calendar event (community owners only)
        cancel: protectedProcedure
            .input(z.object({ eventId: z.string().uuid() }))
            .mutation(async ({ input, ctx }) => {
                return calendarEventsService.cancelCalendarEvent(input.eventId, ctx.userId);
            }),

        // Publish a calendar event (community owners only)
        publish: protectedProcedure
            .input(z.object({ eventId: z.string().uuid() }))
            .mutation(async ({ input, ctx }) => {
                return calendarEventsService.publishCalendarEvent(input.eventId, ctx.userId);
            }),

        // Hide a calendar event (community owners only)
        hide: protectedProcedure
            .input(z.object({ eventId: z.string().uuid() }))
            .mutation(async ({ input, ctx }) => {
                return calendarEventsService.hideCalendarEvent(input.eventId, ctx.userId);
            }),

        // Unpublish a calendar event (community owners only, only if no signups)
        unpublish: protectedProcedure
            .input(z.object({ eventId: z.string().uuid() }))
            .mutation(async ({ input, ctx }) => {
                return calendarEventsService.unpublishCalendarEvent(input.eventId, ctx.userId);
            }),

        // List calendar events (published for everyone, all for owners)
        list: publicProcedure
            .input(z.object({
                communityId: z.string().uuid().optional(),
            }))
            .query(async ({ input, ctx }) => {
                return calendarEventsService.listCalendarEvents(input.communityId, ctx.userId ?? undefined);
            }),
    });
    return calendarEventsRouter;
}
