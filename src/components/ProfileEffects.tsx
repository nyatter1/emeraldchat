import React, { useEffect, useState } from 'react';

// Define the custom types for Profile Effects and Combos
export interface ProfileEffect {
  id: string;
  name: string;
  description: string;
  tagline: string;
  category: 'cyber' | 'nature' | 'cosmic' | 'premium' | 'retro' | 'mystic' | 'classic';
}

export interface ProfileCombo {
  id: string;
  name: string;
  borderId: string;
  effectId: string;
  badge: string;
  themeColor: string;
}

// 25+ Premium Visual Effects definition list
export const PROFILE_EFFECTS: ProfileEffect[] = [
  { id: 'none', name: 'No Effect', description: 'Clean slate style', tagline: 'Unadorned simplicity.', category: 'classic' },
  { id: 'matrix', name: 'Simulation Code', description: 'Digital green binary code sequence cascade', tagline: 'Welcome to the simulation.', category: 'cyber' },
  { id: 'sepia', name: 'Sepia Cinema', description: 'Vintage film filters and grain scratches', tagline: 'Nostalgic golden-era photography.', category: 'retro' },
  { id: 'cookie', name: 'Cookie Crumble', description: 'Falling gold chocolate crumble pieces', tagline: 'Sweet, buttery chocolate treats.', category: 'nature' },
  { id: 'blizzard', name: 'Blizzard', description: 'Ice blue wind and snowstorm overlay', tagline: 'Sub-zero arctic conditions.', category: 'nature' },
  { id: 'sakura', name: 'Cherry Blossoms', description: 'Soft slow drifting floral petals', tagline: 'Serenity of a spring garden.', category: 'nature' },
  { id: 'nebula', name: 'Nebula', description: 'Deep space starlight cloud animation', tagline: 'Lost in the interstellar dust.', category: 'cosmic' },
  { id: 'inferno', name: 'Fire Embers', description: 'Dark volcanic ash with rising heat embers', tagline: 'Forged in the fiery volcanic pits.', category: 'nature' },
  { id: 'toxic', name: 'Sludge Bubbles', description: 'Radioactive neon chemical bubble waste', tagline: 'Danger: Exposure level critical.', category: 'cyber' },
  { id: 'royal_sparkles', name: 'Gold Sparkles', description: 'Luxury dynamic dust and star glints', tagline: 'Wealth of the sovereign kingdom.', category: 'premium' },
  { id: 'water_ripple', name: 'Water Ripple', description: 'Calming moving aquatic caustic waves', tagline: 'Deep plunge in gentle tidal pools.', category: 'nature' },
  { id: 'magma', name: 'Magma Pulse', description: 'Moving orange hot tectonic basalt cracks', tagline: 'Molten earth shifting below.', category: 'nature' },
  { id: 'psychedelic', name: 'Psychedelic Gradient', description: 'Smooth colorful fluid moving vector gradients', tagline: 'Mind-bending chromatic shifts.', category: 'mystic' },
  { id: 'ectoplasm', name: 'Ectoplasm', description: 'Mysterious trailing green smoke threads', tagline: 'Spiritual anomalies detected.', category: 'mystic' },
  { id: 'tv_static', name: 'Screen Static', description: 'Classic analog screen buzz grayscale distortion', tagline: 'Please stand by.', category: 'retro' },
  { id: 'hyperspace', name: 'Starfield Travel', description: 'Warp speedlines radiating outwards', tagline: 'Light-speed travel initiated.', category: 'cosmic' },
  { id: 'hearts', name: 'Cascading Hearts', description: 'Romantic falling dark red heart shapes', tagline: 'Sending sweet love and high vibes.', category: 'classic' },
  { id: 'confetti', name: 'Confetti Blast', description: 'Showered with multicolored paper circles', tagline: 'Let us celebrate!', category: 'classic' },
  { id: 'ocean_bubble', name: 'Sea Bubbles', description: 'Deep water dark blue with custom rising bubbles', tagline: 'Calm ocean tides beneath.', category: 'nature' },
  { id: 'synthwave', name: 'Synthwave Grid', description: 'Vibrant wireframe horizontal perspective grid', tagline: 'Sunset drive along the digital coast.', category: 'retro' },
  { id: 'amethyst', name: 'Laser Beams', description: 'Intense horizontal amethyst laser beams', tagline: 'Charged with gem-energy lasers.', category: 'premium' },
  { id: 'void', name: 'Void Mist', description: 'Dark pulsing event horizon nebula mist', tagline: 'No light can escape.', category: 'cosmic' },
  { id: 'lightning', name: 'Tempest Lightning', description: 'Storm clouds with flashing lightning strikes', tagline: 'The thunder gods speak.', category: 'nature' },
  { id: 'candy', name: 'Sweet Sprinkles', description: 'Falling sugar sprinkles on strawberry backdrop', tagline: 'Coated in sprinkles and joy.', category: 'classic' },
  { id: 'fireflies', name: 'Fireflies', description: 'Orbiting yellow glow points in dense fog', tagline: 'Magical swamp night lights.', category: 'nature' },
  { id: 'diamond', name: 'Diamond Shards', description: 'Iridescent glistening silver diamond pieces', tagline: 'Sparkle bright like a flawless gem.', category: 'premium' },
  { id: 'pixel_dungeon', name: 'Pixel Quest', description: 'Stone bricks and floating gold diamond tokens', tagline: 'Your quest begins now.', category: 'retro' },
  { id: 'cyberpunk', name: 'Node Network', description: 'Cyber circuit boards with moving packets', tagline: 'Data is the new currency.', category: 'cyber' },
  { id: 'binary', name: 'Binary Code', description: 'Rain lines of computer zero and one code digits', tagline: 'Reading the raw core files.', category: 'cyber' },
  { id: 'glitch', name: 'RGB Glitch', description: 'Distorted rgb color separations', tagline: 'System error detected.', category: 'cyber' },
  { id: 'blood_moon', name: 'Blood Moon', description: 'Crimson horror drips and haze', tagline: 'The harvest begins tonight.', category: 'mystic' },
  { id: 'butterflies', name: 'Monarch Butterflies', description: 'Floating elegant violet butterflies', tagline: 'Gentle wings in the breeze.', category: 'nature' },
  { id: 'hologram', name: 'Holographic Scan', description: 'Sci-fi horizontal tracking scanner', tagline: 'Scanning biometrics.', category: 'cyber' },
  { id: 'enchanted_fireflies', name: 'Enchanted Fireflies', description: 'Glowing yellow light orbs hovering in the night', tagline: 'A calm summer night.', category: 'mystic' },
  { id: 'rain', name: 'Midnight Rain', description: 'Fast diagonal rain drops against dark glass', tagline: 'Stormy weather.', category: 'nature' },
  { id: 'party_confetti', name: 'Party Confetti', description: 'Colorful popping shapes floating down', tagline: 'Celebration time.', category: 'premium' },
  { id: 'aurora', name: 'Aurora Borealis', description: 'Shifting northern lights green and purple', tagline: 'Magnetic atmosphere.', category: 'cosmic' },
];

// Curated Matching Combos presets
export const PROFILE_COMBOS: ProfileCombo[] = [
  {
    id: 'hacker_gladiator',
    name: 'Matrix Decryptor',
    borderId: 'cyber-matrix',
    effectId: 'matrix',
    badge: 'DECRYPTOR',
    themeColor: '#10b981'
  },
  {
    id: 'royal_monarch',
    name: 'Imperial Royalty',
    borderId: 'royal-gold',
    effectId: 'royal_sparkles',
    badge: 'ROYALTY',
    themeColor: '#fbbf24'
  },
  {
    id: 'cyberpunk_runner',
    name: 'Cyber Neon Runner',
    borderId: 'vaporwave-80s',
    effectId: 'cyberpunk',
    badge: 'NETRUNNER',
    themeColor: '#d946ef'
  },
  {
    id: 'void_emperor',
    name: 'Sovereign Void Overlord',
    borderId: 'abyssal-void',
    effectId: 'void',
    badge: 'OVERLORD',
    themeColor: '#18181b'
  },
  {
    id: 'glacier_titan',
    name: 'Sub-Zero Glacier Frost',
    borderId: 'frozen-glacier',
    effectId: 'blizzard',
    badge: 'FROSTBITE',
    themeColor: '#67e8f9'
  },
  {
    id: 'bio_sludge',
    name: 'Radioactive Waste',
    borderId: 'toxic-waste',
    effectId: 'toxic',
    badge: 'BIOHAZARD',
    themeColor: '#84cc16'
  },
  {
    id: 'sakura_princess',
    name: 'Sakura Dynasty',
    borderId: 'bubblegum-pink',
    effectId: 'sakura',
    badge: 'DYNASTY',
    themeColor: '#f472b6'
  },
  {
    id: 'magma_berserker',
    name: 'Volcanic Tectonic Fire',
    borderId: 'crimson-flare',
    effectId: 'magma',
    badge: 'INFERNAL',
    themeColor: '#ef4444'
  },
  {
    id: 'abyssal_bubble',
    name: 'Deep Sea Abyssal Lord',
    borderId: 'ocean-spray',
    effectId: 'ocean_bubble',
    badge: 'ATLANTIS',
    themeColor: '#06b6d4'
  },
  {
    id: 'candy_unicorn',
    name: 'Sweet Cotton Candy',
    borderId: 'cotton-candy',
    effectId: 'candy',
    badge: 'SWEETNESS',
    themeColor: '#f472b6'
  },
  {
    id: 'glitch_entity',
    name: 'System Error 404',
    borderId: 'hologram',
    effectId: 'glitch',
    badge: 'CORRUPTED',
    themeColor: '#ef4444'
  },
  {
    id: 'vampire_lord',
    name: 'Crimson Vampire',
    borderId: 'overlord',
    effectId: 'blood_moon',
    badge: 'IMMORTAL',
    themeColor: '#991b1b'
  },
  {
    id: 'cyber_hacker',
    name: 'Cybernetic Hacker',
    borderId: 'neon-emerald',
    effectId: 'cyberpunk',
    badge: 'SYSTEM',
    themeColor: '#10b981'
  },
  {
    id: 'midnight_storm',
    name: 'Midnight Storm',
    borderId: 'rainbow-wave',
    effectId: 'rain',
    badge: 'STORM',
    themeColor: '#3b82f6'
  },
  {
    id: 'party_legend',
    name: 'Legendary Party',
    borderId: 'royal-gold',
    effectId: 'party_confetti',
    badge: 'FESTIVE',
    themeColor: '#fbbf24'
  },
  {
    id: 'cosmic_aurora',
    name: 'Northern Aura',
    borderId: 'cosmic-purple',
    effectId: 'aurora',
    badge: 'CELESTIAL',
    themeColor: '#a855f7'
  },
];

// CSS Keyframes representing rich and reliable CSS-based animations
export const EFFECTS_KEYFRAMES = `
@keyframes scanHolo {
  0%, 100% { transform: translateY(-100%); opacity: 0; }
  10% { opacity: 0.8; }
  50% { transform: translateY(300px); opacity: 0.8; }
  60% { opacity: 0; }
}
@keyframes butterflyFly {
  0% { transform: translate(0, 300px) rotate(-15deg) scale(0.6); opacity: 0; }
  20% { opacity: 0.9; }
  80% { opacity: 0.9; }
  100% { transform: translate(60px, -50px) rotate(15deg) scale(1.1); opacity: 0; }
}
@keyframes rgbGlitchAnim {
  0%, 100% { transform: translate(0); text-shadow: -2px 0 red, 2px 0 cyan; }
  20% { transform: translate(-2px, 1px); text-shadow: 2px 0 red, -2px 0 cyan; }
  40% { transform: translate(2px, -1px); text-shadow: -2px 0 red, 2px 0 cyan; }
  60% { transform: translate(1px, 2px); text-shadow: 2px 0 red, -2px 0 cyan; opacity: 0.9; }
  80% { transform: translate(-1px, -2px); text-shadow: -2px 0 red, 2px 0 cyan; opacity: 1; }
}
@keyframes rainDrop {
  0% { transform: translate(0, -50px) rotate(15deg); opacity: 0; }
  10% { opacity: 0.6; }
  90% { opacity: 0.6; }
  100% { transform: translate(-30px, 400px) rotate(15deg); opacity: 0; }
}
@keyframes fireflyFloat {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
  25% { transform: translate(15px, -15px) scale(1.3); opacity: 0.9; box-shadow: 0 0 15px #fef08a; }
  50% { transform: translate(0, -30px) scale(1); opacity: 0.6; }
  75% { transform: translate(-15px, -15px) scale(1.2); opacity: 0.9; box-shadow: 0 0 15px #fef08a; }
}
@keyframes confettiFall {
  0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(400px) rotate(720deg); opacity: 0; }
}
@keyframes auroraShift {
  0%, 100% { background-position: 0% 50%; opacity: 0.3; }
  50% { background-position: 100% 50%; opacity: 0.6; transform: scale(1.1) rotate(5deg); }
}
@keyframes scrollBgY {
  0% { background-position: 0 0; }
  100% { background-position: 0 400px; }
}
@keyframes scratchShift {
  0%, 100% { transform: translateX(0); opacity: 0.15; }
  25% { transform: translateX(20px); opacity: 0.25; }
  50% { transform: translateX(-15px); opacity: 0.1; }
  75% { transform: translateX(35px); opacity: 0.3; }
}
@keyframes fallCrumb {
  0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
  15% { opacity: 0.9; }
  90% { opacity: 0.8; }
  100% { transform: translateY(350px) rotate(360deg); opacity: 0; }
}
@keyframes sakuraSpin {
  0% { transform: translate(0, -20px) rotate(0deg); opacity: 0; }
  10% { opacity: 0.85; }
  90% { opacity: 0.75; }
  100% { transform: translate(60px, 350px) rotate(480deg); opacity: 0; }
}
@keyframes toxicBubbleUp {
  0% { transform: translateY(340px) scale(0.6); opacity: 0; }
  20% { opacity: 0.85; }
  85% { opacity: 0.85; }
  100% { transform: translateY(-20px) scale(1.1); opacity: 0; }
}
@keyframes royalSparklePulse {
  0%, 100% { transform: scale(0.7); opacity: 0.3; filter: drop-shadow(0 0 1px #fbbf24); }
  50% { transform: scale(1.2); opacity: 1; filter: drop-shadow(0 0 5px #fbbf24); }
}
@keyframes oceanBubbleUp {
  0% { transform: translateY(340px) translateX(0); opacity: 0; }
  20% { opacity: 0.65; }
  80% { opacity: 0.65; }
  100% { transform: translateY(-20px) translateX(15px); opacity: 0; }
}
@keyframes cosmicStarlight {
  0%, 100% { transform: scale(0.6); opacity: 0.4; }
  50% { transform: scale(1.1); opacity: 1; }
}
@keyframes magmaPulsing {
  0%, 100% { opacity: 0.65; filter: saturate(1.1); }
  50% { opacity: 0.95; filter: saturate(1.4); }
}
@keyframes ghostSmokeUp {
  0% { transform: translateY(340px) skewX(-10deg) scale(0.8); opacity: 0; filter: blur(3px); }
  30% { opacity: 0.7; }
  75% { opacity: 0.5; }
  100% { transform: translateY(-30px) skewX(20deg) scale(1.4); opacity: 0; filter: blur(8px); }
}
@keyframes staticScreen {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-1%, -1%); }
  20% { transform: translate(-2%, 2%); }
  35% { transform: translate(1%, -3%); }
  50% { transform: translate(-2%, 1%); }
  65% { transform: translate(3%, -1%); }
  80% { transform: translate(-1%, 3%); }
}
@keyframes speedStar {
  0% { transform: translate(-50%, -50%) scale(0.1) rotate(0deg); opacity: 0; }
  10% { opacity: 0.9; }
  100% { transform: translate(-50%, -50%) scale(3.5) rotate(45deg); opacity: 0; }
}
@keyframes heartPulseFloat {
  0% { transform: translateY(340px) scale(0.7) rotate(0deg); opacity: 0; }
  15% { opacity: 0.85; }
  85% { opacity: 0.85; }
  100% { transform: translateY(-25px) scale(1.1) rotate(25deg); opacity: 0; }
}
@keyframes synthGridMove {
  0% { transform: perspective(220px) rotateX(60deg) translateY(0); }
  100% { transform: perspective(220px) rotateX(60deg) translateY(24px); }
}
@keyframes laserStrikeH {
  0%, 94%, 100% { opacity: 0; transform: translateY(0); }
  95%, 98% { opacity: 0.85; transform: translateY(15px); }
}
@keyframes stormRain {
  0% { background-position: 0 0; }
  100% { background-position: 80px 400px; }
}
@keyframes lightningFlashBolt {
  0%, 96%, 100% { opacity: 0; }
  97%, 99% { opacity: 0.55; }
}
@keyframes fireflyOrbit {
  0% { transform: translate(0, 0) scale(0.8); opacity: 0.3; }
  25% { transform: translate(25px, -20px) scale(1.1); opacity: 0.9; }
  50% { transform: translate(45px, 10px) scale(0.8); opacity: 0.4; }
  75% { transform: translate(15px, 35px) scale(1.1); opacity: 0.9; }
  100% { transform: translate(0, 0) scale(0.8); opacity: 0.3; }
}
`;

// Helper component for matrix drops
const MatrixDrops = () => {
  const dropsCount = 10;
  return (
    <div className="absolute inset-0 bg-zinc-950 flex justify-around pointer-events-none select-none z-0 overflow-hidden">
      {Array.from({ length: dropsCount }).map((_, i) => {
        const duration = 2.5 + (i % 3) * 1.5;
        const delay = (i % 4) * 0.8;
        const letters = Array.from({ length: 15 }).map(() => String.fromCharCode(48 + Math.floor(Math.random() * 45))).join('\n');
        return (
          <div
            key={i}
            className="text-[9px] font-mono leading-none text-emerald-500 text-opacity-80 writing-mode-vertical filter blur-[0.4px]"
            style={{
              animation: `slideDown ${duration}s infinite linear`,
              animationDelay: `${delay}s`,
              writingMode: 'vertical-rl',
              textShadow: '0 0 5px #10b981',
              transform: 'translateY(-100%)',
            }}
          >
            {letters}
          </div>
        );
      })}
    </div>
  );
};

// Component that renders the exact 28 effects dynamically
export const ProfileEffectRenderer = ({ effectId }: { effectId: string }) => {
  if (!effectId || effectId === 'none') return null;

  switch (effectId) {
    case 'matrix':
      return <MatrixDrops />;

    case 'sepia': {
      return (
        <div className="absolute inset-0 bg-amber-950/20 pointer-events-none overflow-hidden select-none z-0 border border-transparent rounded-2xl filter sepia contrast-[1.1] brightness-[0.85] mix-blend-color-burn">
          {/* Dust and Film scratches overlay */}
          <div className="absolute inset-y-0 w-[1px] bg-amber-800/45 left-[30%]" style={{ animation: 'scratchShift 4s infinite linear' }} />
          <div className="absolute inset-y-0 w-[1.5px] bg-amber-900/35 left-[75%]" style={{ animation: 'scratchShift 6s infinite ease-out' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 rounded-2xl" />
        </div>
      );
    }

    case 'cookie': {
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/60 to-amber-950/90 pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          {/* Falling Cookie Crumbs */}
          {Array.from({ length: 12 }).map((_, i) => {
            const size = 3 + (i % 3) * 3;
            const left = (i * 8.5) % 100;
            const delay = (i * 0.4) % 4;
            const duration = 3 + (i % 3) * 2;
            return (
              <div
                key={i}
                className="absolute bg-amber-600 rounded-full shadow-[0_0_4px_rgba(217,119,6,0.5)] flex items-center justify-center font-bold"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${left}%`,
                  top: '-10px',
                  animation: `fallCrumb ${duration}s infinite linear`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/70 mix-blend-multiply" />
        </div>
      );
    }

    case 'blizzard': {
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-sky-950/80 via-cyan-900/50 to-zinc-950 pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          {/* Blizzard Snowflakes */}
          {Array.from({ length: 15 }).map((_, i) => {
            const symbols = ['❄', '✧', '*', '•'];
            const glyph = symbols[i % symbols.length];
            const size = 10 + (i % 3) * 4;
            const left = (i * 7.5) % 95;
            const delay = (i * 0.3) % 4.5;
            const duration = 4 + (i % 3) * 2;
            return (
              <div
                key={i}
                className="absolute text-cyan-200 font-bold opacity-80"
                style={{
                  fontSize: `${size}px`,
                  left: `${left}%`,
                  top: '-20px',
                  filter: 'drop-shadow(0 0 3px #99f6e4)',
                  animation: `fallCrumb ${duration}s infinite linear`,
                  animationDelay: `${delay}s`,
                }}
              >
                {glyph}
              </div>
            );
          })}
        </div>
      );
    }

    case 'sakura': {
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-pink-950/70 via-rose-900/40 to-zinc-950/90 pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          {/* Floating Sakura Petals */}
          {Array.from({ length: 14 }).map((_, i) => {
            const symbols = ['❀', '✿'];
            const glyph = symbols[i % symbols.length];
            const size = 12 + (i % 3) * 5;
            const left = (i * 8.5) % 95;
            const delay = i * 0.5;
            const duration = 5 + (i % 3) * 3;
            return (
              <div
                key={i}
                className="absolute opacity-80"
                style={{
                  fontSize: `${size}px`,
                  left: `${left}%`,
                  top: '-20px',
                  animation: `sakuraSpin ${duration}s infinite linear`,
                  animationDelay: `${delay}s`,
                }}
              >
                {glyph}
              </div>
            );
          })}
        </div>
      );
    }

    case 'nebula': {
      return (
        <div className="absolute inset-0 bg-zinc-950 pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          {/* Moving Gradient Nebula mesh */}
          <div className="absolute inset-[-40px] bg-[radial-gradient(circle_at_20%_30%,#a855f7,transparent_60%),radial-gradient(circle_at_80%_70%,#06b6d4,transparent_65%)] opacity-35 animate-[pulse_6s_infinite_alternate]" />
          {Array.from({ length: 10 }).map((_, i) => {
            const size = 2 + (i % 2) * 2;
            const x = (i * 13) % 100;
            const y = (i * 17) % 100;
            const delay = i * 0.4;
            return (
              <div
                key={i}
                className="absolute rounded-full bg-white shadow-[0_0_8px_#ffffff]"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${x}%`,
                  top: `${y}%`,
                  animation: `cosmicStarlight 3s infinite ease-in-out`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </div>
      );
    }

    case 'inferno': {
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/60 to-zinc-950 pointer-events-none overflow-hidden select-none z-0 rounded-2xl border border-transparent">
          {/* Combustion backdrop */}
          <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-red-600/40 to-transparent blur-md" />
          {/* Fire Sparks Rising */}
          {Array.from({ length: 15 }).map((_, i) => {
            const symbol = i % 3 === 0 ? '✦' : '•';
            const size = symbol === '✦' ? 12 : 7;
            const left = (i * 9) % 95;
            const delay = i * 0.3;
            const duration = 2.5 + (i % 3) * 1.5;
            return (
              <div
                key={i}
                className="absolute text-orange-400 font-black opacity-85"
                style={{
                  fontSize: `${size}px`,
                  left: `${left}%`,
                  bottom: '-25px',
                  filter: 'drop-shadow(0 0 4px #ff5500)',
                  animation: `toxicBubbleUp ${duration}s infinite linear`,
                  animationDelay: `${delay}s`,
                }}
              >
                {symbol}
              </div>
            );
          })}
        </div>
      );
    }

    case 'toxic': {
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-lime-950/40 to-zinc-950/95 pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          {/* Sludge glow */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-lime-500/10 blur-xl" />
          {/* Rising bubbles */}
          {Array.from({ length: 12 }).map((_, i) => {
            const size = 10 + (i % 3) * 6;
            const left = (i * 9) % 90;
            const delay = i * 0.4;
            const duration = 3.5 + (i % 2) * 1.5;
            return (
              <div
                key={i}
                className="absolute border border-lime-500/50 rounded-full bg-lime-500/10 text-center text-lime-400 font-extrabold flex items-center justify-center"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${left}%`,
                  bottom: '-20px',
                  fontSize: '8px',
                  boxShadow: '0 0 6px rgba(132, 204, 22, 0.4), inset 0 0 2px rgba(132, 204, 22, 0.2)',
                  animation: `toxicBubbleUp ${duration}s infinite linear`,
                  animationDelay: `${delay}s`,
                }}
              >
                ☣
              </div>
            );
          })}
        </div>
      );
    }

    case 'royal_sparkles': {
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/40 via-[#18181b]/35 to-[#141416] pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          {/* Flawless Gold Stars and Sparkle particles */}
          {Array.from({ length: 12 }).map((_, i) => {
            const symbols = ['✧', '✦'];
            const glyph = symbols[i % symbols.length];
            const size = 12 + (i % 3) * 6;
            const left = (i * 14) % 90;
            const top = (i * 11) % 90;
            const delay = i * 0.35;
            return (
              <div
                key={i}
                className="absolute text-amber-400"
                style={{
                  fontSize: `${size}px`,
                  left: `${left}%`,
                  top: `${top}%`,
                  animation: `royalSparklePulse 2.8s infinite ease-in-out`,
                  animationDelay: `${delay}s`,
                }}
              >
                {glyph}
              </div>
            );
          })}
        </div>
      );
    }

    case 'water_ripple': {
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/60 to-zinc-950 pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          {/* Water caustic ripples */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12)_0%,transparent_60%)] animate-[pulse_4s_infinite_alternate]" />
          {/* Aquatic waves */}
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,transparent_45%,#06b6d4_49%,#06b6d4_51%,transparent_55%)] bg-[length:30px_30px]" style={{ animation: 'scrollBgY 15s infinite linear' }} />
        </div>
      );
    }

    case 'magma': {
      return (
        <div className="absolute inset-0 bg-zinc-950 pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          {/* Molten crack backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,#fb923c,transparent_70%)] opacity-35" />
          {/* Tectonic magma glowing line fractures */}
          <div
            className="absolute inset-0 border border-transparent opacity-80"
            style={{
              backgroundImage: `repeating-linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0px, rgba(239, 68, 68, 0.1) 10px, rgba(249, 115, 22, 0.2) 10px, rgba(249, 115, 22, 0.2) 20px)`,
              animation: 'magmaPulsing 4s infinite ease-in-out',
            }}
          />
        </div>
      );
    }

    case 'psychedelic': {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          {/* Mind-shifting fluid waves */}
          <div className="absolute inset-[-40px] bg-[linear-gradient(217deg,#e879f9,rgba(255,0,0,0)_70.71%),linear-gradient(127deg,#06b6d4,rgba(0,255,0,0)_70.71%),linear-gradient(336deg,#f472b6,rgba(0,0,255,0)_70.71%)] opacity-40 animate-[spin_10s_infinite_linear]" />
        </div>
      );
    }

    case 'ectoplasm': {
      return (
        <div className="absolute inset-0 bg-[#09090b] pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          {/* Wispy floating smoke shapes */}
          {Array.from({ length: 6 }).map((_, i) => {
            const width = 45 + (i % 3) * 20;
            const height = 45 + (i % 3) * 20;
            const left = (i * 22) % 80;
            const delay = i * 1.5;
            const duration = 5 + (i % 2) * 3;
            return (
              <div
                key={i}
                className="absolute bg-emerald-500/25 rounded-full filter blur-xl shadow-[0_0_15px_#10b981]"
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                  left: `${left}%`,
                  bottom: '-50px',
                  animation: `ghostSmokeUp ${duration}s infinite ease-in-out`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </div>
      );
    }

    case 'tv_static': {
      return (
        <div className="absolute inset-0 bg-zinc-950 pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          <div
            className="absolute inset-0 opacity-[0.16] bg-[radial-gradient(circle_at_center,#fff_1px,transparent_1px)] bg-[length:5px_5px]"
            style={{
              animation: 'staticScreen 0.25s infinite steps(4)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80" />
        </div>
      );
    }

    case 'hyperspace': {
      return (
        <div className="absolute inset-0 bg-zinc-950 pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          {/* Exploding star speed lines */}
          {Array.from({ length: 8 }).map((_, i) => {
            const rotation = i * 45;
            const delay = (i % 3) * 0.4;
            return (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent origin-left opacity-0"
                style={{
                  transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                  animation: `speedStar 2s infinite linear`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </div>
      );
    }

    case 'hearts': {
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-rose-950/50 via-[#18181b]/20 to-zinc-950 pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          {/* Heart shapes floating */}
          {Array.from({ length: 12 }).map((_, i) => {
            const symbols = ['♥', '❤', '❦', '❥'];
            const glyph = symbols[i % symbols.length];
            const size = 12 + (i % 3) * 6;
            const left = (i * 9) % 95;
            const delay = i * 0.45;
            const duration = 4.5 + (i % 2) * 1.5;
            return (
              <div
                key={i}
                className="absolute text-red-500 opacity-80"
                style={{
                  fontSize: `${size}px`,
                  left: `${left}%`,
                  bottom: '-25px',
                  filter: 'drop-shadow(0 0 3px rgba(239,68,68,0.5))',
                  animation: `heartPulseFloat ${duration}s infinite linear`,
                  animationDelay: `${delay}s`,
                }}
              >
                {glyph}
              </div>
            );
          })}
        </div>
      );
    }

    case 'confetti': {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          {/* Spiraling confetti */}
          {Array.from({ length: 16 }).map((_, i) => {
            const colors = ['#38bdf8', '#f472b6', '#facc15', '#4ade80', '#fb923c', '#c084fc'];
            const color = colors[i % colors.length];
            const left = (i * 7.5) % 95;
            const delay = i * 0.25;
            const duration = 2.8 + (i % 3) * 1.2;
            const size = 6 + (i % 3) * 4;
            return (
              <div
                key={i}
                className="absolute rounded-sm opacity-90"
                style={{
                  width: `${size}px`,
                  height: `${size * 1.5}px`,
                  backgroundColor: color,
                  left: `${left}%`,
                  top: '-15px',
                  animation: `fallCrumb ${duration}s infinite linear`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </div>
      );
    }

    case 'ocean_bubble': {
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-[#082f49]/80 to-zinc-950 pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          {/* Deep ocean rising air bubbles */}
          {Array.from({ length: 15 }).map((_, i) => {
            const symbols = ['○', 'o', '.'];
            const glyph = symbols[i % symbols.length];
            const size = 6 + (i % 3) * 6;
            const left = (i * 8.5) % 95;
            const delay = i * 0.35;
            const duration = 3.5 + (i % 3) * 1.5;
            return (
              <div
                key={i}
                className="absolute text-cyan-300 font-extrabold opacity-75"
                style={{
                  fontSize: `${size}px`,
                  left: `${left}%`,
                  bottom: '-20px',
                  filter: 'drop-shadow(0 0 2px #0ea5e9)',
                  animation: `oceanBubbleUp ${duration}s infinite linear`,
                  animationDelay: `${delay}s`,
                }}
              >
                {glyph}
              </div>
            );
          })}
        </div>
      );
    }

    case 'synthwave': {
      return (
        <div className="absolute inset-0 bg-zinc-950 pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          {/* Perspective grid base */}
          <div
            className="absolute bottom-0 inset-x-0 h-28 border-t border-purple-500/20"
            style={{
              backgroundImage: 'linear-gradient(rgba(168,85,247,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.15) 1px, transparent 1px)',
              backgroundSize: '12px 12px',
              animation: 'synthGridMove 2s infinite linear',
            }}
          />
          {/* Sunset glow in background */}
          <div className="absolute bottom-6 inset-x-0 h-14 bg-gradient-to-t from-fuchsia-500/15 via-[#f472b6]/5 to-transparent blur-md" />
        </div>
      );
    }

    case 'amethyst': {
      return (
        <div className="absolute inset-0 bg-zinc-950 pointer-events-none overflow-hidden select-none z-0 rounded-2xl border border-transparent">
          {/* Laser grids / firing lines */}
          {Array.from({ length: 3 }).map((_, i) => {
            const delay = i * 1.2;
            const top = 30 + i * 25;
            return (
              <div
                key={i}
                className="absolute inset-x-0 h-[1.5px] bg-purple-500 opacity-0 shadow-[0_0_10px_#c084fc]"
                style={{
                  top: `${top}%`,
                  animation: 'laserStrikeH 3.2s infinite ease-out',
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </div>
      );
    }

    case 'void': {
      return (
        <div className="absolute inset-0 bg-[#09090b] pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          {/* devouring dark black-hole background */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full bg-[radial-gradient(circle,transparent_40%,rgba(168,85,247,0.15)_65%,transparent_90%)] animate-pulse" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-black shadow-[0_0_20px_#a855f7] border border-purple-950/20" />
        </div>
      );
    }

    case 'lightning': {
      return (
        <div className="absolute inset-0 bg-zinc-950 pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          {/* Falling heavy rain lines */}
          <div
            className="absolute inset-0 opacity-[0.25]"
            style={{
              backgroundImage: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.4) 47%, transparent 52%)',
              backgroundSize: '40px 100px',
              animation: 'stormRain 1.4s infinite linear',
            }}
          />
          {/* lightning strike flash overlays */}
          <div className="absolute inset-0 bg-white/45" style={{ animation: 'lightningFlashBolt 4.5s infinite ease-in-out' }} />
        </div>
      );
    }

    case 'candy': {
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-rose-950/40 to-zinc-950 pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          {/* Sweets sprinkles raining down */}
          {Array.from({ length: 14 }).map((_, i) => {
            const sprinkles = ['✦', '•', '⭐', '★'];
            const spr = sprinkles[i % sprinkles.length];
            const size = spr === '•' ? 8 : 11;
            const left = (i * 9.5) % 95;
            const delay = i * 0.35;
            const duration = 2.5 + (i % 3);
            return (
              <div
                key={i}
                className="absolute text-pink-400 font-extrabold opacity-80"
                style={{
                  fontSize: `${size}px`,
                  left: `${left}%`,
                  top: '-15px',
                  animation: `fallCrumb ${duration}s infinite linear`,
                  animationDelay: `${delay}s`,
                }}
              >
                {spr}
              </div>
            );
          })}
        </div>
      );
    }

    case 'fireflies': {
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/60 to-zinc-950 pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(16,185,129,0.08)_0%,transparent_70%)] animate-pulse" />
          {/* Drifting, orbiting fireflies with glow shadow */}
          {Array.from({ length: 10 }).map((_, i) => {
            const delay = i * 0.7;
            const left = 10 + (i * 12) % 80;
            const top = 10 + (i * 11) % 80;
            return (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full opacity-80 shadow-[0_0_8px_#fbbf24]"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  animation: `fireflyOrbit ${4 + (i % 2) * 2}s infinite linear`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </div>
      );
    }

    case 'diamond': {
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 to-zinc-950 pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          {/* Shimmering iridescent silver diamond glazes */}
          {Array.from({ length: 12 }).map((_, i) => {
            const size = 6 + (i % 3) * 6;
            const left = (i * 13) % 90;
            const top = (i * 11) % 90;
            const delay = i * 0.3;
            return (
              <div
                key={i}
                className="absolute text-slate-100 font-black"
                style={{
                  fontSize: `${size}px`,
                  left: `${left}%`,
                  top: `${top}%`,
                  transform: 'rotate(45deg)',
                  animation: `royalSparklePulse 2.2s infinite ease-in-out`,
                  animationDelay: `${delay}s`,
                  textShadow: '0 0 5px rgba(255,255,255,0.7)',
                }}
              >
                ✧
              </div>
            );
          })}
        </div>
      );
    }

    case 'pixel_dungeon': {
      return (
        <div className="absolute inset-0 bg-zinc-950 pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          {/* 8-bit stone grid texture */}
          <div className="absolute inset-0 opacity-[0.22] bg-[linear-gradient(rgba(120,53,4,0.35)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(120,53,4,0.35)_1.5px,transparent_1.5px)] bg-[length:16px_16px]" />
          {/* Level up yellow coins floating */}
          {Array.from({ length: 8 }).map((_, i) => {
            const left = 10 + (i * 15) % 80;
            const delay = i * 0.8;
            const duration = 3.5 + (i % 2) * 1.5;
            return (
              <div
                key={i}
                className="absolute text-yellow-400 font-bold font-mono text-[9px]"
                style={{
                  left: `${left}%`,
                  bottom: '-20px',
                  animation: `toxicBubbleUp ${duration}s infinite linear`,
                  animationDelay: `${delay}s`,
                  textShadow: '1px 1px 0px #000',
                }}
              >
                ✦
              </div>
            );
          })}
        </div>
      );
    }

    case 'cyberpunk': {
      return (
        <div className="absolute inset-0 bg-zinc-950 pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          {/* Circuit grids */}
          <div className="absolute inset-0 opacity-[0.14] bg-[radial-gradient(#06b6d4_1px,transparent_1px)] bg-[length:10px_10px]" />
          {/* Data packet glowing bars ascending */}
          {Array.from({ length: 4 }).map((_, i) => {
            const delay = i * 1.5;
            const left = 20 + i * 20;
            return (
              <div
                key={i}
                className="absolute w-[1.5px] bg-cyan-400 shadow-[0_0_8px_#06b6d4] h-10"
                style={{
                  left: `${left}%`,
                  bottom: '-50px',
                  animation: `toxicBubbleUp 4s infinite linear`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </div>
      );
    }

    case 'binary': {
      return (
        <div className="absolute inset-0 bg-[#020617] pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          {/* Binary digit flows */}
          {Array.from({ length: 6 }).map((_, i) => {
            const left = 10 + i * 16;
            const delay = i * 0.6;
            const duration = 3 + (i % 2) * 1.5;
            const values = i % 2 === 0 ? '1\n0\n1' : '0\n1\n0';
            return (
              <div
                key={i}
                className="absolute text-blue-400 text-[10px] font-mono leading-none flex items-center justify-center whitespace-pre text-opacity-70"
                style={{
                  left: `${left}%`,
                  top: '-100px',
                  animation: `slideDown ${duration}s infinite linear`,
                  animationDelay: `${delay}s`,
                  textShadow: '0 0 3px #3b82f6',
                }}
              >
                {values}
              </div>
            );
          })}
        </div>
      );
    }

    case 'blood_moon': {
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/80 to-zinc-950 pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          <div className="absolute top-0 inset-x-0 h-16 bg-red-800/20 blur-xl" />
          {Array.from({ length: 8 }).map((_, i) => {
            const size = 3 + (i % 2) * 5;
            const left = (i * 12.5) % 95;
            const delay = i * 1.2;
            const duration = 4 + (i % 3) * 2;
            return (
              <div
                key={i}
                className="absolute bg-red-600/80 rounded-full"
                style={{
                  width: `${size}px`,
                  height: `${size * 3}px`,
                  left: `${left}%`,
                  top: '-20px',
                  boxShadow: '0 0 8px rgba(220,38,38,0.7)',
                  animation: `fallCrumb ${duration}s infinite linear`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </div>
      );
    }
    
    case 'glitch': {
      return (
        <div className="absolute inset-0 bg-zinc-950 pointer-events-none overflow-hidden select-none z-0 rounded-2xl flex items-center justify-center">
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
          <div className="text-4xl font-black text-transparent opacity-10" style={{ animation: 'rgbGlitchAnim 0.3s infinite steps(2)' }}>
            ERROR
          </div>
        </div>
      );
    }

    case 'butterflies': {
      return (
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/40 to-zinc-950 pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          {Array.from({ length: 6 }).map((_, i) => {
            const size = 16 + (i % 3) * 4;
            const left = 10 + (i * 16) % 80;
            const delay = i * 0.9;
            const duration = 5 + (i % 2) * 3;
            return (
              <div
                key={i}
                className="absolute text-purple-400 opacity-80 mix-blend-screen"
                style={{
                  fontSize: `${size}px`,
                  left: `${left}%`,
                  bottom: '-30px',
                  filter: 'drop-shadow(0 0 5px rgba(168,85,247,0.6))',
                  animation: `butterflyFly ${duration}s infinite ease-in-out`,
                  animationDelay: `${delay}s`,
                }}
              >
                🦋
              </div>
            );
          })}
        </div>
      );
    }

    case 'hologram': {
      return (
        <div className="absolute inset-0 bg-[#020617] pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.05)_50%)] bg-[length:100%_4px]" />
          <div 
            className="absolute inset-x-0 h-16 bg-gradient-to-b from-cyan-500/0 via-cyan-400/20 to-cyan-500/0 blur-[2px]"
            style={{ animation: 'scanHolo 4s infinite ease-in-out' }}
          />
          <div 
            className="absolute inset-x-0 h-[2px] bg-cyan-300 shadow-[0_0_10px_#22d3ee]"
            style={{ animation: 'scanHolo 4s infinite ease-in-out' }}
          />
        </div>
      );
    }

    case 'enchanted_fireflies': {
      return (
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/30 to-black pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          {Array.from({ length: 15 }).map((_, i) => {
            const size = 3 + (i % 3) * 2;
            const left = 5 + (i * 17) % 90;
            const top = 10 + (i * 23) % 80;
            const delay = i * 0.4;
            const duration = 4 + (i % 3) * 2.5;
            return (
              <div
                key={i}
                className="absolute bg-yellow-200 rounded-full"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${left}%`,
                  top: `${top}%`,
                  animation: `fireflyFloat ${duration}s infinite ease-in-out`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </div>
      );
    }
    
    case 'rain': {
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/40 to-zinc-950 pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]" />
          {Array.from({ length: 40 }).map((_, i) => {
            const h = 15 + (i % 3) * 10;
            const left = (i * 7.5) % 110;
            const delay = (i * 0.1) % 1.5;
            const duration = 0.6 + (i % 3) * 0.4;
            return (
              <div
                key={i}
                className="absolute w-[1px] bg-cyan-200/40 shadow-[0_0_5px_rgba(34,211,238,0.5)]"
                style={{
                  height: `${h}px`,
                  left: `${left}%`,
                  animation: `rainDrop ${duration}s infinite linear`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </div>
      );
    }
    
    case 'party_confetti': {
      const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
      return (
        <div className="absolute inset-0 bg-transparent pointer-events-none overflow-hidden select-none z-0 rounded-2xl">
          {Array.from({ length: 40 }).map((_, i) => {
            const w = 6 + (i % 3) * 4;
            const h = 8 + (i % 2) * 4;
            const left = (i * 9) % 100;
            const delay = i * 0.2;
            const duration = 3 + (i % 3) * 1.5;
            const bg = colors[i % colors.length];
            const isCircle = i % 4 === 0;
            return (
              <div
                key={i}
                className="absolute"
                style={{
                  width: `${w}px`,
                  height: `${h}px`,
                  left: `${left}%`,
                  backgroundColor: bg,
                  borderRadius: isCircle ? '50%' : '1px',
                  animation: `confettiFall ${duration}s infinite linear`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </div>
      );
    }

    case 'aurora': {
      return (
        <div className="absolute inset-0 bg-black pointer-events-none overflow-hidden select-none z-0 rounded-2xl flex items-center justify-center">
          <div 
            className="absolute inset-[-50%] bg-[radial-gradient(ellipse_at_center,theme(colors.green.500/20),transparent_50%),radial-gradient(ellipse_at_bottom_left,theme(colors.purple.600/30),transparent_50%),radial-gradient(ellipse_at_top_right,theme(colors.cyan.400/20),transparent_50%)] bg-[length:200%_200%]"
            style={{ animation: 'auroraShift 15s infinite ease-in-out' }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]" />
        </div>
      );
    }

    default:
      return null;
  }
};
