// Display kinematics only. Star/flirt motions are separated conceptually:
// no claim of collision, torque, remontoir or gear-train simulation.
export function jumpingSecondsState(seconds, hz = 3) {
  const time = Math.min(5, Math.max(0, Number.isFinite(seconds) ? seconds : 0));
  const frequency = hz === 4 ? 4 : 3;
  const beats = Math.floor(time * frequency * 2 + 1e-8);
  const jumps = Math.floor(time + 1e-8);
  // A release takes a deliberately visible 0.12 model seconds, ending on
  // each whole second. This is a pedagogical stretch, not a measured duration.
  const fraction = time - Math.floor(time);
  const release = Math.max(0, (fraction - .88) / .12);
  return { time, frequency, beats, jumps,
    // Illustrative angular amplitude, not a measured value for either calibre.
    balance: 120 * Math.cos(time * frequency * 2 * Math.PI),
    ordinary: beats * 6 / (frequency * 2), jumping: jumps * 6,
    star: time * 72, flirt: jumps * 360 + release * 360,
  };
}
