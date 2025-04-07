import { Hono } from 'hono';
import { handle } from 'hono/vercel';

const app = new Hono().basePath("/api");

app.get("/hello", (c) => {
    return c.text("Hello World!")
});

app.get("/project/:abc", (c) => {
    const { abc } = c.req.param();

    return c.json({ project: abc })

}
);

export const GET = handle(app);


