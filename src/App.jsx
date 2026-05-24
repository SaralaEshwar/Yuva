import { useState, useEffect, useRef } from "react";

// ─── COLOUR PALETTE ────────────────────────────────────────────────────────────
const C = {
  bg: "#0d0d1a", surface: "#12122a", card: "#16163a", border: "#2a2a5a",
  text: "#f0f0ff", muted: "#9090c0",
  // vivid accents
  orange:  "#ff6b35", orangeLight: "#ff8c5a",
  cyan:    "#00d4ff", cyanDark: "#0099cc",
  magenta: "#e040fb", magentaDark: "#a000cc",
  green:   "#00e676", greenDark: "#00a050",
  yellow:  "#ffd600", yellowDark: "#c8a800",
  blue:    "#448aff", blueDark:   "#1a5ccc",
  coral:   "#ff5252", coralDark:  "#cc1a1a",
  teal:    "#1de9b6", tealDark:   "#00b686",
};

// service card colours
const SVC_COLORS = [
  { from:"#ff6b35", to:"#ff1744" },
  { from:"#448aff", to:"#7c4dff" },
  { from:"#00e676", to:"#00bcd4" },
  { from:"#ffd600", to:"#ff6d00" },
  { from:"#e040fb", to:"#448aff" },
  { from:"#1de9b6", to:"#00e676" },
];

// dept badge colours
const DEPT_COLORS = {
  Civil:    { bg:"#ff6b35", text:"#fff" },
  Site:     { bg:"#448aff", text:"#fff" },
  Survey:   { bg:"#00e676", text:"#0d1a0d" },
  Estimate: { bg:"#ffd600", text:"#1a1a00" },
  Urban:    { bg:"#e040fb", text:"#fff" },
};

// stat card colours
const STAT_COLORS = ["#ff6b35","#00d4ff","#e040fb","#00e676"];

// ─── HOOKS ─────────────────────────────────────────────────────────────────────
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function AnimCounter({ target, color = "#fff", duration = 1800 }) {
  const [val, setVal] = useState(0);
  const [ref, visible] = useReveal(0.3);
  useEffect(() => {
    if (!visible) return;
    const num = parseInt(target.replace(/\D/g, ""));
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * num));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, target, duration]);
  return <span ref={ref} style={{ color }}>{val}{target.includes("+") ? "+" : ""}</span>;
}

function TypeWriter({ words, speed = 85, pause = 1800 }) {
  const [display, setDisplay] = useState("");
  const [wIdx, setWIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[wIdx]; let t;
    if (!deleting && charIdx < word.length) t = setTimeout(() => setCharIdx(c => c + 1), speed);
    else if (!deleting && charIdx === word.length) t = setTimeout(() => setDeleting(true), pause);
    else if (deleting && charIdx > 0) t = setTimeout(() => setCharIdx(c => c - 1), speed / 2);
    else { setDeleting(false); setWIdx(i => (i + 1) % words.length); }
    setDisplay(word.slice(0, charIdx));
    return () => clearTimeout(t);
  }, [charIdx, deleting, wIdx, words, speed, pause]);
  return (
    <span style={{ background:"linear-gradient(90deg,#ff6b35,#e040fb,#00d4ff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
      {display}<span style={{ borderRight:"3px solid #e040fb", animation:"blink 1s step-end infinite", WebkitTextFillColor:"#e040fb" }}>&nbsp;</span>
    </span>
  );
}

// Colourful canvas particles
function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;
    const COLORS = ["#ff6b35","#00d4ff","#e040fb","#00e676","#ffd600","#448aff","#1de9b6","#ff5252"];
    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random()*W, y: Math.random()*H,
      r: Math.random()*2 + 0.5,
      dx: (Math.random()-0.5)*0.4, dy: (Math.random()-0.5)*0.4,
      color: COLORS[Math.floor(Math.random()*COLORS.length)],
      alpha: Math.random()*0.6+0.2,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = p.color + Math.floor(p.alpha*255).toString(16).padStart(2,"0");
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x<0||p.x>W) p.dx*=-1;
        if (p.y<0||p.y>H) p.dy*=-1;
      });
      for (let i=0;i<particles.length;i++) for (let j=i+1;j<particles.length;j++) {
        const d = Math.hypot(particles[i].x-particles[j].x, particles[i].y-particles[j].y);
        if (d < 100) {
          ctx.beginPath(); ctx.moveTo(particles[i].x,particles[i].y); ctx.lineTo(particles[j].x,particles[j].y);
          ctx.strokeStyle = particles[i].color + Math.floor(0.12*(1-d/100)*255).toString(16).padStart(2,"0");
          ctx.lineWidth=0.6; ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { W=canvas.width=canvas.offsetWidth; H=canvas.height=canvas.offsetHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }} />;
}

function Reveal({ children, delay=0, dir="up", style={} }) {
  const [ref, visible] = useReveal(0.08);
  const T = { up:"translateY(44px)", down:"translateY(-44px)", left:"translateX(-44px)", right:"translateX(44px)", scale:"scale(0.88)" };
  return (
    <div ref={ref} style={{ opacity:visible?1:0, transform:visible?"none":(T[dir]||T.up), transition:`opacity 0.7s ease ${delay}s, transform 0.7s cubic-bezier(.22,.68,0,1.2) ${delay}s`, ...style }}>
      {children}
    </div>
  );
}

function SkillBar({ label, pct, color, delay=0 }) {
  const [ref, visible] = useReveal(0.2);
  return (
    <div ref={ref} style={{ marginBottom:"1.1rem" }}>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.8rem", color:C.muted, marginBottom:6, fontFamily:"'Barlow Condensed',sans-serif", textTransform:"uppercase", letterSpacing:"0.08em" }}>
        <span>{label}</span><span style={{ color }}>{pct}%</span>
      </div>
      <div style={{ height:4, background:C.border, borderRadius:2, overflow:"hidden" }}>
        <div style={{ height:"100%", background:`linear-gradient(90deg,${color},${color}aa)`, borderRadius:2, width:visible?`${pct}%`:"0%", transition:`width 1.3s cubic-bezier(.22,.68,0,1.2) ${delay}s`, boxShadow:`0 0 10px ${color}88` }} />
      </div>
    </div>
  );
}

// ─── MARQUEE ──────────────────────────────────────────────────────────────────
function Marquee() {
  const items = ["Structural Engineering","Urban Planning","Land Surveying","Cost Estimation","Infrastructure","Green Building","Project Management","Quality Assurance","Safety Standards","BIM Technology"];
  const MCOLS = ["#ff6b35","#00d4ff","#e040fb","#00e676","#ffd600","#448aff","#1de9b6","#ff5252","#ff6b35","#00d4ff"];
  return (
    <div style={{ overflow:"hidden", borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`, background:C.surface, padding:"14px 0" }}>
      <div style={{ display:"flex", gap:"2.5rem", width:"max-content", animation:"marquee 24s linear infinite" }}>
        {[...items,...items].map((item,i) => (
          <div key={i} style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"0.82rem", fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", color:MCOLS[i%MCOLS.length], whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:"1rem" }}>
            <div style={{ width:6, height:6, background:MCOLS[i%MCOLS.length], borderRadius:"50%", boxShadow:`0 0 6px ${MCOLS[i%MCOLS.length]}` }} />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Barlow:wght@300;400;500;600&family=Barlow+Condensed:wght@400;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Barlow',sans-serif;background:${C.bg};color:${C.text};overflow-x:hidden}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-track{background:${C.bg}}
  ::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#ff6b35,#e040fb,#00d4ff);border-radius:2px}

  @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
  @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
  @keyframes spinSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
  @keyframes zoomIn{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
  @keyframes pageEnter{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
  @keyframes rainbowBorder{0%{border-color:#ff6b35}25%{border-color:#e040fb}50%{border-color:#00d4ff}75%{border-color:#00e676}100%{border-color:#ff6b35}}
  @keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  @keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 rgba(228,64,251,0.0)}50%{box-shadow:0 0 24px 4px rgba(228,64,251,0.35)}}

  .page-enter{animation:pageEnter 0.5s ease forwards}

  /* NAV */
  nav{
    position:fixed;top:0;left:0;right:0;z-index:100;
    display:flex;align-items:center;justify-content:space-between;
    padding:0 5%;height:72px;
    background:rgba(13,13,26,0.95);backdrop-filter:blur(20px);
    border-bottom:1px solid ${C.border};
    transition:height 0.3s,box-shadow 0.3s;
  }
  nav.scrolled{height:60px;box-shadow:0 4px 30px rgba(0,0,0,0.6)}
  .nav-logo{
    font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:700;
    background:linear-gradient(90deg,#ff6b35,#e040fb,#00d4ff);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    background-size:200%;animation:gradShift 4s ease infinite;
    cursor:pointer;display:flex;align-items:center;gap:10px;
    transition:transform 0.2s;
  }
  .nav-logo:hover{transform:scale(1.04)}
  .nav-logo-icon{
    width:36px;height:36px;
    background:linear-gradient(135deg,#ff6b35,#e040fb);
    display:flex;align-items:center;justify-content:center;
    font-size:1rem;font-weight:700;font-family:'Barlow Condensed',sans-serif;
    letter-spacing:0.08em;color:#fff;
    transform:rotate(45deg);
    box-shadow:0 0 16px rgba(228,64,251,0.5);
    animation:glowPulse 2.5s ease-in-out infinite;
  }
  .nav-logo-icon span{transform:rotate(-45deg);display:block;color:#000 !important;-webkit-text-fill-color:#000 !important;}
  .nav-links{display:flex;gap:2rem;list-style:none}
  .nav-links li{
    font-family:'Barlow Condensed',sans-serif;font-size:0.85rem;font-weight:600;
    letter-spacing:0.12em;text-transform:uppercase;color:${C.muted};
    cursor:pointer;transition:color 0.2s;position:relative;padding-bottom:2px;
  }
  .nav-links li::after{
    content:'';position:absolute;bottom:0;left:0;right:0;height:2px;
    background:linear-gradient(90deg,#ff6b35,#e040fb,#00d4ff);
    transform:scaleX(0);transition:transform 0.25s ease;transform-origin:left;border-radius:1px;
  }
  .nav-links li:hover{color:#fff}
  .nav-links li.active{color:#fff}
  .nav-links li:hover::after,.nav-links li.active::after{transform:scaleX(1)}

  /* HERO */
  .hero{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;position:relative;overflow:hidden}
  .hero-bg{
    position:absolute;inset:0;z-index:0;
    background:radial-gradient(ellipse at 20% 50%,rgba(255,107,53,0.12) 0%,transparent 60%),
               radial-gradient(ellipse at 80% 20%,rgba(0,212,255,0.10) 0%,transparent 60%),
               radial-gradient(ellipse at 60% 80%,rgba(228,64,251,0.10) 0%,transparent 60%);
  }
  .hero-left{display:flex;flex-direction:column;justify-content:center;padding:10% 8% 10% 10%;position:relative;z-index:2;animation:slideInLeft 0.9s cubic-bezier(.22,.68,0,1.2) both}
  .hero-right{position:relative;overflow:hidden;animation:slideInRight 0.9s cubic-bezier(.22,.68,0,1.2) 0.2s both}
  @keyframes slideInLeft{from{opacity:0;transform:translateX(-60px)}to{opacity:1;transform:none}}
  @keyframes slideInRight{from{opacity:0;transform:translateX(60px)}to{opacity:1;transform:none}}
  .hero-tag{
    font-family:'Barlow Condensed',sans-serif;font-size:0.78rem;font-weight:700;
    letter-spacing:0.2em;text-transform:uppercase;
    color:#ff6b35;display:flex;align-items:center;gap:12px;margin-bottom:2rem;
    animation:slideInLeft 0.7s ease 0.3s both;
  }
  .hero-tag::before{content:'';width:40px;height:2px;background:linear-gradient(90deg,#ff6b35,#e040fb)}
  .hero-h1{
    font-family:'Playfair Display',serif;font-size:clamp(3rem,5vw,5.2rem);
    font-weight:900;line-height:1.05;color:${C.text};margin-bottom:1.5rem;
    animation:slideInLeft 0.8s ease 0.4s both;
  }
  .hero-desc{font-size:1.05rem;font-weight:300;color:${C.muted};line-height:1.8;max-width:420px;margin-bottom:3rem;animation:slideInLeft 0.8s ease 0.55s both}
  .hero-btns{display:flex;gap:1rem;flex-wrap:wrap;animation:slideInLeft 0.8s ease 0.65s both}

  .btn-primary{
    padding:14px 32px;border:none;cursor:pointer;
    font-family:'Barlow Condensed',sans-serif;font-size:0.88rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;
    background:linear-gradient(135deg,#ff6b35,#e040fb);color:#fff;
    clip-path:polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px));
    transition:all 0.3s;position:relative;overflow:hidden;
    box-shadow:0 4px 20px rgba(228,64,251,0.35);
  }
  .btn-primary::after{content:'';position:absolute;inset:0;background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,0.3) 50%,transparent 70%);transform:translateX(-100%);transition:transform 0.5s}
  .btn-primary:hover::after{transform:translateX(100%)}
  .btn-primary:hover{transform:translateY(-3px);box-shadow:0 8px 30px rgba(228,64,251,0.5)}

  .btn-outline{
    background:transparent;color:${C.text};padding:13px 32px;cursor:pointer;
    border:2px solid transparent;
    background-clip:padding-box;
    font-family:'Barlow Condensed',sans-serif;font-size:0.88rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;
    position:relative;transition:all 0.25s;
    outline:2px solid #448aff;
  }
  .btn-outline:hover{background:rgba(68,138,255,0.15);transform:translateY(-3px);outline-color:#00d4ff;color:#00d4ff}

  .hero-stats{display:flex;gap:2.5rem;margin-top:3.5rem;padding-top:2.5rem;border-top:1px solid ${C.border};animation:slideInLeft 0.8s ease 0.75s both}
  .hero-stat-num{font-family:'Playfair Display',serif;font-size:2.4rem;font-weight:900;line-height:1}
  .hero-stat-label{font-size:0.78rem;color:${C.muted};text-transform:uppercase;letter-spacing:0.1em;margin-top:4px}

  .hero-img-grid{position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:3px}
  .hero-img-cell{background-size:cover;background-position:center;position:relative;overflow:hidden;transition:transform 0.5s ease}
  .hero-img-cell:nth-child(1){animation:zoomIn 1s ease 0.1s both}
  .hero-img-cell:nth-child(2){animation:zoomIn 1s ease 0.25s both}
  .hero-img-cell:nth-child(3){animation:zoomIn 1s ease 0.4s both}
  .hero-img-cell:nth-child(4){animation:zoomIn 1s ease 0.55s both}
  .hero-img-cell:hover{transform:scale(1.05);z-index:2}
  .hero-img-cell::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,107,53,0.18),rgba(228,64,251,0.1),transparent)}
  .hero-overlay{position:absolute;inset:0;background:linear-gradient(to right,${C.bg} 0%,transparent 40%);z-index:1}
  .hero-badge{
    position:absolute;bottom:8%;left:5%;z-index:3;
    background:linear-gradient(135deg,rgba(13,13,26,0.95),rgba(22,22,58,0.95));
    border:1px solid rgba(228,64,251,0.4);
    padding:1rem 1.5rem;display:flex;align-items:center;gap:1rem;
    animation:floatY 3s ease-in-out infinite;
    box-shadow:0 8px 32px rgba(228,64,251,0.2),0 0 0 1px rgba(228,64,251,0.1);
  }
  .badge-text-top{font-size:0.7rem;color:${C.muted};text-transform:uppercase;letter-spacing:0.1em}
  .badge-text-bot{font-family:'Barlow Condensed',sans-serif;font-size:1rem;font-weight:700;background:linear-gradient(90deg,#ffd600,#ff6b35);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}

  /* SECTIONS */
  .page{padding:100px 10%}
  .section-tag{
    font-family:'Barlow Condensed',sans-serif;font-size:0.78rem;font-weight:700;
    letter-spacing:0.2em;text-transform:uppercase;
    display:flex;align-items:center;gap:12px;margin-bottom:1rem;
  }
  .section-tag::before{content:'';width:40px;height:2px;border-radius:1px}
  .section-title{font-family:'Playfair Display',serif;font-size:clamp(2.2rem,4vw,3.4rem);font-weight:700;line-height:1.15;color:${C.text}}
  .section-desc{font-size:1rem;color:${C.muted};font-weight:300;line-height:1.8;max-width:560px;margin-top:1rem}
  .grad-divider{width:60px;height:3px;border-radius:2px;margin:1.8rem 0}
  .full-divider{height:1px;background:${C.border};margin:0 10%}

  /* ABOUT */
  .about-grid{display:grid;grid-template-columns:1fr 1fr;gap:5rem;align-items:center}
  .about-img-stack{position:relative;height:520px}
  .about-img-main{position:absolute;top:0;left:0;right:5rem;bottom:5rem;background-size:cover;background-position:center;border-radius:4px;overflow:hidden;border:1px solid rgba(0,212,255,0.25)}
  .about-img-accent{position:absolute;bottom:0;right:0;width:55%;height:55%;background-size:cover;background-position:center;border-radius:4px;transition:transform 0.4s;border:2px solid rgba(228,64,251,0.5)}
  .about-img-accent:hover{transform:scale(1.05)}
  .about-year-badge{
    position:absolute;top:2rem;right:4.5rem;
    background:linear-gradient(135deg,#ff6b35,#e040fb);color:#fff;
    padding:1rem 1.2rem;text-align:center;z-index:2;border-radius:4px;
    animation:floatY 4s ease-in-out infinite;
    box-shadow:0 6px 24px rgba(228,64,251,0.4);
  }
  .about-year-badge .yr{font-family:'Playfair Display',serif;font-size:2rem;font-weight:900;line-height:1}
  .about-year-badge .yr-label{font-size:0.65rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase}
  .about-feat{
    display:flex;gap:1rem;align-items:flex-start;padding:1.2rem;
    background:${C.card};border-radius:6px;
    border-left:3px solid transparent;
    transition:all 0.3s;position:relative;overflow:hidden;margin-bottom:1rem;
  }
  .about-feat:hover{transform:translateX(6px);box-shadow:0 4px 20px rgba(0,0,0,0.3)}
  .about-feat-icon{font-size:1.4rem;flex-shrink:0;margin-top:2px}
  .about-feat-title{font-family:'Barlow Condensed',sans-serif;font-size:0.95rem;font-weight:700;letter-spacing:0.05em;margin-bottom:4px}
  .about-feat-desc{font-size:0.85rem;color:${C.muted};line-height:1.6}

  /* SERVICES */
  .services-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:3px}
  .service-card{
    padding:2.5rem 2rem;position:relative;overflow:hidden;cursor:default;
    transition:all 0.35s ease;border-radius:2px;
  }
  .service-card:hover{transform:translateY(-8px);box-shadow:0 20px 50px rgba(0,0,0,0.5)}
  .service-card::before{
    content:'';position:absolute;inset:0;opacity:0.08;transition:opacity 0.35s;
    background:inherit;filter:brightness(2);
  }
  .service-card:hover::before{opacity:0.14}
  .service-num{font-family:'Playfair Display',serif;font-size:3.5rem;font-weight:900;line-height:1;margin-bottom:1rem;opacity:0.25;transition:all 0.35s}
  .service-card:hover .service-num{opacity:0.45;transform:scale(1.1);transform-origin:left}
  .service-icon{font-size:2.2rem;margin-bottom:1rem;display:inline-block;transition:transform 0.3s}
  .service-card:hover .service-icon{transform:scale(1.25) rotate(5deg)}
  .service-title{font-family:'Barlow Condensed',sans-serif;font-size:1.15rem;font-weight:700;letter-spacing:0.06em;color:#fff;margin-bottom:0.75rem;text-transform:uppercase}
  .service-desc{font-size:0.88rem;color:rgba(255,255,255,0.75);line-height:1.75}
  .service-arrow{position:absolute;bottom:2rem;right:2rem;font-size:1.3rem;color:#fff;opacity:0;transition:opacity 0.2s,transform 0.3s;transform:translateX(-12px) rotate(-45deg)}
  .service-card:hover .service-arrow{opacity:1;transform:translateX(0) rotate(0)}

  /* TEAM */
  .team-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:1.5rem}
  .team-card{background:${C.card};border:1px solid ${C.border};overflow:hidden;transition:all 0.35s cubic-bezier(.22,.68,0,1.2);border-radius:8px}
  .team-card:hover{transform:translateY(-10px) scale(1.025);box-shadow:0 24px 56px rgba(0,0,0,0.5)}
  .team-photo{width:100%;aspect-ratio:3/4;background-size:cover;background-position:center top;position:relative;overflow:hidden}
  .team-photo-bg{position:absolute;inset:0;background-size:cover;background-position:center top;transition:transform 0.5s ease}
  .team-card:hover .team-photo-bg{transform:scale(1.09)}
  .team-photo-overlay{position:absolute;inset:0;background:linear-gradient(to top,${C.bg} 0%,transparent 50%);opacity:0;transition:opacity 0.3s}
  .team-card:hover .team-photo-overlay{opacity:1}
  .team-info{padding:1.25rem 1rem}
  .team-name{font-family:'Barlow Condensed',sans-serif;font-size:1rem;font-weight:700;color:${C.text};letter-spacing:0.04em;margin-bottom:4px}
  .team-exp{font-size:0.75rem;color:${C.muted}}
  .team-socials{display:flex;gap:8px;margin-top:10px}
  .team-social{width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:4px;font-size:0.7rem;cursor:pointer;transition:all 0.2s;background:${C.border};color:${C.muted}}
  .team-social:hover{transform:translateY(-3px);color:#fff}

  /* PROJECTS */
  .projects-filter{display:flex;gap:1rem;margin-bottom:3rem;flex-wrap:wrap}
  .filter-btn{
    font-family:'Barlow Condensed',sans-serif;font-size:0.82rem;font-weight:700;
    letter-spacing:0.1em;text-transform:uppercase;padding:9px 22px;
    background:transparent;border:2px solid ${C.border};color:${C.muted};
    cursor:pointer;transition:all 0.25s;border-radius:4px;
  }
  .filter-btn:hover{border-color:#448aff;color:#448aff}
  .filter-btn.active{background:linear-gradient(135deg,#448aff,#7c4dff);border-color:transparent;color:#fff;box-shadow:0 4px 16px rgba(68,138,255,0.4)}
  .projects-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:3px}
  .project-card{position:relative;aspect-ratio:4/3;overflow:hidden;cursor:pointer;border-radius:2px}
  .project-bg{position:absolute;inset:0;background-size:cover;background-position:center;transition:transform 0.6s ease}
  .project-card:hover .project-bg{transform:scale(1.09)}
  .project-card::after{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(13,13,26,0.95) 0%,transparent 55%)}
  .project-overlay{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;justify-content:flex-end;padding:1.5rem;transition:background 0.3s}
  .project-type{font-family:'Barlow Condensed',sans-serif;font-size:0.72rem;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:6px;transition:transform 0.3s}
  .project-name{font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;color:${C.text};margin-bottom:4px;transition:transform 0.3s 0.05s}
  .project-loc{font-size:0.8rem;color:${C.muted};transition:transform 0.3s 0.1s}
  .project-card:hover .project-type,.project-card:hover .project-name,.project-card:hover .project-loc{transform:translateY(-4px)}
  .project-hover{position:absolute;top:1rem;right:1rem;z-index:3;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:#fff;opacity:0;transform:scale(0.7) rotate(-45deg);transition:all 0.3s cubic-bezier(.22,.68,0,1.3);border-radius:50%}
  .project-card:hover .project-hover{opacity:1;transform:scale(1) rotate(0)}

  /* CONTACT */
  .contact-grid{display:grid;grid-template-columns:1fr 1.5fr;gap:5rem}
  .contact-item{display:flex;gap:1.25rem;align-items:flex-start;padding-bottom:2rem;border-bottom:1px solid ${C.border};transition:transform 0.3s}
  .contact-item:hover{transform:translateX(5px)}
  .contact-item:last-of-type{border-bottom:none}
  .contact-icon{width:48px;height:48px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.2rem;border-radius:8px;transition:all 0.3s}
  .contact-label{font-size:0.75rem;color:${C.muted};text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px}
  .contact-value{font-family:'Barlow Condensed',sans-serif;font-size:1.05rem;font-weight:600;color:${C.text}}
  .contact-form{display:flex;flex-direction:column;gap:1.25rem}
  .form-row{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem}
  .form-group{display:flex;flex-direction:column;gap:6px}
  .form-label{font-size:0.75rem;color:${C.muted};text-transform:uppercase;letter-spacing:0.1em}
  .form-input,.form-select,.form-textarea{
    background:${C.card};border:1px solid ${C.border};color:${C.text};
    padding:12px 14px;font-family:'Barlow',sans-serif;font-size:0.9rem;
    outline:none;transition:border-color 0.25s,box-shadow 0.25s;width:100%;appearance:none;border-radius:4px;
  }
  .form-input:focus,.form-select:focus,.form-textarea:focus{border-color:#448aff;box-shadow:0 0 0 3px rgba(68,138,255,0.18)}
  .form-textarea{resize:vertical;min-height:120px}
  .form-select option{background:${C.card}}

  /* FOOTER */
  footer{background:${C.surface};border-top:1px solid ${C.border};padding:5rem 10% 2rem}
  .footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:3rem;margin-bottom:3rem}
  .footer-brand-desc{font-size:0.88rem;color:${C.muted};line-height:1.8;max-width:280px}
  .footer-col-title{font-family:'Barlow Condensed',sans-serif;font-size:0.8rem;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${C.text};margin-bottom:1.5rem}
  .footer-links{list-style:none;display:flex;flex-direction:column;gap:0.6rem}
  .footer-links li{font-size:0.88rem;color:${C.muted};cursor:pointer;transition:all 0.2s;padding-left:0}
  .footer-links li:hover{padding-left:6px}
  .footer-bottom{padding-top:2rem;border-top:1px solid ${C.border};display:flex;justify-content:space-between;align-items:center}
  .footer-copy{font-size:0.8rem;color:${C.muted}}
  .footer-social{width:36px;height:36px;border:1px solid ${C.border};border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:0.85rem;color:${C.muted};transition:all 0.25s}
  .footer-social:hover{transform:translateY(-3px) rotate(5deg);color:#fff}

  @media(max-width:1100px){.team-grid{grid-template-columns:repeat(3,1fr)}.footer-grid{grid-template-columns:1fr 1fr}}
  @media(max-width:900px){.hero{grid-template-columns:1fr}.hero-right{display:none}.about-grid{grid-template-columns:1fr}.about-img-stack{display:none}.services-grid{grid-template-columns:1fr 1fr}.contact-grid{grid-template-columns:1fr}.projects-grid{grid-template-columns:1fr 1fr}}
  @media(max-width:640px){.services-grid{grid-template-columns:1fr}.team-grid{grid-template-columns:1fr 1fr}.projects-grid{grid-template-columns:1fr}.nav-links{display:none}.page{padding:80px 6%}.form-row{grid-template-columns:1fr}.footer-grid{grid-template-columns:1fr}}
`;

// ─── DATA ─────────────────────────────────────────────────────────────────────
const TEAM = [
  { name:"Arjun Mehta", role:"Principal Civil Engineer", dept:"Civil", exp:"18 yrs", photo:"https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80", spec:"Structural Analysis & Design" },
  { name:"Priya Nair", role:"Senior Civil Engineer", dept:"Civil", exp:"12 yrs", photo:"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80", spec:"Foundation Engineering" },
  { name:"Rohit Sharma", role:"Civil Engineer", dept:"Civil", exp:"8 yrs", photo:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", spec:"Road & Highway Construction" },
  { name:"Sneha Reddy", role:"Civil Engineer", dept:"Civil", exp:"6 yrs", photo:"https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80", spec:"Concrete Structures" },
  { name:"Karthik Rao", role:"Civil Engineer", dept:"Civil", exp:"7 yrs", photo:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80", spec:"Geotechnical Engineering" },
  { name:"Deepa Krishnan", role:"Site Engineer", dept:"Site", exp:"9 yrs", photo:"https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=400&q=80", spec:"Construction Supervision" },
  { name:"Anil Kumar", role:"Site Engineer", dept:"Site", exp:"11 yrs", photo:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80", spec:"Project Execution" },
  { name:"Meena Pillai", role:"Site Engineer", dept:"Site", exp:"5 yrs", photo:"https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&q=80", spec:"Quality Control" },
  { name:"Vinod Patel", role:"Site Engineer", dept:"Site", exp:"10 yrs", photo:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80", spec:"Safety Management" },
  { name:"Lakshmi Iyer", role:"Site Engineer", dept:"Site", exp:"7 yrs", photo:"https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&q=80", spec:"MEP Coordination" },
  { name:"Suresh Babu", role:"Lead Surveyor", dept:"Survey", exp:"14 yrs", photo:"https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80", spec:"Land & Boundary Surveys" },
  { name:"Kavitha Menon", role:"Surveyor", dept:"Survey", exp:"8 yrs", photo:"https://images.unsplash.com/photo-1609010697446-11f2155278f0?w=400&q=80", spec:"Topographic Mapping" },
  { name:"Ravi Shankar", role:"Surveyor", dept:"Survey", exp:"6 yrs", photo:"https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&q=80", spec:"GPS & GIS Surveys" },
  { name:"Tara Singh", role:"Surveyor", dept:"Survey", exp:"5 yrs", photo:"https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=400&q=80", spec:"Construction Staking" },
  { name:"Ganesh Nair", role:"Surveyor", dept:"Survey", exp:"9 yrs", photo:"https://images.unsplash.com/photo-1553267751-1c148a7280a1?w=400&q=80", spec:"Volume & Cut/Fill Analysis" },
  { name:"Pooja Agarwal", role:"Chief Estimator", dept:"Estimate", exp:"13 yrs", photo:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80", spec:"Cost Planning & BOQ" },
  { name:"Manoj Verma", role:"Estimator", dept:"Estimate", exp:"8 yrs", photo:"https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&q=80", spec:"Quantity Surveying" },
  { name:"Anitha Rao", role:"Estimator", dept:"Estimate", exp:"7 yrs", photo:"https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&q=80", spec:"Tender Preparation" },
  { name:"Sanjay Gupta", role:"Estimator", dept:"Estimate", exp:"6 yrs", photo:"https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=400&q=80", spec:"Material Procurement" },
  { name:"Ramya Krishnan", role:"Estimator", dept:"Estimate", exp:"5 yrs", photo:"https://images.unsplash.com/photo-1601412436009-d964bd02edbc?w=400&q=80", spec:"Risk & Value Analysis" },
  { name:"Dr. Nandini Shetty", role:"Urban Planner", dept:"Urban", exp:"16 yrs", photo:"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80", spec:"Master Plans & Zoning" },
  { name:"Harish Kumar", role:"Urban Planner", dept:"Urban", exp:"10 yrs", photo:"https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=400&q=80", spec:"Transport Planning" },
  { name:"Swathi Balan", role:"Urban Planner", dept:"Urban", exp:"9 yrs", photo:"https://images.unsplash.com/photo-1560439513-74b037a25d84?w=400&q=80", spec:"Environmental Impact" },
  { name:"Nitesh Joshi", role:"Urban Planner", dept:"Urban", exp:"7 yrs", photo:"https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&q=80", spec:"Smart City Solutions" },
  { name:"Divya Narayanan", role:"Urban Planner", dept:"Urban", exp:"8 yrs", photo:"https://images.unsplash.com/photo-1511485977113-f34c92461ad9?w=400&q=80", spec:"Infrastructure Planning" },
];
const DEPT_LABELS = { Civil:"Civil Engineers", Site:"Site Engineers", Survey:"Surveyors", Estimate:"Estimators", Urban:"Urban Planners" };

const PROJECTS = [
  { name:"Yuva Heights Residential Tower", type:"Residential", loc:"Bengaluru, KA", img:"https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80", color:"#ff6b35" },
  { name:"Metro Commercial Hub", type:"Commercial", loc:"Hyderabad, TS", img:"https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=600&q=80", color:"#448aff" },
  { name:"NH-48 Highway Expansion", type:"Infrastructure", loc:"Chennai, TN", img:"https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&q=80", color:"#00e676" },
  { name:"Greenfield Urban Township", type:"Urban Dev", loc:"Pune, MH", img:"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80", color:"#e040fb" },
  { name:"Riverside Bridge Project", type:"Infrastructure", loc:"Kochi, KL", img:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", color:"#1de9b6" },
  { name:"Tech Park Phase II", type:"Commercial", loc:"Bengaluru, KA", img:"https://images.unsplash.com/photo-1429497419816-9ca5cfb4571a?w=600&q=80", color:"#ffd600" },
];

const SERVICES = [
  { icon:"🏗️", title:"Structural Engineering", desc:"Advanced structural design, analysis, and construction supervision for residential, commercial, and industrial buildings using modern methodologies." },
  { icon:"🏙️", title:"Urban Development", desc:"Comprehensive urban planning solutions including master plans, zoning regulations, and sustainable city infrastructure development." },
  { icon:"📐", title:"Land Surveying", desc:"Precision topographic, boundary, and construction surveys using GPS, total stations, and drone technology for accurate data." },
  { icon:"💰", title:"Cost Estimation", desc:"Detailed quantity surveying, BOQ preparation, and cost planning services ensuring budget accuracy from design to completion." },
  { icon:"🛣️", title:"Infrastructure Projects", desc:"Roads, highways, bridges, drainage systems, and public utilities engineered to national standards for lasting performance." },
  { icon:"🌿", title:"Green Construction", desc:"Sustainable construction practices, LEED-compliant designs, and eco-friendly material specifications for a better future." },
];

const SKILLS = [
  { label:"Structural Design", pct:94, color:"#ff6b35" },
  { label:"Project Management", pct:88, color:"#00d4ff" },
  { label:"Cost Estimation", pct:92, color:"#e040fb" },
  { label:"Urban Planning", pct:85, color:"#00e676" },
  { label:"Site Execution", pct:90, color:"#ffd600" },
  { label:"Surveying & GIS", pct:87, color:"#448aff" },
];

const CONTACT_ITEMS = [
  { icon:"📍", label:"Head Office", value:"No. 12, Residency Road, Bengaluru, KA – 560025", color:"#ff6b35" },
  { icon:"📞", label:"Phone", value:"+91 80 4567 8900", color:"#00d4ff" },
  { icon:"✉️", label:"Email", value:"info@yuvaconstruction.in", color:"#e040fb" },
  { icon:"🕐", label:"Working Hours", value:"Mon – Sat: 9:00 AM – 6:00 PM", color:"#00e676" },
];

// ─── PAGE COMPONENTS ──────────────────────────────────────────────────────────
function HeroPage({ onNav }) {
  return (
    <section className="hero">
      <div className="hero-bg" />
      <Particles />
      <div className="hero-left">
        <div className="hero-tag" style={{ color:"#ff6b35" }}>Est. 2005 · Bengaluru, India</div>
        <h1 className="hero-h1">
          <TypeWriter words={["Building","Designing","Shaping","Engineering"]} /><br />
          <span style={{ background:"linear-gradient(90deg,#fff,#c0c0ff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Tomorrow's</span><br />
          <span style={{ background:"linear-gradient(90deg,#00d4ff,#1de9b6)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>India</span>
        </h1>
        <p className="hero-desc">
          Yuva Construction is a premier engineering firm delivering innovative structural,
          infrastructure, and urban development solutions across South India and beyond.
        </p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={() => onNav("Projects")}>View Our Projects</button>
          <button className="btn-outline" onClick={() => onNav("Contact")}>Get In Touch</button>
        </div>
        <div className="hero-stats">
          {[["18+","Years Experience",STAT_COLORS[0]],["340+","Projects Done",STAT_COLORS[1]],["50+","Expert Team",STAT_COLORS[2]],["12","States Covered",STAT_COLORS[3]]].map(([n,l,col]) => (
            <div key={l}>
              <div className="hero-stat-num"><AnimCounter target={n} color={col} /></div>
              <div className="hero-stat-label">{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="hero-right">
        <div className="hero-img-grid">
          {[
            "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&q=80",
            "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&q=80",
            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&q=80",
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&q=80",
          ].map((src,i) => (
            <div key={i} className="hero-img-cell" style={{ backgroundImage:`url(${src})` }} />
          ))}
        </div>
        <div className="hero-overlay" />
        <div className="hero-badge">
          <div style={{ fontSize:"2rem" }}>🏆</div>
          <div>
            <div className="badge-text-top">Award Winning</div>
            <div className="badge-text-bot">Best Construction Firm 2023</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutPage() {
  const FEATS = [
    { icon:"🎯", title:"Mission-Driven Approach", desc:"Every project is executed with clear goals, defined milestones, and unwavering commitment to quality standards.", color:"#ff6b35" },
    { icon:"🔬", title:"Technology-Forward", desc:"We leverage BIM, drone surveys, GPS technology, and modern construction management software.", color:"#00d4ff" },
    { icon:"🤝", title:"Client-Centric Culture", desc:"Transparent communication, on-time delivery, and post-project support define every client relationship.", color:"#e040fb" },
  ];
  return (
    <section className="page page-enter" style={{ background:`linear-gradient(160deg,${C.bg} 60%,rgba(68,138,255,0.05) 100%)` }}>
      <div className="about-grid">
        <Reveal dir="left">
          <div className="about-img-stack">
            <div className="about-img-main" style={{ backgroundImage:"url(https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=700&q=80)" }} />
            <div className="about-img-accent" style={{ backgroundImage:"url(https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&q=80)" }} />
            <div className="about-year-badge">
              <div className="yr">18+</div>
              <div className="yr-label">Years of<br />Excellence</div>
            </div>
          </div>
        </Reveal>
        <div>
          <Reveal delay={0.1}>
            <div className="section-tag" style={{ color:"#00d4ff" }}>
              <span style={{ display:"inline-block", width:40, height:2, background:"linear-gradient(90deg,#00d4ff,#e040fb)", borderRadius:1 }} />
              Who We Are
            </div>
            <h2 className="section-title">Engineering <span style={{ background:"linear-gradient(90deg,#00d4ff,#e040fb)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", fontStyle:"italic" }}>Excellence</span> Since 2005</h2>
            <div className="grad-divider" style={{ background:"linear-gradient(90deg,#ff6b35,#e040fb,#00d4ff)" }} />
            <p className="section-desc">Founded in 2005 in Bengaluru, Yuva Construction has grown into one of South India's most respected construction and engineering firms.</p>
          </Reveal>
          <Reveal delay={0.2} style={{ marginTop:"2rem" }}>
            {SKILLS.map((s,i) => <SkillBar key={s.label} label={s.label} pct={s.pct} color={s.color} delay={i*0.1} />)}
          </Reveal>
          <Reveal delay={0.35}>
            {FEATS.map(f => (
              <div key={f.title} className="about-feat" style={{ borderLeftColor:f.color }}>
                <div className="about-feat-icon">{f.icon}</div>
                <div>
                  <div className="about-feat-title" style={{ color:f.color }}>{f.title}</div>
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

function ServicesPage() {
  return (
    <section className="page page-enter" style={{ background:`linear-gradient(160deg,#0d0d1a 0%,#0d1020 100%)` }}>
      <Reveal>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:"4rem", flexWrap:"wrap", gap:"2rem" }}>
          <div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"0.78rem", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:"#e040fb", display:"flex", alignItems:"center", gap:12, marginBottom:"1rem" }}>
              <span style={{ display:"inline-block", width:40, height:2, background:"linear-gradient(90deg,#e040fb,#448aff)", borderRadius:1 }} />
              What We Do
            </div>
            <h2 className="section-title">Our <span style={{ background:"linear-gradient(90deg,#e040fb,#448aff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", fontStyle:"italic" }}>Services</span></h2>
          </div>
          <p style={{ maxWidth:360, fontSize:"0.9rem", color:C.muted, lineHeight:1.8 }}>From conception to completion, a full suite of construction and engineering services.</p>
        </div>
      </Reveal>
      <div className="services-grid">
        {SERVICES.map((s,i) => (
          <Reveal key={s.title} delay={i*0.08}>
            <div className="service-card" style={{ background:`linear-gradient(135deg,${SVC_COLORS[i].from}22,${SVC_COLORS[i].to}11)`, border:`1px solid ${SVC_COLORS[i].from}33`, height:"100%" }}>
              <div className="service-num" style={{ color:SVC_COLORS[i].from }}>0{i+1}</div>
              <div className="service-icon">{s.icon}</div>
              <div className="service-title">{s.title}</div>
              <div className="service-desc">{s.desc}</div>
              <div className="service-arrow" style={{ color:SVC_COLORS[i].from }}>→</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function TeamPage() {
  const [activeDept, setActiveDept] = useState("All");
  const [key, setKey] = useState(0);
  const depts = ["All","Civil","Site","Survey","Estimate","Urban"];
  const filtered = activeDept === "All" ? TEAM : TEAM.filter(m => m.dept === activeDept);
  const FILTER_COLS = ["#fff","#ff6b35","#448aff","#00e676","#ffd600","#e040fb"];
  const handleFilter = d => { setActiveDept(d); setKey(k=>k+1); };

  return (
    <section className="page page-enter" style={{ background:`linear-gradient(160deg,${C.bg} 0%,rgba(228,64,251,0.04) 100%)` }}>
      <Reveal>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:"2rem", marginBottom:"3rem" }}>
          <div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"0.78rem", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:"#1de9b6", display:"flex", alignItems:"center", gap:12, marginBottom:"1rem" }}>
              <span style={{ display:"inline-block", width:40, height:2, background:"linear-gradient(90deg,#1de9b6,#00d4ff)", borderRadius:1 }} />
              Our Experts
            </div>
            <h2 className="section-title">Meet the <span style={{ background:"linear-gradient(90deg,#1de9b6,#00d4ff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", fontStyle:"italic" }}>Team</span></h2>
          </div>
          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
            {depts.map((d,i) => (
              <button key={d} className={`filter-btn ${activeDept===d?"active":""}`}
                style={activeDept===d ? { background:`linear-gradient(135deg,${FILTER_COLS[i]}cc,${FILTER_COLS[i]}88)`, borderColor:"transparent", color:"#fff", boxShadow:`0 4px 16px ${FILTER_COLS[i]}44` } : {}}
                onClick={() => handleFilter(d)}>
                {d==="All"?"All":(DEPT_LABELS[d]||d)}
              </button>
            ))}
          </div>
        </div>
      </Reveal>
      <div className="team-grid" key={key}>
        {filtered.map((m,i) => {
          const dc = DEPT_COLORS[m.dept];
          return (
            <Reveal key={m.name} delay={i*0.04} dir="up">
              <div className="team-card" style={{ borderColor:`${dc.bg}33` }}>
                <div className="team-photo">
                  <div className="team-photo-bg" style={{ backgroundImage:`url(${m.photo})` }} />
                  <div style={{ position:"absolute", top:0, right:0, background:dc.bg, color:dc.text, fontFamily:"'Barlow Condensed',sans-serif", fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", padding:"5px 12px", borderBottomLeftRadius:6 }}>{m.dept}</div>
                  <div className="team-photo-overlay" />
                </div>
                <div className="team-info">
                  <div className="team-name">{m.name}</div>
                  <div style={{ fontSize:"0.78rem", fontWeight:600, color:dc.bg, marginBottom:6 }}>{m.role}</div>
                  <div className="team-exp">📌 {m.spec}</div>
                  <div className="team-exp" style={{ marginTop:3 }}>⏱ {m.exp} exp.</div>
                  <div className="team-socials">
                    {[["in","#0077b5"],["tw","#1da1f2"],["📧","#ea4335"]].map(([s,col]) => (
                      <div key={s} className="team-social"
                        onMouseEnter={e=>{e.currentTarget.style.background=col;e.currentTarget.style.color="#fff";}}
                        onMouseLeave={e=>{e.currentTarget.style.background=C.border;e.currentTarget.style.color=C.muted;}}
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

const PROJ_COLORS = ["#ff6b35","#448aff","#00e676","#e040fb","#1de9b6","#ffd600"];
function ProjectsPage() {
  const [active, setActive] = useState("All");
  const [key, setKey] = useState(0);
  const types = ["All","Residential","Commercial","Infrastructure","Urban Dev"];
  const TYPE_COLS = { All:"#fff", Residential:"#ff6b35", Commercial:"#448aff", Infrastructure:"#00e676", "Urban Dev":"#e040fb" };
  const filtered = active==="All" ? PROJECTS : PROJECTS.filter(p=>p.type===active);
  const handleFilter = t => { setActive(t); setKey(k=>k+1); };

  return (
    <section className="page page-enter" style={{ background:`linear-gradient(160deg,#0d0d1a 0%,rgba(0,230,118,0.04) 100%)` }}>
      <Reveal>
        <div style={{ marginBottom:"4rem" }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"0.78rem", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:"#ffd600", display:"flex", alignItems:"center", gap:12, marginBottom:"1rem" }}>
            <span style={{ display:"inline-block", width:40, height:2, background:"linear-gradient(90deg,#ffd600,#ff6b35)", borderRadius:1 }} />
            Portfolio
          </div>
          <h2 className="section-title">Featured <span style={{ background:"linear-gradient(90deg,#ffd600,#ff6b35)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", fontStyle:"italic" }}>Projects</span></h2>
          <p className="section-desc">A showcase of landmark projects across residential, commercial, and infrastructure sectors.</p>
        </div>
      </Reveal>
      <div style={{ display:"flex", gap:"1rem", marginBottom:"3rem", flexWrap:"wrap" }}>
        {types.map(t => (
          <button key={t} className={`filter-btn ${active===t?"active":""}`}
            style={active===t ? { background:`linear-gradient(135deg,${TYPE_COLS[t]}cc,${TYPE_COLS[t]}66)`, borderColor:"transparent", color:"#fff", boxShadow:`0 4px 16px ${TYPE_COLS[t]}44` } : {}}
            onClick={() => handleFilter(t)}>{t}
          </button>
        ))}
      </div>
      <div className="projects-grid" key={key}>
        {filtered.map((p,i) => (
          <Reveal key={p.name} delay={i*0.08} dir="scale">
            <div className="project-card">
              <div className="project-bg" style={{ backgroundImage:`url(${p.img})` }} />
              <div className="project-overlay">
                <div className="project-type" style={{ color:p.color }}>{p.type}</div>
                <div className="project-name">{p.name}</div>
                <div className="project-loc">📍 {p.loc}</div>
              </div>
              <div className="project-hover" style={{ background:p.color }}>↗</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ContactPage() {
  const [form, setForm] = useState({ name:"", email:"", phone:"", service:"", message:"" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const handleSend = () => {
    if (!form.name||!form.email) return;
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); }, 1600);
  };

  return (
    <section className="page page-enter" style={{ background:`linear-gradient(160deg,${C.bg} 0%,rgba(68,138,255,0.06) 100%)` }}>
      <Reveal>
        <div style={{ marginBottom:"4rem" }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"0.78rem", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:"#448aff", display:"flex", alignItems:"center", gap:12, marginBottom:"1rem" }}>
            <span style={{ display:"inline-block", width:40, height:2, background:"linear-gradient(90deg,#448aff,#00d4ff)", borderRadius:1 }} />
            Get In Touch
          </div>
          <h2 className="section-title">Let's Build <span style={{ background:"linear-gradient(90deg,#448aff,#00d4ff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", fontStyle:"italic" }}>Together</span></h2>
          <p className="section-desc">Ready to start your next project? Reach out for a free consultation and detailed estimate.</p>
        </div>
      </Reveal>
      <div className="contact-grid">
        <Reveal dir="left" delay={0.1}>
          <div style={{ display:"flex", flexDirection:"column", gap:"2rem" }}>
            {CONTACT_ITEMS.map(c => (
              <div key={c.label} className="contact-item">
                <div className="contact-icon" style={{ background:`${c.color}22`, color:c.color, border:`1px solid ${c.color}44` }}>{c.icon}</div>
                <div>
                  <div className="contact-label">{c.label}</div>
                  <div className="contact-value">{c.value}</div>
                </div>
              </div>
            ))}
            <div>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"0.8rem", color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"1rem" }}>Follow Us</div>
              <div style={{ display:"flex", gap:"10px" }}>
                {[["LinkedIn","#0077b5"],["Twitter","#1da1f2"],["Instagram","#e040fb"],["YouTube","#ff5252"]].map(([s,col]) => (
                  <div key={s} style={{ padding:"8px 14px", border:`1px solid ${col}44`, fontSize:"0.78rem", color:col, cursor:"pointer", transition:"all 0.2s", borderRadius:4, background:`${col}11` }}
                    onMouseEnter={e=>{e.currentTarget.style.background=col;e.currentTarget.style.color="#fff"}}
                    onMouseLeave={e=>{e.currentTarget.style.background=`${col}11`;e.currentTarget.style.color=col}}
                  >{s}</div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal dir="right" delay={0.2}>
          {sent ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"1rem", padding:"4rem", background:C.card, border:"1px solid rgba(0,230,118,0.4)", textAlign:"center", borderRadius:8, animation:"zoomIn 0.5s ease both", boxShadow:"0 0 40px rgba(0,230,118,0.1)" }}>
              <div style={{ fontSize:"3.5rem", animation:"floatY 2s ease-in-out infinite" }}>✅</div>
              <div style={{ fontFamily:"'Playfair Display'", fontSize:"1.8rem", background:"linear-gradient(90deg,#00e676,#1de9b6)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Message Sent!</div>
              <div style={{ color:C.muted, fontSize:"0.9rem", lineHeight:1.7 }}>Thank you! Our team will get back to you within 24 hours.</div>
              <button className="btn-primary" onClick={() => setSent(false)} style={{ marginTop:"1rem" }}>Send Another</button>
            </div>
          ) : (
            <div className="contact-form">
              <div className="form-row">
                <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" placeholder="Rajesh Kumar" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" placeholder="rajesh@email.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Phone Number</label><input className="form-input" placeholder="+91 98765 43210" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></div>
                <div className="form-group">
                  <label className="form-label">Service Required</label>
                  <select className="form-select" value={form.service} onChange={e=>setForm({...form,service:e.target.value})}>
                    <option value="">Select a Service</option>
                    {SERVICES.map(s=><option key={s.title} value={s.title}>{s.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group"><label className="form-label">Project Details</label><textarea className="form-textarea" placeholder="Describe your project requirements..." value={form.message} onChange={e=>setForm({...form,message:e.target.value})} /></div>
              <button className="btn-primary" style={{ alignSelf:"flex-start", padding:"15px 40px", opacity:sending?0.7:1 }} onClick={handleSend} disabled={sending}>
                {sending ? (
                  <span style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                    <span style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spinSlow 0.7s linear infinite", display:"inline-block" }} />
                    Sending...
                  </span>
                ) : "Send Message →"}
              </button>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
const PAGES = ["Home","About","Services","Team","Projects","Contact"];

export default function YuvaConstruction() {
  const [activePage, setActivePage] = useState("Home");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleNav = page => { setActivePage(page); window.scrollTo({ top:0, behavior:"smooth" }); };

  const FOOTER_LINK_COLS = ["#ff6b35","#00d4ff","#e040fb","#00e676"];
  const SOCIAL_COLS = ["#0077b5","#1da1f2","#e040fb","#ff5252"];

  return (
    <>
      <style>{styles}</style>
      <div>
        <nav className={scrolled?"scrolled":""}>
          <div className="nav-logo" onClick={() => handleNav("Home")}>
            <div className="nav-logo-icon"><span>YC</span></div>
            Yuva Construction
          </div>
          <ul className="nav-links">
            {PAGES.map(p => (
              <li key={p} className={activePage===p?"active":""} onClick={() => handleNav(p)}>{p}</li>
            ))}
          </ul>
        </nav>

        <div style={{ paddingTop:activePage==="Home"?0:72 }}>
          {activePage==="Home" && (
            <>
              <HeroPage onNav={handleNav} />
              <Marquee />
              <div className="full-divider" />
              <AboutPage />
              <div className="full-divider" />
              <ServicesPage />
            </>
          )}
          {activePage==="About" && <AboutPage />}
          {activePage==="Services" && <ServicesPage />}
          {activePage==="Team" && <TeamPage />}
          {activePage==="Projects" && <ProjectsPage />}
          {activePage==="Contact" && <ContactPage />}
        </div>

        <footer>
          <Reveal>
            <div className="footer-grid">
              <div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.6rem", fontWeight:700, background:"linear-gradient(90deg,#ff6b35,#e040fb,#00d4ff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", marginBottom:"1rem", backgroundSize:"200%", animation:"gradShift 4s ease infinite" }}>
                  Yuva Construction
                </div>
                <p className="footer-brand-desc">Delivering engineering excellence across South India since 2005. Building structures that endure, and communities that thrive.</p>
              </div>
              {[
                { title:"Company", links:["About Us","Our Team","Projects","Services","Careers"], col:FOOTER_LINK_COLS[0] },
                { title:"Services", links:SERVICES.map(s=>s.title), col:FOOTER_LINK_COLS[1] },
                { title:"Contact", links:["Residency Road, Bengaluru","+91 80 4567 8900","info@yuvaconstruction.in","Mon–Sat: 9AM – 6PM"], col:FOOTER_LINK_COLS[2] },
              ].map(({ title, links, col }) => (
                <div key={title}>
                  <div className="footer-col-title" style={{ color:col }}>{title}</div>
                  <ul className="footer-links">
                    {links.map(l => <li key={l} style={{}} onMouseEnter={e=>e.currentTarget.style.color=col} onMouseLeave={e=>e.currentTarget.style.color=C.muted}>{l}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <div className="footer-bottom">
              <div className="footer-copy">© 2024 Yuva Construction Pvt. Ltd. All rights reserved.</div>
              <div style={{ display:"flex", gap:"12px" }}>
                {[["in",SOCIAL_COLS[0]],["tw",SOCIAL_COLS[1]],["ig",SOCIAL_COLS[2]],["yt",SOCIAL_COLS[3]]].map(([s,col]) => (
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
