import { useState, useRef, useCallback, useEffect } from 'react'
import { supabase } from './supabase.js'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=Inter:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #faf8f4; --bg2: #f5f1ea; --surface: #ffffff; --surface2: #f9f6f0;
    --border: #e8e0d0; --border2: #d4c9b0; --text: #1c1a16; --muted: #8a7f6e;
    --accent: #8b6914; --accent2: #6b5010; --alight: rgba(139,105,20,0.08);
    --green: #2d6a4f; --amber: #b45309; --red: #9b1c1c;
    --font: 'Inter', sans-serif; --display: 'Playfair Display', serif;
    --mono: 'DM Mono', monospace; --r: 16px;
    --shadow: 0 4px 24px rgba(139,105,20,0.08);
    --shadowlg: 0 16px 48px rgba(139,105,20,0.14);
  }
  body { background:var(--bg); color:var(--text); font-family:var(--font); min-height:100vh; line-height:1.5; cursor:default; }
  .app { min-height:100vh; display:flex; flex-direction:column; }
  p,h1,h2,h3,h4,span,div,li,label { cursor:default; }
  input,textarea { cursor:text; }
  button,.tab,.faq,.cl-head,.hbadge,.fitem,.qq,.sug-item { cursor:pointer; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }
  @keyframes rot { to{transform:rotate(360deg)} }
  @keyframes scaleIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }

  nav { display:flex; align-items:center; justify-content:space-between; padding:18px 48px; border-bottom:1px solid var(--border); background:rgba(250,248,244,0.94); backdrop-filter:blur(20px); position:sticky; top:0; z-index:200; }
  .logo { display:flex; align-items:center; gap:10px; font-family:var(--display); font-size:1.2rem; font-weight:700; color:var(--text); text-decoration:none; cursor:default; }
  .logo-mark { width:34px; height:34px; background:linear-gradient(135deg,#8b6914,#c49a1a); border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:17px; }
  .logo span { color:var(--accent); }
  .nav-r { display:flex; align-items:center; gap:10px; }
  .nb { padding:9px 20px; border-radius:10px; font-family:var(--font); font-size:0.82rem; font-weight:600; cursor:pointer; transition:all .2s; border:1.5px solid transparent; }
  .nb-ghost { background:none; border-color:var(--border2); color:var(--muted); }
  .nb-ghost:hover { border-color:var(--accent); color:var(--accent); background:var(--alight); }
  .nb-solid { background:var(--text); border-color:var(--text); color:#fff; }
  .nb-solid:hover { background:var(--accent2); border-color:var(--accent2); transform:translateY(-1px); }
  .upill { display:flex; align-items:center; gap:9px; }
  .uavatar { width:33px; height:33px; border-radius:50%; background:linear-gradient(135deg,var(--accent),#c49a1a); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.82rem; cursor:default; }
  .ucredit { font-size:0.74rem; background:var(--alight); color:var(--accent); border:1px solid rgba(139,105,20,0.25); border-radius:20px; padding:3px 12px; font-weight:700; cursor:default; }
  .nav-btn-sm { background:none; border:1.5px solid var(--border2); border-radius:8px; padding:6px 14px; color:var(--muted); font-family:var(--font); font-size:0.78rem; font-weight:600; cursor:pointer; transition:all .2s; }
  .nav-btn-sm:hover { border-color:var(--accent); color:var(--accent); }
  .nav-btn-danger { border-color:rgba(155,28,28,0.25); color:var(--red); }
  .nav-btn-danger:hover { background:rgba(155,28,28,0.06); border-color:var(--red); }

  .hero { position:relative; overflow:hidden; padding:110px 48px 90px; text-align:center; animation:fadeUp .7s ease; }
  .hero-bg { position:absolute; inset:0; background:radial-gradient(ellipse 80% 55% at 50% 0%,rgba(139,105,20,0.08) 0%,transparent 65%); pointer-events:none; }
  .hero-dots { position:absolute; inset:0; background-image:radial-gradient(circle,rgba(139,105,20,0.07) 1px,transparent 1px); background-size:30px 30px; pointer-events:none; }
  .hero-inner { position:relative; z-index:1; max-width:700px; margin:0 auto; }
  .eyebrow { display:inline-flex; align-items:center; gap:7px; font-size:0.7rem; font-weight:700; letter-spacing:0.13em; text-transform:uppercase; color:var(--accent); background:var(--alight); border:1px solid rgba(139,105,20,0.2); border-radius:20px; padding:5px 15px; margin-bottom:22px; }
  .hero h1 { font-family:var(--display); font-size:clamp(2.5rem,5.5vw,4rem); font-weight:800; letter-spacing:-0.03em; line-height:1.07; margin-bottom:20px; }
  .hero h1 em { font-style:italic; color:var(--accent); }
  .hero p { font-size:1rem; color:var(--muted); max-width:500px; margin:0 auto 36px; line-height:1.75; }
  .hero-btns { display:flex; gap:13px; justify-content:center; flex-wrap:wrap; }
  .btn-main { padding:13px 30px; background:var(--text); color:#fff; border:none; border-radius:11px; font-family:var(--font); font-size:0.92rem; font-weight:700; cursor:pointer; transition:all .25s; }
  .btn-main:hover { background:var(--accent2); transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.18); }
  .btn-out { padding:13px 30px; background:none; color:var(--text); border:1.5px solid var(--border2); border-radius:11px; font-family:var(--font); font-size:0.92rem; font-weight:600; cursor:pointer; transition:all .25s; }
  .btn-out:hover { border-color:var(--accent); color:var(--accent); background:var(--alight); }
  .price-hint { font-size:0.76rem; color:var(--muted); margin-top:14px; }
  .price-hint strong { color:var(--accent); }
  .hero-badges { display:flex; justify-content:center; gap:10px; flex-wrap:wrap; margin-top:44px; }
  .hbadge { display:flex; align-items:center; gap:7px; background:var(--surface); border:1px solid var(--border); border-radius:11px; padding:9px 15px; font-size:0.78rem; font-weight:600; color:var(--muted); transition:all .25s; cursor:default; }
  .hbadge:nth-child(1){animation:float 3.5s ease-in-out infinite;}
  .hbadge:nth-child(2){animation:float 3.5s ease-in-out .5s infinite;}
  .hbadge:nth-child(3){animation:float 3.5s ease-in-out 1s infinite;}
  .hbadge:nth-child(4){animation:float 3.5s ease-in-out 1.5s infinite;}

  .fstrip { display:flex; border-top:1px solid var(--border); border-bottom:1px solid var(--border); background:var(--surface); overflow-x:auto; }
  .fitem { flex:1; min-width:130px; padding:22px 16px; text-align:center; border-right:1px solid var(--border); transition:background .2s; cursor:default; }
  .fitem:last-child { border-right:none; }
  .fitem:hover { background:var(--bg2); }
  .fico { font-size:1.5rem; margin-bottom:8px; }
  .ftitle { font-size:0.8rem; font-weight:700; margin-bottom:3px; }
  .fsub { font-size:0.7rem; color:var(--muted); line-height:1.4; }

  .faq-wrap { max-width:740px; margin:0 auto; padding:80px 20px; width:100%; animation:fadeUp .7s ease; }
  .faq-title { font-family:var(--display); font-size:2rem; font-weight:700; text-align:center; margin-bottom:10px; }
  .faq-sub { text-align:center; color:var(--muted); font-size:0.88rem; margin-bottom:44px; }
  .faq-list { display:flex; flex-direction:column; gap:11px; }
  .faq { background:var(--surface); border:1px solid var(--border); border-radius:13px; overflow:hidden; transition:all .25s; cursor:pointer; }
  .faq:hover { border-color:var(--border2); box-shadow:var(--shadow); }
  .faq.open { border-color:rgba(139,105,20,0.3); }
  .faq-q { display:flex; align-items:center; justify-content:space-between; padding:17px 22px; font-weight:600; font-size:0.9rem; gap:14px; }
  .faq-arrow { color:var(--muted); font-size:0.78rem; transition:transform .3s; flex-shrink:0; }
  .faq.open .faq-arrow { transform:rotate(180deg); color:var(--accent); }
  .faq-a { padding:0 22px 17px; font-size:0.85rem; color:var(--muted); line-height:1.75; border-top:1px solid var(--border); padding-top:15px; animation:fadeIn .3s ease; }

  .overlay { position:fixed; inset:0; background:rgba(28,26,22,0.5); z-index:300; display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn .2s; backdrop-filter:blur(4px); }
  .modal { background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:42px; width:100%; max-width:420px; box-shadow:var(--shadowlg); animation:scaleIn .3s ease; position:relative; }
  .modal h2 { font-family:var(--display); font-size:1.65rem; font-weight:700; margin-bottom:6px; }
  .modal-sub { color:var(--muted); font-size:0.83rem; margin-bottom:26px; }
  .field { margin-bottom:15px; }
  .field label { display:block; font-size:0.76rem; font-weight:700; margin-bottom:6px; color:var(--muted); text-transform:uppercase; letter-spacing:0.06em; cursor:default; }
  .field input { width:100%; padding:12px 14px; border:1.5px solid var(--border); border-radius:10px; font-family:var(--font); font-size:0.87rem; background:var(--bg); color:var(--text); outline:none; transition:all .2s; cursor:text; }
  .field input:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(139,105,20,0.1); }
  .modal-cta { width:100%; padding:13px; background:var(--text); color:#fff; border:none; border-radius:11px; font-family:var(--font); font-size:0.92rem; font-weight:700; cursor:pointer; margin-top:7px; transition:all .25s; }
  .modal-cta:hover { background:var(--accent2); }
  .modal-cta:disabled { opacity:.5; cursor:not-allowed; }
  .modal-sw { text-align:center; margin-top:17px; font-size:0.81rem; color:var(--muted); }
  .modal-sw button { background:none; border:none; color:var(--accent); font-weight:700; cursor:pointer; font-family:var(--font); font-size:0.81rem; }
  .modal-x { position:absolute; top:17px; right:19px; background:none; border:none; color:var(--muted); font-size:1.3rem; cursor:pointer; transition:color .2s; }
  .modal-x:hover { color:var(--red); }
  .settings-row { display:flex; align-items:center; gap:10px; width:100%; padding:13px 16px; background:var(--bg2); border:1px solid var(--border); border-radius:11px; margin-bottom:10px; cursor:pointer; font-family:var(--font); font-size:0.87rem; color:var(--text); font-weight:500; transition:all .2s; text-align:left; }
  .settings-row:hover { border-color:var(--accent); background:var(--alight); }
  .settings-row.danger { color:var(--red); border-color:rgba(155,28,28,0.2); }
  .settings-row.danger:hover { background:rgba(155,28,28,0.05); border-color:var(--red); }
  .settings-arrow { margin-left:auto; color:var(--muted); font-size:0.8rem; }
  .back-link { background:none; border:none; color:var(--muted); font-family:var(--font); font-size:0.82rem; cursor:pointer; margin-bottom:18px; display:flex; align-items:center; gap:5px; padding:0; transition:color .2s; }
  .back-link:hover { color:var(--accent); }
  .success-msg { font-size:0.8rem; color:var(--green); margin-bottom:10px; padding:9px 13px; background:rgba(45,106,79,0.08); border:1px solid rgba(45,106,79,0.2); border-radius:8px; }
  .error-msg { font-size:0.8rem; color:var(--red); margin-bottom:10px; padding:9px 13px; background:rgba(155,28,28,0.06); border:1px solid rgba(155,28,28,0.2); border-radius:8px; }

  .main { max-width:900px; margin:0 auto; padding:50px 20px 80px; width:100%; }
  .pg-title { font-family:var(--display); font-size:1.75rem; font-weight:700; margin-bottom:5px; animation:fadeUp .6s ease; }
  .pg-sub { color:var(--muted); font-size:0.86rem; margin-bottom:28px; animation:fadeUp .6s ease .1s both; }

  .back-btn { display:inline-flex; align-items:center; gap:7px; background:none; border:1.5px solid var(--border2); border-radius:10px; padding:9px 18px; color:var(--muted); font-family:var(--font); font-size:0.82rem; font-weight:600; cursor:pointer; margin-bottom:22px; transition:all .2s; }
  .back-btn:hover { border-color:var(--accent); color:var(--accent); background:var(--alight); }

  .card { background:var(--surface); border:1px solid var(--border); border-radius:var(--r); overflow:hidden; box-shadow:var(--shadow); animation:fadeUp .6s ease .15s both; }
  .tabs { display:flex; border-bottom:1px solid var(--border); }
  .tab { flex:1; padding:14px; font-size:0.83rem; font-weight:600; cursor:pointer; background:none; border:none; color:var(--muted); font-family:var(--font); transition:all .2s; border-bottom:2px solid transparent; margin-bottom:-1px; }
  .tab.on { color:var(--accent); border-bottom-color:var(--accent); background:var(--alight); }
  .tab:hover:not(.on) { color:var(--text); background:var(--bg2); }
  .cbody { padding:26px; }

  .dz { border:2px dashed var(--border2); border-radius:13px; padding:50px 24px; text-align:center; cursor:pointer; transition:all .25s; }
  .dz:hover,.dz.over { border-color:var(--accent); background:var(--alight); }
  .dz-ico { font-size:2.5rem; margin-bottom:11px; animation:float 3s ease-in-out infinite; }
  .dz-t { font-weight:700; margin-bottom:5px; }
  .dz-s { font-size:0.79rem; color:var(--muted); }
  .fchip { display:inline-flex; align-items:center; gap:8px; margin-top:13px; background:rgba(45,106,79,0.1); border:1px solid rgba(45,106,79,0.3); color:var(--green); border-radius:9px; padding:6px 15px; font-size:0.79rem; font-family:var(--mono); }

  textarea.ct { width:100%; min-height:205px; background:var(--bg); border:1.5px solid var(--border); border-radius:11px; color:var(--text); font-family:var(--mono); font-size:0.8rem; padding:15px; resize:vertical; outline:none; line-height:1.65; transition:all .2s; cursor:text; }
  textarea.ct:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(139,105,20,0.08); }
  textarea.ct::placeholder { color:var(--muted); }

  .pay-row { margin-top:22px; padding-top:20px; border-top:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:15px; }
  .pay-lbl { font-size:0.81rem; color:var(--muted); margin-bottom:4px; }
  .pay-price { font-family:var(--display); font-size:1.65rem; font-weight:700; color:var(--accent); letter-spacing:-0.02em; }
  .pay-price span { font-family:var(--font); font-size:0.73rem; color:var(--muted); font-weight:400; }
  .pp-btn { padding:12px 28px; background:#FFD140; color:#1a1814; border:none; border-radius:11px; font-family:var(--font); font-size:0.9rem; font-weight:800; cursor:pointer; transition:all .25s; display:flex; align-items:center; gap:8px; }
  .pp-btn:hover:not(:disabled) { background:#f0c420; transform:translateY(-2px); box-shadow:0 6px 20px rgba(255,209,64,0.35); }
  .pp-btn:disabled { opacity:.5; cursor:not-allowed; }
  .paid-btn { padding:12px 28px; background:var(--text); color:#fff; border:none; border-radius:11px; font-family:var(--font); font-size:0.9rem; font-weight:700; cursor:pointer; transition:all .25s; }
  .paid-btn:hover { background:var(--accent2); transform:translateY(-2px); }
  .pay-note { font-size:0.72rem; color:var(--muted); margin-top:7px; }

  .spin { width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:rot .7s linear infinite; display:inline-block; flex-shrink:0; }
  .spin-a { border-color:rgba(139,105,20,0.2); border-top-color:var(--accent); }

  .loading-card { padding:34px 26px; }
  .lc-head { text-align:center; margin-bottom:24px; }
  .lc-title { font-family:var(--display); font-size:1.1rem; font-weight:700; }
  .lc-sub { font-size:0.79rem; color:var(--muted); margin-top:5px; }
  .steps { display:flex; flex-direction:column; gap:10px; }
  .step { display:flex; align-items:center; gap:12px; padding:13px 16px; border-radius:12px; background:var(--bg2); border:1px solid var(--border); transition:all .3s; }
  .step.done { border-color:rgba(45,106,79,0.3); background:rgba(45,106,79,0.05); }
  .step.active { border-color:rgba(139,105,20,0.4); background:rgba(139,105,20,0.06); animation:pulse 1.5s ease-in-out infinite; }
  .step-ico { width:33px; height:33px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:15px; flex-shrink:0; border:1px solid var(--border); background:var(--surface); }
  .step.done .step-ico { background:rgba(45,106,79,0.1); border-color:rgba(45,106,79,0.3); }
  .step.active .step-ico { background:rgba(139,105,20,0.1); border-color:rgba(139,105,20,0.3); }
  .step-lbl { font-size:0.86rem; font-weight:600; }
  .step-sl { font-size:0.73rem; color:var(--muted); margin-top:2px; }

  .results { animation:fadeUp .5s ease; }
  .res-tb { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:20px; }
  .res-title { font-family:var(--display); font-size:1.45rem; font-weight:700; }
  .tbtn { padding:7px 15px; border-radius:9px; font-family:var(--font); font-size:0.78rem; font-weight:600; cursor:pointer; border:1.5px solid var(--border2); background:var(--surface); color:var(--muted); transition:all .2s; }
  .tbtn:hover { border-color:var(--accent); color:var(--accent); background:var(--alight); }
  .tbtn-a { background:var(--alight); border-color:rgba(139,105,20,0.3); color:var(--accent); }

  .disclaimer { display:flex; gap:9px; background:rgba(180,83,9,0.05); border:1px solid rgba(180,83,9,0.18); border-radius:11px; padding:12px 15px; font-size:0.77rem; color:var(--muted); line-height:1.6; margin-bottom:13px; }
  .juris-banner { display:flex; align-items:center; gap:12px; background:rgba(139,105,20,0.06); border:1px solid rgba(139,105,20,0.2); border-radius:10px; padding:11px 15px; margin-bottom:13px; }
  .juris-lbl { font-size:0.78rem; font-weight:700; color:var(--accent); margin-bottom:3px; }
  .juris-sub { font-size:0.73rem; color:var(--muted); }

  .score-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--r); padding:26px; margin-bottom:13px; display:flex; align-items:center; gap:24px; flex-wrap:wrap; box-shadow:var(--shadow); }
  .ring-wrap { position:relative; width:90px; height:90px; flex-shrink:0; }
  .ring-wrap svg { transform:rotate(-90deg); }
  .ring-num { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
  .ring-big { font-family:var(--display); font-size:1.8rem; font-weight:800; line-height:1; }
  .ring-of { font-size:0.6rem; color:var(--muted); }
  .score-info { flex:1; min-width:155px; }
  .score-lbl { font-size:0.97rem; font-weight:700; margin-bottom:5px; }
  .score-desc { font-size:0.83rem; color:var(--muted); line-height:1.55; }
  .bar-bg { height:5px; background:var(--bg2); border-radius:3px; overflow:hidden; margin-top:12px; border:1px solid var(--border); }
  .bar-fill { height:100%; border-radius:3px; transition:width 1.4s cubic-bezier(.4,0,.2,1); }

  .rsec { background:var(--surface); border:1px solid var(--border); border-radius:var(--r); padding:22px; margin-bottom:12px; box-shadow:var(--shadow); transition:box-shadow .2s; }
  .rsec:hover { box-shadow:var(--shadowlg); }
  .rsec-head { display:flex; align-items:center; gap:10px; margin-bottom:16px; }
  .rsec-ico { width:35px; height:35px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
  .rsec-title { font-size:0.91rem; font-weight:700; }
  .rsec-sub { font-size:0.73rem; color:var(--muted); margin-top:2px; }
  .sum-text { font-size:0.88rem; color:#6b6358; line-height:1.8; }

  .clauses { display:flex; flex-direction:column; gap:11px; }
  .cl-item { border-radius:12px; overflow:hidden; transition:transform .2s; }
  .cl-item:hover { transform:translateY(-1px); }
  .cl-head { display:flex; align-items:center; gap:10px; padding:13px 17px; cursor:pointer; transition:background .2s; }
  .cl-badge { font-size:0.67rem; font-weight:700; font-family:var(--mono); padding:3px 9px; border-radius:6px; white-space:nowrap; }
  .b-risk { background:rgba(155,28,28,0.1); color:var(--red); border:1px solid rgba(155,28,28,0.25); }
  .b-ok { background:rgba(45,106,79,0.1); color:var(--green); border:1px solid rgba(45,106,79,0.25); }
  .b-warn { background:rgba(180,83,9,0.1); color:var(--amber); border:1px solid rgba(180,83,9,0.25); }
  .cl-title { font-size:0.86rem; font-weight:600; flex:1; }
  .cl-arrow { color:var(--muted); font-size:0.78rem; transition:transform .3s; }
  .cl-arrow.open { transform:rotate(180deg); color:var(--accent); }
  .cl-body { padding:15px 17px; border-top:1px solid var(--border); font-size:0.82rem; line-height:1.75; display:flex; flex-direction:column; gap:11px; animation:fadeIn .3s ease; }
  .cl-field { display:flex; flex-direction:column; gap:4px; }
  .cl-fl { font-size:0.69rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--muted); }
  .cl-fv { font-size:0.83rem; color:var(--text); line-height:1.65; }

  .cview { background:var(--bg2); border:1px solid var(--border); border-radius:11px; padding:16px; max-height:285px; overflow-y:auto; font-family:var(--mono); font-size:0.75rem; line-height:1.85; color:var(--muted); white-space:pre-wrap; word-break:break-word; }
  .cview mark.risk { background:rgba(155,28,28,0.12); color:#7f1d1d; border-radius:3px; padding:1px 4px; border-bottom:2px solid rgba(155,28,28,0.35); }

  .legal-list { display:flex; flex-direction:column; gap:9px; }
  .legal-item { display:flex; align-items:flex-start; gap:11px; padding:12px 15px; border-radius:10px; font-size:0.83rem; color:var(--text); line-height:1.65; }
  .legal-item.warn { background:rgba(180,83,9,0.05); border:1px solid rgba(180,83,9,0.18); }
  .legal-item.ok { background:rgba(45,106,79,0.05); border:1px solid rgba(45,106,79,0.18); }
  .legal-badge { flex-shrink:0; padding:3px 9px; border-radius:6px; font-size:0.67rem; font-weight:700; font-family:var(--mono); margin-top:3px; white-space:nowrap; }
  .legal-badge.warn { background:rgba(180,83,9,0.12); color:var(--amber); }
  .legal-badge.ok { background:rgba(45,106,79,0.12); color:var(--green); }

  .sug-list { list-style:none; display:flex; flex-direction:column; gap:9px; }
  .sug-item { display:flex; align-items:flex-start; gap:10px; padding:12px 15px; background:rgba(139,105,20,0.04); border:1px solid rgba(139,105,20,0.15); border-radius:10px; font-size:0.84rem; color:var(--text); line-height:1.65; transition:background .2s; cursor:default; }
  .sug-item:hover { background:rgba(139,105,20,0.08); }
  .snum { flex-shrink:0; width:23px; height:23px; border-radius:7px; background:var(--alight); border:1px solid rgba(139,105,20,0.25); display:flex; align-items:center; justify-content:center; font-size:0.68rem; font-weight:700; color:var(--accent); font-family:var(--mono); margin-top:2px; }

  .chat-msgs { max-height:350px; overflow-y:auto; display:flex; flex-direction:column; gap:12px; padding-bottom:4px; margin-bottom:14px; }
  .chat-msg { display:flex; gap:10px; align-items:flex-start; animation:fadeUp .3s ease; }
  .chat-msg.user { flex-direction:row-reverse; }
  .chat-av { width:29px; height:29px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; flex-shrink:0; }
  .chat-av.ai { background:linear-gradient(135deg,var(--accent),#c49a1a); }
  .chat-av.usr { background:var(--bg2); border:1px solid var(--border2); }
  .bubble { max-width:82%; padding:11px 14px; border-radius:12px; font-size:0.83rem; line-height:1.67; }
  .chat-msg.ai .bubble { background:var(--bg2); border:1px solid var(--border); color:var(--text); border-bottom-left-radius:4px; }
  .chat-msg.user .bubble { background:var(--text); color:#fff; border-bottom-right-radius:4px; }
  .chat-row { display:flex; gap:10px; }
  .chat-in { flex:1; background:var(--bg); border:1.5px solid var(--border); border-radius:11px; padding:11px 14px; color:var(--text); font-family:var(--font); font-size:0.84rem; outline:none; transition:all .2s; cursor:text; }
  .chat-in:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(139,105,20,0.08); }
  .chat-send { padding:11px 22px; background:var(--text); color:#fff; border:none; border-radius:11px; font-family:var(--font); font-size:0.84rem; font-weight:700; cursor:pointer; transition:all .25s; display:flex; align-items:center; gap:8px; }
  .chat-send:hover:not(:disabled) { background:var(--accent2); }
  .chat-send:disabled { opacity:.5; cursor:not-allowed; }
  .quick-qs { display:flex; flex-wrap:wrap; gap:7px; margin-bottom:14px; }
  .qq { padding:6px 13px; border-radius:20px; background:var(--bg2); border:1px solid var(--border2); color:var(--muted); font-size:0.74rem; font-family:var(--font); cursor:pointer; transition:all .2s; }
  .qq:hover { border-color:var(--accent); color:var(--accent); background:var(--alight); }
  .demo-lock { margin-top:11px; padding:10px 14px; background:var(--alight); border:1px solid rgba(139,105,20,0.2); border-radius:9px; font-size:0.79rem; color:var(--muted); text-align:center; }

  .err-box { background:rgba(155,28,28,0.06); border:1px solid rgba(155,28,28,0.2); border-radius:11px; padding:13px 16px; font-size:0.83rem; color:var(--red); display:flex; gap:10px; margin-top:12px; }

  footer { margin-top:auto; border-top:1px solid var(--border); padding:20px 48px; display:flex; align-items:center; justify-content:space-between; font-size:0.75rem; color:var(--muted); background:var(--surface); }

  .paywall { background:linear-gradient(135deg,rgba(139,105,20,0.08),rgba(196,154,26,0.04)); border:2px solid rgba(139,105,20,0.25); border-radius:var(--r); padding:32px 26px; margin-bottom:13px; box-shadow:var(--shadowlg); animation:fadeUp .5s ease; }
  .paywall-blur { display:flex; flex-direction:column; align-items:center; text-align:center; }
  .paywall-icon { font-size:2.5rem; margin-bottom:12px; animation:float 3s ease-in-out infinite; }
  .paywall-title { font-family:var(--display); font-size:1.55rem; font-weight:800; margin-bottom:7px; color:var(--text); }
  .paywall-sub { color:var(--muted); font-size:0.88rem; max-width:440px; margin-bottom:22px; line-height:1.65; }
  .paywall-features { display:flex; flex-direction:column; gap:9px; margin-bottom:20px; width:100%; max-width:420px; }
  .pwf { background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:10px 14px; font-size:0.85rem; color:var(--text); text-align:left; }
  .paywall-price { font-family:var(--display); font-size:2rem; font-weight:800; color:var(--accent); margin-bottom:5px; }
  .paywall-price span { font-family:var(--font); font-size:0.78rem; color:var(--muted); font-weight:400; }

  @media(max-width:700px){
    nav{padding:13px 16px;}
    .hero{padding:65px 16px 55px;}
    .main{padding:28px 14px 60px;}
    .pay-row{flex-direction:column;align-items:flex-start;}
    .score-card{flex-direction:column;}
    footer{flex-direction:column;gap:6px;text-align:center;padding:16px;}
  }
`

const sColor = s => s <= 3 ? '#2d6a4f' : s <= 6 ? '#b45309' : '#9b1c1c'
const sLabel = s => s <= 3 ? 'Low Risk' : s <= 6 ? 'Moderate Risk' : s <= 8 ? 'High Risk' : 'Very High Risk'
const sDesc = s => s <= 3 ? 'Contract appears balanced. Your rights are protected.' : s <= 6 ? 'Some clauses need attention before signing.' : s <= 8 ? 'Significant risks — negotiate before signing.' : 'Highly unfavorable. Get legal advice first.'

function Ring({ score }) {
  const r = 40, cx = 48, cy = 48
  const circ = 2 * Math.PI * r
  const dash = (score / 10) * circ
  const col = sColor(score)
  return (
    <div className="ring-wrap">
      <svg width="90" height="90" viewBox="0 0 96 96">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg2)" strokeWidth="7" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth="7"
          strokeDasharray={dash + ' ' + circ} strokeLinecap="round" />
      </svg>
      <div className="ring-num">
        <span className="ring-big" style={{ color: col }}>{score}</span>
        <span className="ring-of">/10</span>
      </div>
    </div>
  )
}

function highlight(text, clauses) {
  if (!text || !clauses?.length) return text
  let out = text
  clauses.filter(c => c.status === 'risk').forEach(cl => {
    cl.title.split(/\s+/).filter(w => w.length > 4).slice(0, 3).forEach(w => {
      const esc = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      out = out.replace(new RegExp('(' + esc + ')', 'gi'), '<mark class="risk">$1</mark>')
    })
  })
  return out
}

const STEPS = [
  { icon: '📄', label: 'Reading contract', sub: 'Parsing document structure...' },
  { icon: '🔍', label: 'Identifying clauses', sub: 'Extracting individual terms...' },
  { icon: '⚖️', label: 'Deep legal analysis', sub: 'Applying jurisdiction-specific law...' },
  { icon: '🧠', label: 'Assessing your rights', sub: 'Checking enforceability...' },
  { icon: '✨', label: 'Generating report', sub: 'Compiling detailed findings...' },
]

const QUICK_QS = [
  'What are my rights if they breach this?',
  'Can they terminate without notice?',
  'What happens if I miss a payment?',
  'Is this clause enforceable?',
  'Should I sign this contract?',
]

const FAQ_DATA = [
  { q: 'Is this real legal advice?', a: 'MyLegalGuard provides detailed legal information based on UK and US law. It is not formal legal advice. For high-stakes contracts, consult a qualified solicitor or attorney.' },
  { q: 'How does the AI detect my jurisdiction?', a: 'The AI automatically detects the governing jurisdiction from your contract — looking for governing law clauses, currency symbols (£, $, €, CAD, AUD), legal terminology, and company formats (Ltd, Inc, GmbH, SARL, Pty Ltd, etc). It then applies the exact laws of that jurisdiction.' },
  { q: 'What types of contracts can I analyze?', a: 'Any written contract — employment, tenancy, freelance, service agreements, NDAs, partnership agreements, and more.' },
  { q: 'Is my contract data kept private?', a: 'Your contract is processed securely and is not stored permanently or shared with third parties. Each analysis is private to you.' },
  { q: 'What do I get for $7.99?', a: 'Full clause-by-clause breakdown, risk score, UK/US legal comparison, negotiation tips, risk highlights, and unlimited Legal AI Advisor chat for your contract.' },
  { q: 'Can I use this for contracts from other countries?', a: 'The AI is optimized for UK, US, EU (Germany, France, Italy, Spain, Netherlands), Canada, and Australia. It can analyze any English-language contract and will identify the governing jurisdiction automatically.' },
]

const clauseStyle = {
  risk: { bg: 'rgba(155,28,28,0.06)', border: 'rgba(155,28,28,0.2)' },
  warn: { bg: 'rgba(180,83,9,0.05)', border: 'rgba(180,83,9,0.18)' },
  ok: { bg: 'rgba(45,106,79,0.04)', border: 'rgba(45,106,79,0.18)' },
}

export default function App() {
  const [user, setUser] = useState(null)
  const [credits, setCredits] = useState(0)
  const [modal, setModal] = useState(null)
  const [settingsView, setSettingsView] = useState('main')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [newEmail, setNewEmail] = useState('')
  const [newPass, setNewPass] = useState('')
  const [authErr, setAuthErr] = useState('')
  const [settingsMsg, setSettingsMsg] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)

  const [tab, setTab] = useState('upload')
  const [file, setFile] = useState(null)
  const [rawText, setRawText] = useState('')
  const [over, setOver] = useState(false)
  const fileRef = useRef()

  const [paid, setPaid] = useState(false)
  const [paying, setPaying] = useState(false)

  const [phase, setPhase] = useState('idle')
  const [stepIdx, setStepIdx] = useState(0)
  const [result, setResult] = useState(null)
  const [contractText, setContractText] = useState('')
  const [err, setErr] = useState('')
  const [openClause, setOpenClause] = useState(null)
  const [openFaq, setOpenFaq] = useState(null)

  const [chatMsgs, setChatMsgs] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEnd = useRef()

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMsgs])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setUser(session.user); fetchCredits(session.user.id) }
    })
    supabase.auth.onAuthStateChange((_, session) => {
      if (session) { setUser(session.user); fetchCredits(session.user.id) }
      else setUser(null)
    })
  }, [])

  async function fetchCredits(uid) {
    const { data } = await supabase.from('users').select('credits').eq('id', uid).single()
    if (data) setCredits(data.credits || 0)
  }

  async function doRegister() {
    setAuthLoading(true); setAuthErr('')
    const { error } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: form.name } }
    })
    if (error) { setAuthErr(error.message); setAuthLoading(false); return }
    const { data: { user: u } } = await supabase.auth.getUser()
    if (u) await supabase.from('users').insert({ id: u.id, email: form.email, name: form.name, credits: 0 })
    setModal(null); setForm({ name: '', email: '', password: '' }); setAuthLoading(false)
  }

  async function doLogin() {
    setAuthLoading(true); setAuthErr('')
    const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
    if (error) { setAuthErr(error.message); setAuthLoading(false); return }
    setModal(null); setForm({ name: '', email: '', password: '' }); setAuthLoading(false)
  }

  async function doForgot() {
    setAuthLoading(true); setAuthErr('')
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: window.location.origin
    })
    if (error) { setAuthErr(error.message); setAuthLoading(false); return }
    setForgotSent(true); setAuthLoading(false)
  }

  async function updateEmail() {
    setAuthLoading(true); setSettingsMsg('')
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    if (error) setSettingsMsg('error:' + error.message)
    else { setSettingsMsg('success:Email updated!'); setNewEmail('') }
    setAuthLoading(false)
  }

  async function updatePassword() {
    setAuthLoading(true); setSettingsMsg('')
    const { error } = await supabase.auth.updateUser({ password: newPass })
    if (error) setSettingsMsg('error:' + error.message)
    else { setSettingsMsg('success:Password updated!'); setNewPass('') }
    setAuthLoading(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    setUser(null); setModal(null); setPhase('idle'); setResult(null)
    setFile(null); setRawText(''); setPaid(false); setChatMsgs([])
  }

  function resetPhase() {
    setPhase('idle'); setResult(null); setFile(null)
    setRawText(''); setErr(''); setPaid(false); setChatMsgs([])
  }

  const onFile = f => { if (f) setFile(f) }
  const onDrop = useCallback(e => { e.preventDefault(); setOver(false); onFile(e.dataTransfer.files[0]) }, [])

  async function getContractText() {
    if (tab === 'paste') return rawText.trim()
    if (!file) return ''
    return new Promise(res => { const r = new FileReader(); r.onload = e => res(e.target.result); r.readAsText(file) })
  }

  function handlePayPal() {
    setPaying(true)
    const script = document.createElement('script')
    script.src = 'https://www.paypal.com/sdk/js?client-id=' + import.meta.env.VITE_PAYPAL_CLIENT_ID + '&currency=USD'
    script.onload = () => {
      window.paypal.Buttons({
        createOrder: (data, actions) => actions.order.create({
          purchase_units: [{ amount: { value: '7.99', currency_code: 'USD' }, description: 'MyLegalGuard Analysis' }]
        }),
        onApprove: async data => {
          const res = await fetch('/api/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderID: data.orderID, userId: user?.id })
          })
          const r = await res.json()
          if (r.success) { setPaid(true); setCredits(c => c + 1) }
          else setErr('Payment verification failed. Please contact support.')
          setPaying(false)
        },
        onCancel: () => setPaying(false),
        onError: () => { setErr('PayPal error. Please try again.'); setPaying(false) }
      }).render('#pp-container')
    }
    document.body.appendChild(script)
  }

  function animateSteps(cb) {
    let i = 0; setStepIdx(0)
    const iv = setInterval(() => {
      i++
      if (i >= STEPS.length) { clearInterval(iv); cb(); return }
      setStepIdx(i)
    }, 900)
  }

  async function analyze() {
    const ct = await getContractText()
    if (!ct) { setErr('Please upload a file or paste contract text.'); return }
    setContractText(ct); setErr(''); setPhase('loading'); setStepIdx(0)
    animateSteps(async () => {
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contractText: ct, userId: user?.id })
        })
        const parsed = await res.json()
        if (!res.ok) throw new Error(parsed.error)
        setResult(parsed); setPhase('done')
        setChatMsgs([{ role: 'ai', text: 'Analysis complete. ' + parsed.verdict + ' Ask me anything about your contract.' }])
      } catch (e) {
        setPhase('error'); setErr(e.message || 'Analysis failed. Please try again.')
      }
    })
  }

  async function sendChat(q) {
    const question = q || chatInput.trim()
    if (!question || chatLoading) return
    setChatInput('')
    setChatMsgs(m => [...m, { role: 'user', text: question }])
    setChatLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, result, contractText })
      })
      const data = await res.json()
      setChatMsgs(m => [...m, { role: 'ai', text: data.reply || 'Sorry, could not answer that.' }])
    } catch {
      setChatMsgs(m => [...m, { role: 'ai', text: 'Something went wrong. Please try again.' }])
    }
    setChatLoading(false)
  }

  function copyReport() {
    if (!result) return
    const t = 'CONTRACTGUARD LEGAL ANALYSIS\n' + '='.repeat(40) + '\n\n'
      + 'JURISDICTION: ' + result.jurisdiction + '\n'
      + 'VERDICT: ' + result.verdict + '\n'
      + 'RISK SCORE: ' + result.score + '/10\n\n'
      + 'SUMMARY\n' + result.summary + '\n\n'
      + 'RISKS\n' + result.risks?.map((r, i) => (i + 1) + '. ' + r).join('\n') + '\n\n'
      + 'SUGGESTIONS\n' + result.suggestions?.map((s, i) => (i + 1) + '. ' + s).join('\n') + '\n\n'
      + 'OVERALL ADVICE\n' + result.overallAdvice + '\n\n'
      + '-'.repeat(40) + '\nNot formal legal advice.'
    navigator.clipboard.writeText(t)
  }

  const canProceed = (tab === 'upload' && file) || (tab === 'paste' && rawText.trim().length > 30)
  const isPreview = phase === 'done' && result && !paid
  const userName = user?.user_metadata?.full_name || user?.email || ''
  const isSettingsMsg = settingsMsg.startsWith('success:') || settingsMsg.startsWith('error:')
  const settingsMsgType = settingsMsg.startsWith('success:') ? 'success' : 'error'
  const settingsMsgText = settingsMsg.replace(/^(success:|error:)/, '')

  function openModal(m) {
    setModal(m); setAuthErr(''); setForgotSent(false)
    setSettingsView('main'); setSettingsMsg('')
  }

  return (
    <>
      <style>{css}</style>
      <div className="app">

        <nav>
          <div className="logo">
            <div className="logo-mark">🛡</div>
            MyLegal<span>Guard</span>
          </div>
          <div className="nav-r">
            {user ? (
              <div className="upill">
                <div className="uavatar">{userName[0]?.toUpperCase()}</div>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, cursor: 'default' }}>{userName}</span>
                <span className="ucredit">💳 {credits} credit{credits !== 1 ? 's' : ''}</span>
                <button className="nav-btn-sm" onClick={() => openModal('settings')}>⚙ Settings</button>
                <button className="nav-btn-sm nav-btn-danger" onClick={logout}>Sign out</button>
              </div>
            ) : (
              <>
                <button className="nb nb-ghost" onClick={() => openModal('login')}>Sign In</button>
                <button className="nb nb-solid" onClick={() => openModal('register')}>Get Started</button>
              </>
            )}
          </div>
        </nav>

        {modal && (
          <div className="overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
            <div className="modal">
              <button className="modal-x" onClick={() => setModal(null)}>×</button>

              {modal === 'settings' ? (
                <>
                  <h2>{settingsView === 'main' ? 'Settings' : settingsView === 'email' ? 'Change Email' : 'Change Password'}</h2>
                  <p className="modal-sub" style={{ marginBottom: 22 }}>
                    {settingsView === 'main' ? 'Manage your account' : 'Update your account details'}
                  </p>

                  {settingsView === 'main' && (
                    <>
                      <button className="settings-row" onClick={() => { setSettingsView('email'); setSettingsMsg('') }}>
                        📧 Change Email <span className="settings-arrow">→</span>
                      </button>
                      <button className="settings-row" onClick={() => { setSettingsView('password'); setSettingsMsg('') }}>
                        🔒 Change Password <span className="settings-arrow">→</span>
                      </button>
                      <button className="settings-row danger" onClick={logout}>
                        🚪 Sign Out
                      </button>
                    </>
                  )}

                  {settingsView === 'email' && (
                    <>
                      <button className="back-link" onClick={() => { setSettingsView('main'); setSettingsMsg('') }}>← Back</button>
                      <div className="field">
                        <label>New Email</label>
                        <input type="email" placeholder="new@email.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                      </div>
                      {isSettingsMsg && <div className={settingsMsgType === 'success' ? 'success-msg' : 'error-msg'}>{settingsMsgText}</div>}
                      <button className="modal-cta" disabled={authLoading || !newEmail} onClick={updateEmail}>
                        {authLoading ? 'Updating...' : 'Update Email'}
                      </button>
                    </>
                  )}

                  {settingsView === 'password' && (
                    <>
                      <button className="back-link" onClick={() => { setSettingsView('main'); setSettingsMsg('') }}>← Back</button>
                      <div className="field">
                        <label>New Password</label>
                        <input type="password" placeholder="Min 6 characters" value={newPass}
                          onChange={e => setNewPass(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && updatePassword()} />
                      </div>
                      {isSettingsMsg && <div className={settingsMsgType === 'success' ? 'success-msg' : 'error-msg'}>{settingsMsgText}</div>}
                      <button className="modal-cta" disabled={authLoading || newPass.length < 6} onClick={updatePassword}>
                        {authLoading ? 'Updating...' : 'Update Password'}
                      </button>
                    </>
                  )}
                </>
              ) : modal === 'forgot' ? (
                <>
                  <h2>Reset password</h2>
                  <p className="modal-sub">Enter your email to receive a reset link</p>
                  {forgotSent ? (
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                      <div style={{ fontSize: '2rem', marginBottom: 12 }}>📧</div>
                      <div style={{ fontWeight: 700, marginBottom: 8 }}>Check your email!</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 20 }}>We sent a reset link to {form.email}</div>
                      <button className="modal-cta" onClick={() => openModal('login')}>Back to Sign In</button>
                    </div>
                  ) : (
                    <>
                      <div className="field">
                        <label>Email</label>
                        <input type="email" placeholder="you@email.com" value={form.email}
                          onChange={e => setForm({ ...form, email: e.target.value })}
                          onKeyDown={e => e.key === 'Enter' && doForgot()} />
                      </div>
                      {authErr && <div className="err-box" style={{ marginBottom: 12 }}>⚠️ {authErr}</div>}
                      <button className="modal-cta" disabled={authLoading || !form.email} onClick={doForgot}>
                        {authLoading ? 'Sending...' : 'Send Reset Link'}
                      </button>
                      <div className="modal-sw">
                        <button onClick={() => openModal('login')}>← Back to Sign In</button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <h2>{modal === 'login' ? 'Welcome back' : 'Create account'}</h2>
                  <p className="modal-sub">{modal === 'login' ? 'Sign in to MyLegalGuard' : 'Deep legal analysis for $7.99 per contract'}</p>

                  {modal === 'register' && (
                    <div className="field">
                      <label>Full Name</label>
                      <input placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                  )}
                  <div className="field">
                    <label>Email</label>
                    <input type="email" placeholder="you@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Password</label>
                    <input type="password" placeholder="Min 6 characters" value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      onKeyDown={e => e.key === 'Enter' && (modal === 'login' ? doLogin() : doRegister())} />
                  </div>

                  {authErr && <div className="err-box" style={{ marginBottom: 12 }}>⚠️ {authErr}</div>}

                  <button className="modal-cta" disabled={authLoading} onClick={modal === 'login' ? doLogin : doRegister}>
                    {authLoading ? 'Please wait...' : modal === 'login' ? 'Sign In' : 'Create Account'}
                  </button>

                  <div className="modal-sw">
                    {modal === 'login' ? (
                      <>
                        No account? <button onClick={() => openModal('register')}>Register</button>
                        <div style={{ marginTop: 8 }}>
                          <button style={{ color: 'var(--muted)', fontSize: '0.79rem' }} onClick={() => openModal('forgot')}>Forgot password?</button>
                        </div>
                      </>
                    ) : (
                      <>Have an account? <button onClick={() => openModal('login')}>Sign In</button></>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {!user && (
          <>
            <div className="hero">
              <div className="hero-bg" /><div className="hero-dots" />
              <div className="hero-inner">
                <div className="eyebrow">⚖️ Deep Legal Intelligence</div>
                <h1>Understand your contract like<br /><em>a senior lawyer</em></h1>
                <p>Clause-by-clause legal breakdown, your rights under UK, US, EU, Canadian, and Australian law, risk assessment, and an AI legal advisor.</p>
                <div className="hero-btns">
                  <button className="btn-main" onClick={() => openModal('register')}>Analyze My Contract →</button>
                  <button className="btn-out" onClick={() => openModal('login')}>Sign In</button>
                </div>
                <p className="price-hint">Pay per analysis · <strong>$7.99 per contract</strong> · No subscription</p>
                <div className="hero-badges">
                  {[{ e: '⚡', t: 'Instant Analysis' }, { e: '🔒', t: '100% Secure' }, { e: '⚖️', t: 'Global Law' }, { e: '💬', t: 'AI Legal Chat' }].map((b, i) => (
                    <div key={i} className="hbadge">{b.e} {b.t}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="fstrip">
              {[
                { e: '📋', t: 'Clause-by-Clause', s: 'Every clause explained simply' },
                { e: '🌍', t: 'Global Coverage', s: 'UK, US, EU, Canada, Australia' },
                { e: '🔴', t: 'Risk Highlights', s: 'Risky terms highlighted in red' },
                { e: '💬', t: 'Legal AI Chat', s: 'Ask anything, get clear answers' },
                { e: '✍️', t: 'Negotiation Tips', s: 'Exact language to negotiate' },
                { e: '📊', t: 'Risk Score', s: 'Clear 1-10 rating explained' },
              ].map(f => (
                <div key={f.t} className="fitem">
                  <div className="fico">{f.e}</div>
                  <div className="ftitle">{f.t}</div>
                  <div className="fsub">{f.s}</div>
                </div>
              ))}
            </div>

            <div className="faq-wrap">
              <div className="faq-title">Common Questions</div>
              <p className="faq-sub">Everything you need to know before uploading your contract</p>
              <div className="faq-list">
                {FAQ_DATA.map((item, i) => (
                  <div key={i} className={'faq' + (openFaq === i ? ' open' : '')} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <div className="faq-q">
                      <span>{item.q}</span>
                      <span className="faq-arrow">▼</span>
                    </div>
                    {openFaq === i && <div className="faq-a">{item.a}</div>}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {user && (
          <div className="main">
            {phase !== 'idle' && (
              <button className="back-btn" onClick={resetPhase}>← Back to Upload</button>
            )}

            {phase === 'idle' && (
              <>
                <div className="pg-title">Analyze a Contract</div>
                <div className="pg-sub">Upload your contract for a full legal analysis — clause by clause, under the correct jurisdiction.</div>
                <div className="card">
                  <div className="tabs">
                    <button className={'tab' + (tab === 'upload' ? ' on' : '')} onClick={() => setTab('upload')}>📎 Upload File</button>
                    <button className={'tab' + (tab === 'paste' ? ' on' : '')} onClick={() => setTab('paste')}>📋 Paste Text</button>
                  </div>
                  <div className="cbody">
                    {tab === 'upload' ? (
                      <div className={'dz' + (over ? ' over' : '')}
                        onDragOver={e => { e.preventDefault(); setOver(true) }}
                        onDragLeave={() => setOver(false)}
                        onDrop={onDrop}
                        onClick={() => fileRef.current.click()}>
                        <input ref={fileRef} type="file" accept=".pdf,.txt,.doc,.docx"
                          onChange={e => onFile(e.target.files[0])} style={{ display: 'none' }} />
                        <div className="dz-ico">📂</div>
                        <div className="dz-t">{file ? 'File ready' : 'Drop your contract here'}</div>
                        <div className="dz-s">{file ? '' : 'PDF, TXT, DOC · Click or drag and drop'}</div>
                        {file && <div className="fchip">✅ {file.name}</div>}
                      </div>
                    ) : (
                      <textarea className="ct" placeholder={'Paste contract text here...\n\nMinimum 30 characters.'} value={rawText} onChange={e => setRawText(e.target.value)} />
                    )}
                    {err && <div className="err-box">⚠️ {err}</div>}

                    <div className="pay-row">
                      <div>
                        <div className="pay-lbl">🎁 Free preview — see if your contract is risky</div>
                        <div className="pay-price" style={{fontSize:'1.2rem'}}>Try it free — no payment needed</div>
                      </div>
                      <button className="paid-btn" disabled={!canProceed} onClick={analyze}>⚖️ Analyze Contract Free →</button>
                    </div>
                  </div>
                </div>

                <div className="rsec" style={{ marginTop: 20 }}>
                  <div className="rsec-head">
                    <div className="rsec-ico" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>💬</div>
                    <div>
                      <div className="rsec-title">Legal AI Advisor</div>
                      <div className="rsec-sub">Example conversations after your analysis</div>
                    </div>
                  </div>
                  <div className="chat-msgs" style={{ maxHeight: 220 }}>
                    {[
                      { role: 'user', text: 'Can they terminate my contract without notice?' },
                      { role: 'ai', text: 'Under the Employment Rights Act 1996 (UK), if you have worked there over 2 years, they must give a fair reason. Terminating without cause would be unfair dismissal. Next step: check your start date and review the notice clause.' },
                      { role: 'user', text: 'What is the maximum penalty if I leave early?' },
                      { role: 'ai', text: 'Under the Consumer Rights Act 2015, any early termination penalty must reflect actual losses. If disproportionate, it may be unenforceable. Next step: ask them to justify the penalty figure before you sign.' },
                    ].map((m, i) => (
                      <div key={i} className={'chat-msg ' + m.role}>
                        <div className={'chat-av ' + (m.role === 'ai' ? 'ai' : 'usr')}>{m.role === 'ai' ? '⚖️' : '👤'}</div>
                        <div className="bubble">{m.text}</div>
                      </div>
                    ))}
                  </div>
                  <div className="demo-lock">🔒 Complete your analysis above to unlock your personal Legal AI Advisor</div>
                </div>
              </>
            )}

            {phase === 'loading' && (
              <div className="card">
                <div className="loading-card">
                  <div className="lc-head">
                    <div className="lc-title">Performing deep legal analysis...</div>
                    <div className="lc-sub">Detecting jurisdiction and applying correct law</div>
                  </div>
                  <div className="steps">
                    {STEPS.map((s, i) => (
                      <div key={i} className={'step' + (i < stepIdx ? ' done' : i === stepIdx ? ' active' : '')}>
                        <div className="step-ico">{i < stepIdx ? '✅' : s.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div className="step-lbl">{s.label}</div>
                          <div className="step-sl">{i < stepIdx ? 'Complete' : i === stepIdx ? s.sub : 'Waiting...'}</div>
                        </div>
                        {i === stepIdx && <span className="spin" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {phase === 'error' && (
              <div className="err-box">⚠️ {err}</div>
            )}

            {phase === 'done' && result && (
              <div className="results">
                <div className="res-tb">
                  <div className="res-title">Legal Analysis Report</div>
                  <button className="tbtn tbtn-a" onClick={copyReport}>📋 Copy Report</button>
                </div>

                <div className="disclaimer">
                  <span>⚠️</span>
                  <span><strong>AI-powered preliminary analysis only.</strong> This is not formal legal advice and does not create a lawyer-client relationship. For binding legal advice on high-value contracts, always consult a qualified lawyer licensed in your jurisdiction.</span>
                </div>

                {result.jurisdiction && (
                  <div className="juris-banner">
                    <span style={{ fontSize: '1.3rem' }}>
                      {(() => {
                        const j = result.jurisdiction.toLowerCase()
                        if (j.includes('uk') || j.includes('united kingdom') || j.includes('england') || j.includes('scotland') || j.includes('wales')) return '🇬🇧'
                        if (j.includes('us') || j.includes('united states') || j.includes('america')) return '🇺🇸'
                        if (j.includes('canada')) return '🇨🇦'
                        if (j.includes('australia')) return '🇦🇺'
                        if (j.includes('germany') || j.includes('deutschland')) return '🇩🇪'
                        if (j.includes('france')) return '🇫🇷'
                        if (j.includes('italy')) return '🇮🇹'
                        if (j.includes('spain')) return '🇪🇸'
                        if (j.includes('netherlands') || j.includes('holland')) return '🇳🇱'
                        if (j.includes('eu') || j.includes('european')) return '🇪🇺'
                        return '🌍'
                      })()}
                    </span>
                    <div>
                      <div className="juris-lbl">JURISDICTION DETECTED: {result.jurisdiction}</div>
                      <div className="juris-sub">{result.jurisdictionReason}</div>
                    </div>
                  </div>
                )}

                <div className="score-card">
                  <Ring score={result.score} />
                  <div className="score-info">
                    <div className="score-lbl" style={{ color: sColor(result.score) }}>{sLabel(result.score)}</div>
                    <div className="score-desc" style={{ marginBottom: 6 }}>{result.verdict}</div>
                    <div style={{ fontSize: '0.79rem', color: sColor(result.score), fontWeight: 700 }}>{sDesc(result.score)}</div>
                    <div className="bar-bg">
                      <div className="bar-fill" style={{ width: (result.score * 10) + '%', background: sColor(result.score) }} />
                    </div>
                  </div>
                </div>

                <div className="rsec">
                  <div className="rsec-head">
                    <div className="rsec-ico" style={{ background: 'rgba(139,105,20,0.1)', border: '1px solid rgba(139,105,20,0.25)' }}>📝</div>
                    <div>
                      <div className="rsec-title">What This Contract Means For You</div>
                      <div className="rsec-sub">Plain-English summary of your obligations and rights</div>
                    </div>
                  </div>
                  <p className="sum-text">{result.summary}</p>
                </div>

                {!paid && (
                  <div className="paywall">
                    <div className="paywall-blur">
                      <div className="paywall-icon">🔒</div>
                      <div className="paywall-title">Unlock Full Legal Report</div>
                      <div className="paywall-sub">You've seen the preview. Get the complete analysis to understand every clause and protect yourself.</div>
                      <div className="paywall-features">
                        <div className="pwf">📋 Clause-by-clause breakdown with legal analysis</div>
                        <div className="pwf">🔴 Risky terms highlighted in your contract</div>
                        <div className="pwf">⚖️ Your rights under {result.jurisdiction} law</div>
                        <div className="pwf">✍️ Negotiation suggestions for each issue</div>
                        <div className="pwf">💬 AI Legal Advisor — ask anything</div>
                      </div>
                      <div className="paywall-price">$7.99 <span>· One-time payment</span></div>
                      <div id="pp-container" style={{marginTop:14}} />
                      {!paying && (
                        <button className="pp-btn" style={{margin:'0 auto'}} onClick={handlePayPal}>
                          🅿 Pay with PayPal — Unlock Full Report
                        </button>
                      )}
                      {paying && (
                        <div style={{color:'var(--muted)',fontSize:'0.84rem',display:'flex',alignItems:'center',gap:8,justifyContent:'center',marginTop:14}}>
                          <span className="spin spin-a" />Loading PayPal...
                        </div>
                      )}
                      <div className="pay-note" style={{textAlign:'center',marginTop:10}}>🔒 Secure payment · Instant access</div>
                    </div>
                  </div>
                )}

                {paid && result.clauses?.length > 0 && (
                  <div className="rsec">
                    <div className="rsec-head">
                      <div className="rsec-ico" style={{ background: 'rgba(180,83,9,0.1)', border: '1px solid rgba(180,83,9,0.25)' }}>📋</div>
                      <div>
                        <div className="rsec-title">Clause-by-Clause Breakdown</div>
                        <div className="rsec-sub">Click any clause to see full legal analysis</div>
                      </div>
                    </div>
                    <div className="clauses">
                      {result.clauses.map((cl, i) => (
                        <div key={i} className="cl-item"
                          style={{ background: clauseStyle[cl.status]?.bg, border: '1px solid ' + clauseStyle[cl.status]?.border }}>
                          <div className="cl-head" onClick={() => setOpenClause(openClause === i ? null : i)}>
                            <span className={'cl-badge b-' + cl.status}>
                              {cl.status === 'risk' ? '⚠ RISK' : cl.status === 'warn' ? '⚡ REVIEW' : '✓ OK'}
                            </span>
                            <span className="cl-title">{cl.title}</span>
                            <span className={'cl-arrow' + (openClause === i ? ' open' : '')}>▼</span>
                          </div>
                          {openClause === i && (
                            <div className="cl-body">
                              <div className="cl-field"><div className="cl-fl">📝 Plain English</div><div className="cl-fv">{cl.plainEnglish}</div></div>
                              <div className="cl-field"><div className="cl-fl">⚖️ Legal Analysis</div><div className="cl-fv">{cl.legalAnalysis}</div></div>
                              <div className="cl-field"><div className="cl-fl">🛡 Your Rights</div><div className="cl-fv">{cl.yourRights}</div></div>
                              {cl.negotiationTip && (
                                <div className="cl-field" style={{ background: 'rgba(139,105,20,0.06)', border: '1px solid rgba(139,105,20,0.2)', borderRadius: 9, padding: '10px 13px' }}>
                                  <div className="cl-fl" style={{ color: 'var(--accent)' }}>💡 Negotiation Tip</div>
                                  <div className="cl-fv">{cl.negotiationTip}</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {paid && <div className="rsec">
                  <div className="rsec-head">
                    <div className="rsec-ico" style={{ background: 'rgba(155,28,28,0.1)', border: '1px solid rgba(155,28,28,0.25)' }}>🔴</div>
                    <div>
                      <div className="rsec-title">Contract with Risk Highlights</div>
                      <div className="rsec-sub">Risky terms highlighted in the original text</div>
                    </div>
                  </div>
                  <div className="cview" dangerouslySetInnerHTML={{ __html: highlight(contractText.slice(0, 3000), result.clauses) }} />
                </div>}

                {paid && result.legalComparison?.length > 0 && (
                  <div className="rsec">
                    <div className="rsec-head">
                      <div className="rsec-ico" style={{ background: 'rgba(45,106,79,0.1)', border: '1px solid rgba(45,106,79,0.25)' }}>🌍</div>
                      <div>
                        <div className="rsec-title">Legal Standards Check</div>
                        <div className="rsec-sub">How your contract compares to legal norms in your jurisdiction</div>
                      </div>
                    </div>
                    <div className="legal-list">
                      {result.legalComparison.map((l, i) => (
                        <div key={i} className={'legal-item ' + l.status}>
                          <span className={'legal-badge ' + l.status}>{l.status === 'warn' ? '⚠ UNUSUAL' : '✓ STANDARD'}</span>
                          <span>{l.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {paid && <div className="rsec">
                  <div className="rsec-head">
                    <div className="rsec-ico" style={{ background: 'rgba(139,105,20,0.1)', border: '1px solid rgba(139,105,20,0.25)' }}>✍️</div>
                    <div>
                      <div className="rsec-title">Negotiation Suggestions</div>
                      <div className="rsec-sub">Specific advice before you sign</div>
                    </div>
                  </div>
                  <ul className="sug-list">
                    {result.suggestions?.map((s, i) => (
                      <li key={i} className="sug-item"><span className="snum">{i + 1}</span>{s}</li>
                    ))}
                  </ul>
                </div>}

                {paid && result.overallAdvice && (
                  <div className="rsec" style={{ background: 'rgba(139,105,20,0.05)', borderColor: 'rgba(139,105,20,0.2)' }}>
                    <div className="rsec-head">
                      <div className="rsec-ico" style={{ background: 'rgba(139,105,20,0.12)', border: '1px solid rgba(139,105,20,0.3)' }}>🎯</div>
                      <div className="rsec-title">Our Recommendation</div>
                    </div>
                    <p className="sum-text">{result.overallAdvice}</p>
                  </div>
                )}

                {paid && <div className="rsec">
                  <div className="rsec-head">
                    <div className="rsec-ico" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>💬</div>
                    <div>
                      <div className="rsec-title">Legal AI Advisor</div>
                      <div className="rsec-sub">Ask anything about your contract</div>
                    </div>
                  </div>
                  <div className="quick-qs">
                    {QUICK_QS.map((q, i) => (
                      <button key={i} className="qq" onClick={() => sendChat(q)}>{q}</button>
                    ))}
                  </div>
                  <div className="chat-msgs">
                    {chatMsgs.map((m, i) => (
                      <div key={i} className={'chat-msg ' + m.role}>
                        <div className={'chat-av ' + (m.role === 'ai' ? 'ai' : 'usr')}>{m.role === 'ai' ? '⚖️' : '👤'}</div>
                        <div className="bubble">{m.text}</div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="chat-msg ai">
                        <div className="chat-av ai">⚖️</div>
                        <div className="bubble" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="spin" />Analyzing...
                        </div>
                      </div>
                    )}
                    <div ref={chatEnd} />
                  </div>
                  <div className="chat-row">
                    <input className="chat-in"
                      placeholder="Ask about your rights, any clause, or what to do next..."
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendChat()} />
                    <button className="chat-send" disabled={!chatInput.trim() || chatLoading} onClick={() => sendChat()}>
                      {chatLoading ? <span className="spin" /> : 'Ask →'}
                    </button>
                  </div>
                </div>}
              </div>
            )}
          </div>
        )}

        <footer>
          <span>© 2026 MyLegalGuard</span>
          <span>For informational purposes only · Not legal advice</span>
        </footer>
      </div>
    </>
  )
}
