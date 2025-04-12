import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import auth from "@/app/feature/auth/server/route"
import workspace from "@/app/feature/workspaces/server/route";

const app = new Hono().basePath("/api");

const routes = app
.route("/auth", auth)
.route("/workspace", workspace );

export const GET = handle(app);
export const POST = handle(app)


export type Apptype = typeof routes; 


