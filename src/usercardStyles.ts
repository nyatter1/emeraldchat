import React from 'react';

export interface UsercardStyle {
  id: string;
  name: string;
  className?: string;
  textClassName?: string;
  textStyle?: React.CSSProperties;
  style?: React.CSSProperties;
}

export const USERCARD_STYLES: UsercardStyle[] = [
  {
    id: 'none',
    name: 'Classic Slate (Default)',
    className: 'bg-[#1e1e22] hover:bg-[#252529] border-zinc-800/50',
    textClassName: 'text-zinc-200'
  },
  {
    id: 'matrix',
    name: 'Cyber Matrix',
    className: 'border-emerald-500/40',
    textClassName: 'text-emerald-400 font-mono shadow-emerald-500/10 drop-shadow-md',
    style: {
      background: 'linear-gradient(180deg, rgba(3, 15, 3, 0.95) 0%, rgba(10, 35, 10, 0.95) 100%)',
      borderColor: '#10b981',
      boxShadow: '0 0 12px rgba(16, 185, 129, 0.25), inset 0 0 6px rgba(16, 185, 129, 0.1)'
    }
  },
  {
    id: 'sepia',
    name: 'Vintage Sepia',
    className: 'border-[#8c6d4f]/30',
    textClassName: 'text-[#5d4037] font-semibold',
    style: {
      background: 'linear-gradient(135deg, #f4ecd8 0%, #e8d8be 100%)',
      borderColor: '#8c6d4f',
      boxShadow: '0 2px 5px rgba(140, 109, 79, 0.15)'
    }
  },
  {
    id: 'cartoon',
    name: 'Cel Cartoon',
    className: 'border-[3px] border-zinc-950',
    textClassName: 'text-zinc-950 font-black tracking-wide',
    style: {
      background: '#facc15',
      boxShadow: '4px 4px 0px #000000',
    }
  },
  {
    id: 'galaxy',
    name: 'Cosmic Galaxy',
    className: 'border-purple-500/40',
    textClassName: 'text-white font-bold drop-shadow-[0_2px_4px_rgba(168,85,247,0.7)]',
    style: {
      background: 'linear-gradient(135deg, #090514 0%, #150a21 40%, #2f1246 100%)',
      borderColor: '#a855f7',
      boxShadow: '0 0 15px rgba(168, 85, 247, 0.35), inset 0 0 10px rgba(236, 72, 153, 0.1)'
    }
  },
  {
    id: 'magma',
    name: 'Molten Magma',
    className: 'border-orange-500/45',
    textClassName: 'text-orange-400 font-extrabold',
    style: {
      background: 'linear-gradient(145deg, #0f0502 0%, #240b04 60%, #4a0d00 100%)',
      borderColor: '#f97316',
      boxShadow: '0 0 14px rgba(249, 115, 22, 0.3), inset 0 0 8px rgba(239, 68, 68, 0.15)'
    }
  },
  {
    id: 'aurora',
    name: 'Aurora Borealis',
    className: 'border-emerald-400/40',
    textClassName: 'text-emerald-100 font-bold drop-shadow-[0_1px_4px_rgba(52,211,153,0.5)]',
    style: {
      background: 'linear-gradient(125deg, #020f12 0%, #052326 50%, #11362b 100%)',
      borderColor: '#34d399',
      boxShadow: '0 0 14px rgba(52, 211, 153, 0.25), inset 0 0 8px rgba(6, 182, 212, 0.15)'
    }
  },
  {
    id: 'frostbite',
    name: 'Icy Frostbite',
    className: 'border-cyan-400/40',
    textClassName: 'text-cyan-100 font-semibold',
    style: {
      background: 'linear-gradient(135deg, #041b24 0%, #0d2f3d 100%)',
      borderColor: '#22d3ee',
      boxShadow: '0 0 12px rgba(34, 211, 238, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.05)'
    }
  },
  {
    id: 'royal-gold',
    name: 'Imperial Gold',
    className: 'border-amber-400/50',
    textClassName: 'text-amber-200 font-extrabold drop-shadow-[0_1px_3px_rgba(251,191,36,0.5)]',
    style: {
      background: 'linear-gradient(135deg, #1f1807 0%, #000000 70%, #2b2005 100%)',
      borderColor: '#fbbf24',
      boxShadow: '0 0 16px rgba(251, 191, 36, 0.35)'
    }
  },
  {
    id: 'rainbow-prism',
    name: 'Rainbow Prism',
    className: 'border-zinc-800',
    textClassName: 'text-white font-extrabold bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500 bg-clip-text text-transparent [-webkit-background-clip:text]',
    style: {
      background: 'linear-gradient(135deg, #0a0a0c 0%, #17171e 100%)',
      borderLeftWidth: '3px',
      borderLeftColor: '#ef4444',
      borderRightWidth: '3px',
      borderRightColor: '#3b82f6'
    }
  },
  {
    id: 'cyberpunk',
    name: 'Cyber Neon Heat',
    className: 'border-pink-500/50',
    textClassName: 'text-pink-300 font-bold italic',
    style: {
      background: 'linear-gradient(135deg, #180313 0%, #000000 65%, #03131c 100%)',
      borderColor: '#ec4899',
      boxShadow: '0 0 15px rgba(236, 72, 153, 0.3), 0 0 5px rgba(6, 182, 212, 0.2)'
    }
  },
  {
    id: 'sunset-blvd',
    name: 'Sunset Boulevard',
    className: 'border-transparent',
    textClassName: 'text-white font-bold',
    style: {
      background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 30%, #fb923c 100%)',
      boxShadow: '0 2px 8px rgba(244, 63, 94, 0.25)'
    }
  },
  {
    id: 'abyss',
    name: 'Deep Abyss Pool',
    className: 'border-blue-900/40',
    textClassName: 'text-cyan-400 font-medium',
    style: {
      background: 'linear-gradient(180deg, #010411 0%, #030a21 100%)',
      borderColor: '#1e3a8a',
      boxShadow: '0 0 10px rgba(30, 58, 138, 0.4), inset 0 0 8px rgba(6, 182, 212, 0.1)'
    }
  },
  {
    id: 'toxic-slime',
    name: 'Radioactive Waste',
    className: 'border-lime-500/50',
    textClassName: 'text-lime-300 font-mono tracking-tighter',
    style: {
      background: 'linear-gradient(135deg, #0a1102 0%, #1c2e04 100%)',
      borderColor: '#84cc16',
      boxShadow: '0 0 14px rgba(132, 204, 22, 0.35)'
    }
  },
  {
    id: 'monochrome',
    name: 'Stark Monochrome',
    className: 'border-zinc-300',
    textClassName: 'text-zinc-950 font-extrabold',
    style: {
      background: '#ffffff',
      borderColor: '#d4d4d8',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
    }
  },
  {
    id: 'retro-arcade',
    name: 'Retro Arcade',
    className: 'border-[#ff007f]',
    textClassName: 'text-[#00ffff] font-semibold tracking-wider uppercase text-xs',
    style: {
      background: '#120024',
      borderColor: '#ff007f',
      boxShadow: 'inset 0 0 10px #ff007f, 0 4px 8px rgba(0,0,0,0.5)'
    }
  },
  {
    id: 'amethyst-shimmer',
    name: 'Amethyst Spike',
    className: 'border-fuchsia-600/40',
    textClassName: 'text-fuchsia-300 font-bold',
    style: {
      background: 'linear-gradient(135deg, #13031a 0%, #2f0f3e 100%)',
      borderColor: '#d946ef',
      boxShadow: '0 0 12px rgba(217, 70, 239, 0.3), inset 0 0 8px rgba(255,255,255,0.05)'
    }
  },
  {
    id: 'emerald-city',
    name: 'Emerald City',
    className: 'border-emerald-600/30',
    textClassName: 'text-emerald-300 font-bold',
    style: {
      background: 'linear-gradient(135deg, #021a0f 0%, #063c22 100%)',
      borderColor: '#059669',
      boxShadow: '0 0 12px rgba(5, 150, 105, 0.25)'
    }
  },
  {
    id: 'mint-choc',
    name: 'Mint Chocolate',
    className: 'border-emerald-300/40',
    textClassName: 'text-emerald-100 font-medium',
    style: {
      background: 'linear-gradient(135deg, #1d130c 0%, #0f2d1d 100%)',
      borderColor: '#6ee7b7',
      boxShadow: '0 2px 6px rgba(110, 231, 183, 0.15)'
    }
  },
  {
    id: 'cotton-candy',
    name: 'Cotton Candy Skies',
    className: 'border-transparent',
    textClassName: 'text-zinc-800 font-bold drop-shadow-sm',
    style: {
      background: 'linear-gradient(135deg, #fbcfe8 0%, #e0f2fe 100%)',
      boxShadow: '0 4px 8px rgba(244, 114, 182, 0.2)'
    }
  },
  {
    id: 'sakura-petal',
    name: 'Tokyo Sakura',
    className: 'border-pink-300/30',
    textClassName: 'text-pink-300 font-semibold',
    style: {
      background: 'linear-gradient(135deg, #1b0a11 0%, #3a1524 100%)',
      borderColor: '#f9a8d4',
      boxShadow: '0 0 8px rgba(249, 168, 212, 0.2)'
    }
  },
  {
    id: 'carbon-weave',
    name: 'Carbon Fiber Weave',
    className: 'border-zinc-800',
    textClassName: 'text-zinc-100 font-mono text-xs font-bold uppercase tracking-widest',
    style: {
      background: 'repeating-linear-gradient(45deg, #121214 0px, #121214 2px, #1a1a1f 2px, #1a1a1f 4px)',
      borderColor: '#27272a',
      boxShadow: 'inset 0 0 8px rgba(0,0,0,0.8)'
    }
  },
  {
    id: 'blood-moon',
    name: 'Blood Moon Gaze',
    className: 'border-red-600/40',
    textClassName: 'text-red-500 font-black tracking-wide',
    style: {
      background: 'linear-gradient(180deg, #090101 0%, #1a0303 60%, #300202 100%)',
      borderColor: '#dc2626',
      boxShadow: '0 0 15px rgba(220, 38, 38, 0.35)'
    }
  },
  {
    id: 'quantum-core',
    name: 'Quantum Network',
    className: 'border-blue-500/30',
    textClassName: 'text-blue-300 font-bold',
    style: {
      background: 'linear-gradient(135deg, #020b18 0%, #0a192f 100%)',
      borderColor: '#3b82f6',
      boxShadow: '0 0 14px rgba(59, 130, 246, 0.3), inset 0 0 8px rgba(20, 184, 166, 0.15)'
    }
  },
  {
    id: 'bubblegum-gloss',
    name: 'Sweet Bubblegum',
    className: 'border-pink-500/30',
    textClassName: 'text-pink-100 font-bold',
    style: {
      background: 'linear-gradient(145deg, #f472b6 0%, #db2777 100%)',
      borderColor: '#ec4899',
      boxShadow: 'inset 0 1px 4px rgba(255, 255, 255, 0.3), 0 3px 6px rgba(219, 39, 119, 0.25)'
    }
  },
  {
    id: 'desert-sahara',
    name: 'Sahara Breeze',
    className: 'border-amber-600/30',
    textClassName: 'text-amber-300 font-semibold',
    style: {
      background: 'linear-gradient(135deg, #1c140a 0%, #362512 100%)',
      borderColor: '#d97706',
      boxShadow: '0 2px 6px rgba(217, 119, 6, 0.15)'
    }
  },
  {
    id: 'jungle-bloom',
    name: 'Amazon Canopy',
    className: 'border-green-700/40',
    textClassName: 'text-emerald-400 font-bold',
    style: {
      background: 'linear-gradient(135deg, #011105 0%, #082d13 100%)',
      borderColor: '#15803d',
      boxShadow: '0 2px 6px rgba(22, 163, 74, 0.2)'
    }
  },
  {
    id: 'steely-grey',
    name: 'Brushed Titanium',
    className: 'border-zinc-700/40',
    textClassName: 'text-zinc-200 font-semibold',
    style: {
      background: 'linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%)',
      borderColor: '#52525b',
      boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)'
    }
  },
  {
    id: 'lavender-mist',
    name: 'Lavender Mist',
    className: 'border-violet-300/30',
    textClassName: 'text-violet-300',
    style: {
      background: 'linear-gradient(135deg, #0b0714 0%, #1a122e 100%)',
      borderColor: '#c084fc',
      boxShadow: '0 0 10px rgba(192, 132, 252, 0.15)'
    }
  },
  {
    id: 'solar-flare',
    name: 'Blazing Solar Flare',
    className: 'border-amber-500/50',
    textClassName: 'text-white font-black bg-gradient-to-r from-amber-300 to-red-400 bg-clip-text text-transparent [-webkit-background-clip:text]',
    style: {
      background: 'linear-gradient(135deg, #2a0b00 0%, #140400 100%)',
      borderColor: '#f59e0b',
      boxShadow: '0 0 15px rgba(245, 158, 11, 0.35)'
    }
  },
  {
    id: 'subnautica',
    name: 'Coral Reef',
    className: 'border-teal-400/40',
    textClassName: 'text-teal-200 font-semibold',
    style: {
      background: 'linear-gradient(135deg, #021a1f 0%, #053b47 100%)',
      borderColor: '#2dd4bf',
      boxShadow: '0 0 12px rgba(45, 212, 191, 0.25)'
    }
  },
  {
    id: 'obsidian',
    name: 'Liquid Obsidian',
    className: 'border-violet-950',
    textClassName: 'text-violet-200 font-extrabold',
    style: {
      background: 'linear-gradient(135deg, #05010a 0%, #0d011c 100%)',
      borderColor: '#2e1065',
      boxShadow: '0 0 15px rgba(46, 16, 101, 0.4), inset 0 0 12px rgba(168, 85, 247, 0.08)'
    }
  },
  {
    id: 'autumn',
    name: 'Autumn Forest',
    className: 'border-orange-600/30',
    textClassName: 'text-orange-300 font-medium',
    style: {
      background: 'linear-gradient(135deg, #1c0f02 0%, #361704 100%)',
      borderColor: '#ea580c',
      boxShadow: '0 2px 6px rgba(234, 88, 12, 0.15)'
    }
  },
  {
    id: 'high-voltage',
    name: 'High Voltage',
    className: 'border-yellow-400/45',
    textClassName: 'text-yellow-300 font-bold drop-shadow-[0_1px_4px_rgba(250,204,21,0.6)]',
    style: {
      background: 'radial-gradient(circle at 50% 50%, #151302 0%, #000000 100%)',
      borderColor: '#facc15',
      boxShadow: '0 0 14px rgba(250, 204, 21, 0.3)'
    }
  },
  {
    id: 'vaporwave',
    name: 'Nostalgic Vaporwave',
    className: 'border-[#ff71ce]',
    textClassName: 'text-white font-extrabold bg-gradient-to-r from-[#ff71ce] via-[#01cdfe] to-[#b967ff] bg-clip-text text-transparent [-webkit-background-clip:text]',
    style: {
      background: 'linear-gradient(135deg, #11052C 0%, #03001e 100%)',
      borderColor: '#ff71ce',
      boxShadow: '0 0 15px rgba(255, 113, 206, 0.3)'
    }
  },
  {
    id: 'hot-cayenne',
    name: 'Flamin\' Hot Spice',
    className: 'border-red-500/40',
    textClassName: 'text-yellow-400 font-black italic tracking-tighter',
    style: {
      background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
      borderColor: '#facc15',
      boxShadow: '0 4px 10px rgba(239, 68, 68, 0.35)'
    }
  },
  {
    id: 'blueprint',
    name: 'Architect Blueprint',
    className: 'border-blue-500/30',
    textClassName: 'text-blue-300 font-mono tracking-tight font-medium',
    style: {
      background: 'linear-gradient(135deg, #0b1a3d 0%, #020921 100%)',
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
      backgroundSize: '10px 10px',
      borderColor: '#3b82f6',
      boxShadow: 'inset 0 0 6px rgba(59, 130, 246, 0.2)'
    }
  },
  {
    id: 'spectral-hologram',
    name: 'Spectral Hologram',
    className: 'border-teal-300/40',
    textClassName: 'text-zinc-800 font-extrabold',
    style: {
      background: 'linear-gradient(135deg, #99f6e4 0%, #e9d5ff 50%, #fef08a 100%)',
      borderColor: '#5eead4',
      boxShadow: '0 4px 8px rgba(94, 234, 212, 0.25)'
    }
  },
  {
    id: 'holographic-glimmer',
    name: 'Holo Glimmer',
    className: 'border-transparent',
    textClassName: 'text-fuchsia-950 font-black',
    style: {
      background: 'linear-gradient(120deg, #d8b4fe 0%, #fbcfe8 50%, #c7d2fe 100%)',
      boxShadow: '0 3px 6px rgba(168, 85, 247, 0.2)'
    }
  },
  {
    id: 'zombie-flesh',
    name: 'Zombie Outbreak',
    className: 'border-green-800/40',
    textClassName: 'text-yellow-600 font-semibold',
    style: {
      background: 'linear-gradient(135deg, #101a0d 0%, #2b1d11 100%)',
      borderColor: '#15803d',
      boxShadow: '0 2px 4px rgba(21, 128, 61, 0.1)'
    }
  },
  {
    id: 'parchment',
    name: 'Ancient Scroll',
    className: 'border-[#7c2d12]/40',
    textClassName: 'text-amber-950 font-serif italic',
    style: {
      background: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)',
      borderColor: '#c2410c'
    }
  },
  {
    id: 'ghostly-vapor',
    name: 'Haunted Spirit',
    className: 'border-zinc-500/20',
    textClassName: 'text-zinc-300 font-light tracking-widest',
    style: {
      background: 'linear-gradient(135deg, rgba(20,20,25,0.8) 0%, rgba(35,35,45,0.8) 100%)',
      borderColor: '#71717a',
      boxShadow: '0 0 10px rgba(113, 113, 122, 0.15)'
    }
  },
  {
    id: 'supernova',
    name: 'Supernova Collapse',
    className: 'border-red-400/40',
    textClassName: 'text-white font-extrabold tracking-tight',
    style: {
      background: 'radial-gradient(circle at center, #7f1d1d 0%, #000000 80%)',
      borderColor: '#f87171',
      boxShadow: '0 0 16px rgba(248, 113, 113, 0.35)'
    }
  },
  {
    id: 'soda-fizz',
    name: 'Lime Soda Fizz',
    className: 'border-lime-400/40',
    textClassName: 'text-lime-300 font-bold',
    style: {
      background: 'linear-gradient(135deg, #0d2811 0%, #1b5122 100%)',
      borderColor: '#a3e635',
      boxShadow: '0 0 10px rgba(163, 230, 53, 0.25)'
    }
  },
  {
    id: 'dracula-palace',
    name: 'Dracula\'s Crypt',
    className: 'border-purple-800/40',
    textClassName: 'text-red-500 font-serif tracking-wide font-black',
    style: {
      background: 'linear-gradient(180deg, #000000 0%, #15001c 100%)',
      borderColor: '#6b21a8',
      boxShadow: 'inset 0 0 8px rgba(107, 33, 168, 0.4), 0 0 10px rgba(107, 33, 168, 0.2)'
    }
  },
  {
    id: 'steampunk',
    name: 'Industrial Steampunk',
    className: 'border-[#b45309]',
    textClassName: 'text-amber-500 font-mono text-xs',
    style: {
      background: 'linear-gradient(135deg, #2c1a04 0%, #1c0e01 100%)',
      borderColor: '#b45309',
      boxShadow: '0 0 10px rgba(180, 83, 9, 0.25)'
    }
  },
  {
    id: 'glow-emerald',
    name: 'Polished Glow Emerald',
    className: 'border-emerald-500/50',
    textClassName: 'text-emerald-100 font-bold',
    style: {
      background: '#042f1a',
      borderColor: '#10b981',
      boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)'
    }
  },
  {
    id: 'glow-crimson',
    name: 'Cyber Crimson Pulse',
    className: 'border-rose-500/50',
    textClassName: 'text-rose-100 font-bold',
    style: {
      background: '#450a0a',
      borderColor: '#f43f5e',
      boxShadow: '0 0 10px rgba(244, 63, 94, 0.3)'
    }
  },
  {
    id: 'glow-sapphire',
    name: 'Sapphire Crystal',
    className: 'border-blue-500/50',
    textClassName: 'text-blue-100 font-bold',
    style: {
      background: '#172554',
      borderColor: '#3b82f6',
      boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)'
    }
  },
  {
    id: 'deep-space',
    name: 'Space Orbit',
    className: 'border-zinc-800/80',
    textClassName: 'text-zinc-100 font-bold tracking-tight',
    style: {
      background: 'radial-gradient(circle, #05050a 0%, #14141d 80%, #000000 100%)',
      borderColor: '#27272a',
      boxShadow: '0 0 8px rgba(0,0,0,0.6)'
    }
  },
  {
    id: 'pastel-peach',
    name: 'Sweet Peach',
    className: 'border-orange-200/30',
    textClassName: 'text-orange-950 font-bold',
    style: {
      background: 'linear-gradient(135deg, #ffedd5 0%, #fdba74 100%)',
      borderColor: '#fed7aa'
    }
  },
  {
    id: 'cotton-candy-pastel',
    name: 'Cotton Candy Sweet',
    className: 'border-pink-200/30',
    textClassName: 'text-purple-950 font-bold',
    style: {
      background: 'linear-gradient(135deg, #fbcfe8 0%, #c084fc 100%)',
      borderColor: '#f9a8d4'
    }
  },
  {
    id: 'fizz-soda',
    name: 'Wild Orange Fizz',
    className: 'border-orange-400/40',
    textClassName: 'text-orange-300 font-semibold',
    style: {
      background: 'linear-gradient(135deg, #2a0800 0%, #4c1103 100%)',
      borderColor: '#fb923c',
      boxShadow: '0 0 8px rgba(251, 146, 60, 0.2)'
    }
  },
  {
    id: 'abyss-teal',
    name: 'Abyss Teal Glow',
    className: 'border-teal-500/40',
    textClassName: 'text-teal-300 font-semibold',
    style: {
      background: 'linear-gradient(135deg, #011317 0%, #022329 100%)',
      borderColor: '#14b8a6',
      boxShadow: '0 0 8px rgba(20, 184, 166, 0.2)'
    }
  },
  {
    id: 'neon-plasma',
    name: 'Neon Plasma Wave',
    className: 'border-fuchsia-500/40',
    textClassName: 'text-fuchsia-300 font-bold',
    style: {
      background: 'linear-gradient(135deg, #160126 0%, #30034a 100%)',
      borderColor: '#d946ef',
      boxShadow: '0 0 12px rgba(217, 70, 239, 0.3)'
    }
  }
];
