var PM = window.PM || (window.PM = {});

// SVG gem shapes (32×32 viewBox) — multi-facet jewel cuts
// Each gem: dark base → directional facet polygons (lit UL, shadow LR) → inner table gradient → specular
PM.GEM_SVG = [

  // 0 — Ruby — brilliant diamond cut
  `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="rg0" cx="40%" cy="33%" r="52%">
        <stop offset="0%"   stop-color="#ffc0cc"/>
        <stop offset="48%"  stop-color="#ff2845"/>
        <stop offset="100%" stop-color="#500010"/>
      </radialGradient>
    </defs>
    <polygon points="16,2 30,16 16,30 2,16"   fill="#340008"/>
    <polygon points="16,2 2,16 11,11 16,7"    fill="#ff9aaa"/>
    <polygon points="16,2 30,16 21,11 16,7"   fill="#e02040"/>
    <polygon points="2,16 16,30 11,21 11,11"  fill="#cc1838"/>
    <polygon points="30,16 16,30 21,21 21,11" fill="#880018"/>
    <polygon points="2,16 11,21 16,25 16,30"  fill="#aa1228"/>
    <polygon points="30,16 21,21 16,25 16,30" fill="#5a0010"/>
    <polygon points="16,7 11,11 21,11"        fill="#ffccd5"/>
    <polygon points="11,11 21,11 21,21 11,21" fill="url(#rg0)"/>
    <polygon points="11,21 21,21 16,25"       fill="#aa0e22"/>
    <line x1="16" y1="7"  x2="11" y2="11" stroke="rgba(255,160,175,0.50)" stroke-width="0.55"/>
    <line x1="16" y1="7"  x2="21" y2="11" stroke="rgba(255,160,175,0.50)" stroke-width="0.55"/>
    <line x1="11" y1="11" x2="11" y2="21" stroke="rgba(0,0,0,0.28)"       stroke-width="0.45"/>
    <line x1="21" y1="11" x2="21" y2="21" stroke="rgba(0,0,0,0.28)"       stroke-width="0.45"/>
    <line x1="11" y1="21" x2="16" y2="25" stroke="rgba(0,0,0,0.22)"       stroke-width="0.40"/>
    <line x1="21" y1="21" x2="16" y2="25" stroke="rgba(0,0,0,0.22)"       stroke-width="0.40"/>
    <ellipse cx="13" cy="7.5" rx="2.5" ry="1.5" fill="rgba(255,255,255,0.85)" transform="rotate(-38 13 7.5)"/>
  </svg>`,

  // 1 — Sapphire — hexagonal brilliant
  `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="rg1" cx="40%" cy="35%" r="52%">
        <stop offset="0%"   stop-color="#b0d8ff"/>
        <stop offset="48%"  stop-color="#1060f0"/>
        <stop offset="100%" stop-color="#000d4a"/>
      </radialGradient>
    </defs>
    <!-- outer hex: 16,2 / 27,8.5 / 27,23.5 / 16,30 / 5,23.5 / 5,8.5 -->
    <!-- inner hex (inset ~6): 16,8 / 22.2,11.5 / 22.2,20.5 / 16,24 / 9.8,20.5 / 9.8,11.5 -->
    <polygon points="16,2 27,8.5 27,23.5 16,30 5,23.5 5,8.5"          fill="#000d4a"/>
    <polygon points="16,2 9.8,11.5 16,8 22.2,11.5"                    fill="#c0e0ff"/>
    <polygon points="16,2 5,8.5 9.8,11.5"                             fill="#80b8f8"/>
    <polygon points="16,2 27,8.5 22.2,11.5"                           fill="#3878e0"/>
    <polygon points="5,8.5 5,23.5 9.8,20.5 9.8,11.5"                  fill="#6090e8"/>
    <polygon points="27,8.5 27,23.5 22.2,20.5 22.2,11.5"              fill="#1040a8"/>
    <polygon points="9.8,11.5 22.2,11.5 22.2,20.5 16,24 9.8,20.5"    fill="url(#rg1)"/>
    <polygon points="9.8,11.5 22.2,11.5 16,8"                         fill="#d0e8ff"/>
    <polygon points="5,23.5 16,30 9.8,20.5"                           fill="#4870d0"/>
    <polygon points="27,23.5 22.2,20.5 16,30"                         fill="#0830a0"/>
    <line x1="16"   y1="8"    x2="9.8"  y2="11.5" stroke="rgba(160,210,255,0.55)" stroke-width="0.55"/>
    <line x1="16"   y1="8"    x2="22.2" y2="11.5" stroke="rgba(160,210,255,0.45)" stroke-width="0.55"/>
    <line x1="9.8"  y1="11.5" x2="9.8"  y2="20.5" stroke="rgba(0,0,80,0.28)"     stroke-width="0.45"/>
    <line x1="22.2" y1="11.5" x2="22.2" y2="20.5" stroke="rgba(0,0,80,0.28)"     stroke-width="0.45"/>
    <line x1="9.8"  y1="20.5" x2="16"   y2="24"   stroke="rgba(0,0,80,0.22)"     stroke-width="0.40"/>
    <line x1="22.2" y1="20.5" x2="16"   y2="24"   stroke="rgba(0,0,80,0.22)"     stroke-width="0.40"/>
    <ellipse cx="12.5" cy="8" rx="3" ry="1.5" fill="rgba(255,255,255,0.82)" transform="rotate(-22 12.5 8)"/>
  </svg>`,

  // 2 — Emerald — octagon step cut
  `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="rg2" cx="42%" cy="35%" r="50%">
        <stop offset="0%"   stop-color="#b8ffe0"/>
        <stop offset="48%"  stop-color="#00b855"/>
        <stop offset="100%" stop-color="#003018"/>
      </radialGradient>
    </defs>
    <!-- outer oct: 11,2 21,2 30,11 30,21 21,30 11,30 2,21 2,11 -->
    <!-- mid ring:  9,6 23,6 27,11 27,21 23,26 9,26 5,21 5,11   -->
    <!-- inner table hex: 9,9 23,9 26,16 23,23 9,23 6,16         -->
    <polygon points="11,2 21,2 30,11 30,21 21,30 11,30 2,21 2,11" fill="#003018"/>
    <polygon points="11,2 21,2 23,6 9,6"    fill="#b0ffd8"/>
    <polygon points="21,2 30,11 27,11 23,6" fill="#28d870"/>
    <polygon points="11,2 2,11 5,11 9,6"    fill="#80ffb8"/>
    <polygon points="30,11 30,21 27,21 27,11" fill="#00a048"/>
    <polygon points="2,11 2,21 5,21 5,11"   fill="#68f8a0"/>
    <polygon points="30,21 21,30 23,26 27,21" fill="#009040"/>
    <polygon points="2,21 11,30 9,26 5,21"  fill="#00b050"/>
    <polygon points="11,30 21,30 23,26 9,26" fill="#007038"/>
    <polygon points="9,6 23,6 23,9 9,9"     fill="rgba(200,255,225,0.45)"/>
    <polygon points="9,9 23,9 26,16 23,23 9,23 6,16" fill="url(#rg2)"/>
    <line x1="9"  y1="6"  x2="23" y2="6"  stroke="rgba(180,255,220,0.62)" stroke-width="0.65"/>
    <line x1="9"  y1="9"  x2="23" y2="9"  stroke="rgba(180,255,220,0.50)" stroke-width="0.60"/>
    <line x1="5"  y1="11" x2="9"  y2="9"  stroke="rgba(180,255,220,0.40)" stroke-width="0.50"/>
    <line x1="27" y1="11" x2="23" y2="9"  stroke="rgba(0,60,25,0.30)"    stroke-width="0.50"/>
    <line x1="6"  y1="16" x2="9"  y2="9"  stroke="rgba(180,255,220,0.35)" stroke-width="0.50"/>
    <line x1="26" y1="16" x2="23" y2="9"  stroke="rgba(0,60,25,0.25)"    stroke-width="0.50"/>
    <line x1="6"  y1="16" x2="9"  y2="23" stroke="rgba(0,60,25,0.28)"    stroke-width="0.50"/>
    <line x1="26" y1="16" x2="23" y2="23" stroke="rgba(0,60,25,0.28)"    stroke-width="0.50"/>
    <line x1="9"  y1="23" x2="23" y2="23" stroke="rgba(0,60,25,0.42)"    stroke-width="0.60"/>
    <line x1="9"  y1="26" x2="23" y2="26" stroke="rgba(0,60,25,0.52)"    stroke-width="0.65"/>
    <ellipse cx="13" cy="6.5" rx="4" ry="1.5" fill="rgba(255,255,255,0.84)" transform="rotate(-5 13 6.5)"/>
  </svg>`,

  // 3 — Amber — pentagonal star rose cut
  `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="rg3" cx="40%" cy="35%" r="54%">
        <stop offset="0%"   stop-color="#fff0b0"/>
        <stop offset="45%"  stop-color="#f08000"/>
        <stop offset="100%" stop-color="#301000"/>
      </radialGradient>
    </defs>
    <!-- star: 16,2 19.6,12.2 30.5,12.2 21.7,18.6 25.3,28.8 16,22.4 6.7,28.8 10.3,18.6 1.5,12.2 12.4,12.2 -->
    <polygon points="16,2 19.6,12.2 30.5,12.2 21.7,18.6 25.3,28.8 16,22.4 6.7,28.8 10.3,18.6 1.5,12.2 12.4,12.2" fill="#301000"/>
    <polygon points="16,2 12.4,12.2 19.6,12.2"       fill="#ffe090"/>
    <polygon points="12.4,12.2 19.6,12.2 21.7,18.6 16,22.4 10.3,18.6" fill="url(#rg3)"/>
    <polygon points="12.4,12.2 19.6,12.2 16,15"      fill="#ffd060"/>
    <polygon points="1.5,12.2 12.4,12.2 10.3,18.6"   fill="#e08a20"/>
    <polygon points="30.5,12.2 21.7,18.6 19.6,12.2"  fill="#c06810"/>
    <polygon points="6.7,28.8 10.3,18.6 16,22.4"     fill="#b05c10"/>
    <polygon points="25.3,28.8 16,22.4 21.7,18.6"    fill="#8a3c04"/>
    <line x1="16"   y1="2"    x2="12.4" y2="12.2" stroke="rgba(255,210,100,0.55)" stroke-width="0.55"/>
    <line x1="16"   y1="2"    x2="19.6" y2="12.2" stroke="rgba(255,210,100,0.55)" stroke-width="0.55"/>
    <line x1="12.4" y1="12.2" x2="10.3" y2="18.6" stroke="rgba(0,0,0,0.22)"      stroke-width="0.45"/>
    <line x1="19.6" y1="12.2" x2="21.7" y2="18.6" stroke="rgba(0,0,0,0.22)"      stroke-width="0.45"/>
    <line x1="10.3" y1="18.6" x2="16"   y2="22.4" stroke="rgba(0,0,0,0.18)"      stroke-width="0.40"/>
    <line x1="21.7" y1="18.6" x2="16"   y2="22.4" stroke="rgba(0,0,0,0.18)"      stroke-width="0.40"/>
    <ellipse cx="14" cy="7.5" rx="2.5" ry="1.5" fill="rgba(255,255,255,0.84)" transform="rotate(-35 14 7.5)"/>
  </svg>`,

  // 4 — Amethyst — oval brilliant
  `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="rg4" cx="40%" cy="33%" r="52%">
        <stop offset="0%"   stop-color="#f0c0ff"/>
        <stop offset="48%"  stop-color="#8820d8"/>
        <stop offset="100%" stop-color="#160030"/>
      </radialGradient>
    </defs>
    <!-- oval cx=16 cy=16 rx=12 ry=14 -->
    <!-- 8 outer edge points: T(16,2) UR(24.5,6.1) R(28,16) LR(24.5,25.9) B(16,30) LL(7.5,25.9) L(4,16) UL(7.5,6.1) -->
    <!-- inner table: rx=6.5 ry=8; T(16,8) UR(20.6,10.3) R(22.5,16) LR(20.6,21.7) B(16,24) LL(11.4,21.7) L(9.5,16) UL(11.4,10.3) -->
    <ellipse cx="16" cy="16" rx="12" ry="14" fill="#160030"/>
    <!-- UL wedge (lit from top-left) -->
    <polygon points="16,2 7.5,6.1 4,16 9.5,16 11.4,10.3 16,8"     fill="#c870f0"/>
    <!-- UR wedge -->
    <polygon points="16,2 24.5,6.1 28,16 22.5,16 20.6,10.3 16,8"  fill="#6010c0"/>
    <!-- LL wedge -->
    <polygon points="4,16 7.5,25.9 16,30 16,24 11.4,21.7 9.5,16"  fill="#7020c8"/>
    <!-- LR wedge (darkest) -->
    <polygon points="28,16 24.5,25.9 16,30 16,24 20.6,21.7 22.5,16" fill="#280868"/>
    <!-- inner table glow -->
    <ellipse cx="16" cy="16" rx="6.5" ry="8" fill="url(#rg4)"/>
    <!-- crown top bar -->
    <polygon points="11.4,10.3 20.6,10.3 16,8"                    fill="rgba(245,200,255,0.84)"/>
    <line x1="16"   y1="8"  x2="9.5"  y2="16" stroke="rgba(180,100,255,0.42)" stroke-width="0.55"/>
    <line x1="16"   y1="8"  x2="22.5" y2="16" stroke="rgba(60,0,100,0.30)"    stroke-width="0.55"/>
    <line x1="9.5"  y1="16" x2="16"   y2="24" stroke="rgba(60,0,100,0.28)"    stroke-width="0.50"/>
    <line x1="22.5" y1="16" x2="16"   y2="24" stroke="rgba(60,0,100,0.22)"    stroke-width="0.50"/>
    <ellipse cx="12.5" cy="8" rx="3.5" ry="2" fill="rgba(255,255,255,0.82)" transform="rotate(-30 12.5 8)"/>
  </svg>`,
];

PM.POWER_SVG = {

  // Line burst — enhanced cross with orb core
  lance: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="lg" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stop-color="white"/>
        <stop offset="38%"  stop-color="#60d0ff"/>
        <stop offset="100%" stop-color="#0050a0" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <line x1="2"  y1="16" x2="30" y2="16" stroke="#80c8ff" stroke-width="5"   stroke-linecap="round" opacity="0.22"/>
    <line x1="16" y1="2"  x2="16" y2="30" stroke="#80c8ff" stroke-width="5"   stroke-linecap="round" opacity="0.22"/>
    <line x1="7"  y1="7"  x2="11" y2="11" stroke="rgba(120,210,255,0.55)" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="25" y1="25" x2="21" y2="21" stroke="rgba(120,210,255,0.55)" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="25" y1="7"  x2="21" y2="11" stroke="rgba(120,210,255,0.45)" stroke-width="1.0" stroke-linecap="round"/>
    <line x1="7"  y1="25" x2="11" y2="21" stroke="rgba(120,210,255,0.45)" stroke-width="1.0" stroke-linecap="round"/>
    <line x1="2"  y1="16" x2="30" y2="16" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="16" y1="2"  x2="16" y2="30" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="16" cy="16" r="6.5" fill="url(#lg)"/>
    <circle cx="16" cy="16" r="4"   fill="white"/>
    <circle cx="16" cy="16" r="2.5" fill="#1868f8"/>
    <ellipse cx="14.5" cy="14.5" rx="1.3" ry="0.8" fill="rgba(255,255,255,0.92)" transform="rotate(-35 14.5 14.5)"/>
  </svg>`,

  // Blast nova — enhanced starburst with warm core
  nova: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ng" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stop-color="white"/>
        <stop offset="38%"  stop-color="#ffe060"/>
        <stop offset="100%" stop-color="#ff6000" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="16" cy="16" r="14" fill="rgba(255,190,50,0.10)"/>
    <line x1="16" y1="2"  x2="16" y2="9"  stroke="#ffe080" stroke-width="4.5" stroke-linecap="round" opacity="0.20"/>
    <line x1="16" y1="23" x2="16" y2="30" stroke="#ffe080" stroke-width="4.5" stroke-linecap="round" opacity="0.20"/>
    <line x1="2"  y1="16" x2="9"  y2="16" stroke="#ffe080" stroke-width="4.5" stroke-linecap="round" opacity="0.20"/>
    <line x1="23" y1="16" x2="30" y2="16" stroke="#ffe080" stroke-width="4.5" stroke-linecap="round" opacity="0.20"/>
    <line x1="6"  y1="6"  x2="11" y2="11" stroke="#ffe080" stroke-width="3.5" stroke-linecap="round" opacity="0.16"/>
    <line x1="21" y1="21" x2="26" y2="26" stroke="#ffe080" stroke-width="3.5" stroke-linecap="round" opacity="0.16"/>
    <line x1="6"  y1="26" x2="11" y2="21" stroke="#ffe080" stroke-width="3.5" stroke-linecap="round" opacity="0.16"/>
    <line x1="21" y1="11" x2="26" y2="6"  stroke="#ffe080" stroke-width="3.5" stroke-linecap="round" opacity="0.16"/>
    <line x1="16" y1="2"  x2="16" y2="9"  stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="16" y1="23" x2="16" y2="30" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="2"  y1="16" x2="9"  y2="16" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="23" y1="16" x2="30" y2="16" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="6"  y1="6"  x2="11" y2="11" stroke="rgba(255,255,200,0.88)" stroke-width="2.2" stroke-linecap="round"/>
    <line x1="21" y1="21" x2="26" y2="26" stroke="rgba(255,255,200,0.88)" stroke-width="2.2" stroke-linecap="round"/>
    <line x1="6"  y1="26" x2="11" y2="21" stroke="rgba(255,255,200,0.88)" stroke-width="2.2" stroke-linecap="round"/>
    <line x1="21" y1="11" x2="26" y2="6"  stroke="rgba(255,255,200,0.88)" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="16" cy="16" r="7.5" fill="url(#ng)"/>
    <circle cx="16" cy="16" r="5"   fill="white"/>
    <circle cx="16" cy="16" r="3"   fill="#ffcc00"/>
    <ellipse cx="14.5" cy="14.5" rx="1.4" ry="0.9" fill="rgba(255,255,255,0.92)" transform="rotate(-35 14.5 14.5)"/>
  </svg>`,

  // PRISM — 3-D glass prism with rainbow dispersion
  prism: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pg" x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0%"   stop-color="rgba(255,255,255,0.96)"/>
        <stop offset="35%"  stop-color="rgba(215,232,255,0.74)"/>
        <stop offset="72%"  stop-color="rgba(175,202,255,0.54)"/>
        <stop offset="100%" stop-color="rgba(145,178,248,0.62)"/>
      </linearGradient>
    </defs>
    <!-- apex (16,2) base-left (3,25) base-right (29,25) -->
    <!-- deep shadow layer — gives the illusion of glass thickness -->
    <polygon points="16,2 3,25 29,25" fill="rgba(4,8,38,0.84)"/>
    <!-- main glass face -->
    <polygon points="16,2 3,25 29,25" fill="url(#pg)"/>
    <!-- left half — shadow side of glass -->
    <polygon points="16,2 3,25 16,25" fill="rgba(140,170,235,0.28)"/>
    <!-- right half — lit / reflected side -->
    <polygon points="16,2 29,25 16,25" fill="rgba(255,255,255,0.16)"/>
    <!-- left edge -->
    <line x1="16" y1="2" x2="3"  y2="25" stroke="rgba(200,222,255,0.62)" stroke-width="0.9"/>
    <!-- right edge — brighter (lit face) -->
    <line x1="16" y1="2" x2="29" y2="25" stroke="rgba(255,255,255,0.88)" stroke-width="1.1"/>
    <!-- base line -->
    <line x1="3"  y1="25" x2="29" y2="25" stroke="rgba(200,222,255,0.55)" stroke-width="0.75"/>
    <!-- interior horizontal caustic lines — simulate internal glass structure -->
    <line x1="11.0" y1="18" x2="21.0" y2="18" stroke="rgba(255,255,255,0.58)" stroke-width="0.78"/>
    <line x1="13.2" y1="12" x2="18.8" y2="12" stroke="rgba(255,255,255,0.42)" stroke-width="0.62"/>
    <line x1="14.6" y1="7"  x2="17.4" y2="7"  stroke="rgba(255,255,255,0.30)" stroke-width="0.50"/>
    <!-- incoming light ray (white light entering apex) -->
    <line x1="16" y1="2" x2="16" y2="0" stroke="rgba(255,255,255,0.75)" stroke-width="1.5" stroke-linecap="round"/>
    <!-- apex specular dot -->
    <circle cx="16" cy="2" r="1.4" fill="white" opacity="0.94"/>
    <!-- rainbow dispersion fan — fanning outward below base -->
    <line x1="5"  y1="25" x2="3"  y2="31" stroke="#ff2060" stroke-width="2.2" stroke-linecap="round"/>
    <line x1="8"  y1="25" x2="7"  y2="31" stroke="#ff8000" stroke-width="2.0" stroke-linecap="round"/>
    <line x1="11" y1="25" x2="11" y2="31" stroke="#ffd400" stroke-width="2.0" stroke-linecap="round"/>
    <line x1="14" y1="25" x2="15" y2="31" stroke="#00dd50" stroke-width="2.0" stroke-linecap="round"/>
    <line x1="17" y1="25" x2="18" y2="31" stroke="#1878ff" stroke-width="2.0" stroke-linecap="round"/>
    <line x1="20" y1="25" x2="22" y2="31" stroke="#9030e0" stroke-width="2.0" stroke-linecap="round"/>
    <line x1="23" y1="25" x2="26" y2="31" stroke="#e040a0" stroke-width="2.2" stroke-linecap="round"/>
  </svg>`,

  drone: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="9"  cy="7"  rx="7" ry="2.8" fill="none" stroke="white" stroke-width="1.8" transform="rotate(-30 9 7)"/>
    <ellipse cx="23" cy="7"  rx="7" ry="2.8" fill="none" stroke="white" stroke-width="1.8" transform="rotate(30 23 7)"/>
    <circle  cx="16" cy="16" r="4.5" fill="white"/>
    <circle  cx="16" cy="16" r="3"   fill="#ffa726"/>
    <line x1="11" y1="13" x2="16" y2="16" stroke="white" stroke-width="1.8"/>
    <line x1="21" y1="13" x2="16" y2="16" stroke="white" stroke-width="1.8"/>
    <line x1="16" y1="20" x2="16" y2="27" stroke="white" stroke-width="2"/>
    <circle cx="16" cy="28" r="2" fill="white" opacity="0.7"/>
  </svg>`,
};
