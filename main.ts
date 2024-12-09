import { Application } from "jsr:@oak/oak/application";
import { Router } from "jsr:@oak/oak/router";
import { Eta } from "eta";

const router = new Router();

const eta = new Eta({ views: Deno.cwd() + "/templates/" });
const sockets: WebSocket[] = [];
router.get("/", (ctx) => {
  ctx.response.body = eta.render("main.html", {});
});

router.get("/chatroom", (ctx) => {
  if (!ctx.isUpgradable) {
    ctx.throw(501);
  }
  const ws = ctx.upgrade();
  sockets.push(ws);
  ws.onopen = () => {
    console.log("connected!");
  };
  ws.onclose = () => {
    console.log("disconnected");
  };
  ws.onmessage = (msg) => {
    console.log();
    const htmlMessage = eta.render("message.html", {
      message: JSON.parse(msg.data).chat_message,
    });
    for (const socket of sockets) {
      socket.send(htmlMessage);
    }
  };
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 3663 });

console.log("Listening on port 3663");
