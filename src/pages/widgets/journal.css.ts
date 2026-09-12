import type { APIRoute } from "astro";
import css from "../../styles/design-model.css?inline";

// Same approved style layer at the original public widget URLs.
export const GET: APIRoute = () =>
  new Response(css, {
    headers: { "Content-Type": "text/css; charset=utf-8" },
  });
