import type { APIRoute } from "astro";
import { MODEL_NAMES, renderDesignModel } from "../../../lib/design-models.mjs";

export function getStaticPaths() {
  return import.meta.env.DEV
    ? MODEL_NAMES.map((model) => ({ params: { model } }))
    : [];
}
export const GET: APIRoute = async ({ params }) => {
  if (!import.meta.env.DEV || !MODEL_NAMES.includes(params.model!))
    return new Response(null, { status: 404 });
  const { readFile } = await import("node:fs/promises");
  const { default: css } =
    await import("../../../styles/design-model.css?inline");
  const html = await readFile(
    new URL(`../../../../public/widgets/${params.model}.html`, import.meta.url),
    "utf8",
  );
  return new Response(renderDesignModel(html, css, params.model), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "no-store",
    },
  });
};
