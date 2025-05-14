import { serve } from "https://deno.land/x/sift@0.6.0/mod.ts";
import { home } from "./handler.ts";

// For all requests to "/" endpoint, we want to invoke home() handler.
serve({
  "/": home,
});
