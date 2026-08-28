import type { APIRoute, GetStaticPaths } from 'astro';
import { buildReleaseIcs, releases } from '../../../lib/releases';

export const getStaticPaths: GetStaticPaths = () =>
  releases.map((release) => ({ params: { id: release.id }, props: { release } }));

export const GET: APIRoute = ({ props }) => {
  const release = props.release as (typeof releases)[number];
  return new Response(buildReleaseIcs(release, 'en'), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${release.id}.ics"`,
    },
  });
};
