import { home } from "./handler.ts";

// the request which hits the server is passed to the home function which is defined in handler.ts
Deno.serve(async (request) => {
  const url = new URL(request.url);
  if (url.pathname === "/") {
    return home(request);
  } else {
    return new Response("Not Found", { status: 404 });
  }
});
