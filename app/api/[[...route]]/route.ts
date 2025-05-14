import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { cors } from 'hono/cors';

import auth from "@/app/feature/auth/server/router";
import members from "@/app/feature/members/server/router";
import workspaces from "@/app/feature/workspaces/server/router";
import projects from "@/app/feature/projects/server/router";
import tasks from "@/app/feature/tasks/server/router";

// Initialize app
const app = new Hono()
    .use('*', cors({
        origin: ['https://myra-5w8a2v6i5-ruhan130s-projects.vercel.app'],
        allowMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
        allowHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    }))
    .basePath("/api")
    .route("/auth", auth)
    .route("/members", members)
    .route("/workspaces", workspaces)
    .route("/projects", projects)
    .route("/tasks", tasks);

// HTTP handlers
export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

// Type
export type Apptype = typeof app;
