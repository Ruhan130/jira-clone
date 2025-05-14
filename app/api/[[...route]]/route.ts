import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import auth from "@/app/feature/auth/server/router"
import members from "@/app/feature/members/server/router"
import workspaces from "@/app/feature/workspaces/server/router";
import projects from "@/app/feature/projects/server/router";
import tasks from "@/app/feature/tasks/server/router";

const app = new Hono().basePath("/api");
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
    .route("/auth", auth)
    .route("/members", members)
    .route("/workspaces", workspaces)
    .route("/projects", projects)
    .route("/tasks", tasks);

export const GET = handle(app);
export const POST = handle(app)
export const PATCH = handle(app);
export const DELETE = handle(app);



export type Apptype = typeof routes;


