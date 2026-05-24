import { useState, useEffect, useRef } from "react";

/* ─── PALETTE ─────────────────────────────────────────────────────────────── */
const C = {
  bg:"#0d0d1a", surface:"#12122a", card:"#16163a", border:"#2a2a5a",
  text:"#f0f0ff", muted:"#9090c0",
  orange:"#ff6b35", cyan:"#00d4ff", magenta:"#e040fb",
  green:"#00e676", yellow:"#ffd600", blue:"#448aff",
  coral:"#ff5252", teal:"#1de9b6",
};
const SVC_COLORS=[{from:"#ff6b35",to:"#ff1744"},{from:"#448aff",to:"#7c4dff"},{from:"#00e676",to:"#00bcd4"},{from:"#ffd600",to:"#ff6d00"},{from:"#e040fb",to:"#448aff"},{from:"#1de9b6",to:"#00e676"}];
const DEPT_COLORS={Civil:{bg:"#ff6b35",text:"#fff"},Site:{bg:"#448aff",text:"#fff"},Survey:{bg:"#00e676",text:"#0d1a0d"},Estimate:{bg:"#ffd600",text:"#1a1a00"},Urban:{bg:"#e040fb",text:"#fff"}};
const STAT_COLORS=["#ff6b35","#00d4ff","#e040fb","#00e676"];

/* ─── HOOKS ───────────────────────────────────────────────────────────────── */
function useReveal(t=0.1){
  const ref=useRef(null);const[v,sv]=useState(false);
  useEffect(()=>{const el=ref.current;if(!el)return;const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){sv(true);o.disconnect();}},{threshold:t});o.observe(el);return()=>o.disconnect();},[t]);
  return[ref,v];
}
function useWindowSize(){
  const[s,ss]=useState({w:window.innerWidth,h:window.innerHeight});
  useEffect(()=>{const fn=()=>ss({w:window.innerWidth,h:window.innerHeight});window.addEventListener("resize",fn);return()=>window.removeEventListener("resize",fn);},[]);
  return s;
}

/* ─── HELPERS ─────────────────────────────────────────────────────────────── */
function AnimCounter({target,color="#fff",duration=1800}){
  const[val,sv]=useState(0);const[ref,vis]=useReveal(0.3);
  useEffect(()=>{if(!vis)return;const n=parseInt(target.replace(/\D/g,""));let s=null;const step=ts=>{if(!s)s=ts;const p=Math.min((ts-s)/duration,1);sv(Math.floor((1-Math.pow(1-p,3))*n));if(p<1)requestAnimationFrame(step);};requestAnimationFrame(step);},[vis,target,duration]);
return (
  <span ref={ref} style={{ color }}>
    {val}
    {target.includes("+") ? "+" : ""}
  </span>
);
}
function TypeWriter({words,speed=85,pause=1800}){
  const[d,sd]=useState("");const[wi,swi]=useState(0);const[ci,sci]=useState(0);const[del,sdel]=useState(false);
  useEffect(()=>{const w=words[wi];let t;if(!del&&ci<w.length)t=setTimeout(()=>sci(c=>c+1),speed);else if(!del&&ci===w.length)t=setTimeout(()=>sdel(true),pause);else if(del&&ci>0)t=setTimeout(()=>sci(c=>c-1),speed/2);else{sdel(false);swi(i=>(i+1)%words.length);}sd(w.slice(0,ci));return()=>clearTimeout(t);},[ci,del,wi,words,speed,pause]);
  return<span style={{background:"linear-gradient(90deg,#ff6b35,#e040fb,#00d4ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>{d}<span style={{borderRight:"3px solid #e040fb",animation:"blink 1s step-end infinite",WebkitTextFillColor:"#e040fb"}}>&nbsp;</span></span>;
}
function Particles({count=50}){
  const cvs=useRef(null);
  useEffect(()=>{
    const c=cvs.current;if(!c)return;const ctx=c.getContext("2d");
    let W=c.width=c.offsetWidth,H=c.height=c.offsetHeight;
    const COLS=["#ff6b35","#00d4ff","#e040fb","#00e676","#ffd600","#448aff","#1de9b6","#ff5252"];
    const ps=Array.from({length:count},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*2+0.4,dx:(Math.random()-0.5)*0.35,dy:(Math.random()-0.5)*0.35,color:COLS[Math.floor(Math.random()*COLS.length)],a:Math.random()*0.6+0.2}));
    let raf;
    const draw=()=>{
      ctx.clearRect(0,0,W,H);
      ps.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=p.color+Math.floor(p.a*255).toString(16).padStart(2,"0");ctx.fill();p.x+=p.dx;p.y+=p.dy;if(p.x<0||p.x>W)p.dx*=-1;if(p.y<0||p.y>H)p.dy*=-1;});
      for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){const d=Math.hypot(ps[i].x-ps[j].x,ps[i].y-ps[j].y);if(d<90){ctx.beginPath();ctx.moveTo(ps[i].x,ps[i].y);ctx.lineTo(ps[j].x,ps[j].y);ctx.strokeStyle=ps[i].color+Math.floor(0.1*(1-d/90)*255).toString(16).padStart(2,"0");ctx.lineWidth=0.5;ctx.stroke();}}
      raf=requestAnimationFrame(draw);
    };
    draw();
    const onR=()=>{W=c.width=c.offsetWidth;H=c.height=c.offsetHeight;};
    window.addEventListener("resize",onR);
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",onR);};
  },[count]);
  return<canvas ref={cvs} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}/>;
}
function Reveal({children,delay=0,dir="up",style={}}){
  const[ref,v]=useReveal(0.07);
  const T={up:"translateY(40px)",down:"translateY(-40px)",left:"translateX(-40px)",right:"translateX(40px)",scale:"scale(0.88)"};
  return<div ref={ref} style={{opacity:v?1:0,transform:v?"none":(T[dir]||T.up),transition:`opacity 0.65s ease ${delay}s,transform 0.65s cubic-bezier(.22,.68,0,1.2) ${delay}s`,...style}}>{children}</div>;
}
function SkillBar({label,pct,color,delay=0}){
  const[ref,v]=useReveal(0.2);
  return(
    <div ref={ref} style={{marginBottom:"1rem"}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.78rem",color:C.muted,marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif",textTransform:"uppercase",letterSpacing:"0.08em"}}>
        <span>{label}</span><span style={{color}}>{pct}%</span>
      </div>
      <div style={{height:4,background:C.border,borderRadius:2,overflow:"hidden"}}>
        <div style={{height:"100%",background:`linear-gradient(90deg,${color},${color}99)`,borderRadius:2,width:v?`${pct}%`:"0%",transition:`width 1.3s cubic-bezier(.22,.68,0,1.2) ${delay}s`,boxShadow:`0 0 10px ${color}77`}}/>
      </div>
    </div>
  );
}

/* ─── DATA ────────────────────────────────────────────────────────────────── */
const TEAM=[
  {name:"Arjun Mehta",role:"Principal Civil Engineer",dept:"Civil",exp:"18 yrs",photo:"https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",spec:"Structural Analysis & Design"},
  {name:"Priya Nair",role:"Senior Civil Engineer",dept:"Civil",exp:"12 yrs",photo:"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",spec:"Foundation Engineering"},
  {name:"Rohit Sharma",role:"Civil Engineer",dept:"Civil",exp:"8 yrs",photo:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",spec:"Road & Highway Construction"},
  {name:"Sneha Reddy",role:"Civil Engineer",dept:"Civil",exp:"6 yrs",photo:"https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",spec:"Concrete Structures"},
  {name:"Karthik Rao",role:"Civil Engineer",dept:"Civil",exp:"7 yrs",photo:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",spec:"Geotechnical Engineering"},
  {name:"Deepa Krishnan",role:"Site Engineer",dept:"Site",exp:"9 yrs",photo:"https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=400&q=80",spec:"Construction Supervision"},
  {name:"Anil Kumar",role:"Site Engineer",dept:"Site",exp:"11 yrs",photo:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",spec:"Project Execution"},
  {name:"Meena Pillai",role:"Site Engineer",dept:"Site",exp:"5 yrs",photo:"https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&q=80",spec:"Quality Control"},
  {name:"Vinod Patel",role:"Site Engineer",dept:"Site",exp:"10 yrs",photo:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",spec:"Safety Management"},
  {name:"Lakshmi Iyer",role:"Site Engineer",dept:"Site",exp:"7 yrs",photo:"https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&q=80",spec:"MEP Coordination"},
  {name:"Suresh Babu",role:"Lead Surveyor",dept:"Survey",exp:"14 yrs",photo:"https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",spec:"Land & Boundary Surveys"},
  {name:"Kavitha Menon",role:"Surveyor",dept:"Survey",exp:"8 yrs",photo:"https://images.unsplash.com/photo-1609010697446-11f2155278f0?w=400&q=80",spec:"Topographic Mapping"},
  {name:"Ravi Shankar",role:"Surveyor",dept:"Survey",exp:"6 yrs",photo:"https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&q=80",spec:"GPS & GIS Surveys"},
  {name:"Tara Singh",role:"Surveyor",dept:"Survey",exp:"5 yrs",photo:"https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=400&q=80",spec:"Construction Staking"},
  {name:"Ganesh Nair",role:"Surveyor",dept:"Survey",exp:"9 yrs",photo:"https://images.unsplash.com/photo-1553267751-1c148a7280a1?w=400&q=80",spec:"Volume & Cut/Fill Analysis"},
  {name:"Pooja Agarwal",role:"Chief Estimator",dept:"Estimate",exp:"13 yrs",photo:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",spec:"Cost Planning & BOQ"},
  {name:"Manoj Verma",role:"Estimator",dept:"Estimate",exp:"8 yrs",photo:"https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&q=80",spec:"Quantity Surveying"},
  {name:"Anitha Rao",role:"Estimator",dept:"Estimate",exp:"7 yrs",photo:"https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&q=80",spec:"Tender Preparation"},
  {name:"Sanjay Gupta",role:"Estimator",dept:"Estimate",exp:"6 yrs",photo:"https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=400&q=80",spec:"Material Procurement"},
  {name:"Ramya Krishnan",role:"Estimator",dept:"Estimate",exp:"5 yrs",photo:"https://images.unsplash.com/photo-1601412436009-d964bd02edbc?w=400&q=80",spec:"Risk & Value Analysis"},
  {name:"Dr. Nandini Shetty",role:"Urban Planner",dept:"Urban",exp:"16 yrs",photo:"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",spec:"Master Plans & Zoning"},
  {name:"Harish Kumar",role:"Urban Planner",dept:"Urban",exp:"10 yrs",photo:"https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=400&q=80",spec:"Transport Planning"},
  {name:"Swathi Balan",role:"Urban Planner",dept:"Urban",exp:"9 yrs",photo:"https://images.unsplash.com/photo-1560439513-74b037a25d84?w=400&q=80",spec:"Environmental Impact"},
  {name:"Nitesh Joshi",role:"Urban Planner",dept:"Urban",exp:"7 yrs",photo:"https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&q=80",spec:"Smart City Solutions"},
  {name:"Divya Narayanan",role:"Urban Planner",dept:"Urban",exp:"8 yrs",photo:"https://images.unsplash.com/photo-1511485977113-f34c92461ad9?w=400&q=80",spec:"Infrastructure Planning"},
];
const DEPT_LABELS={Civil:"Civil Engineers",Site:"Site Engineers",Survey:"Surveyors",Estimate:"Estimators",Urban:"Urban Planners"};
const PROJECTS=[
  {name:"Yuva Heights Tower",type:"Residential",loc:"Bengaluru, KA",img:"https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80",color:"#ff6b35"},
  {name:"Metro Commercial Hub",type:"Commercial",loc:"Hyderabad, TS",img:"https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=600&q=80",color:"#448aff"},
  {name:"NH-48 Highway Expansion",type:"Infrastructure",loc:"Chennai, TN",img:"https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&q=80",color:"#00e676"},
  {name:"Greenfield Urban Township",type:"Urban Dev",loc:"Pune, MH",img:"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80",color:"#e040fb"},
  {name:"Riverside Bridge",type:"Infrastructure",loc:"Kochi, KL",img:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",color:"#1de9b6"},
  {name:"Tech Park Phase II",type:"Commercial",loc:"Bengaluru, KA",img:"https://images.unsplash.com/photo-1429497419816-9ca5cfb4571a?w=600&q=80",color:"#ffd600"},
];
const SERVICES=[
  {icon:"🏗️",title:"Structural Engineering",desc:"Advanced structural design, analysis, and construction supervision for residential, commercial, and industrial buildings."},
  {icon:"🏙️",title:"Urban Development",desc:"Comprehensive urban planning solutions including master plans, zoning regulations, and sustainable city infrastructure."},
  {icon:"📐",title:"Land Surveying",desc:"Precision topographic, boundary, and construction surveys using GPS, total stations, and drone technology."},
  {icon:"💰",title:"Cost Estimation",desc:"Detailed quantity surveying, BOQ preparation, and cost planning ensuring budget accuracy from design to completion."},
  {icon:"🛣️",title:"Infrastructure",desc:"Roads, highways, bridges, drainage systems, and public utilities engineered to national standards."},
  {icon:"🌿",title:"Green Construction",desc:"Sustainable construction practices, LEED-compliant designs, and eco-friendly material specifications."},
];
const SKILLS=[
  {label:"Structural Design",pct:94,color:"#ff6b35"},
  {label:"Project Management",pct:88,color:"#00d4ff"},
  {label:"Cost Estimation",pct:92,color:"#e040fb"},
  {label:"Urban Planning",pct:85,color:"#00e676"},
  {label:"Site Execution",pct:90,color:"#ffd600"},
  {label:"Surveying & GIS",pct:87,color:"#448aff"},
];
const CONTACT_ITEMS=[
  {icon:"📍",label:"Head Office",value:"No. 12, Residency Road, Bengaluru, KA – 560025",color:"#ff6b35"},
  {icon:"📞",label:"Phone",value:"+91 80 4567 8900",color:"#00d4ff"},
  {icon:"✉️",label:"Email",value:"info@yuvaconstruction.in",color:"#e040fb"},
  {icon:"🕐",label:"Working Hours",value:"Mon – Sat: 9:00 AM – 6:00 PM",color:"#00e676"},
];

/* ─── GLOBAL CSS ──────────────────────────────────────────────────────────── */
const styles=`
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Barlow:wght@300;400;500;600&family=Barlow+Condensed:wght@400;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'Barlow',sans-serif;background:${C.bg};color:${C.text};overflow-x:hidden}
img{max-width:100%}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:${C.bg}}
::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#ff6b35,#e040fb,#00d4ff);border-radius:2px}

/* ANIMATIONS */
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes spinSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes zoomIn{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
@keyframes pageEnter{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
@keyframes gradShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 rgba(228,64,251,0)}50%{box-shadow:0 0 20px 4px rgba(228,64,251,0.35)}}
@keyframes slideInLeft{from{opacity:0;transform:translateX(-60px)}to{opacity:1;transform:none}}
@keyframes slideInRight{from{opacity:0;transform:translateX(60px)}to{opacity:1;transform:none}}
@keyframes slideDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:none}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.page-enter{animation:pageEnter 0.5s ease forwards}

/* ── NAV ── */
nav{
  position:fixed;top:0;left:0;right:0;z-index:200;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 5%;height:68px;
  background:rgba(13,13,26,0.96);backdrop-filter:blur(20px);
  border-bottom:1px solid ${C.border};
  transition:height 0.3s,box-shadow 0.3s;
}
nav.scrolled{height:58px;box-shadow:0 4px 30px rgba(0,0,0,0.6)}
.nav-logo{
  font-family:'Playfair Display',serif;font-size:clamp(1.1rem,2.5vw,1.4rem);font-weight:700;
  background:linear-gradient(90deg,#ff6b35,#e040fb,#00d4ff);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  background-size:200%;animation:gradShift 4s ease infinite;
  cursor:pointer;display:flex;align-items:center;gap:10px;flex-shrink:0;
  transition:transform 0.2s;
}
.nav-logo:hover{transform:scale(1.04)}
.nav-logo-icon{
  width:34px;height:34px;flex-shrink:0;
  background:linear-gradient(135deg,#ff6b35,#e040fb);
  display:flex;align-items:center;justify-content:center;
  font-size:0.7rem;font-weight:700;font-family:'Playfair Display',sans-serif;
  letter-spacing:0.08em;color:#fff;transform:rotate(45deg);
  animation:glowPulse 2.5s ease-in-out infinite;border-radius:2px;
}
.nav-logo-icon span{
  display: inline-block;
  transform: rotate(-45deg);

  background: linear-gradient(
    90deg,
    #ffffff,
    #ffd600,
    #00e676,
    #00d4ff,
    #ffffff
  );

  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  animation: ycTextFlow 4s linear infinite;
}
  @keyframes ycTextFlow{
  0%{
    background-position: 0% 50%;
  }
  100%{
    background-position: 100% 50%;
  }
}
.nav-logo-icon span{
  font-size: 1.3rem;
  font-weight: 800;
  background: linear-gradient(
    90deg,
    #ff6b35,
    #00d4ff,
    #e040fb,
    #00e676,
    #ffd600,
    #448aff
  );
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ycColorFlow 6s ease infinite;
}
  @keyframes ycColorFlow{
  0%{
    background-position: 0% 50%;
  }
  50%{
    background-position: 100% 50%;
  }
  100%{
    background-position: 0% 50%;
  }
}
.nav-links{display:flex;gap:1.5rem;list-style:none}
.nav-links li{
  font-family:'Barlow Condensed',sans-serif;font-size:0.82rem;font-weight:600;
  letter-spacing:0.12em;text-transform:uppercase;color:${C.muted};
  cursor:pointer;transition:color 0.2s;position:relative;padding-bottom:2px;white-space:nowrap;
}
.nav-links li::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#ff6b35,#e040fb,#00d4ff);transform:scaleX(0);transition:transform 0.25s ease;transform-origin:left;border-radius:1px}
.nav-links li:hover,.nav-links li.active{color:#fff}
.nav-links li:hover::after,.nav-links li.active::after{transform:scaleX(1)}

/* Hamburger */
.hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:6px;border:none;background:transparent;z-index:201}
.hamburger span{display:block;width:24px;height:2px;background:${C.text};border-radius:1px;transition:all 0.3s}
.hamburger.open span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.hamburger.open span:nth-child(2){opacity:0;transform:scaleX(0)}
.hamburger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}

/* Mobile menu */
.mobile-menu{
  display:none;position:fixed;top:58px;left:0;right:0;z-index:199;
  background:rgba(13,13,26,0.98);backdrop-filter:blur(20px);
  border-bottom:1px solid ${C.border};
  flex-direction:column;padding:1rem 0;
  animation:slideDown 0.3s ease;
}
.mobile-menu.open{display:flex}
.mobile-menu li{
  list-style:none;font-family:'Barlow Condensed',sans-serif;font-size:1rem;font-weight:600;
  letter-spacing:0.12em;text-transform:uppercase;color:${C.muted};
  cursor:pointer;padding:0.9rem 6%;border-bottom:1px solid ${C.border}33;
  transition:all 0.2s;display:flex;align-items:center;gap:10px;
}
.mobile-menu li:hover,.mobile-menu li.active{color:#fff;background:rgba(255,107,53,0.08);padding-left:calc(6% + 6px)}
.mobile-menu li:last-child{border-bottom:none}
.mobile-menu .m-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}

/* ── BUTTONS ── */
.btn-primary{
  padding:13px 28px;border:none;cursor:pointer;
  font-family:'Barlow Condensed',sans-serif;font-size:0.85rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;
  background:linear-gradient(135deg,#ff6b35,#e040fb);color:#fff;
  clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));
  transition:all 0.3s;position:relative;overflow:hidden;
  box-shadow:0 4px 18px rgba(228,64,251,0.35);
}
.btn-primary::after{content:'';position:absolute;inset:0;background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,0.28) 50%,transparent 70%);transform:translateX(-100%);transition:transform 0.5s}
.btn-primary:hover::after{transform:translateX(100%)}
.btn-primary:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(228,64,251,0.5)}
.btn-outline{
  background:transparent;color:${C.text};padding:12px 28px;cursor:pointer;
  font-family:'Barlow Condensed',sans-serif;font-size:0.85rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;
  outline:2px solid #448aff;border:none;transition:all 0.25s;
}
.btn-outline:hover{background:rgba(68,138,255,0.15);transform:translateY(-3px);outline-color:#00d4ff;color:#00d4ff}

/* ── HERO ── */
.hero{
  min-height:100vh;display:grid;grid-template-columns:1fr 1fr;
  position:relative;overflow:hidden;
}
.hero-bg{position:absolute;inset:0;z-index:0;background:radial-gradient(ellipse at 20% 50%,rgba(255,107,53,0.12) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(0,212,255,0.09) 0%,transparent 60%),radial-gradient(ellipse at 60% 80%,rgba(228,64,251,0.09) 0%,transparent 60%)}
.hero-left{display:flex;flex-direction:column;justify-content:center;padding:clamp(5rem,10%,9rem) clamp(4%,8%,8%) clamp(4rem,8%,8rem) clamp(4%,10%,10%);position:relative;z-index:2;animation:slideInLeft 0.9s cubic-bezier(.22,.68,0,1.2) both}
.hero-right{position:relative;overflow:hidden;animation:slideInRight 0.9s cubic-bezier(.22,.68,0,1.2) 0.2s both}
.hero-tag{font-family:'Barlow Condensed',sans-serif;font-size:clamp(0.7rem,1.5vw,0.78rem);font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#ff6b35;display:flex;align-items:center;gap:12px;margin-bottom:clamp(1rem,2vw,2rem);animation:slideInLeft 0.7s ease 0.3s both}
.hero-tag::before{content:'';width:36px;height:2px;background:linear-gradient(90deg,#ff6b35,#e040fb);flex-shrink:0}
.hero-h1{font-family:'Playfair Display',serif;font-size:clamp(2.2rem,5vw,5.2rem);font-weight:900;line-height:1.05;color:${C.text};margin-bottom:clamp(1rem,2vw,1.5rem);animation:slideInLeft 0.8s ease 0.4s both}
.hero-desc{font-size:clamp(0.9rem,1.5vw,1.05rem);font-weight:300;color:${C.muted};line-height:1.8;max-width:420px;margin-bottom:clamp(1.5rem,3vw,3rem);animation:slideInLeft 0.8s ease 0.55s both}
.hero-btns{display:flex;gap:1rem;flex-wrap:wrap;animation:slideInLeft 0.8s ease 0.65s both}
.hero-stats{display:flex;gap:clamp(1.2rem,3vw,2.5rem);margin-top:clamp(2rem,3vw,3.5rem);padding-top:clamp(1.5rem,2.5vw,2.5rem);border-top:1px solid ${C.border};animation:slideInLeft 0.8s ease 0.75s both;flex-wrap:wrap}
.hero-stat-num{font-family:'Playfair Display',serif;font-size:clamp(1.6rem,3vw,2.4rem);font-weight:900;line-height:1}
.hero-stat-label{font-size:clamp(0.65rem,1.2vw,0.78rem);color:${C.muted};text-transform:uppercase;letter-spacing:0.1em;margin-top:4px}
.hero-img-grid{position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:3px}
.hero-img-cell{background-size:cover;background-position:center;position:relative;overflow:hidden;transition:transform 0.5s ease}
.hero-img-cell:nth-child(1){animation:zoomIn 1s ease 0.1s both}
.hero-img-cell:nth-child(2){animation:zoomIn 1s ease 0.25s both}
.hero-img-cell:nth-child(3){animation:zoomIn 1s ease 0.4s both}
.hero-img-cell:nth-child(4){animation:zoomIn 1s ease 0.55s both}
.hero-img-cell:hover{transform:scale(1.05);z-index:2}
.hero-img-cell::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,107,53,0.18),rgba(228,64,251,0.1),transparent)}
.hero-overlay{position:absolute;inset:0;background:linear-gradient(to right,${C.bg} 0%,transparent 40%);z-index:1}
.hero-badge{position:absolute;bottom:8%;left:5%;z-index:3;background:linear-gradient(135deg,rgba(13,13,26,0.95),rgba(22,22,58,0.95));border:1px solid rgba(228,64,251,0.4);padding:clamp(0.7rem,1.5vw,1rem) clamp(1rem,2vw,1.5rem);display:flex;align-items:center;gap:1rem;animation:floatY 3s ease-in-out infinite;box-shadow:0 8px 32px rgba(228,64,251,0.2)}
.badge-text-top{font-size:0.7rem;color:${C.muted};text-transform:uppercase;letter-spacing:0.1em}
.badge-text-bot{font-family:'Barlow Condensed',sans-serif;font-size:0.95rem;font-weight:700;background:linear-gradient(90deg,#ffd600,#ff6b35);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}

/* ── MARQUEE ── */
.marquee-wrap{overflow:hidden;border-top:1px solid ${C.border};border-bottom:1px solid ${C.border};background:${C.surface};padding:12px 0}
.marquee-track{display:flex;gap:2.5rem;width:max-content;animation:marquee 24s linear infinite}

/* ── SECTIONS ── */
.page{padding:clamp(60px,8%,100px) clamp(4%,8%,10%)}
.section-tag{font-family:'Barlow Condensed',sans-serif;font-size:clamp(0.7rem,1.2vw,0.78rem);font-weight:700;letter-spacing:0.2em;text-transform:uppercase;display:flex;align-items:center;gap:12px;margin-bottom:1rem}
.section-title{font-family:'Playfair Display',serif;font-size:clamp(1.8rem,4vw,3.4rem);font-weight:700;line-height:1.15;color:${C.text}}
.section-desc{font-size:clamp(0.88rem,1.5vw,1rem);color:${C.muted};font-weight:300;line-height:1.8;max-width:560px;margin-top:1rem}
.grad-divider{width:60px;height:3px;border-radius:2px;margin:1.5rem 0}
.full-divider{height:1px;background:${C.border};margin:0 clamp(4%,8%,10%)}

/* ── ABOUT ── */
.about-grid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(2rem,5%,5rem);align-items:center}
.about-img-stack{position:relative;height:clamp(300px,45vw,520px)}
.about-img-main{position:absolute;top:0;left:0;right:clamp(2rem,8%,5rem);bottom:clamp(2rem,8%,5rem);background-size:cover;background-position:center;border-radius:4px;overflow:hidden;border:1px solid rgba(0,212,255,0.25)}
.about-img-accent{position:absolute;bottom:0;right:0;width:55%;height:55%;background-size:cover;background-position:center;border-radius:4px;transition:transform 0.4s;border:2px solid rgba(228,64,251,0.5)}
.about-img-accent:hover{transform:scale(1.05)}
.about-year-badge{position:absolute;top:1.5rem;right:clamp(1.8rem,8%,4.5rem);background:linear-gradient(135deg,#ff6b35,#e040fb);color:#fff;padding:0.9rem 1.1rem;text-align:center;z-index:2;border-radius:4px;animation:floatY 4s ease-in-out infinite;box-shadow:0 6px 24px rgba(228,64,251,0.4)}
.about-year-badge .yr{font-family:'Playfair Display',serif;font-size:clamp(1.5rem,3vw,2rem);font-weight:900;line-height:1}
.about-year-badge .yr-label{font-size:clamp(0.58rem,1vw,0.65rem);font-weight:700;letter-spacing:0.1em;text-transform:uppercase}
.about-feat{display:flex;gap:1rem;align-items:flex-start;padding:1.1rem;background:${C.card};border-radius:6px;border-left:3px solid transparent;transition:all 0.3s;margin-bottom:0.9rem}
.about-feat:hover{transform:translateX(5px);box-shadow:0 4px 20px rgba(0,0,0,0.3)}
.about-feat-icon{font-size:1.3rem;flex-shrink:0;margin-top:2px}
.about-feat-title{font-family:'Barlow Condensed',sans-serif;font-size:0.92rem;font-weight:700;letter-spacing:0.05em;margin-bottom:3px}
.about-feat-desc{font-size:0.83rem;color:${C.muted};line-height:1.6}

/* ── SERVICES ── */
.services-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:3px}
.service-card{padding:clamp(1.5rem,3vw,2.5rem) clamp(1.2rem,2.5vw,2rem);position:relative;overflow:hidden;cursor:default;transition:all 0.35s ease;border-radius:2px;height:100%}
.service-card:hover{transform:translateY(-7px);box-shadow:0 20px 50px rgba(0,0,0,0.5)}
.service-num{font-family:'Playfair Display',serif;font-size:clamp(2.5rem,4vw,3.5rem);font-weight:900;line-height:1;margin-bottom:0.8rem;opacity:0.25;transition:all 0.35s}
.service-card:hover .service-num{opacity:0.45;transform:scale(1.1);transform-origin:left}
.service-icon{font-size:clamp(1.6rem,3vw,2.2rem);margin-bottom:0.8rem;display:inline-block;transition:transform 0.3s}
.service-card:hover .service-icon{transform:scale(1.25) rotate(5deg)}
.service-title{font-family:'Barlow Condensed',sans-serif;font-size:clamp(0.95rem,1.8vw,1.15rem);font-weight:700;letter-spacing:0.06em;color:#fff;margin-bottom:0.6rem;text-transform:uppercase}
.service-desc{font-size:clamp(0.8rem,1.3vw,0.88rem);color:rgba(255,255,255,0.72);line-height:1.7}
.service-arrow{position:absolute;bottom:1.5rem;right:1.5rem;font-size:1.2rem;color:#fff;opacity:0;transition:opacity 0.2s,transform 0.3s;transform:translateX(-12px) rotate(-45deg)}
.service-card:hover .service-arrow{opacity:1;transform:translateX(0) rotate(0)}

/* ── TEAM ── */
.team-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:clamp(0.8rem,1.5vw,1.5rem)}
.team-card{background:${C.card};border:1px solid ${C.border};overflow:hidden;transition:all 0.35s cubic-bezier(.22,.68,0,1.2);border-radius:8px}
.team-card:hover{transform:translateY(-8px) scale(1.02);box-shadow:0 20px 50px rgba(0,0,0,0.5)}
.team-photo{width:100%;aspect-ratio:3/4;background-size:cover;background-position:center top;position:relative;overflow:hidden}
.team-photo-bg{position:absolute;inset:0;background-size:cover;background-position:center top;transition:transform 0.5s ease}
.team-card:hover .team-photo-bg{transform:scale(1.09)}
.team-photo-overlay{position:absolute;inset:0;background:linear-gradient(to top,${C.bg} 0%,transparent 50%);opacity:0;transition:opacity 0.3s}
.team-card:hover .team-photo-overlay{opacity:1}
.team-info{padding:clamp(0.9rem,1.5vw,1.25rem) clamp(0.7rem,1.2vw,1rem)}
.team-name{font-family:'Barlow Condensed',sans-serif;font-size:clamp(0.88rem,1.3vw,1rem);font-weight:700;color:${C.text};letter-spacing:0.04em;margin-bottom:3px}
.team-exp{font-size:clamp(0.68rem,1.1vw,0.75rem);color:${C.muted}}
.team-socials{display:flex;gap:6px;margin-top:8px}
.team-social{width:26px;height:26px;display:flex;align-items:center;justify-content:center;border-radius:4px;font-size:0.65rem;cursor:pointer;transition:all 0.2s;background:${C.border};color:${C.muted}}
.team-social:hover{transform:translateY(-2px);color:#fff}

/* ── PROJECTS ── */
.filter-btn{font-family:'Barlow Condensed',sans-serif;font-size:clamp(0.72rem,1.2vw,0.82rem);font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:clamp(6px,1vw,9px) clamp(12px,2vw,22px);background:transparent;border:2px solid ${C.border};color:${C.muted};cursor:pointer;transition:all 0.25s;border-radius:4px}
.filter-btn:hover{border-color:#448aff;color:#448aff}
.filter-btn.active{background:linear-gradient(135deg,#448aff,#7c4dff);border-color:transparent;color:#fff;box-shadow:0 4px 16px rgba(68,138,255,0.4)}
.projects-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:3px}
.project-card{position:relative;aspect-ratio:4/3;overflow:hidden;cursor:pointer;border-radius:2px}
.project-bg{position:absolute;inset:0;background-size:cover;background-position:center;transition:transform 0.6s ease}
.project-card:hover .project-bg{transform:scale(1.09)}
.project-card::after{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(13,13,26,0.95) 0%,transparent 55%)}
.project-overlay{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;justify-content:flex-end;padding:clamp(1rem,2vw,1.5rem);transition:background 0.3s}
.project-type{font-family:'Barlow Condensed',sans-serif;font-size:clamp(0.65rem,1.1vw,0.72rem);font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:5px;transition:transform 0.3s}
.project-name{font-family:'Playfair Display',serif;font-size:clamp(0.9rem,1.8vw,1.1rem);font-weight:700;color:${C.text};margin-bottom:4px;transition:transform 0.3s 0.05s}
.project-loc{font-size:clamp(0.72rem,1.2vw,0.8rem);color:${C.muted};transition:transform 0.3s 0.1s}
.project-card:hover .project-type,.project-card:hover .project-name,.project-card:hover .project-loc{transform:translateY(-4px)}
.project-hover{position:absolute;top:1rem;right:1rem;z-index:3;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:1rem;color:#fff;opacity:0;transform:scale(0.7) rotate(-45deg);transition:all 0.3s cubic-bezier(.22,.68,0,1.3);border-radius:50%}
.project-card:hover .project-hover{opacity:1;transform:scale(1) rotate(0)}

/* ── CONTACT ── */
.contact-grid{display:grid;grid-template-columns:1fr 1.5fr;gap:clamp(2rem,5%,5rem)}
.contact-item{display:flex;gap:1.1rem;align-items:flex-start;padding-bottom:1.5rem;border-bottom:1px solid ${C.border};transition:transform 0.3s}
.contact-item:hover{transform:translateX(5px)}
.contact-item:last-of-type{border-bottom:none}
.contact-icon{width:44px;height:44px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.1rem;border-radius:8px;transition:all 0.3s}
.contact-label{font-size:0.72rem;color:${C.muted};text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px}
.contact-value{font-family:'Barlow Condensed',sans-serif;font-size:clamp(0.9rem,1.5vw,1.05rem);font-weight:600;color:${C.text}}
.contact-form{display:flex;flex-direction:column;gap:1.1rem}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:1.1rem}
.form-group{display:flex;flex-direction:column;gap:5px}
.form-label{font-size:0.72rem;color:${C.muted};text-transform:uppercase;letter-spacing:0.1em}
.form-input,.form-select,.form-textarea{background:${C.card};border:1px solid ${C.border};color:${C.text};padding:11px 13px;font-family:'Barlow',sans-serif;font-size:0.9rem;outline:none;transition:border-color 0.25s,box-shadow 0.25s;width:100%;appearance:none;border-radius:4px}
.form-input:focus,.form-select:focus,.form-textarea:focus{border-color:#448aff;box-shadow:0 0 0 3px rgba(68,138,255,0.18)}
.form-textarea{resize:vertical;min-height:110px}
.form-select option{background:${C.card}}

/* ── FOOTER ── */
footer{background:${C.surface};border-top:1px solid ${C.border};padding:clamp(3rem,6%,5rem) clamp(4%,8%,10%) clamp(1.5rem,3%,2rem)}
.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:clamp(1.5rem,3vw,3rem);margin-bottom:2.5rem}
.footer-brand-desc{font-size:clamp(0.8rem,1.3vw,0.88rem);color:${C.muted};line-height:1.8;max-width:280px}
.footer-col-title{font-family:'Barlow Condensed',sans-serif;font-size:0.8rem;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${C.text};margin-bottom:1.2rem}
.footer-links{list-style:none;display:flex;flex-direction:column;gap:0.55rem}
.footer-links li{font-size:clamp(0.8rem,1.2vw,0.88rem);color:${C.muted};cursor:pointer;transition:all 0.2s;padding-left:0}
.footer-links li:hover{padding-left:6px}
.footer-bottom{padding-top:1.5rem;border-top:1px solid ${C.border};display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem}
.footer-copy{font-size:clamp(0.72rem,1.1vw,0.8rem);color:${C.muted}}
.footer-social{width:34px;height:34px;border:1px solid ${C.border};border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:0.82rem;color:${C.muted};transition:all 0.25s}
.footer-social:hover{transform:translateY(-3px) rotate(5deg);color:#fff}

/* ════════════════════════════════════════════════
   RESPONSIVE BREAKPOINTS
   ════════════════════════════════════════════════ */

/* ── Large Desktop (1536px+) ── */
@media(min-width:1536px){
  .page{padding:110px 12%}
  .hero-left{padding:10% 8% 10% 12%}
  .team-grid{grid-template-columns:repeat(5,1fr)}
  .services-grid{grid-template-columns:repeat(3,1fr)}
}

/* ── Desktop (1280–1535px) ── default above ── */

/* ── Laptop (1024–1279px) ── */
@media(max-width:1279px){
  .team-grid{grid-template-columns:repeat(4,1fr)}
  .footer-grid{grid-template-columns:1.5fr 1fr 1fr 1fr}
}

/* ── Tablet Landscape (900–1023px) ── */
@media(max-width:1023px){
  .hero{grid-template-columns:1fr}
  .hero-left{padding:clamp(5.5rem,12%,8rem) 6% 4rem 6%;align-items:center;text-align:center}
  .hero-tag{justify-content:center}
  .hero-desc{max-width:100%;text-align:center}
  .hero-btns{justify-content:center}
  .hero-stats{justify-content:center}
  .hero-right{display:none}
  .about-grid{grid-template-columns:1fr;gap:3rem}
  .about-img-stack{height:clamp(260px,50vw,420px);display:block}
  .services-grid{grid-template-columns:repeat(3,1fr)}
  .team-grid{grid-template-columns:repeat(3,1fr)}
  .projects-grid{grid-template-columns:repeat(2,1fr)}
  .contact-grid{grid-template-columns:1fr}
  .footer-grid{grid-template-columns:1fr 1fr;row-gap:2rem}
  .nav-links{display:none}
  .hamburger{display:flex}
}

/* ── Tablet Portrait (640–899px) ── */
@media(max-width:899px){
  .services-grid{grid-template-columns:repeat(2,1fr)}
  .team-grid{grid-template-columns:repeat(3,1fr)}
  .projects-grid{grid-template-columns:repeat(2,1fr)}
  .form-row{grid-template-columns:1fr 1fr}
}

/* ── Large Mobile (480–639px) ── */
@media(max-width:639px){
  .services-grid{grid-template-columns:repeat(2,1fr)}
  .team-grid{grid-template-columns:repeat(2,1fr)}
  .projects-grid{grid-template-columns:repeat(2,1fr)}
  .footer-grid{grid-template-columns:1fr 1fr}
  .form-row{grid-template-columns:1fr}
  .about-img-stack{height:clamp(220px,60vw,340px)}
  .hero-stats{gap:1rem}
}

/* ── Mobile (320–479px) ── */
@media(max-width:479px){
  .services-grid{grid-template-columns:1fr}
  .team-grid{grid-template-columns:repeat(2,1fr)}
  .projects-grid{grid-template-columns:1fr}
  .footer-grid{grid-template-columns:1fr}
  .hero-btns{flex-direction:column;align-items:center}
  .btn-primary,.btn-outline{width:100%;text-align:center;justify-content:center}
  .about-img-stack{display:none}
  .hero-stats{gap:0.8rem}
  .footer-bottom{flex-direction:column;text-align:center}
  .projects-filter{justify-content:flex-start}
  .about-grid{grid-template-columns:1fr}
}

/* ── Very Small Mobile (below 360px) ── */
@media(max-width:359px){
  .team-grid{grid-template-columns:1fr}
  nav{padding:0 4%}
  .page{padding:60px 4%}
}
`;

/* ─── MARQUEE ────────────────────────────────────────────────────────────── */
function Marquee(){
  const items=["Structural Engineering","Urban Planning","Land Surveying","Cost Estimation","Infrastructure","Green Building","Project Management","Quality Assurance","Safety Standards","BIM Technology"];
  const MCOLS=["#ff6b35","#00d4ff","#e040fb","#00e676","#ffd600","#448aff","#1de9b6","#ff5252","#ff6b35","#00d4ff"];
  return(
    <div className="marquee-wrap">
      <div className="marquee-track">
        {[...items,...items].map((item,i)=>(
          <div key={i} style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"0.8rem",fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",color:MCOLS[i%MCOLS.length],whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:"1rem"}}>
            <div style={{width:5,height:5,background:MCOLS[i%MCOLS.length],borderRadius:"50%",boxShadow:`0 0 6px ${MCOLS[i%MCOLS.length]}`}}/>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── SECTION LABEL ─────────────────────────────────────────────────────── */
function SectionTag({label,color,gradEnd}){
  return(
    <div className="section-tag" style={{color}}>
      <span style={{display:"inline-block",width:36,height:2,background:`linear-gradient(90deg,${color},${gradEnd||color})`,borderRadius:1,flexShrink:0}}/>
      {label}
    </div>
  );
}
function GradTitle({pre,em,post,g1,g2}){
  return(
    <h2 className="section-title">
      {pre&&<>{pre} </>}
      <span style={{background:`linear-gradient(90deg,${g1},${g2})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",fontStyle:"italic"}}>{em}</span>
      {post&&<> {post}</>}
    </h2>
  );
}

/* ─── PAGES ─────────────────────────────────────────────────────────────── */
function HeroPage({onNav}){
  const{w}=useWindowSize();
  const isMobile=w<480;
  return(
    <section className="hero">
      <div className="hero-bg"/>
      <Particles count={isMobile?30:50}/>
      <div className="hero-left">
        <div className="hero-tag">Est. 2005 · Bengaluru, India</div>
        <h1 className="hero-h1">
          <TypeWriter words={["Building","Designing","Shaping","Engineering"]}/><br/>
          <span style={{background:"linear-gradient(90deg,#fff,#c0c0ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Tomorrow's</span><br/>
          <span style={{background:"linear-gradient(90deg,#00d4ff,#1de9b6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>India</span>
        </h1>
        <p className="hero-desc">Yuva Construction is a premier engineering firm delivering innovative structural, infrastructure, and urban development solutions across South India and beyond.</p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={()=>onNav("Projects")}>View Our Projects</button>
          <button className="btn-outline" onClick={()=>onNav("Contact")}>Get In Touch</button>
        </div>
        <div className="hero-stats">
          {[["18+","Years Experience",STAT_COLORS[0]],["340+","Projects Done",STAT_COLORS[1]],["50+","Expert Team",STAT_COLORS[2]],["12","States Covered",STAT_COLORS[3]]].map(([n,l,col])=>(
            <div key={l}>
              <div className="hero-stat-num"><AnimCounter target={n} color={col}/></div>
              <div className="hero-stat-label">{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="hero-right">
        <div className="hero-img-grid">
          {["https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&q=80","https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&q=80","https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&q=80","https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&q=80"].map((src,i)=>(
            <div key={i} className="hero-img-cell" style={{backgroundImage:`url(${src})`}}/>
          ))}
        </div>
        <div className="hero-overlay"/>
        <div className="hero-badge">
          <div style={{fontSize:"1.8rem"}}>🏆</div>
          <div>
            <div className="badge-text-top">Award Winning</div>
            <div className="badge-text-bot">Best Construction Firm 2023</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutPage(){
  const FEATS=[
    {icon:"🎯",title:"Mission-Driven Approach",desc:"Every project is executed with clear goals, defined milestones, and unwavering commitment to quality standards.",color:"#ff6b35"},
    {icon:"🔬",title:"Technology-Forward",desc:"We leverage BIM, drone surveys, GPS technology, and modern construction management software.",color:"#00d4ff"},
    {icon:"🤝",title:"Client-Centric Culture",desc:"Transparent communication, on-time delivery, and post-project support define every client relationship.",color:"#e040fb"},
  ];
  return(
    <section className="page page-enter" style={{background:`linear-gradient(160deg,${C.bg} 60%,rgba(68,138,255,0.04) 100%)`}}>
      <div className="about-grid">
        <Reveal dir="left">
          <div className="about-img-stack">
            <div className="about-img-main" style={{backgroundImage:"url(https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=700&q=80)"}}/>
            <div className="about-img-accent" style={{backgroundImage:"url(https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&q=80)"}}/>
            <div className="about-year-badge"><div className="yr">18+</div><div className="yr-label">Years of<br/>Excellence</div></div>
          </div>
        </Reveal>
        <div>
          <Reveal delay={0.1}>
            <SectionTag label="Who We Are" color="#00d4ff" gradEnd="#e040fb"/>
            <GradTitle pre="Engineering" em="Excellence" post="Since 2005" g1="#00d4ff" g2="#e040fb"/>
            <div className="grad-divider" style={{background:"linear-gradient(90deg,#ff6b35,#e040fb,#00d4ff)"}}/>
            <p className="section-desc">Founded in 2005 in Bengaluru, Yuva Construction has grown into one of South India's most respected construction and engineering firms, combining technical precision with innovative thinking.</p>
          </Reveal>
          <Reveal delay={0.2} style={{marginTop:"1.8rem"}}>
            {SKILLS.map((s,i)=><SkillBar key={s.label} label={s.label} pct={s.pct} color={s.color} delay={i*0.1}/>)}
          </Reveal>
          <Reveal delay={0.35}>
            {FEATS.map(f=>(
              <div key={f.title} className="about-feat" style={{borderLeftColor:f.color}}>
                <div className="about-feat-icon">{f.icon}</div>
                <div>
                  <div className="about-feat-title" style={{color:f.color}}>{f.title}</div>
                  <div className="about-feat-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ServicesPage(){
  return(
    <section className="page page-enter" style={{background:`linear-gradient(160deg,#0d0d1a 0%,#0d1020 100%)`}}>
      <Reveal>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:"3.5rem",flexWrap:"wrap",gap:"1.5rem"}}>
          <div>
            <SectionTag label="What We Do" color="#e040fb" gradEnd="#448aff"/>
            <GradTitle pre="Our" em="Services" g1="#e040fb" g2="#448aff"/>
          </div>
          <p style={{maxWidth:340,fontSize:"clamp(0.85rem,1.3vw,0.92rem)",color:C.muted,lineHeight:1.8}}>From conception to completion, a full suite of construction and engineering services.</p>
        </div>
      </Reveal>
      <div className="services-grid">
        {SERVICES.map((s,i)=>(
          <Reveal key={s.title} delay={i*0.08}>
            <div className="service-card" style={{background:`linear-gradient(135deg,${SVC_COLORS[i].from}22,${SVC_COLORS[i].to}11)`,border:`1px solid ${SVC_COLORS[i].from}33`,height:"100%"}}>
              <div className="service-num" style={{color:SVC_COLORS[i].from}}>0{i+1}</div>
              <div className="service-icon">{s.icon}</div>
              <div className="service-title">{s.title}</div>
              <div className="service-desc">{s.desc}</div>
              <div className="service-arrow" style={{color:SVC_COLORS[i].from}}>→</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function TeamPage(){
  const[activeDept,setActiveDept]=useState("All");
  const[key,setKey]=useState(0);
  const depts=["All","Civil","Site","Survey","Estimate","Urban"];
  const FILTER_COLS=["#fff","#ff6b35","#448aff","#00e676","#ffd600","#e040fb"];
  const filtered=activeDept==="All"?TEAM:TEAM.filter(m=>m.dept===activeDept);
  const handleFilter=d=>{setActiveDept(d);setKey(k=>k+1);};
  return(
    <section className="page page-enter" style={{background:`linear-gradient(160deg,${C.bg} 0%,rgba(228,64,251,0.04) 100%)`}}>
      <Reveal>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:"1.5rem",marginBottom:"2.5rem"}}>
          <div>
            <SectionTag label="Our Experts" color="#1de9b6" gradEnd="#00d4ff"/>
            <GradTitle pre="Meet the" em="Team" g1="#1de9b6" g2="#00d4ff"/>
          </div>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
            {depts.map((d,i)=>(
              <button key={d} className={`filter-btn${activeDept===d?" active":""}`}
                style={activeDept===d?{background:`linear-gradient(135deg,${FILTER_COLS[i]}bb,${FILTER_COLS[i]}77)`,borderColor:"transparent",color:"#fff",boxShadow:`0 4px 14px ${FILTER_COLS[i]}44`}:{}}
                onClick={()=>handleFilter(d)}>
                {d==="All"?"All":(DEPT_LABELS[d]||d)}
              </button>
            ))}
          </div>
        </div>
      </Reveal>
      <div className="team-grid" key={key}>
        {filtered.map((m,i)=>{
          const dc=DEPT_COLORS[m.dept];
          return(
            <Reveal key={m.name} delay={Math.min(i*0.04,0.3)} dir="up">
              <div className="team-card" style={{borderColor:`${dc.bg}33`}}>
                <div className="team-photo">
                  <div className="team-photo-bg" style={{backgroundImage:`url(${m.photo})`}}/>
                  <div style={{position:"absolute",top:0,right:0,background:dc.bg,color:dc.text,fontFamily:"'Barlow Condensed',sans-serif",fontSize:"0.62rem",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",padding:"4px 10px",borderBottomLeftRadius:6}}>{m.dept}</div>
                  <div className="team-photo-overlay"/>
                </div>
                <div className="team-info">
                  <div className="team-name">{m.name}</div>
                  <div style={{fontSize:"clamp(0.7rem,1.1vw,0.78rem)",fontWeight:600,color:dc.bg,marginBottom:5}}>{m.role}</div>
                  <div className="team-exp">📌 {m.spec}</div>
                  <div className="team-exp" style={{marginTop:3}}>⏱ {m.exp} exp.</div>
                  <div className="team-socials">
                    {[["in","#0077b5"],["tw","#1da1f2"],["📧","#ea4335"]].map(([s,col])=>(
                      <div key={s} className="team-social"
                        onMouseEnter={e=>{e.currentTarget.style.background=col;e.currentTarget.style.color="#fff"}}
                        onMouseLeave={e=>{e.currentTarget.style.background=C.border;e.currentTarget.style.color=C.muted}}
                      >{s}</div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function ProjectsPage(){
  const[active,setActive]=useState("All");
  const[key,setKey]=useState(0);
  const types=["All","Residential","Commercial","Infrastructure","Urban Dev"];
  const TYPE_COLS={All:"#fff",Residential:"#ff6b35",Commercial:"#448aff",Infrastructure:"#00e676","Urban Dev":"#e040fb"};
  const filtered=active==="All"?PROJECTS:PROJECTS.filter(p=>p.type===active);
  const handleFilter=t=>{setActive(t);setKey(k=>k+1);};
  return(
    <section className="page page-enter" style={{background:`linear-gradient(160deg,#0d0d1a 0%,rgba(0,230,118,0.04) 100%)`}}>
      <Reveal>
        <div style={{marginBottom:"3.5rem"}}>
          <SectionTag label="Portfolio" color="#ffd600" gradEnd="#ff6b35"/>
          <GradTitle pre="Featured" em="Projects" g1="#ffd600" g2="#ff6b35"/>
          <p className="section-desc">A showcase of landmark projects across residential, commercial, and infrastructure sectors.</p>
        </div>
      </Reveal>
      <div style={{display:"flex",gap:"0.7rem",marginBottom:"2.5rem",flexWrap:"wrap"}}>
        {types.map(t=>(
          <button key={t} className={`filter-btn${active===t?" active":""}`}
            style={active===t?{background:`linear-gradient(135deg,${TYPE_COLS[t]}cc,${TYPE_COLS[t]}66)`,borderColor:"transparent",color:"#fff",boxShadow:`0 4px 14px ${TYPE_COLS[t]}44`}:{}}
            onClick={()=>handleFilter(t)}>{t}
          </button>
        ))}
      </div>
      <div className="projects-grid" key={key}>
        {filtered.map((p,i)=>(
          <Reveal key={p.name} delay={Math.min(i*0.08,0.3)} dir="scale">
            <div className="project-card">
              <div className="project-bg" style={{backgroundImage:`url(${p.img})`}}/>
              <div className="project-overlay">
                <div className="project-type" style={{color:p.color}}>{p.type}</div>
                <div className="project-name">{p.name}</div>
                <div className="project-loc">📍 {p.loc}</div>
              </div>
              <div className="project-hover" style={{background:p.color}}>↗</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ContactPage(){
  const[form,sf]=useState({name:"",email:"",phone:"",service:"",message:""});
  const[sent,ss]=useState(false);
  const[sending,sss]=useState(false);
  const handleSend=()=>{if(!form.name||!form.email)return;sss(true);setTimeout(()=>{sss(false);ss(true);},1600);};
  return(
    <section className="page page-enter" style={{background:`linear-gradient(160deg,${C.bg} 0%,rgba(68,138,255,0.05) 100%)`}}>
      <Reveal>
        <div style={{marginBottom:"3.5rem"}}>
          <SectionTag label="Get In Touch" color="#448aff" gradEnd="#00d4ff"/>
          <GradTitle pre="Let's Build" em="Together" g1="#448aff" g2="#00d4ff"/>
          <p className="section-desc">Ready to start your next project? Reach out for a free consultation and detailed estimate.</p>
        </div>
      </Reveal>
      <div className="contact-grid">
        <Reveal dir="left" delay={0.1}>
          <div style={{display:"flex",flexDirection:"column",gap:"1.8rem"}}>
            {CONTACT_ITEMS.map(c=>(
              <div key={c.label} className="contact-item">
                <div className="contact-icon" style={{background:`${c.color}22`,color:c.color,border:`1px solid ${c.color}44`}}>{c.icon}</div>
                <div>
                  <div className="contact-label">{c.label}</div>
                  <div className="contact-value">{c.value}</div>
                </div>
              </div>
            ))}
            <div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"0.78rem",color:C.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"0.9rem"}}>Follow Us</div>
              <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                {[["LinkedIn","#0077b5"],["Twitter","#1da1f2"],["Instagram","#e040fb"],["YouTube","#ff5252"]].map(([s,col])=>(
                  <div key={s} style={{padding:"7px 13px",border:`1px solid ${col}44`,fontSize:"0.75rem",color:col,cursor:"pointer",transition:"all 0.2s",borderRadius:4,background:`${col}11`}}
                    onMouseEnter={e=>{e.currentTarget.style.background=col;e.currentTarget.style.color="#fff"}}
                    onMouseLeave={e=>{e.currentTarget.style.background=`${col}11`;e.currentTarget.style.color=col}}
                  >{s}</div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal dir="right" delay={0.2}>
          {sent?(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"1rem",padding:"clamp(2rem,5vw,4rem)",background:C.card,border:"1px solid rgba(0,230,118,0.4)",textAlign:"center",borderRadius:8,animation:"zoomIn 0.5s ease both",boxShadow:"0 0 40px rgba(0,230,118,0.1)"}}>
              <div style={{fontSize:"3rem",animation:"floatY 2s ease-in-out infinite"}}>✅</div>
              <div style={{fontFamily:"'Playfair Display'",fontSize:"clamp(1.4rem,3vw,1.8rem)",background:"linear-gradient(90deg,#00e676,#1de9b6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Message Sent!</div>
              <div style={{color:C.muted,fontSize:"0.9rem",lineHeight:1.7}}>Thank you! Our team will get back to you within 24 hours.</div>
              <button className="btn-primary" onClick={()=>ss(false)} style={{marginTop:"0.8rem"}}>Send Another</button>
            </div>
          ):(
            <div className="contact-form">
              <div className="form-row">
                <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" placeholder="Rajesh Kumar" value={form.name} onChange={e=>sf({...form,name:e.target.value})}/></div>
                <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" placeholder="rajesh@email.com" value={form.email} onChange={e=>sf({...form,email:e.target.value})}/></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Phone</label><input className="form-input" placeholder="+91 98765 43210" value={form.phone} onChange={e=>sf({...form,phone:e.target.value})}/></div>
                <div className="form-group">
                  <label className="form-label">Service Required</label>
                  <select className="form-select" value={form.service} onChange={e=>sf({...form,service:e.target.value})}>
                    <option value="">Select a Service</option>
                    {SERVICES.map(s=><option key={s.title} value={s.title}>{s.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group"><label className="form-label">Project Details</label><textarea className="form-textarea" placeholder="Describe your project requirements..." value={form.message} onChange={e=>sf({...form,message:e.target.value})}/></div>
              <button className="btn-primary" style={{alignSelf:"flex-start",padding:"14px 36px",opacity:sending?0.7:1}} onClick={handleSend} disabled={sending}>
                {sending?(
                  <span style={{display:"flex",alignItems:"center",gap:"8px"}}>
                    <span style={{width:13,height:13,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spinSlow 0.7s linear infinite",display:"inline-block"}}/>
                    Sending...
                  </span>
                ):"Send Message →"}
              </button>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}

/* ─── APP ────────────────────────────────────────────────────────────────── */
const PAGES=["Home","About","Services","Team","Projects","Contact"];
const NAV_DOTS=["#ff6b35","#00d4ff","#e040fb","#00e676","#ffd600","#448aff"];

export default function YuvaConstruction(){
  const[activePage,setActivePage]=useState("Home");
  const[scrolled,setScrolled]=useState(false);
  const[menuOpen,setMenuOpen]=useState(false);
  const{w}=useWindowSize();

  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>40);
    window.addEventListener("scroll",fn);
    return()=>window.removeEventListener("scroll",fn);
  },[]);

  // close mobile menu on resize to desktop
  useEffect(()=>{ if(w>=1024) setMenuOpen(false); },[w]);

  const handleNav=page=>{
    setActivePage(page);
    setMenuOpen(false);
    window.scrollTo({top:0,behavior:"smooth"});
  };

  const FOOTER_LINK_COLS=["#ff6b35","#00d4ff","#e040fb","#00e676"];
  const SOCIAL_COLS=["#0077b5","#1da1f2","#e040fb","#ff5252"];

  return(
    <>
      <style>{styles}</style>
      <div>
        {/* NAV */}
        <nav className={scrolled?"scrolled":""}>
          <div className="nav-logo" onClick={()=>handleNav("Home")}>
            <div className="nav-logo-icon"><span>YC</span></div>
            Yuva Construction
          </div>
          <ul className="nav-links">
            {PAGES.map(p=>(
              <li key={p} className={activePage===p?"active":""} onClick={()=>handleNav(p)}>{p}</li>
            ))}
          </ul>
          <div className={`hamburger${menuOpen?" open":""}`} onClick={()=>setMenuOpen(o=>!o)} aria-label="Toggle menu">
            <span/><span/><span/>
          </div>
        </nav>

        {/* MOBILE MENU */}
        <ul className={`mobile-menu${menuOpen?" open":""}`}>
          {PAGES.map((p,i)=>(
            <li key={p} className={activePage===p?"active":""} onClick={()=>handleNav(p)}>
              <div className="m-dot" style={{background:NAV_DOTS[i]}}/>
              {p}
            </li>
          ))}
        </ul>

        {/* PAGES */}
        <div style={{paddingTop:activePage==="Home"?0:68}}>
          {activePage==="Home"&&(
            <>
              <HeroPage onNav={handleNav}/>
              <Marquee/>
              <div className="full-divider"/>
              <AboutPage/>
              <div className="full-divider"/>
              <ServicesPage/>
            </>
          )}
          {activePage==="About"&&<AboutPage/>}
          {activePage==="Services"&&<ServicesPage/>}
          {activePage==="Team"&&<TeamPage/>}
          {activePage==="Projects"&&<ProjectsPage/>}
          {activePage==="Contact"&&<ContactPage/>}
        </div>

        {/* FOOTER */}
        <footer>
          <Reveal>
            <div className="footer-grid">
              <div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(1.2rem,2.5vw,1.6rem)",fontWeight:700,background:"linear-gradient(90deg,#ff6b35,#e040fb,#00d4ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",marginBottom:"1rem",backgroundSize:"200%",animation:"gradShift 4s ease infinite"}}>
                  Yuva Construction
                </div>
                <p className="footer-brand-desc">Delivering engineering excellence across South India since 2005. Building structures that endure, and communities that thrive.</p>
              </div>
              {[
                {title:"Company",links:["About Us","Our Team","Projects","Services","Careers"],col:FOOTER_LINK_COLS[0]},
                {title:"Services",links:SERVICES.map(s=>s.title),col:FOOTER_LINK_COLS[1]},
                {title:"Contact",links:["Residency Road, Bengaluru","+91 80 4567 8900","info@yuvaconstruction.in","Mon–Sat: 9AM – 6PM"],col:FOOTER_LINK_COLS[2]},
              ].map(({title,links,col})=>(
                <div key={title}>
                  <div className="footer-col-title" style={{color:col}}>{title}</div>
                  <ul className="footer-links">
                    {links.map(l=><li key={l} onMouseEnter={e=>e.currentTarget.style.color=col} onMouseLeave={e=>e.currentTarget.style.color=C.muted}>{l}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <div className="footer-bottom">
              <div className="footer-copy">© 2024 Yuva Construction Pvt. Ltd. All rights reserved.</div>
              <div style={{display:"flex",gap:"10px"}}>
                {[["in",SOCIAL_COLS[0]],["tw",SOCIAL_COLS[1]],["ig",SOCIAL_COLS[2]],["yt",SOCIAL_COLS[3]]].map(([s,col])=>(
                  <div key={s} className="footer-social"
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=col;e.currentTarget.style.color=col;e.currentTarget.style.background=col+"22"}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;e.currentTarget.style.background="transparent"}}
                  >{s}</div>
                ))}
              </div>
            </div>
          </Reveal>
        </footer>
      </div>
    </>
  );
}
