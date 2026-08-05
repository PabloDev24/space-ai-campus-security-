import { ChangeDetectionStrategy, Component } from '@angular/core';

/* Ilustración de la caseta universitaria. Va inline (no como archivo .svg)
   para que herede los tokens de color del tema claro/oscuro. */
@Component({
  selector: 'app-caseta-scene',
  template: `
    <svg
      viewBox="0 0 560 360"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Ilustración de una caseta de acceso universitario escaneando el código QR de un estudiante"
    >
      <defs>
        <pattern id="caseta-windows" width="24" height="28" patternUnits="userSpaceOnUse">
          <rect class="win" x="6" y="7" width="12" height="13" rx="2" />
        </pattern>
        <radialGradient id="caseta-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" class="glow-in" />
          <stop offset="100%" class="glow-out" />
        </radialGradient>
        <linearGradient id="caseta-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" class="glass-top" />
          <stop offset="100%" class="glass-bottom" />
        </linearGradient>
      </defs>

      <ellipse cx="380" cy="230" rx="180" ry="150" fill="url(#caseta-glow)" />

      <!-- Campus al fondo -->
      <g class="campus">
        <rect class="bldg" x="24" y="124" width="96" height="168" rx="4" />
        <rect x="24" y="124" width="96" height="168" fill="url(#caseta-windows)" />
        <rect class="bldg bldg--far" x="128" y="96" width="76" height="196" rx="4" />
        <rect x="128" y="96" width="76" height="196" fill="url(#caseta-windows)" />
        <rect class="bldg" x="212" y="142" width="64" height="150" rx="4" />
        <rect x="212" y="142" width="64" height="150" fill="url(#caseta-windows)" />
        <rect class="bldg bldg--far" x="474" y="120" width="70" height="172" rx="4" />
        <rect x="474" y="120" width="70" height="172" fill="url(#caseta-windows)" />
      </g>

      <!-- Árboles -->
      <g class="flora">
        <rect class="trunk" x="284" y="248" width="7" height="44" rx="3" />
        <circle class="leaf" cx="287" cy="238" r="21" />
        <circle class="leaf" cx="272" cy="248" r="14" />
        <circle class="leaf" cx="302" cy="248" r="14" />
        <rect class="trunk" x="462" y="252" width="7" height="40" rx="3" />
        <circle class="leaf" cx="465" cy="242" r="19" />
        <circle class="leaf" cx="452" cy="252" r="12" />
      </g>

      <!-- Suelo y andador -->
      <rect class="ground" x="0" y="292" width="560" height="68" />
      <path class="walk" d="M0 360 L0 336 L560 306 L560 360 Z" />
      <line class="ground-line" x1="0" y1="292" x2="560" y2="292" />

      <!-- Caseta -->
      <g class="booth">
        <rect class="sign" x="352" y="130" width="74" height="22" rx="7" />
        <circle class="sign-dot" cx="366" cy="141" r="5" />
        <rect class="sign-bar" x="378" y="137" width="34" height="4" rx="2" />
        <rect class="sign-bar sign-bar--short" x="378" y="145" width="22" height="4" rx="2" />

        <rect class="roof" x="316" y="154" width="146" height="20" rx="5" />
        <rect class="body" x="330" y="174" width="118" height="118" rx="6" />
        <rect class="glass" x="344" y="190" width="90" height="56" rx="4" />
        <rect class="counter" x="336" y="248" width="106" height="7" rx="3" />
        <rect class="door" x="356" y="262" width="44" height="30" rx="3" />
        <circle class="knob" cx="393" cy="278" r="2.6" />
      </g>

      <!-- Lector QR sobre pedestal -->
      <g class="reader">
        <rect class="pole" x="300" y="264" width="10" height="28" rx="4" />
        <ellipse class="pole-base" cx="305" cy="292" rx="16" ry="4" />
        <rect class="panel" x="290" y="222" width="30" height="50" rx="7" />
        <g class="panel-qr">
          <rect x="296" y="230" width="7" height="7" rx="1.5" />
          <rect x="307" y="230" width="7" height="7" rx="1.5" />
          <rect x="296" y="241" width="7" height="7" rx="1.5" />
          <rect x="307" y="243" width="4" height="4" rx="1" />
          <rect x="296" y="253" width="18" height="3" rx="1.5" />
          <rect x="296" y="259" width="11" height="3" rx="1.5" />
        </g>
      </g>

      <!-- Pluma levantada (casi vertical, libre del andador) -->
      <g class="barrier">
        <rect class="post" x="262" y="256" width="17" height="36" rx="5" />
        <ellipse class="post-base" cx="270" cy="292" rx="19" ry="5" />
        <g transform="rotate(-18 270 256)">
          <rect class="arm" x="266" y="150" width="9" height="108" rx="4" />
          <rect class="arm-stripe" x="266" y="162" width="9" height="16" />
          <rect class="arm-stripe" x="266" y="194" width="9" height="16" />
          <rect class="arm-stripe" x="266" y="226" width="9" height="16" />
        </g>
      </g>

      <!-- Estudiante con su QR -->
      <g class="student">
        <circle class="head" cx="168" cy="230" r="13" />
        <rect class="torso" x="153" y="242" width="30" height="50" rx="12" />
        <rect class="bag" x="181" y="252" width="12" height="28" rx="6" />
        <path class="arm-limb" d="M180 258 q14 2 19 -6" />
        <rect class="phone" x="196" y="232" width="27" height="42" rx="6" />
        <g class="phone-qr">
          <rect x="201" y="238" width="6" height="6" rx="1" />
          <rect x="212" y="238" width="6" height="6" rx="1" />
          <rect x="201" y="249" width="6" height="6" rx="1" />
          <rect x="212" y="250" width="4" height="4" rx="1" />
          <rect x="201" y="260" width="17" height="3" rx="1.5" />
          <rect x="201" y="266" width="10" height="3" rx="1.5" />
        </g>
      </g>

      <!-- Haz de lectura -->
      <path class="beam" d="M226 248 H286" />
      <circle class="beam-dot" cx="288" cy="248" r="3.5" />
    </svg>
  `,
  styles: `
    :host {
      display: block;
    }
    svg {
      width: 100%;
      height: auto;
    }

    .glow-in {
      stop-color: var(--primary);
      stop-opacity: 0.16;
    }
    .glow-out {
      stop-color: var(--primary);
      stop-opacity: 0;
    }
    .glass-top {
      stop-color: var(--primary);
      stop-opacity: 0.4;
    }
    .glass-bottom {
      stop-color: var(--primary);
      stop-opacity: 0.14;
    }

    /* El campus se atenúa para que la caseta y el estudiante lean como primer plano. */
    .campus {
      opacity: 0.72;
    }
    .flora {
      opacity: 0.85;
    }

    .bldg {
      fill: color-mix(in oklab, var(--primary) 12%, var(--card));
      stroke: color-mix(in oklab, var(--primary) 22%, var(--border));
    }
    .bldg--far {
      fill: color-mix(in oklab, var(--primary) 7%, var(--card));
    }
    .win {
      fill: color-mix(in oklab, var(--primary) 26%, transparent);
    }

    .trunk {
      fill: color-mix(in oklab, var(--foreground) 34%, transparent);
    }
    .leaf {
      fill: color-mix(in oklab, var(--chip-emerald) 40%, transparent);
    }

    .ground {
      fill: color-mix(in oklab, var(--primary) 6%, var(--secondary));
    }
    .walk {
      fill: color-mix(in oklab, var(--card) 70%, var(--secondary));
    }
    .ground-line {
      stroke: color-mix(in oklab, var(--primary) 18%, var(--border));
      stroke-width: 1.5;
    }

    .roof,
    .sign {
      fill: var(--primary);
    }
    .sign-dot,
    .sign-bar {
      fill: var(--primary-foreground);
    }
    .sign-bar--short {
      opacity: 0.6;
    }
    .body {
      fill: var(--card);
      stroke: color-mix(in oklab, var(--primary) 26%, var(--border));
      stroke-width: 1.5;
    }
    .glass {
      fill: url(#caseta-glass);
      stroke: color-mix(in oklab, var(--primary) 34%, transparent);
    }
    .counter {
      fill: color-mix(in oklab, var(--primary) 22%, var(--secondary));
    }
    .door {
      fill: color-mix(in oklab, var(--primary) 10%, var(--secondary));
      stroke: color-mix(in oklab, var(--primary) 20%, var(--border));
    }
    .knob {
      fill: var(--primary);
    }

    .pole,
    .post {
      fill: color-mix(in oklab, var(--foreground) 62%, transparent);
    }
    .pole-base,
    .post-base {
      fill: color-mix(in oklab, var(--foreground) 16%, transparent);
    }
    .panel {
      fill: color-mix(in oklab, var(--foreground) 88%, transparent);
    }
    .panel-qr rect {
      fill: var(--primary);
    }
    .arm {
      fill: var(--card);
      stroke: color-mix(in oklab, var(--foreground) 40%, transparent);
    }
    .arm-stripe {
      fill: var(--destructive);
      opacity: 0.85;
    }

    .head,
    .torso,
    .bag {
      fill: color-mix(in oklab, var(--foreground) 70%, transparent);
    }
    .bag {
      fill: color-mix(in oklab, var(--primary) 62%, transparent);
    }
    .arm-limb {
      fill: none;
      stroke: color-mix(in oklab, var(--foreground) 70%, transparent);
      stroke-width: 9;
      stroke-linecap: round;
    }
    .phone {
      fill: var(--card);
      stroke: color-mix(in oklab, var(--foreground) 40%, transparent);
      stroke-width: 1.5;
    }
    .phone-qr rect {
      fill: var(--primary);
    }

    .beam {
      fill: none;
      stroke: var(--primary);
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-dasharray: 7 8;
      animation: beam-travel 1.4s linear infinite;
    }
    .beam-dot {
      fill: var(--primary);
      animation: beam-pulse 1.4s ease-in-out infinite;
    }

    @keyframes beam-travel {
      to {
        stroke-dashoffset: -30;
      }
    }
    @keyframes beam-pulse {
      50% {
        opacity: 0.35;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CasetaScene {}
