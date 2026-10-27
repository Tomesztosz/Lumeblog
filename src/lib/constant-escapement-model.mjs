// Normalised, single-coordinate elastic demonstrator, NOT GP09200 geometry,
// calibrated time, silicon stress or finite-element analysis. q is signed bow.
// U(q)=(q²-1)²/4, m=1. Fixed-step RK4 integrates q''+c*q'+U'(q)=F.
export const BUCKLING_LIMIT=2/(3*Math.sqrt(3));
// Applied external load for the optional guided demo. Does not prescribe q:
// the existing elastic ODE still determines deformation and snap-through.
export function bladeDemoForce(time,side=1){
 if(!Number.isFinite(time)||time<0||![1,-1].includes(side))throw new RangeError('Invalid demonstration clock');
 const phase=time%12,half=phase%6,direction=phase<6?-side:side;
 const ease=x=>(1-Math.cos(Math.PI*x))/2;
 const level=half<1.5?ease(half/1.5):half<4.5?1:1-ease((half-4.5)/1.5);
 return direction*.5*level;
}
export function bladePotential(q){return (q*q-1)**2/4;}
export function bladeGradient(q){return q*(q*q-1);}
export function bladeState(q=1,v=0){return {q,v,time:0,work:0,loss:0};}
export function bladeStep(s,force=0,dt=1/240,damping=.45){
 if(![s.q,s.v,force,dt,damping].every(Number.isFinite)||dt<=0||dt>.05||damping<0)throw new RangeError('Invalid mechanical state');
 const f=([q,v])=>[v,force-damping*v-bladeGradient(q)];
 const y=[s.q,s.v],a=f(y),b=f(y.map((x,i)=>x+dt*a[i]/2)),c=f(y.map((x,i)=>x+dt*b[i]/2)),d=f(y.map((x,i)=>x+dt*c[i]));
 const [q,v]=y.map((x,i)=>x+dt*(a[i]+2*b[i]+2*c[i]+d[i])/6);
 return {q,v,time:s.time+dt,work:s.work+force*(q-s.q),loss:s.loss+damping*dt*(s.v*s.v+2*b[0]**2+2*c[0]**2+d[0]**2)/6};
}
// A clamped-end trial shape used only to draw this reduced coordinate.
// It does not reconstruct the coupled S-shaped production silicon assembly.
export function bladePoint(u,q){return [-2+4*u,.52*q*(1-Math.cos(2*Math.PI*u))/2,.13];}
// A SEPARATE event/energy teaching model. Fixed unit doses are an explicit
// premise, not a prediction of the elastic ODE or a measurement of GP efficiency.
// Energy cannot be created: incoming=stored+delivered+unused at all times.
export function meterState(){return {time:0,stored:0,incoming:0,delivered:0,unused:0,missed:0,beats:0,lastPulse:-10,side:1,history:[]};}
export function meterStep(s,drive=1,dt=1/240){
 if(!Number.isFinite(drive)||drive<0||drive>2||!Number.isFinite(dt)||dt<=0||dt>.05)throw new RangeError('Invalid energy input');
 const n={...s,time:s.time+dt,history:[...s.history]},added=drive*dt;
 const accepted=Math.min(1-s.stored,added);n.stored+=accepted;n.incoming+=added;n.unused+=added-accepted;
 // One teaching beat per 2 normalised time units, deliberately slowed.
 const beat=Math.floor((n.time+1e-10)/2);
 if(beat>s.beats){n.beats=beat;if(n.stored>=1-1e-9){n.stored=0;n.delivered++;n.side*=-1;n.lastPulse=n.time;n.history.push(1);}else{n.missed++;n.history.push(0);}n.history=n.history.slice(-14);}
 return n;
}
export function modelProject([x,y,z],yaw=-.22,pitch=.55){
 const a=x*Math.cos(yaw)-y*Math.sin(yaw),b=x*Math.sin(yaw)+y*Math.cos(yaw),c=b*Math.cos(pitch)-z*Math.sin(pitch),d=b*Math.sin(pitch)+z*Math.cos(pitch);
 const scale=125/(1+d*.08);return [440+a*scale,255+c*scale];
}
