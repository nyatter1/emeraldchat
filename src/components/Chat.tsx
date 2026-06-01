import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, Message, News, ProfileLike } from '../types';
import { LogOut, Send, Search, MoreVertical, X, Upload, Loader2, Link as LinkIcon, Image as ImageIcon, Music, List, ListOrdered, Quote, Minus, ShieldCheck, Menu, ThumbsUp, Heart, Laugh, ChevronLeft, ChevronRight, Grid, ArrowRight, Check, CheckCircle, Sparkles, ArrowLeft, Globe, User, MessageSquare, Layers, Wallet, Settings, Plus, Coins, Paintbrush, UserPlus, UserMinus, UserCheck, HeartOff, Eye, Lock, Gem } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { PROFILE_EFFECTS, PROFILE_COMBOS, EFFECTS_KEYFRAMES, ProfileEffectRenderer } from './ProfileEffects';
import { USERCARD_STYLES } from '../usercardStyles';
import { MESSAGE_CARDS } from '../messageCardsAndPFPStyles';

const IMAGE_EXT_REGEX = /\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i;
const VIDEO_EXT_REGEX = /\.(mp4|webm|ogg|mov)(\?.*)?$/i;
const FORBIDDEN_TLDS = /\.(online|site|indevs\.in)(\/.*)?$/i;

export const DEV_EMAILS = ['test@gmail.com', 'dev@gmail.com', 'haydensixseven@gmail.com','onetallteen@duck.com' ];
export const FOUNDER_EMAILS: string[] = ['minlee214@gmail.com']; // Add emails here
export const MOP_EMAILS: string[] = []; // Add emails here
export const SUPERADMIN_EMAILS: string[] = [];
export const ADMIN_EMAILS: string[] = [];
export const MOD_EMAILS: string[] = [];

export const RANK_ORDER = ['Developer', 'Founder', 'MoP', 'SuperAdmin', 'Admin', 'Mod', 'VIP'];

export const PROFILE_BORDERS = [
  {
    id: 'none',
    name: 'No border (Classic)',
    className: 'border-zinc-800',
    cardStyle: {}
  },
  {
    id: 'neon-emerald',
    name: 'Neon Emerald Glow',
    className: 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]',
    cardStyle: {
      border: '3px solid #10b981',
      boxShadow: '0 0 25px rgba(16, 185, 129, 0.65), inset 0 0 10px rgba(16, 185, 129, 0.3)',
      animation: 'borderPulseEmerald 2.5s infinite ease-in-out'
    }
  },
  {
    id: 'crimson-flare',
    name: 'Crimson Flare Pulse',
    className: 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.55)]',
    cardStyle: {
      border: '3px solid #ef4444',
      boxShadow: '0 0 30px rgba(239, 68, 68, 0.75), inset 0 0 12px rgba(239, 68, 68, 0.4)',
      animation: 'borderPulseCrimson 2s infinite ease-in-out'
    }
  },
  {
    id: 'cosmic-purple',
    name: 'Cosmic Purple Laser',
    className: 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.55)]',
    cardStyle: {
      border: '3px solid #a855f7',
      boxShadow: '0 0 25px rgba(168, 85, 247, 0.7), inset 0 0 12px rgba(168, 85, 247, 0.35)',
      animation: 'borderPulseCosmic 2.5s infinite ease-in-out'
    }
  },
  {
    id: 'royal-gold',
    name: 'Sovereign Royal Gold',
    className: 'border-amber-400 shadow-[0_0_22px_rgba(251,191,36,0.6)]',
    cardStyle: {
      border: '3px solid #fbbf24',
      boxShadow: '0 0 30px rgba(251, 191, 36, 0.8), inset 0 0 15px rgba(251, 191, 36, 0.4)',
      animation: 'borderRotateGold 4s linear infinite'
    }
  },
  {
    id: 'rainbow-wave',
    name: 'RGB Chroma Wave',
    className: 'border-transparent',
    cardStyle: {
      border: '3px solid transparent',
      backgroundImage: 'linear-gradient(#141416, #141416), linear-gradient(to right, #ff0055, #00ff55, #0055ff, #ff0055)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box',
      boxShadow: '0 0 30px rgba(255, 0, 100, 0.5)',
      animation: 'borderChromaWave 3s linear infinite'
    }
  },
  {
    id: 'frozen-glacier',
    name: 'Chilling Glacier Frost',
    className: 'border-cyan-300 shadow-[0_0_20px_rgba(103,232,249,0.5)]',
    cardStyle: {
      border: '3px solid #67e8f9',
      boxShadow: '0 0 25px rgba(103, 232, 249, 0.75), inset 0 0 14px rgba(103, 232, 249, 0.3)',
      animation: 'borderPulseCyan 2.8s infinite ease-in-out'
    }
  },
  {
    id: 'cyber-matrix',
    name: 'Cyber Matrix Hex',
    className: 'border-emerald-600 shadow-[0_0_18px_rgba(52,211,153,0.4)]',
    cardStyle: {
      border: '3px double #34d399',
      boxShadow: '0 0 20px rgba(52, 211, 153, 0.6), inset 0 0 10px rgba(52, 211, 153, 0.25)',
      animation: 'matrixFlicker 1.5s infinite steps(2)'
    }
  },
  {
    id: 'bubblegum-pink',
    name: 'Sweet Bubblegum Dream',
    className: 'border-pink-400 shadow-[0_0_20px_rgba(244,114,182,0.5)]',
    cardStyle: {
      border: '3px solid #f472b6',
      boxShadow: '0 0 25px rgba(244, 114, 182, 0.7), inset 0 0 12px rgba(244, 114, 182, 0.3)',
      animation: 'borderPulseBubblegum 2s infinite ease-in-out'
    }
  },
  {
    id: 'solar-wind',
    name: 'Solar Wind Orange',
    className: 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]',
    cardStyle: {
      border: '3px solid #f59e0b',
      boxShadow: '0 0 25px rgba(245, 158, 11, 0.7), inset 0 0 10px rgba(245, 158, 11, 0.3)',
      animation: 'solarFlare 2.5s infinite ease-in-out'
    }
  },
  {
    id: 'toxic-waste',
    name: 'Toxic Waste Radioactive',
    className: 'border-lime-500 shadow-[0_0_20px_rgba(132,204,22,0.6)]',
    cardStyle: {
      border: '3px dashed #84cc16',
      boxShadow: '0 0 25px rgba(132, 204, 22, 0.75)',
      animation: 'toxicWaste 1.8s infinite linear'
    }
  },
  {
    id: 'vaporwave-80s',
    name: 'Vaporwave Neon Grid',
    className: 'border-fuchsia-500 shadow-[0_0_22px_rgba(217,70,239,0.55)]',
    cardStyle: {
      border: '3px solid #d946ef',
      boxShadow: '0 0 25px #d946ef, inset 0 0 12px #3b82f6',
      animation: 'vaporGlow 3s infinite ease-in-out'
    }
  },
  {
    id: 'abyssal-void',
    name: 'Obsidian Abyssal Void',
    className: 'border-zinc-950 shadow-[0_0_15px_rgba(0,0,0,0.9)]',
    cardStyle: {
      border: '5px solid #09090b',
      boxShadow: '0 0 20px #000, inset 0 0 15px #000'
    }
  },
  {
    id: 'electric-buzz',
    name: 'Electric Cobalt Pulse',
    className: 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]',
    cardStyle: {
      border: '3px double #3b82f6',
      boxShadow: '0 0 25px rgba(59, 130, 246, 0.8)',
      animation: 'electricBuzz 0.5s infinite alternate'
    }
  },
  {
    id: 'cherry-blossom',
    name: 'Japanese Cherry Blossom',
    className: 'border-pink-300 shadow-[0_0_15px_rgba(252,165,185,0.4)]',
    cardStyle: {
      border: '3.5px solid #fca5a5',
      boxShadow: '0 0 20px rgba(252, 165, 185, 0.5), inset 0 0 8px rgba(252, 165, 185, 0.2)'
    }
  },
  {
    id: 'chalkboard',
    name: 'Chalk Outline',
    className: 'border-zinc-100 shadow-[0_0_15px_rgba(255,255,255,0.4)]',
    cardStyle: {
      border: '4px solid #f4f4f5',
      boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)'
    }
  },
  {
    id: 'toxic-sludge',
    name: 'Toxic Biohazard Sludge',
    className: 'border-green-500 shadow-[0_0_18px_rgba(34,197,94,0.5)]',
    cardStyle: {
      border: '3px double #22c55e',
      boxShadow: '0 0 25px rgba(34,197,94,0.65)'
    }
  },
  {
    id: 'overlord',
    name: 'Dark Overlord Dread',
    className: 'border-red-700 shadow-[0_0_25px_rgba(185,28,28,0.7)]',
    cardStyle: {
      border: '3.5px solid #18181b',
      outline: '3.5px solid #b91c1c',
      boxShadow: '0 0 30px rgba(185, 28, 28, 0.8)'
    }
  },
  {
    id: 'minty-fresh',
    name: 'Spearmint Crisp',
    className: 'border-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.5)]',
    cardStyle: {
      border: '3px solid #2dd4bf',
      boxShadow: '0 0 20px rgba(45, 212, 191, 0.6), inset 0 0 10px rgba(45, 212, 191, 0.2)'
    }
  },
  {
    id: 'candy-cane',
    name: 'Mint Candy Cane',
    className: 'border-transparent',
    cardStyle: {
      border: '4px dashed #ef4444',
      outline: '2.5px solid #f4f4f5',
      boxShadow: '0 0 15px rgba(239, 68, 68, 0.5)'
    }
  },
  {
    id: 'deep-space',
    name: 'Infinite Deep Space',
    className: 'border-indigo-950 shadow-[0_0_30px_rgba(99,102,241,0.4)]',
    cardStyle: {
      border: '3px solid #1e1b4b',
      boxShadow: '0 0 35px rgba(99, 102, 241, 0.5), inset 0 0 15px #312e81'
    }
  },
  {
    id: 'phoenix-ember',
    name: 'Phoenix Sun Ember',
    className: 'border-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.5)]',
    cardStyle: {
      border: '3.5px solid #d97706',
      boxShadow: '0 0 25px rgba(245, 158, 11, 0.85)',
      animation: 'solarFlare 2s infinite ease-in-out'
    }
  },
  {
    id: 'ocean-spray',
    name: 'Aqua Teal Wave',
    className: 'border-cyan-500 shadow-[0_0_18px_rgba(6,182,212,0.5)]',
    cardStyle: {
      border: '3px double #06b6d4',
      boxShadow: '0 0 22px rgba(6, 182, 212, 0.65)'
    }
  },
  {
    id: 'chocolate-cookie',
    name: 'Cookie Crumble',
    className: 'border-amber-900 shadow-[0_0_12px_rgba(120,53,4,0.4)]',
    cardStyle: {
      border: '4.5px dotted #78350f',
      boxShadow: '0 0 15px rgba(120, 53, 4, 0.3)'
    }
  },
  {
    id: 'stealth-smoke',
    name: 'Stealth Smoke Shadow',
    className: 'border-zinc-700 shadow-[0_0_20px_rgba(63,63,70,0.5)]',
    cardStyle: {
      border: '3px solid rgba(63, 63, 70, 0.6)',
      boxShadow: '0 0 25px rgba(63, 63, 70, 0.7)'
    }
  },
  {
    id: 'gothic-crypt',
    name: 'Gothic Crypt Shadow',
    className: 'border-zinc-900 shadow-[0_0_25px_rgba(0,0,0,1)]',
    cardStyle: {
      border: '3px solid #000',
      outline: '2.5px solid #581c87',
      boxShadow: '0 0 30px rgba(88, 28, 135, 0.65)'
    }
  },
  {
    id: 'cotton-candy',
    name: 'Spun Cotton Candy',
    className: 'border-transparent',
    cardStyle: {
      border: '3.5px solid transparent',
      backgroundImage: 'linear-gradient(#141416, #141416), linear-gradient(to right, #f472b6, #38bdf8)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box',
      boxShadow: '0 0 22px rgba(244, 114, 182, 0.5)'
    }
  },
  {
    id: 'retro-arcade',
    name: '8-Bit Retro Pixel',
    className: 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]',
    cardStyle: {
      border: '4px ridge #fbbf24',
      boxShadow: '0 0 18px #fbbf24'
    }
  },
  {
    id: 'copper-spark',
    name: 'Charged Copper Wire',
    className: 'border-amber-700',
    cardStyle: {
      border: '3.5px dashed #b45309',
      boxShadow: '0 0 15px rgba(180, 83, 9, 0.5)'
    }
  },
  {
    id: 'haunted-muck',
    name: 'Bog Haunted Muck',
    className: 'border-green-900 shadow-[0_0_20px_rgba(20,83,45,0.6)]',
    cardStyle: {
      border: '4px groove #14532d',
      boxShadow: '0 0 25px rgba(20, 83, 45, 0.7)'
    }
  },
  {
    id: 'pastel-lilac',
    name: 'Soft Lavender Lilac',
    className: 'border-purple-300 shadow-[0_0_15px_rgba(216,180,254,0.4)]',
    cardStyle: {
      border: '3px solid #d8b4fe',
      boxShadow: '0 0 18px rgba(216, 180, 254, 0.5)'
    }
  },
  {
    id: 'cyber-hex',
    name: 'Cybersec Firewall',
    className: 'border-blue-700 shadow-[0_0_20px_rgba(29,78,216,0.6)]',
    cardStyle: {
      border: '3px double #1d4ed8',
      outline: '1.5px solid #1e3a8a',
      boxShadow: '0 0 25px rgba(29, 78, 216, 0.7)'
    }
  },
  {
    id: 'glitch-noise',
    name: 'Digital Static Glitch',
    className: 'border-rose-500 shadow-[-4px_0_0_rgba(239,68,68,0.5),_4px_0_0_rgba(6,182,212,0.5)]',
    cardStyle: {
      border: '3px solid #f43f5e',
      animation: 'glitchGlow 1.2s infinite ease-in-out'
    }
  },
  {
    id: 'golden-ticket',
    name: "Charlie's Golden Ticket",
    className: 'border-yellow-400',
    cardStyle: {
      border: '4px dashed #facc15',
      boxShadow: '0 0 22px rgba(250, 204, 21, 0.7)'
    }
  },
  {
    id: 'bubble-pop',
    name: 'Carbonated Aqua Bubble',
    className: 'border-cyan-200',
    cardStyle: {
      border: '4px dotted #a5f3fc',
      boxShadow: '0 0 15px rgba(165, 243, 252, 0.5)'
    }
  },
  {
    id: 'stardust-trail',
    name: 'Stardust Nebula Sparkle',
    className: 'border-yellow-200 shadow-[0_0_20px_rgba(254,240,138,0.5)]',
    cardStyle: {
      border: '3px solid #fef08a',
      boxShadow: '0 0 25px rgba(254,240,138,0.7), inset 0 0 8px rgba(254,240,138,0.3)'
    }
  },
  {
    id: 'blizzard-frost',
    name: 'Arctic Blizzard Frost',
    className: 'border-blue-100 shadow-[0_0_25px_rgba(255,255,255,0.7)]',
    cardStyle: {
      border: '3.5px solid #f1f5f9',
      boxShadow: '0 0 30px #ffffff, inset 0 0 10px #bfdbfe'
    }
  },
  {
    id: 'zebra-stripe',
    name: 'Zebra Crossing Monochrome',
    className: 'border-transparent',
    cardStyle: {
      border: '4px dashed #000000',
      outline: '3px solid #ffffff',
      boxShadow: '0 0 15px rgba(255,255,255,0.3)'
    }
  },
  {
    id: 'sunflower',
    name: 'Radiant Sunflower fields',
    className: 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.5)]',
    cardStyle: {
      border: '3.5px solid #eab308',
      boxShadow: '0 0 22px rgba(234, 179, 8, 0.65)'
    }
  },
  {
    id: 'hot-chili',
    name: 'Sizzling Hot Ghost Pepper',
    className: 'border-red-600 shadow-[0_0_22px_rgba(220,38,38,0.6)]',
    cardStyle: {
      border: '4px double #dc2626',
      boxShadow: '0 0 25px #dc2626'
    }
  },
  {
    id: 'sub-zero',
    name: 'Subzero Cryogenic',
    className: 'border-blue-400 shadow-[0_0_25px_rgba(96,165,250,0.6)]',
    cardStyle: {
      border: '3px solid #60a5fa',
      boxShadow: '0 0 30px #3b82f6, inset 0 0 12px #1d4ed8'
    }
  },
  {
    id: 'banana-milk',
    name: 'Creamy Banana Milkshake',
    className: 'border-yellow-100 shadow-[0_0_15px_rgba(253,224,71,0.3)]',
    cardStyle: {
      border: '3px solid #fef08a',
      boxShadow: '0 0 18px rgba(253, 224, 71, 0.4)'
    }
  },
  {
    id: 'laser-pointer',
    name: 'Tactical Red Laser Indicator',
    className: 'border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]',
    cardStyle: {
      border: '1.5px solid #ef4444',
      boxShadow: '0 0 15px #ef4444'
    }
  },
  {
    id: 'rust-shack',
    name: 'Post-Apocalyptic Rusty Iron',
    className: 'border-amber-800 shadow-[0_0_12px_rgba(146,64,14,0.4)]',
    cardStyle: {
      border: '4.5px groove #92400e',
      boxShadow: '0 0 15px rgba(146, 64, 14, 0.3)'
    }
  },
  {
    id: 'alien-ufo',
    name: 'Extraterrestrial Plasma Beam',
    className: 'border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.6)]',
    cardStyle: {
      border: '3px solid #4ade80',
      boxShadow: '0 0 25px rgba(74, 222, 128, 0.8)',
      animation: 'ufoPlasma 2.8s infinite ease-in-out'
    }
  },
  {
    id: 'deep-sea',
    name: 'Mariana Trench Abyss',
    className: 'border-cyan-900 shadow-[0_0_22px_rgba(8,145,178,0.5)]',
    cardStyle: {
      border: '3.5px solid #0891b2',
      boxShadow: '0 0 28px #0891b2, inset 0 0 14px #155e75'
    }
  },
  {
    id: 'radio-wave',
    name: 'Frequency Resonance',
    className: 'border-orange-500 shadow-[0_0_18px_rgba(249,115,22,0.5)]',
    cardStyle: {
      border: '3px dashed #f97316',
      boxShadow: '0 0 22px rgba(249, 115, 22, 0.65)'
    }
  },
  {
    id: 'magic-potion',
    name: "Witch's Witchcraft Elixir",
    className: 'border-fuchsia-600 shadow-[0_0_22px_rgba(192,38,211,0.6)]',
    cardStyle: {
      border: '3px double #c026d3',
      boxShadow: '0 0 25px rgba(192, 38, 211, 0.75)',
      animation: 'potionPulse 2s infinite ease-in-out'
    }
  },
  {
    id: 'pixel-emerald',
    name: '8-Bit Emerald Block',
    className: 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]',
    cardStyle: {
      border: '4.5px ridge #10b981',
      boxShadow: '0 0 18px #10b981'
    }
  },
  {
    id: 'glamour-gold',
    name: 'Hollywood Glamour Luxury',
    className: 'border-yellow-600 shadow-[0_0_25px_rgba(202,138,4,0.6)]',
    cardStyle: {
      border: '4px solid #ca8a04',
      boxShadow: '0 0 30px #ca8a04, inset 0 0 12px #854d0e'
    }
  },
  {
    id: 'monochrome-grey',
    name: 'Slate Grey Concrete',
    className: 'border-zinc-500 shadow-[0_0_12px_rgba(113,113,122,0.3)]',
    cardStyle: {
      border: '3.5px solid #71717a',
      boxShadow: '0 0 15px rgba(113, 113, 122, 0.4)'
    }
  },
  {
    id: 'rainbow-neon',
    name: 'Rainbow Neon',
    className: 'border-transparent',
    cardStyle: {
      border: '3.5px solid transparent',
      backgroundImage: 'linear-gradient(#141416, #141416), linear-gradient(to right, #ef4444, #eab308, #3b82f6)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box',
      boxShadow: '0 0 25px rgba(59, 130, 246, 0.5)',
      animation: 'borderChromaWave 3s linear infinite'
    }
  }
];

export const BORDER_KEYFRAMES = `
@keyframes borderPulseEmerald {
  0%, 100% { box-shadow: 0 0 15px rgba(16, 185, 129, 0.35); border-color: rgba(16, 185, 129, 0.7); }
  50% { box-shadow: 0 0 30px rgba(16, 185, 129, 0.8); border-color: rgba(16, 185, 129, 1); }
}
@keyframes borderPulseCrimson {
  0%, 100% { box-shadow: 0 0 15px rgba(239, 68, 68, 0.4); border-color: rgba(239, 68, 68, 0.7); }
  50% { box-shadow: 0 0 35px rgba(239, 68, 68, 0.9); border-color: rgba(239, 68, 68, 1); }
}
@keyframes borderPulseCosmic {
  0%, 100% { box-shadow: 0 0 15px rgba(168, 85, 247, 0.45); border-color: rgba(168, 85, 247, 0.75); }
  50% { box-shadow: 0 0 30px rgba(168, 85, 247, 0.85); border-color: rgba(168, 85, 247, 1); }
}
@keyframes borderPulseCyan {
  0%, 100% { box-shadow: 0 0 15px rgba(6, 182, 212, 0.4); border-color: rgba(6, 182, 212, 0.7); }
  50% { box-shadow: 0 0 32px rgba(6, 182, 212, 0.85); border-color: rgba(6, 182, 212, 1); }
}
@keyframes borderPulseBubblegum {
  0%, 100% { box-shadow: 0 0 15px rgba(244, 114, 182, 0.45); border-color: rgba(244, 114, 182, 0.7); }
  50% { box-shadow: 0 0 30px rgba(244, 114, 182, 0.85); border-color: rgba(244, 114, 182, 1); }
}
@keyframes borderRotateGold {
  0%, 100% { border-color: #fbbf24; box-shadow: 0 0 15px rgba(251, 191, 36, 0.5); }
  50% { border-color: #f59e0b; box-shadow: 0 0 32px rgba(251, 191, 36, 0.9); }
}
@keyframes borderChromaWave {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}
@keyframes matrixFlicker {
  0%, 100% { opacity: 0.95; box-shadow: 0 0 15px rgba(52, 211, 153, 0.5); }
  50% { opacity: 1; box-shadow: 0 0 25px rgba(52, 211, 153, 0.8); }
}
@keyframes solarFlare {
  0%, 100% { border-color: #f59e0b; box-shadow: 0 0 15px rgba(245, 158, 11, 0.4); }
  50% { border-color: #ea580c; box-shadow: 0 0 28px rgba(245, 158, 11, 0.85); }
}
@keyframes toxicWaste {
  0%, 100% { box-shadow: 0 0 12px rgba(132, 204, 22, 0.4); }
  50% { box-shadow: 0 0 28px rgba(132, 204, 22, 0.8); }
}
@keyframes vaporGlow {
  0%, 100% { border-color: #d946ef; box-shadow: 0 0 20px #d946ef, inset 0 0 8px #d946ef; }
  50% { border-color: #3b82f6; box-shadow: 0 0 30px #3b82f6, inset 0 0 12px #3b82f6; }
}
@keyframes electricBuzz {
  0% { opacity: 0.85; border-color: #3b82f6; box-shadow: 0 0 10px #3b82f6; }
  100% { opacity: 1; border-color: #60a5fa; box-shadow: 0 0 25px #60a5fa; }
}
@keyframes glitchGlow {
  0%, 100% { transform: translate(0, 0); box-shadow: -2px 0 0 rgba(239,68,68,0.5), 2px 0 0 rgba(6,182,212,0.5); }
  20% { transform: translate(-1px, 1px); }
  40% { transform: translate(1px, -1px); box-shadow: -3px 0 0 rgba(6,182,212,0.6), 3px 0 0 rgba(239,68,68,0.6); }
  60% { transform: translate(-1px, -1px); }
  80% { transform: translate(1px, 1px); }
}
@keyframes ufoPlasma {
  0%, 100% { border-color: #4ade80; box-shadow: 0 0 18px rgba(74, 222, 128, 0.5); }
  50% { border-color: #22c55e; box-shadow: 0 0 30px rgba(34, 197, 94, 0.85); }
}
@keyframes potionPulse {
  0%, 100% { border-color: #c026d3; box-shadow: 0 0 15px rgba(192, 38, 211, 0.5); }
  50% { border-color: #f5d0fe; box-shadow: 0 0 30px rgba(192, 38, 211, 0.85); }
}
@keyframes textChromaWave {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.rainbow-text {
  background-image: linear-gradient(to right, #ff0055, #00ff55, #0055ff, #facc15, #ff0055);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: textChromaWave 3s linear infinite;
  display: inline-block;
}
`;

export function getBorderStyles(borderId: string | undefined): { id: string; name: string; className: string; cardStyle: React.CSSProperties } {
  if (!borderId || borderId === 'none') {
    return {
      id: 'none',
      name: 'No border (Classic)',
      className: 'border-zinc-800',
      cardStyle: {}
    };
  }

  if (borderId.startsWith('custom:')) {
    try {
      const configStr = borderId.slice(7);
      const config = JSON.parse(configStr);
      const color = config.color || '#3b82f6';
      const style = config.style || 'solid';
      const width = config.width || 3;
      const glowColor = config.glowColor || '';
      const glowIntensity = config.glowIntensity || 0;
      
      const shadow = glowColor && glowIntensity > 0
        ? `0 0 ${glowIntensity}px ${glowColor}, inset 0 0 ${Math.ceil(glowIntensity/2)}px ${glowColor}`
        : 'none';

      return {
        id: borderId,
        name: config.name || 'Custom Masterpiece',
        className: 'border-transparent',
        cardStyle: {
          border: `${width}px ${style} ${color}`,
          boxShadow: shadow,
        }
      };
    } catch (err) {
      // Fallback
    }
  }

  const found = PROFILE_BORDERS.find(b => b.id === borderId);
  if (found) {
    return {
      id: found.id,
      name: found.name,
      className: found.className || '',
      cardStyle: found.cardStyle || {}
    };
  }

  return {
    id: 'none',
    name: 'No border (Classic)',
    className: 'border-zinc-800',
    cardStyle: {}
  };
}

export let globalRankOverrides: Record<string, string> = {};

export let globalAdminState = {
  banned_users: [] as string[],
  muted_users: [] as string[],
  custom_rank_order: [] as string[],
  default_rank: 'VIP',
  custom_ranks: [] as {name: string, icon: string, level: number}[]
};

export function getCustomRanks(): {name: string, icon: string, level: number}[] {
  return globalAdminState.custom_ranks || [];
}

export function getRank(email?: string | null, userId?: string | null, dbRank?: string | null) {
  const e = email || '';
  const uid = userId || '';
  
  const defRank = globalAdminState.default_rank || 'VIP';

  if (uid === 'test-bot-0000-0000' || e.toLowerCase() === 'testbot@emerald.chat') {
    return {
      name: 'Bot',
      icon: 'https://img.icons8.com/fluency/48/bot.png',
      level: 999
    };
  }

  const lookupKey = uid ? globalRankOverrides[uid] : (e ? globalRankOverrides[e.toLowerCase()] : '');
  const rankFromSource = lookupKey || (dbRank && dbRank !== defRank ? dbRank : null) || (uid ? globalRankOverrides[uid] : '') || (dbRank || '').trim() || '';
  
  const rankName = rankFromSource || (
    DEV_EMAILS.includes(e) ? 'Developer' :
    FOUNDER_EMAILS.includes(e) ? 'Founder' :
    MOP_EMAILS.includes(e) ? 'MoP' :
    SUPERADMIN_EMAILS.includes(e) ? 'SuperAdmin' :
    ADMIN_EMAILS.includes(e) ? 'Admin' :
    MOD_EMAILS.includes(e) ? 'Mod' : defRank
  );

  const customRanks = getCustomRanks();
  const customIcons = customRanks.reduce((acc, rank) => ({...acc, [rank.name]: rank.icon}), {} as Record<string, string>);

  const icons: { [key: string]: string } = {
    'Developer': 'https://raw.githubusercontent.com/nyatter1/ranks/main/verified.gif',
    'Founder': 'https://raw.githubusercontent.com/nyatter1/ranks/main/founder.gif',
    'MoP': 'https://raw.githubusercontent.com/nyatter1/ranks/main/MoP.gif',
    'SuperAdmin': 'https://raw.githubusercontent.com/nyatter1/ranks/main/superadmin.png',
    'Admin': 'https://raw.githubusercontent.com/nyatter1/ranks/main/admin.png',
    'Mod': 'https://raw.githubusercontent.com/nyatter1/ranks/main/mod.png',
    'VIP': 'https://raw.githubusercontent.com/nyatter1/ranks/main/vip.gif',
    'Owner': 'https://raw.githubusercontent.com/nyatter1/ranks/main/founder.gif',
    'Bot': 'https://img.icons8.com/fluency/48/bot.png',
    ...customIcons
  };

  const currentOrder = globalAdminState.custom_rank_order && globalAdminState.custom_rank_order.length > 0 ? globalAdminState.custom_rank_order : RANK_ORDER;
  
  const customLevels = customRanks.reduce((acc, rank) => ({...acc, [rank.name]: rank.level}), {} as Record<string, number>);
  const defaultLevels: { [key: string]: number } = {
    'Developer': 0, 'Founder': 1, 'Owner': 1, 'MoP': 2, 'SuperAdmin': 3, 'Admin': 4, 'Mod': 5, 'VIP': 6, 'Bot': 999,
    ...customLevels
  };

  let assignedLvl = defaultLevels[rankName] ?? 999;
  
  // if rank is in currentOrder, use its index as the level
  const orderIdx = currentOrder.findIndex(r => r && typeof r === 'string' && r.toLowerCase() === rankName.toLowerCase());
  if (orderIdx !== -1) {
    assignedLvl = orderIdx;
  }

  const exactRank = Object.keys(icons).find(k => k && typeof k === 'string' && k.toLowerCase() === rankName.toLowerCase());

  return { 
    name: exactRank || rankName, 
    icon: exactRank ? icons[exactRank] : icons['VIP'], 
    level: assignedLvl 
  };
}

function isSafeUrl(url: string | undefined): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  
  // Explicitly check forbidden TLDs first
  if (FORBIDDEN_TLDS.test(lowerUrl)) return false;
  
  // Whitelist: direct image, or video links
  return IMAGE_EXT_REGEX.test(url) || VIDEO_EXT_REGEX.test(url);
}

function scrubContent(text: string): string {
  if (!text) return '';
  // Mask any plain text that looks like a forbidden domain
  return text.replace(/([a-zA-Z0-9-]+\.(online|site|indevs\.in))/gi, '[blocked]');
}

const MarkdownComponents = {
  a: ({ node, href, children, ...props }: any) => {
    if (!href) return <span>{children}</span>;
    
    const lowerHref = href.toLowerCase();
    
    if (isSafeUrl(href)) {
      if (IMAGE_EXT_REGEX.test(lowerHref)) {
        return <img 
          src={href} 
          alt={children?.toString() || 'Image'} 
          className="max-w-full rounded-lg my-2 border border-zinc-800 cursor-pointer object-cover max-h-[360px]" 
          loading="lazy" 
          onClick={(e) => {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('openFullscreenImage', { detail: href }));
          }}
        />;
      }
      if (VIDEO_EXT_REGEX.test(lowerHref)) {
        return (
          <video 
            src={href} 
            controls 
            className="max-w-full rounded-lg my-2 border border-zinc-800 max-h-[360px] bg-black" 
            playsInline 
          />
        );
      }
      return <a href={href} target="_blank" rel="noreferrer" className="text-emerald-500 hover:underline break-all" {...props}>{processChildrenWithStyles(children)}</a>;
    }

    // Block other domains
    return <span className="text-zinc-500 line-through decoration-zinc-700 cursor-not-allowed" title="Link blocked for security">{processChildrenWithStyles(children)}</span>;
  },
  img: ({ src, alt }: any) => <img src={src} alt={alt} className="max-w-full rounded-lg my-2 border border-zinc-800" loading="lazy" />,
  p: ({ children }: any) => <div className="mb-2 last:mb-0 leading-relaxed text-zinc-300 break-words">{processChildrenWithStyles(children)}</div>,
  strong: ({ children }: any) => <strong className="font-bold text-zinc-100">{processChildrenWithStyles(children)}</strong>,
  em: ({ children }: any) => <em className="italic text-zinc-400">{processChildrenWithStyles(children)}</em>,
  h1: ({ children }: any) => <h1 className="text-xl font-bold text-white mt-4 mb-2">{processChildrenWithStyles(children)}</h1>,
  h2: ({ children }: any) => <h2 className="text-lg font-bold text-white mt-3 mb-2">{processChildrenWithStyles(children)}</h2>,
  h3: ({ children }: any) => <h3 className="text-base font-bold text-white mt-2 mb-1">{processChildrenWithStyles(children)}</h3>,
  ul: ({ children }: any) => <ul className="list-disc list-inside mb-3 space-y-1 text-zinc-300">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal list-inside mb-3 space-y-1 text-zinc-300">{children}</ol>,
  li: ({ children }: any) => <li className="text-sm">{processChildrenWithStyles(children)}</li>,
  blockquote: ({ children }: any) => <blockquote className="border-l-4 border-emerald-500/50 bg-emerald-500/5 pl-4 py-2 my-3 rounded-r-lg italic text-zinc-400">{processChildrenWithStyles(children)}</blockquote>,
  hr: () => <hr className="border-zinc-800 my-4" />,
  code: ({ inline, children }: any) => inline ? <code className="bg-zinc-800/50 text-emerald-400 px-1 py-0.5 rounded text-sm font-mono">{children}</code> : <code className="block bg-zinc-900 border border-zinc-800 text-zinc-300 p-3 rounded-lg text-sm font-mono my-2 overflow-x-auto whitespace-pre-wrap">{children}</code>
};

export function getMarkdownComponents(senderProfile?: any) {
  return MarkdownComponents;
}

export const GOOGLE_FONTS_PRESETS = [
  'Creepster',
  'Orbitron',
  'Press Start 2P',
  'Cinzel Decorative',
  'Pacifico',
  'Rubik Glitch',
  'Nosifer',
  'Special Elite',
  'Bungee Spice',
  'Monoton',
  'Rye',
  'Faster One',
  'Eater'
];

export function ensureFontLoaded(fontName: string) {
  if (!fontName) return;
  if (GOOGLE_FONTS_PRESETS.includes(fontName)) {
    const linkId = `gfont-${fontName.toLowerCase().replace(/\s+/g, '-')}`;
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}&display=swap`;
      document.head.appendChild(link);
    }
  }
}

export function injectCustomFonts(customFonts?: Record<string, string>) {
  if (!customFonts) return;
  Object.entries(customFonts).forEach(([fontName, fontUrl]) => {
    const styleId = `custom-font-${fontName.toLowerCase()}`;
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.innerHTML = `
        @font-face {
          font-family: '${fontName}';
          src: url('${fontUrl}') format('truetype');
          font-display: swap;
        }
      `;
      document.head.appendChild(styleEl);
    }
  });
}

export function parseComplexStyles(text: string): React.ReactNode[] {
  if (!text || typeof text !== 'string') return [text];

  // Match [style ...]content[/style] order-independently
  const regex = /\[style([^\]]*)\]([\s\S]*?)\[\/style\]/g;
  
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;
    
    if (matchIndex > lastIndex) {
      result.push(text.substring(lastIndex, matchIndex));
    }

    const attrStr = match[1] || '';
    const content = match[2] || '';

    // Extract individual attributes order-independently
    const fontMatch = /font="([^"]*)"/.exec(attrStr);
    const effectMatch = /effect="([^"]*)"/.exec(attrStr);
    const colorMatch = /color="([^"]*)"/.exec(attrStr);

    const font = fontMatch ? fontMatch[1] : '';
    const effect = effectMatch ? effectMatch[1] : '';
    const color = colorMatch ? colorMatch[1] : '';

    if (font) {
      ensureFontLoaded(font);
    }

    const style: React.CSSProperties = {};
    if (font) {
      style.fontFamily = `'${font}', sans-serif`;
    }
    if (color) {
      style.color = color;
    }

    let effectClass = '';
    if (effect) {
      effectClass = `font-effect-${effect.toLowerCase()}`;
    }

    result.push(
      <span 
        key={matchIndex} 
        className={`${effectClass} inline-block`} 
        style={style}
      >
        {content}
      </span>
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex));
  }

  return result.length > 0 ? result : [text];
}

export function processChildrenWithStyles(children: any): any {
  if (typeof children === 'string') {
    return parseComplexStyles(children);
  }
  if (Array.isArray(children)) {
    return children.flatMap(child => {
      if (typeof child === 'string') {
        return parseComplexStyles(child);
      }
      return child;
    });
  }
  return children;
}

export function UserProfileFontsLoader({ bio }: { bio: string | null | undefined }) {
  useEffect(() => {
    if (!bio) return;
    try {
      const bioData = parseBio(bio);
      if (bioData.custom_fonts) {
        injectCustomFonts(bioData.custom_fonts);
      }
    } catch (e) {}
  }, [bio]);
  return null;
}

export interface BioData {
  text: string;
  mood: string;
  profile_music_type?: 'mp3' | 'youtube' | '';
  profile_music_source?: string;
  profile_card_bg?: string;
  profile_border?: string;
  profile_effect?: string;
  message_card?: string;
  pfp_border?: string;
  assigned_ranks?: Record<string, string>;
  custom_fonts?: Record<string, string>;
  banned_users?: string[];
  muted_users?: string[];
  custom_rank_order?: string[];
  default_rank?: string;
  custom_ranks?: {name: string, icon: string, level: number}[];
  gems?: number;
  coins?: number;
  last_daily_claim?: string;
  invisible?: boolean;
  hide_age_gender?: boolean;
  hide_bio?: boolean;
  sound_disabled?: boolean;
  usercard_bg?: string;
  friend_requests_sent?: string[];
  friends?: string[];
  relationship_request_sent?: string;
  dating_user_id?: string;
  dating_username?: string;
  hide_friends_on_profile?: boolean;
  hide_me_from_friends?: boolean;
  profile_views_unlocked_until?: string;
}

export function parseBio(bioStr: string | null | undefined): BioData {
  if (!bioStr) return { 
    text: '', 
    mood: '', 
    profile_effect: 'none', 
    message_card: 'none',
    pfp_border: 'none',
    gems: 5, 
    coins: 1000, 
    invisible: false, 
    hide_age_gender: false, 
    hide_bio: false, 
    sound_disabled: false, 
    usercard_bg: 'none',
    friend_requests_sent: [],
    friends: [],
    relationship_request_sent: '',
    dating_user_id: '',
    dating_username: '',
    hide_friends_on_profile: false,
    hide_me_from_friends: false,
    profile_views_unlocked_until: ''
  };
  try {
    const data = JSON.parse(bioStr);
    return {
      text: data.text !== undefined ? data.text : (data.bio !== undefined ? data.bio : ''),
      mood: data.mood || '',
      profile_music_type: data.profile_music_type || '',
      profile_music_source: data.profile_music_source || '',
      profile_card_bg: data.profile_card_bg || '',
      profile_border: data.profile_border || 'none',
      profile_effect: data.profile_effect || 'none',
      message_card: data.message_card || 'none',
      pfp_border: data.pfp_border || 'none',
      assigned_ranks: data.assigned_ranks || {},
      custom_fonts: data.custom_fonts || {},
      banned_users: data.banned_users || [],
      muted_users: data.muted_users || [],
      custom_rank_order: data.custom_rank_order || RANK_ORDER,
      default_rank: data.default_rank || 'Member',
      custom_ranks: data.custom_ranks || [],
      gems: typeof data.gems === 'number' ? data.gems : 5,
      coins: typeof data.coins === 'number' ? data.coins : 1000,
      last_daily_claim: data.last_daily_claim,
      invisible: !!data.invisible,
      hide_age_gender: !!data.hide_age_gender,
      hide_bio: !!data.hide_bio,
      sound_disabled: !!data.sound_disabled,
      usercard_bg: data.usercard_bg || 'none',
      friend_requests_sent: Array.isArray(data.friend_requests_sent) ? data.friend_requests_sent : [],
      friends: Array.isArray(data.friends) ? data.friends : [],
      relationship_request_sent: data.relationship_request_sent || '',
      dating_user_id: data.dating_user_id || '',
      dating_username: data.dating_username || '',
      hide_friends_on_profile: !!data.hide_friends_on_profile,
      hide_me_from_friends: !!data.hide_me_from_friends,
      profile_views_unlocked_until: data.profile_views_unlocked_until || ''
    };
  } catch (e) {}
  return { 
    text: bioStr, 
    mood: '', 
    profile_effect: 'none', 
    message_card: 'none',
    pfp_border: 'none',
    gems: 5, 
    coins: 1000, 
    invisible: false, 
    hide_age_gender: false, 
    hide_bio: false, 
    sound_disabled: false, 
    usercard_bg: 'none',
    friend_requests_sent: [],
    friends: [],
    relationship_request_sent: '',
    dating_user_id: '',
    dating_username: '',
    hide_friends_on_profile: false,
    hide_me_from_friends: false,
    profile_views_unlocked_until: ''
  };
}

export function RenderPfpWithCustomBorder({ 
  profile, 
  size = 42, 
  onClick, 
  className = "",
  roundedClass = "rounded-md"
}: { 
  profile: any, 
  size?: number, 
  onClick?: () => void, 
  className?: string,
  roundedClass?: string
}) {
  const avatarUrl = profile?.avatar_url || 'https://api.dicebear.com/7.x/identicon/svg?seed=default';

  return (
    <img 
      src={avatarUrl} 
      alt="Avatar" 
      className={`object-cover border border-zinc-800 shrink-0 shadow-sm transition-all hover:scale-105 duration-100 ${roundedClass} ${className}`}
      style={{ width: `${size}px`, height: `${size}px`, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    />
  );
}

export function stringifyBio(data: BioData): string {
  return JSON.stringify(data);
}

const TEST_BOT: Profile = {
  id: 'test-bot-0000-0000',
  username: 'TestBot',
  email: 'testbot@emerald.chat',
  age: 9999,
  gender: 'Robot',
  bio: '{"text":"I keep the chat clean by wiping messages when they reach 500! *Beep boop*","mood":"Running routine maintenance 🧹"}',
  avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=EmeraldBot&backgroundColor=10b981',
  banner_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop',
  updated_at: new Date().toISOString()
};


function NewsItem({ news, currentUserProfile, handleLikeNews, handleReactNews, handleDeleteNews, handleCommentNews, isDev }: any) {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const hasLiked = news.news_likes?.some((l: any) => l.user_id === currentUserProfile.id) || false;
  
  const reactionsList = ['👍', '👎', '❤️', '😂'];
  
  return (
    <div className="bg-[#141416] border border-zinc-800 rounded-xl p-4 flex flex-col gap-3 relative group">
       <UserProfileFontsLoader bio={news.profiles?.bio} />
       {isDev && (
         <button onClick={() => handleDeleteNews(news.id)} className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Delete News">
           <X className="w-5 h-5"/>
         </button>
       )}
       <div className="flex items-center gap-3 pr-8">
         {(() => {
           const uBorderConfig = parseBio(news.profiles?.bio);
           const uBorder = PROFILE_BORDERS.find(b => b.id === uBorderConfig.profile_border) || PROFILE_BORDERS[0];
           return (
             <img 
               src={news.profiles?.avatar_url} 
               className="w-10 h-10 rounded-full object-cover border border-zinc-700 shrink-0" 
               alt="" 
             />
           );
         })()}
         <div className="flex flex-col">
           <div className="flex items-center gap-1.5">
             <img src={getRank(news.profiles?.email, news.profiles?.id, news.profiles?.rank).icon} alt={getRank(news.profiles?.email, news.profiles?.id, news.profiles?.rank).name} className="h-4 object-contain" />
             <span className="font-bold text-sm text-zinc-100">{news.profiles?.username}</span>
           </div>
           <span className="text-xs text-zinc-500">{format(new Date(news.created_at), 'MMM d, HH:mm')}</span>
         </div>
       </div>
       <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap break-words">
          <Markdown remarkPlugins={[remarkGfm, remarkBreaks]} components={getMarkdownComponents(news.profiles)}>
            {scrubContent(news.content)}
          </Markdown>
       </div>
       <div className="flex flex-col gap-3 mt-1 pt-3 border-t border-zinc-800/50">
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-2 flex-wrap">
             {reactionsList.map(r => {
               const count = news.news_reactions?.filter((rx: any) => rx.reaction === r).length || 0;
               const hasReacted = news.news_reactions?.some((rx: any) => rx.user_id === currentUserProfile.id && rx.reaction === r) || false;
               return (
                 <button key={r} onClick={() => handleReactNews(news.id, r, hasReacted)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold leading-none ${hasReacted ? 'bg-[#3b82f6]/20 text-white' : 'bg-[#1e1e22] text-white hover:bg-zinc-800'} transition-colors shadow-sm`} title={r}>
                   <span className="text-[17px]">{r}</span>
                   <span>{count}</span>
                 </button>
               )
             })}
           </div>
           
           <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-2 text-[15px] text-white font-bold px-2 py-1 transition-colors group focus:outline-none">
             <span>{news.news_comments?.length || 0}</span>
             <div className="bg-[#052e2e] text-emerald-500 rounded-full w-7 h-7 flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
             </div>
           </button>
         </div>

         {showComments && (
           <div className="flex flex-col gap-3 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
             <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
               {news.news_comments?.map((comment: any) => (
                 <div key={comment.id} className="flex gap-2.5"><UserProfileFontsLoader bio={comment.profiles?.bio} />
                   {(() => {
                     const cBorderConfig = parseBio(comment.profiles?.bio);
                     const cBorder = PROFILE_BORDERS.find(b => b.id === cBorderConfig.profile_border) || PROFILE_BORDERS[0];
                     return (
                       <img 
                         src={comment.profiles?.avatar_url} 
                         className="w-7 h-7 rounded-full object-cover border border-zinc-700 shrink-0" 
                         alt="" 
                       />
                     );
                   })()}
                   <div className="flex flex-col bg-[#1e1e22] rounded-2xl px-3 py-2 w-fit max-w-[90%]">
                     <span className="flex items-center gap-1.5 text-[13px] font-bold text-zinc-200 leading-tight mb-0.5">
                       <img src={getRank(comment.profiles?.email, comment.profiles?.id, comment.profiles?.rank).icon} alt={getRank(comment.profiles?.email, comment.profiles?.id, comment.profiles?.rank).name} className="h-3.5 object-contain" />
                       {comment.profiles?.username} 
                       <span className="font-normal text-[10px] text-zinc-500 ml-1">{format(new Date(comment.created_at), 'MM/dd HH:mm')}</span>
                     </span>
                     <span className="text-[14px] text-zinc-300 break-words leading-snug">{comment.content}</span>
                   </div>
                 </div>
               ))}
               {(!news.news_comments || news.news_comments.length === 0) && (
                 <span className="text-sm text-zinc-600 italic px-1">No comments yet. Be the first to share your thoughts!</span>
               )}
             </div>
             
             <form onSubmit={(e) => handleCommentNews(e, news.id, commentText, setCommentText)} className="flex items-center mt-1">
               <input 
                 type="text" 
                 value={commentText} 
                 onChange={(e) => setCommentText(e.target.value)} 
                 placeholder="Type your comment" 
                 className="flex-1 bg-[#1e1e22] border border-transparent rounded-[20px] px-4 py-2.5 text-[15px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700/50 shadow-sm"
               />
             </form>
           </div>
         )}
         
         {!showComments && (
           <div className="mt-1">
             <form onClick={() => setShowComments(true)} className="flex items-center cursor-text">
               <div className="flex-1 bg-[#1e1e22] border border-transparent rounded-[20px] px-4 py-2.5 text-[15px] text-zinc-600 shadow-sm text-left">
                 Type your comment
               </div>
             </form>
           </div>
         )}
       </div>
    </div>
  )
}

function DeveloperPanel({ onClose, allProfiles }: { onClose: () => void, allProfiles: any[] }) {
  const [activeTab, setActiveTab] = useState<'ranks' | 'hierarchy' | 'mod'>('ranks');

  // Custom ranks
  const [ranks, setRanks] = useState<{name: string, icon: string, level: number}[]>(getCustomRanks());
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('');

  // Mod & Hierarchy states
  const [bannedUsers, setBannedUsers] = useState<string[]>(globalAdminState.banned_users || []);
  const [mutedUsers, setMutedUsers] = useState<string[]>(globalAdminState.muted_users || []);
  const [targetInput, setTargetInput] = useState('');
  
  const currentOrder = globalAdminState.custom_rank_order && globalAdminState.custom_rank_order.length > 0 ? globalAdminState.custom_rank_order : RANK_ORDER;
  const [rankHierarchy, setRankHierarchy] = useState<string[]>(currentOrder);
  const [defaultRank, setDefaultRank] = useState(globalAdminState.default_rank || 'VIP');

  const resolveTargetId = (input: string) => {
    if (!input) return '';
    const p = allProfiles.find(p => p.id === input || (p.username && p.username.toLowerCase() === input.toLowerCase()));
    return p ? p.id : input;
  };

  // helper to update global remote state
  const pushGlobalState = async (updates: any) => {
    try {
      const { data: testProfile } = await supabase.from('profiles').select('*').eq('email', 'test@gmail.com').single();
      if (testProfile) {
        const bioObj = parseBio(testProfile.bio);
        const nextBio = { ...bioObj, ...updates };
        await supabase.from('profiles').update({ bio: JSON.stringify(nextBio) }).eq('id', testProfile.id);
      }
    } catch (e) {
      toast.error('Failed to update global state');
    }
  };

  const handleSaveRank = async () => {
    if (!newName || !newIcon) return toast.error('Name and Icon are required');
    const newRanks = [...ranks, { name: newName, icon: newIcon, level: 6 }];
    setRanks(newRanks);
    globalAdminState.custom_ranks = newRanks;
    await pushGlobalState({ custom_ranks: newRanks });
    setNewName('');
    setNewIcon('');
    toast.success('Custom rank added!');
  };

  const handleRemoveRank = async (name: string) => {
    const newRanks = ranks.filter(r => r.name !== name);
    setRanks(newRanks);
    globalAdminState.custom_ranks = newRanks;
    await pushGlobalState({ custom_ranks: newRanks });
  }

  // Modi actions
  const handleKick = async () => {
    if (!targetInput) return toast.error('Enter user ID or name');
    const id = resolveTargetId(targetInput);
    supabase.channel('online_users').send({
      type: 'broadcast',
      event: 'kick_user',
      payload: { userId: id }
    });
    toast.success('Kick broadcast sent');
    setTargetInput('');
  };

  const handleToggleMute = async () => {
    if (!targetInput) return toast.error('Enter user ID or name');
    const id = resolveTargetId(targetInput);
    let next = [...mutedUsers];
    if (next.includes(id)) next = next.filter(i => i !== id);
    else next.push(id);
    setMutedUsers(next);
    globalAdminState.muted_users = next;
    await pushGlobalState({ muted_users: next });
    toast.success('Mute state updated');
    setTargetInput('');
  };

  const handleToggleBan = async () => {
    if (!targetInput) return toast.error('Enter user ID or name');
    const id = resolveTargetId(targetInput);
    let next = [...bannedUsers];
    if (next.includes(id)) next = next.filter(i => i !== id);
    else next.push(id);
    setBannedUsers(next);
    globalAdminState.banned_users = next;
    await pushGlobalState({ banned_users: next });
    toast.success('Ban state updated');
    
    if (next.includes(id)) {
      supabase.channel('online_users').send({
        type: 'broadcast',
        event: 'kick_user',
        payload: { userId: id }
      });
    }
    setTargetInput('');
  };

  // Hierarchy actions
  const handleMoveUp = async (idx: number) => {
    if (idx === 0) return;
    const next = [...rankHierarchy];
    const temp = next[idx];
    next[idx] = next[idx-1];
    next[idx-1] = temp;
    setRankHierarchy(next);
    globalAdminState.custom_rank_order = next;
    await pushGlobalState({ custom_rank_order: next });
  };
  
  const handleMoveDown = async (idx: number) => {
    if (idx === rankHierarchy.length - 1) return;
    const next = [...rankHierarchy];
    const temp = next[idx];
    next[idx] = next[idx+1];
    next[idx+1] = temp;
    setRankHierarchy(next);
    globalAdminState.custom_rank_order = next;
    await pushGlobalState({ custom_rank_order: next });
  };

  const handleAddHierarchy = async () => {
    if (!newName) return toast.error('Need rank name');
    const next = [...rankHierarchy, newName];
    setRankHierarchy(next);
    globalAdminState.custom_rank_order = next;
    await pushGlobalState({ custom_rank_order: next });
    setNewName('');
  };

  const handleRemoveHierarchy = async (name: string) => {
    const next = rankHierarchy.filter(r => r !== name);
    setRankHierarchy(next);
    globalAdminState.custom_rank_order = next;
    await pushGlobalState({ custom_rank_order: next });
  };

  const handleSetDefault = async (name: string) => {
    setDefaultRank(name);
    globalAdminState.default_rank = name;
    await pushGlobalState({ default_rank: name });
    toast.success(`Default rank set to ${name}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div className="w-full max-w-2xl bg-[#0c0c0c] border border-emerald-500/20 rounded-3xl p-6 shadow-2xl relative flex flex-col gap-6 max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X className="w-5 h-5"/></button>
        <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider">Developer Workspace</h2>
            <p className="text-xs text-zinc-400 font-bold tracking-widest uppercase">System Customization</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('ranks')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all rounded-xl border ${activeTab === 'ranks' ? 'bg-[#1e1e1e] text-white border-zinc-700 shadow-md' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'}`}>Creation</button>
          <button onClick={() => setActiveTab('hierarchy')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all rounded-xl border ${activeTab === 'hierarchy' ? 'bg-[#1e1e1e] text-white border-zinc-700 shadow-md' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'}`}>Hierarchy</button>
          <button onClick={() => setActiveTab('mod')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all rounded-xl border ${activeTab === 'mod' ? 'bg-red-900/10 text-red-500 border-red-500/30' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-red-400'}`}>Moderation</button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
          {activeTab === 'ranks' && (
            <>
              <div className="bg-[#141416] border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
                <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest">Create Custom Rank</h3>
                <div className="flex gap-2">
                  <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Rank Name" className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors" />
                  <input value={newIcon} onChange={e => setNewIcon(e.target.value)} placeholder="Icon URL (.gif/.png)" className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors" />
                </div>
                <button onClick={handleSaveRank} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-colors">
                  Save Rank
                </button>
              </div>

              <div className="flex flex-col gap-2">
                 {ranks.map(r => (
                   <div key={r.name} className="flex flex-row items-center justify-between bg-[#141416] border border-zinc-800 rounded-xl p-3">
                     <div className="flex items-center gap-3">
                       <img src={r.icon} alt={r.name} className="h-6 object-contain" />
                       <span className="font-bold text-sm text-white">{r.name}</span>
                     </div>
                     <button onClick={() => handleRemoveRank(r.name)} className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest px-2">Delete</button>
                   </div>
                 ))}
                 {ranks.length === 0 && <div className="text-zinc-500 text-xs text-center py-4 font-bold uppercase tracking-wider">No custom ranks created</div>}
              </div>
            </>
          )}

          {activeTab === 'hierarchy' && (
             <>
               <div className="bg-[#141416] border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
                 <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest">Add Rank to Global Hierarchy</h3>
                 <div className="flex gap-2">
                   <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Rank Name (e.g. VIP)" className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors" />
                   <button onClick={handleAddHierarchy} className="bg-emerald-600 hover:bg-emerald-500 px-4 text-white font-black text-xs uppercase tracking-widest py-2 rounded-xl transition-colors">Add</button>
                 </div>
                 <p className="text-[10px] text-zinc-500 mt-2">Rank Order defines priority level (Top is highest).</p>
               </div>
               
               <div className="bg-[#141416] border border-zinc-800 rounded-2xl p-4 flex flex-col gap-2 relative">
                 <div className="flex items-center justify-between mb-2">
                   <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Global Order & Default</h3>
                   <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase tracking-wider">Default: {defaultRank}</span>
                 </div>
                 {rankHierarchy.map((r, i) => (
                   <div key={r + i} className="flex flex-row items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl p-2.5">
                     <span className="font-bold text-sm text-white px-2">{i+1}. {r}</span>
                     <div className="flex items-center gap-1">
                       <button onClick={() => handleSetDefault(r)} className="text-[9px] font-black uppercase bg-zinc-800 text-zinc-300 hover:text-emerald-400 px-2 py-1 mr-2 rounded hover:bg-zinc-700">Set Default</button>
                       <button disabled={i===0} onClick={() => handleMoveUp(i)} className="p-1 text-zinc-500 hover:text-white disabled:opacity-30"><ChevronLeft className="w-4 h-4 rotate-90"/></button>
                       <button disabled={i===rankHierarchy.length-1} onClick={() => handleMoveDown(i)} className="p-1 text-zinc-500 hover:text-white disabled:opacity-30"><ChevronLeft className="w-4 h-4 -rotate-90"/></button>
                       <button onClick={() => handleRemoveHierarchy(r)} className="p-1 text-red-500 hover:text-red-400 ml-1"><X className="w-4 h-4"/></button>
                     </div>
                   </div>
                 ))}
               </div>
             </>
          )}

          {activeTab === 'mod' && (
            <>
              <div className="bg-red-950/20 border border-red-900/30 rounded-2xl p-4 flex flex-col gap-4">
                 <h3 className="text-sm font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4"/> Target Player ID
                 </h3>
                 <input 
                   value={targetInput} 
                   onChange={e => setTargetInput(e.target.value)} 
                   placeholder="Enter User UUID or name..." 
                   className="w-full bg-black border border-red-900/50 rounded-xl px-3 py-3 text-sm text-red-100 focus:outline-none focus:border-red-500 font-mono tracking-wider"
                 />
                 
                 <div className="grid grid-cols-3 gap-3">
                   <button onClick={handleKick} className="bg-[#141416] border border-red-900/50 hover:bg-red-900/20 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-colors">
                     Kick
                   </button>
                   <button onClick={handleToggleMute} className="bg-[#141416] border border-red-900/50 hover:bg-red-900/20 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-colors">
                     {mutedUsers.includes(resolveTargetId(targetInput)) ? 'Unmute' : 'Mute'}
                   </button>
                   <button onClick={handleToggleBan} className="bg-[#141416] border border-red-900/50 hover:bg-red-900/20 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-colors">
                     {bannedUsers.includes(resolveTargetId(targetInput)) ? 'Unban' : 'Ban'}
                   </button>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                {/* Muted */}
                <div className="bg-[#141416] border border-zinc-800 rounded-2xl p-4">
                  <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">Muted IDs</h3>
                  {mutedUsers.length === 0 ? <p className="text-zinc-600 text-xs">No muted users.</p> : 
                    <div className="flex flex-col gap-1 max-h-32 overflow-y-auto custom-scrollbar pr-1">{mutedUsers.map(id => <div key={id} className="text-[10px] font-mono text-zinc-400 truncate bg-black px-2 py-1 rounded select-all">{id}</div>)}</div>
                  }
                </div>
                {/* Banned */}
                <div className="bg-[#141416] border border-zinc-800 rounded-2xl p-4">
                  <h3 className="text-xs font-black text-red-500 uppercase tracking-widest mb-3">Banned IDs</h3>
                  {bannedUsers.length === 0 ? <p className="text-zinc-600 text-xs">No banned users.</p> : 
                    <div className="flex flex-col gap-1 max-h-32 overflow-y-auto custom-scrollbar pr-1">{bannedUsers.map(id => <div key={id} className="text-[10px] font-mono text-zinc-400 truncate bg-black px-2 py-1 rounded select-all">{id}</div>)}</div>
                  }
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export function Chat({ currentUserProfile, onSignOut, onProfileUpdate }: { currentUserProfile: Profile, onSignOut: () => void, onProfileUpdate: (p: Profile) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isIPhone, setIsIPhone] = useState(false);
  
  useEffect(() => {
    const ua = navigator.userAgent;
    // Specifically detect iPhone/iPod iOS devices
    const hasIphoneUA = /iPhone|iPod/.test(ua);
    setIsIPhone(hasIphoneUA);
  }, []);

  const [newMessage, setNewMessage] = useState('');
  const [showAddons, setShowAddons] = useState(false);
  const [showConvertCoinsModal, setShowConvertCoinsModal] = useState(false);
  const [showPaintCanvasModal, setShowPaintCanvasModal] = useState(false);
  const [showSocialRequestsModal, setShowSocialRequestsModal] = useState(false);
  const [showProfileViewsModal, setShowProfileViewsModal] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(null);
  const [activeTypers, setActiveTypers] = useState<{ userId: string, targetId: string, timestamp: number }[]>([]);

  useEffect(() => {
    if (selectedProfileId && selectedProfileId !== currentUserProfile.id) {
       supabase.from('profile_views').insert({
         viewer_id: currentUserProfile.id,
         viewed_id: selectedProfileId
       }).then(() => {});
    }
  }, [selectedProfileId, currentUserProfile.id]);

  useEffect(() => {
    const handleOpenFullscreen = (e: any) => {
      setFullscreenImageUrl(e.detail);
    };
    window.addEventListener('openFullscreenImage', handleOpenFullscreen);
    return () => window.removeEventListener('openFullscreenImage', handleOpenFullscreen);
  }, []);
  
  const [onlineUsers, setOnlineUsers] = useState<Profile[]>([TEST_BOT]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [showDeveloperPanel, setShowDeveloperPanel] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [leftPanelMode, setLeftPanelMode] = useState<'none' | 'menu' | 'news' | 'rules'>('none');
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [profileMenuState, setProfileMenuState] = useState<'closed' | 'main' | 'wallet'>('closed');
  const [pmTargetId, setPmTargetId] = useState<string | null>(null);
  const [showPmInbox, setShowPmInbox] = useState(false);
  const [privateMessages, setPrivateMessages] = useState<any[]>([]);
  const [newsFeed, setNewsFeed] = useState<News[]>([]);
  const [newNewsContent, setNewNewsContent] = useState('');
  const [hasNewNews, setHasNewNews] = useState(false);
  const [rankOverrides, setRankOverrides] = useState<Record<string, string>>({});

  // Computed incoming friend requests
  const myBio = useMemo(() => parseBio(currentUserProfile.bio), [currentUserProfile.bio]);

  const incomingFriendRequests = useMemo(() => {
    return allProfiles.filter(other => {
      if (other.id === currentUserProfile.id) return false;
      const otherBio = parseBio(other.bio);
      const sentToMe = otherBio.friend_requests_sent?.includes(currentUserProfile.id);
      const alreadyFriends = myBio.friends?.includes(other.id);
      const isIgnored = (myBio as any).ignored_friend_requests?.includes(other.id);
      return sentToMe && !alreadyFriends && !isIgnored;
    });
  }, [allProfiles, currentUserProfile.id, myBio]);

  // Computed incoming relationship requests
  const incomingRelationshipRequests = useMemo(() => {
    return allProfiles.filter(other => {
      if (other.id === currentUserProfile.id) return false;
      const otherBio = parseBio(other.bio);
      const sentToMe = otherBio.relationship_request_sent === currentUserProfile.id;
      const alreadyDating = myBio.dating_user_id === other.id;
      const areFriends = myBio.friends?.includes(other.id) && otherBio.friends?.includes(currentUserProfile.id);
      const isIgnored = (myBio as any).ignored_relationship_requests?.includes(other.id);
      return sentToMe && !alreadyDating && areFriends && !isIgnored;
    });
  }, [allProfiles, currentUserProfile.id, myBio]);

  const totalIncomingRequestsCount = incomingFriendRequests.length + incomingRelationshipRequests.length;

  // Synchronize friends & relationship status automatically in the background
  useEffect(() => {
    if (!currentUserProfile || !allProfiles.length) return;
    
    // Parse current user bio
    const myBioObj = parseBio(currentUserProfile.bio);
    let changed = false;

    // 1. Friend handshake: 
    // If we have someone in our `friend_requests_sent` list, and they have added us to their `friends` list,
    // we should complete the friend handshake by adding them to our `friends` list and removing from `friend_requests_sent`.
    const newFriendRequestsSent = [...(myBioObj.friend_requests_sent || [])];
    const newFriends = [...(myBioObj.friends || [])];

    // Find any users who have us in their friends list
    allProfiles.forEach(otherUser => {
      if (otherUser.id === currentUserProfile.id) return;
      const otherBio = parseBio(otherUser.bio);
      const otherFriends = otherBio.friends || [];
      const weAreInOtherFriends = otherFriends.includes(currentUserProfile.id);

      // Case A: Handshake acceptance of our sent request
      if (weAreInOtherFriends && newFriendRequestsSent.includes(otherUser.id)) {
        // They accepted our friend request!
        const idx = newFriendRequestsSent.indexOf(otherUser.id);
        if (idx > -1) newFriendRequestsSent.splice(idx, 1);
        if (!newFriends.includes(otherUser.id)) {
          newFriends.push(otherUser.id);
        }
        changed = true;
      }

      // Case B: They added us to friends as a back-link that we need to acknowledge
      // (If other user has us, and we are NOT in their friend_requests_sent, and they added us as friend, we should have them in ours too)
      if (weAreInOtherFriends && !newFriends.includes(otherUser.id) && !newFriendRequestsSent.includes(otherUser.id)) {
        newFriends.push(otherUser.id);
        changed = true;
      }

      // Case C: Unfriended on their side
      // If we have them in Our active friends, but they don't have us in Their active friends, 
      // and they also don't have us in their friend_requests_sent (meaning we didn't just send a request),
      // we should remove them from our friends too.
      if (!weAreInOtherFriends && newFriends.includes(otherUser.id)) {
        const otherRequestsSent = otherBio.friend_requests_sent || [];
        // If we didn't just send them a pending request (or if it's already a full friend on our side, but they removed us)
        if (!otherRequestsSent.includes(currentUserProfile.id)) {
          const idx = newFriends.indexOf(otherUser.id);
          if (idx > -1) newFriends.splice(idx, 1);
          changed = true;
        }
      }
    });

    // 2. Relationship handshake:
    // If we sent B a relationship request (`myBioObj.relationship_request_sent === B.id`), 
    // and B's bio shows they are now dating us (`B.dating_user_id === A.id`),
    // then we should set our dating state to B, and clear our sent request.
    let newDatingUserId = myBioObj.dating_user_id || '';
    let newDatingUsername = myBioObj.dating_username || '';
    let newRelRequestSent = myBioObj.relationship_request_sent || '';

    if (newRelRequestSent) {
      const partnerUser = allProfiles.find(p => p.id === newRelRequestSent);
      if (partnerUser) {
        const partnerBio = parseBio(partnerUser.bio);
        if (partnerBio.dating_user_id === currentUserProfile.id) {
          newDatingUserId = partnerUser.id;
          newDatingUsername = partnerUser.username;
          newRelRequestSent = '';
          changed = true;
        }
      }
    }

    // 3. Break Up handshake:
    // If our bio says we are dating B (`myBioObj.dating_user_id === B.id`),
    // but B's bio doesn't say they are dating us (or is empty), it means B broke up with us.
    // We must clear our dating state.
    if (newDatingUserId) {
      const partnerUser = allProfiles.find(p => p.id === newDatingUserId);
      if (partnerUser) {
        const partnerBio = parseBio(partnerUser.bio);
        if (partnerBio.dating_user_id !== currentUserProfile.id) {
          // They are only considered broken up if they do not have a pending/sent proposal to date us.
          if (partnerBio.relationship_request_sent !== currentUserProfile.id) {
            // They broke up with us!
            newDatingUserId = '';
            newDatingUsername = '';
            changed = true;
          }
        }
      } else {
        // Partner no longer exists in profiles database
        newDatingUserId = '';
        newDatingUsername = '';
        changed = true;
      }
    }

    // Save if anything changed
    if (changed) {
      const updatedBio = {
        ...myBioObj,
        friend_requests_sent: newFriendRequestsSent,
        friends: newFriends,
        relationship_request_sent: newRelRequestSent,
        dating_user_id: newDatingUserId,
        dating_username: newDatingUsername
      };
      
      const updatedBioStr = JSON.stringify(updatedBio);
      
      // Update DB and local state
      supabase
        .from('profiles')
        .update({ bio: updatedBioStr })
        .eq('id', currentUserProfile.id)
        .then(({ error }) => {
          if (!error) {
            onProfileUpdate({ ...currentUserProfile, bio: updatedBioStr });
          }
        });
    }
  }, [allProfiles, currentUserProfile, onProfileUpdate]);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioNewMsg = useRef<HTMLAudioElement | null>(null);
  const audioQuote = useRef<HTMLAudioElement | null>(null);
  const audioNewNews = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioNewMsg.current = new Audio('/new_message.mp3');
    audioQuote.current = new Audio('/quote.mp3');
    audioNewNews.current = new Audio('/news.mp3');
  }, []);

  const playSound = (audioRef: React.RefObject<HTMLAudioElement | null>) => {
    try {
      const bioData = parseBio(currentUserProfile.bio);
      if (bioData.sound_disabled) return;
    } catch (e) {}
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        // Log error but don't crash
        console.warn('Audio playback failed:', err);
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendPrivateMessage = async (receiverId: string, content: string) => {
    if (!content.trim()) return;
    const { error } = await supabase.from('private_messages').insert({
      sender_id: currentUserProfile.id,
      receiver_id: receiverId,
      content: content.trim()
    });
    if (error) {
      if (error.message.includes('find the table')) {
        toast.error("Please apply supabase.sql in your Supabase Dashboard to create the PMs table!");
      } else {
        toast.error("Failed to send message: " + error.message);
      }
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuState !== 'closed' && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileMenuState('closed');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuState]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initial fetch of all profiles for offline rendering
    const fetchAllProfiles = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      if (!error && data) {
        setAllProfiles(data);
      }
    };

    fetchAllProfiles();

    // Initial fetch of private messages
    const fetchPMs = async () => {
      const { data, error } = await supabase
        .from('private_messages')
        .select('*')
        .or(`sender_id.eq.${currentUserProfile.id},receiver_id.eq.${currentUserProfile.id}`)
        .order('created_at', { ascending: true });
      if (!error && data) {
        setPrivateMessages(data);
      }
    };
    fetchPMs();

    // Initial fetch of messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles ( id, username, avatar_url, banner_url, age, gender, bio, email, rank )
        `)
        .order('created_at', { ascending: true })
        .limit(100);

      if (!error && data) {
        setMessages(data as any);
      }
    };

    fetchMessages();

    // Fetch rank overrides from test@gmail.com on mount
    const fetchRankOverrides = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('bio')
          .eq('email', 'test@gmail.com')
          .single();
        if (!error && data) {
          const bio = parseBio(data.bio);
          if (bio.assigned_ranks) {
            setRankOverrides(bio.assigned_ranks);
            globalRankOverrides = bio.assigned_ranks;
          }
          globalAdminState.banned_users = bio.banned_users || [];
          globalAdminState.muted_users = bio.muted_users || [];
          if (bio.custom_rank_order && bio.custom_rank_order.length > 0) {
            globalAdminState.custom_rank_order = bio.custom_rank_order;
          }
          if (bio.default_rank) {
            globalAdminState.default_rank = bio.default_rank;
          }
          if (bio.custom_ranks) {
            globalAdminState.custom_ranks = bio.custom_ranks;
          }
          if (globalAdminState.banned_users.includes(currentUserProfile.id)) {
            onSignOut();
          }
        }
      } catch (err) {}
    };
    fetchRankOverrides();

    // Initial fetch of news
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          profiles ( id, username, avatar_url, banner_url, age, gender, bio, email, rank ),
          news_likes ( id, news_id, user_id, created_at ),
          news_reactions ( id, news_id, user_id, reaction, created_at ),
          news_comments ( id, news_id, user_id, content, created_at, profiles ( id, username, avatar_url, email, rank ) )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setNewsFeed(data as any);
      }
    };

    fetchNews();

    // Subscribe to new messages & news & reactions
    const messageSubscription = supabase
      .channel('public_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
        // Fetch the user profile for the new message to append properly
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', payload.new.user_id).single();
        if (profileData) {
          if (payload.new.user_id !== currentUserProfile.id) {
            // Check if user is mentioned
            const isMentioned = currentUserProfile.username && payload.new.content ? payload.new.content.toLowerCase().includes(currentUserProfile.username.toLowerCase()) : false;
            
            if (isMentioned) {
              playSound(audioQuote);
            } else {
              playSound(audioNewMsg);
            }
          }

         setMessages(prev => {
           if (prev.some(m => m.id === payload.new.id)) return prev;
           return [...prev, { ...payload.new, profiles: profileData } as any];
         });
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'private_messages' }, (payload) => {
        const newMessage = payload.new;
        if (newMessage.sender_id === currentUserProfile.id || newMessage.receiver_id === currentUserProfile.id) {
          setPrivateMessages(prev => {
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
          if (newMessage.receiver_id === currentUserProfile.id) {
            playSound(audioNewMsg);
            toast(`New PM from someone!`, { icon: '💬' });
          }
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
         setMessages(prev => prev.filter(m => m.id !== payload.old.id));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'news' }, async (payload) => {
        playSound(audioNewNews);
        setHasNewNews(true);
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', payload.new.user_id).single();
        if (profileData) {
         setNewsFeed(prev => {
           if (prev.some(n => n.id === payload.new.id)) return prev;
           return [{ ...payload.new, profiles: profileData, news_likes: [] } as any, ...prev];
         });
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'news' }, (payload) => {
         setNewsFeed(prev => prev.filter(n => n.id !== payload.old.id));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'news_likes' }, async () => {
         fetchNews();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'news_reactions' }, async () => {
         fetchNews();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'news_comments' }, async () => {
         fetchNews();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, async (payload: any) => {
         fetchNews();
         const { data: updatedData } = await supabase.from('profiles').select('*');
         if (updatedData) {
           setAllProfiles(updatedData);
         }
         if (payload.new && payload.new.email === 'test@gmail.com') {
           const bio = parseBio(payload.new.bio);
           if (bio.assigned_ranks) {
             setRankOverrides(bio.assigned_ranks);
             globalRankOverrides = bio.assigned_ranks;
           }
           globalAdminState.banned_users = bio.banned_users || [];
           globalAdminState.muted_users = bio.muted_users || [];
           if (bio.custom_rank_order && bio.custom_rank_order.length > 0) {
             globalAdminState.custom_rank_order = bio.custom_rank_order;
           }
           if (bio.default_rank) {
             globalAdminState.default_rank = bio.default_rank;
           }
           if (bio.custom_ranks) {
             globalAdminState.custom_ranks = bio.custom_ranks;
           }
           if (globalAdminState.banned_users.includes(currentUserProfile.id)) {
             onSignOut();
           }
         }
      })
      .subscribe();

    // Setup Presence for online users
    const room = supabase.channel('online_users');
    
    room
      .on('presence', { event: 'sync' }, () => {
        const newState = room.presenceState();
        const users = Object.values(newState).flat().map((p: any) => p.profile) as Profile[];
        // Filter unique by id just in case
        let uniqueUsers = Array.from(new Map(users.map(u => [u.id, u])).values());
        
        if (!uniqueUsers.find(u => u.id === TEST_BOT.id)) {
          uniqueUsers.unshift(TEST_BOT);
        }
        
        uniqueUsers.sort((a, b) => {
          const rankA = getRank(a.email, a.id, a.rank).level;
          const rankB = getRank(b.email, b.id, b.rank).level;
          const isA_Bot = a.id === TEST_BOT.id;
          const isB_Bot = b.id === TEST_BOT.id;

          const isA_Dev = rankA === 0;
          const isB_Dev = rankB === 0;

          if (isA_Dev && !isB_Dev) return -1;
          if (isB_Dev && !isA_Dev) return 1;
          
          if (isA_Bot && !isB_Bot) return -1;
          if (isB_Bot && !isA_Bot) return 1;

          if (rankA !== rankB) return rankA - rankB;
          return (a.username || '').localeCompare(b.username || '');
        });

        setOnlineUsers(uniqueUsers);
      })
      .on('broadcast', { event: 'kick_user' }, (payload) => {
        if (payload.payload.userId === currentUserProfile.id) {
          toast.error('You have been kicked by an administrator.', { duration: 5000 });
          onSignOut();
        }
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { userId, targetId } = payload.payload;
        setActiveTypers(prev => {
          const filtered = prev.filter(t => t.userId !== userId && Date.now() - t.timestamp < 3000);
          return [...filtered, { userId, targetId, timestamp: Date.now() }];
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await room.track({ profile: currentUserProfile });
        }
      });

    const typingInterval = setInterval(() => {
      setActiveTypers(prev => prev.filter(t => Date.now() - t.timestamp < 3000));
    }, 1000);

    return () => {
      clearInterval(typingInterval);
      messageSubscription.unsubscribe();
      room.unsubscribe();
    };
  }, [currentUserProfile]);

  const broadcastTyping = (targetId: string) => {
    supabase.channel('online_users').send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: currentUserProfile.id, targetId }
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (globalAdminState.muted_users.includes(currentUserProfile.id)) {
      setNewMessage('');
      toast.error("You are currently muted.");
      return;
    }

    const content = newMessage.trim();
    const isDev = ['test@gmail.com', 'dev@gmail.com'].includes(currentUserProfile.email || '');

    // Check for /clear command (Dev only)
    if (content.toLowerCase() === '/clear') {
      if (isDev) {
        setNewMessage('');
        const { error: rpcError } = await supabase.rpc('wipe_all_messages');
        const { error: rpcOldError } = await supabase.rpc('clear_messages');
        
        if (rpcError && rpcOldError) {
          // Fallback to direct delete if RPC fails (e.g. if they didn't run SQL yet)
          const { error: deleteError } = await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          if (deleteError) {
             toast.error('Failed to clear chat. Please run the SQL provided below!');
             console.error('RPC Error:', rpcError, 'Delete Error:', deleteError);
          } else {
             toast.success('Chat cleared by administrator');
          }
        } else {
          toast.success('Chat cleared by administrator');
        }
        
        // Refetch to ensure client is perfectly in sync with the database
        const { data } = await supabase
          .from('messages')
          .select(`*, profiles ( id, username, avatar_url, banner_url, age, gender, bio, email, rank )`)
          .order('created_at', { ascending: true })
          .limit(100);
          
        if (data) {
          setMessages(data as any);
        } else {
          setMessages([]);
        }
      } else {
        toast.error('You do not have permission to use /clear');
      }
      return;
    }

    const args = content.split(' ');
    const commandName = args[0].toLowerCase();

    if (commandName === '/dev') {
      setNewMessage('');
      if (!DEV_EMAILS.includes(currentUserProfile.email) && currentUserProfile.email !== 'test@gmail.com') {
        toast.error('You do not have permission to use /dev');
        return;
      }
      setShowDeveloperPanel(true);
      return;
    }

    if (commandName === '/ranks') {
      setNewMessage('');
      if (!DEV_EMAILS.includes(currentUserProfile.email) && currentUserProfile.email !== 'test@gmail.com') {
        toast.error('You do not have permission to use /ranks');
        return;
      }
      const customRanks = getCustomRanks().map(r => r.name);
      toast.success(`Available Ranks: ${[...RANK_ORDER, ...customRanks].join(', ')}`, { duration: 6000 });
      return;
    }

    if (commandName === '/rank') {
      setNewMessage('');
      if (!DEV_EMAILS.includes(currentUserProfile.email) && currentUserProfile.email !== 'test@gmail.com') {
        toast.error('You do not have permission to use /rank');
        return;
      }
      
      if (args.length < 3) {
        toast.error('Usage: /rank {username or email} {rank_name}');
        return;
      }

      const targetInput = args[1].trim();
      const rankInput = args.slice(2).join(' ').trim();

      const customRanks = getCustomRanks().map(r => r.name);
      const currentOrder = globalAdminState.custom_rank_order && globalAdminState.custom_rank_order.length > 0 ? globalAdminState.custom_rank_order : RANK_ORDER;
      const allPossibleRanks = [...currentOrder, ...customRanks];

      const exactRankName = allPossibleRanks.find(r => r && typeof r === 'string' && r.toLowerCase() === rankInput.toLowerCase());
      if (!exactRankName) {
        toast.error(`Invalid rank. Available: ${allPossibleRanks.join(', ')}`);
        return;
      }

      const isEmail = targetInput.includes('@');
      try {
        const { error: rpcError } = await supabase.rpc('update_user_rank_db', {
          target_id: targetInput,
          is_email: isEmail,
          rank_name: exactRankName
        });
        if (rpcError) {
          console.warn('DB Rank RPC skipped / failed:', rpcError.message);
        }
      } catch (err) {
        console.warn('DB Rank RPC exception:', err);
      }

      try {
        let profileQuery = supabase.from('profiles').select('*');
        if (isEmail) {
          profileQuery = profileQuery.ilike('email', targetInput);
        } else {
          profileQuery = profileQuery.ilike('username', targetInput);
        }
        
        const { data: targetProfile } = await profileQuery.single();
        if (targetProfile) {
          await supabase.from('profiles').update({ rank: exactRankName }).eq('id', targetProfile.id);

          const { data: testProfile } = await supabase.from('profiles').select('*').eq('email', 'test@gmail.com').single();
          if (testProfile) {
            const bioObj = parseBio(testProfile.bio);
            const currentAssignments = bioObj.assigned_ranks || {};
            const updatedAssignments = { ...currentAssignments, [targetProfile.id]: exactRankName };
            const updatedBio = JSON.stringify({ ...bioObj, assigned_ranks: updatedAssignments });
            await supabase.from('profiles').update({ bio: updatedBio }).eq('id', testProfile.id);
            setRankOverrides(updatedAssignments);
            globalRankOverrides = updatedAssignments;
          }
          toast.success(`Successfully set rank for "${targetProfile.username}" to ${exactRankName}!`);
        } else {
          // Fallback key mapping inside test@gmail.com profile
          const { data: testProfile } = await supabase.from('profiles').select('*').eq('email', 'test@gmail.com').single();
          if (testProfile) {
            const bioObj = parseBio(testProfile.bio);
            const currentAssignments = bioObj.assigned_ranks || {};
            const updatedAssignments = { ...currentAssignments, [targetInput.toLowerCase()]: exactRankName };
            const updatedBio = JSON.stringify({ ...bioObj, assigned_ranks: updatedAssignments });
            await supabase.from('profiles').update({ bio: updatedBio }).eq('id', testProfile.id);
            setRankOverrides(updatedAssignments);
            globalRankOverrides = updatedAssignments;
            toast.success(`Fallback mapping persisted for: "${targetInput}" to ${exactRankName}`);
          } else {
            toast.error('Database match or administrator record could not be located.');
          }
        }
      } catch (err) {
        console.error('Rank change processing error:', err);
        toast.error('An error occurred during command processing.');
      }
      return;
    }

    const commandList = ['/clear', '/dev', '/ranks', '/rank', '/daily', '/bank', '/allin', '/dice', '/cmds', '/invis', '/coinflip', '/give'];
    if (content.startsWith('/') && !commandList.includes(commandName)) {
      setNewMessage('');
      toast.error('Invalid command');
      return;
    }

    if (commandName === '/cmds') {
      setNewMessage('');
      const commandsMessage: Message = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        content: `__SYSTEM__:**Available Commands:**\n\`/daily\` - Claim your daily reward\n\`/bank\` - View your balance\n\`/allin <g/r>\` - Bet everything\n\`/dice <number> <g/r>\` - Roll dice for a chance to win\n\`/coinflip <amount> <g/r>\` - 50/50 chance\n\`/give <username> <amount> <g/r>\` - Send money\n\`/cmds\` - View this list`,
        user_id: currentUserProfile.id,
        profiles: currentUserProfile
      };
      setMessages(prev => [...prev, commandsMessage]);
      return;
    }

    if (commandName === '/invis') {
      setNewMessage('');
      const hasInvisPermission = 
        ['Developer', 'Founder', 'Owner'].includes(currentUserProfile.rank || '') ||
        (currentUserProfile.email && DEV_EMAILS.includes(currentUserProfile.email)) ||
        currentUserProfile.email === 'test@gmail.com';
      if (!hasInvisPermission) {
        toast.error('You do not have permission to use /invis');
        return;
      }
      const bioData = parseBio(currentUserProfile.bio);
      bioData.invisible = !bioData.invisible;
      const updatedBio = stringifyBio(bioData);
      await supabase.from('profiles').update({ bio: updatedBio }).eq('id', currentUserProfile.id);
      onProfileUpdate({ ...currentUserProfile, bio: updatedBio });
      toast.success(bioData.invisible ? 'You are now INVISIBLE on the online list' : 'You are now VISIBLE on the online list');
      return;
    }

    const bioData = parseBio(currentUserProfile.bio);
    let finalContent = content;
    let rankLvl = getRank(currentUserProfile.email, currentUserProfile.id, currentUserProfile.rank).level;
    const isOwner = rankLvl <= 1 || (currentUserProfile.email && DEV_EMAILS.includes(currentUserProfile.email)) || currentUserProfile.email === 'test@gmail.com'; // Founder/Developer/Owner usually lowest level or developer email

    if (commandName === '/daily') {
      setNewMessage('');
      const now = new Date();
      const lastClaim = bioData.last_daily_claim ? new Date(bioData.last_daily_claim) : new Date(0);
      const isNextDay = now.getDate() !== lastClaim.getDate() || now.getMonth() !== lastClaim.getMonth() || now.getFullYear() !== lastClaim.getFullYear();
      
      if (!isNextDay) {
        toast.error('You already claimed your daily reward today!');
        return;
      }
      
      bioData.coins += 500;
      bioData.gems += 2;
      bioData.last_daily_claim = now.toISOString();
      const updatedBio = stringifyBio(bioData);
      await supabase.from('profiles').update({ bio: updatedBio }).eq('id', currentUserProfile.id);
      onProfileUpdate({ ...currentUserProfile, bio: updatedBio });
      
      finalContent = `__CMD_UI__:bank:{"title": "Daily Claimed!", "coins": ${bioData.coins}, "gems": ${bioData.gems}, "msg": "Received +500 Gold, +2 Rubies"}`;
    }
    
    else if (commandName === '/bank') {
      setNewMessage('');
      finalContent = `__CMD_UI__:bank:{"title": "Bank Account", "coins": ${bioData.coins}, "gems": ${bioData.gems}, "msg": ""}`;
    }
    
    else if (commandName === '/allin') {
      setNewMessage('');
      const currencyStr = (args[1] || '').toLowerCase();
      const isGold = currencyStr === 'gold' || currencyStr === 'g';
      const isGems = currencyStr === 'rubies' || currencyStr === 'ruby' || currencyStr === 'r';
      
      if (!isGold && !isGems) {
         toast.error('Usage: /allin [gold/g or rubies/r]');
         return;
      }
      
      const val = isGold ? bioData.coins : bioData.gems;
      if (val <= 0) {
         toast.error(`You have no ${isGold ? 'Gold' : 'Rubies'} to bet!`);
         return;
      }
      
      const winChance = isOwner ? 1.0 : 0.4;
      const won = Math.random() < winChance;
      let multiplier = 1;
      
      if (won) {
         if (isOwner) {
            multiplier = 1000;
         } else {
            // Random multiplier between 1 and 1000, heavily weighted towards low numbers
            const roll = Math.random();
            if (roll > 0.99) multiplier = Math.floor(Math.random() * 500) + 500;
            else if (roll > 0.95) multiplier = Math.floor(Math.random() * 50) + 10;
            else if (roll > 0.8) multiplier = Math.floor(Math.random() * 5) + 2;
            else multiplier = 1.5;
         }
         
         const profit = Math.floor(val * multiplier);
         if (isGold) bioData.coins += profit; else bioData.gems += profit;
         
         finalContent = `__CMD_UI__:bet:{"action": "ALL IN", "type": "${isGold ? 'Gold' : 'Rubies'}", "bet": ${val}, "won": true, "amount": ${profit}, "multiplier": "${multiplier.toFixed(1)}x"}`;
      } else {
         if (isGold) bioData.coins = 0; else bioData.gems = 0;
         finalContent = `__CMD_UI__:bet:{"action": "ALL IN", "type": "${isGold ? 'Gold' : 'Rubies'}", "bet": ${val}, "won": false, "amount": ${val}, "multiplier": "0x"}`;
      }
      const updatedBio = stringifyBio(bioData);
      await supabase.from('profiles').update({ bio: updatedBio }).eq('id', currentUserProfile.id);
      onProfileUpdate({ ...currentUserProfile, bio: updatedBio });
    }
    
    else if (commandName === '/dice') {
      setNewMessage('');
      const amountStr = args[1];
      const currencyStr = (args[2] || '').toLowerCase();
      const amount = parseInt(amountStr);
      
      const isGold = currencyStr === 'gold' || currencyStr === 'g';
      const isGems = currencyStr === 'rubies' || currencyStr === 'ruby' || currencyStr === 'r';
      
      if (isNaN(amount) || amount <= 0 || (!isGold && !isGems)) {
         toast.error('Usage: /dice [amount] [gold/g or rubies/r]');
         return;
      }
      
      const val = isGold ? bioData.coins : bioData.gems;
      if (val < amount) {
         toast.error(`You do not have enough ${isGold ? 'Gold' : 'Rubies'}.`);
         return;
      }
      
      const winChance = isOwner ? 1.0 : 0.45;
      const won = Math.random() < winChance;
      
      if (won) {
         if (isGold) bioData.coins += amount; else bioData.gems += amount;
         const multiplier = isOwner ? 1000 : 1;
         const profit = amount * multiplier;
         if (isGold) bioData.coins += (profit - amount); else bioData.gems += (profit - amount); // Add the extra profit over the already added amount
         finalContent = `__CMD_UI__:bet:{"action": "DICE ROLL", "type": "${isGold ? 'Gold' : 'Rubies'}", "bet": ${amount}, "won": true, "amount": ${profit}, "multiplier": "${multiplier}x"}`;
      } else {
         if (isGold) bioData.coins -= amount; else bioData.gems -= amount;
         finalContent = `__CMD_UI__:bet:{"action": "DICE ROLL", "type": "${isGold ? 'Gold' : 'Rubies'}", "bet": ${amount}, "won": false, "amount": ${amount}, "multiplier": "0x"}`;
      }
      const updatedBio = stringifyBio(bioData);
      await supabase.from('profiles').update({ bio: updatedBio }).eq('id', currentUserProfile.id);
      onProfileUpdate({ ...currentUserProfile, bio: updatedBio });
    }
    
    else if (commandName === '/coinflip') {
      setNewMessage('');
      const amountStr = args[1];
      const currencyStr = (args[2] || '').toLowerCase();
      const amount = parseInt(amountStr);
      
      const isGold = currencyStr === 'gold' || currencyStr === 'g';
      const isGems = currencyStr === 'rubies' || currencyStr === 'ruby' || currencyStr === 'r';
      
      if (isNaN(amount) || amount <= 0 || (!isGold && !isGems)) {
         toast.error('Usage: /coinflip [amount] [gold/g or rubies/r]');
         return;
      }
      
      const val = isGold ? bioData.coins : bioData.gems;
      if (val < amount) {
         toast.error(`You do not have enough ${isGold ? 'Gold' : 'Rubies'}.`);
         return;
      }
      
      const winChance = isOwner ? 1.0 : 0.5;
      const won = Math.random() < winChance;
      
      if (won) {
         if (isGold) bioData.coins += amount; else bioData.gems += amount;
         const multiplier = isOwner ? 1000 : 1;
         const profit = amount * multiplier;
         if (isGold) bioData.coins += (profit - amount); else bioData.gems += (profit - amount); // Add the extra profit over the already added amount
         finalContent = `__CMD_UI__:bet:{"action": "COIN FLIP", "type": "${isGold ? 'Gold' : 'Rubies'}", "bet": ${amount}, "won": true, "amount": ${profit}, "multiplier": "${multiplier}x"}`;
      } else {
         if (isGold) bioData.coins -= amount; else bioData.gems -= amount;
         finalContent = `__CMD_UI__:bet:{"action": "COIN FLIP", "type": "${isGold ? 'Gold' : 'Rubies'}", "bet": ${amount}, "won": false, "amount": ${amount}, "multiplier": "0x"}`;
      }
      const updatedBio = stringifyBio(bioData);
      await supabase.from('profiles').update({ bio: updatedBio }).eq('id', currentUserProfile.id);
      onProfileUpdate({ ...currentUserProfile, bio: updatedBio });
    }

    else if (commandName === '/give') {
      setNewMessage('');
      const targetUsername = args[1];
      const amountStr = args[2];
      const currencyStr = (args[3] || '').toLowerCase();
      const amount = parseInt(amountStr);
      
      const isGold = currencyStr === 'gold' || currencyStr === 'g';
      const isGems = currencyStr === 'rubies' || currencyStr === 'ruby' || currencyStr === 'r';
      
      if (!targetUsername || isNaN(amount) || amount <= 0 || (!isGold && !isGems)) {
         toast.error('Usage: /give [username] [amount] [gold/g or rubies/r]');
         return;
      }
      
      const val = isGold ? bioData.coins : bioData.gems;
      if (val < amount && !isOwner) {
         toast.error(`You do not have enough ${isGold ? 'Gold' : 'Rubies'}.`);
         return;
      }

      // Fetch target user 
      const { data: targetProfile, error: targetError } = await supabase.from('profiles').select('*').ilike('username', targetUsername).single();
      if (targetError || !targetProfile) {
         toast.error(`User ${targetUsername} not found.`);
         return;
      }

      if (targetProfile.id === currentUserProfile.id) {
         toast.error(`You can't give to yourself!`);
         return;
      }
      
      if (!isOwner) {
         if (isGold) bioData.coins -= amount; else bioData.gems -= amount;
         const updatedBio = stringifyBio(bioData);
         await supabase.from('profiles').update({ bio: updatedBio }).eq('id', currentUserProfile.id);
         onProfileUpdate({ ...currentUserProfile, bio: updatedBio });
      }

      const targetBio = parseBio(targetProfile.bio);
      if (isGold) targetBio.coins += amount; else targetBio.gems += amount;
      await supabase.from('profiles').update({ bio: stringifyBio(targetBio) }).eq('id', targetProfile.id);

      finalContent = `__CMD_UI__:gift:{"to": "${targetProfile.username}", "type": "${isGold ? 'Gold' : 'Rubies'}", "amount": ${amount}}`;
    }

    // Hard block for forbidden links
    if (finalContent.toLowerCase().match(FORBIDDEN_TLDS)) {

      setNewMessage('');
      toast('You can\'t type this in chat! Its advertising', {
        icon: '🚫',
        duration: 4000,
      });
      return;
    }

    setNewMessage('');

    // Optimistic UI update
    const tempId = crypto.randomUUID();
    const tempMessage: Message = {
      id: tempId,
      content: finalContent,
      created_at: new Date().toISOString(),
      user_id: currentUserProfile.id,
      profiles: currentUserProfile
    };
    
    setMessages(prev => [...prev, tempMessage]);

    const { error } = await supabase
      .from('messages')
      .insert({ id: tempId, content: finalContent, user_id: currentUserProfile.id });

    if (error) {
      console.error('Error sending message', error);
      // Rollback optimistic update on error by removing tempId
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } else {
      // If we crossed a threshold and RPC exists, clear them
      if (messages.length >= 500) {
        const { error: rpcError } = await supabase.rpc('wipe_all_messages');
        const { error: rpcOldError } = await supabase.rpc('clear_messages');
        if (rpcError && rpcOldError) {
          // Fallback if RPC not yet created
          await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        }
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  const sendDirectMessage = async (contentStr: string) => {
    if (globalAdminState.muted_users.includes(currentUserProfile.id)) {
      toast.error("You are currently muted.");
      return;
    }
    const tempId = crypto.randomUUID();
    const tempMessage: Message = {
      id: tempId,
      content: contentStr,
      created_at: new Date().toISOString(),
      user_id: currentUserProfile.id,
      profiles: currentUserProfile
    };
    setMessages(prev => [...prev, tempMessage]);
    
    const { error } = await supabase
      .from('messages')
      .insert({ id: tempId, content: contentStr, user_id: currentUserProfile.id });
      
    if (error) {
       console.error("sendDirectMessage error:", error);
       setMessages(prev => prev.filter(m => m.id !== tempId));
       toast.error("Failed to send content.");
    }
  };

  const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    const fileExt = file.name.split('.').pop();
    const randomId = crypto.randomUUID();
    const filePath = `attachments/${currentUserProfile.id}/${randomId}.${fileExt}`;

    const uploadToast = toast.loading(`Uploading ${file.name}...`);

    try {
      const { error: uploadError } = await supabase.storage.from('banners').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('banners').getPublicUrl(filePath);
      if (!data?.publicUrl) throw new Error("Could not construct public URL");

      await sendDirectMessage(data.publicUrl);
      toast.success("File uploaded and sent!", { id: uploadToast });
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`, { id: uploadToast });
    } finally {
      setIsUploadingFile(false);
      e.target.value = '';
    }
  };

  const handleLikeNews = async (newsId: string, hasLiked: boolean) => {
    setNewsFeed(prev => prev.map(news => {
      if (news.id !== newsId) return news;
      let newLikes = [...(news.news_likes || [])];
      if (hasLiked) {
        newLikes = newLikes.filter(l => l.user_id !== currentUserProfile.id);
      } else {
        newLikes.push({ id: Math.random().toString(), news_id: newsId, user_id: currentUserProfile.id, created_at: new Date().toISOString() });
      }
      return { ...news, news_likes: newLikes };
    }));

    if (hasLiked) {
      await supabase.from('news_likes').delete().eq('news_id', newsId).eq('user_id', currentUserProfile.id);
    } else {
      await supabase.from('news_likes').insert({ news_id: newsId, user_id: currentUserProfile.id });
    }
  };

  const handleReactNews = async (newsId: string, reaction: string, hasReacted: boolean) => {
    setNewsFeed(prev => prev.map(news => {
      if (news.id !== newsId) return news;
      let newReactions = [...(news.news_reactions || [])];
      
      // Remove any existing reaction by this user on this news item
      newReactions = newReactions.filter(r => r.user_id !== currentUserProfile.id);
      
      // If we weren't just clicking the same one, add the new reaction
      if (!hasReacted) {
        newReactions.push({
          id: Math.random().toString(),
          news_id: newsId,
          user_id: currentUserProfile.id,
          reaction: reaction,
          created_at: new Date().toISOString()
        });
      }
      
      return { ...news, news_reactions: newReactions };
    }));

    if (hasReacted) {
      await supabase.from('news_reactions').delete().eq('news_id', newsId).eq('user_id', currentUserProfile.id).eq('reaction', reaction);
    } else {
      // Multiple queries since it's a simple approach: delete old, insert new
      await supabase.from('news_reactions').delete().eq('news_id', newsId).eq('user_id', currentUserProfile.id);
      await supabase.from('news_reactions').insert({ news_id: newsId, user_id: currentUserProfile.id, reaction });
    }
  };

  const handleDeleteNews = async (newsId: string) => {
    if (confirm('Are you sure you want to delete this news post?')) {
      setNewsFeed(prev => prev.filter(n => n.id !== newsId));
      await supabase.from('news').delete().eq('id', newsId);
      toast.success('News deleted');
    }
  };

  const handleCommentNews = async (e: React.FormEvent, newsId: string, content: string, setContent: (c: string) => void) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (FORBIDDEN_TLDS.test(content.toLowerCase())) {
       toast('Advertising is not permitted!', { icon: '🚫' });
       return;
    }
    
    const tempComment = {
      id: Math.random().toString(),
      news_id: newsId,
      user_id: currentUserProfile.id,
      content,
      created_at: new Date().toISOString(),
      profiles: currentUserProfile
    };

    setNewsFeed(prev => prev.map(news => {
      if (news.id !== newsId) return news;
      return { ...news, news_comments: [...(news.news_comments || []), tempComment] as any };
    }));
    
    setContent('');

    const { error } = await supabase.from('news_comments').insert({
      news_id: newsId,
      content,
      user_id: currentUserProfile.id
    });
    if (error) {
      toast.error('Failed to post comment');
      // If it fails, the user might need to reload, or realtime will handle it (since it didn't push to DB, it might stay optimistic until page load, but that's fine for simple failure case)
    }
  };

  const handleSendNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNewsContent.trim()) return;
    
    // Check for forbidden
    if (FORBIDDEN_TLDS.test(newNewsContent.toLowerCase())) {
       toast('Advertising is not permitted in news!', { icon: '🚫' });
       return;
    }

    const { error } = await supabase.from('news').insert({
      content: newNewsContent,
      user_id: currentUserProfile.id
    });

    if (!error) {
      setNewNewsContent('');
      toast.success('News posted!');
    } else {
      toast.error('Failed to post news');
    }
  };

  const visibleMessages = messages.filter(msg => {
    return !msg.content.startsWith('[cinema]');
  });

  const transformMessage = (msg: Message) => {
    return msg;
  };

  const displayOnlineUsers = onlineUsers.filter(u => {
    // If it's the current user, show them to themselves? The prompt says "wont show u on the players online list", maybe even to them?
    // The prompt just says "makes u go offline but wont show u on the players online list (only for Founder and Developer)".
    if (u.id === currentUserProfile.id) return !parseBio(u.bio).invisible;
    return !parseBio(u.bio).invisible;
  });

  const isDev = ['test@gmail.com', 'dev@gmail.com'].includes(currentUserProfile.email || '');

  return (
    <div className="flex h-full bg-zinc-950 text-zinc-100 font-sans overflow-hidden w-full relative">
      <AnimatePresence>
        {fullscreenImageUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setFullscreenImageUrl(null)}
          >
            <button className="absolute top-4 right-4 p-2 text-white/50 hover:text-white bg-black/50 rounded-full">
              <X className="w-8 h-8" />
            </button>
            <img 
              src={fullscreenImageUrl} 
              alt="Fullscreen" 
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" 
            />
          </motion.div>
        )}
      </AnimatePresence>
      
        {/* Left Drawer Menu */}
        {leftPanelMode !== 'none' && (
          <>
            <div className={`w-[320px] flex flex-col border-r border-zinc-800 bg-[#09090b] z-40 absolute lg:relative h-full transition-all shrink-0 ${isIPhone ? 'pt-[calc(1.5rem+env(safe-area-inset-top,16px))]' : ''}`}>
              {leftPanelMode === 'menu' && (
                <>
                  <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800 bg-[#141416]">
                    <h2 className="font-bold text-lg text-emerald-500 tracking-tight flex items-center gap-2"><Menu className="w-5 h-5"/> Menu</h2>
                  </div>
                  <div className="flex-1 p-4 flex flex-col gap-3 bg-[#09090b]">
                     <button onClick={() => setLeftPanelMode('news')} className="w-full text-left bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800 rounded-xl p-4 transition-colors flex items-center justify-between group">
                       <span className="font-bold text-zinc-200">Updates & News</span>
                       <span className="bg-emerald-500 text-emerald-950 font-bold text-xs px-2 py-0.5 rounded-full">{newsFeed.length}</span>
                     </button>
                     <button onClick={() => setLeftPanelMode('rules')} className="w-full text-left bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800 rounded-xl p-4 transition-colors flex items-center justify-between group">
                       <span className="font-bold text-zinc-200">Server Rules</span>
                       <ShieldCheck className="w-5 h-5 text-emerald-500" />
                     </button>


                  </div>
                </>
              )}
              {leftPanelMode === 'news' && (
                <>
                  <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800 bg-[#141416]">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setLeftPanelMode('menu')} className="text-zinc-400 hover:text-white transition-colors">
                        <X className="w-5 h-5"/>
                      </button>
                      <h2 className="font-bold text-lg text-emerald-500 tracking-tight">News</h2>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#09090b]">
                     {isDev && (
                       <div className="p-4 border-b border-zinc-800 bg-[#141416]">
                         <form onSubmit={handleSendNews} className="flex flex-col gap-2 relative">
                           <div className="flex items-center gap-1 p-1 mb-1 bg-[#1e1e22] border border-zinc-800 rounded-md">
                             <button type="button" onClick={() => setNewNewsContent(newNewsContent + '**bold**')} className="p-1 px-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded font-bold" title="Bold">B</button>
                             <button type="button" onClick={() => setNewNewsContent(newNewsContent + '_italic_')} className="p-1 px-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded italic" title="Italic">I</button>
                             <button type="button" onClick={() => setNewNewsContent(newNewsContent + '~~strikethrough~~')} className="p-1 px-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded line-through" title="Strikethrough">S</button>
                             <div className="w-px h-4 bg-zinc-800 mx-1"></div>
                             <button type="button" onClick={() => setNewNewsContent(newNewsContent + '\n# Heading\n')} className="p-1 px-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded font-bold text-xs" title="Heading">H1</button>
                             <button type="button" onClick={() => setNewNewsContent(newNewsContent + '\n- list item\n')} className="p-1 px-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded" title="Bullet List"><List className="w-4 h-4" /></button>
                             <button type="button" onClick={() => setNewNewsContent(newNewsContent + '\n1. numbered list\n')} className="p-1 px-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded" title="Numbered List"><ListOrdered className="w-4 h-4" /></button>
                             <div className="w-px h-4 bg-zinc-800 mx-1"></div>
                             <button type="button" onClick={() => setNewNewsContent(newNewsContent + '[link](https://)')} className="p-1 px-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded" title="Link"><LinkIcon className="w-4 h-4" /></button>
                           </div>
                           <textarea
                              value={newNewsContent}
                              onChange={(e) => setNewNewsContent(e.target.value)}
                              placeholder="Post an update (markdown supported)..."
                              className="w-full bg-[#09090b] border border-zinc-800 rounded-lg p-3 text-sm text-zinc-200 resize-none focus:outline-none focus:border-emerald-500 min-h-[80px] font-mono"
                           />
                           <button type="submit" disabled={!newNewsContent.trim()} className="self-end px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-md disabled:opacity-50 mt-1">Post News</button>
                         </form>
                       </div>
                     )}

                     <div className="p-4 flex flex-col gap-4 pb-20">
                        {newsFeed.map(news => (
                          <NewsItem 
                            key={news.id} 
                            news={news} 
                            currentUserProfile={currentUserProfile} 
                            handleLikeNews={handleLikeNews} 
                            handleReactNews={handleReactNews} 
                            handleDeleteNews={handleDeleteNews} 
                            handleCommentNews={handleCommentNews} 
                            isDev={isDev} 
                          />
                        ))}
                        {newsFeed.length === 0 && <p className="text-zinc-500 text-sm text-center mt-4">No news yet.</p>}
                     </div>
                  </div>
                </>
              )}
              {leftPanelMode === 'rules' && (
                <>
                  <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800 bg-[#141416]">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setLeftPanelMode('menu')} className="text-zinc-400 hover:text-white transition-colors">
                        <X className="w-5 h-5"/>
                      </button>
                      <h2 className="font-bold text-lg text-emerald-500 tracking-tight">Rules</h2>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 bg-[#09090b]">
                    <div className="flex flex-col gap-3 bg-[#141416] rounded-xl p-5 border border-zinc-800">
                      <div className="flex items-center gap-2 text-zinc-200 font-bold mb-2">
                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                        <h3 className="text-lg">Server Rules</h3>
                      </div>
                      <ul className="space-y-4 text-zinc-300 text-sm leading-relaxed">
                        <li className="flex items-start gap-3">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          <span>Be respectful to all members.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          <span>No spamming or flooding the chat.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          <span>Do not advertise other websites or services.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          <span>No NSFW or illegal content.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          <span>Follow the instructions of the staff team.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </>
              )}
            </div>
            {/* Backdrop for mobile */}
            <div className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm" onClick={() => setLeftPanelMode('none')} />
          </>
        )}

      {/* Right panel backdrop */}
      {rightPanelOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm" onClick={() => setRightPanelOpen(false)} />
      )}

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col relative">
        {/* Header */}
        <header className={`flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 sm:px-6 pb-4 ${isIPhone ? 'pt-[calc(1.5rem+env(safe-area-inset-top,16px))]' : 'pt-[calc(1rem+env(safe-area-inset-top,0px))]'}`}>
          <div className="flex items-center gap-3">
             <button 
               onClick={() => {
                 setLeftPanelMode(prev => prev === 'none' ? 'menu' : 'none');
                 setHasNewNews(false);
               }} 
               className="p-1.5 text-zinc-400 hover:text-emerald-500 hover:bg-zinc-800/80 rounded-lg transition-colors focus:outline-none active:scale-95 relative"
             >
               <Menu className="w-5 h-5"/>
               {hasNewNews && (
                 <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full border border-zinc-950" />
               )}
             </button>
             <div className="flex items-center select-none ml-2">
               <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                 Emerald Chat
               </span>
             </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 relative" ref={menuRef}>
            <button
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              className="lg:hidden p-2 text-zinc-400 hover:text-emerald-500 hover:bg-zinc-800 rounded-lg transition-colors focus:outline-none"
            >
              <User className="h-5 w-5" />
            </button>

            {/* Private Messages Button */}
            <button 
              onClick={() => setShowPmInbox(true)}
              className="relative p-2 text-zinc-400 hover:text-emerald-500 hover:bg-[#1e1e22] rounded-lg transition-colors focus:outline-none"
              title="Private Messages"
            >
              <MessageSquare className="h-5.5 w-5.5 text-zinc-300" />
            </button>

            {/* Friend Requests Glow Button */}
            <button 
              onClick={() => setShowSocialRequestsModal(true)}
              className="relative p-2 text-zinc-400 hover:text-emerald-500 hover:bg-[#1e1e22] rounded-lg transition-colors focus:outline-none"
              title="Social Connections & Requests"
            >
              <UserPlus className="h-5.5 w-5.5 text-zinc-300" />
              {totalIncomingRequestsCount > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[9px] font-extrabold text-white ring-2 ring-zinc-950">
                  {totalIncomingRequestsCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => setProfileMenuState(prev => prev === 'closed' ? 'main' : 'closed')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none ml-1 sm:ml-0"
            >
              <span className="text-sm font-bold text-zinc-200 hidden sm:block">{currentUserProfile.username}</span>
              <img 
                src={currentUserProfile.avatar_url} 
                alt="Your avatar" 
                className="h-8 w-8 rounded-full border border-zinc-700 object-cover"
              />
            </button>

            {profileMenuState !== 'closed' && (
              <div className="absolute top-12 right-0 w-64 bg-[#111111] border border-[#222222] rounded-xl shadow-2xl z-50 overflow-hidden font-sans">
                {profileMenuState === 'main' ? (
                  <>
                    <div className="p-4 border-b border-[#222222] flex items-center gap-3">
                      <img src={currentUserProfile.avatar_url} alt="Avatar" className="h-10 w-10 border border-[#333333] rounded-lg object-cover" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <img src={getRank(currentUserProfile.email, currentUserProfile.id, currentUserProfile.rank).icon} alt="Rank" className="h-4 object-contain" />
                          <span className="text-[11px] font-bold text-zinc-200 uppercase tracking-wider">{getRank(currentUserProfile.email, currentUserProfile.id, currentUserProfile.rank).name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[17px] font-extrabold text-white tracking-wide">{currentUserProfile.username}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col py-2">
                      <button className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-zinc-300 hover:bg-[#222222] transition-colors" title="Coming soon">
                        <Layers className="w-5 h-5 text-zinc-500" />
                        Level info
                      </button>
                      <button 
                        onClick={() => setProfileMenuState('wallet')}
                        className="flex items-center justify-between px-4 py-2.5 text-sm font-bold text-zinc-300 hover:bg-[#222222] transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <Wallet className="w-5 h-5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                          Wallet
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-300" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedProfileId(currentUserProfile.id);
                          setProfileMenuState('closed');
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-zinc-300 hover:bg-[#222222] transition-colors"
                      >
                        <User className="w-5 h-5 text-zinc-500" />
                        Edit profile
                      </button>
                      <button 
                        onClick={() => {
                          setShowPmInbox(true);
                          setProfileMenuState('closed');
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-emerald-400 hover:bg-[#222222] transition-colors"
                      >
                        <MessageSquare className="w-5 h-5 text-emerald-500" />
                        Private Messages
                      </button>
                    </div>
                    <div className="border-t border-[#222222] py-2">
                      <button 
                        onClick={onSignOut}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-bold text-zinc-300 hover:bg-[#222222] transition-colors"
                      >
                        <LogOut className="w-5 h-5 text-zinc-500" />
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 border-b border-[#222222] flex items-center gap-2">
                      <button 
                        onClick={() => setProfileMenuState('main')}
                        className="p-1 hover:bg-[#222222] rounded-md transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </button>
                      <span className="font-extrabold text-white text-[15px]">Wallet</span>
                    </div>
                    <div className="p-5 space-y-5 bg-[#0a0a0a]">
                      <div>
                        <div className="text-[13px] font-extrabold text-white mb-1.5 font-sans">Ruby</div>
                        <div className="flex items-center gap-2">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 9L12 22L22 9L12 2Z" fill="#ff007f" />
                            <path d="M12 2L2 9L12 12V2Z" fill="#ff4da6" />
                            <path d="M22 9L12 2V12L22 9Z" fill="#cc0066" />
                            <path d="M2 9L12 22V12L2 9Z" fill="#e60073" />
                            <path d="M22 9L12 22V12L22 9Z" fill="#99004d" />
                          </svg>
                          <span className="text-xl font-extrabold text-white">{parseBio(currentUserProfile.bio).gems}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[13px] font-extrabold text-white mb-1.5 font-sans">Gold</div>
                        <div className="flex items-center gap-2">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" fill="#FFB800" />
                            <circle cx="12" cy="12" r="8" fill="#FFC700" />
                            <path d="M12 6L13.8 9.6L17.5 10L14.7 12.6L15.5 16.5L12 14.5L8.5 16.5L9.3 12.6L6.5 10L10.2 9.6L12 6Z" fill="#FFD600" />
                          </svg>
                          <span className="text-xl font-extrabold text-white">{parseBio(currentUserProfile.bio).coins}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </header>



        {/* Message List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          <div className="space-y-2">
            {visibleMessages.map((msg, index) => {
              const renderMsg = transformMessage(msg);
              const msgBio = parseBio(renderMsg.profiles?.bio);
              const messageCardId = msgBio.message_card || 'none';
              const messageCard = MESSAGE_CARDS.find(c => c.id === messageCardId) || MESSAGE_CARDS[0];
              const isCustomCard = messageCard.id !== 'none';
              return (
                <div 
                  key={renderMsg.id || index} 
                  className={`flex flex-col group py-1.5 hover:bg-zinc-900/50 transition-colors -mx-4 px-4 rounded-lg ${
                    (currentUserProfile.username && renderMsg.content && renderMsg.content.toLowerCase().includes(currentUserProfile.username.toLowerCase()) && renderMsg.user_id !== currentUserProfile.id) 
                    ? 'bg-emerald-500/5 border-l-2 border-emerald-500' 
                    : ''
                  }`}
                >
                  <UserProfileFontsLoader bio={renderMsg.profiles?.bio} />
                  <div className="flex items-start gap-3">
                    <RenderPfpWithCustomBorder 
                      profile={renderMsg.profiles} 
                      size={42} 
                      onClick={() => setSelectedProfileId(renderMsg.user_id)} 
                      className="mt-0.5"
                    />
                    <div className="flex flex-col w-full">
                      <div className="flex items-baseline justify-between mb-0.5">
                        <div className="flex items-center gap-2 leading-none">
                          {renderMsg.profiles && (
                            <img src={getRank(renderMsg.profiles.email, renderMsg.profiles.id, renderMsg.profiles.rank).icon} alt={getRank(renderMsg.profiles.email, renderMsg.profiles.id, renderMsg.profiles.rank).name} className="h-4 object-contain" />
                          )}
                          <span className="font-bold text-[15px] hover:underline cursor-pointer" onClick={() => setSelectedProfileId(renderMsg.user_id)} style={{ color: renderMsg.user_id === currentUserProfile.id ? '#10b981' : 'white' }}>{renderMsg.profiles?.username || 'Unknown'}</span>
                          <span className="text-xs text-zinc-500">{format(new Date(renderMsg.created_at), 'dd/MM HH:mm')}</span>
                        </div>
                      </div>
                      <div className={isCustomCard ? `mt-1 p-2.5 rounded-xl border max-w-[85%] relative shadow-md break-words ${messageCard.bubbleClass}` : "text-zinc-200 text-[15px] leading-relaxed break-words relative pr-12"} style={isCustomCard ? messageCard.bubbleStyle : undefined}>
                        {renderMsg.content?.startsWith('__SYSTEM__:') ? (
                          <div className="bg-[#111] border border-zinc-800 rounded-md p-3 my-2 text-sm text-zinc-300">
                             <Markdown remarkPlugins={[remarkGfm, remarkBreaks]} components={getMarkdownComponents(renderMsg.profiles)}>
                               {renderMsg.content.slice(11)}
                             </Markdown>
                          </div>
                        ) : renderMsg.content?.startsWith('__CMD_UI__:') ? (
                          (() => {
                            try {
                               const rest = renderMsg.content.slice(11);
                               const firstColon = rest.indexOf(':');
                               const cmdType = rest.slice(0, firstColon);
                               const data = JSON.parse(rest.slice(firstColon + 1));
                               
                               if (cmdType === 'bank') {
                                 return (
                                   <div className="mt-2 bg-[#0a0a0a] border border-[#222] rounded-xl p-4 w-fit min-w-[250px] shadow-lg">
                                      <div className="flex items-center gap-2 mb-3">
                                        <Wallet className="w-5 h-5 text-emerald-500" />
                                        <span className="font-bold text-white uppercase tracking-wider text-sm">{data.title}</span>
                                      </div>
                                      {data.msg && <div className="text-xs text-zinc-400 mb-3">{data.msg}</div>}
                                      <div className="flex gap-6">
                                        <div className="flex items-center gap-2">
                                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 9L12 22L22 9L12 2Z" fill="#ff007f" /><path d="M12 2L2 9L12 12V2Z" fill="#ff4da6" /><path d="M22 9L12 2V12L22 9Z" fill="#cc0066" /><path d="M2 9L12 22V12L2 9Z" fill="#e60073" /><path d="M22 9L12 22V12L22 9Z" fill="#99004d" /></svg>
                                          <span className="font-extrabold text-lg text-white">{data.gems ?? 0}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#FFB800" /><circle cx="12" cy="12" r="8" fill="#FFC700" /><path d="M12 6L13.8 9.6L17.5 10L14.7 12.6L15.5 16.5L12 14.5L8.5 16.5L9.3 12.6L6.5 10L10.2 9.6L12 6Z" fill="#FFD600" /></svg>
                                          <span className="font-extrabold text-lg text-white">{data.coins ?? 0}</span>
                                        </div>
                                      </div>
                                   </div>
                                 );
                               } else if (cmdType === 'bet') {
                                 const isWin = data.won;
                                 return (
                                   <div className={`mt-2 bg-[#0a0a0a] border ${isWin ? 'border-emerald-500/30' : 'border-red-500/30'} rounded-xl p-4 w-fit min-w-[280px] shadow-lg relative overflow-hidden`}>
                                      {isWin && <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />}
                                      {!isWin && <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />}
                                      
                                      <div className="flex items-center justify-between mb-3">
                                        <span className="font-bold text-white uppercase tracking-wider text-[11px] bg-zinc-800 px-2 py-1 rounded">
                                          {data.action}
                                        </span>
                                        <span className={`font-black text-sm ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                                          {isWin ? 'WON' : 'LOST'}
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-center justify-between mt-2">
                                        <div className="flex flex-col">
                                          <span className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Bet Amount</span>
                                          <div className="flex items-center gap-1.5">
                                            {data.type === 'Rubies' ? (
                                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 9L12 22L22 9L12 2Z" fill="#ff007f" /><path d="M12 2L2 9L12 12V2Z" fill="#ff4da6" /><path d="M22 9L12 2V12L22 9Z" fill="#cc0066" /><path d="M2 9L12 22V12L2 9Z" fill="#e60073" /><path d="M22 9L12 22V12L22 9Z" fill="#99004d" /></svg>
                                            ) : (
                                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#FFB800" /><circle cx="12" cy="12" r="8" fill="#FFC700" /><path d="M12 6L13.8 9.6L17.5 10L14.7 12.6L15.5 16.5L12 14.5L8.5 16.5L9.3 12.6L6.5 10L10.2 9.6L12 6Z" fill="#FFD600" /></svg>
                                            )}
                                            <span className="font-bold text-zinc-300">{data.bet}</span>
                                          </div>
                                        </div>

                                        {isWin && (
                                          <div className="flex flex-col items-end">
                                            <span className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Profit ({data.multiplier})</span>
                                            <div className="flex items-center gap-1.5">
                                              <span className="font-extrabold text-emerald-400">+{data.amount}</span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                   </div>
                                 );
                               } else if (cmdType === 'gift') {
                                 return (
                                   <div className="mt-2 bg-[#0a0a0a] border border-blue-500/30 rounded-xl p-4 w-fit min-w-[250px] shadow-lg relative overflow-hidden">
                                      <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
                                      <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="w-5 h-5 text-blue-400" />
                                        <span className="font-bold text-white uppercase tracking-wider text-[11px]">User Gift</span>
                                      </div>
                                      <span className="text-zinc-300 text-sm">Given to <strong className="text-blue-400">{data.to}</strong></span>
                                      <div className="flex items-center mt-3 gap-2">
                                          {data.type === 'Rubies' ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 9L12 22L22 9L12 2Z" fill="#ff007f" /><path d="M12 2L2 9L12 12V2Z" fill="#ff4da6" /><path d="M22 9L12 2V12L22 9Z" fill="#cc0066" /><path d="M2 9L12 22V12L2 9Z" fill="#e60073" /><path d="M22 9L12 22V12L22 9Z" fill="#99004d" /></svg>
                                          ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#FFB800" /><circle cx="12" cy="12" r="8" fill="#FFC700" /><path d="M12 6L13.8 9.6L17.5 10L14.7 12.6L15.5 16.5L12 14.5L8.5 16.5L9.3 12.6L6.5 10L10.2 9.6L12 6Z" fill="#FFD600" /></svg>
                                          )}
                                          <span className="font-extrabold text-lg text-white">{data.amount}</span>
                                      </div>
                                   </div>
                                 );
                               }
                            } catch (err) {}
                            return <Markdown remarkPlugins={[remarkGfm, remarkBreaks]} components={getMarkdownComponents(renderMsg.profiles)}>{scrubContent(renderMsg.content)}</Markdown>;
                          })()
                        ) : (
                          <Markdown remarkPlugins={[remarkGfm, remarkBreaks]} components={getMarkdownComponents(renderMsg.profiles)}>
                            {scrubContent(renderMsg.content)}
                          </Markdown>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
          
          {activeTypers.filter(t => t.targetId === 'main').length > 0 && (
            <div className="px-6 py-2 text-[11px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2 animate-pulse bg-zinc-950/80 backdrop-blur-sm absolute bottom-[100px] left-0 right-0 z-10 border-t border-zinc-800/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {activeTypers.filter(t => t.targetId === 'main').map(t => allProfiles.find(p => p.id === t.userId)?.username).filter(Boolean).join(', ')} is typing...
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-zinc-800 bg-zinc-950 p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          <form onSubmit={handleSendMessage} className="relative mx-auto max-w-4xl flex items-end gap-2 bg-[#1e1e22] border border-zinc-800 rounded-[8px] p-1.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
            <div className="flex items-center gap-1.5 pl-1 mb-1 self-end shrink-0">
              <button
                type="button"
                onClick={() => setShowAddons(!showAddons)}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200 focus:outline-none ${
                  showAddons ? 'bg-zinc-700 text-zinc-100 rotate-45' : 'bg-[#29292e] text-zinc-400 hover:text-emerald-400 hover:bg-[#34343a]'
                }`}
                title="Add integrations"
              >
                <Plus className="h-5 w-5" />
              </button>
              <AnimatePresence>
                {showAddons && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex items-center gap-1.5 overflow-hidden pr-1"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setShowConvertCoinsModal(true);
                        setShowAddons(false);
                      }}
                      title="Gold & Ruby Treasury"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#29292e] text-zinc-400 hover:text-amber-400 hover:bg-[#34343a] transition-colors"
                    >
                      <Coins className="h-[18px] w-[18px]" />
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileViewsModal(true);
                        setShowAddons(false);
                      }}
                      title="Profile Views & Insights"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#29292e] text-zinc-400 hover:text-emerald-400 hover:bg-[#34343a] transition-colors"
                    >
                      <Eye className="h-[18px] w-[18px]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowPaintCanvasModal(true);
                        setShowAddons(false);
                      }}
                      title="Paint & Color Canvas"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#29292e] text-zinc-400 hover:text-indigo-400 hover:bg-[#34343a] transition-colors"
                    >
                      <Paintbrush className="h-[18px] w-[18px]" />
                    </button>

                    <label
                      title="Send Image/GIF/Video (MP4)"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#29292e] text-zinc-400 hover:text-emerald-400 hover:bg-[#34343a] transition-colors cursor-pointer"
                    >
                      {isUploadingFile ? (
                        <Loader2 className="h-[18px] w-[18px] animate-spin text-emerald-400" />
                      ) : (
                        <Upload className="h-[18px] w-[18px]" />
                      )}
                      <input
                        type="file"
                        accept="image/*,video/mp4,video/webm,image/gif"
                        className="hidden"
                        onChange={handleDirectFileUpload}
                        disabled={isUploadingFile}
                      />
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <textarea
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                broadcastTyping('main');
              }}
              onKeyDown={handleKeyPress}
              placeholder="Message Emerald Chat..."
              className="max-h-[50vh] min-h-[40px] w-full resize-none bg-transparent px-3 py-2 text-[16px] md:text-[15px] text-zinc-100 placeholder-zinc-500 focus:outline-none custom-scrollbar"
              rows={1}
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="mb-0.5 mr-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-600 text-white transition-colors hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600"
            >
              <Send className="h-[18px] w-[18px] ml-0.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className={`${rightPanelOpen ? 'flex absolute right-0 z-40 h-full' : 'hidden'} w-[280px] flex-col border-l border-zinc-800 bg-[#141416] lg:relative lg:flex shrink-0 transition-transform ${isIPhone ? 'pt-[calc(1.5rem+env(safe-area-inset-top,16px))]' : ''}`}>
        <div className="px-4 py-4 border-b border-zinc-800/40 flex justify-between items-center">
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Online — {displayOnlineUsers.length}</span>
          </div>
          <button onClick={() => setRightPanelOpen(false)} className="lg:hidden text-zinc-400 hover:text-white">
            <X className="w-5 h-5"/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 pt-2 custom-scrollbar">
          <div className="space-y-1">
            {displayOnlineUsers.map(user => {
              const onlineBio = parseBio(user.bio);
              const cardId = onlineBio.usercard_bg || 'none';
              const cardStyleObj = USERCARD_STYLES.find(s => s.id === cardId) || USERCARD_STYLES[0];
              const isDefaultCard = cardId === 'none';

              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedProfileId(user.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150 focus:outline-none mb-1.5 border hover:scale-[1.01] ${
                    isDefaultCard 
                      ? 'bg-[#1e1e22] hover:bg-[#252529] border-zinc-800/50' 
                      : `${cardStyleObj.className || 'border-zinc-800/50'} hover:brightness-110`
                  }`}
                  style={isDefaultCard ? undefined : cardStyleObj.style}
                >
                  <div className="relative shrink-0">
                    <RenderPfpWithCustomBorder 
                      profile={user} 
                      size={34} 
                      roundedClass="rounded-full" 
                    />
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#1e1e22] bg-emerald-500"></div>
                  </div>
                  <div className="flex flex-col items-start overflow-hidden w-full">
                    <div className="flex items-center gap-1.5 max-w-full">
                      <img src={getRank(user.email, user.id, user.rank).icon} alt={getRank(user.email, user.id, user.rank).name} className="h-4 object-contain" />
                      <span 
                        className={`truncate text-[14px] font-bold ${cardStyleObj.textClassName || 'text-zinc-200'}`} 
                        style={{ 
                          color: user.id === currentUserProfile.id && isDefaultCard ? '#10b981' : undefined,
                          ...cardStyleObj.textStyle
                        }}
                      >
                        {user.username}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Offline Section containing all current members who are offline */}
            {(() => {
              const offlineUsersList = allProfiles.filter(p => !onlineUsers.some(ou => ou.id === p.id) && p.id !== TEST_BOT.id);
              const sortedOfflineUsers = [...offlineUsersList].sort((a, b) => {
                const rankA = getRank(a.email, a.id, a.rank).level;
                const rankB = getRank(b.email, b.id, b.rank).level;
                const isA_Dev = rankA === 0;
                const isB_Dev = rankB === 0;

                if (isA_Dev && !isB_Dev) return -1;
                if (isB_Dev && !isA_Dev) return 1;

                if (rankA !== rankB) return rankA - rankB;
                return (a.username || '').localeCompare(b.username || '');
              });

              if (sortedOfflineUsers.length === 0) return null;

              return (
                <>
                  <div className="pt-4 pb-2 px-1 border-t border-zinc-800/20 mt-4">
                    <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase">Offline — {sortedOfflineUsers.length}</span>
                  </div>
                  {sortedOfflineUsers.map(user => {
                    const offlineBio = parseBio(user.bio);
                    const cardId = offlineBio.usercard_bg || 'none';
                    const cardStyleObj = USERCARD_STYLES.find(s => s.id === cardId) || USERCARD_STYLES[0];
                    const isDefaultCard = cardId === 'none';

                    return (
                      <button
                        key={user.id}
                        onClick={() => setSelectedProfileId(user.id)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150 focus:outline-none mb-1.5 border opacity-65 hover:opacity-95 ${
                          isDefaultCard 
                            ? 'bg-[#141416]/50 hover:bg-[#1e1e22]/50 border-zinc-900/40' 
                            : `${cardStyleObj.className || 'border-zinc-900/40'} hover:brightness-110`
                        }`}
                        style={isDefaultCard ? undefined : { ...cardStyleObj.style, filter: 'grayscale(25%) saturate(85%) opacity(85%)' }}
                      >
                        <div className="relative shrink-0">
                          <RenderPfpWithCustomBorder 
                            profile={user} 
                            size={34} 
                            roundedClass="rounded-full" 
                            className="filter grayscale"
                          />
                          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#141416] bg-zinc-600"></div>
                        </div>
                        <div className="flex flex-col items-start overflow-hidden w-full">
                          <div className="flex items-center gap-1.5 max-w-full">
                            <img src={getRank(user.email, user.id, user.rank).icon} alt={getRank(user.email, user.id, user.rank).name} className="h-4 object-contain filter grayscale" />
                            <span 
                              className={`truncate text-[14px] font-bold ${cardStyleObj.textClassName || 'text-zinc-400'}`}
                              style={cardStyleObj.textStyle}
                            >
                              {user.username}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {selectedProfileId && (
        <ProfileModal 
          profileId={selectedProfileId} 
          currentUserProfile={currentUserProfile}
          currentUserId={currentUserProfile.id}
          onClose={() => setSelectedProfileId(null)} 
          onProfileUpdate={(updated) => {
            onProfileUpdate(updated);
            setOnlineUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
            setMessages(prev => prev.map(m => m.user_id === updated.id ? { ...m, profiles: updated } : m));
          }}
          allProfiles={allProfiles}
          setSelectedProfileId={setSelectedProfileId}
          setShowPmInbox={setShowPmInbox}
          setPmTargetId={setPmTargetId}
        />
      )}

      {showDeveloperPanel && (
        <DeveloperPanel onClose={() => setShowDeveloperPanel(false)} allProfiles={allProfiles} />
      )}

      {showConvertCoinsModal && (
        <ConvertCoinsGemsModal 
          currentUserProfile={currentUserProfile}
          onProfileUpdate={onProfileUpdate}
          onClose={() => setShowConvertCoinsModal(false)}
        />
      )}

      {showProfileViewsModal && (
        <ProfileViewsModal
          currentUserProfile={currentUserProfile}
          allProfiles={allProfiles}
          onProfileUpdate={onProfileUpdate}
          onClose={() => setShowProfileViewsModal(false)}
        />
      )}

      {showPaintCanvasModal && (
        <PaintCanvasModal 
          onSendDrawing={sendDirectMessage}
          currentUserProfile={currentUserProfile}
          onClose={() => setShowPaintCanvasModal(false)}
        />
      )}

      {showSocialRequestsModal && (
        <SocialRequestsModal 
          currentUserProfile={currentUserProfile}
          allProfiles={allProfiles}
          onProfileUpdate={onProfileUpdate}
          onClose={() => setShowSocialRequestsModal(false)}
          incomingFriendRequests={incomingFriendRequests}
          incomingRelationshipRequests={incomingRelationshipRequests}
        />
      )}

      {showPmInbox && (
        <PrivateMessagesModal 
          currentUserProfile={currentUserProfile}
          allProfiles={allProfiles}
          privateMessages={privateMessages}
          activeTypers={activeTypers}
          broadcastTyping={broadcastTyping}
          onClose={() => {
            setShowPmInbox(false);
            setPmTargetId(null);
          }}
          onSendMessage={handleSendPrivateMessage}
          initialTargetId={pmTargetId}
        />
      )}

    </div>
  );
}

// Inline modal to keep things compact
function ProfileModal({ 
  profileId, 
  currentUserProfile, 
  currentUserId, 
  onClose, 
  onProfileUpdate,
  allProfiles = [],
  setSelectedProfileId,
  setShowPmInbox,
  setPmTargetId
}: { 
  profileId: string, 
  currentUserProfile: Profile, 
  currentUserId: string, 
  onClose: () => void, 
  onProfileUpdate: (p: Profile) => void,
  allProfiles?: Profile[],
  setSelectedProfileId?: (id: string | null) => void,
  setShowPmInbox: (show: boolean) => void,
  setPmTargetId: (id: string | null) => void
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editGroup, setEditGroup] = useState<'core' | 'cosmetics' | 'media'>('core');
  const [activeEditModal, setActiveEditModal] = useState<'info' | 'username' | 'bio' | 'mood' | 'music' | 'card_bg' | 'border' | 'border_borders' | 'border_effects' | 'border_combos' | 'border_creator' | 'preferences' | 'usercards' | 'message_cards' | 'pfp_borders' | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'bio' | 'friends'>('bio');
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSelf = profileId === currentUserId;
  const bioData: BioData = profile ? parseBio(profile.bio) : { text: '', mood: '', profile_music_type: '', profile_music_source: '', profile_card_bg: '', assigned_ranks: {} };
  const localUserBioData = parseBio(currentUserProfile.bio);
  const isLocalSoundDisabled = localUserBioData.sound_disabled ?? false;

  const displayedUserFriends = useMemo(() => {
    if (!profile || !allProfiles) return [];
    const friendsIds = parseBio(profile.bio).friends || [];
    return allProfiles.filter(u => {
      const uBio = parseBio(u.bio);
      const isMutual = friendsIds.includes(u.id) && (uBio.friends || []).includes(profile.id);
      const isHidden = uBio.hide_me_from_friends;
      return isMutual && !isHidden;
    });
  }, [profile, allProfiles]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      if (profileId === TEST_BOT.id) {
        setProfile(TEST_BOT);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.from('profiles').select('*').eq('id', profileId).single();
      if (error) {
        console.error('Error fetching profile:', error);
        onClose();
        return;
      }
      
      const { data: likesData } = await supabase.from('profile_likes').select('id, user_id').eq('target_profile_id', profileId);
      
      setProfile({ ...data, profile_likes: likesData || [] } as any);
      setLoading(false);
    };
    fetchProfile();
  }, [profileId]);

  const musicType = bioData.profile_music_type;
  const musicSource = bioData.profile_music_source;

  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const ytVideoId = musicType === 'youtube' && musicSource ? getYouTubeId(musicSource) : null;

  useEffect(() => {
    if (isLocalSoundDisabled) {
      setIsPlaying(false);
      return;
    }
    if (!loading && profile && musicType && musicSource) {
      if (musicType === 'mp3') {
        // Clean up previous instance first
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        const audio = new Audio(musicSource);
        audio.loop = true;
        audioRef.current = audio;

        audio.play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.log("Audio autoplay blocked / waiting for interaction:", err);
            setIsPlaying(false);
          });
      } else if (musicType === 'youtube') {
        setIsPlaying(true);
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
    };
  }, [loading, profileId, musicType, musicSource, isLocalSoundDisabled]);

  const togglePlay = () => {
    if (isLocalSoundDisabled) {
      toast.error("Please enable is_sound_disabled option in your Preferences from editing profile to hear music!");
      return;
    }
    if (musicType === 'mp3') {
      if (!audioRef.current && musicSource) {
        const audio = new Audio(musicSource);
        audio.loop = true;
        audioRef.current = audio;
      }
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch((err) => {
              console.error("Playback failed or blocked:", err);
              toast.error("Playback failed. Please interact with the page first.");
            });
        }
      }
    } else if (musicType === 'youtube') {
      setIsPlaying(!isPlaying);
    }
  };

  const handleLikeProfile = async () => {
    if (!profile) return;
    const hasLiked = profile.profile_likes?.some((l: any) => l.user_id === currentUserId);
    if (hasLiked) {
      await supabase.from('profile_likes').delete().eq('target_profile_id', profileId).eq('user_id', currentUserId);
      setProfile({ ...profile, profile_likes: profile.profile_likes?.filter((l: any) => l.user_id !== currentUserId) });
    } else {
      const { data } = await supabase.from('profile_likes').insert({ target_profile_id: profileId, user_id: currentUserId }).select().single();
      if (data) {
        setProfile({ ...profile, profile_likes: [...(profile.profile_likes || []), data] });
      }
    }
  };

  const handleImageUpload = async (file: File, bucket: 'avatars' | 'banners') => {
    if (!profile) return;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${currentUserId}/${fileName}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);
    if (!uploadError) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      const updateData = bucket === 'avatars' ? { avatar_url: data.publicUrl } : { banner_url: data.publicUrl };
      
      await supabase.from('profiles').update(updateData).eq('id', currentUserId);
      setProfile({ ...profile, ...updateData });
      onProfileUpdate({ ...profile, ...updateData });
    }
  };

  const updateProfileData = async (updates: Partial<Profile>) => {
    if (!profile) return;
    
    // Check for forbidden TLDs in fields that might contains text (bio, username, etc)
    const checkFields = ['bio', 'username'];
    for (const field of checkFields) {
      const val = (updates as any)[field];
      if (typeof val === 'string' && FORBIDDEN_TLDS.test(val.toLowerCase())) {
        toast('Advertising is not permitted!', { icon: '🚫' });
        return;
      }
    }

    await supabase.from('profiles').update(updates).eq('id', currentUserId);
    setProfile({ ...profile, ...updates });
    onProfileUpdate({ ...profile, ...updates });
    setActiveEditModal(null);
  };

  if (!profile && !loading) return null;

  const viewerBorderId = bioData.profile_border || 'none';
  const viewerBorder = getBorderStyles(viewerBorderId);
  const isProfileRainbowActive = viewerBorderId === 'rainbow-wave' || viewerBorderId === 'rainbow-neon' || bioData.profile_effect === 'psychedelic';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <style dangerouslySetInnerHTML={{ __html: BORDER_KEYFRAMES }} />
      <style dangerouslySetInnerHTML={{ __html: EFFECTS_KEYFRAMES }} />
      <UserProfileFontsLoader bio={profile?.bio} />
      <div 
        style={viewerBorder.cardStyle}
        className={`w-full max-w-xl overflow-hidden rounded-2xl bg-[#141416] border shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 ${viewerBorder.className || ''}`}
      >
        
        <button onClick={onClose} className="absolute right-3 top-3 z-10 p-1.5 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors">
          <X className="h-5 w-5" />
        </button>

        {loading ? (
          <div className="h-64 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-zinc-500" /></div>
        ) : (
          <>
            <div className="relative h-32 w-full group shrink-0">
              <img src={profile!.banner_url} alt="Banner" className="h-full w-full object-cover" />
              {editMode && (
                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                  <Upload className="h-6 w-6 text-white" />
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'banners')} />
                </label>
              )}
            </div>
            
            <div 
              style={(!bioData.profile_effect || bioData.profile_effect === 'none') && bioData.profile_card_bg ? {
                backgroundImage: `url(${bioData.profile_card_bg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              } : undefined}
              className="flex-1 flex flex-col relative overflow-hidden"
            >
              {(!bioData.profile_effect || bioData.profile_effect === 'none') && bioData.profile_card_bg && (
                <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-[1px] z-0 pointer-events-none" />
              )}
              
              <ProfileEffectRenderer effectId={bioData.profile_effect || 'none'} />
              
              <div className="relative z-10 flex flex-col h-full overflow-y-auto pb-4 custom-scrollbar">
                <div className="px-6 pb-4 relative shrink-0">
                  <div className="flex justify-between items-end">
                    <div 
                      className="relative group mt-3 mb-3 border-4 border-[#141416] rounded-full h-24 w-24 bg-zinc-800 shrink-0"
                    >
                       <RenderPfpWithCustomBorder profile={profile} size={96} roundedClass="rounded-full" />
                       {editMode && (
                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity rounded-full">
                          <Upload className="h-6 w-6 text-white" />
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'avatars')} />
                        </label>
                      )}
                    </div>
                    {isSelf && (
                      <div className="flex gap-2 mb-4">
                        <button 
                          onClick={() => setEditMode(!editMode)}
                          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${editMode ? 'bg-emerald-600 text-white' : 'bg-[#1e1e22] text-white hover:bg-zinc-800 border border-zinc-800'}`}
                        >
                          {editMode ? 'Done' : 'Edit Profile'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-xl font-bold ${isProfileRainbowActive ? 'rainbow-text' : 'text-white'}`}>{profile!.username}</h3>
                      {!isSelf && profile!.id !== TEST_BOT.id && (
                        <button onClick={handleLikeProfile} className="flex items-center gap-1.5 focus:outline-none transition-transform hover:scale-110 active:scale-95 group" title="Like Profile">
                          <Heart className={`w-5 h-5 transition-colors ${profile.profile_likes?.some((l: any) => l.user_id === currentUserId) ? 'fill-emerald-500 text-emerald-500' : 'text-zinc-500 group-hover:text-emerald-400'}`} />
                          <span className="text-sm font-bold text-zinc-400">{profile.profile_likes?.length || 0}</span>
                        </button>
                      )}
                      {isSelf && (
                         <div className="flex items-center gap-1.5 cursor-default text-emerald-500 ml-1" title="Profile Likes">
                           <Heart className="w-5 h-5 fill-emerald-500" />
                           <span className="text-sm font-bold">{profile.profile_likes?.length || 0}</span>
                         </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 mb-1">
                      <img src={getRank(profile!.email, profile!.id, profile!.rank).icon} alt={getRank(profile!.email, profile!.id, profile!.rank).name} className="h-4 object-contain" />
                      <span className={`text-[13px] font-bold ${isProfileRainbowActive ? 'rainbow-text' : 'text-zinc-300'}`}>{getRank(profile!.email, profile!.id, profile!.rank).name}</span>
                    </div>
                    {bioData.mood && (
                      <p className={`text-sm mt-1 mb-1 font-medium ${isProfileRainbowActive ? 'rainbow-text' : 'text-emerald-400'}`}>{bioData.mood}</p>
                    )}
                    
                    {bioData.dating_user_id && (
                      <div className="inline-flex items-center gap-1.5 bg-pink-500/15 border border-pink-500/25 px-2.5 py-1 rounded-full text-pink-400 text-xs font-semibold select-none mt-1.5 shadow-sm">
                        <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500 animate-pulse" />
                        <span>Dating: {bioData.dating_username}</span>
                      </div>
                    )}

                    {!isSelf && profile!.id !== TEST_BOT.id && (
                      <div className="mt-3 flex gap-2">
                        <FriendButton 
                          profile={profile} 
                          currentUserProfile={currentUserProfile} 
                          onProfileUpdate={onProfileUpdate} 
                          setProfile={setProfile} 
                        />
                        <button 
                          onClick={() => {
                            onClose();
                            setPmTargetId(profile!.id);
                            setShowPmInbox(true);
                          }}
                          className="px-3.5 py-1.5 text-xs font-bold rounded-md bg-emerald-600 text-white hover:bg-emerald-500 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Message</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Visualizer centered above About Me and under the mood */}
                {musicType && musicSource && (
                  <div className="flex flex-col items-center justify-center my-2 w-full shrink-0 z-10 relative px-6">
                    <button 
                      onClick={togglePlay}
                      className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 flex items-center gap-2 bg-black/75 px-3 py-1.5 rounded-full transition-all hover:bg-black/90 cursor-pointer border border-[#10b981]/25 active:scale-95 text-center justify-center shadow-md select-none"
                    >
                      {isPlaying ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          <span>Pause Music</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-zinc-500" />
                          <span>Play Music</span>
                        </>
                      )}
                    </button>
                    
                    <div className="flex items-end justify-center gap-1.5 h-8 px-4 py-1.5 bg-zinc-950/55 border border-zinc-800/40 rounded-xl shadow-lg mt-2 w-32">
                      <div className={`w-1 h-5 bg-emerald-500 rounded-full ${isPlaying ? 'animate-bounce-bar' : 'opacity-40'}`} style={{ animationDelay: '0.1s', animationDuration: '0.6s' }}></div>
                      <div className={`w-1 h-5 bg-emerald-500 rounded-full ${isPlaying ? 'animate-bounce-bar' : 'opacity-40'}`} style={{ animationDelay: '0.3s', animationDuration: '0.8s' }}></div>
                      <div className={`w-1 h-5 bg-[#10b981] rounded-full ${isPlaying ? 'animate-bounce-bar' : 'opacity-40'}`} style={{ animationDelay: '0.0s', animationDuration: '0.5s' }}></div>
                      <div className={`w-1 h-5 bg-emerald-400 rounded-full ${isPlaying ? 'animate-bounce-bar' : 'opacity-40'}`} style={{ animationDelay: '0.5s', animationDuration: '0.7s' }}></div>
                      <div className={`w-1 h-5 bg-[#10b981] rounded-full ${isPlaying ? 'animate-bounce-bar' : 'opacity-40'}`} style={{ animationDelay: '0.2s', animationDuration: '0.65s' }}></div>
                      <div className={`w-1 h-5 bg-[#059669] rounded-full ${isPlaying ? 'animate-bounce-bar' : 'opacity-40'}`} style={{ animationDelay: '0.4s', animationDuration: '0.55s' }}></div>
                      <div className={`w-1 h-5 bg-emerald-500 rounded-full ${isPlaying ? 'animate-bounce-bar' : 'opacity-40'}`} style={{ animationDelay: '0.15s', animationDuration: '0.75s' }}></div>
                      <div className={`w-1 h-5 bg-[#10b981] rounded-full ${isPlaying ? 'animate-bounce-bar' : 'opacity-40'}`} style={{ animationDelay: '0.35s', animationDuration: '0.85s' }}></div>
                    </div>

                    {ytVideoId && isPlaying && !isLocalSoundDisabled && (
                      <iframe
                        className="w-0 h-0 opacity-0 pointer-events-none absolute"
                        src={`https://www.youtube.com/embed/${ytVideoId}?autoplay=1&enablejsapi=1&loop=1&playlist=${ytVideoId}`}
                        allow="autoplay animate-bounce-bar"
                      />
                    )}
                  </div>
                )}

                {!editMode ? (
                  <div className="flex flex-col flex-1 pb-4 shadow-inner">
                    <div className="flex gap-6 border-b border-zinc-800 px-6 shrink-0 h-10">
                      <button onClick={() => setActiveTab('bio')} className={`pb-1 flex items-center border-b-2 font-medium transition-colors text-sm ${activeTab === 'bio' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}>About Me</button>
                      <button onClick={() => setActiveTab('info')} className={`pb-1 flex items-center border-b-2 font-medium transition-colors text-sm ${activeTab === 'info' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}>Info</button>
                      {!bioData.hide_friends_on_profile && (
                        <button onClick={() => setActiveTab('friends')} className={`pb-1 flex items-center border-b-2 font-medium transition-colors text-sm ${activeTab === 'friends' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}>Friends ({displayedUserFriends.length})</button>
                      )}
                    </div>

                    <div className="h-64 overflow-y-auto px-6 py-4 custom-scrollbar z-10 relative">
                      {activeTab === 'bio' ? (
                        <div className="text-sm text-zinc-300">
                          {(!isSelf && bioData.hide_bio) ? (
                            <p className="text-zinc-500 italic pb-2">This user's bio is hidden.</p>
                          ) : bioData.text ? (
                            <Markdown remarkPlugins={[remarkGfm, remarkBreaks]} components={getMarkdownComponents(profile)}>
                              {scrubContent(bioData.text)}
                            </Markdown>
                          ) : (
                            <p className="text-zinc-500">No bio provided yet.</p>
                          )}
                        </div>
                      ) : activeTab === 'info' ? (
                        <div className="flex flex-col gap-4">
                          <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
                            <span className="text-zinc-400 text-sm">Last online</span>
                            <span className="text-zinc-200 text-sm">{profile!.updated_at ? format(new Date(profile!.updated_at), 'dd MMM yyyy, HH:mm') : 'Online Now'}</span>
                          </div>
                          <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
                            <span className="text-zinc-400 text-sm">Gender</span>
                            <span className="text-zinc-200 text-sm">{(!isSelf && bioData.hide_age_gender) ? 'Hidden' : profile!.gender}</span>
                          </div>
                          <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
                            <span className="text-zinc-400 text-sm">Age</span>
                            <span className="text-zinc-200 text-sm">{(!isSelf && bioData.hide_age_gender) ? 'Hidden' : profile!.age}</span>
                          </div>
                          <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
                            <span className="text-zinc-400 text-sm">Dating</span>
                            {bioData.dating_user_id ? (
                              <span className="text-pink-400 font-bold text-sm flex items-center gap-1.5 select-none">
                                <Heart className="w-4 h-4 fill-pink-500 text-pink-500 inline" />
                                {bioData.dating_username}
                              </span>
                            ) : (
                              <span className="text-zinc-500 text-sm italic">Single</span>
                            )}
                          </div>
                          <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
                            <span className="text-zinc-400 text-sm">Current Room</span>
                            <span className="text-emerald-500 font-medium text-sm">Main</span>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3 pb-4">
                          {displayedUserFriends.length === 0 ? (
                            <div className="col-span-2 text-center py-10 text-zinc-500 text-xs italic">
                              No friends to display.
                            </div>
                          ) : (
                            displayedUserFriends.map(f => (
                              <button
                                key={f.id}
                                onClick={() => {
                                  onClose();
                                  if (setSelectedProfileId) {
                                    setTimeout(() => {
                                      setSelectedProfileId(f.id);
                                    }, 50);
                                  }
                                }}
                                className="flex items-center gap-2.5 p-2 bg-zinc-950/60 border border-zinc-900 rounded-xl hover:bg-zinc-900/60 transition-all text-left min-w-0 cursor-pointer"
                              >
                                <img src={f.avatar_url} className="h-9 w-9 rounded-full object-cover border border-zinc-850 shrink-0" alt="Friend avatar" />
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-white truncate">{f.username}</div>
                                  <div className="text-[10px] text-zinc-500 font-mono truncate">{f.gender}, {f.age}</div>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="px-6 pb-6 pt-2 z-10 relative">
                    {/* EDIT GROUPS NAVIGATION */}
                    <div className="flex bg-[#121214]/80 border border-zinc-900 rounded-xl p-1 gap-1 mb-4 select-none shrink-0">
                      <button 
                        type="button"
                        onClick={() => setEditGroup('core')} 
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${editGroup === 'core' ? 'bg-zinc-800 text-emerald-400 font-extrabold shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        Core
                      </button>
                      <button 
                        type="button"
                        onClick={() => setEditGroup('cosmetics')} 
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${editGroup === 'cosmetics' ? 'bg-zinc-800 text-emerald-400 font-extrabold shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        Cosmetics
                      </button>
                      <button 
                        type="button"
                        onClick={() => setEditGroup('media')} 
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${editGroup === 'media' ? 'bg-zinc-800 text-emerald-400 font-extrabold shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        Media
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 min-h-[160px] content-start">
                      {editGroup === 'core' && (
                        <>
                          <button onClick={() => setActiveEditModal('username')} className="py-2.5 bg-[#1e1e22] border border-zinc-800 hover:bg-[#252529] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"><User className="w-4 h-4 text-emerald-500" /> Edit Username</button>
                          <button onClick={() => setActiveEditModal('mood')} className="py-2.5 bg-[#1e1e22] border border-zinc-800 hover:bg-[#252529] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"><Laugh className="w-4 h-4 text-emerald-500" /> Edit Mood</button>
                          <button onClick={() => setActiveEditModal('info')} className="py-2.5 bg-[#1e1e22] border border-zinc-800 hover:bg-[#252529] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"><Heart className="w-4 h-4 text-emerald-500" /> Edit Age & Gender</button>
                          <button onClick={() => setActiveEditModal('bio')} className="py-2.5 bg-[#1e1e22] border border-zinc-800 hover:bg-[#252529] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"><Quote className="w-4 h-4 text-emerald-500" /> Edit Bio</button>
                          <button onClick={() => setActiveEditModal('preferences')} className="col-span-2 py-2.5 bg-[#1e1e22] border border-emerald-500/25 hover:border-emerald-500/50 hover:bg-[#252529] text-emerald-400 hover:text-emerald-300 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm">
                            <Settings className="w-4 h-4 text-emerald-500 animate-[spin_8s_linear_infinite]" /> Preferences & Privacy
                          </button>
                        </>
                      )}

                      {editGroup === 'cosmetics' && (
                        <>
                          <button onClick={() => setActiveEditModal('border_borders')} className="py-2.5 bg-[#1e1e22] border border-zinc-800 hover:bg-[#252529] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Borders</button>
                          <button onClick={() => setActiveEditModal('border_effects')} className="py-2.5 bg-[#1e1e22] border border-zinc-800 hover:bg-[#252529] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"><Sparkles className="w-4 h-4 text-emerald-500" /> Effects</button>
                          <button onClick={() => setActiveEditModal('border_combos')} className="py-2.5 bg-[#1e1e22] border border-zinc-800 hover:bg-[#252529] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"><Paintbrush className="w-4 h-4 text-emerald-500" /> Combos</button>
                          <button onClick={() => setActiveEditModal('message_cards')} className="py-2.5 bg-[#1e1e22] border border-cyan-500/20 hover:border-cyan-500/55 hover:bg-[#252529] text-cyan-400 font-semibold rounded-lg text-sm transition-all col-span-2 flex items-center justify-center gap-1.5"><MessageSquare className="w-4 h-4 text-cyan-400" /> Message Cards</button>
                          <button onClick={() => setActiveEditModal('usercards')} className="py-2.5 bg-[#1e1e22] border border-emerald-500/20 hover:border-emerald-500/50 hover:bg-[#252529] text-emerald-400 hover:text-emerald-300 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 shadow-md col-span-2">
                            <Layers className="w-4.5 h-4.5 text-emerald-500" /> Usercards
                          </button>
                        </>
                      )}

                      {editGroup === 'media' && (
                        <>
                          <button onClick={() => setActiveEditModal('card_bg')} className="py-2.5 bg-[#1e1e22] border border-zinc-800 hover:bg-[#252529] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"><ImageIcon className="w-4 h-4 text-emerald-500" /> Background</button>
                          <button onClick={() => setActiveEditModal('music')} className="py-2.5 bg-[#1e1e22] border border-zinc-800 hover:bg-[#252529] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"><Music className="w-4 h-4 text-emerald-500" /> Theme Song</button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {activeEditModal === 'info' && (
        <EditModal title="Edit Info" onClose={() => setActiveEditModal(null)} onSave={(val) => updateProfileData(val)}>
          {(props) => <InfoEditForm profile={profile!} {...props} />}
        </EditModal>
      )}
      {activeEditModal === 'username' && (
        <EditModal title="Edit Username" onClose={() => setActiveEditModal(null)} onSave={(val) => updateProfileData(val)}>
          {(props) => <UsernameEditForm profile={profile!} {...props} />}
        </EditModal>
      )}
      {activeEditModal === 'bio' && (
        <EditModal title="Edit Bio" onClose={() => setActiveEditModal(null)} onSave={(val) => {
          const newBio = stringifyBio({ 
            ...bioData, 
            text: val.bio, 
            custom_fonts: val.custom_fonts || {} 
          });
          updateProfileData({ bio: newBio });
        }}>
          {(props) => <BioEditForm profile={profile!} {...props} />}
        </EditModal>
      )}
      {activeEditModal === 'mood' && (
        <EditModal title="Edit Mood" onClose={() => setActiveEditModal(null)} onSave={(val) => {
          const newBio = stringifyBio({ ...bioData, mood: val.mood });
          updateProfileData({ bio: newBio });
        }}>
          {(props) => <MoodEditForm profile={profile!} {...props} />}
        </EditModal>
      )}
      {activeEditModal === 'music' && (
        <EditModal title="Edit Profile Music" onClose={() => setActiveEditModal(null)} onSave={(val) => {
          const newBio = stringifyBio({ 
            ...bioData, 
            profile_music_type: val.profile_music_type,
            profile_music_source: val.profile_music_source
          });
          updateProfileData({ bio: newBio });
        }}>
          {(props) => <MusicEditForm profile={profile!} {...props} />}
        </EditModal>
      )}
      {activeEditModal === 'card_bg' && (
        <EditModal title="Edit Profile Card Background" onClose={() => setActiveEditModal(null)} onSave={(val) => {
          const newBio = stringifyBio({ 
            ...bioData, 
            profile_card_bg: val.profile_card_bg
          });
          updateProfileData({ bio: newBio });
        }}>
          {(props) => <CardBgEditForm profile={profile!} {...props} />}
        </EditModal>
      )}
      {activeEditModal === 'preferences' && (
        <EditModal title="Preferences" onClose={() => setActiveEditModal(null)} onSave={(val) => {
          const newBio = stringifyBio({ 
            ...bioData, 
            hide_age_gender: !!val.hide_age_gender,
            hide_bio: !!val.hide_bio,
            sound_disabled: !!val.sound_disabled,
            hide_friends_on_profile: !!val.hide_friends_on_profile,
            hide_me_from_friends: !!val.hide_me_from_friends
          });
          updateProfileData({ bio: newBio });
        }}>
          {(props) => <PreferencesEditForm bioData={bioData} {...props} />}
        </EditModal>
      )}
      {activeEditModal === 'usercards' && (
        <EditModal title="Usercards Customization" onClose={() => setActiveEditModal(null)} onSave={(val) => {
          const newBio = stringifyBio({ 
            ...bioData, 
            usercard_bg: val.usercard_bg
          });
          updateProfileData({ bio: newBio });
        }}>
          {(props) => <UsercardsEditForm bioData={bioData} profile={profile!} {...props} />}
        </EditModal>
      )}
      {activeEditModal === 'border_borders' && (
        <ProfileBordersModal 
          profile={profile!} 
          bioData={bioData} 
          onClose={() => setActiveEditModal(null)} 
          onSave={(val: any) => {
            const newBio = stringifyBio({ 
              ...bioData, 
              ...val
            });
            updateProfileData({ bio: newBio });
          }} 
        />
      )}
      {activeEditModal === 'border_effects' && (
        <ProfileEffectsModal 
          profile={profile!} 
          bioData={bioData} 
          onClose={() => setActiveEditModal(null)} 
          onSave={(val: any) => {
            const newBio = stringifyBio({ 
              ...bioData, 
              ...val
            });
            updateProfileData({ bio: newBio });
          }} 
        />
      )}
      {activeEditModal === 'border_combos' && (
        <ProfileCombosModal 
          profile={profile!} 
          bioData={bioData} 
          onClose={() => setActiveEditModal(null)} 
          onSave={(val: any) => {
            const newBio = stringifyBio({ 
              ...bioData, 
              ...val
            });
            updateProfileData({ bio: newBio });
          }} 
        />
      )}
      {activeEditModal === 'message_cards' && (
        <MessageCardsModal 
          profile={profile!} 
          bioData={bioData} 
          onClose={() => setActiveEditModal(null)} 
          onSave={(val: any) => {
            const newBio = stringifyBio({ 
              ...bioData, 
              ...val
            });
            updateProfileData({ bio: newBio });
          }} 
        />
      )}
    </div>
  );
}

function CosmeticShopLayout({
  title,
  tag = "FREE",
  onClose,
  onSave,
  onPrev,
  onNext,
  onViewGrid,
  screen,
  previewNode,
  gridNode,
}: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto font-sans">
      <style dangerouslySetInnerHTML={{ __html: BORDER_KEYFRAMES }} />
      <style dangerouslySetInnerHTML={{ __html: EFFECTS_KEYFRAMES }} />
      <div className="w-full max-w-xl bg-[#0c0c0c] border border-zinc-800/80 rounded-[2rem] shadow-2xl overflow-hidden my-auto shrink-0 relative animate-fade-in flex flex-col p-6 pt-5">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-lg font-black text-white tracking-tight">{title}</h2>
            <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-black tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{tag}</span>
          </div>
          <button onClick={onClose} className="px-3 sm:px-3 py-1.5 rounded-lg bg-[#141414] border border-zinc-800 text-xs font-bold text-zinc-300 flex items-center gap-1.5 hover:bg-zinc-800 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="w-full flex flex-col items-center flex-1">
          {screen === 'preview' ? (
            <>
              {/* Preview Form */}
              <div className="w-full mb-6 max-w-sm">
                {previewNode}
              </div>

              {/* Action Bar */}
              <div className="w-full flex-1 flex flex-col max-w-sm">
                <div className="grid grid-cols-[1fr_2fr_1fr] gap-3 sm:gap-4 items-center mb-0 mt-auto">
                  <div className="flex flex-col items-center text-center">
                    <button onClick={onPrev} className="w-full h-11 rounded-xl bg-[#141414] border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition-all active:scale-95">
                      <ChevronLeft className="w-5 h-5 text-zinc-400" />
                    </button>
                  </div>

                  <div className="flex flex-col items-center text-center">
                     <button onClick={onSave} className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black border border-emerald-500 flex items-center justify-center gap-2 transition-all font-black text-xs uppercase tracking-widest active:scale-95">
                      <Check className="w-4 h-4" />
                      SAVE
                    </button>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <button onClick={onNext} className="w-full h-11 rounded-xl bg-[#141414] border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition-all active:scale-95">
                      <ChevronRight className="w-5 h-5 text-zinc-400" />
                    </button>
                  </div>
                </div>
                
                <button onClick={onViewGrid} className="w-full mt-4 h-11 rounded-xl bg-[#141414] border border-zinc-800 flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all font-bold text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-200">
                  <Grid className="w-3.5 h-3.5" />
                  VIEW GRID
                </button>
              </div>
            </>
          ) : (
            <div className="w-full bg-[#141416]/50 border border-zinc-800 rounded-2xl p-4 lg:p-6 h-full flex flex-col min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-zinc-300 font-black text-xs uppercase tracking-wider">CHOOSE FROM GRID</h3>
                <button onClick={() => onViewGrid()} className="text-zinc-500 hover:text-white flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                  <ChevronLeft className="w-3.5 h-3.5" /> BACK
                </button>
              </div>
              <div className="w-full flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
                {gridNode}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CosmeticCardPreview({ profile, borderId, effectId, bioData }: { profile: Profile; borderId: string; effectId: string; bioData: any }) {
  const resolvedBorder = getBorderStyles(borderId) || {
    id: 'none',
    className: '',
    cardStyle: {}
  };

  const isRainbowActive = borderId === 'rainbow-wave' || borderId === 'rainbow-neon' || effectId === 'psychedelic';

  return (
    <div 
      style={resolvedBorder.cardStyle} 
      className={`w-full rounded-[2.5rem] bg-[#0c0c0c] relative flex flex-col items-center pb-8 shadow-2xl overflow-hidden ${(resolvedBorder.className && resolvedBorder.className !== '') ? resolvedBorder.className : 'border border-zinc-800'}`}
    >
      {/* Background Effect */}
      {effectId === 'none' && bioData?.profile_card_bg && (
        <div 
          style={{ backgroundImage: `url(${bioData.profile_card_bg})` }}
          className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none" 
        />
      )}
      <div className="absolute inset-0 pointer-events-none z-0">
        <ProfileEffectRenderer effectId={effectId} />
      </div>

      {/* Banner */}
      <div className="w-full h-32 sm:h-40 relative z-10 opacity-80 border-b border-zinc-900 shadow-inner">
        <img 
          src={profile.banner_url || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop'} 
          alt="Banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0c0c0c]/10 to-[#0c0c0c]" />
      </div>

      {/* Avatar Container */}
      <div className="relative z-20 -mt-[4rem] flex flex-col items-center">
        <div 
          className="w-28 h-28 rounded-[1.5rem] overflow-hidden border-8 border-[#0c0c0c] bg-zinc-900 shadow-[0_10px_40px_rgba(0,0,0,0.5)]" 
          style={resolvedBorder.cardStyle}
        >
           <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
        </div>
        
        {/* Rank Icon */}
        <div className="-mt-3 z-30 drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]">
          <img src={getRank(profile.email, profile.id, profile.rank).icon} alt="Rank" className="h-6 object-contain" />
        </div>
      </div>

      {/* Username */}
      <div className="relative z-20 flex flex-col items-center mt-3 px-6 text-center w-full">
        <h2 className={`font-black uppercase tracking-wider text-2xl ${isRainbowActive ? 'rainbow-text' : 'text-zinc-100'} drop-shadow-md`}>
          {profile.username}
        </h2>
      </div>
    </div>
  );
}

function ProfileBordersModal({ profile, bioData, onClose, onSave }: any) {
  const [screen, setScreen] = useState<'preview' | 'grid'>('preview');
  const [previewBorderId, setPreviewBorderId] = useState(() => bioData?.profile_border || 'none');
  const [index, setIndex] = useState(() => {
    const currentId = bioData?.profile_border || 'none';
    const foundIdx = PROFILE_BORDERS.findIndex(b => b.id === currentId);
    return foundIdx >= 0 ? foundIdx : 0;
  });

  useEffect(() => {
    if (previewBorderId && !previewBorderId.startsWith('custom:')) {
      const idx = PROFILE_BORDERS.findIndex(b => b.id === previewBorderId);
      if (idx >= 0) setIndex(idx);
    }
  }, [previewBorderId]);

  const handlePrev = () => {
    const nextIdx = (index - 1 + PROFILE_BORDERS.length) % PROFILE_BORDERS.length;
    setIndex(nextIdx);
    setPreviewBorderId(PROFILE_BORDERS[nextIdx].id);
  };

  const handleNext = () => {
    const nextIdx = (index + 1) % PROFILE_BORDERS.length;
    setIndex(nextIdx);
    setPreviewBorderId(PROFILE_BORDERS[nextIdx].id);
  };

  const handleSave = () => {
    onSave({ profile_border: previewBorderId });
    onClose();
    toast.success('Profile border applied successfully!');
  };

  const previewNode = (
    <CosmeticCardPreview profile={profile} borderId={previewBorderId} effectId={bioData?.profile_effect || 'none'} bioData={bioData} />
  );

  const gridNode = (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 sm:gap-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar pb-6">
      <button
        type="button"
        onClick={() => {
          setPreviewBorderId('none');
          setIndex(0);
          setScreen('preview');
        }}
        className={`aspect-square text-xs font-black rounded-[2rem] flex flex-col items-center justify-center transition-all ${
          previewBorderId === 'none' 
            ? 'bg-emerald-500/10 border-2 border-emerald-500 shadow-lg text-emerald-400 font-extrabold' 
            : 'bg-[#1a1a1a] border border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:bg-zinc-800'
        }`}
      >
        <span className="text-2xl mb-1 mt-1">⦸</span>
        NONE
      </button>

      {PROFILE_BORDERS.slice(1).map((border, bIdx) => {
        const borderActualIdx = bIdx + 1;
        const isSelected = previewBorderId === border.id;

        return (
          <button
            key={border.id}
            type="button"
            onClick={() => {
              setPreviewBorderId(border.id);
              setIndex(borderActualIdx);
              setScreen('preview');
            }}
            style={border.cardStyle}
            className={`aspect-square text-[10px] font-black rounded-[2rem] flex items-center justify-center transition-all relative ${
              isSelected 
                ? 'ring-4 ring-emerald-500/30 scale-105 z-10 shadow-2xl' 
                : 'hover:scale-105 bg-[#1a1a1a] border border-zinc-800 hover:bg-zinc-800'
            }`}
            title={border.name}
          >
            <span className="absolute inset-1 bg-[#141416]/90 rounded-[1.75rem] z-0 flex items-center justify-center font-mono font-black text-white text-sm">
              {borderActualIdx === index && isSelected ? '✓' : borderActualIdx}
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <CosmeticShopLayout
      title="Profile Borders"
      tag="FREE"
      onClose={onClose}
      onSave={handleSave}
      onPrev={handlePrev}
      onNext={handleNext}
      onViewGrid={() => setScreen(screen === 'preview' ? 'grid' : 'preview')}
      screen={screen}
      previewNode={previewNode}
      gridNode={gridNode}
    />
  );
}

function MessageCardsModal({ profile, bioData, onClose, onSave }: any) {
  const [screen, setScreen] = useState<'preview' | 'grid'>('preview');
  const [previewCardId, setPreviewCardId] = useState(() => bioData?.message_card || 'none');
  const [index, setIndex] = useState(() => {
    const currentId = bioData?.message_card || 'none';
    const foundIdx = MESSAGE_CARDS.findIndex(c => c.id === currentId);
    return foundIdx >= 0 ? foundIdx : 0;
  });

  const unlockedCards = bioData?.unlocked_message_cards || [];

  useEffect(() => {
    const idx = MESSAGE_CARDS.findIndex(c => c.id === previewCardId);
    if (idx >= 0) setIndex(idx);
  }, [previewCardId]);

  const handlePrev = () => {
    const nextIdx = (index - 1 + MESSAGE_CARDS.length) % MESSAGE_CARDS.length;
    setIndex(nextIdx);
    setPreviewCardId(MESSAGE_CARDS[nextIdx].id);
  };

  const handleNext = () => {
    const nextIdx = (index + 1) % MESSAGE_CARDS.length;
    setIndex(nextIdx);
    setPreviewCardId(MESSAGE_CARDS[nextIdx].id);
  };

  const currentCard = MESSAGE_CARDS[index] || MESSAGE_CARDS[0];
  const isCustom = currentCard.id !== 'none';
  const isUnlocked = currentCard.cost === 0 || unlockedCards.includes(currentCard.id);

  const handleSave = () => {
    if (!isUnlocked) {
      const userCoins = bioData?.coins ?? 0;
      if (userCoins < currentCard.cost) {
        toast.error(`You need ${currentCard.cost} Coins to purchase this. You currently have ${userCoins} Coins.`);
        return;
      }
      // Purchase item!
      const updatedCoins = userCoins - currentCard.cost;
      const updatedUnlocked = [...unlockedCards, currentCard.id];
      onSave({ 
        message_card: currentCard.id,
        coins: updatedCoins,
        unlocked_message_cards: updatedUnlocked
      });
      toast.success(`Successfully unlocked and equipped standard ${currentCard.name} message card!`);
    } else {
      onSave({ message_card: previewCardId });
      toast.success('Message Card style equipped successfully!');
    }
    onClose();
  };

  const previewNode = (
    <div className="bg-[#111] border border-zinc-800/80 rounded-2xl p-4 w-full flex flex-col pointer-events-none select-none">
      <span className="text-[10px] font-black text-zinc-500 uppercase mb-3 tracking-widest text-center">CARD PREVIEW ({currentCard.rarity})</span>
      
      <div className="flex items-start gap-3">
        <RenderPfpWithCustomBorder profile={profile} size={36} />
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-bold text-[13px] text-zinc-150">{profile?.username || 'You'}</span>
            <span className="text-[10px] text-zinc-500">12:34</span>
          </div>
          
          <div className={isCustom ? `mt-1 p-2.5 rounded-xl border relative shadow-md break-words ${currentCard.bubbleClass}` : "text-zinc-200 text-[14px] leading-relaxed break-words relative"} style={isCustom ? currentCard.bubbleStyle : undefined}>
            This is a preview of the <strong className="font-extrabold underline text-white">{currentCard.name}</strong> message card.
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between pt-3 border-t border-zinc-900">
        <span className="text-xs text-zinc-400 font-bold">Rarity: <span className={
          currentCard.rarity === 'Mythic' ? 'text-purple-400 font-black animate-pulse' :
          currentCard.rarity === 'Legendary' ? 'text-amber-400 font-extrabold' :
          currentCard.rarity === 'Epic' ? 'text-pink-400 font-bold' :
          currentCard.rarity === 'Rare' ? 'text-cyan-400' : 'text-zinc-450'
        }>{currentCard.rarity}</span></span>
        
        <div className="flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0"><circle cx="12" cy="12" r="10" fill="#FFB800" /><circle cx="12" cy="12" r="8" fill="#FFC700" /><path d="M12 6L13.8 9.6L17.5 10L14.7 12.6L15.5 16.5L12 14.5L8.5 16.5L9.3 12.6L6.5 10L10.2 9.6L12 6Z" fill="#FFD600" /></svg>
          <span className="text-xs font-black text-yellow-500">{currentCard.cost === 0 ? 'FREE' : `${currentCard.cost} Coins`}</span>
        </div>
      </div>
    </div>
  );

  const gridNode = (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar pb-6 text-zinc-300">
      {MESSAGE_CARDS.map((card, cIdx) => {
        const isSelected = previewCardId === card.id;
        const owns = card.cost === 0 || unlockedCards.includes(card.id);
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => {
              setPreviewCardId(card.id);
              setIndex(cIdx);
              setScreen('preview');
            }}
            className={`p-2.5 rounded-xl border flex flex-col items-center justify-between text-center transition-all min-h-[96px] relative ${
              isSelected 
                ? 'bg-cyan-500/10 border-cyan-500 shadow-lg scale-105 z-10' 
                : 'bg-[#151515] hover:bg-zinc-800 border-zinc-850 hover:border-zinc-700'
            }`}
          >
            <div className="text-[9px] font-black uppercase text-zinc-500 truncate w-full mb-1">{card.rarity}</div>
            <div className="font-bold text-xs text-white line-clamp-2 leading-tight flex-1 flex items-center justify-center">{card.name}</div>
            <div className="mt-2 text-[9px] font-mono flex items-center justify-center gap-1">
              {owns ? (
                <span className="text-cyan-400 font-extrabold uppercase text-[8px] tracking-wider">OWNED</span>
              ) : (
                <>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0"><circle cx="12" cy="12" r="10" fill="#FFB800" /><circle cx="12" cy="12" r="8" fill="#FFC700" /><path d="M12 6L13.8 9.6L17.5 10L14.7 12.6L15.5 16.5L12 14.5L8.5 16.5L9.3 12.6L6.5 10L10.2 9.6L12 6Z" fill="#FFD600" /></svg>
                  <span className="text-yellow-500 font-black">{card.cost}</span>
                </>
              )}
            </div>
            {isSelected && <span className="absolute top-1.5 right-1.5 font-black text-cyan-400 text-xs">✓</span>}
          </button>
        );
      })}
    </div>
  );

  return (
    <CosmeticShopLayout
      title="Message Cards"
      tag={isUnlocked ? "OWNED / EQUIP" : `${currentCard.cost} COINS`}
      onClose={onClose}
      onSave={handleSave}
      onPrev={handlePrev}
      onNext={handleNext}
      onViewGrid={() => setScreen(screen === 'preview' ? 'grid' : 'preview')}
      screen={screen}
      previewNode={previewNode}
      gridNode={gridNode}
    />
  );
}

function ProfileViewsModal({ currentUserProfile, allProfiles, onProfileUpdate, onClose }: any) {
  const [activeTab, setActiveTab] = useState<'insights' | 'leaderboard'>('insights');
  const [views, setViews] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const bio = parseBio(currentUserProfile.bio);
  const isUnlocked = bio.profile_views_unlocked_until && new Date(bio.profile_views_unlocked_until) > new Date();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (isUnlocked && activeTab === 'insights') {
        const { data } = await supabase.from('profile_views')
          .select('*')
          .eq('viewed_id', currentUserProfile.id)
          .order('created_at', { ascending: false });
        if (data) setViews(data);
      } else if (activeTab === 'leaderboard') {
        const { data } = await supabase.from('profile_views_leaderboard')
          .select('*')
          .order('total_views', { ascending: false })
          .limit(50);
        if (data) setLeaderboard(data);
      }
      setLoading(false);
    };
    fetchData();
  }, [isUnlocked, activeTab, currentUserProfile.id]);

  const handlePurchase = async () => {
    if (bio.coins < 1000 || bio.gems < 10) {
      toast.error('Not enough coins or gems!');
      return;
    }
    setIsPurchasing(true);
    const newUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const newBio = { ...bio, coins: bio.coins - 1000, gems: bio.gems - 10, profile_views_unlocked_until: newUntil };
    
    const { error } = await supabase.from('profiles').update({ bio: JSON.stringify(newBio) }).eq('id', currentUserProfile.id);
    setIsPurchasing(false);
    if (!error) {
      onProfileUpdate();
      toast.success('Profile Insights unlocked for 24 hours!');
    }
  };

  const totalViews = views.length;
  const uniqueVisitors = new Set(views.map(v => v.viewer_id)).size;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in font-sans">
      <div className="w-full max-w-2xl bg-[#0c0c0c] border border-zinc-800 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-[#141416]">
          <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 text-white">
            <Eye className="w-6 h-6 text-emerald-500" />
            Profile Insights
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <div className="flex border-b border-zinc-800 bg-[#09090b]">
          <button 
            onClick={() => setActiveTab('insights')} 
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest ${activeTab === 'insights' ? 'border-b-2 border-emerald-500 text-emerald-500' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            My Insights
          </button>
          <button 
            onClick={() => setActiveTab('leaderboard')} 
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest ${activeTab === 'leaderboard' ? 'border-b-2 border-emerald-500 text-emerald-500' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Leaderboard
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 relative">
          {activeTab === 'insights' && (
            <>
              {!isUnlocked ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                  <div className="w-24 h-24 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 text-emerald-500">
                    <Lock className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Unlock Insights</h3>
                  <p className="text-zinc-400 max-w-sm mb-8 leading-relaxed">See who viewed your profile, unique visitor count, and detailed view logs for 24 hours.</p>
                  <button 
                    onClick={handlePurchase}
                    disabled={isPurchasing}
                    className="flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-black uppercase tracking-widest text-sm transition-all active:scale-95 text-white disabled:opacity-50 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                    <span className="relative z-10 flex items-center gap-2">
                       Buy Access
                       <span className="w-px h-4 bg-white/30 mx-1"></span>
                       10 <Gem className="w-4 h-4 mr-1 text-emerald-200" />
                       1000 <Coins className="w-4 h-4 text-amber-300" />
                    </span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center shadow-inner">
                      <div className="text-3xl font-black text-white mb-1">{loading ? '...' : totalViews}</div>
                      <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total Views</div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center shadow-inner">
                      <div className="text-3xl font-black text-emerald-500 mb-1">{loading ? '...' : uniqueVisitors}</div>
                      <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Unique Visitors</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">Recent Visitors</h3>
                    {loading ? (
                       <p className="text-zinc-500 text-sm">Loading...</p>
                    ) : (
                       <div className="space-y-3">
                         {views.length === 0 && <p className="text-zinc-500 text-sm">No one has visited your profile yet!</p>}
                         {views.map(v => {
                           const user = allProfiles.find(p => p.id === v.viewer_id);
                           return (
                             <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-[#141416] border border-zinc-800 hover:border-zinc-700 transition-colors">
                               <div className="flex items-center gap-3">
                                 {user && <RenderPfpWithCustomBorder profile={user} size={32} />}
                                 <span className="font-bold text-white text-[15px]">{user?.username || 'Unknown User'}</span>
                               </div>
                               <span className="text-xs text-zinc-500 font-medium">
                                 {format(new Date(v.created_at), 'MMM d, HH:mm')}
                               </span>
                             </div>
                           )
                         })}
                       </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'leaderboard' && (
            <div className="space-y-3">
               {loading ? (
                 <p className="text-zinc-500 text-sm text-center py-10">Loading leaderboard...</p>
               ) : (
                 <>
                   {leaderboard.length === 0 && <p className="text-zinc-500 text-sm text-center py-10">No views registered on the server yet.</p>}
                   {leaderboard.map((entry, idx) => {
                     const user = allProfiles.find(p => p.id === entry.viewed_id);
                     return (
                       <div key={entry.viewed_id} className="flex items-center p-3 rounded-xl bg-[#141416] border border-zinc-800">
                         <div className="w-8 text-center font-black text-zinc-600 mr-2">#{idx + 1}</div>
                         <div className="flex items-center gap-3 flex-1">
                           {user && <RenderPfpWithCustomBorder profile={user} size={36} />}
                           <div className="flex flex-col">
                             <span className="font-bold text-white text-[15px]">{user?.username || 'Unknown'}</span>
                             <span className="text-xs text-zinc-500 font-medium">{entry.unique_visitors} Unique Visitors</span>
                           </div>
                         </div>
                         <div className="text-emerald-500 font-black text-lg">
                           {entry.total_views} <span className="text-[10px] text-zinc-500 uppercase tracking-widestml-1">Views</span>
                         </div>
                       </div>
                     );
                   })}
                 </>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PrivateMessagesModal({ 
  currentUserProfile, 
  allProfiles, 
  privateMessages, 
  activeTypers,
  broadcastTyping,
  onClose,
  onSendMessage,
  initialTargetId = null
}: any) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(initialTargetId);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [showPaintCanvasModal, setShowPaintCanvasModal] = useState(false);

  useEffect(() => {
    // When selected user changes, mark messages as read
    if (selectedUserId) {
      supabase.from('private_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('sender_id', selectedUserId)
        .eq('receiver_id', currentUserProfile.id)
        .is('read_at', null)
        .then(() => {});
    }
  }, [selectedUserId, privateMessages, currentUserProfile.id]);

  const contacts = useMemo(() => {
    const userIds = new Set<string>();
    privateMessages.forEach((m: any) => {
      if (m.sender_id === currentUserProfile.id) userIds.add(m.receiver_id);
      if (m.receiver_id === currentUserProfile.id) userIds.add(m.sender_id);
    });
    return allProfiles.filter(p => userIds.has(p.id));
  }, [privateMessages, allProfiles, currentUserProfile.id]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allProfiles.filter(p => p.id !== currentUserProfile.id && p.username?.toLowerCase().includes(query)).slice(0, 5);
  }, [searchQuery, allProfiles, currentUserProfile.id]);

  const currentChat = useMemo(() => {
    if (!selectedUserId) return [];
    return privateMessages.filter((m: any) => 
      (m.sender_id === currentUserProfile.id && m.receiver_id === selectedUserId) ||
      (m.receiver_id === currentUserProfile.id && m.sender_id === selectedUserId)
    );
  }, [privateMessages, selectedUserId, currentUserProfile.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentChat]);

  const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUserId) return;

    setIsUploadingFile(true);
    const fileExt = file.name.split('.').pop();
    const randomId = crypto.randomUUID();
    const filePath = `attachments/${currentUserProfile.id}/${randomId}.${fileExt}`;

    const uploadToast = toast.loading(`Uploading ${file.name}...`);
    try {
      const { error: uploadError } = await supabase.storage.from('banners').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('banners').getPublicUrl(filePath);
      if (!data?.publicUrl) throw new Error("Could not construct public URL");

      await onSendMessage(selectedUserId, data.publicUrl);
      toast.success("File sent!", { id: uploadToast });
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`, { id: uploadToast });
    } finally {
      setIsUploadingFile(false);
      e.target.value = '';
    }
  };

  const selectedUser = allProfiles.find(p => p.id === selectedUserId);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in font-sans">
      <div className="w-full max-w-4xl h-[700px] max-h-[90vh] bg-[#0c0c0c] border border-zinc-800 rounded-[2rem] shadow-2xl flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 border-r border-zinc-800 flex flex-col bg-[#0a0a0a]">
          <div className="p-5 border-b border-zinc-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-tight text-white">Messages</h2>
              <button onClick={onClose} className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors md:hidden">
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Find users..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1 relative">
            {searchQuery.trim() ? (
              <div className="absolute top-0 left-0 right-0 p-2 z-10 bg-[#0a0a0a]">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase px-2 mb-2">Search Results</h3>
                {searchResults.length === 0 && <div className="text-xs text-zinc-500 px-2">No users found</div>}
                {searchResults.map(user => (
                  <button 
                    key={user.id}
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all hover:bg-zinc-900 border border-transparent"
                  >
                    <RenderPfpWithCustomBorder profile={user} size={32} />
                    <div className="text-left overflow-hidden">
                      <div className="text-xs font-bold truncate text-zinc-200">{user.username}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}

            {!searchQuery && contacts.length === 0 ? (
              <div className="text-center py-10 text-zinc-600 text-[11px] font-medium px-4">
                No active conversations
              </div>
            ) : !searchQuery ? (
              contacts.map(user => (
                <button 
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${selectedUserId === user.id ? 'bg-emerald-500/10 border border-emerald-500/20' : 'hover:bg-zinc-900 border border-transparent'}`}
                >
                  <RenderPfpWithCustomBorder profile={user} size={36} />
                  <div className="text-left overflow-hidden">
                    <div className={`text-xs font-bold truncate ${selectedUserId === user.id ? 'text-emerald-400' : 'text-zinc-200'}`}>{user.username}</div>
                    <div className="text-[10px] text-zinc-500 truncate">Click to chat</div>
                  </div>
                </button>
              ))
            ) : null}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-[#0c0c0c] min-w-0">
          {selectedUserId ? (
            <>
              <div className="p-5 border-b border-zinc-800 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                  {selectedUser && <RenderPfpWithCustomBorder profile={selectedUser} size={36} />}
                  <h3 className="text-base font-extrabold text-white">{selectedUser?.username}</h3>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors active:scale-95">
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">
                {currentChat.map((m: any) => {
                  const isMe = m.sender_id === currentUserProfile.id;
                  const msgProfile = isMe ? currentUserProfile : selectedUser;
                  const bioObj = msgProfile ? parseBio(msgProfile.bio) : {} as any;
                  const messageCardId = bioObj.message_card || 'none';
                  const messageCard = MESSAGE_CARDS.find(c => c.id === messageCardId) || MESSAGE_CARDS[0];
                  const isCustomCard = messageCard.id !== 'none';

                  return (
                    <div key={m.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="shrink-0 mt-1">
                        {msgProfile && <RenderPfpWithCustomBorder profile={msgProfile} size={36} />}
                      </div>
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                        <div 
                           className={`relative ${isCustomCard ? messageCard.bubbleClass : (isMe ? 'bg-emerald-600 text-white px-4 py-2' : 'bg-zinc-800 text-zinc-200 px-4 py-2 border border-zinc-700')} text-[15px] font-medium leading-relaxed ${!isCustomCard && 'rounded-[20px]'}`} 
                           style={isCustomCard ? messageCard.bubbleStyle : {}}
                        >
                          <div className="break-words markdown-body">
                            <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                              {m.content}
                            </Markdown>
                          </div>
                        </div>
                        <div className={`text-[10px] mt-1 opacity-50 font-medium tracking-wide ${isMe ? 'pr-2' : 'pl-2'} flex items-center justify-end gap-1`}>
                          {format(new Date(m.created_at), 'HH:mm')}
                          {isMe && (
                            <span className="text-[9px] uppercase font-black text-emerald-400">
                              {m.read_at ? 'Read' : 'Delivered'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {activeTypers && activeTypers.filter(t => t.targetId === `pm_${currentUserProfile.id}` && t.userId === selectedUserId).length > 0 && (
                <div className="px-6 py-2 text-[11px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2 animate-pulse bg-[#0a0a0a]/80 backdrop-blur-md border-t border-zinc-800/50 absolute bottom-[90px] left-0 right-0 z-10 w-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {selectedUser?.username} is typing...
                </div>
              )}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newMessage.trim()) {
                    onSendMessage(selectedUserId, newMessage);
                    setNewMessage('');
                  }
                }}
                className="p-4 border-t border-zinc-800 flex items-center gap-3 bg-[#0a0a0a] relative z-20"
              >
                <div className="flex items-center gap-1">
                  <label
                    title="Send Image/GIF/Video (MP4)"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#29292e] text-zinc-400 hover:text-emerald-400 hover:bg-[#34343a] transition-colors cursor-pointer"
                  >
                    {isUploadingFile ? (
                      <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
                    ) : (
                      <Upload className="h-5 w-5" />
                    )}
                    <input
                      type="file"
                      accept="image/*,video/mp4,video/webm,image/gif"
                      className="hidden"
                      onChange={handleDirectFileUpload}
                      disabled={isUploadingFile}
                    />
                  </label>
                  <button
                    type="button"
                    title="Paint & Send"
                    onClick={() => setShowPaintCanvasModal(true)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#29292e] text-purple-400 hover:text-purple-300 hover:bg-[#34343a] transition-colors"
                  >
                    <Paintbrush className="h-5 w-5" />
                  </button>
                </div>
                <input 
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    if (broadcastTyping && selectedUserId) {
                      broadcastTyping(`pm_${selectedUserId}`);
                    }
                  }}
                  placeholder={`Message @${selectedUser?.username || 'user'}...`}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-full px-5 py-3 text-[15px] text-white focus:outline-none focus:border-emerald-500/50 transition-colors shadow-inner"
                />
                <button type="submit" disabled={!newMessage.trim()} className="p-3 bg-emerald-600 disabled:opacity-50 disabled:bg-zinc-800 hover:bg-emerald-500 rounded-full text-white transition-all active:scale-95 shadow-md">
                  <Send className="w-5 h-5 ml-1 my-0.5 mr-0.5" />
                </button>
              </form>
              
              <AnimatePresence>
                {showPaintCanvasModal && (
                  <PaintCanvasModal
                    onClose={() => setShowPaintCanvasModal(false)}
                    onSend={async (url: string) => {
                      if (!selectedUserId) return;
                      await onSendMessage(selectedUserId, url);
                      setShowPaintCanvasModal(false);
                    }}
                  />
                )}
              </AnimatePresence>
              
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 relative">
              <button onClick={onClose} className="absolute top-5 right-5 p-2 hover:bg-zinc-800 rounded-lg transition-colors active:scale-95">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
              <div className="w-20 h-20 bg-zinc-900 rounded-[2rem] flex items-center justify-center mb-6 border border-zinc-800 text-emerald-500 shadow-2xl">
                <MessageSquare className="w-10 h-10" />
              </div>
              <h3 className="text-white text-xl font-black mb-2 tracking-tight">Private Messaging</h3>
              <p className="text-zinc-400 text-sm max-w-xs leading-relaxed">Search for users on the left or select a contact to start chatting privately.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileEffectsModal({ profile, bioData, onClose, onSave }: any) {
  const [screen, setScreen] = useState<'preview' | 'grid'>('preview');
  const [previewEffectId, setPreviewEffectId] = useState(() => bioData?.profile_effect || 'none');
  const [index, setIndex] = useState(() => {
    const currentId = bioData?.profile_effect || 'none';
    const foundIdx = PROFILE_EFFECTS.findIndex(e => e.id === currentId);
    return foundIdx >= 0 ? foundIdx : 0;
  });

  useEffect(() => {
    const idx = PROFILE_EFFECTS.findIndex(e => e.id === previewEffectId);
    if (idx >= 0) setIndex(idx);
  }, [previewEffectId]);

  const handlePrev = () => {
    const nextIdx = (index - 1 + PROFILE_EFFECTS.length) % PROFILE_EFFECTS.length;
    setIndex(nextIdx);
    setPreviewEffectId(PROFILE_EFFECTS[nextIdx].id);
  };

  const handleNext = () => {
    const nextIdx = (index + 1) % PROFILE_EFFECTS.length;
    setIndex(nextIdx);
    setPreviewEffectId(PROFILE_EFFECTS[nextIdx].id);
  };

  const handleSave = () => {
    const shouldClearBg = previewEffectId !== 'none';
    onSave({ 
      profile_effect: previewEffectId,
      ...(shouldClearBg ? { profile_card_bg: '' } : {})
    });
    onClose();
    toast.success('Profile effect applied successfully!');
  };

  const previewNode = (
    <CosmeticCardPreview profile={profile} borderId={bioData?.profile_border || 'none'} effectId={previewEffectId} bioData={bioData} />
  );

  const gridNode = (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar pb-6">
      {PROFILE_EFFECTS.map((eff) => {
        const isSelected = previewEffectId === eff.id;

        return (
          <button
            key={eff.id}
            type="button"
            onClick={() => {
              setPreviewEffectId(eff.id);
              setScreen('preview');
            }}
            className={`p-0 rounded-[2rem] flex flex-col items-center text-center h-[140px] justify-center transition-all border relative overflow-hidden group ${
              isSelected 
                ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] font-bold scale-105 z-10' 
                : 'border-zinc-800 hover:border-zinc-700 hover:scale-105'
            }`}
          >
            <div className="absolute inset-0 bg-[#0c0c0c] z-0" />
            <div className="absolute inset-0 z-0 pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity">
              <ProfileEffectRenderer effectId={eff.id} />
            </div>
            <div className="relative z-10 mt-auto w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex items-end justify-center h-full">
              <span className={`text-[10px] font-black uppercase tracking-widest leading-tight ${isSelected ? 'text-white' : 'text-zinc-300 group-hover:text-white'} drop-shadow-md`}>{eff.name}</span>
            </div>
            {isSelected && <span className="absolute top-4 right-4 text-emerald-400 font-bold text-xs z-20">●</span>}
          </button>
        );
      })}
    </div>
  );

  return (
    <CosmeticShopLayout
      title="Profile Effects"
      tag="PREMIUM"
      onClose={onClose}
      onSave={handleSave}
      onPrev={handlePrev}
      onNext={handleNext}
      onViewGrid={() => setScreen(screen === 'preview' ? 'grid' : 'preview')}
      screen={screen}
      previewNode={previewNode}
      gridNode={gridNode}
    />
  );
}

function ProfileCombosModal({ profile, bioData, onClose, onSave }: any) {
  const [screen, setScreen] = useState<'preview' | 'grid'>('preview');
  const [index, setIndex] = useState(() => {
    const curBorder = bioData?.profile_border || 'none';
    const curEffect = bioData?.profile_effect || 'none';
    const foundIdx = PROFILE_COMBOS.findIndex(c => c.borderId === curBorder && c.effectId === curEffect);
    return foundIdx >= 0 ? foundIdx : 0;
  });

  const currentCombo = PROFILE_COMBOS[index] || PROFILE_COMBOS[0];
  const [previewBorderId, setPreviewBorderId] = useState(() => currentCombo.borderId);
  const [previewEffectId, setPreviewEffectId] = useState(() => currentCombo.effectId);

  useEffect(() => {
    if (currentCombo) {
      setPreviewBorderId(currentCombo.borderId);
      setPreviewEffectId(currentCombo.effectId);
    }
  }, [index, currentCombo]);

  const handlePrev = () => {
    const nextIdx = (index - 1 + PROFILE_COMBOS.length) % PROFILE_COMBOS.length;
    setIndex(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = (index + 1) % PROFILE_COMBOS.length;
    setIndex(nextIdx);
  };

  const handleSave = () => {
    const shouldClearBg = previewEffectId !== 'none';
    onSave({ 
      profile_border: previewBorderId,
      profile_effect: previewEffectId,
      ...(shouldClearBg ? { profile_card_bg: '' } : {})
    });
    onClose();
    toast.success('Curated combo preset applied successfully!');
  };

  const previewNode = (
    <CosmeticCardPreview profile={profile} borderId={previewBorderId} effectId={previewEffectId} bioData={bioData} />
  );

  const gridNode = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar pb-6">
      {PROFILE_COMBOS.map((combo, cIdx) => {
        const isSelected = index === cIdx;
        const borderObj = getBorderStyles(combo.borderId);
        const effectObj = PROFILE_EFFECTS.find(e => e.id === combo.effectId);

        return (
          <button
            key={combo.id}
            type="button"
            onClick={() => {
              setIndex(cIdx);
              setScreen('preview');
            }}
            style={borderObj.cardStyle}
            className={`h-[150px] p-0 rounded-[2.5rem] flex flex-col items-center justify-center text-center transition-all relative overflow-hidden group ${borderObj.className ? borderObj.className : 'border border-zinc-800'} ${
              isSelected 
                ? 'scale-105 z-10' 
                : 'hover:scale-[1.02]'
            }`}
          >
            <div className="absolute inset-0 bg-[#0c0c0c] z-0" />
            <div className="absolute inset-0 z-0 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity">
               <ProfileEffectRenderer effectId={combo.effectId} />
            </div>

            <div className="relative z-10 p-4 h-full flex flex-col justify-end w-full bg-gradient-to-t from-black/90 via-black/40 to-transparent">
              <div className="flex items-center justify-between w-full gap-2 mt-auto">
                <span className="text-[11px] font-black uppercase tracking-wider text-white drop-shadow-[0_0_5px_rgba(0,0,0,1)] truncate" style={{ color: combo.themeColor }}>{combo.name}</span>
                <span 
                  style={{ borderColor: combo.themeColor, color: combo.themeColor, backgroundColor: `${combo.themeColor}20` }}
                  className="text-[8px] font-black uppercase px-2 py-0.5 rounded border shrink-0 font-mono shadow-[0_0_10px_rgba(0,0,0,0.8)] backdrop-blur-sm"
                >
                  {combo.badge}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2 truncate w-full text-left">
                <span className="text-[8px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-sm border border-zinc-700/50 px-1.5 py-0.5 rounded text-zinc-300 truncate">
                  {borderObj.name}
                </span>
              </div>
            </div>
            
            {isSelected && <div className="absolute top-4 right-4 bg-emerald-500 rounded-full w-2 h-2 shadow-[0_0_10px_#10b981] z-20" />}
          </button>
        );
      })}
    </div>
  );

  return (
    <CosmeticShopLayout
      title="Curated Combos"
      tag="VIP"
      onClose={onClose}
      onSave={handleSave}
      onPrev={handlePrev}
      onNext={handleNext}
      onViewGrid={() => setScreen(screen === 'preview' ? 'grid' : 'preview')}
      screen={screen}
      previewNode={previewNode}
      gridNode={gridNode}
    />
  );
}

function ProfileCreatorModal({ profile, bioData, onClose, onSave }: any) {
  const [customConfig, setCustomConfig] = useState(() => {
    const currentId = bioData?.profile_border || '';
    if (currentId.startsWith('custom:')) {
      try {
        return JSON.parse(currentId.slice(7));
      } catch (err) {}
    }
    return {
      name: 'My Masterpiece',
      color: '#10b981',
      style: 'solid' as const,
      width: 3,
      glowColor: '#10b981',
      glowIntensity: 15
    };
  });

  const previewBorderId = `custom:${JSON.stringify(customConfig)}`;

  const handleSave = () => {
    onSave({ profile_border: previewBorderId });
    onClose();
    toast.success('Custom border applied successfully!');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto select-none font-sans animate-fade-in">
      <style dangerouslySetInnerHTML={{ __html: BORDER_KEYFRAMES }} />
      <style dangerouslySetInnerHTML={{ __html: EFFECTS_KEYFRAMES }} />
      <div className="w-full max-w-4xl bg-[#09090b] border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row gap-6 relative shadow-[0_0_50px_rgba(0,0,0,0.9)] max-h-[92vh] overflow-y-auto md:overflow-hidden animate-fade-in duration-200">
        
        <CosmeticCardPreview profile={profile} borderId={previewBorderId} effectId={bioData?.profile_effect || 'none'} bioData={bioData} />

        <div className="flex-1 flex flex-col gap-3.5 max-h-[460px] overflow-y-auto custom-scrollbar justify-between select-none">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-900 text-left">
              <span className="text-white font-black text-sm tracking-wide uppercase font-sans">
                Border Creator Lab
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#888] bg-zinc-900 border border-zinc-850 rounded-full px-3 py-1">
                Builder Lab
              </span>
            </div>

            <div className="flex flex-col gap-3.5 bg-zinc-950/60 p-4 border border-zinc-900 rounded-xl text-left font-sans animate-fade-in">
              <div className="flex flex-col gap-1.5 font-sans">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Border Name</label>
                <input
                  type="text"
                  maxLength={24}
                  value={customConfig.name}
                  onChange={(e) => setCustomConfig({ ...customConfig, name: e.target.value })}
                  placeholder="e.g. My Masterpiece"
                  className="w-full bg-[#141416] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-650 focus:outline-none focus:border-zinc-700 font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase tracking-widest font-black font-sans">
                  <span>Border Thickness</span>
                  <span className="text-emerald-400 font-mono font-bold">{customConfig.width}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={customConfig.width}
                  onChange={(e) => setCustomConfig({ ...customConfig, width: parseInt(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer h-1 bg-zinc-800 rounded"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Stroke Style</label>
                <div className="grid grid-cols-3 gap-1.5 text-[9px] font-bold text-zinc-400 uppercase tracking-tight font-sans">
                  {(['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge'] as const).map((pattern) => (
                    <button
                      key={pattern}
                      type="button"
                      onClick={() => setCustomConfig({...customConfig, style: pattern})}
                      className={`py-1 rounded border text-center transition-all truncate ${
                        customConfig.style === pattern 
                          ? 'border-emerald-500 bg-emerald-500/10 text-white font-extrabold shadow-sm' 
                          : 'border-zinc-800 bg-[#141416] hover:bg-zinc-850'
                      }`}
                    >
                      {pattern}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase tracking-widest font-black">
                  <span>Outline Tint</span>
                  <span className="text-zinc-400 font-mono text-[9px]">{customConfig.color}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-wrap gap-1.5 flex-1 font-sans">
                    {['#10b981', '#ef4444', '#a855f7', '#fbbf24', '#06b6d4', '#f472b6', '#ffffff', '#000000'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setCustomConfig({ ...customConfig, color })}
                        style={{ backgroundColor: color }}
                        className={`w-5 h-5 rounded-full border transition-all ${
                          customConfig.color === color ? 'ring-2 ring-white scale-110' : 'border-zinc-800 opacity-80 hover:opacity-100'
                        }`}
                        title={color}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={customConfig.color}
                    onChange={(e) => setCustomConfig({ ...customConfig, color: e.target.value })}
                    className="w-7 h-7 bg-transparent border-0 cursor-pointer rounded shrink-0 p-0"
                    title="Choose Custom Color"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px] text-zinc-505 uppercase tracking-widest font-black font-sans">
                  <span>Glow Strength</span>
                  <span className="text-zinc-400 font-mono text-[9px]">{customConfig.glowIntensity}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={customConfig.glowIntensity}
                  onChange={(e) => setCustomConfig({ ...customConfig, glowIntensity: parseInt(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer h-1 bg-zinc-800 rounded align-middle"
                />

                {customConfig.glowIntensity > 0 && (
                  <div className="flex items-center gap-2 mt-1 animate-in fade-in slide-in-from-top-1 font-sans">
                    <div className="flex flex-wrap gap-1.5 flex-1 font-sans">
                      {['#10b981', '#ef4444', '#a855f7', '#fbbf24', '#06b6d4', '#f472b6', '#ffffff'].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setCustomConfig({ ...customConfig, glowColor: color })}
                          style={{ backgroundColor: color }}
                          className={`w-5 h-5 rounded-full border transition-all ${
                            customConfig.glowColor === color ? 'ring-2 ring-white scale-110' : 'border-zinc-850 opacity-80 hover:opacity-100'
                          }`}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={customConfig.glowColor}
                      onChange={(e) => setCustomConfig({ ...customConfig, glowColor: e.target.value })}
                      className="w-7 h-7 bg-transparent border-0 cursor-pointer rounded shrink-0 p-0"
                      title="Choose Custom Glow"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col gap-2 pt-4 border-t border-zinc-900 mt-auto font-sans">
            <button 
              type="button"
              onClick={handleSave}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs tracking-wider uppercase shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-emerald-500/50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Save Custom Design</span>
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="w-full py-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 font-extrabold uppercase tracking-widest text-center transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function ProfileBorderForm({ profile, onClose, onSave, bioData, initialTab }: any) {
  const [activeTab, setActiveTab] = useState<'combos' | 'effects' | 'borders'>(() => {
    if (initialTab === 'borders' || initialTab === 'effects' || initialTab === 'combos') {
      return initialTab;
    }
    return 'combos';
  });
  const [previewActiveTab, setPreviewActiveTab] = useState<'bio' | 'info'>('bio');
  
  const [previewBorderId, setPreviewBorderId] = useState(() => bioData?.profile_border || 'none');
  const [previewEffectId, setPreviewEffectId] = useState(() => bioData?.profile_effect || 'none');

  const [index, setIndex] = useState(() => {
    const currentId = bioData?.profile_border || 'none';
    const foundIdx = PROFILE_BORDERS.findIndex(b => b.id === currentId);
    return foundIdx >= 0 ? foundIdx : 0;
  });

  // State for Custom Border Designer
  const [customConfig, setCustomConfig] = useState(() => {
    const currentId = bioData?.profile_border || '';
    if (currentId.startsWith('custom:')) {
      try {
        return JSON.parse(currentId.slice(7));
      } catch (err) {}
    }
    return {
      name: 'My Masterpiece',
      color: '#10b981',
      style: 'solid' as const,
      width: 3,
      glowColor: '#10b981',
      glowIntensity: 15
    };
  });

  // Keep index state in sync if standard border is selected
  useEffect(() => {
    if (previewBorderId && !previewBorderId.startsWith('custom:')) {
      const idx = PROFILE_BORDERS.findIndex(b => b.id === previewBorderId);
      if (idx >= 0) setIndex(idx);
    }
  }, [previewBorderId]);

  const resolvedBorder = getBorderStyles(previewBorderId) || {
    id: 'none',
    name: 'No border',
    className: '',
    cardStyle: {}
  };

  const handleSave = () => {
    const shouldClearBg = previewEffectId !== 'none';
    onSave({
      profile_border: previewBorderId,
      profile_effect: previewEffectId,
      ...(shouldClearBg ? { profile_card_bg: '' } : {})
    });
    onClose();
    toast.success('Cosmetics saved successfully!');
  };

  const previewGender = profile.gender || 'Not Specified';
  const previewAge = profile.age || 'Age N/A';

  if (profile) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto select-none">
      {/* Width expanded into a clean bento-grid double-column atelier layout */}
      <div className="w-full max-w-4xl bg-[#09090b] border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row gap-6 relative shadow-[0_0_50px_rgba(0,0,0,0.9)] max-h-[92vh] overflow-y-auto md:overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* LEFT COLUMN: VISUAL PREVIEW CARD */}
        {(() => {
          const isLivePreviewRainbow = previewBorderId === 'rainbow-wave' || previewBorderId === 'rainbow-neon' || previewEffectId === 'psychedelic';
          return (
            <div className="md:w-[350px] shrink-0 flex flex-col bg-[#141416]/40 border border-[#1e1e22] rounded-2xl p-4 gap-4 justify-between">
              <div className="w-full text-center">
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500">Live card preview</span>
              </div>

              {/* Persistent Live Card Preview */}
              <div 
                style={resolvedBorder.cardStyle} 
                className={`w-full overflow-hidden rounded-2xl bg-[#141416] border shadow-2xl relative select-none shrink-0 transition-all duration-300 ${resolvedBorder.className || ''} flex flex-col h-[400px]`}
              >
                {/* Banner block */}
                <div className="h-24 w-full relative shrink-0 z-0 border-b border-zinc-900/40">
                  <img 
                    src={profile.banner_url || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop'} 
                    alt="Banner" 
                    className="h-full w-full object-cover" 
                  />
                </div>

                {/* Card Background image content overlay */}
                <div 
                  style={previewEffectId === 'none' && bioData.profile_card_bg ? {
                    backgroundImage: `url(${bioData.profile_card_bg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  } : undefined}
                  className="flex-1 flex flex-col relative overflow-hidden"
                >
                  {previewEffectId === 'none' && bioData.profile_card_bg && (
                    <div className="absolute inset-0 bg-zinc-950/85 backdrop-blur-[1px] z-0 pointer-events-none" />
                  )}

                  <ProfileEffectRenderer effectId={previewEffectId} />

                  <div className="relative z-10 flex flex-col h-full overflow-y-auto pb-4 custom-scrollbar">
                    <div className="px-5 pb-3 relative shrink-0">
                      <div className="flex justify-between items-end">
                        <div className="relative border-4 border-[#141416] rounded-full h-18 w-18 bg-zinc-800 shrink-0 overflow-hidden -mt-9">
                          <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover rounded-full" />
                        </div>
                      </div>

                      <div className="mt-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className={`text-base font-bold ${isLivePreviewRainbow ? 'rainbow-text' : 'text-white'}`}>{profile.username}</h3>
                          <div className="flex items-center gap-1 cursor-default text-emerald-500 ml-1">
                            <Heart className="w-4 h-4 fill-emerald-500 animate-pulse" />
                            <span className="text-[11px] font-bold">{profile.profile_likes?.length || 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 mb-1">
                          <img src={getRank(profile.email, profile.id, profile.rank).icon} alt={getRank(profile.email, profile.id, profile.rank).name} className="h-3.5 object-contain" />
                          <span className={`text-xs font-bold ${isLivePreviewRainbow ? 'rainbow-text' : 'text-zinc-300'}`}>{getRank(profile.email, profile.id, profile.rank).name}</span>
                        </div>
                        {bioData.mood && (
                          <p className={`text-xs mt-0.5 font-medium ${isLivePreviewRainbow ? 'rainbow-text' : 'text-emerald-400'}`}>{bioData.mood}</p>
                        )}
                      </div>
                    </div>

                    {/* Preview interactive Tabs */}
                    <div className="flex flex-col flex-1 pb-4 shadow-inner">
                      <div className="flex gap-4 border-b border-zinc-800/80 px-5 shrink-0 h-8">
                        <button 
                          type="button" 
                          onClick={() => setPreviewActiveTab('bio')} 
                          className={`pb-0.5 flex items-center border-b-2 font-medium transition-colors text-xs ${previewActiveTab === 'bio' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
                        >
                          About Me
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setPreviewActiveTab('info')} 
                          className={`pb-0.5 flex items-center border-b-2 font-medium transition-colors text-xs ${previewActiveTab === 'info' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
                        >
                          Info
                        </button>
                      </div>

                      <div className="h-32 overflow-y-auto px-5 py-2.5 custom-scrollbar z-10 relative">
                        {previewActiveTab === 'bio' ? (
                          <div className="text-[11px] text-zinc-350 leading-relaxed">
                            {bioData.text ? (
                              <Markdown remarkPlugins={[remarkGfm, remarkBreaks]} components={getMarkdownComponents(profile)}>
                                {scrubContent(bioData.text)}
                              </Markdown>
                            ) : (
                              <p className="text-zinc-500">No bio provided yet.</p>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 text-[11px] text-zinc-350">
                            <div className="flex justify-between items-center pb-1.5 border-b border-zinc-900">
                              <span className="text-zinc-400">Last online</span>
                              <span>{profile.updated_at ? format(new Date(profile.updated_at), 'dd MMM yyyy, HH:mm') : 'Online Now'}</span>
                            </div>
                            <div className="flex justify-between items-center pb-1.5 border-b border-zinc-900">
                              <span className="text-zinc-400">Gender</span>
                              <span>{previewGender}</span>
                            </div>
                            <div className="flex justify-between items-center pb-1.5 border-b border-zinc-900">
                              <span className="text-zinc-400">Age</span>
                              <span>{previewAge}</span>
                            </div>
                            <div className="flex justify-between items-center pb-1.5 border-b border-zinc-900">
                              <span className="text-zinc-400">Current Room</span>
                              <span className="text-emerald-500 font-medium">Main</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save / Cancel triggers aligned below persistent preview */}
              <div className="w-full flex flex-col gap-2 pt-2 border-t border-zinc-900/60 mt-auto">
                <button 
                  type="button"
                  onClick={handleSave}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-[11px] tracking-wider uppercase shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-emerald-500/50"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Save Cosmetics</span>
                </button>
                <button 
                  type="button"
                  onClick={onClose}
                  className="w-full py-1 text-[10px] text-zinc-500 hover:text-zinc-300 font-extrabold uppercase tracking-widest text-center transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          );
        })()}

        {/* RIGHT COLUMN: COSMETICS WORKSPACE */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 select-none custom-scrollbar">
          
          {/* Profile Borders Header with 0 coins badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-900 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-white font-black text-sm tracking-wide uppercase">
                Profile Borders
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-850 rounded-full px-3 py-1 text-[11px] font-bold text-yellow-500 self-start">
              <span>0 coins</span>
            </div>
          </div>

          {/* Workspace category tabs */}
          <div className="grid grid-cols-3 gap-1 bg-[#141416] p-1 rounded-xl border border-zinc-900 animate-in fade-in duration-300">
            <button 
              onClick={() => setActiveTab('combos')} 
              className={`py-2 rounded-lg text-xs font-extrabold flex items-center justify-center transition-all ${
                activeTab === 'combos' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm font-black' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              <span>Combos</span>
            </button>
            <button 
              onClick={() => setActiveTab('effects')} 
              className={`py-2 rounded-lg text-xs font-extrabold flex items-center justify-center transition-all ${
                activeTab === 'effects' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm font-black' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              <span>Effects</span>
            </button>
            <button 
              onClick={() => setActiveTab('borders')} 
              className={`py-2 rounded-lg text-xs font-extrabold flex items-center justify-center transition-all ${
                activeTab === 'borders' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm font-black' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              <span>Borders</span>
            </button>
          </div>

          {/* ACTIVE TAB PANEL VIEWPORT CONTAINER */}
          <div className="flex-1 min-h-[360px] max-h-[460px] overflow-y-auto custom-scrollbar">
            
            {/* PANEL 1: MATCHING COMBO PRESETS */}
            {activeTab === 'combos' && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl">
                  <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                    🎯 Presets created by designers combining premium borders and visual effects. Clicking any preset immediately applies both styles to see how they look together. Like what you see? Click <strong className="text-emerald-400 font-bold">Save Cosmetics</strong> to apply!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                  {PROFILE_COMBOS.map((combo) => {
                    const isSelected = previewBorderId === combo.borderId && previewEffectId === combo.effectId;
                    const borderObj = getBorderStyles(combo.borderId);
                    const effectObj = PROFILE_EFFECTS.find(e => e.id === combo.effectId);
                    return (
                      <button
                        key={combo.id}
                        type="button"
                        onClick={() => {
                          setPreviewBorderId(combo.borderId);
                          setPreviewEffectId(combo.effectId);
                        }}
                        style={borderObj.cardStyle}
                        className={`p-0 rounded-xl flex flex-col text-left transition-all relative overflow-hidden group min-h-[120px] ${borderObj.className ? borderObj.className : 'border border-zinc-800'} ${
                          isSelected 
                            ? 'scale-105 z-10' 
                            : 'hover:scale-[1.02] opacity-80 hover:opacity-100'
                        }`}
                      >
                         <div className="absolute inset-0 bg-[#0c0c0c] z-0" />
                          <div className="absolute inset-0 z-0 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity">
                            <ProfileEffectRenderer effectId={combo.effectId} />
                          </div>

                          <div className="relative z-10 p-3 h-full flex flex-col w-full bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                            <div className="flex items-center justify-between w-full mt-auto gap-2">
                              <span className="text-[11px] font-black tracking-wide text-white drop-shadow-md truncate" style={{ color: combo.themeColor }}>{combo.name}</span>
                              <span 
                                style={{ borderColor: combo.themeColor, color: combo.themeColor, backgroundColor: `${combo.themeColor}10` }}
                                className="text-[8px] font-black uppercase px-2 py-0.5 rounded border shrink-0 backdrop-blur-sm"
                              >
                                {combo.badge}
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              <span className="text-[8px] font-bold bg-black/60 backdrop-blur-sm border border-zinc-700/50 px-1.5 py-0.5 rounded text-zinc-300">
                                {borderObj.name}
                              </span>
                            </div>
                          </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PANEL 2: OVER 25+ CUSTOM PROFILE EFFECTS GRID */}
            {activeTab === 'effects' && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl">
                  <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                    🌠 Visual overlays rendering beautiful animated effects across the entire card space. Custom effects take precedence over card background images (these backgrounds are automatically disabled when an active effect runs).
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pb-2">
                  {/* "None" template box */}
                  <button
                    type="button"
                    onClick={() => setPreviewEffectId('none')}
                    className={`p-3 rounded-xl flex flex-col items-center justify-center text-center transition-all border min-h-[101px] ${
                      previewEffectId === 'none' 
                        ? 'border-emerald-500 bg-emerald-500/10 text-white font-extrabold' 
                        : 'border-zinc-850 bg-[#141416]/40 text-zinc-400 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    <span className="text-xl">🎚️</span>
                    <span className="text-xs font-bold mt-1.5">No Effect</span>
                    <span className="text-[9px] text-zinc-500 mt-1">Revert card bg</span>
                  </button>

                  {PROFILE_EFFECTS.map((eff) => {
                    const isSelected = previewEffectId === eff.id;
                    return (
                      <button
                        key={eff.id}
                        type="button"
                        onClick={() => setPreviewEffectId(eff.id)}
                        className={`p-0 h-[100px] rounded-xl flex flex-col items-center justify-end text-center transition-all relative overflow-hidden group ${
                          isSelected 
                            ? 'border border-emerald-500 scale-105 z-10' 
                            : 'border border-zinc-800 hover:border-zinc-700 hover:scale-[1.02]'
                        }`}
                      >
                         <div className="absolute inset-0 bg-[#0c0c0c] z-0" />
                          <div className="absolute inset-0 z-0 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity">
                            <ProfileEffectRenderer effectId={eff.id} />
                          </div>

                          <div className="relative z-10 p-2 w-full bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                            <span className="text-[10px] font-black uppercase tracking-widest leading-tight text-white drop-shadow-md">{eff.name}</span>
                          </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PANEL 3: BORDERS PRESETS GRID */}
            {activeTab === 'borders' && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl">
                  <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                    📐 Select from the standard library of custom-built card border frames. These range from minimal thin structures to elaborate glowing animated neon cages.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-6 gap-2 select-none pb-2">
                    {/* None template box */}
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewBorderId('none');
                        setIndex(0);
                      }}
                      className={`w-full aspect-square text-xs font-black rounded-lg flex items-center justify-center transition-all border ${
                        previewBorderId === 'none' 
                          ? 'bg-emerald-500/10 border-2 border-emerald-500 shadow-lg text-emerald-400 font-extrabold' 
                          : 'bg-[#141416]/40 border-zinc-850 text-zinc-500 hover:border-zinc-700 hover:bg-zinc-850'
                      }`}
                      title="No Border"
                    >
                      ⦸
                    </button>

                    {/* Static 1 to 52 borders fully styled! */}
                    {PROFILE_BORDERS.slice(1).map((border, bIdx) => {
                      const borderActualIdx = bIdx + 1;
                      const isSelected = previewBorderId === border.id;
                      
                      return (
                        <button
                          key={border.id}
                          type="button"
                          onClick={() => {
                            setPreviewBorderId(border.id);
                            setIndex(borderActualIdx);
                          }}
                          style={border.cardStyle}
                          className={`w-full aspect-square text-[10px] font-black rounded-lg flex items-center justify-center transition-all relative ${
                            isSelected 
                              ? 'ring-2 ring-emerald-500 scale-105 z-10' 
                              : 'hover:scale-105 bg-zinc-800/20 border-zinc-850 hover:bg-zinc-800'
                          }`}
                          title={border.name}
                        >
                          <span className="absolute inset-0.5 bg-[#09090b]/80 rounded-sm z-0 flex items-center justify-center font-mono font-extrabold text-white text-[10px]">
                            {borderActualIdx}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-center select-none py-1.5 border-t border-zinc-900 leading-snug">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                      Selected frame: <span className="text-emerald-400 font-bold">{resolvedBorder ? resolvedBorder.name : 'No border'}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PANEL 4: CUSTOM BORDER DESIGN BUILDER */}
            {(activeTab as string) === 'creator' && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl">
                  <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                    🛠️ Design your own completely customized card boundary with full control of layout borders, custom hex tints, dash structures, outer glowing dropshadow colors, and live intensity levels.
                  </p>
                </div>

                <div className="flex flex-col gap-3.5 bg-zinc-950/60 p-4 border border-zinc-900 rounded-xl">
                  
                  {/* Border Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-[#888] uppercase tracking-widest font-black">Border Name</label>
                    <input
                      type="text"
                      maxLength={24}
                      value={customConfig.name}
                      onChange={(e) => {
                        const next = { ...customConfig, name: e.target.value };
                        setCustomConfig(next);
                        setPreviewBorderId(`custom:${JSON.stringify(next)}`);
                      }}
                      placeholder="e.g. Gamer Legend"
                      className="w-full bg-[#141416] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-650 focus:outline-none focus:border-zinc-700 font-medium"
                    />
                  </div>

                  {/* Stroke Width Slider */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[10px] text-[#888] uppercase tracking-widest font-black">
                      <span>Border Thickness</span>
                      <span className="text-emerald-400 font-mono font-bold">{customConfig.width}px</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="8"
                      value={customConfig.width}
                      onChange={(e) => {
                        const next = { ...customConfig, width: parseInt(e.target.value) };
                        setCustomConfig(next);
                        setPreviewBorderId(`custom:${JSON.stringify(next)}`);
                      }}
                      className="w-full accent-emerald-500 cursor-pointer h-1 bg-zinc-800 rounded"
                    />
                  </div>

                  {/* Stroke Pattern selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-[#888] uppercase tracking-widest font-black">Stroke Style</label>
                    <div className="grid grid-cols-3 gap-1.5 text-[9px] font-bold text-zinc-400 uppercase tracking-tight">
                      {(['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge'] as const).map((pattern) => (
                        <button
                          key={pattern}
                          type="button"
                          onClick={() => {
                            const next = { ...customConfig, style: pattern };
                            setCustomConfig(next);
                            setPreviewBorderId(`custom:${JSON.stringify(next)}`);
                          }}
                          className={`py-1 rounded border text-center transition-all truncate ${
                            customConfig.style === pattern 
                              ? 'border-emerald-500 bg-emerald-500/10 text-white font-extrabold' 
                              : 'border-zinc-800 bg-[#141416] hover:bg-zinc-800'
                          }`}
                        >
                          {pattern}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Outline Color presets and picker */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[10px] text-[#888] uppercase tracking-widest font-black">
                      <span>Outline Tint</span>
                      <span className="text-zinc-450 font-mono text-[9px]">{customConfig.color}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-wrap gap-1.5 flex-1">
                        {['#10b981', '#ef4444', '#a855f7', '#fbbf24', '#06b6d4', '#f472b6', '#ffffff', '#000000'].map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => {
                              const next = { ...customConfig, color };
                              setCustomConfig(next);
                              setPreviewBorderId(`custom:${JSON.stringify(next)}`);
                            }}
                            style={{ backgroundColor: color }}
                            className={`w-5 h-5 rounded-full border transition-all ${
                              customConfig.color === color ? 'ring-2 ring-white scale-110' : 'border-zinc-800 opacity-80 hover:opacity-100'
                            }`}
                            title={color}
                          />
                        ))}
                      </div>
                      <input
                        type="color"
                        value={customConfig.color}
                        onChange={(e) => {
                          const next = { ...customConfig, color: e.target.value };
                          setCustomConfig(next);
                          setPreviewBorderId(`custom:${JSON.stringify(next)}`);
                        }}
                        className="w-7 h-7 bg-transparent border-0 cursor-pointer rounded shrink-0 p-0"
                        title="Choose Custom Color"
                      />
                    </div>
                  </div>

                  {/* Glow Color presets and intensity sliders */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[10px] text-[#888] uppercase tracking-widest font-black">
                      <span>Glow Strength</span>
                      <span className="text-zinc-450 font-mono text-[9px]">{customConfig.glowIntensity}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={customConfig.glowIntensity}
                      onChange={(e) => {
                        const next = { ...customConfig, glowIntensity: parseInt(e.target.value) };
                        setCustomConfig(next);
                        setPreviewBorderId(`custom:${JSON.stringify(next)}`);
                      }}
                      className="w-full accent-emerald-500 cursor-pointer h-1 bg-zinc-800 rounded"
                    />

                    {customConfig.glowIntensity > 0 && (
                      <div className="flex items-center gap-2 mt-1 animate-in fade-in slide-in-from-top-1">
                        <div className="flex flex-wrap gap-1.5 flex-1">
                          {['#10b981', '#ef4444', '#a855f7', '#fbbf24', '#06b6d4', '#f472b6', '#ffffff'].map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => {
                                const next = { ...customConfig, glowColor: color };
                                setCustomConfig(next);
                                setPreviewBorderId(`custom:${JSON.stringify(next)}`);
                              }}
                              style={{ backgroundColor: color }}
                              className={`w-5 h-5 rounded-full border transition-all ${
                                customConfig.glowColor === color ? 'ring-2 ring-white scale-110' : 'border-zinc-800 opacity-85 hover:opacity-100'
                              }`}
                            />
                          ))}
                        </div>
                        <input
                          type="color"
                          value={customConfig.glowColor}
                          onChange={(e) => {
                            const next = { ...customConfig, glowColor: e.target.value };
                            setCustomConfig(next);
                            setPreviewBorderId(`custom:${JSON.stringify(next)}`);
                          }}
                          className="w-7 h-7 bg-transparent border-0 cursor-pointer rounded shrink-0 p-0"
                          title="Choose Custom Glow"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

function ProfileBorderFormOld({ profile, onClose, onSave, bioData }: any) {
  const [screen, setScreen] = useState<'preview' | 'grid' | 'custom_creator'>('preview');
  
  const [index, setIndex] = useState(() => {
    const currentId = bioData.profile_border || 'none';
    const foundIdx = PROFILE_BORDERS.findIndex(b => b.id === currentId);
    return foundIdx >= 0 ? foundIdx : 0;
  });

  // State for Custom Border Designer
  const [customConfig, setCustomConfig] = useState(() => {
    const currentId = bioData.profile_border || '';
    if (currentId.startsWith('custom:')) {
      try {
        return JSON.parse(currentId.slice(7));
      } catch (err) {}
    }
    return {
      name: 'My Masterpiece',
      color: '#10b981',
      style: 'solid' as const,
      width: 3,
      glowColor: '#10b981',
      glowIntensity: 15
    };
  });

  const currentBorder = PROFILE_BORDERS[index];

  const handlePrev = () => {
    setIndex(prev => (prev - 1 + PROFILE_BORDERS.length) % PROFILE_BORDERS.length);
  };

  const handleNext = () => {
    setIndex(prev => (prev + 1) % PROFILE_BORDERS.length);
  };

  const handleSavePreset = () => {
    onSave({ profile_border: currentBorder.id });
  };

  const handleSaveCustom = () => {
    const customStr = `custom:${JSON.stringify(customConfig)}`;
    onSave({ profile_border: customStr });
  };

  // Resolve custom border for real-time preview in form
  const customResolvedBorder = {
    id: 'custom-preview',
    name: customConfig.name,
    className: 'border-transparent',
    cardStyle: {
      border: `${customConfig.width}px ${customConfig.style} ${customConfig.color}`,
      boxShadow: customConfig.glowColor && customConfig.glowIntensity > 0
        ? `0 0 ${customConfig.glowIntensity}px ${customConfig.glowColor}, inset 0 0 ${Math.ceil(customConfig.glowIntensity / 2)}px ${customConfig.glowColor}`
        : 'none',
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto select-none">
      <div className="w-full max-w-xl rounded-2xl bg-[#09090b] border border-zinc-800 p-6 flex flex-col gap-6 relative shadow-[0_0_50px_rgba(0,0,0,0.9)] max-h-[92vh] overflow-y-auto custom-scrollbar">
        
        {/* Dynamic header depending on the active screen tab */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <span className="text-white font-extrabold text-sm tracking-widest uppercase flex items-center gap-1.5">
              {screen === 'preview' && '🎨 Preview Border'}
              {screen === 'grid' && '㗊 Profile Borders'}
              {screen === 'custom_creator' && '🛠️ Border Architect'}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-emerald-950/40 border border-emerald-800/40 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
            <span>✨</span>
            <span>Unlocked</span>
          </div>
        </div>

        {/* SCREEN 1: PREVIEW MODE (SLIDER / PREVIEW FLIPPER) */}
        {screen === 'preview' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* Style name badge */}
            <div className="text-center">
              <span className="text-[9px] uppercase tracking-[0.25em] font-black text-zinc-500">STYLE {index + 1} OF {PROFILE_BORDERS.length}</span>
              <h4 className="text-sm font-bold text-emerald-400 mt-0.5">{currentBorder.name}</h4>
            </div>

            {/* Live Card Preview */}
            <div className="flex justify-center w-full">
              <div 
                style={currentBorder.cardStyle} 
                className={`w-full max-w-[320px] overflow-hidden rounded-2xl bg-[#141416] border shadow-2xl relative select-none shrink-0 transition-all duration-300 ${currentBorder.className || ''}`}
              >
                {/* Banner wrapper */}
                <div className="h-16 w-full relative shrink-0">
                  <img src={profile.banner_url || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop'} alt="Banner" className="h-full w-full object-cover opacity-80" />
                </div>

                {/* Card Background image content overlay */}
                <div 
                  style={bioData.profile_card_bg ? {
                    backgroundImage: `url(${bioData.profile_card_bg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  } : undefined}
                  className="px-3 pb-3 pt-1 relative"
                >
                  {bioData.profile_card_bg && (
                    <div className="absolute inset-0 bg-zinc-950/85 backdrop-blur-[1px] z-0" />
                  )}

                  <div className="relative z-10 flex flex-col items-center">
                    {/* Standard circle-cropped avatar representation */}
                    <div className="mt-[-28px] border-4 border-[#141416] rounded-full h-14 w-14 bg-zinc-800 relative z-20 shrink-0 overflow-hidden">
                      <img src={profile.avatar_url} alt="Avatar" className="h-full w-full rounded-full object-cover" />
                    </div>

                    {/* Meta tags and username */}
                    <div className="text-center mt-1.5 w-full">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">💎 VIP</span>
                      </div>
                      <h3 className="text-sm font-extrabold text-white leading-tight mt-1">{profile.username}</h3>
                      <span className="text-[8px] font-bold text-red-500 tracking-widest uppercase block mt-0.5 animate-pulse">Live Preview</span>
                    </div>

                    {/* Table stats */}
                    <div className="w-full bg-zinc-950/50 border border-zinc-900 rounded-lg p-2 mt-2.5 flex flex-col gap-1 text-[9px]">
                      <div className="flex justify-between items-center text-zinc-500 border-b border-zinc-900/60 pb-1">
                        <span>🌐 Country</span>
                        <span className="text-zinc-300 font-bold">United States</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-500 border-b border-zinc-900/60 pb-1">
                        <span>🧬 Gender</span>
                        <span className="text-zinc-300 font-bold">{profile.gender || 'Not Specified'}</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-500 pb-0.5">
                        <span>🍰 Language</span>
                        <span className="text-zinc-300 font-bold">English</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Selector arrow row and grid triggers */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3 shrink-0">
                <button 
                  type="button" 
                  onClick={handlePrev}
                  className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-805/80 hover:bg-zinc-805 flex items-center justify-center text-white active:scale-95 transition-all outline-none"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button 
                  type="button" 
                  onClick={() => setScreen('grid')}
                  className="flex-1 h-11 rounded-xl bg-[#141416] border border-zinc-800 hover:bg-zinc-800 hover:text-white flex items-center justify-center gap-1.5 text-zinc-300 text-[11px] font-black tracking-wider uppercase active:scale-95 transition-all outline-none"
                >
                  <Grid className="w-4 h-4 text-emerald-400" />
                  <span>View Grid View</span>
                </button>

                <button 
                  type="button" 
                  onClick={handleNext}
                  className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-805/80 hover:bg-zinc-850 flex items-center justify-center text-white active:scale-95 transition-all outline-none"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Quick toggle to custom design-maker directly */}
              <button
                type="button"
                onClick={() => setScreen('custom_creator')}
                className="w-full py-2.5 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 text-zinc-400 hover:bg-zinc-900 hover:text-white text-[10px] uppercase tracking-wider font-extrabold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>🛠️ Code / Design Custom Border</span>
              </button>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-2.5 pt-3.5 border-t border-zinc-900">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-[11px] font-bold text-zinc-500 hover:text-white text-center tracking-wide uppercase transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSavePreset}
                className="flex-1 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] tracking-wider uppercase shadow-lg shadow-emerald-950/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-emerald-500"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Border</span>
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 2: ALL 50+ BORDERS VISUAL GRID SELECTOR (MATCHING MOCKUP LAYOUT!) */}
        {screen === 'grid' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            {/* Custom Grid title with Back Button representing visual mockup exactly */}
            <button
              onClick={() => setScreen('preview')}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors border border-zinc-800"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Preview Card</span>
            </button>

            {/* 6-Columns exact visual styling matches screenshot */}
            <div className="grid grid-cols-6 gap-2 max-h-[380px] overflow-y-auto pr-1 select-none custom-scrollbar pb-1">
              
              {/* None template box */}
              <button
                type="button"
                onClick={() => setIndex(0)}
                className={`w-full aspect-square text-xs font-black rounded-lg flex items-center justify-center transition-all ${
                  index === 0 
                    ? 'bg-emerald-500/10 border-2 border-emerald-500 shadow-lg text-emerald-400' 
                    : 'bg-[#141416] border border-zinc-800 text-zinc-500 hover:border-zinc-650 hover:bg-zinc-850'
                }`}
                title="No Border"
              >
                ⦸
              </button>

              {/* Static 1 to 52 elements fully styled with their actual card borders! */}
              {PROFILE_BORDERS.slice(1).map((border, bIdx) => {
                const borderActualIdx = bIdx + 1; // Align to absolute index
                const isSelected = index === borderActualIdx;
                
                return (
                  <button
                    key={border.id}
                    type="button"
                    onClick={() => setIndex(borderActualIdx)}
                    style={border.cardStyle}
                    className={`w-full aspect-square text-[10px] font-black rounded-lg flex items-center justify-center transition-all relative ${
                      isSelected 
                        ? 'ring-2 ring-emerald-500 scale-105 z-10' 
                        : 'hover:scale-105 hover:bg-zinc-800'
                    }`}
                    title={border.name}
                  >
                    {/* Shadow masking background in grid so the number remains neatly visible */}
                    <span className="absolute inset-0.5 bg-[#09090b]/80 rounded-sm z-0 flex items-center justify-center font-mono font-extrabold text-white text-[11px]">
                      {borderActualIdx}
                    </span>
                  </button>
                );
              })}

              {/* Special creator quick element to build custom styles */}
              <button
                type="button"
                onClick={() => setScreen('custom_creator')}
                className="w-full aspect-square text-[9px] font-bold rounded-lg flex flex-col items-center justify-center bg-zinc-900 border-2 border-dashed border-zinc-700 text-zinc-400 hover:text-white hover:border-emerald-500 transition-all gap-0.5"
                title="Create custom border"
              >
                <span>🛠️</span>
                <span className="text-[8px] transform uppercase tracking-tighter">Draft</span>
              </button>
            </div>

            <div className="pt-2 text-center select-none">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed">
                Click any number to preview instantly. <br/>
                Selected: <span className="text-emerald-400 font-bold">{currentBorder.name}</span>
              </p>
            </div>

            {/* Quick action bar */}
            <div className="flex items-center gap-2 pt-3 border-t border-zinc-900">
              <button 
                type="button"
                onClick={() => setScreen('preview')}
                className="flex-1 py-2 rounded-xl bg-[#141416] border border-zinc-800 text-zinc-400 text-xs font-bold leading-none hover:text-white transition-all uppercase tracking-wider"
              >
                Preview Card
              </button>
              <button 
                type="button"
                onClick={handleSavePreset}
                className="flex-1 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                Apply Selected
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 3: STATE-OF-THE-ART VALUE-TUNED CUSTOM BORDER BUILDER */}
        {screen === 'custom_creator' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            
            {/* Live custom creator real-time interactive preview frame */}
            <div className="flex justify-center w-full">
              <div 
                style={customResolvedBorder.cardStyle} 
                className="w-full max-w-[280px] overflow-hidden rounded-2xl bg-[#141416] border shadow-2xl relative select-none shrink-0 transition-all duration-150"
              >
                <div className="h-10 w-full relative shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 to-blue-950 opacity-60" />
                </div>
                <div className="px-3 pb-3 pt-0.5 relative">
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="mt-[-20px] border-3 border-[#141416] rounded-full h-11 w-11 bg-zinc-850 shrink-0 overflow-hidden">
                      <img src={profile.avatar_url} alt="Avatar" className="h-full w-full rounded-full object-cover" />
                    </div>
                    <div className="text-center w-full mt-1.5">
                      <h3 className="text-xs font-black text-white leading-tight">{customConfig.name || 'Masterpiece'}</h3>
                      <span className="text-[7px] text-zinc-500 uppercase tracking-widest font-extrabold mt-0.5 block">Constructing Style</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive design parameters panel */}
            <div className="flex flex-col gap-3.5 bg-zinc-950/60 p-4 border border-zinc-900 rounded-xl max-h-[280px] overflow-y-auto custom-scrollbar">
              
              {/* Border Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Border Name</label>
                <input
                  type="text"
                  maxLength={24}
                  value={customConfig.name}
                  onChange={(e) => setCustomConfig({ ...customConfig, name: e.target.value })}
                  placeholder="e.g. Gamer Legend"
                  className="w-full bg-[#141416] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-650 focus:outline-none focus:border-zinc-700"
                />
              </div>

              {/* Stroke Width Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase tracking-widest font-black">
                  <span>Border Thickness</span>
                  <span className="text-emerald-400 font-mono font-bold">{customConfig.width}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={customConfig.width}
                  onChange={(e) => setCustomConfig({ ...customConfig, width: parseInt(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer h-1 bg-zinc-800 rounded"
                />
              </div>

              {/* Stroke Pattern selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Stroke Style</label>
                <div className="grid grid-cols-3 gap-1.5 text-[9px] font-bold text-zinc-400 uppercase tracking-tight">
                  {(['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge'] as const).map((pattern) => (
                    <button
                      key={pattern}
                      type="button"
                      onClick={() => setCustomConfig({ ...customConfig, style: pattern })}
                      className={`py-1 rounded border text-center transition-all truncate ${
                        customConfig.style === pattern 
                          ? 'border-emerald-500 bg-emerald-500/10 text-white font-extrabold' 
                          : 'border-zinc-800 bg-[#141416] hover:bg-zinc-850'
                      }`}
                    >
                      {pattern}
                    </button>
                  ))}
                </div>
              </div>

              {/* Outline Color presets and picker */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase tracking-widest font-black">
                  <span>Outline Tint</span>
                  <span className="text-zinc-400 font-mono text-[9px]">{customConfig.color}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {['#10b981', '#ef4444', '#a855f7', '#fbbf24', '#06b6d4', '#f472b6', '#ffffff', '#000000'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setCustomConfig({ ...customConfig, color })}
                        style={{ backgroundColor: color }}
                        className={`w-5 h-5 rounded-full border transition-all ${
                          customConfig.color === color ? 'ring-2 ring-white scale-110' : 'border-zinc-800 opacity-80 hover:opacity-100'
                        }`}
                        title={color}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={customConfig.color}
                    onChange={(e) => setCustomConfig({ ...customConfig, color: e.target.value })}
                    className="w-7 h-7 bg-transparent border-0 cursor-pointer rounded shrink-0 p-0"
                    title="Choose Custom Color"
                  />
                </div>
              </div>

              {/* Glow Color presets and intensity sliders */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase tracking-widest font-black">
                  <span>Glow Strength</span>
                  <span className="text-zinc-400 font-mono text-[9px]">{customConfig.glowIntensity}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={customConfig.glowIntensity}
                  onChange={(e) => setCustomConfig({ ...customConfig, glowIntensity: parseInt(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer h-1 bg-zinc-800 rounded"
                />

                {customConfig.glowIntensity > 0 && (
                  <div className="flex items-center gap-2 mt-1 animate-in fade-in slide-in-from-top-1">
                    <div className="flex flex-wrap gap-1.5 flex-1">
                      {['#10b981', '#ef4444', '#a855f7', '#fbbf24', '#06b6d4', '#f472b6', '#ffffff'].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setCustomConfig({ ...customConfig, glowColor: color })}
                          style={{ backgroundColor: color }}
                          className={`w-5 h-5 rounded-full border transition-all ${
                            customConfig.glowColor === color ? 'ring-2 ring-white scale-110' : 'border-zinc-800 opacity-80 hover:opacity-100'
                          }`}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={customConfig.glowColor}
                      onChange={(e) => setCustomConfig({ ...customConfig, glowColor: e.target.value })}
                      className="w-7 h-7 bg-transparent border-0 cursor-pointer rounded shrink-0 p-0"
                      title="Choose Custom Glow"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Back options and save details */}
            <div className="flex items-center gap-2.5 pt-3.5 border-t border-zinc-900">
              <button 
                type="button"
                onClick={() => setScreen('grid')}
                className="flex-1 py-2.5 text-[11px] font-bold text-zinc-500 hover:text-white text-center tracking-wide uppercase transition-colors"
              >
                Back to Grid
              </button>
              <button 
                type="button"
                onClick={handleSaveCustom}
                className="flex-1 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] tracking-wider uppercase shadow-lg shadow-emerald-950/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-emerald-500"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Design</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Super simple wrapper for sub-modals
function EditModal({ title, onClose, onSave, children }: any) {
  const [data, setData] = useState({});
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`w-full ${title === 'Edit Bio' ? 'max-w-2xl md:max-w-3xl' : 'max-w-md md:max-w-lg'} rounded-xl bg-zinc-900 border border-zinc-700 p-6 transition-all`}>
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        {children({ data, setData })}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
          <button onClick={() => onSave(data)} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-md hover:bg-zinc-200">Save</button>
        </div>
      </div>
    </div>
  );
}

const genders = [
  'Male', 'Female', 'Other', 'Walmart Bag', 'Attack Helicopter', 
  'Two and a Half Men', 'A Toaster', '404 Not Found', 'Jedi', 'Sith', 
  'Three Raccoons in a Trenchcoat', 'Garlic Bread', 'Error 500', 
  'Default Human', 'Loading...', 'The Color Blue', 'Redacted'
];

function InfoEditForm({ profile, data, setData }: any) {
  useEffect(() => { setData({ age: profile.age, gender: profile.gender }) }, []);
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Age</label>
        <input type="number" value={data.age || profile.age} onChange={e => setData({...data, age: parseInt(e.target.value)})} className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white" />
      </div>
      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Gender</label>
        <select value={data.gender || profile.gender} onChange={e => setData({...data, gender: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white">
          {genders.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>
    </div>
  )
}

function PreferencesEditForm({ bioData, data, setData }: { bioData: BioData, data: any, setData: any }) {
  useEffect(() => {
    setData({
      hide_age_gender: bioData.hide_age_gender ?? false,
      hide_bio: bioData.hide_bio ?? false,
      sound_disabled: bioData.sound_disabled ?? false,
      hide_friends_on_profile: bioData.hide_friends_on_profile ?? false,
      hide_me_from_friends: bioData.hide_me_from_friends ?? false,
    });
  }, []);

  return (
    <div className="space-y-5 py-2 text-left">
      <div className="flex items-center justify-between p-3 bg-zinc-950/60 border border-zinc-800 rounded-xl gap-4">
        <div className="flex-1">
          <label className="text-sm font-semibold text-zinc-100 block">Hide Age & Gender</label>
          <span className="text-xs text-zinc-400 block mt-0.5">Other users won't be able to see your age and gender on your profile cards.</span>
        </div>
        <button
          type="button"
          onClick={() => setData({ ...data, hide_age_gender: !data.hide_age_gender })}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${data.hide_age_gender ? 'bg-emerald-500' : 'bg-zinc-700'}`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${data.hide_age_gender ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between p-3 bg-zinc-950/60 border border-zinc-800 rounded-xl gap-4">
        <div className="flex-1">
          <label className="text-sm font-semibold text-zinc-100 block">Hide Bio</label>
          <span className="text-xs text-zinc-400 block mt-0.5">Other users won't be able to read your "About Me" biography.</span>
        </div>
        <button
          type="button"
          onClick={() => setData({ ...data, hide_bio: !data.hide_bio })}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${data.hide_bio ? 'bg-emerald-500' : 'bg-zinc-700'}`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${data.hide_bio ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between p-3 bg-zinc-950/60 border border-zinc-800 rounded-xl gap-4">
        <div className="flex-1">
          <label className="text-sm font-semibold text-zinc-100 block">Hide Friends Tab</label>
          <span className="text-xs text-zinc-400 block mt-0.5">Other users won't be able to see the friends list on your profile card.</span>
        </div>
        <button
          type="button"
          onClick={() => setData({ ...data, hide_friends_on_profile: !data.hide_friends_on_profile })}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${data.hide_friends_on_profile ? 'bg-emerald-500' : 'bg-zinc-700'}`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${data.hide_friends_on_profile ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between p-3 bg-zinc-950/60 border border-zinc-800 rounded-xl gap-4">
        <div className="flex-1">
          <label className="text-sm font-semibold text-zinc-100 block">Hide Me From Friend Lists</label>
          <span className="text-xs text-zinc-400 block mt-0.5">Don't list your name in other users' friends tabs.</span>
        </div>
        <button
          type="button"
          onClick={() => setData({ ...data, hide_me_from_friends: !data.hide_me_from_friends })}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${data.hide_me_from_friends ? 'bg-emerald-500' : 'bg-zinc-700'}`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${data.hide_me_from_friends ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between p-3 bg-zinc-950/60 border border-zinc-800 rounded-xl gap-4">
        <div className="flex-1">
          <label className="text-sm font-semibold text-zinc-100 block">Mute All Sounds</label>
          <span className="text-xs text-zinc-400 block mt-0.5">Turn off all notification and incoming chat sound effects for you.</span>
        </div>
        <button
          type="button"
          onClick={() => setData({ ...data, sound_disabled: !data.sound_disabled })}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${data.sound_disabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${data.sound_disabled ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>
      </div>
    </div>
  );
}

function UsercardsEditForm({ bioData, data, setData, profile }: { bioData: BioData, data: any, setData: any, profile: Profile }) {
  const currentSelected = data.usercard_bg || bioData.usercard_bg || 'none';

  useEffect(() => {
    setData({
      usercard_bg: bioData.usercard_bg || 'none'
    });
  }, []);

  const selectedStyleObj = USERCARD_STYLES.find(s => s.id === currentSelected) || USERCARD_STYLES[0];

  return (
    <div className="space-y-6 text-left py-2">
      {/* Live Card Preview */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-3">Live Card Preview</span>
        <div className="flex justify-center p-6 bg-zinc-950/40 border border-zinc-800 rounded-xl relative overflow-hidden">
          <div className="w-full max-w-[240px]">
            <div
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 border transition-all duration-150 ${
                currentSelected === 'none' 
                  ? 'bg-[#1e1e22] border-zinc-800/50' 
                  : `${selectedStyleObj.className || 'border-zinc-800/50'}`
              }`}
              style={currentSelected === 'none' ? undefined : selectedStyleObj.style}
            >
              <div className="relative shrink-0">
                <img 
                  src={profile.avatar_url} 
                  alt="Avatar" 
                  className="h-[34px] w-[34px] rounded-full object-cover border border-zinc-800" 
                />
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#1e1e22] bg-emerald-500"></div>
              </div>
              <div className="flex flex-col items-start overflow-hidden w-full">
                <div className="flex items-center gap-1.5 max-w-full">
                  <span 
                    className={`truncate text-[14px] font-bold ${selectedStyleObj.textClassName || 'text-zinc-200'}`} 
                    style={selectedStyleObj.textStyle}
                  >
                    {profile.username}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Styles */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Select Usercard Theme ({USERCARD_STYLES.length})</span>
          <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">CSS Backgrounds</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar text-xs">
          {USERCARD_STYLES.map(style => {
            const isSelected = style.id === currentSelected;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => setData({ ...data, usercard_bg: style.id })}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 border text-left transition-all relative group h-14 ${
                  isSelected 
                    ? 'ring-2 ring-emerald-500 border-transparent scale-[0.98]' 
                    : 'border-zinc-800 hover:border-zinc-700 hover:scale-[1.01]'
                }`}
                style={style.id === 'none' ? { backgroundColor: '#18181b' } : style.style}
              >
                <div className="flex flex-col overflow-hidden w-full">
                  <span 
                    className={`truncate font-bold text-xs ${style.textClassName || 'text-zinc-300'}`}
                    style={style.textStyle}
                  >
                    {style.name}
                  </span>
                  <span className="text-[10px] text-zinc-500 truncate group-hover:text-zinc-400 mt-0.5">Style ID: #{style.id}</span>
                </div>

                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] flex items-center justify-center">
                    <span className="text-white text-[6px] font-bold">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function UsernameEditForm({ profile, data, setData }: any) {
  useEffect(() => { setData({ username: profile.username }) }, []);
  return (
    <div>
      <label className="text-xs text-zinc-400 mb-1 block">Username</label>
      <input type="text" value={data.username || ''} onChange={e => setData({...data, username: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white" />
      <p className="text-xs text-zinc-500 mt-2">Note: Changing this will affect your login credentials.</p>
    </div>
  )
}

function BioEditForm({ profile, data, setData }: any) {
  const [uploading, setUploading] = useState(false);
  const [fontUploading, setFontUploading] = useState(false);
  const [selectedFont, setSelectedFont] = useState('');
  const [selectedEffect, setSelectedEffect] = useState('');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { 
    const bioData = parseBio(profile.bio);
    setData({ bio: bioData.text, custom_fonts: bioData.custom_fonts || {} });
    if (bioData.custom_fonts) {
      injectCustomFonts(bioData.custom_fonts);
    }
  }, []);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = data.bio ?? '';
    
    const selectedText = currentText.substring(start, end);
    const newText = currentText.substring(0, start) + before + selectedText + after + currentText.substring(end);
    
    setData({ ...data, bio: newText });
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length + (selectedText ? before.length + after.length : 0));
    }, 0);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `bio_${Math.random()}.${fileExt}`;
    const filePath = `${profile.id}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      insertText(`![image](${publicUrl})`, '');
    }
    setUploading(false);
  };

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.ttf')) {
      alert("Only TrueType Font (.ttf) files are supported.");
      return;
    }

    setFontUploading(true);
    try {
      const fileExt = 'ttf';
      const cleanBase = file.name.substring(0, file.name.lastIndexOf('.')).replace(/[^a-zA-Z0-9]/g, '');
      const uniqueFontName = `Font_${cleanBase}_${Math.floor(Math.random() * 1000)}`;
      const fileName = `${uniqueFontName}.${fileExt}`;
      const filePath = `${profile.id}/fonts/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) {
        alert("Font upload failed: " + uploadError.message);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const styleId = `custom-font-${uniqueFontName.toLowerCase()}`;
      if (!document.getElementById(styleId)) {
        const styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.innerHTML = `
          @font-face {
            font-family: '${uniqueFontName}';
            src: url('${publicUrl}') format('truetype');
            font-display: swap;
          }
        `;
        document.head.appendChild(styleEl);
      }

      const updatedFonts = { ...(data.custom_fonts || {}), [uniqueFontName]: publicUrl };
      setData({
        ...data,
        custom_fonts: updatedFonts
      });
      
      setSelectedFont(uniqueFontName);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setFontUploading(false);
    }
  };

  const addImageLink = () => {
    const url = prompt("Enter Image URL (ends with .png, .jpg, etc.):");
    if (url) {
      if (IMAGE_EXT_REGEX.test(url)) {
        insertText(`![image](${url})`, '');
      } else {
        alert("Only direct image links (ending in .png, .jpg, etc.) are allowed.");
      }
    }
  }

  const applyCustomFormatting = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = data.bio ?? '';
    const selectedText = currentText.substring(start, end);

    if (start === end) {
      alert("Please highlight/select a word or sentence in the textarea below first!");
      return;
    }

    let beforeTag = '[style';
    if (selectedFont) {
      beforeTag += ` font="${selectedFont}"`;
    }
    if (selectedEffect) {
      beforeTag += ` effect="${selectedEffect}"`;
    }
    if (selectedColor && selectedColor !== '#ffffff') {
      beforeTag += ` color="${selectedColor}"`;
    }
    beforeTag += ']';
    const afterTag = '[/style]';

    insertText(beforeTag, afterTag);
  };

  const customFontKeys = Object.keys(data.custom_fonts || {});

  return (
    <div className="flex flex-col gap-2">
      {/* Font & Effect Customizer Panel */}
      <div className="bg-[#141416] border border-zinc-800 rounded-xl p-4 my-2 flex flex-col gap-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
          <span>✨ Custom Font & Effect Stylist</span>
          <span className="text-[10px] text-zinc-500 font-normal lowercase italic">Highlight text first</span>
        </h4>

        {/* Font Select and Upload */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
          <div>
            <label className="text-[11px] text-zinc-400 font-medium mb-1 block">Choose Font</label>
            <select 
              value={selectedFont} 
              onChange={e => {
                const fontName = e.target.value;
                setSelectedFont(fontName);
                if (GOOGLE_FONTS_PRESETS.includes(fontName)) {
                  ensureFontLoaded(fontName);
                }
              }} 
              className="w-full bg-[#1e1e22] text-xs border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="">Default Font</option>
              {customFontKeys.length > 0 && (
                <optgroup label="Uploaded Fonts">
                  {customFontKeys.map(fk => (
                    <option key={fk} value={fk}>{fk}</option>
                  ))}
                </optgroup>
              )}
              <optgroup label="Default Google Fonts">
                {GOOGLE_FONTS_PRESETS.map(fp => (
                  <option key={fp} value={fp}>{fp}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="flex gap-2">
            <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#1e1e22] hover:bg-[#25252a] border border-zinc-800 hover:border-emerald-500/50 text-[11px] font-medium text-zinc-200 rounded-lg cursor-pointer transition-all select-none h-[32px]">
              {fontUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Upload .ttf Font</span>
                </>
              )}
              <input type="file" className="hidden" accept=".ttf" onChange={handleFontUpload} disabled={fontUploading} />
            </label>
          </div>
        </div>

        {/* Effect Select & Color Select */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <div>
            <label className="text-[11px] text-zinc-400 font-medium mb-1 block">Choose Effect & Animation</label>
            <select 
              value={selectedEffect} 
              onChange={e => setSelectedEffect(e.target.value)} 
              className="w-full bg-[#1e1e22] text-xs border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="">No Animation Effect</option>
              <option value="rainbow">🌈 Rainbow Glow spectrum</option>
              <option value="glow">🟢 Pulsing Neon Glow</option>
              <option value="spin">🌀 Gentle Spin 3D</option>
              <option value="bounce">🦘 Happy jumping bounce</option>
              <option value="glitch">👾 Cyber Glitch analog</option>
              <option value="shake">⚡ Hyper Jittery Shake</option>
              <option value="flicker">💡 Flickering Neon Sign</option>
              <option value="skew">〰️ Smooth Yaw Wobble</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 font-medium mb-1 block">Text Color</label>
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                value={selectedColor} 
                onChange={e => setSelectedColor(e.target.value)}
                className="w-8 h-8 rounded-md border border-zinc-800 bg-[#1e1e22] cursor-pointer"
              />
              <span className="text-xs text-zinc-400 uppercase font-mono">{selectedColor}</span>
              <button 
                type="button" 
                onClick={() => setSelectedColor('#ffffff')} 
                className="text-[10px] text-zinc-500 hover:text-white underline cursor-pointer"
              >
                Reset to White
              </button>
            </div>
          </div>
        </div>

        {/* Style Preview Area */}
        <div className="border border-zinc-800/60 bg-zinc-950/50 rounded-lg p-2.5 flex flex-col items-center justify-center overflow-hidden min-h-[50px] relative">
          <span 
            style={{ 
              fontFamily: selectedFont ? `'${selectedFont}', sans-serif` : 'inherit',
              color: selectedColor 
            }}
            className={`${selectedEffect ? `font-effect-${selectedEffect}` : ''} text-sm font-bold tracking-wide transition-all`}
          >
            Style Preview Text
          </span>
        </div>

        {/* Action Button */}
        <button 
          type="button" 
          onClick={applyCustomFormatting}
          className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
        >
          <span>✨ Apply Customized Style to Selected Text</span>
        </button>
      </div>

      <div className="flex items-center justify-between pb-1 flex-wrap gap-2 mt-2">
         <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Edit Bio Text</label>
         <div className="flex bg-[#141416] rounded-lg p-1 gap-0.5 border border-zinc-800 flex-wrap">
           <button title="Bold" type="button" onClick={() => insertText('**', '**')} className="w-7 h-7 flex items-center justify-center hover:bg-zinc-800 rounded font-bold text-zinc-300">B</button>
           <button title="Italic" type="button" onClick={() => insertText('_', '_')} className="w-7 h-7 flex items-center justify-center hover:bg-zinc-800 rounded italic text-zinc-300 font-serif">I</button>
           <button title="Divider" type="button" onClick={() => insertText('\n---\n', '')} className="w-7 h-7 flex items-center justify-center hover:bg-zinc-800 rounded text-zinc-300">
             <Minus className="w-4 h-4" />
           </button>
           <div className="w-px bg-zinc-800 mx-0.5 h-4 my-auto"></div>
           <button title="Bullet List" type="button" onClick={() => insertText('- ', '')} className="w-7 h-7 flex items-center justify-center hover:bg-zinc-800 rounded text-zinc-300">
             <List className="w-4 h-4" />
           </button>
           <button title="Numbered List" type="button" onClick={() => insertText('1. ', '')} className="w-7 h-7 flex items-center justify-center hover:bg-zinc-800 rounded text-zinc-300">
             <ListOrdered className="w-4 h-4" />
           </button>
           <button title="Quote" type="button" onClick={() => insertText('> ', '')} className="w-7 h-7 flex items-center justify-center hover:bg-zinc-800 rounded text-zinc-300">
             <Quote className="w-4 h-4" />
           </button>
           <div className="w-px bg-zinc-800 mx-0.5 h-4 my-auto"></div>
           <button title="Link" type="button" onClick={() => { 
             const url = prompt("Enter URL:"); 
             if(url) {
               if (isSafeUrl(url)) {
                 insertText(`[link text](${url})`); 
               } else {
                 alert("Blocked: Domain not allowed.");
               }
             }
           }} className="w-7 h-7 flex items-center justify-center hover:bg-zinc-800 rounded text-zinc-300">
             <LinkIcon className="w-4 h-4" />
           </button>
           <div className="w-px bg-zinc-800 mx-0.5 h-4 my-auto"></div>
           <button title="Image URL" type="button" onClick={addImageLink} className="w-7 h-7 flex items-center justify-center hover:bg-zinc-800 rounded text-zinc-300">
             <ImageIcon className="w-4 h-4" />
           </button>
           <label title="Upload Image" className="w-7 h-7 flex items-center justify-center hover:bg-zinc-800 rounded text-emerald-400 cursor-pointer">
             {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
             <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
           </label>
         </div>
      </div>
      <textarea ref={textareaRef} rows={8} value={data.bio ?? ''} onChange={e => setData({...data, bio: e.target.value})} className="w-full bg-[#1e1e22] border border-zinc-800 rounded-md px-3 py-2 text-white resize-none font-mono text-sm leading-relaxed custom-scrollbar focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none" placeholder="Highlight some text above to apply customized style tags..." />
    </div>
  )
}

function MoodEditForm({ profile, data, setData }: any) {
  useEffect(() => { 
    const bioData = parseBio(profile.bio);
    setData({ mood: bioData.mood });
  }, []);
  return (
    <div>
      <label className="text-xs text-zinc-400 mb-1 block">Mood</label>
      <input type="text" maxLength={45} value={data.mood ?? ''} placeholder="e.g. feeling great today!" onChange={e => setData({...data, mood: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white" />
    </div>
  )
}

function MusicEditForm({ profile, data, setData }: any) {
  const [type, setType] = useState<'mp3' | 'youtube'>('mp3');
  const [source, setSource] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const bioData = parseBio(profile.bio);
    setType(bioData.profile_music_type || 'mp3');
    setSource(bioData.profile_music_source || '');
    setData({
      profile_music_type: bioData.profile_music_type || 'mp3',
      profile_music_source: bioData.profile_music_source || ''
    });
  }, []);

  const handleTypeChange = (newType: 'mp3' | 'youtube') => {
    setType(newType);
    setSource('');
    setData({
      profile_music_type: newType,
      profile_music_source: ''
    });
  };

  const handleSourceChange = (val: string) => {
    setSource(val);
    setData({
      profile_music_type: type,
      profile_music_source: val
    });
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.mp3')) {
      toast.error("Please upload a file that ends with .mp3");
      return;
    }

    setUploading(true);
    const fileName = `${Math.random()}.mp3`;
    const filePath = `${profile.id}/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) {
        const { error: bannerError } = await supabase.storage.from('banners').upload(filePath, file);
        if (bannerError) throw bannerError;
      }
      const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      handleSourceChange(publicData.publicUrl);
      toast.success("MP3 file uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to upload MP3 file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4 text-left">
      <div>
        <label className="text-xs text-zinc-400 mb-1.5 block font-bold uppercase tracking-wider">Music Type Selection</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleTypeChange('mp3')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${type === 'mp3' ? 'bg-emerald-600/25 border-emerald-500 text-emerald-400' : 'bg-zinc-805 bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'}`}
          >
            MP3 (Direct URL / Upload)
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('youtube')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${type === 'youtube' ? 'bg-emerald-600/25 border-emerald-500 text-emerald-400' : 'bg-zinc-805 bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'}`}
          >
            YouTube Video URL
          </button>
        </div>
      </div>

      {type === 'mp3' ? (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">MP3 Direct URL (ending with .mp3)</label>
            <input
              type="text"
              placeholder="https://example.com/song.mp3"
              value={source}
              onChange={e => handleSourceChange(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-1.5 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-zinc-900 px-2 text-zinc-500 font-bold">OR</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Upload .mp3 file</label>
            <div className="mt-1 flex justify-center px-4 pt-4 pb-4 border border-zinc-800 border-dashed rounded-lg hover:border-zinc-700 transition-colors">
              <div className="space-y-1 text-center">
                <Music className="mx-auto h-6 w-6 text-zinc-500" />
                <div className="text-xs text-zinc-400">
                  <label className="relative cursor-pointer bg-transparent rounded-md font-medium text-emerald-500 hover:text-emerald-400">
                    <span>{uploading ? "Uploading..." : "Click to select MP3 file"}</span>
                    <input
                      type="file"
                      accept=".mp3,audio/mpeg"
                      className="sr-only"
                      onChange={handleAudioUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">YouTube Video/Music URL</label>
          <input
            type="text"
            placeholder="https://www.youtube.com/watch?v=..."
            value={source}
            onChange={e => handleSourceChange(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-1.5 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
          />
          <p className="text-[10px] text-zinc-500 mt-1.5 leading-normal">Allows any YouTube link. Will stop playing immediately when exiting the profile.</p>
        </div>
      )}
    </div>
  );
}

function CardBgEditForm({ profile, data, setData }: any) {
  const [bgUrl, setBgUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const bioData = parseBio(profile.bio);
    setBgUrl(bioData.profile_card_bg || '');
    setData({ profile_card_bg: bioData.profile_card_bg || '' });
  }, []);

  const handleBgChange = (url: string) => {
    setBgUrl(url);
    setData({ profile_card_bg: url });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${profile.id}/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage.from('banners').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage.from('banners').getPublicUrl(filePath);
      handleBgChange(publicData.publicUrl);
      toast.success("Background uploaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload background image.");
    } finally {
      setUploading(false);
    }
  };

  const presets = [
    { name: 'None / Default Background', url: '' },
    { name: 'Deep Space Nebula', url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=600' },
    { name: 'Dark Carbon Fiber', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600' },
    { name: 'Matrix Digital Rain', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600' },
    { name: 'Cyberpunk Grid', url: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?q=80&w=600' },
    { name: 'Abstract Smooth Satin', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600' }
  ];

  return (
    <div className="space-y-4 text-left">
      <div>
        <label className="text-xs text-zinc-400 mb-1.5 block font-bold uppercase tracking-wider">Background image/texture URL</label>
        <input
          type="text"
          placeholder="https://example.com/texture.jpg"
          value={bgUrl}
          onChange={e => handleBgChange(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-1.5 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-zinc-800"></div>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-zinc-900 px-2 text-zinc-500 font-bold">OR</span>
        </div>
      </div>

      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Upload background / texture</label>
        <div className="flex items-center gap-2">
          <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 text-xs rounded-lg border border-zinc-700 font-semibold transition-colors">
            <span>{uploading ? "Uploading..." : "Choose Image"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
          {bgUrl && (
            <button
              onClick={() => handleBgChange('')}
              className="text-[10px] text-red-400 hover:text-red-300 transition-colors font-semibold"
            >
              Clear Current
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="text-xs text-zinc-400 mb-1.5 block font-bold uppercase tracking-wider">Quick Preset Textures</label>
        <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto custom-scrollbar p-1">
          {presets.map(p => (
            <button
              key={p.name}
              type="button"
              onClick={() => handleBgChange(p.url)}
              className={`text-left p-1.5 text-[10px] rounded-lg border transition-all ${bgUrl === p.url ? 'bg-emerald-600/25 border-emerald-500 text-emerald-400 font-bold' : 'bg-zinc-805 bg-zinc-800/50 border-zinc-800/70 text-zinc-400 hover:bg-zinc-805 hover:bg-zinc-800'}`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConvertCoinsGemsModal({ 
  currentUserProfile, 
  onProfileUpdate, 
  onClose 
}: { 
  currentUserProfile: Profile; 
  onProfileUpdate: (p: Profile) => void; 
  onClose: () => void; 
}) {
  const bioData = parseBio(currentUserProfile.bio);
  const currentGold = bioData.coins ?? 1000;
  const currentRubies = bioData.gems ?? 5;

  const [mode, setMode] = useState<'goldToRubies' | 'rubiesToGold'>('goldToRubies');
  const [amountStr, setAmountStr] = useState<string>('');
  const [converting, setConverting] = useState(false);

  // Computed results
  const amount = parseInt(amountStr, 10) || 0;
  const expectedResult = mode === 'goldToRubies' 
    ? Math.floor(amount / 1000) 
    : amount * 1000;

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      toast.error("Please enter a valid amount greater than 0.");
      return;
    }

    if (mode === 'goldToRubies') {
      if (currentGold < amount) {
        toast.error("You do not have enough Gold!");
        return;
      }
      if (amount < 1000) {
        toast.error("Minimum gold conversion is 1000 Gold.");
        return;
      }
      const rubiesToGet = Math.floor(amount / 1000);
      if (rubiesToGet <= 0) {
        toast.error("You need at least 1000 Gold to get 1 Ruby.");
        return;
      }

      setConverting(true);
      const updatedBio = {
        ...bioData,
        coins: currentGold - amount,
        gems: currentRubies + rubiesToGet
      };
      
      const updatedBioStr = stringifyBio(updatedBio);
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ bio: updatedBioStr })
          .eq('id', currentUserProfile.id);

        if (error) throw error;
        
        onProfileUpdate({ ...currentUserProfile, bio: updatedBioStr });
        toast.success(`Exchanged ${amount} Gold for ${rubiesToGet} Ruby!`);
        setAmountStr('');
      } catch (err: any) {
        console.error(err);
        toast.error(`Exchange failed: ${err.message || 'Unknown error'}`);
      } finally {
        setConverting(false);
      }
    } else {
      if (currentRubies < amount) {
        toast.error("You do not have enough Rubies!");
        return;
      }

      setConverting(true);
      const goldToGet = amount * 1000;
      const updatedBio = {
        ...bioData,
        gems: currentRubies - amount,
        coins: currentGold + goldToGet
      };
      
      const updatedBioStr = stringifyBio(updatedBio);
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ bio: updatedBioStr })
          .eq('id', currentUserProfile.id);

        if (error) throw error;
        
        onProfileUpdate({ ...currentUserProfile, bio: updatedBioStr });
        toast.success(`Exchanged ${amount} Ruby for ${goldToGet} Gold!`);
        setAmountStr('');
      } catch (err: any) {
        console.error(err);
        toast.error(`Exchange failed: ${err.message || 'Unknown error'}`);
      } finally {
        setConverting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-[#141416] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-500 animate-pulse" />
            <span className="text-lg font-bold text-white tracking-wide">Treasury Exchange</span>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Balance Status Card */}
        <div className="bg-zinc-950/50 border border-zinc-800/40 rounded-xl p-4 my-4 flex justify-around text-center">
          <div>
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Your Gold</div>
            <div className="flex items-center justify-center gap-1.5 text-lg font-extrabold text-amber-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#FFB800" /><circle cx="12" cy="12" r="8" fill="#FFC700" /><path d="M12 6L13.8 9.6L17.5 10L14.7 12.6L15.5 16.5L12 14.5L8.5 16.5L9.3 12.6L6.5 10L10.2 9.6L12 6Z" fill="#FFD600" /></svg>
              <span>{currentGold}</span>
            </div>
          </div>
          <div className="h-10 w-px bg-zinc-800 self-center"></div>
          <div>
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Your Rubies</div>
            <div className="flex items-center justify-center gap-1.5 text-lg font-extrabold text-pink-500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 9L12 22L22 9L12 2Z" fill="#ff007f" /><path d="M12 2L2 9L12 12V2Z" fill="#ff4da6" /><path d="M22 9L12 2V12L22 9Z" fill="#cc0066" /><path d="M2 9L12 22V12L2 9Z" fill="#e60073" /><path d="M22 9L12 22V12L22 9Z" fill="#99004d" /></svg>
              <span>{currentRubies}</span>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-[#252529]/60 border border-zinc-800 p-1 rounded-lg gap-1.5 mb-4 border-zinc-800/80">
          <button
            type="button"
            onClick={() => { setMode('goldToRubies'); setAmountStr(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
              mode === 'goldToRubies' 
                ? 'bg-amber-500 text-black shadow-md' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Gold → Rubies
          </button>
          <button
            type="button"
            onClick={() => { setMode('rubiesToGold'); setAmountStr(''); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
              mode === 'rubiesToGold' 
                ? 'bg-pink-600 text-white shadow-md' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Rubies → Gold
          </button>
        </div>

        <form onSubmit={handleConvert} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
              Amount to Exchange ({mode === 'goldToRubies' ? 'Gold' : 'Rubies'})
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                placeholder={mode === 'goldToRubies' ? "Min. 1000 Gold" : "Number of Rubies"}
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg py-2.5 pl-3 pr-16 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm font-medium"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">
                {mode === 'goldToRubies' ? 'GOLD' : 'RUBY'}
              </span>
            </div>
          </div>

          {/* Rate & Live Result */}
          <div className="bg-zinc-950/30 border border-zinc-800/30 rounded-lg p-3 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-zinc-500">Conversion Rate:</span>
              <span className="font-semibold text-zinc-300">1000 Gold = 1 Ruby</span>
            </div>
            <div className="flex justify-between border-t border-zinc-800/40 pt-1.5 mt-1.5 text-sm">
              <span className="text-zinc-400 font-medium">You will receive:</span>
              <span className={`font-extrabold ${mode === 'goldToRubies' ? 'text-pink-400' : 'text-amber-400'}`}>
                {mode === 'goldToRubies' 
                  ? `${expectedResult} Ruby` 
                  : `${expectedResult} Gold`}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={converting || amount <= 0 || (mode === 'goldToRubies' && currentGold < amount) || (mode === 'rubiesToGold' && currentRubies < amount)}
            className={`w-full py-2.5 rounded-lg text-sm font-bold shadow-lg transition-all duration-150 ${
              converting
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : mode === 'goldToRubies'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:brightness-110 active:scale-[0.98] disabled:bg-zinc-800/50 disabled:text-zinc-650 disabled:pointer-events-none'
                  : 'bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:brightness-110 active:scale-[0.98] disabled:bg-zinc-800/50 disabled:text-zinc-650 disabled:pointer-events-none'
            }`}
          >
            {converting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Exchanging...
              </span>
            ) : (
              `Exchange to ${mode === 'goldToRubies' ? 'Rubies' : 'Gold'}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function PaintCanvasModal({ 
  onSendDrawing, 
  currentUserProfile, 
  onClose 
}: { 
  onSendDrawing: (contentStr: string) => Promise<void>; 
  currentUserProfile: Profile; 
  onClose: () => void; 
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<'brush' | 'bucket' | 'eraser'>('brush');
  const [color, setColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(6);
  const [isDrawing, setIsDrawing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize canvas dark backdrop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1e1e22';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const getCoordinates = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    if (e.touches && e.touches[0]) {
      return {
        x: Math.round(((e.touches[0].clientX - rect.left) / rect.width) * canvas.width),
        y: Math.round(((e.touches[0].clientY - rect.top) / rect.height) * canvas.height),
      };
    }
    
    return {
      x: Math.round(((e.clientX - rect.left) / rect.width) * canvas.width),
      y: Math.round(((e.clientY - rect.top) / rect.height) * canvas.height),
    };
  };

  const startDrawing = (e: any) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    
    if (tool === 'bucket') {
      handleFloodFill(x, y, color);
      return;
    }

    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = tool === 'eraser' ? '#1e1e22' : color;
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(x, y);
        ctx.lineWidth = brushSize;
        ctx.strokeStyle = tool === 'eraser' ? '#1e1e22' : color;
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1e1e22';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleFloodFill = (startX: number, startY: number, fillColor: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const hexToRgb = (hex: string) => {
      let c = hex.replace('#', '');
      if (c.length === 3) {
        c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
      }
      const r = parseInt(c.substring(0, 2), 16);
      const g = parseInt(c.substring(2, 4), 16);
      const b = parseInt(c.substring(4, 6), 16);
      return { r, g, b };
    };

    const targetColor = hexToRgb(fillColor);
    const targetIdx = (startY * width + startX) * 4;
    const startR = data[targetIdx];
    const startG = data[targetIdx + 1];
    const startB = data[targetIdx + 2];
    const startA = data[targetIdx + 3];

    if (startR === targetColor.r && startG === targetColor.g && startB === targetColor.b && startA === 255) {
      return;
    }

    const matchColor = (idx: number) => {
      return (
        Math.abs(data[idx] - startR) < 30 &&
        Math.abs(data[idx + 1] - startG) < 30 &&
        Math.abs(data[idx + 2] - startB) < 30 &&
        Math.abs(data[idx + 3] - startA) < 30
      );
    };

    const queue: [number, number][] = [[startX, startY]];
    while (queue.length > 0) {
      const [cx, cy] = queue.shift()!;
      
      const idx = (cy * width + cx) * 4;
      if (!matchColor(idx)) continue;

      data[idx] = targetColor.r;
      data[idx + 1] = targetColor.g;
      data[idx + 2] = targetColor.b;
      data[idx + 3] = 255;

      if (cx > 0) {
        const leftIdx = (cy * width + (cx - 1)) * 4;
        if (matchColor(leftIdx) && data[leftIdx] !== targetColor.r) {
          queue.push([cx - 1, cy]);
        }
      }
      if (cx < width - 1) {
        const rightIdx = (cy * width + (cx + 1)) * 4;
        if (matchColor(rightIdx) && data[rightIdx] !== targetColor.r) {
          queue.push([cx + 1, cy]);
        }
      }
      if (cy > 0) {
        const topIdx = ((cy - 1) * width + cx) * 4;
        if (matchColor(topIdx) && data[topIdx] !== targetColor.r) {
          queue.push([cx, cy - 1]);
        }
      }
      if (cy < height - 1) {
        const botIdx = ((cy + 1) * width + cx) * 4;
        if (matchColor(botIdx) && data[botIdx] !== targetColor.r) {
          queue.push([cx, cy + 1]);
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setSaving(true);
    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast.error("Failed to capture painting.");
        setSaving(false);
        return;
      }

      const file = new File([blob], `painting_${Date.now()}.png`, { type: 'image/png' });
      const filePath = `paintings/${currentUserProfile.id}/${file.name}`;
      
      const paintToast = toast.loading("Saving and sending drawing...");
      try {
        const { error: uploadError } = await supabase.storage.from('banners').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('banners').getPublicUrl(filePath);
        if (!data?.publicUrl) throw new Error("Could not acquire public URL");

        await onSendDrawing(data.publicUrl);
        toast.success("Drawing shared successfully!", { id: paintToast });
        onClose();
      } catch (err: any) {
        console.error(err);
        toast.error(`Failed to post drawing: ${err.message || 'Unknown error'}`, { id: paintToast });
      } finally {
        setSaving(false);
      }
    }, 'image/png');
  };

  const colors = [
    '#ffffff', '#ef4444', '#f97316', '#f59e0b', '#22c55e', 
    '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#000000', '#6b7280'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-xl border border-zinc-800 bg-[#141416] p-5 shadow-2xl flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
          <div className="flex items-center gap-2">
            <Paintbrush className="h-5 w-5 text-indigo-400" />
            <span className="text-lg font-bold text-white tracking-wide">Emerald Paintpad</span>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body split into Canvas and Controls */}
        <div className="flex flex-col md:flex-row gap-4">
          
          {/* Left: Interactive drawing state */}
          <div className="flex-1 overflow-hidden rounded-lg border border-zinc-800 bg-[#0c0c0e] relative flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={540}
              height={360}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="max-w-full h-auto cursor-crosshair touch-none aspect-[3/2] block bg-[#1e1e22]"
            />
          </div>

          {/* Right: Controls & Presets */}
          <div className="w-full md:w-[180px] flex flex-col justify-between gap-4">
            
            {/* Tool Selection */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Tools</span>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => setTool('brush')}
                  className={`py-2 px-1 rounded-md text-xs font-bold transition-all border flex flex-col items-center gap-1 ${
                    tool === 'brush' 
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                      : 'bg-zinc-950 border-zinc-850 text-zinc-450 hover:bg-zinc-900'
                  }`}
                >
                  <Paintbrush className="h-4 w-4" />
                  <span>Brush</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTool('bucket')}
                  className={`py-2 px-1 rounded-md text-xs font-bold transition-all border flex flex-col items-center gap-1 ${
                    tool === 'bucket' 
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                      : 'bg-zinc-950 border-zinc-850 text-zinc-450 hover:bg-zinc-900'
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  <span>Fill</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTool('eraser')}
                  className={`py-2 px-1 rounded-md text-xs font-bold transition-all border flex flex-col items-center gap-1 ${
                    tool === 'eraser' 
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                      : 'bg-zinc-950 border-zinc-850 text-zinc-450 hover:bg-zinc-900'
                  }`}
                >
                  <Minus className="h-4 w-4" />
                  <span>Eraser</span>
                </button>
              </div>
            </div>

            {/* Brush Size */}
            {tool !== 'bucket' && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  <span>Size</span>
                  <span className="text-zinc-400">{brushSize}px</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="40"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-500 h-1.5 bg-zinc-900 rounded-lg cursor-pointer"
                />
              </div>
            )}

            {/* Color Palette */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Palette</span>
              <div className="grid grid-cols-4 gap-1.5">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setColor(c);
                      if (tool === 'eraser') setTool('brush');
                    }}
                    style={{ backgroundColor: c }}
                    className={`h-7 w-7 rounded-full border transition-all ${
                      color === c && tool !== 'eraser' 
                        ? 'ring-2 ring-indigo-500 scale-105 border-white' 
                        : 'border-zinc-900 hover:scale-[1.08]'
                    }`}
                  />
                ))}
                
                {/* Custom Color Selector Container */}
                <label className="h-7 w-7 rounded-full border border-zinc-800 bg-zinc-950 flex items-center justify-center cursor-pointer hover:border-zinc-650 transition-colors relative overflow-hidden group">
                  <span className="text-[9px] text-zinc-400 select-none group-hover:text-white">+</span>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      setColor(e.target.value);
                      if (tool === 'eraser') setTool('brush');
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Reset Panel */}
            <button
              type="button"
              onClick={clearCanvas}
              className="w-full py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-[11px] font-bold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              Clear Canvas
            </button>

          </div>

        </div>

        {/* Footer split */}
        <div className="flex items-center justify-end gap-3 border-t border-zinc-800/60 pt-3 mt-1">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-lg text-sm font-bold text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="py-2.5 px-6 rounded-lg text-sm font-bold shadow-lg text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:brightness-110 active:scale-[0.98] disabled:bg-zinc-800 disabled:text-zinc-650 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Sharing...
              </>
            ) : (
              <>Send Drawing</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

function SocialRequestsModal({
  currentUserProfile,
  allProfiles,
  onProfileUpdate,
  onClose,
  incomingFriendRequests,
  incomingRelationshipRequests
}: {
  currentUserProfile: Profile;
  allProfiles: Profile[];
  onProfileUpdate: (p: Profile) => void;
  onClose: () => void;
  incomingFriendRequests: Profile[];
  incomingRelationshipRequests: Profile[];
}) {
  const [activeTab, setActiveTab] = useState<'friends' | 'relationships'>('friends');
  const myBio = parseBio(currentUserProfile.bio);

  const handleAcceptFriend = async (senderId: string) => {
    const updatedBio = {
      ...myBio,
      friends: [...new Set([...(myBio.friends || []), senderId])]
    };
    const updatedBioStr = JSON.stringify(updatedBio);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio: updatedBioStr })
        .eq('id', currentUserProfile.id);

      if (error) throw error;
      onProfileUpdate({ ...currentUserProfile, bio: updatedBioStr });
      toast.success("Friend request accepted!");
    } catch (e: any) {
      toast.error("Failed to accept: " + e.message);
    }
  };

  const handleDeclineFriend = async (senderId: string) => {
    const updatedBio = {
      ...myBio,
      ignored_friend_requests: [...new Set([...((myBio as any).ignored_friend_requests || []), senderId])]
    };
    const updatedBioStr = JSON.stringify(updatedBio);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio: updatedBioStr })
        .eq('id', currentUserProfile.id);

      if (error) throw error;
      onProfileUpdate({ ...currentUserProfile, bio: updatedBioStr });
      toast.success("Request ignored");
    } catch (e: any) {
      toast.error("Failed to ignore: " + e.message);
    }
  };

  const handleAcceptRelationship = async (partnerId: string, partnerUsername: string) => {
    const updatedBio = {
      ...myBio,
      dating_user_id: partnerId,
      dating_username: partnerUsername,
      relationship_request_sent: ''
    };
    const updatedBioStr = JSON.stringify(updatedBio);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio: updatedBioStr })
        .eq('id', currentUserProfile.id);

      if (error) throw error;
      onProfileUpdate({ ...currentUserProfile, bio: updatedBioStr });
      toast.success(`You are now dating ${partnerUsername}! 💖`);
    } catch (e: any) {
      toast.error("Failed to accept: " + e.message);
    }
  };

  const handleDeclineRelationship = async (partnerId: string) => {
    const updatedBio = {
      ...myBio,
      ignored_relationship_requests: [...new Set([...((myBio as any).ignored_relationship_requests || []), partnerId])]
    };
    const updatedBioStr = JSON.stringify(updatedBio);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio: updatedBioStr })
        .eq('id', currentUserProfile.id);

      if (error) throw error;
      onProfileUpdate({ ...currentUserProfile, bio: updatedBioStr });
      toast.success("Relationship request ignored");
    } catch (e: any) {
      toast.error("Failed to ignore: " + e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-sans">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-[#141416] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-emerald-500" />
            <span className="text-lg font-bold text-white tracking-wide">Social Inbox</span>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex bg-[#252529]/60 border border-zinc-800/80 p-1 rounded-lg gap-1.5 my-4">
          <button
            type="button"
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'friends' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Friend Requests
            {incomingFriendRequests.length > 0 && (
              <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-extrabold animate-pulse">
                {incomingFriendRequests.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('relationships')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'relationships' 
                ? 'bg-rose-600 text-white shadow-md' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Relationship Requests
            {incomingRelationshipRequests.length > 0 && (
              <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-extrabold animate-pulse">
                {incomingRelationshipRequests.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'friends' ? (
          <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
            {incomingFriendRequests.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                No pending friend requests.
              </div>
            ) : (
              incomingFriendRequests.map(sender => (
                <div key={sender.id} className="flex items-center justify-between p-2.5 bg-zinc-950/60 border border-zinc-900 rounded-xl">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={sender.avatar_url} className="h-9 w-9 rounded-full object-cover border border-zinc-800" alt="Avatar" />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white truncate">{sender.username}</div>
                      <div className="text-[10px] text-zinc-500 font-mono truncate">{sender.gender}, {sender.age}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleAcceptFriend(sender.id)}
                      className="p-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-black rounded-lg transition-all cursor-pointer"
                      title="Accept"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeclineFriend(sender.id)}
                      className="p-1.5 bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Ignore"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
            {incomingRelationshipRequests.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs font-sans">
                No pending relationship requests.
              </div>
            ) : (
              incomingRelationshipRequests.map(partner => (
                <div key={partner.id} className="flex items-center justify-between p-2.5 bg-zinc-950/60 border border-zinc-900 rounded-xl">
                  <div className="flex items-center gap-2.5 min-w-0 font-sans">
                    <div className="relative">
                      <img src={partner.avatar_url} className="h-9 w-9 rounded-full object-cover border border-zinc-800" alt="Avatar" />
                      <span className="absolute -bottom-1 -right-1 bg-pink-500 text-white rounded-full p-0.5"><Heart className="h-3 w-3 fill-white" /></span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white truncate">{partner.username}</div>
                      <div className="text-[10px] text-pink-400 font-medium truncate">wants to date you!</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleAcceptRelationship(partner.id, partner.username)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Heart className="h-3.5 w-3.5 fill-white text-white" /> Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeclineRelationship(partner.id)}
                      className="p-1.5 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Ignore"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FriendButton({
  profile,
  currentUserProfile,
  onProfileUpdate,
  setProfile
}: {
  profile: Profile;
  currentUserProfile: Profile;
  onProfileUpdate: (p: Profile) => void;
  setProfile: (p: Profile) => void;
}) {
  const myBio = parseBio(currentUserProfile.bio);
  const otherBio = parseBio(profile.bio);

  const areFriends = myBio.friends?.includes(profile.id) && otherBio.friends?.includes(currentUserProfile.id);
  const sentFriendRequest = myBio.friend_requests_sent?.includes(profile.id);
  const receivedFriendRequest = otherBio.friend_requests_sent?.includes(currentUserProfile.id);

  const isDatingThisUser = myBio.dating_user_id === profile.id && otherBio.dating_user_id === currentUserProfile.id;
  const isDatingOtherSpecialOne = myBio.dating_user_id && myBio.dating_user_id !== profile.id;
  const sentRelationshipRequest = myBio.relationship_request_sent === profile.id;
  const receivedRelationshipRequest = otherBio.relationship_request_sent === currentUserProfile.id;

  const handleAddFriend = async () => {
    const updatedBio = {
      ...myBio,
      friend_requests_sent: [...new Set([...(myBio.friend_requests_sent || []), profile.id])]
    };
    const updatedBioStr = JSON.stringify(updatedBio);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio: updatedBioStr })
        .eq('id', currentUserProfile.id);

      if (error) throw error;
      onProfileUpdate({ ...currentUserProfile, bio: updatedBioStr });
      toast.success("Friend request sent!");
    } catch (e: any) {
      toast.error("Failed to add: " + e.message);
    }
  };

  const handleCancelFriendRequest = async () => {
    const updatedBio = {
      ...myBio,
      friend_requests_sent: (myBio.friend_requests_sent || []).filter(id => id !== profile.id)
    };
    const updatedBioStr = JSON.stringify(updatedBio);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio: updatedBioStr })
        .eq('id', currentUserProfile.id);

      if (error) throw error;
      onProfileUpdate({ ...currentUserProfile, bio: updatedBioStr });
      toast.success("Friend request cancelled.");
    } catch (e: any) {
      toast.error("Failed to cancel: " + e.message);
    }
  };

  const handleAcceptFriendRequest = async () => {
    const updatedBio = {
      ...myBio,
      friends: [...new Set([...(myBio.friends || []), profile.id])]
    };
    const updatedBioStr = JSON.stringify(updatedBio);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio: updatedBioStr })
        .eq('id', currentUserProfile.id);

      if (error) throw error;
      onProfileUpdate({ ...currentUserProfile, bio: updatedBioStr });
      toast.success("Friend request accepted!");
    } catch (e: any) {
      toast.error("Failed: " + e.message);
    }
  };

  const handleUnfriend = async () => {
    const updatedBio = {
      ...myBio,
      friends: (myBio.friends || []).filter(id => id !== profile.id),
      dating_user_id: myBio.dating_user_id === profile.id ? '' : myBio.dating_user_id,
      dating_username: myBio.dating_user_id === profile.id ? '' : myBio.dating_username
    };
    const updatedBioStr = JSON.stringify(updatedBio);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio: updatedBioStr })
        .eq('id', currentUserProfile.id);

      if (error) throw error;
      onProfileUpdate({ ...currentUserProfile, bio: updatedBioStr });
      toast.success("Unfriended user.");
    } catch (e: any) {
      toast.error("Failed: " + e.message);
    }
  };

  const handleSendRelationshipRequest = async () => {
    if (isDatingOtherSpecialOne) {
      toast.error("You are already dating someone! Break up first.");
      return;
    }
    const updatedBio = {
      ...myBio,
      relationship_request_sent: profile.id
    };
    const updatedBioStr = JSON.stringify(updatedBio);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio: updatedBioStr })
        .eq('id', currentUserProfile.id);

      if (error) throw error;
      onProfileUpdate({ ...currentUserProfile, bio: updatedBioStr });
      toast.success("Relationship request sent! 💖");
    } catch (e: any) {
      toast.error("Failed: " + e.message);
    }
  };

  const handleCancelRelationshipRequest = async () => {
    const updatedBio = {
      ...myBio,
      relationship_request_sent: ''
    };
    const updatedBioStr = JSON.stringify(updatedBio);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio: updatedBioStr })
        .eq('id', currentUserProfile.id);

      if (error) throw error;
      onProfileUpdate({ ...currentUserProfile, bio: updatedBioStr });
      toast.success("Relationship request cancelled.");
    } catch (e: any) {
      toast.error("Failed: " + e.message);
    }
  };

  const handleAcceptRelationshipRequest = async () => {
    if (isDatingOtherSpecialOne) {
      toast.error("You are already dating someone! Break up first.");
      return;
    }
    const updatedBio = {
      ...myBio,
      dating_user_id: profile.id,
      dating_username: profile.username,
      relationship_request_sent: ''
    };
    const updatedBioStr = JSON.stringify(updatedBio);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio: updatedBioStr })
        .eq('id', currentUserProfile.id);

      if (error) throw error;
      onProfileUpdate({ ...currentUserProfile, bio: updatedBioStr });
      toast.success(`You are now dating ${profile.username}! 💖`);
    } catch (e: any) {
      toast.error("Failed: " + e.message);
    }
  };

  const handleBreakup = async () => {
    const confirmBreakup = window.confirm(`Are you sure you want to break up with ${profile.username}? 💔`);
    if (!confirmBreakup) return;

    const updatedBio = {
      ...myBio,
      dating_user_id: '',
      dating_username: ''
    };
    const updatedBioStr = JSON.stringify(updatedBio);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio: updatedBioStr })
        .eq('id', currentUserProfile.id);

      if (error) throw error;
      onProfileUpdate({ ...currentUserProfile, bio: updatedBioStr });
      toast.success(`You broke up with ${profile.username}. 💔`);
    } catch (e: any) {
      toast.error("Breakup failed: " + e.message);
    }
  };

  return (
    <div className="flex gap-2 items-center flex-wrap select-none font-sans">
      {areFriends ? (
        <button
          type="button"
          onClick={handleUnfriend}
          className="px-3.5 py-1.5 text-xs font-semibold rounded-md border border-zinc-800 hover:border-red-500/20 bg-[#1e1e22]/80 text-zinc-300 hover:text-red-400 hover:bg-zinc-900 transition-all flex items-center gap-1.5 cursor-pointer"
          title="Click to Unfriend"
        >
          <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Friends</span>
        </button>
      ) : sentFriendRequest ? (
        <button
          type="button"
          onClick={handleCancelFriendRequest}
          className="px-3.5 py-1.5 text-xs font-semibold rounded-md border border-[#2a2a30] hover:border-yellow-650/30 bg-[#2a2a30]/30 text-yellow-500 hover:text-yellow-400 transition-all flex items-center gap-1.5 cursor-pointer"
          title="Click to Cancel Request"
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Requested</span>
        </button>
      ) : receivedFriendRequest ? (
        <button
          type="button"
          onClick={handleAcceptFriendRequest}
          className="px-3.5 py-1.5 text-xs font-bold rounded-md bg-emerald-600 text-white hover:bg-emerald-500 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Accept Friend</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleAddFriend}
          className="px-3.5 py-1.5 text-xs font-bold rounded-md bg-[#1e1e22] text-white hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
          <span>Add Friend</span>
        </button>
      )}

      {areFriends && (
        <>
          {isDatingThisUser ? (
            <button
              type="button"
              onClick={handleBreakup}
              className="px-3.5 py-1.5 text-xs font-bold rounded-md bg-rose-950/40 border border-rose-900/40 text-rose-400 hover:bg-rose-900 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              title="Click to Break Up"
            >
              <HeartOff className="w-3.5 h-3.5 text-rose-500" />
              <span>Dating (Break up)</span>
            </button>
          ) : sentRelationshipRequest ? (
            <button
              type="button"
              onClick={handleCancelRelationshipRequest}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-md border border-pink-900/30 bg-pink-950/20 text-pink-400 hover:bg-pink-900 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              title="Click to Cancel Request"
            >
              <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500 animate-pulse" />
              <span>Requested Dating</span>
            </button>
          ) : receivedRelationshipRequest ? (
            <button
              type="button"
              onClick={handleAcceptRelationshipRequest}
              className="px-3.5 py-1.5 text-xs font-bold rounded-md bg-rose-600 text-white hover:bg-rose-500 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 fill-white text-white" />
              <span>Accept Dating</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSendRelationshipRequest}
              className="px-3.5 py-1.5 text-xs font-bold rounded-md bg-pink-600 hover:bg-pink-500 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              title="Send Relationship Request"
            >
              <Heart className="w-3.5 h-3.5 fill-white text-white" />
              <span>Send rls request</span>
            </button>
          )}
        </>
      )}
    </div>
  );
}

