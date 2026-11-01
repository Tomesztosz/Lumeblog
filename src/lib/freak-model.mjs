// Source-led kinematics for a teaching model, not UN CAD or a contact solver.
// One-hour carrier and twelve-hour indication are exact. The escapement uses
// the order and 5-long/20-short tooth example in Oechslin's US6301981B1.
// Its normalised cycle clock is deliberately independent of the display clock.
export const FREAK_TAU=Math.PI*2;
export const FREAK_PHASES=Object.freeze([0,.12,.5,.62]);
export function freakDisplay(seconds=36600){
 if(!Number.isFinite(seconds)||seconds<0)throw new RangeError('Invalid display time');
 const day=seconds%43200;
 return {seconds,minuteAngle:(day%3600)/3600*FREAK_TAU,hourAngle:day/43200*FREAK_TAU,hour:Math.floor(day/3600)||12,minute:Math.floor((day%3600)/60),second:Math.floor(day%60)};
}
export function freakEscapeFrame(cycles=0){
 if(!Number.isFinite(cycles)||cycles<0)throw new RangeError('Invalid normalised cycle');
 const cycle=Math.floor(cycles),p=cycles-cycle;
 const ramp=(a,b)=>Math.max(0,Math.min(1,(p-a)/(b-a)));
 const travel=cycle+.5*(ramp(0,.12)+ramp(.5,.62));
 const phase=p<.12?0:p<.5?1:p<.62?2:3;
 return {cycles,cycle,progress:p,phase,wheelA:travel*FREAK_TAU/5,wheelB:-travel*FREAK_TAU/5,locked:phase===1||phase===3,lockWheel:phase===1?'B':phase===3?'A':null,impulse:phase===0?'A':phase===2?'B':null,balance:Math.sin(p*FREAK_TAU)*Math.PI*1.05,rocker:(phase===0?(-1+2*ramp(0,.12)):phase===1?1:phase===2?(1-2*ramp(.5,.62)):-1)*.17};
}
export function freakNextPhase(cycles){
 if(!Number.isFinite(cycles)||cycles<0)throw new RangeError('Invalid normalised cycle');
 const cycle=Math.floor(cycles),p=cycles-cycle,next=FREAK_PHASES.find(x=>x>p+1e-7);
 return next===undefined?cycle+1:cycle+next;
}
export function freakRotate([x,y,z],angle){return [x*Math.cos(angle)-y*Math.sin(angle),x*Math.sin(angle)+y*Math.cos(angle),z];}
export function freakHairspringPoint(u,angle,x=0,y=0,z=0,r=1){
 if(!Number.isFinite(u)||u<0||u>1||!Number.isFinite(angle))throw new RangeError('Invalid hairspring coordinate');
 const a=u*FREAK_TAU*4.8+angle*(1-u),rr=r*(.08+.65*u);
 return [x+rr*Math.cos(a),y+rr*Math.sin(a),z];
}
export function freakProject([x,y,z],yaw=-.22,pitch=.57,scale=72,cx=480,cy=322){
 const a=x*Math.cos(yaw)-y*Math.sin(yaw),b=x*Math.sin(yaw)+y*Math.cos(yaw);
 return [cx+a*scale,cy+(b*Math.cos(pitch)-z*Math.sin(pitch))*scale];
}
export function freakGearPoints(x,y,z,r,teeth,angle=0,longEvery=0){
 if(!Number.isInteger(teeth)||teeth<5||r<=0)throw new RangeError('Invalid illustrative gear');
 const points=[];
 for(let i=0;i<teeth;i++)for(const [offset,rad]of [[-.46,.88],[-.23,longEvery&&i%longEvery===0?1.12:1],[.23,longEvery&&i%longEvery===0?1.12:1],[.46,.88]]){
  const a=angle+(i+offset)*FREAK_TAU/teeth;points.push([x+r*rad*Math.cos(a),y+r*rad*Math.sin(a),z]);
 }
 return points;
}
