import React from 'react';

interface CardBackProps {
  className?: string;
}

export const CardBack: React.FC<CardBackProps> = ({ className = '' }) => {
  const [imageError, setImageError] = React.useState(false);

  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={`w-full h-full bg-[#060817] select-none pointer-events-none relative overflow-hidden flex items-center justify-center ${className}`}
    >
      {!imageError ? (
        <img
          src="/cards/card_back.png"
          alt="Tarot Card Back"
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setImageError(true)}
        />
      ) : (
        /* Eyvind Earle Celestial Paper Collage Vector Card Back */
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 300 480"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient
              id="cb-sky"
              x1="150"
              y1="0"
              x2="150"
              y2="480"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#050714" />
              <stop offset="25%" stopColor="#0a0f2b" />
              <stop offset="50%" stopColor="#141a45" />
              <stop offset="75%" stopColor="#0a0f2b" />
              <stop offset="100%" stopColor="#050714" />
            </linearGradient>

            <linearGradient
              id="cb-gold"
              x1="0"
              y1="0"
              x2="300"
              y2="480"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#f7d478" />
              <stop offset="35%" stopColor="#cba135" />
              <stop offset="70%" stopColor="#fae29c" />
              <stop offset="100%" stopColor="#9e751d" />
            </linearGradient>

            <linearGradient
              id="cb-gold-bright"
              x1="150"
              y1="180"
              x2="150"
              y2="300"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#fff5d1" />
              <stop offset="50%" stopColor="#e5b842" />
              <stop offset="100%" stopColor="#b3821a" />
            </linearGradient>

            <linearGradient
              id="cb-emerald"
              x1="0"
              y1="0"
              x2="0"
              y2="480"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#071c16" />
              <stop offset="50%" stopColor="#0e3328" />
              <stop offset="100%" stopColor="#071c16" />
            </linearGradient>

            <linearGradient
              id="cb-crimson"
              x1="0"
              y1="240"
              x2="300"
              y2="240"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#7a1426" stopOpacity="0" />
              <stop offset="50%" stopColor="#9e1b32" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#7a1426" stopOpacity="0" />
            </linearGradient>

            <radialGradient
              id="cb-center-glow"
              cx="150"
              cy="240"
              r="110"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#f5cf6d" stopOpacity="0.22" />
              <stop offset="50%" stopColor="#171e54" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#050714" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width="300" height="480" fill="url(#cb-sky)" />
          <circle cx="150" cy="240" r="140" fill="url(#cb-center-glow)" />

          <path d="M20 160 Q150 148 280 160 Q150 172 20 160 Z" fill="url(#cb-crimson)" />
          <path
            d="M30 200 Q150 190 270 200 Q150 210 30 200 Z"
            fill="url(#cb-crimson)"
            opacity="0.6"
          />
          <path
            d="M30 280 Q150 270 270 280 Q150 290 30 280 Z"
            fill="url(#cb-crimson)"
            opacity="0.6"
          />
          <path d="M20 320 Q150 308 280 320 Q150 332 20 320 Z" fill="url(#cb-crimson)" />

          <g fill="url(#cb-emerald)">
            <path d="M24 20 L40 95 L26 95 L34 140 L16 140 L24 20 Z" opacity="0.75" />
            <path d="M48 20 L62 85 L50 85 L56 125 L40 125 L48 20 Z" opacity="0.55" />
            <path d="M276 20 L260 95 L274 95 L266 140 L284 140 L276 20 Z" opacity="0.75" />
            <path d="M252 20 L238 85 L250 85 L244 125 L260 125 L252 20 Z" opacity="0.55" />

            <path d="M24 460 L40 385 L26 385 L34 340 L16 340 L24 460 Z" opacity="0.75" />
            <path d="M48 460 L62 395 L50 395 L56 355 L40 355 L48 460 Z" opacity="0.55" />
            <path d="M276 460 L260 385 L274 385 L266 340 L284 340 L276 460 Z" opacity="0.75" />
            <path d="M252 460 L238 395 L250 395 L244 355 L260 355 L252 460 Z" opacity="0.55" />
          </g>

          <g fill="#f5cf6d" opacity="0.7">
            <circle cx="32" cy="70" r="1" />
            <circle cx="28" cy="110" r="1.2" />
            <circle cx="54" cy="65" r="0.9" />
            <circle cx="268" cy="70" r="1" />
            <circle cx="272" cy="110" r="1.2" />
            <circle cx="246" cy="65" r="0.9" />
            <circle cx="32" cy="410" r="1" />
            <circle cx="28" cy="370" r="1.2" />
            <circle cx="54" cy="415" r="0.9" />
            <circle cx="268" cy="410" r="1" />
            <circle cx="272" cy="370" r="1.2" />
            <circle cx="246" cy="415" r="0.9" />
          </g>

          <g fill="#fff6dc">
            <circle cx="70" cy="50" r="1.5" opacity="0.8" />
            <circle cx="230" cy="50" r="1.5" opacity="0.8" />
            <circle cx="70" cy="430" r="1.5" opacity="0.8" />
            <circle cx="230" cy="430" r="1.5" opacity="0.8" />

            <circle cx="100" cy="80" r="1" opacity="0.6" />
            <circle cx="200" cy="80" r="1" opacity="0.6" />
            <circle cx="100" cy="400" r="1" opacity="0.6" />
            <circle cx="200" cy="400" r="1" opacity="0.6" />

            <circle cx="55" cy="180" r="1.2" opacity="0.7" />
            <circle cx="245" cy="180" r="1.2" opacity="0.7" />
            <circle cx="55" cy="300" r="1.2" opacity="0.7" />
            <circle cx="245" cy="300" r="1.2" opacity="0.7" />

            <circle cx="85" cy="240" r="1.5" opacity="0.8" />
            <circle cx="215" cy="240" r="1.5" opacity="0.8" />
            <circle cx="150" cy="115" r="1.8" opacity="0.9" />
            <circle cx="150" cy="365" r="1.8" opacity="0.9" />
          </g>

          <g stroke="url(#cb-gold)" strokeWidth="0.75" opacity="0.65">
            <line x1="150" y1="110" x2="150" y2="120" />
            <line x1="145" y1="115" x2="155" y2="115" />
            <line x1="150" y1="360" x2="150" y2="370" />
            <line x1="145" y1="365" x2="155" y2="365" />
            <line x1="85" y1="235" x2="85" y2="245" />
            <line x1="80" y1="240" x2="90" y2="240" />
            <line x1="215" y1="235" x2="215" y2="245" />
            <line x1="210" y1="240" x2="220" y2="240" />
          </g>

          <rect
            x="12"
            y="12"
            width="276"
            height="456"
            rx="10"
            stroke="url(#cb-gold)"
            strokeWidth="1.5"
            fill="none"
            opacity="0.85"
          />

          <rect
            x="18"
            y="18"
            width="264"
            height="444"
            rx="7"
            stroke="url(#cb-gold)"
            strokeWidth="0.85"
            strokeDasharray="4 2"
            fill="none"
            opacity="0.6"
          />

          <rect
            x="23"
            y="23"
            width="254"
            height="434"
            rx="5"
            stroke="url(#cb-gold)"
            strokeWidth="0.65"
            fill="none"
            opacity="0.4"
          />

          <g stroke="url(#cb-gold)" strokeWidth="1" fill="none" opacity="0.8">
            <path d="M14 36 L36 14 M18 44 L44 18" />
            <polygon points="30,30 33,27 36,30 33,33" fill="url(#cb-gold)" />
            <path d="M286 36 L264 14 M282 44 L256 18" />
            <polygon points="270,30 267,27 264,30 267,33" fill="url(#cb-gold)" />
            <path d="M14 444 L36 466 M18 436 L44 462" />
            <polygon points="30,450 33,447 36,450 33,453" fill="url(#cb-gold)" />
            <path d="M286 444 L264 466 M282 436 L256 462" />
            <polygon points="270,450 267,447 264,450 267,453" fill="url(#cb-gold)" />
          </g>

          <circle
            cx="150"
            cy="240"
            r="76"
            stroke="url(#cb-gold)"
            strokeWidth="0.75"
            strokeDasharray="3 3"
            opacity="0.5"
          />
          <circle cx="150" cy="240" r="70" stroke="url(#cb-gold)" strokeWidth="1.2" opacity="0.7" />
          <circle
            cx="150"
            cy="240"
            r="64"
            stroke="url(#cb-gold)"
            strokeWidth="0.6"
            opacity="0.45"
          />

          <g fill="url(#cb-gold)" opacity="0.75">
            <circle cx="150" cy="170" r="2" />
            <circle cx="150" cy="310" r="2" />
            <circle cx="80" cy="240" r="2" />
            <circle cx="220" cy="240" r="2" />
            <circle cx="100.5" cy="190.5" r="1.5" />
            <circle cx="199.5" cy="190.5" r="1.5" />
            <circle cx="100.5" cy="289.5" r="1.5" />
            <circle cx="199.5" cy="289.5" r="1.5" />
          </g>

          <g fill="none" stroke="url(#cb-gold)" strokeWidth="1.1" opacity="0.8">
            <path
              d="M128 194 Q150 216 172 194 Q150 205 128 194 Z"
              fill="url(#cb-gold)"
              fillOpacity="0.25"
            />
            <path
              d="M128 286 Q150 264 172 286 Q150 275 128 286 Z"
              fill="url(#cb-gold)"
              fillOpacity="0.25"
            />
            <path
              d="M104 218 Q126 240 104 262 Q115 240 104 218 Z"
              fill="url(#cb-gold)"
              fillOpacity="0.25"
            />
            <path
              d="M196 218 Q174 240 196 262 Q185 240 196 218 Z"
              fill="url(#cb-gold)"
              fillOpacity="0.25"
            />
          </g>

          <g fill="url(#cb-gold)" opacity="0.55">
            <polygon points="150,186 156,234 204,240 156,246 150,294 144,246 96,240 144,234" />
            <polygon
              points="150,198 162,228 192,240 162,252 150,282 138,252 108,240 138,228"
              transform="rotate(45 150 240)"
            />
          </g>

          <g stroke="url(#cb-gold-bright)" strokeWidth="0.5">
            <polygon points="150,174 154,236 150,240 146,236" fill="url(#cb-gold-bright)" />
            <polygon points="150,306 154,244 150,240 146,244" fill="url(#cb-gold)" />
            <polygon points="84,240 146,236 150,240 146,244" fill="url(#cb-gold)" />
            <polygon points="216,240 154,236 150,240 154,244" fill="url(#cb-gold-bright)" />

            <polygon points="103,193 147,237 150,240 145,243" fill="url(#cb-gold-bright)" />
            <polygon points="197,287 153,243 150,240 155,237" fill="url(#cb-gold)" />
            <polygon points="197,193 153,237 150,240 155,243" fill="url(#cb-gold-bright)" />
            <polygon points="103,287 147,243 150,240 145,237" fill="url(#cb-gold)" />
          </g>

          <circle
            cx="150"
            cy="240"
            r="14"
            fill="#090d26"
            stroke="url(#cb-gold-bright)"
            strokeWidth="1.2"
          />
          <polygon points="150,230 157,240 150,250 143,240" fill="url(#cb-gold-bright)" />
          <polygon points="150,234 154,240 150,246 146,240" fill="#ffffff" />
        </svg>
      )}

      {/* Subtle metallic gold/champagne sheen on hover/tilt */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background:
            'linear-gradient(130deg, transparent 32%, rgba(235, 215, 165, 0.55) 49%, rgba(255, 250, 235, 0.4) 51%, transparent 68%)',
        }}
      />
    </div>
  );
};
