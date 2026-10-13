// Educational timing model, not a contact solver or an Omega calibre simulation.
// Two releases per oscillation. Nine illustrated teeth; 40 degrees per cycle.
export function coaxialFrame(time = 0) {
  const cycle = Math.floor(Math.max(0, time));
  const p = Math.max(0, time) - cycle;
  const marks = [0, .12, .20, .28, .50, .62, .70, .78, 1];
  const phase = marks.findIndex((v, i) => i < 8 && p >= v && p < marks[i + 1]);
  const ramp = (a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));
  const first = ramp(.20, .28), second = ramp(.70, .78);
  // Explicit teaching keyframes keep the roller near the fork during impulse.
  // Free arcs are exaggerated; timings are not a physical oscillator solution.
  const balanceKeys = [[0,70],[.12,12],[.20,4],[.28,-4],[.39,-210],[.50,-70],[.62,-12],[.70,-4],[.78,4],[.89,210],[1,70]];
  const k = balanceKeys.findIndex((v,i)=>i<balanceKeys.length-1 && p>=v[0] && p<balanceKeys[i+1][0]);
  const left=balanceKeys[k],right=balanceKeys[k+1],mix=(p-left[0])/(right[0]-left[0]);
  return {
    time, phase, progress: p, cycle,
    wheel: -(cycle * 40 + first * 20 + second * 20),
    balance: left[1]+(right[1]-left[1])*mix,
    lever: -7 + 14 * ramp(.12, .28) - 14 * ramp(.62, .78),
    locked: ![2, 6].includes(phase),
    impulse: phase === 2 ? 'indirect' : phase === 6 ? 'direct' : 'none',
    lock: phase < 2 || phase >= 7 ? 'exit' : phase >= 3 && phase < 6 ? 'entry' : 'none',
  };
}

export function coaxialState(state = { time: 0, running: false, speed: 1 }, action = {}) {
  const marks = [0, .12, .20, .28, .50, .62, .70, .78];
  switch (action.type) {
    case 'reset': return { time: 0, running: false, speed: state.speed };
    case 'toggle': return { ...state, running: !state.running };
    case 'pause': return { ...state, running: false };
    case 'speed': return { ...state, speed: [.5, 1, 2].includes(action.value) ? action.value : 1 };
    case 'phase': return Number.isInteger(action.value) && action.value >= 0 && action.value < 8 ? { ...state, running: false, time: Math.floor(state.time) + marks[action.value] + .00001 } : state;
    case 'step': {
      const p = state.time % 1;
      const next = marks.find(x => x > p + .00002);
      return { ...state, running: false, time: next === undefined ? Math.floor(state.time) + 1 : Math.floor(state.time) + next + .00001 };
    }
    case 'tick': return state.running && Number.isFinite(action.seconds) ? { ...state, time: state.time + Math.max(0, Math.min(action.seconds, .1)) * state.speed / 12 } : state;
    default: return state;
  }
}
