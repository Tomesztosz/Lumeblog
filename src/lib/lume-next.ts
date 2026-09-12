// Shared journal interactions; preview preferences stay isolated.
import { bindDesignFrames } from "./design-frames";
const root = document.documentElement;
const preview = root.dataset.preview === "true";
const textKey = preview ? "lume-design-text" : "lume-reader-text";
const theme = document.querySelector<HTMLButtonElement>("[data-theme-toggle]")!;
const bridge = bindDesignFrames(() => root.dataset.theme === "dark", preview);
function syncTheme() {
  const dark = root.dataset.theme === "dark";
  theme.querySelector("span")!.textContent = dark
    ? theme.dataset.on!
    : theme.dataset.off!;
  theme.setAttribute("aria-pressed", String(dark));
  theme.setAttribute(
    "aria-label",
    dark ? theme.dataset.on! : theme.dataset.off!,
  );
  const color = getComputedStyle(root).getPropertyValue("--paper").trim();
  if (root.dataset.appleTouch !== "true") {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = color;
    const previous = document.querySelector('meta[name="theme-color"]');
    if (previous) previous.replaceWith(meta);
    else document.head.append(meta);
  }
  bridge?.broadcast();
}
theme.addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  try {
    if (preview)
      sessionStorage.setItem(
        "lume-design-dark",
        String(root.dataset.theme === "dark"),
      );
    else localStorage.setItem("lume-theme", root.dataset.theme!);
  } catch {}
  syncTheme();
});
syncTheme();
if (!preview)
  window.addEventListener("storage", (event) => {
    if (event.key !== "lume-theme" && event.key !== null) return;
    root.dataset.theme = event.newValue === "dark" ? "dark" : "light";
    syncTheme();
  });

// The reader's actual local time. No timer keeps running offscreen.
const clock = document.querySelector<HTMLElement>("[data-live-clock]");
if (clock) {
  const svg = clock.querySelector("svg")!;
  const hour = clock.querySelector("[data-clock-hour]")!;
  const minute = clock.querySelector("[data-clock-minute]")!;
  const second = clock.querySelector("[data-clock-second]")!;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const formatter = new Intl.DateTimeFormat(document.documentElement.lang, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  let frame = 0;
  let timer = 0;
  let visible = true;
  let lastMinute = "";
  function paint() {
    const now = new Date();
    const seconds =
      now.getSeconds() + (reduced.matches ? 0 : now.getMilliseconds() / 1000);
    const minutes = now.getMinutes() + seconds / 60;
    hour.setAttribute(
      "transform",
      `rotate(${((now.getHours() % 12) + minutes / 60) * 30} 60 60)`,
    );
    minute.setAttribute("transform", `rotate(${minutes * 6} 60 60)`);
    second.setAttribute("transform", `rotate(${seconds * 6} 60 60)`);
    const time = formatter.format(now);
    if (time !== lastMinute) {
      svg.setAttribute("aria-label", `${clock!.dataset.clockLabel}: ${time}`);
      clock!.title = `${clock!.dataset.clockLabel}: ${time}`;
      lastMinute = time;
    }
    clock!.dataset.ready = "true";
  }
  function tick() {
    paint();
    if (reduced.matches)
      timer = window.setTimeout(tick, 1000 - new Date().getMilliseconds());
    else frame = requestAnimationFrame(tick);
  }
  function restart() {
    cancelAnimationFrame(frame);
    clearTimeout(timer);
    if (!document.hidden && visible) tick();
  }
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    restart();
  });
  observer.observe(clock);
  reduced.addEventListener("change", restart);
  document.addEventListener("visibilitychange", restart);
  window.addEventListener("pagehide", () => {
    cancelAnimationFrame(frame);
    clearTimeout(timer);
  });
  window.addEventListener("pageshow", restart);
  restart();
}
document.querySelectorAll<HTMLDialogElement>("dialog").forEach((dialog) => {
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      dialog.close();
    }
  });
  dialog
    .querySelector("[data-dialog-close]")
    ?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      dialog.close();
  });
});
document.querySelectorAll("[data-open-search]").forEach((button) =>
  button.addEventListener("click", () => {
    document.querySelector<HTMLDialogElement>(".search-dialog")!.showModal();
    document.querySelector<HTMLInputElement>("#design-query")!.focus();
  }),
);
const viewer = document.querySelector<HTMLDialogElement>(".photo-dialog")!;
function showPhoto(img: HTMLImageElement, source?: string) {
  const photo = document.createElement("img");
  photo.dataset.viewerImage = "";
  photo.alt = img.alt;
  // The reader may have loaded a small mobile candidate. The viewer can request
  // a sharper existing size, without fabricating detail or losing the original crop.
  photo.srcset = source ? "" : img.srcset;
  photo.sizes = "(max-width: 1000px) 90vw, 1100px";
  photo.src = source || img.currentSrc || img.src;
  const credit =
    img.closest("figure")?.querySelector("figcaption") ??
    img.closest("p")?.querySelector("em") ??
    img.closest("p")?.nextElementSibling?.querySelector("em");
  const caption = viewer.querySelector("[data-viewer-credit]")!;
  const previous = viewer.querySelector("[data-viewer-image]");
  if (previous) previous.replaceWith(photo);
  else caption.before(photo);
  caption.replaceChildren();
  if (credit) caption.append(credit.cloneNode(true));
  viewer.showModal();
}
document
  .querySelectorAll<HTMLElement>("[data-photo-open]")
  .forEach((button) => {
    button.addEventListener("click", () => {
      const img = button.querySelector<HTMLImageElement>("img");
      if (img) showPhoto(img, button.dataset.photoSrc);
    });
  });
document
  .querySelectorAll<HTMLImageElement>(".article-body img:not(a img)")
  .forEach((img) => {
    img.dataset.photoInline = "true";
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute(
      "aria-label",
      `${document.body.dataset.enlarge}: ${img.alt}`,
    );
    img.addEventListener("click", () => showPhoto(img));
    img.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showPhoto(img);
      }
    });
  });
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
document
  .querySelector<HTMLInputElement>("#design-query")
  ?.addEventListener("input", (event) => {
    const words = normalize((event.target as HTMLInputElement).value)
      .trim()
      .split(/\s+/);
    let count = 0;
    document
      .querySelectorAll<HTMLElement>("[data-search-entry]")
      .forEach((entry) => {
        entry.hidden = !words.every((word) =>
          normalize(entry.dataset.search!).includes(word),
        );
        if (!entry.hidden) count++;
      });
    document.querySelector<HTMLElement>(".search-empty")!.hidden = count !== 0;
  });
document
  .querySelectorAll<HTMLButtonElement>("button[data-text-size]")
  .forEach((button) =>
    button.addEventListener("click", () => {
      document.body.dataset.textSize = button.dataset.textSize;
      try {
        sessionStorage.setItem(textKey, button.dataset.textSize!);
      } catch {}
      document
        .querySelectorAll<HTMLButtonElement>("button[data-text-size]")
        .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    }),
  );
try {
  if (sessionStorage.getItem(textKey) === "large") {
    document.body.dataset.textSize = "large";
    document
      .querySelectorAll<HTMLButtonElement>("button[data-text-size]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.textSize === "large"),
        ),
      );
  }
} catch {}

document
  .querySelector<HTMLButtonElement>("[data-copy-link]")
  ?.addEventListener("click", async (event) => {
    const button = event.currentTarget as HTMLButtonElement;
    const status = document.querySelector<HTMLElement>("[data-copy-status]")!;
    try {
      await navigator.clipboard.writeText(location.href);
      status.textContent = button.dataset.copied!;
    } catch {
      status.textContent = button.dataset.error!;
    }
  });

const library = document.querySelector<HTMLElement>("[data-library]");
if (library) {
  const query = document.querySelector<HTMLInputElement>("#library-query")!;
  const sort = document.querySelector<HTMLSelectElement>("#library-sort")!;
  const grid = document.querySelector<HTMLElement>("[data-library-grid]")!;
  const cards = [...grid.querySelectorAll<HTMLElement>("[data-journal-card]")];
  const filters = [
    ...document.querySelectorAll<HTMLButtonElement>("[data-filter-column]"),
  ];
  const count = document.querySelector<HTMLElement>("[data-library-count]")!;
  const empty = document.querySelector<HTMLElement>("[data-library-empty]")!;
  let column = "all";
  function update(save = true) {
    const words = normalize(query.value).trim().split(/\s+/);
    const sorted = [...cards].sort((a, b) =>
      sort.value === "shortest"
        ? Number(a.dataset.minutes) - Number(b.dataset.minutes)
        : (a.dataset.date! < b.dataset.date!
            ? -1
            : a.dataset.date! > b.dataset.date!
              ? 1
              : 0) * (sort.value === "oldest" ? 1 : -1),
    );
    let visible = 0;
    sorted.forEach((card) => {
      card.hidden = !(
        (column === "all" || card.dataset.column === column) &&
        words.every((w) => normalize(card.dataset.search!).includes(w))
      );
      if (!card.hidden) visible++;
      grid.append(card);
    });
    count.textContent = library!.dataset.results!.replace(
      "{n}",
      String(visible),
    );
    empty.hidden = visible > 0;
    filters.forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.filterColumn === column)),
    );
    if (save) {
      const url = new URL(location.href);
      for (const [key, value] of [
        ["q", query.value],
        ["section", column === "all" ? "" : column],
        ["sort", sort.value === "newest" ? "" : sort.value],
      ]) {
        if (value) url.searchParams.set(key, value);
        else url.searchParams.delete(key);
      }
      history.replaceState(null, "", url);
    }
  }
  function restore() {
    const params = new URL(location.href).searchParams;
    query.value = params.get("q") ?? "";
    sort.value = ["newest", "oldest", "shortest"].includes(
      params.get("sort") ?? "",
    )
      ? params.get("sort")!
      : "newest";
    column = filters.some(
      (b) => b.dataset.filterColumn === params.get("section"),
    )
      ? params.get("section")!
      : "all";
    update(false);
  }
  filters.forEach((b) =>
    b.addEventListener("click", () => {
      column = b.dataset.filterColumn!;
      update();
    }),
  );
  query.addEventListener("input", () => update());
  sort.addEventListener("change", () => update());
  document.querySelectorAll("[data-library-reset]").forEach((b) =>
    b.addEventListener("click", () => {
      query.value = "";
      sort.value = "newest";
      column = "all";
      update();
      query.focus();
    }),
  );
  window.addEventListener("popstate", restore);
  restore();
}

// Broken media must not hide the story or lose the original credit.
document.querySelectorAll<HTMLImageElement>("main img").forEach((img) => {
  let failure: HTMLElement | undefined;
  const host =
    img.closest<HTMLElement>(".design-media-image,.photo-button") ?? img;
  const report = () => {
    if (failure) return;
    failure = document.createElement("span");
    failure.className = "image-failure";
    const text = document.createElement("span");
    text.textContent = document.body.dataset.imageMissing!;
    const retry = document.createElement("button");
    retry.type = "button";
    retry.textContent = document.body.dataset.imageRetry!;
    retry.addEventListener("click", () => {
      const src = img.src;
      failure?.remove();
      failure = undefined;
      host.hidden = false;
      img.src = src;
    });
    failure.append(text, retry);
    host.hidden = true;
    host.after(failure);
  };
  img.addEventListener("error", report);
  if (img.complete && !img.naturalWidth) report();
});
const article = document.querySelector<HTMLElement>(".article-body");
// The outline remains fully available without JS, but does not push the entire
// article off the first mobile reading screen when enhancement is available.
const outline = document.querySelector<HTMLDetailsElement>(".reader-outline");
if (outline && matchMedia("(max-width: 760px)").matches) outline.open = false;
const progress = document.querySelector<HTMLElement>(".reading-progress");
if (article && progress) {
  let ticking = false;
  const links = [
    ...document.querySelectorAll<HTMLAnchorElement>(".reader-sidebar nav a"),
  ];
  const headings = links.map((link) =>
    document.getElementById(decodeURIComponent(link.hash.slice(1))),
  );
  const update = () => {
    const bounds = article.getBoundingClientRect();
    const value = Math.max(
      0,
      Math.min(
        100,
        (100 * (innerHeight * 0.3 - bounds.top)) /
          Math.max(1, bounds.height - innerHeight * 0.5),
      ),
    );
    progress.setAttribute("aria-valuenow", String(Math.round(value)));
    progress.style.setProperty("--progress", `${value}%`);
    let active = 0;
    headings.forEach((heading, index) => {
      if (heading && heading.getBoundingClientRect().top < 160) active = index;
    });
    links.forEach((link, index) => {
      if (index === active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    ticking = false;
  };
  const schedule = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  addEventListener("scroll", schedule, { passive: true });
  // A model, image or text-size change can change reading progress even when
  // the reader has not scrolled. The progress bar itself sits outside article.
  new ResizeObserver(schedule).observe(article);
  outline?.addEventListener("toggle", schedule);
  addEventListener("resize", update);
  update();
}
