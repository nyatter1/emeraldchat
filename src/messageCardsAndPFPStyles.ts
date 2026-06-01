import React from 'react';

export interface MessageCardStyle {
  id: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  cost: number;
  bubbleClass: string;
  bubbleStyle?: React.CSSProperties;
  textClass?: string;
  glowColor?: string;
  isAnimated?: boolean;
}

export const MESSAGE_CARDS: MessageCardStyle[] = [
  { id: 'none', name: 'Default Plain', rarity: 'Common', cost: 0, bubbleClass: 'bg-transparent text-zinc-100' },
  // Common (10 items)
  { id: 'mc_dark_slate', name: 'Slate Core', rarity: 'Common', cost: 100, bubbleClass: 'bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-1.5 shadow-sm text-zinc-300' },
  { id: 'mc_navy_seal', name: 'Deep Sea Blue', rarity: 'Common', cost: 150, bubbleClass: 'bg-blue-950/40 border border-blue-900/50 rounded-lg px-3 py-1.5 text-blue-200' },
  { id: 'mc_green_moss', name: 'Mossy Forest', rarity: 'Common', cost: 150, bubbleClass: 'bg-emerald-950/30 border border-emerald-900/50 rounded-lg px-3 py-1.5 text-emerald-200' },
  { id: 'mc_red_clay', name: 'Red Ochre', rarity: 'Common', cost: 150, bubbleClass: 'bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-1.5 text-red-200' },
  { id: 'mc_amber_dust', name: 'Amber Glow', rarity: 'Common', cost: 150, bubbleClass: 'bg-amber-950/30 border border-amber-900/50 rounded-lg px-3 py-1.5 text-amber-200' },
  { id: 'mc_ash_gray', name: 'Ashen Mist', rarity: 'Common', cost: 200, bubbleClass: 'bg-neutral-800/80 border border-neutral-700/60 rounded-lg px-3 py-1.5 text-neutral-300' },
  { id: 'mc_soft_plum', name: 'Plum Velvet', rarity: 'Common', cost: 200, bubbleClass: 'bg-purple-950/30 border border-purple-900/50 rounded-lg px-3 py-1.5 text-purple-200' },
  { id: 'mc_sand_dune', name: 'Desert Sand', rarity: 'Common', cost: 200, bubbleClass: 'bg-stone-800/90 border border-stone-700/60 rounded-lg px-3 py-1.5 text-stone-300' },
  { id: 'mc_teal_lake', name: 'Teal Depth', rarity: 'Common', cost: 250, bubbleClass: 'bg-teal-950/30 border border-teal-900/50 rounded-lg px-3 py-1.5 text-teal-200' },
  { id: 'mc_charcoal', name: 'Charcoal Matte', rarity: 'Common', cost: 250, bubbleClass: 'bg-zinc-850 border border-zinc-750 rounded-lg px-3 py-1.5 text-zinc-100' },

  // Rare (15 items)
  { id: 'mc_cyberpunk', name: 'Cyber Neon', rarity: 'Rare', cost: 500, bubbleClass: 'bg-black border border-cyan-500/50 rounded-lg px-3 py-1.5 text-cyan-200 shadow-[0_0_8px_rgba(6,182,212,0.15)]' },
  { id: 'mc_pink_vapor', name: 'Vaporwave Sunset', rarity: 'Rare', cost: 550, bubbleClass: 'bg-zinc-950 border border-fuchsia-500/50 rounded-lg px-3 py-1.5 text-fuchsia-200 shadow-[0_0_8px_rgba(217,70,239,0.15)]' },
  { id: 'mc_golden_guild', name: 'Golden Edge', rarity: 'Rare', cost: 600, bubbleClass: 'bg-zinc-900 border border-yellow-500/50 rounded-lg px-3 py-1.5 text-yellow-100 shadow-[0_0_8px_rgba(234,179,8,0.15)]' },
  { id: 'mc_nuclear', name: 'Toxic Rads', rarity: 'Rare', cost: 650, bubbleClass: 'bg-black border border-lime-500/50 rounded-lg px-3 py-1.5 text-lime-300 shadow-[0_0_8px_rgba(132,204,22,0.2)]' },
  { id: 'mc_crimson_lust', name: 'Vampire Lust', rarity: 'Rare', cost: 700, bubbleClass: 'bg-zinc-950 border border-red-500/50 rounded-lg px-3 py-1.5 text-red-200 shadow-[0_0_8px_rgba(239,68,68,0.2)]' },
  { id: 'mc_violet_pulse', name: 'Amethyst Shard', rarity: 'Rare', cost: 750, bubbleClass: 'bg-black border border-violet-500/50 rounded-lg px-3 py-1.5 text-violet-200 shadow-[0_0_8px_rgba(139,92,246,0.15)]' },
  { id: 'mc_deep_magenta', name: 'Deep Cyberpunk', rarity: 'Rare', cost: 800, bubbleClass: 'bg-[#0f0913] border border-pink-500/40 rounded-lg px-3 py-1.5 text-pink-200' },
  { id: 'mc_sublime', name: 'Sublime Emerald', rarity: 'Rare', cost: 850, bubbleClass: 'bg-[#050f0c] border border-emerald-500/40 rounded-lg px-3 py-1.5 text-emerald-200' },
  { id: 'mc_steel_plate', name: 'Riveted Steel', rarity: 'Rare', cost: 900, bubbleClass: 'bg-zinc-800 border-2 border-dashed border-zinc-600 rounded-lg px-3 py-1.5 text-zinc-100 shadow-md' },
  { id: 'mc_ocean_breeze', name: 'Coral Lagoon', rarity: 'Rare', cost: 950, bubbleClass: 'bg-[#080f1a] border border-sky-450 rounded-lg px-3 py-1.5 text-sky-200' },
  { id: 'mc_frostbite', name: 'Glacial Ice', rarity: 'Rare', cost: 1000, bubbleClass: 'bg-[#0e1620] border border-blue-300/30 rounded-lg px-3 py-1.5 text-blue-100 shadow-[inset_0_0_6px_rgba(147,197,253,0.1)]' },
  { id: 'mc_sunset_breeze', name: 'Sunset Horizon', rarity: 'Rare', cost: 1100, bubbleClass: 'bg-[#150e0f] border border-orange-500/40 rounded-lg px-3 py-1.5 text-orange-200' },
  { id: 'mc_royal_purple', name: 'Velvet Sovereign', rarity: 'Rare', cost: 1200, bubbleClass: 'bg-[#120a16] border border-indigo-500/40 rounded-lg px-3 py-1.5 text-indigo-200' },
  { id: 'mc_radioactive', name: 'Uranium Decay', rarity: 'Rare', cost: 1250, bubbleClass: 'bg-[#0a0f05] border border-yellow-400/40 rounded-lg px-3 py-1.5 text-yellow-200' },
  { id: 'mc_chocolate', name: 'Cocoa Gloss', rarity: 'Rare', cost: 1300, bubbleClass: 'bg-[#1a1412] border border-amber-800/40 rounded-lg px-3 py-1.5 text-amber-200' },

  // Epic (15 items)
  { id: 'mc_pulse_wave', name: 'Chrono Pulse', rarity: 'Epic', cost: 2000, bubbleClass: 'bg-zinc-950 border border-emerald-500/60 rounded-lg px-3 py-1.5 text-white shadow-[0_0_12px_rgba(16,185,129,0.2)] animate-pulse' },
  { id: 'mc_shadow_veil', name: 'Dark Abyss', rarity: 'Epic', cost: 2100, bubbleClass: 'bg-black/95 border border-zinc-900 rounded-lg px-3 py-1.5 text-zinc-400 shadow-[0_4px_20px_rgba(0,0,0,0.8)]' },
  { id: 'mc_magma_flow', name: 'Molten Core', rarity: 'Epic', cost: 2200, bubbleClass: 'bg-gradient-to-r from-red-950 to-orange-950 border border-orange-600/60 rounded-lg px-3 py-1.5 text-orange-100 shadow-[0_0_12px_rgba(249,115,22,0.2)]' },
  { id: 'mc_plasma_storm', name: 'Plasma Blast', rarity: 'Epic', cost: 2300, bubbleClass: 'bg-gradient-to-r from-purple-950 to-pink-950 border border-pink-600/60 rounded-lg px-3 py-1.5 text-pink-100 shadow-[0_0_12px_rgba(236,72,153,0.2)]' },
  { id: 'mc_quantum', name: 'Supersonic Singularity', rarity: 'Epic', cost: 2400, bubbleClass: 'bg-gradient-to-r from-indigo-950 to-cyan-950 border border-cyan-500/60 rounded-lg px-3 py-1.5 text-cyan-100 shadow-[0_0_12px_rgba(6,182,212,0.25)]' },
  { id: 'mc_stealth', name: 'Tactical Matte', rarity: 'Epic', cost: 2500, bubbleClass: 'bg-[#121214] border-2 border-zinc-800 rounded-xl px-4 py-2 text-zinc-300 font-mono text-sm' },
  { id: 'mc_acid_trip', name: 'Neon Toxic', rarity: 'Epic', cost: 2600, bubbleClass: 'bg-black border border-lime-400 rounded-lg px-3 py-1.5 text-lime-200 shadow-[0_0_15px_rgba(163,230,53,0.25)]' },
  { id: 'mc_retro_terminal', name: 'C64 Terminal', rarity: 'Epic', cost: 2700, bubbleClass: 'bg-zinc-900 border-2 border-emerald-500 rounded-md px-3 py-1.5 text-emerald-400 font-mono shadow-[inset_0_0_10px_rgba(16,185,129,0.3)]' },
  { id: 'mc_sapphire_glow', name: 'Sapphire Shard', rarity: 'Epic', cost: 2800, bubbleClass: 'bg-[#03091e] border border-blue-500 rounded-lg px-3 py-1.5 text-blue-200 shadow-[0_0_12px_rgba(59,130,246,0.3)]' },
  { id: 'mc_ruby_lust', name: 'Ruby Crystal', rarity: 'Epic', cost: 2900, bubbleClass: 'bg-[#180309] border border-rose-600 rounded-lg px-3 py-1.5 text-rose-200 shadow-[0_0_12px_rgba(225,29,72,0.3)]' },
  { id: 'mc_spectral', name: 'Astral Rift', rarity: 'Epic', cost: 3000, bubbleClass: 'bg-indigo-950/20 border border-indigo-400 rounded-lg px-3 py-1.5 text-indigo-200 shadow-[0_0_15px_rgba(129,140,248,0.2)]' },
  { id: 'mc_cherry_blossom', name: 'Sakura Petal', rarity: 'Epic', cost: 3100, bubbleClass: 'bg-rose-950/20 border border-pink-400 rounded-lg px-3 py-1.5 text-pink-100 shadow-[0_0_10px_rgba(244,114,182,0.15)]' },
  { id: 'mc_golden_palace', name: 'Gilded Dynasty', rarity: 'Epic', cost: 3200, bubbleClass: 'bg-amber-950/40 border border-yellow-400 rounded-lg px-3 py-1.5 text-yellow-100 shadow-[inset_0_0_8px_rgba(234,179,8,0.2)]' },
  { id: 'mc_carbon_fiber', name: 'Carbon Fiber', rarity: 'Epic', cost: 3300, bubbleClass: 'bg-[#18181b] border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-300 shadow-md', bubbleStyle: { backgroundImage: 'linear-gradient(45deg, #111 25%, #222 25%, #222 50%, #111 50%, #111 75%, #222 75%, #222' } },
  { id: 'mc_hacker', name: 'Unix Console', rarity: 'Epic', cost: 3500, bubbleClass: 'bg-black border border-green-500 rounded-md px-3 py-1.5 text-green-400 font-mono shadow-[0_0_8px_rgba(34,197,94,0.3)]' },

  // Legendary (8 items)
  { id: 'mc_rainbow_spark', name: 'Chroma Horizon', rarity: 'Legendary', cost: 6000, bubbleClass: 'bg-[#0e0e11] border border-transparent rounded-lg px-3 py-1.5 text-white shadow-xl', bubbleStyle: { borderImage: 'linear-gradient(270deg, #ff007f, #7f00ff, #00ffff, #00ff7f, #ff007f) 1', animation: 'chromaSweep 5s linear infinite' } },
  { id: 'mc_cosmic_stardust', name: 'Nebula Stream', rarity: 'Legendary', cost: 6500, bubbleClass: 'bg-gradient-to-r from-blue-950 via-purple-950 to-pink-950 border border-violet-400 rounded-lg px-3 py-1.5 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] animate-pulse' },
  { id: 'mc_matrix', name: 'Digital Rain', rarity: 'Legendary', cost: 7000, bubbleClass: 'bg-black border border-green-500 rounded-lg px-3 py-1.5 text-green-300 font-mono', bubbleStyle: { animation: 'matrixPulse 3s infinite alternate' } },
  { id: 'mc_blood_moon', name: 'Crimson Eclipse', rarity: 'Legendary', cost: 7500, bubbleClass: 'bg-black/90 border border-red-600 rounded-lg px-3 py-1.5 text-red-100 shadow-[0_0_20px_rgba(220,38,38,0.5)]' },
  { id: 'mc_electric_pulse', name: 'Volt Overdrive', rarity: 'Legendary', cost: 8000, bubbleClass: 'bg-zinc-950 border border-cyan-400 rounded-lg px-3 py-1.5 text-white shadow-[0_0_18px_rgba(34,211,238,0.5)] animate-pulse' },
  { id: 'mc_solar_eclipse', name: 'Corona Supernova', rarity: 'Legendary', cost: 8500, bubbleClass: 'bg-zinc-950 border border-amber-500 rounded-lg px-3 py-1.5 text-amber-200 shadow-[0_0_18px_rgba(245,158,11,0.5)]' },
  { id: 'mc_cyber_glitch', name: 'Glitch Core', rarity: 'Legendary', cost: 9000, bubbleClass: 'bg-[#08080a] border border-magenta-500 rounded-lg px-3 py-1.5 text-zinc-100 shadow-[0_0_15px_rgba(217,70,239,0.3)]', bubbleStyle: { borderImage: 'linear-gradient(45deg, #06b6d4, #d946ef) 1' } },
  { id: 'mc_phoenix', name: 'Phoenix Fire', rarity: 'Legendary', cost: 9500, bubbleClass: 'bg-[#150500] border border-orange-500 rounded-lg px-3 py-1.5 text-orange-200 shadow-[0_0_20px_rgba(249,115,22,0.4)]' },

  // Mythic (4 items)
  { id: 'mc_celestial_galaxy', name: 'Multiverse Rift', rarity: 'Mythic', cost: 0, bubbleClass: 'bg-black/85 border border-purple-500 rounded-xl px-4 py-2.5 text-white shadow-[0_0_25px_rgba(168,85,247,0.6)] font-semibold' },
  { id: 'mc_golden_emperor', name: 'Aureate Majesty', rarity: 'Mythic', cost: 0, bubbleClass: 'bg-zinc-950 border border-yellow-400 rounded-xl px-4 py-2.5 text-yield-200 text-yellow-100 shadow-[0_0_25px_rgba(234,179,8,0.6),inset_0_0_12px_rgba(234,179,8,0.3)] animate-pulse' },
  { id: 'mc_void_consumer', name: 'Eldritch Vortex', rarity: 'Mythic', cost: 0, bubbleClass: 'bg-[#030008] border-2 border-indigo-600 rounded-xl px-4 py-2.5 text-indigo-200 shadow-[0_0_30px_rgba(79,70,229,0.8)]' },
  { id: 'mc_god_mode', name: 'Hyperdimension God', rarity: 'Mythic', cost: 0, bubbleClass: 'bg-[#060a14] border-2 border-cyan-450 rounded-xl px-4 py-2.5 text-white shadow-[0_0_30px_rgba(6,182,212,0.8),inset_0_0_15px_rgba(6,182,212,0.4)]' }
].map(c => ({ ...c, cost: 0 })) as MessageCardStyle[];
