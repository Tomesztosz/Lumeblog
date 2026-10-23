// A deliberately assumed rate landscape, not measured calibre data. The cage
// samples ONE axis. A separate axial offset survives a full vertical revolution.
export function tourbillonPosition(scenario, seconds) {
  const t = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  if (scenario === 'horizontal') return {tilt:0, azimuth:0};
  if (scenario === 'wrist') return {
    tilt:Math.PI*(.30 + .16*Math.sin(t/19) + .08*Math.sin(t/7)),
    azimuth:.4 + .7*Math.sin(t/23) + .18*Math.sin(t/5),
  };
  return {tilt:Math.PI/2, azimuth:0};
}
export function tourbillonRate(scenario, seconds, rotating = true, bias = 2, amplitude = 8) {
  const t = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const b = Number.isFinite(bias) ? Math.min(6,Math.max(-6,bias)) : 2;
  const a = Number.isFinite(amplitude) ? Math.min(12,Math.max(0,amplitude)) : 8;
  const {tilt, azimuth} = tourbillonPosition(scenario,t);
  const phase = rotating ? t * Math.PI/30 : 0;
  return b + 3*Math.cos(tilt)**2 + a*Math.sin(tilt)**2*Math.cos(azimuth+phase);
}
export function tourbillonSample(scenario = 'vertical', seconds = 0, bias = 2, amplitude = 8) {
  const time = Number.isFinite(seconds) ? Math.min(180,Math.max(0,seconds)) : 0;
  const count = Math.ceil(time/.1);
  let fixed=0, rotating=0;
  for (let i=0;i<count;i++) {
    const left=i*.1, width=Math.min(.1,time-left), mid=left+width/2;
    fixed+=width*tourbillonRate(scenario,mid,false,bias,amplitude);
    rotating+=width*tourbillonRate(scenario,mid,true,bias,amplitude);
  }
  return {time, angle:time*6, ...tourbillonPosition(scenario,time),
    fixed:tourbillonRate(scenario,time,false,bias,amplitude),
    rotating:tourbillonRate(scenario,time,true,bias,amplitude),
    fixedMean:time?fixed/time:tourbillonRate(scenario,0,false,bias,amplitude),
    rotatingMean:time?rotating/time:tourbillonRate(scenario,0,true,bias,amplitude)};
}

// Kinematic teaching clock: 4 complete balance oscillations per second,
// 8 half-oscillations per second and 1 carriage revolution per minute.
// It does not solve tooth contacts, impulses, friction or cage torque.
export function tourbillonMechanism(seconds = 0) {
  const time = Number.isFinite(seconds) ? Math.min(180,Math.max(0,seconds)) : 0;
  const phase = (time*4)%1;
  const balance = 220*Math.cos(phase*Math.PI*2);
  return {time, phase, balance, cage:time*6,
    halfBeats:Math.floor(time*8+1e-8), turns:time/60,
    // Alternating banking positions are indicative, not pallet geometry.
    lever:phase<.5?-7:7,
    escape:Math.floor(time*8+1e-8)*12};
}

// A deformed Archimedean spiral: the inner end follows the balance while
// the outer end stays attached to the carriage. Not an elastic spring solver.
export function tourbillonSpring(angle = 0) {
  const a = Number.isFinite(angle)?angle*Math.PI/180:0;
  return Array.from({length:161},(_,i)=>{
    const u=i/160, theta=-Math.PI/2-u*Math.PI*8+a*(1-u),r=10+u*66;
    return `${i?'L':'M'}${(Math.cos(theta)*r).toFixed(3)},${(Math.sin(theta)*r).toFixed(3)}`;
  }).join(' ');
}

// Project a spatial watch face into a fixed world view. Tilt is the angle
// between its axis and gravity: 0 means dial-up, pi/2 means upright.
// The gravity arrow itself is NOT transformed with the watch.
export function tourbillonProject(point, tilt = Math.PI/2, azimuth = 0) {
  const [x,y,z=0]=point, a=Number.isFinite(azimuth)?azimuth:0;
  const t=Number.isFinite(tilt)?tilt:Math.PI/2;
  const u=x*Math.cos(a)-y*Math.sin(a),v=x*Math.sin(a)+y*Math.cos(a);
  const wx=u, wy=v*Math.sin(t)+z*Math.cos(t),wz=-v*Math.cos(t)+z*Math.sin(t);
  return [300+wx+.32*wz,210-wy+.30*wz];
}
