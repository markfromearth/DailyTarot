import React from 'react';
import { TarotCard } from '../types/tarot';

interface EyvindEarleCardArtProps {
  card: TarotCard;
}

const ROMAN_NUMERALS: Record<number, string> = {
  0: '0', 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII',
  8: 'VIII', 9: 'IX', 10: 'X', 11: 'XI', 12: 'XII', 13: 'XIII', 14: 'XIV',
  15: 'XV', 16: 'XVI', 17: 'XVII', 18: 'XVIII', 19: 'XIX', 20: 'XX', 21: 'XXI'
};

// Deterministic hash from card id so each of the 78 cards has unique foliage/cloud/mountain geometry
function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export const EyvindEarleCardArt: React.FC<EyvindEarleCardArtProps> = ({ card }) => {
  const seed = hashId(card.id);
  const uid = `ee-${card.id}`;
  const num = card.number ?? 1;

  // Jewel-toned palette selection per suit / arcana (Strictly Deep Indigo, Gold, Forest Green, Crimson)
  const getPalette = () => {
    if (card.arcana === 'major') {
      const variants = [
        { skyTop: '#0b102d', skyMid: '#1d194a', glow: '#f4c653', accent: '#9e1b32', hills: '#0e3a2f', ridge: '#081a24' },
        { skyTop: '#090d24', skyMid: '#4a1228', glow: '#f7d56e', accent: '#124e3f', hills: '#0b2922', ridge: '#06111c' },
        { skyTop: '#06181f', skyMid: '#133b35', glow: '#e8b948', accent: '#8c182b', hills: '#0f203c', ridge: '#070f21' },
      ];
      return variants[num % variants.length];
    }
    switch (card.suit) {
      case 'wands': // Crimson, Burnished Gold, Forest Green, Deep Indigo
        return { skyTop: '#110d2a', skyMid: '#6b1529', glow: '#f6c851', accent: '#b81d33', hills: '#113b2e', ridge: '#081726' };
      case 'cups': // Deep Indigo, Emerald, Shimmering Gold, Crimson accents
        return { skyTop: '#070d29', skyMid: '#132952', glow: '#f0c659', accent: '#8e1b30', hills: '#0d4034', ridge: '#061826' };
      case 'swords': // Midnight Indigo, Sharp Gold Backlight, Forest Cypress, Crimson
        return { skyTop: '#060a1e', skyMid: '#1b2248', glow: '#f7d87c', accent: '#96192c', hills: '#0d332a', ridge: '#050e1a' };
      case 'pentacles': // Lush Forest Green, Burnished Gold, Deep Indigo, Crimson
      default:
        return { skyTop: '#0a1626', skyMid: '#133d32', glow: '#f3c349', accent: '#9c1c30', hills: '#0d2d23', ridge: '#071422' };
    }
  };

  const pal = getPalette();

  // Generate Eyvind Earle signature horizontal striated clouds
  const renderStriatedClouds = () => {
    const yBase = 48 + (seed % 28);
    return (
      <g opacity="0.88">
        <path
          d={`M 12,${yBase} H 108 C 112,${yBase} 112,${yBase + 3} 104,${yBase + 3} H 22 C 16,${yBase + 3} 16,${yBase} 12,${yBase} Z`}
          fill={pal.glow}
          opacity="0.55"
        />
        <path
          d={`M 24,${yBase + 9} H 98 C 102,${yBase + 9} 102,${yBase + 11.5} 95,${yBase + 11.5} H 30 Z`}
          fill={pal.accent}
          opacity="0.7"
        />
        <path
          d={`M 16,${yBase + 16} H 86 C 90,${yBase + 16} 90,${yBase + 18} 82,${yBase + 18} H 20 Z`}
          fill="#0b1026"
          opacity="0.8"
        />
      </g>
    );
  };

  // Render suit/card specific central silhouette and action in Eyvind Earle's sharp geometric style
  const renderCentralSubject = () => {
    if (card.arcana === 'major') {
      switch (num) {
        case 0: // The Fool - cliff edge + leaping dog + sunrise
          return (
            <g>
              <circle cx="60" cy="84" r="24" fill={pal.glow} opacity="0.9" />
              <polygon points="10,165 58,108 58,165" fill="#050b16" />
              {/* Traveler Silhouette */}
              <path d="M44,110 L48,92 L53,92 L55,110 Z" fill="#050b16" />
              <circle cx="50.5" cy="88" r="3" fill="#050b16" />
              <line x1="42" y1="106" x2="58" y2="82" stroke={pal.glow} strokeWidth="1.2" />
              {/* White Dog */}
              <polygon points="57,106 63,101 65,104 59,108" fill={pal.glow} />
            </g>
          );
        case 1: // The Magician - raised wand + infinity + 4 symbols
          return (
            <g>
              <circle cx="60" cy="78" r="26" fill={pal.glow} opacity="0.85" />
              {/* Robed Silhouette */}
              <polygon points="50,148 55,90 65,90 70,148" fill="#050b16" />
              <polygon points="52,92 68,92 60,104" fill={pal.accent} />
              <circle cx="60" cy="84" r="4.5" fill="#050b16" />
              {/* Raised Wand */}
              <line x1="68" y1="96" x2="72" y2="66" stroke={pal.glow} strokeWidth="1.8" />
              <circle cx="72" cy="65" r="2.5" fill="#ffffff" />
              {/* Infinity Halo */}
              <path d="M55,76 C52,73 52,79 55,76 C58,73 62,79 65,76 C68,73 68,79 65,76 Z" stroke={pal.glow} strokeWidth="1" fill="none" />
            </g>
          );
        case 2: // The High Priestess - twin pillars + crescent moon
          return (
            <g>
              <rect x="24" y="42" width="10" height="112" fill="#060c1a" stroke={pal.glow} strokeWidth="0.7" />
              <rect x="86" y="42" width="10" height="112" fill="#102a24" stroke={pal.glow} strokeWidth="0.7" />
              <circle cx="60" cy="82" r="20" fill={pal.glow} opacity="0.9" />
              {/* Seated Priestess */}
              <polygon points="48,148 53,88 67,88 72,148" fill="#050b16" />
              <circle cx="60" cy="82" r="4.5" fill="#050b16" />
              {/* Crescent Crown */}
              <path d="M54,75 A6,6 0 0,0 66,75 A5,5 0 0,1 54,75 Z" fill={pal.glow} />
            </g>
          );
        case 16: // The Tower - spire + golden lightning + crimson flames
          return (
            <g>
              <polygon points="46,155 50,62 70,62 74,155" fill="#050b16" stroke={pal.glow} strokeWidth="0.6" />
              {/* Dislodged Crown */}
              <polygon points="48,56 72,50 68,42 52,46" fill={pal.glow} />
              {/* Jagged Lightning Bolt */}
              <polyline points="98,28 66,54 74,56 44,78" fill="none" stroke={pal.glow} strokeWidth="2.2" />
              {/* Crimson Flames */}
              <polygon points="50,68 38,58 46,76" fill={pal.accent} />
              <polygon points="70,68 84,56 73,76" fill={pal.accent} />
            </g>
          );
        case 17: // The Star - 8-pointed giant golden star + 7 stars + pool
          return (
            <g>
              <polygon
                points="60,36 65,56 85,61 65,66 60,86 55,66 35,61 55,56"
                fill={pal.glow}
              />
              <circle cx="60" cy="61" r="5" fill="#ffffff" />
              {/* 7 Smaller Stars */}
              {[
                [32, 42], [44, 34], [76, 34], [88, 42],
                [28, 68], [92, 68], [60, 26]
              ].map(([sx, sy], i) => (
                <polygon
                  key={i}
                  points={`${sx},${sy - 4} ${sx + 1.2},${sy - 1.2} ${sx + 4},${sy} ${sx + 1.2},${sy + 1.2} ${sx},${sy + 4} ${sx - 1.2},${sy + 1.2} ${sx - 4},${sy} ${sx - 1.2},${sy - 1.2}`}
                  fill={pal.glow}
                />
              ))}
            </g>
          );
        case 18: // The Moon - twin watchtowers + radiant crescent moon + winding path
          return (
            <g>
              <circle cx="60" cy="64" r="22" fill={pal.glow} />
              <circle cx="66" cy="61" r="16" fill={pal.skyMid} opacity="0.35" />
              {/* Twin Watchtowers */}
              <rect x="22" y="78" width="12" height="65" fill="#050b16" stroke={pal.glow} strokeWidth="0.5" />
              <rect x="86" y="78" width="12" height="65" fill="#050b16" stroke={pal.glow} strokeWidth="0.5" />
            </g>
          );
        case 19: // The Sun - monumental geometric sun + rays + sunflowers
          return (
            <g>
              <circle cx="60" cy="66" r="25" fill={pal.glow} />
              <circle cx="60" cy="66" r="31" fill="none" stroke={pal.glow} strokeWidth="1.2" strokeDasharray="3 2" />
              {Array.from({ length: 16 }).map((_, i) => {
                const a = (i * Math.PI) / 8;
                return (
                  <line
                    key={i}
                    x1={60 + Math.cos(a) * 26}
                    y1={66 + Math.sin(a) * 26}
                    x2={60 + Math.cos(a) * 44}
                    y2={66 + Math.sin(a) * 44}
                    stroke={pal.glow}
                    strokeWidth="1.1"
                  />
                );
              })}
            </g>
          );
        default: // Other Major Arcana: Iconic Earle Backlit Monolith / Figure & Celestial Halo
          return (
            <g>
              <circle cx="60" cy="74" r="24" fill={pal.glow} opacity="0.9" />
              <circle cx="60" cy="74" r="29" fill="none" stroke={pal.glow} strokeWidth="0.7" strokeDasharray="2 2" />
              {/* Gothic Arch / Throne Silhouette */}
              <path d="M42,150 L46,78 L60,60 L74,78 L78,150 Z" fill="#050b16" stroke={pal.glow} strokeWidth="0.7" />
              <polygon points="50,145 55,86 65,86 70,145" fill={pal.accent} opacity="0.85" />
              <circle cx="60" cy="76" r="5" fill={pal.glow} />
            </g>
          );
      }
    }

    // Minor Arcana: Render exact count (1-10) or Court Royal emblem in Eyvind Earle style
    const displayCount = Math.min(num, 10);
    const isCourt = num > 10;

    return (
      <g>
        {/* Glowing Backlight Sun/Moon Disc */}
        <circle cx="60" cy="74" r={isCourt ? 26 : 22} fill={pal.glow} opacity="0.88" />
        <circle cx="60" cy="74" r={isCourt ? 31 : 27} fill="none" stroke={pal.glow} strokeWidth="0.6" strokeDasharray="2 2" />

        {/* Court Crown / Throne Silhouette */}
        {isCourt && (
          <g>
            <polygon points="44,148 48,84 72,84 76,148" fill="#050b16" stroke={pal.glow} strokeWidth="0.7" />
            {/* Crown */}
            <polygon points="50,78 54,68 60,74 66,68 70,78" fill={pal.glow} stroke="#050b16" strokeWidth="0.5" />
          </g>
        )}

        {/* Suit Symbols Arranged in Geometric Symmetry */}
        {Array.from({ length: isCourt ? 1 : displayCount }).map((_, idx) => {
          const total = isCourt ? 1 : displayCount;
          const row = Math.floor(idx / 3);
          const col = idx % 3;
          const colsInRow = Math.min(3, total - row * 3);
          const cx = total === 1
            ? 60
            : 60 + (col - (colsInRow - 1) / 2) * 22;
          const cy = total === 1
            ? (isCourt ? 105 : 76)
            : 54 + row * 24;

          if (card.suit === 'wands') {
            return (
              <g key={idx} transform={`translate(${cx}, ${cy})`}>
                <line x1="0" y1="-12" x2="0" y2="14" stroke="#050b16" strokeWidth="2.4" />
                <line x1="0" y1="-12" x2="0" y2="14" stroke={pal.glow} strokeWidth="1.2" />
                {/* Sprouting Emerald & Crimson Leaves */}
                <polygon points="0,-8 6,-12 2,-5" fill="#156b4d" />
                <polygon points="0,-3 -6,-7 -2,0" fill={pal.accent} />
                <circle cx="0" cy="-13" r="1.8" fill={pal.glow} />
              </g>
            );
          }

          if (card.suit === 'cups') {
            return (
              <g key={idx} transform={`translate(${cx}, ${cy})`}>
                <path
                  d="M-6,-7 H6 C6,0 3,3 0,3 C-3,3 -6,0 -6,-7 Z M0,3 V9 M-4,9 H4"
                  fill={pal.accent}
                  stroke={pal.glow}
                  strokeWidth="1.3"
                />
              </g>
            );
          }

          if (card.suit === 'swords') {
            return (
              <g key={idx} transform={`translate(${cx}, ${cy})`}>
                <line x1="0" y1="-13" x2="0" y2="11" stroke={pal.glow} strokeWidth="1.6" />
                <line x1="-5" y1="5" x2="5" y2="5" stroke={pal.accent} strokeWidth="1.8" />
                <circle cx="0" cy="11" r="1.5" fill={pal.glow} />
              </g>
            );
          }

          // Pentacles
          return (
            <g key={idx} transform={`translate(${cx}, ${cy})`}>
              <circle cx="0" cy="0" r="7.5" fill="#050b16" stroke={pal.glow} strokeWidth="1.3" />
              <polygon
                points="0,-6 1.8,5 -5.5,-2 5.5,-2 -1.8,5"
                fill="none"
                stroke={pal.glow}
                strokeWidth="0.9"
              />
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <svg
      viewBox="0 0 120 200"
      className="w-full h-full select-none pointer-events-none"
      aria-label={card.name}
    >
      <defs>
        {/* Dramatic Atmospheric Backlight Gradient */}
        <linearGradient id={`${uid}-sky`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={pal.skyTop} />
          <stop offset="48%" stopColor={pal.skyMid} />
          <stop offset="78%" stopColor={pal.glow} />
          <stop offset="100%" stopColor={pal.ridge} />
        </linearGradient>

        {/* Gold Metallic Filigree Gradient */}
        <linearGradient id={`${uid}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4af37" />
          <stop offset="50%" stopColor="#f9e8a2" />
          <stop offset="100%" stopColor="#9e7a1c" />
        </linearGradient>

        {/* Clip Path for the Interior Artwork Frame */}
        <clipPath id={`${uid}-clip`}>
          <rect x="8" y="10" width="104" height="156" rx="4" />
        </clipPath>
      </defs>

      {/* Outer Dark Indigo Card Base */}
      <rect x="0" y="0" width="120" height="200" fill="#060919" />

      {/* Main Eyvind Earle Layered Scene */}
      <g clipPath={`url(#${uid}-clip)`}>
        {/* 1. Jewel-toned Sky & Glowing Horizon Backlight */}
        <rect x="8" y="10" width="104" height="156" fill={`url(#${uid}-sky)`} />

        {/* 2. Shimmering Stardust Motes in Upper Indigo Sky */}
        {Array.from({ length: 12 }).map((_, i) => {
          const sx = 14 + ((seed + i * 29) % 92);
          const sy = 15 + ((seed + i * 17) % 45);
          const r = i % 3 === 0 ? 1.1 : 0.6;
          return <circle key={i} cx={sx} cy={sy} r={r} fill={pal.glow} opacity="0.85" />;
        })}

        {/* 3. Striated Horizontal Clouds */}
        {renderStriatedClouds()}

        {/* 4. Central Subject & Action */}
        {renderCentralSubject()}

        {/* 5. Distant Serrated Indigo & Emerald Mountain Ridges */}
        <polygon
          points={`8,166 8,128 ${28 + (seed % 14)},${106 - (seed % 12)} 62,126 ${88 - (seed % 10)},${102 - (seed % 10)} 112,124 112,166`}
          fill={pal.hills}
          opacity="0.92"
        />
        {/* Rim-lit Golden Mountain Highlight */}
        <polyline
          points={`8,128 ${28 + (seed % 14)},${106 - (seed % 12)} 62,126 ${88 - (seed % 10)},${102 - (seed % 10)} 112,124`}
          fill="none"
          stroke={pal.glow}
          strokeWidth="0.7"
          opacity="0.75"
        />

        {/* 6. Midground Layered Emerald Hills & Winding Golden River */}
        <path
          d="M 8,142 Q 42,130 74,144 T 112,138 L 112,166 L 8,166 Z"
          fill={pal.ridge}
        />
        <path
          d="M 56,136 Q 66,146 48,154 T 68,166"
          fill="none"
          stroke={pal.glow}
          strokeWidth="1.2"
          opacity="0.65"
        />

        {/* 7. Foreground Eyvind Earle Geometric Trees & Perforated Foliage */}
        {/* Left Framing Tree & Horizontal Geometric Branches */}
        <path
          d="M 12,166 L 14,22 L 17,166 Z"
          fill="#040811"
        />
        <path
          d="M 15,38 H 36 M 15,52 H 28 M 14,26 H 44"
          stroke="#040811"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {/* Intricate Gold-Flecked Foliage Clusters */}
        <ellipse cx="28" cy="26" rx="14" ry="5" fill="#0d3d2f" stroke={pal.glow} strokeWidth="0.4" />
        <ellipse cx="26" cy="38" rx="11" ry="4" fill="#124e3c" stroke={pal.glow} strokeWidth="0.4" />

        {/* Right Framing Cypress / Geometric Tree */}
        <polygon points="102,166 105,64 109,166" fill="#040811" />
        <polygon points="96,166 98,92 101,166" fill="#0a2921" />
      </g>

      {/* Ornate Stylized Gold Filigree Frame */}
      <rect
        x="8"
        y="10"
        width="104"
        height="156"
        rx="4"
        fill="none"
        stroke={`url(#${uid}-gold)`}
        strokeWidth="1.4"
      />
      <rect
        x="10.5"
        y="12.5"
        width="99"
        height="151"
        rx="2.5"
        fill="none"
        stroke={`url(#${uid}-gold)`}
        strokeWidth="0.5"
        strokeDasharray="2 1.5"
      />

      {/* Top Numeral Badge */}
      <rect
        x="46"
        y="5"
        width="28"
        height="11"
        rx="3"
        fill="#060919"
        stroke={`url(#${uid}-gold)`}
        strokeWidth="0.9"
      />
      <text
        x="60"
        y="13"
        textAnchor="middle"
        fill="#f7e594"
        fontSize="6.5"
        fontFamily="Georgia, serif"
        letterSpacing="1"
      >
        {card.arcana === 'major' && card.number !== undefined
          ? ROMAN_NUMERALS[card.number]
          : card.rank?.toUpperCase()}
      </text>

      {/* Vintage Typography Title Banner at the Bottom */}
      <rect
        x="8"
        y="170"
        width="104"
        height="22"
        rx="3"
        fill="#090d20"
        stroke={`url(#${uid}-gold)`}
        strokeWidth="1.1"
      />
      <line x1="12" y1="173" x2="108" y2="173" stroke={`url(#${uid}-gold)`} strokeWidth="0.4" opacity="0.6" />
      <line x1="12" y1="189" x2="108" y2="189" stroke={`url(#${uid}-gold)`} strokeWidth="0.4" opacity="0.6" />
      <text
        x="60"
        y="183.5"
        textAnchor="middle"
        fill="#f6e3a1"
        fontSize="6.8"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="bold"
        letterSpacing="1.1"
      >
        {card.name.toUpperCase()}
      </text>
    </svg>
  );
};
