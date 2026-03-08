import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { messengerRouter } from "./routers/messenger";
import { agentRouter } from "./routers/agent";
import { subscriptionRouter } from "./routers/subscription";
import { oauthRouter } from "./routers/oauth";
import { paymentsRouter } from "./routers/payments";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  messenger: messengerRouter,
  agent: agentRouter,
  subscription: subscriptionRouter,
  oauth: oauthRouter,
  payments: paymentsRouter,
});

export type AppRouter = typeof appRouter;
