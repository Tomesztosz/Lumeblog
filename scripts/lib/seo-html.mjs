import { parse } from 'parse5';

export const attribute = (node, name) => node?.attrs?.find((item) => item.name === name)?.value;
export const textOf = (node) => node?.nodeName === '#text' ? node.value : (node?.childNodes ?? []).map(textOf).join('');

export function elementsOf(node) {
  if (!node) return [];
  return [node, ...(node.childNodes ?? []).flatMap(elementsOf)].filter((item) => item.tagName);
}

export function inspectHtml(html) {
  const document = parse(html);
  const elements = elementsOf(document);
  const head = elementsOf(elements.find((node) => node.tagName === 'head'));
  const metas = head.filter((node) => node.tagName === 'meta');
  const meta = (name) => metas.filter((node) => attribute(node, 'name') === name || attribute(node, 'property') === name)
    .map((node) => attribute(node, 'content'));
  const headLinks = head.filter((node) => node.tagName === 'link');
  const canonical = headLinks.filter((node) => attribute(node, 'rel') === 'canonical').map((node) => attribute(node, 'href'));
  const alternates = headLinks.filter((node) => attribute(node, 'hreflang')).map((node) => ({
    lang: attribute(node, 'hreflang'), url: attribute(node, 'href'),
  }));
  const schemas = elements.filter((node) => node.tagName === 'script' && attribute(node, 'type') === 'application/ld+json')
    .flatMap((node) => { const data = JSON.parse(textOf(node)); return data['@graph'] ?? [data]; });
  return {
    elements, head, meta, canonical, alternates, schemas,
    titles: head.filter((node) => node.tagName === 'title').map(textOf),
    lang: attribute(elements.find((node) => node.tagName === 'html'), 'lang'),
    noindex: meta('robots').some((value) => /\bnoindex\b/i.test(value)),
  };
}
