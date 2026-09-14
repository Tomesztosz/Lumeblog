// No external SDK, automatic sharing, analytics or stored reader data.
export function bindModelSharing() {
  document.querySelectorAll<HTMLElement>('[data-model-share]:not([data-share-bound])').forEach((root) => {
    root.dataset.shareBound = 'true';
    const url = root.dataset.modelUrl!;
    const title = root.dataset.shareTitle!;
    const copy = root.querySelector<HTMLButtonElement>('[data-model-copy]')!;
    const share = root.querySelector<HTMLButtonElement>('[data-model-native-share]')!;
    const status = root.querySelector<HTMLElement>('[data-model-share-status]')!;
    const fallback = root.querySelector<HTMLElement>('[data-model-share-fallback]')!;
    const manual = () => {
      status.textContent = root.dataset.failed!;
      fallback.hidden = false;
      const input = fallback.querySelector<HTMLInputElement>('input')!;
      input.focus(); input.select();
    };
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      try {
        if (!navigator.clipboard?.writeText) return manual();
        await navigator.clipboard.writeText(url);
        fallback.hidden = true; status.textContent = root.dataset.copied!;
      } catch { manual(); }
    });
    if (typeof navigator.share === 'function') {
      share.hidden = false;
      share.addEventListener('click', async () => {
        try {
          await navigator.share({ title, url });
          fallback.hidden = true;
          status.textContent = root.dataset.shared!;
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') status.textContent = root.dataset.cancelled!;
          else manual();
        }
      });
    }
  });
}
