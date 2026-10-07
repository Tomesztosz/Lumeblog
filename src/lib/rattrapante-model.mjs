// Educational one-minute split-seconds model. Not a calibre or force simulation.
// Self-contained so the exact same reducer can run offline and in the article.
export function rattrapanteState(state, action) {
  const initial = { elapsed: 0, held: null, running: false, speed: 1, lastSplit: null };
  const s = state ? { ...state } : initial;
  switch (action?.type) {
    case 'reset': return { ...initial, speed: s.speed };
    case 'toggle': if (s.elapsed < 60) s.running = !s.running; break;
    case 'pause': s.running = false; break;
    case 'speed': if ([0.25, 1, 4].includes(action.value)) s.speed = action.value; break;
    case 'split':
      if (s.elapsed <= 0) break;
      if (s.held !== null) s.held = null;
      else { s.held = s.elapsed; s.lastSplit = s.elapsed; }
      break;
    case 'tick':
      if (s.running && Number.isFinite(action.seconds) && action.seconds > 0)
        s.elapsed = Math.min(60, s.elapsed + action.seconds * s.speed);
      break;
    case 'step': if (!s.running) s.elapsed = Math.min(60, s.elapsed + 1); break;
    case 'example': return { ...initial, elapsed: 18, held: 12, lastSplit: 12 };
  }
  if (s.elapsed >= 60) s.running = false;
  return s;
}
