// Educational geometry is not Zenith CAD. Prescribed oscillator kinematics and
// the small-deflection beam FE problem are deliberately separate models.
export const DEFY_TAU=2*Math.PI;
export const DEFY_SPEC=Object.freeze({hz:15,amplitude:6*Math.PI/180,thicknessMM:.5,approxParts:30});
export function defyFrame(seconds=0,hz=15){
 if(!Number.isFinite(seconds)||seconds<0||!Number.isFinite(hz)||hz<=0)throw new RangeError('Invalid oscillator time or frequency');
 const cycles=seconds*hz,p=cycles-Math.floor(cycles),angle=DEFY_SPEC.amplitude*Math.cos(DEFY_TAU*p);
 const ramp=(a,b)=>{const q=Math.max(0,Math.min(1,(p-a)/(b-a)));return q*q*(3-2*q);};
 const travel=Math.floor(cycles)+.5*(ramp(.20,.30)+ramp(.70,.80));
 const event=p>=.20&&p<.30?'A':p>=.70&&p<.80?'B':null;
 return{seconds,cycles,phase:p,angle,angularVelocity:-DEFY_SPEC.amplitude*DEFY_TAU*hz*Math.sin(DEFY_TAU*p),event,locked:!event,wheelAngle:travel*DEFY_TAU/24};
}
export function defyHand(seconds,hz=15){
 if(!Number.isFinite(seconds)||seconds<0||!Number.isFinite(hz)||hz<=0)throw new RangeError('Invalid indication time');
 const ticks=Math.floor((seconds+1e-10)*2*hz);
 return{ticks,stepsPerSecond:2*hz,angle:ticks/(2*hz)*DEFY_TAU/60};
}
export function defyProject([x,y,z],yaw=-.3,pitch=.62,scale=20,cx=500,cy=310){
 const a=x*Math.cos(yaw)-y*Math.sin(yaw),b=x*Math.sin(yaw)+y*Math.cos(yaw);
 return[cx+a*scale,cy+(b*Math.cos(pitch)-z*Math.sin(pitch))*scale];
}
export function defyRotate([x,y,z],angle){return[x*Math.cos(angle)-y*Math.sin(angle),x*Math.sin(angle)+y*Math.cos(angle),z];}
export function defyFlexPoint(u,anchor,end,rotation=0){
 if(!Number.isFinite(u)||u<0||u>1)throw new RangeError('Invalid flexure coordinate');
 const target=defyRotate(end,rotation),h=u*u*(3-2*u);
 return anchor.map((v,i)=>v+(end[i]-v)*u+(target[i]-end[i])*h);
}
export function defySolve(matrix,rhs){
 const n=rhs.length,a=matrix.map((r,i)=>[...r,rhs[i]]);
 for(let col=0;col<n;col++){
  let p=col;for(let r=col+1;r<n;r++)if(Math.abs(a[r][col])>Math.abs(a[p][col]))p=r;
  if(!Number.isFinite(a[p][col])||Math.abs(a[p][col])<1e-22)throw new RangeError('Singular beam system');
  [a[col],a[p]]=[a[p],a[col]];const d=a[col][col];for(let j=col;j<=n;j++)a[col][j]/=d;
  for(let r=0;r<n;r++)if(r!==col){const f=a[r][col];for(let j=col;j<=n;j++)a[r][j]-=f*a[col][j];}
 }
 return a.map(r=>r[n]);
}
export function defyBeam({elements=12,lengthMM=5,widthUM=20,thicknessMM=.5,youngGPA=130,displacementUM=20}={}){
 if(!Number.isInteger(elements)||elements<1||elements>48)throw new RangeError('Invalid mesh');
 for(const v of [lengthMM,widthUM,thicknessMM,youngGPA])if(!Number.isFinite(v)||v<=0)throw new RangeError('Invalid beam dimensions or material');
 if(!Number.isFinite(displacementUM)||Math.abs(displacementUM)>lengthMM*10)throw new RangeError('Displacement exceeds small-deflection teaching range');
 const L=lengthMM/1000,w=widthUM/1e6,t=thicknessMM/1000,E=youngGPA*1e9,I=t*w**3/12,l=L/elements,n=2*(elements+1),K=Array.from({length:n},()=>Array(n).fill(0));
 const ke=[[12,6*l,-12,6*l],[6*l,4*l*l,-6*l,2*l*l],[-12,-6*l,12,-6*l],[6*l,2*l*l,-6*l,4*l*l]].map(r=>r.map(x=>x*E*I/l**3));
 for(let e=0;e<elements;e++)for(let i=0;i<4;i++)for(let j=0;j<4;j++)K[2*e+i][2*e+j]+=ke[i][j];
 const prescribed=new Map([[0,0],[1,0],[n-2,displacementUM/1e6],[n-1,0]]),free=Array.from({length:n},(_,i)=>i).filter(i=>!prescribed.has(i)),d=Array(n).fill(0);
 for(const [i,v]of prescribed)d[i]=v;
 const q=defySolve(free.map(i=>free.map(j=>K[i][j])),free.map(i=>-[...prescribed].reduce((s,[j,v])=>s+K[i][j]*v,0)));
 free.forEach((i,k)=>d[i]=q[k]);const reactions=K.map(r=>r.reduce((s,k,j)=>s+k*d[j],0)),energy=.5*d.reduce((s,v,i)=>s+v*reactions[i],0);
 return{elements,L,w,t,E,I,d,reactions,energy,stiffness:12*E*I/L**3,freeResidual:Math.max(0,...free.map(i=>Math.abs(reactions[i]))),assumptions:'Linear isotropic Euler-Bernoulli beam, prescribed guided-end translation, no axial load. Not Zenith full-plate FEA.'};
}
export function defyBeamSample(beam,u){
 if(!Number.isFinite(u)||u<0||u>1)throw new RangeError('Invalid beam sample');
 const e=Math.min(beam.elements-1,Math.floor(u*beam.elements)),s=u*beam.elements-e,l=beam.L/beam.elements,q=beam.d.slice(2*e,2*e+4);
 const N=[1-3*s*s+2*s**3,l*(s-2*s*s+s**3),3*s*s-2*s**3,l*(-s*s+s**3)],D2=[(-6+12*s)/l**2,(-4+6*s)/l,(6-12*s)/l**2,(-2+6*s)/l];
 const displacement=N.reduce((a,v,i)=>a+v*q[i],0),curvature=D2.reduce((a,v,i)=>a+v*q[i],0),strain=beam.w/2*curvature;
 return{x:u*beam.L,displacement,curvature,strain,stress:beam.E*strain};
}
