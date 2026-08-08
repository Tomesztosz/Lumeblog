/**
 * A cikkek Markdown-képei legfeljebb a 68 karakter széles olvasósávot töltik
 * ki. Ezt a böngészőnek is megadjuk, hogy a generált srcsetből ne a kelleténél
 * nagyobb fájlt válassza asztali nézetben.
 */
export default function rehypeArticleImages() {
  return (tree) => {
    walk(tree);
  };
}

function walk(node) {
  if (node?.type === 'element' && node.tagName === 'img') {
    node.properties ??= {};
    node.properties.sizes =
      '(max-width: 520px) calc(100vw - 40px), (max-width: 860px) calc(100vw - 56px), 620px';
  }

  if (Array.isArray(node?.children)) {
    for (const child of node.children) walk(child);
  }
}
