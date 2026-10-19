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
        case 11: // Justice - crowned figure, upright sword & balanced scales
          return (
            <g>
              <circle cx="60" cy="74" r="25" fill={pal.glow} opacity="0.88" />
              {/* Twin Gothic Pillars */}
              <rect x="22" y="44" width="8" height="110" fill="#050b16" stroke={pal.glow} strokeWidth="0.6" />
              <rect x="90" y="44" width="8" height="110" fill="#050b16" stroke={pal.glow} strokeWidth="0.6" />
              {/* Seated Judge */}
              <polygon points="46,148 52,86 68,86 74,148" fill="#050b16" />
              <circle cx="60" cy="80" r="4.5" fill="#050b16" />
              <polygon points="56,74 60,68 64,74" fill={pal.glow} />
              {/* Upright Sword */}
              <line x1="72" y1="62" x2="72" y2="98" stroke={pal.glow} strokeWidth="1.8" />
              <line x1="68" y1="72" x2="76" y2="72" stroke={pal.glow} strokeWidth="1.6" />
              {/* Balanced Scales */}
              <line x1="40" y1="76" x2="52" y2="76" stroke={pal.glow} strokeWidth="1.4" />
              <polygon points="38,82 42,82 40,76" fill={pal.glow} />
              <polygon points="50,82 54,82 52,76" fill={pal.glow} />
            </g>
          );
        case 12: // The Hanged Man - inverted figure on living T-tree + halo
          return (
            <g>
              {/* Living T-Tree */}
              <path d="M20,44 H100 V52 H64 V155 H56 V52 H20 Z" fill="#050b16" stroke={pal.glow} strokeWidth="0.6" />
              {/* Pointillist leaf clusters */}
              <circle cx="28" cy="40" r="3" fill="#156b4d" />
              <circle cx="92" cy="40" r="3" fill="#156b4d" />
              {/* Halo Around Head at bottom */}
              <circle cx="60" cy="116" r="14" fill={pal.glow} opacity="0.9" />
              {/* Suspended Inverted Figure */}
              <line x1="60" y1="52" x2="60" y2="72" stroke="#050b16" strokeWidth="2.5" />
              <polygon points="56,72 64,72 62,106 58,106" fill="#050b16" />
              {/* Crossed Leg */}
              <line x1="60" y1="84" x2="72" y2="92" stroke="#050b16" strokeWidth="2.2" />
              <circle cx="60" cy="114" r="4.5" fill="#050b16" />
            </g>
          );
        case 13: // Death - armored rider, white steed, rose banner & twin distant towers
          return (
            <g>
              {/* Blazing Sun Between Twin Towers on Horizon */}
              <circle cx="60" cy="76" r="18" fill={pal.glow} />
              <rect x="42" y="72" width="6" height="38" fill="#050b16" />
              <rect x="72" y="72" width="6" height="38" fill="#050b16" />
              {/* Steed & Rider Profile Silhouette */}
              <path d="M26,140 C34,120 48,118 64,124 L76,118 L74,128 L62,132 L58,148 H50 L52,136 L38,148 Z" fill="#050b16" />
              {/* Rider Armor */}
              <polygon points="46,124 50,102 56,102 58,124" fill="#050b16" />
              <circle cx="53" cy="98" r="3.5" fill="#050b16" />
              {/* Banner with Mystic Rose */}
              <line x1="58" y1="92" x2="58" y2="136" stroke={pal.glow} strokeWidth="1.5" />
              <polygon points="58,92 84,98 58,106" fill="#050b16" stroke={pal.glow} strokeWidth="0.5" />
              <circle cx="70" cy="99" r="2.2" fill="#ffffff" />
            </g>
          );
        case 14: // Temperance - winged angel pouring liquid between chalices
          return (
            <g>
              <circle cx="60" cy="68" r="26" fill={pal.glow} opacity="0.88" />
              {/* Archangel Wings */}
              <path d="M60,82 C44,56 22,66 28,94 C38,88 50,86 60,88 Z" fill={pal.accent} opacity="0.85" />
              <path d="M60,82 C76,56 98,66 92,94 C82,88 70,86 60,88 Z" fill={pal.accent} opacity="0.85" />
              {/* Angelic Robe */}
              <polygon points="52,148 56,86 64,86 68,148" fill="#050b16" />
              <circle cx="60" cy="80" r="4.5" fill="#050b16" />
              {/* Stream of Liquid Between Chalices */}
              <path d="M48,96 Q60,102 72,108" fill="none" stroke={pal.glow} strokeWidth="2" strokeDasharray="3 1" />
              <polygon points="46,92 52,92 49,98" fill={pal.glow} />
              <polygon points="70,106 76,106 73,112" fill={pal.glow} />
            </g>
          );
        case 15: // The Devil - horned monolith, inverted pentagram & flame altar
          return (
            <g>
              {/* Altar Cube */}
              <rect x="44" y="118" width="32" height="32" fill="#050b16" stroke={pal.accent} strokeWidth="0.8" />
              {/* Horned Beast Silhouette */}
              <path d="M46,118 L52,78 L68,78 L74,118 Z" fill="#050b16" />
              <circle cx="60" cy="74" r="5" fill="#050b16" />
              {/* Curved Horns & Bat Wings */}
              <path d="M57,70 C52,60 44,62 46,68" stroke={pal.glow} strokeWidth="1.6" fill="none" />
              <path d="M63,70 C68,60 76,62 74,68" stroke={pal.glow} strokeWidth="1.6" fill="none" />
              <polygon points="60,80 34,70 42,92" fill={pal.accent} opacity="0.8" />
              <polygon points="60,80 86,70 78,92" fill={pal.accent} opacity="0.8" />
              {/* Inverted Pentagram */}
              <polygon points="60,63 56,53 65,58 55,58 64,53" fill="none" stroke={pal.glow} strokeWidth="0.8" />
              {/* Chained Companions */}
              <polygon points="32,150 36,128 40,150" fill="#050b16" />
              <polygon points="80,150 84,128 88,150" fill="#050b16" />
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
        case 20: // Judgement - winged angel blowing golden trumpet from clouds + rising figures
          return (
            <g>
              <circle cx="60" cy="54" r="28" fill={pal.glow} opacity="0.85" />
              {/* Archangel Gabriel Wings in Clouds */}
              <path d="M60,60 C40,40 18,50 24,78 C36,72 48,70 60,72 Z" fill={pal.accent} opacity="0.9" />
              <path d="M60,60 C80,40 102,50 96,78 C84,72 72,70 60,72 Z" fill={pal.accent} opacity="0.9" />
              <circle cx="60" cy="56" r="4.5" fill="#050b16" />
              {/* Golden Bannered Trumpet */}
              <line x1="60" y1="56" x2="78" y2="76" stroke={pal.glow} strokeWidth="2.2" strokeLinecap="round" />
              <polygon points="78,76 84,72 82,82" fill={pal.glow} />
              {/* Crimson Banner */}
              <polygon points="68,66 74,72 70,78 64,72" fill={pal.accent} />
              {/* Diagonal Light Shafts */}
              <line x1="60" y1="64" x2="30" y2="135" stroke={pal.glow} strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
              <line x1="60" y1="64" x2="60" y2="140" stroke={pal.glow} strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
              <line x1="60" y1="64" x2="90" y2="135" stroke={pal.glow} strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
              {/* Rising Figures with Arms Outstretched */}
              <path d="M36,155 L40,132 L44,155 Z" fill="#050b16" />
              <circle cx="40" cy="128" r="2.5" fill="#050b16" />
              <line x1="36" y1="134" x2="44" y2="134" stroke="#050b16" strokeWidth="1.2" />

              <path d="M56,155 L60,126 L64,155 Z" fill="#050b16" />
              <circle cx="60" cy="122" r="3" fill="#050b16" />
              <line x1="55" y1="128" x2="65" y2="128" stroke="#050b16" strokeWidth="1.4" />

              <path d="M76,155 L80,132 L84,155 Z" fill="#050b16" />
              <circle cx="80" cy="128" r="2.5" fill="#050b16" />
              <line x1="76" y1="134" x2="84" y2="134" stroke="#050b16" strokeWidth="1.2" />
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

    // Five of Wands: Five dynamic silhouetted figures crossing five living staffs in a spirited geometric lattice of motion atop a rocky hillside
    if (card.suit === 'wands' && num === 5) {
      return (
        <g>
          {/* Glowing sunset disc and embers */}
          <circle cx="60" cy="78" r="28" fill={pal.glow} opacity="0.9" />
          <circle cx="60" cy="78" r="34" fill="none" stroke={pal.glow} strokeWidth="0.6" strokeDasharray="3 3" opacity="0.6" />

          {/* Jagged hilltop ledge */}
          <polygon points="12,165 35,130 85,128 108,165" fill="#050b16" />
          <polygon points="28,165 42,136 78,134 92,165" fill={pal.accent} opacity="0.3" />

          {/* 5 Dynamic Silhouetted Figures */}
          <path d="M26,145 L32,122 L36,122 L38,145 Z" fill="#050b16" />
          <circle cx="34" cy="119" r="2.8" fill="#050b16" />

          <path d="M42,148 L46,120 L50,120 L53,148 Z" fill="#050b16" />
          <circle cx="48" cy="117" r="2.8" fill="#050b16" />

          <path d="M57,144 L60,116 L64,116 L66,144 Z" fill="#050b16" />
          <circle cx="62" cy="113" r="3" fill="#050b16" />

          <path d="M70,148 L73,121 L77,121 L81,148 Z" fill="#050b16" />
          <circle cx="75" cy="118" r="2.8" fill="#050b16" />

          <path d="M84,146 L88,124 L92,124 L96,146 Z" fill="#050b16" />
          <circle cx="90" cy="121" r="2.8" fill="#050b16" />

          {/* 5 Crossing Living Staffs with Sprouting Leaves & Golden Embers */}
          <line x1="28" y1="138" x2="82" y2="44" stroke="#050b16" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="28" y1="138" x2="82" y2="44" stroke={pal.glow} strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="82" cy="44" r="2.2" fill={pal.glow} />
          <polygon points="55,90 60,86 58,94" fill="#156b4d" />

          <line x1="92" y1="138" x2="38" y2="44" stroke="#050b16" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="92" y1="138" x2="38" y2="44" stroke={pal.glow} strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="38" cy="44" r="2.2" fill={pal.glow} />
          <polygon points="65,90 60,86 62,94" fill="#156b4d" />

          <line x1="42" y1="145" x2="72" y2="38" stroke="#050b16" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="42" y1="145" x2="72" y2="38" stroke={pal.glow} strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="72" cy="38" r="2.2" fill={pal.glow} />
          <polygon points="57,91 62,88 59,96" fill={pal.accent} />

          <line x1="78" y1="145" x2="48" y2="38" stroke="#050b16" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="78" y1="145" x2="48" y2="38" stroke={pal.glow} strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="48" cy="38" r="2.2" fill={pal.glow} />
          <polygon points="63,91 58,88 61,96" fill={pal.accent} />

          <line x1="60" y1="148" x2="60" y2="34" stroke="#050b16" strokeWidth="3" strokeLinecap="round" />
          <line x1="60" y1="148" x2="60" y2="34" stroke={pal.glow} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="60" cy="34" r="2.5" fill={pal.glow} />
          <polygon points="60,60 66,56 63,64" fill="#156b4d" />
          <polygon points="60,78 54,74 57,82" fill={pal.accent} />

          {/* Windswept shrubs below */}
          <path d="M18,162 C22,154 28,154 32,162 Z" fill="#0b2922" />
          <path d="M88,162 C92,152 98,152 102,162 Z" fill="#0b2922" />
        </g>
      );
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
