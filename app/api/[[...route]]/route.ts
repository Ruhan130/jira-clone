import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import auth from "@/app/feature/auth/server/route"
import members from "@/app/feature/members/server/route"
import workspaces from "@/app/feature/workspaces/server/route";
import projects from "@/app/feature/projects/server/route";

const app = new Hono().basePath("/api");

const routes = app
    .route("/auth", auth)
    .route("/members", members)
    .route("/workspaces", workspaces)
    .route("/projects", projects);


export const GET = handle(app);
export const POST = handle(app)
export const PATCH = handle(app);
export const DELETE = handle(app);



export type Apptype = typeof routes;


