import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, Message, News, ProfileLike } from '../types';
import { LogOut, Send, MoreVertical, X, Upload, Loader2, Link as LinkIcon, Image as ImageIcon, Music, List, ListOrdered, Quote, Minus, ShieldCheck, Menu, ThumbsUp, Heart, Laugh, ChevronLeft, ChevronRight, Grid, ArrowRight, Check } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

const SPOTIFY_URL_REGEX = /https:\/\/open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)(\?.*)?/;
const IMAGE_EXT_REGEX = /\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i;
const FORBIDDEN_TLDS = /\.(online|site|indevs\.in)(\/.*)?$/i;

export const DEV_EMAILS = ['test@gmail.com', 'dev@gmail.com', 'haydensixseven@gmail.com'];
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
    cardStyle: {},
    avatarStyle: {}
  },
  {
    id: 'neon-emerald',
    name: 'Neon Emerald Glow',
    className: 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]',
    cardStyle: {
      border: '3px solid #10b981',
      boxShadow: '0 0 25px rgba(16, 185, 129, 0.65), inset 0 0 10px rgba(16, 185, 129, 0.3)',
      animation: 'borderPulseEmerald 2.5s infinite ease-in-out'
    },
    avatarStyle: {
      border: '2.5px solid #10b981',
      boxShadow: '0 0 8px #10b981'
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
    },
    avatarStyle: {
      border: '2.5px solid #ef4444',
      boxShadow: '0 0 8px #ef4444'
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
    },
    avatarStyle: {
      border: '2.5px solid #a855f7',
      boxShadow: '0 0 8px #a855f7'
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
    },
    avatarStyle: {
      border: '2.5px solid #fbbf24',
      boxShadow: '0 0 8px #fbbf24'
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
    },
    avatarStyle: {
      border: '2px solid transparent',
      backgroundImage: 'linear-gradient(#141416, #141416), linear-gradient(to right, #ff0055, #00ff55, #0055ff, #ff0055)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box',
      boxShadow: '0 0 8px rgba(255, 0, 100, 0.5)'
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
    },
    avatarStyle: {
      border: '2.5px solid #67e8f9',
      boxShadow: '0 0 8px #67e8f9'
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
    },
    avatarStyle: {
      border: '2.5px double #34d399',
      boxShadow: '0 0 8px #34d399'
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
    },
    avatarStyle: {
      border: '2.5px solid #f472b6',
      boxShadow: '0 0 8px #f472b6'
    }
  }
];

export const BORDER_KEYFRAMES = `
@keyframes borderPulseEmerald {
  0% { box-shadow: 0 0 15px rgba(16, 185, 129, 0.35), inset 0 0 8px rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.7); }
  50% { box-shadow: 0 0 30px rgba(16, 185, 129, 0.8), inset 0 0 15px rgba(16, 185, 129, 0.45); border-color: rgba(16, 185, 129, 1); }
  100% { box-shadow: 0 0 15px rgba(16, 185, 129, 0.35), inset 0 0 8px rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.7); }
}
@keyframes borderPulseCrimson {
  0% { box-shadow: 0 0 15px rgba(239, 68, 68, 0.4), inset 0 0 8px rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.7); }
  50% { box-shadow: 0 0 35px rgba(239, 68, 68, 0.9), inset 0 0 15px rgba(239, 68, 68, 0.5); border-color: rgba(239, 68, 68, 1); }
  100% { box-shadow: 0 0 15px rgba(239, 68, 68, 0.4), inset 0 0 8px rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.7); }
}
@keyframes borderPulseCosmic {
  0% { box-shadow: 0 0 15px rgba(168, 85, 247, 0.45), inset 0 0 8px rgba(168, 85, 247, 0.2); border-color: rgba(168, 85, 247, 0.75); }
  50% { box-shadow: 0 0 30px rgba(168, 85, 247, 0.85), inset 0 0 15px rgba(168, 85, 247, 0.5); border-color: rgba(168, 85, 247, 1); }
  100% { box-shadow: 0 0 15px rgba(168, 85, 247, 0.45), inset 0 0 8px rgba(168, 85, 247, 0.2); border-color: rgba(168, 85, 247, 0.75); }
}
@keyframes borderPulseCyan {
  0% { box-shadow: 0 0 15px rgba(6, 182, 212, 0.4), inset 0 0 8px rgba(6, 182, 212, 0.2); border-color: rgba(6, 182, 212, 0.7); }
  50% { box-shadow: 0 0 32px rgba(6, 182, 212, 0.85), inset 0 0 15px rgba(6, 182, 212, 0.5); border-color: rgba(6, 182, 212, 1); }
  100% { box-shadow: 0 0 15px rgba(6, 182, 212, 0.4), inset 0 0 8px rgba(6, 182, 212, 0.2); border-color: rgba(6, 182, 212, 0.7); }
}
@keyframes borderPulseBubblegum {
  0% { box-shadow: 0 0 15px rgba(244, 114, 182, 0.45), inset 0 0 8px rgba(244, 114, 182, 0.2); border-color: rgba(244, 114, 182, 0.7); }
  50% { box-shadow: 0 0 30px rgba(244, 114, 182, 0.85), inset 0 0 15px rgba(244, 114, 182, 0.5); border-color: rgba(244, 114, 182, 1); }
  100% { box-shadow: 0 0 15px rgba(244, 114, 182, 0.45), inset 0 0 8px rgba(244, 114, 182, 0.2); border-color: rgba(244, 114, 182, 0.7); }
}
@keyframes borderRotateGold {
  0% { border-color: #fbbf24; box-shadow: 0 0 15px rgba(251, 191, 36, 0.5); }
  50% { border-color: #f59e0b; box-shadow: 0 0 32px rgba(251, 191, 36, 0.9); }
  100% { border-color: #fbbf24; box-shadow: 0 0 15px rgba(251, 191, 36, 0.5); }
}
@keyframes borderChromaWave {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}
@keyframes matrixFlicker {
  0%, 100% { opacity: 0.95; box-shadow: 0 0 15px rgba(52, 211, 153, 0.5); }
  50% { opacity: 1; box-shadow: 0 0 25px rgba(52, 211, 153, 0.8); }
}
`;

export let globalRankOverrides: Record<string, string> = {};

export function getRank(email?: string | null, userId?: string | null, dbRank?: string | null) {
  const e = email || '';
  const uid = userId || '';
  
  if (uid === 'test-bot-0000-0000' || e.toLowerCase() === 'testbot@emerald.chat') {
    return {
      name: 'Bot',
      icon: 'https://img.icons8.com/fluency/48/bot.png',
      level: 7
    };
  }

  const lookupKey = uid ? globalRankOverrides[uid] : (e ? globalRankOverrides[e.toLowerCase()] : '');
  const rankFromSource = lookupKey || (dbRank && dbRank !== 'VIP' ? dbRank : null) || (uid ? globalRankOverrides[uid] : '') || (dbRank || '').trim() || '';
  
  const rankName = rankFromSource || (
    DEV_EMAILS.includes(e) ? 'Developer' :
    FOUNDER_EMAILS.includes(e) ? 'Founder' :
    MOP_EMAILS.includes(e) ? 'MoP' :
    SUPERADMIN_EMAILS.includes(e) ? 'SuperAdmin' :
    ADMIN_EMAILS.includes(e) ? 'Admin' :
    MOD_EMAILS.includes(e) ? 'Mod' : 'VIP'
  );

  const icons: { [key: string]: string } = {
    'Developer': 'https://raw.githubusercontent.com/nyatter1/ranks/main/verified.gif',
    'Founder': 'https://raw.githubusercontent.com/nyatter1/ranks/main/founder.gif',
    'MoP': 'https://raw.githubusercontent.com/nyatter1/ranks/main/MoP.gif',
    'SuperAdmin': 'https://raw.githubusercontent.com/nyatter1/ranks/main/superadmin.png',
    'Admin': 'https://raw.githubusercontent.com/nyatter1/ranks/main/admin.png',
    'Mod': 'https://raw.githubusercontent.com/nyatter1/ranks/main/mod.png',
    'VIP': 'https://raw.githubusercontent.com/nyatter1/ranks/main/vip.gif',
    'Bot': 'https://img.icons8.com/fluency/48/bot.png'
  };

  const levels: { [key: string]: number } = {
    'Developer': 0, 'Founder': 1, 'MoP': 2, 'SuperAdmin': 3, 'Admin': 4, 'Mod': 5, 'VIP': 6, 'Bot': 7
  };

  const exactRank = Object.keys(icons).find(k => k.toLowerCase() === rankName.toLowerCase()) || 'VIP';

  return { name: exactRank, icon: icons[exactRank], level: levels[exactRank] };
}

function isSafeUrl(url: string | undefined): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  
  // Explicitly check forbidden TLDs first
  if (FORBIDDEN_TLDS.test(lowerUrl)) return false;
  
  // Whitelist: Spotify or direct image links
  return SPOTIFY_URL_REGEX.test(url) || IMAGE_EXT_REGEX.test(url);
}

function scrubContent(text: string): string {
  if (!text) return '';
  // Mask any plain text that looks like a forbidden domain
  return text.replace(/([a-zA-Z0-9-]+\.(online|site|indevs\.in))/gi, '[blocked]');
}

function SpotifyEmbed({ url }: { url: string }) {
  const match = url.match(SPOTIFY_URL_REGEX);
  if (!match) return null;
  return (
    <div className="my-3 w-full">
      <iframe style={{ borderRadius: '12px' }} src={`https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`} width="100%" height="152" frameBorder="0" allowFullScreen={false} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
    </div>
  );
}

const MarkdownComponents = {
  a: ({ node, href, children, ...props }: any) => {
    if (!href) return <span>{children}</span>;
    
    const lowerHref = href.toLowerCase();
    
    if (SPOTIFY_URL_REGEX.test(href)) {
      return (
        <div className="flex flex-col gap-1 w-full max-w-sm mt-1">
          <SpotifyEmbed url={href} />
        </div>
      );
    }

    if (isSafeUrl(href)) {
      if (IMAGE_EXT_REGEX.test(lowerHref)) {
        return <img src={href} alt={children?.toString() || 'Image'} className="max-w-full rounded-lg my-2 border border-zinc-800" loading="lazy" />;
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
  assigned_ranks?: Record<string, string>;
  custom_fonts?: Record<string, string>;
}

export function parseBio(bioStr: string | null | undefined): BioData {
  if (!bioStr) return { text: '', mood: '' };
  try {
    const data = JSON.parse(bioStr);
    return {
      text: data.text !== undefined ? data.text : (data.bio !== undefined ? data.bio : ''),
      mood: data.mood || '',
      profile_music_type: data.profile_music_type || '',
      profile_music_source: data.profile_music_source || '',
      profile_card_bg: data.profile_card_bg || '',
      profile_border: data.profile_border || 'none',
      assigned_ranks: data.assigned_ranks || {},
      custom_fonts: data.custom_fonts || {}
    };
  } catch (e) {}
  return { text: bioStr, mood: '' };
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
               style={uBorder.avatarStyle}
               className={`w-10 h-10 rounded-full object-cover border shrink-0 ${uBorderConfig.profile_border && uBorderConfig.profile_border !== 'none' ? 'border-transparent' : 'border-zinc-700'}`} 
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
          <Markdown remarkPlugins={[remarkGfm, remarkBreaks]} components={MarkdownComponents}>
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
                         style={cBorder.avatarStyle}
                         className={`w-7 h-7 rounded-full object-cover border shrink-0 ${cBorderConfig.profile_border && cBorderConfig.profile_border !== 'none' ? 'border-transparent' : 'border-zinc-700'}`} 
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

export function Chat({ currentUserProfile, onSignOut, onProfileUpdate }: { currentUserProfile: Profile, onSignOut: () => void, onProfileUpdate: (p: Profile) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<Profile[]>([TEST_BOT]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [leftPanelMode, setLeftPanelMode] = useState<'none' | 'menu' | 'news' | 'rules'>('none');
  const [newsFeed, setNewsFeed] = useState<News[]>([]);
  const [newNewsContent, setNewNewsContent] = useState('');
  const [hasNewNews, setHasNewNews] = useState(false);
  const [rankOverrides, setRankOverrides] = useState<Record<string, string>>({});
  
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
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
            const mentionText = currentUserProfile.username.toLowerCase();
            const messageText = payload.new.content.toLowerCase();
            const isMentioned = messageText.includes(mentionText);
            
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
         if (payload.new && payload.new.email === 'test@gmail.com') {
           const bio = parseBio(payload.new.bio);
           if (bio.assigned_ranks) {
             setRankOverrides(bio.assigned_ranks);
             globalRankOverrides = bio.assigned_ranks;
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
          return a.username.localeCompare(b.username);
        });

        setOnlineUsers(uniqueUsers);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await room.track({ profile: currentUserProfile });
        }
      });

    return () => {
      messageSubscription.unsubscribe();
      room.unsubscribe();
    };
  }, [currentUserProfile]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

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

    if (commandName === '/ranks') {
      setNewMessage('');
      if (currentUserProfile.email !== 'test@gmail.com') {
        toast.error('You do not have permission to use /ranks');
        return;
      }
      toast.success(`Available Ranks: ${RANK_ORDER.join(', ')}`, { duration: 6000 });
      return;
    }

    if (commandName === '/rank') {
      setNewMessage('');
      if (currentUserProfile.email !== 'test@gmail.com') {
        toast.error('You do not have permission to use /rank');
        return;
      }
      
      if (args.length < 3) {
        toast.error('Usage: /rank {username or email} {rank_name}');
        return;
      }

      const targetInput = args[1].trim();
      const rankInput = args[2].trim();

      const exactRankName = RANK_ORDER.find(r => r.toLowerCase() === rankInput.toLowerCase());
      if (!exactRankName) {
        toast.error(`Invalid rank. Available: ${RANK_ORDER.join(', ')}`);
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

    // Hard block for forbidden links
    if (FORBIDDEN_TLDS.test(content.toLowerCase())) {
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
      content,
      created_at: new Date().toISOString(),
      user_id: currentUserProfile.id,
      profiles: currentUserProfile
    };
    
    setMessages(prev => [...prev, tempMessage]);

    const { error } = await supabase
      .from('messages')
      .insert({ id: tempId, content, user_id: currentUserProfile.id });

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

  const displayOnlineUsers = onlineUsers;

  const isDev = ['test@gmail.com', 'dev@gmail.com'].includes(currentUserProfile.email || '');

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      
        {/* Left Drawer Menu */}
        {leftPanelMode !== 'none' && (
          <>
            <div className="w-[320px] flex flex-col border-r border-zinc-800 bg-[#09090b] z-40 absolute lg:relative h-full transition-all shrink-0">
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

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col relative">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 sm:px-6 py-4">
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
             <h1 className="text-lg font-bold tracking-tight text-emerald-500">Emerald Chat</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedProfileId(currentUserProfile.id)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
            >
              <span className="text-sm font-bold text-zinc-200 hidden sm:block">{currentUserProfile.username}</span>
              <img 
                src={currentUserProfile.avatar_url} 
                alt="Your avatar" 
                className="h-8 w-8 rounded-full border border-zinc-700 object-cover"
              />
            </button>
            <button
              onClick={onSignOut}
              className="p-2 text-zinc-500 hover:text-emerald-500 hover:bg-zinc-800 rounded-lg transition-colors focus:outline-none"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>



        {/* Message List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          <div className="space-y-2">
            {visibleMessages.map((msg, index) => {
              const renderMsg = transformMessage(msg);
              return (
                <div 
                  key={renderMsg.id || index} 
                  className={`flex flex-col group py-1.5 hover:bg-zinc-900/50 transition-colors -mx-4 px-4 rounded-lg ${
                    renderMsg.content.toLowerCase().includes(currentUserProfile.username.toLowerCase()) && renderMsg.user_id !== currentUserProfile.id 
                    ? 'bg-emerald-500/5 border-l-2 border-emerald-500' 
                    : ''
                  }`}
                >
                  <UserProfileFontsLoader bio={renderMsg.profiles?.bio} />
                  <div className="flex items-start gap-3">
                    {(() => {
                      const msgBio = parseBio(renderMsg.profiles?.bio);
                      const msgBorderId = msgBio.profile_border || 'none';
                      const msgBorder = PROFILE_BORDERS.find(b => b.id === msgBorderId) || PROFILE_BORDERS[0];
                      return (
                        <img 
                          src={renderMsg.profiles?.avatar_url || 'https://api.dicebear.com/7.x/identicon/svg?seed=default'} 
                          alt="Avatar" 
                          style={msgBorder.avatarStyle}
                          className={`h-[42px] w-[42px] rounded-md object-cover shrink-0 mt-0.5 cursor-pointer border ${msgBorderId === 'none' ? 'border-zinc-800' : 'border-transparent'}`}
                          onClick={() => setSelectedProfileId(renderMsg.user_id)}
                        />
                      );
                    })()}
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
                      <div className="text-zinc-200 text-[15px] leading-relaxed break-words relative pr-12">
                        <Markdown remarkPlugins={[remarkGfm, remarkBreaks]} components={MarkdownComponents}>
                          {scrubContent(renderMsg.content)}
                        </Markdown>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-zinc-800 bg-zinc-950 p-4">
          <form onSubmit={handleSendMessage} className="relative mx-auto max-w-4xl flex items-end gap-2 bg-[#1e1e22] border border-zinc-800 rounded-[8px] p-1.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Message Emerald Chat..."
              className="max-h-[50vh] min-h-[40px] w-full resize-none bg-transparent px-3 py-2 text-[15px] text-zinc-100 placeholder-zinc-500 focus:outline-none custom-scrollbar"
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
      <div className="hidden w-[280px] flex-col border-l border-zinc-800 bg-[#141416] lg:flex shrink-0">
        <div className="px-4 py-4 border-b border-zinc-800/40">
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Online — {displayOnlineUsers.length}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 pt-2 custom-scrollbar">
          <div className="space-y-1">
            {displayOnlineUsers.map(user => (
              <button
                key={user.id}
                onClick={() => setSelectedProfileId(user.id)}
                className="flex w-full items-center gap-3 rounded-lg bg-[#1e1e22] px-3 py-2.5 transition-colors hover:bg-[#252529] focus:outline-none mb-1.5 border border-zinc-800/50"
              >
                <div className="relative shrink-0">
                  {(() => {
                    const onlineBio = parseBio(user.bio);
                    const onlineBorderId = onlineBio.profile_border || 'none';
                    const onlineBorder = PROFILE_BORDERS.find(b => b.id === onlineBorderId) || PROFILE_BORDERS[0];
                    return (
                      <img 
                        src={user.avatar_url} 
                        alt="Avatar" 
                        style={onlineBorder.avatarStyle}
                        className={`h-[34px] w-[34px] rounded-full object-cover border ${onlineBorderId === 'none' ? 'border-transparent' : 'border-transparent'}`} 
                      />
                    );
                  })()}
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#1e1e22] bg-emerald-500"></div>
                </div>
                <div className="flex flex-col items-start overflow-hidden w-full">
                  <div className="flex items-center gap-1.5 max-w-full">
                    <img src={getRank(user.email, user.id, user.rank).icon} alt={getRank(user.email, user.id, user.rank).name} className="h-4 object-contain" />
                    <span className="truncate text-[14px] font-bold text-zinc-200" style={{ color: user.id === currentUserProfile.id ? '#10b981' : '' }}>{user.username}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedProfileId && (
        <ProfileModal 
          profileId={selectedProfileId} 
          currentUserId={currentUserProfile.id}
          onClose={() => setSelectedProfileId(null)} 
          onProfileUpdate={(updated) => {
            onProfileUpdate(updated);
            setOnlineUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
            setMessages(prev => prev.map(m => m.user_id === updated.id ? { ...m, profiles: updated } : m));
          }}
        />
      )}

    </div>
  );
}

// Inline modal to keep things compact
function ProfileModal({ profileId, currentUserId, onClose, onProfileUpdate }: { profileId: string, currentUserId: string, onClose: () => void, onProfileUpdate: (p: Profile) => void }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [activeEditModal, setActiveEditModal] = useState<'info' | 'username' | 'bio' | 'mood' | 'music' | 'card_bg' | 'border' | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'bio'>('bio');
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSelf = profileId === currentUserId;
  const bioData: BioData = profile ? parseBio(profile.bio) : { text: '', mood: '', profile_music_type: '', profile_music_source: '', profile_card_bg: '', assigned_ranks: {} };

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
  }, [loading, profileId, musicType, musicSource]);

  const togglePlay = () => {
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
  const viewerBorder = PROFILE_BORDERS.find(b => b.id === viewerBorderId) || PROFILE_BORDERS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <style dangerouslySetInnerHTML={{ __html: BORDER_KEYFRAMES }} />
      <UserProfileFontsLoader bio={profile?.bio} />
      <div 
        style={viewerBorder.cardStyle}
        className={`w-full max-w-md overflow-hidden rounded-2xl bg-[#141416] border shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 ${viewerBorder.className || ''}`}
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
              style={bioData.profile_card_bg ? {
                backgroundImage: `url(${bioData.profile_card_bg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              } : undefined}
              className="flex-1 flex flex-col relative overflow-hidden"
            >
              {bioData.profile_card_bg && (
                <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-[1px] z-0 pointer-events-none" />
              )}
              
              <div className="relative z-10 flex flex-col h-full overflow-y-auto pb-4 custom-scrollbar">
                <div className="px-6 pb-4 relative shrink-0">
                  <div className="flex justify-between items-end">
                    <div 
                      style={viewerBorder.avatarStyle}
                      className={`relative group mt-4 mb-4 border-4 rounded-full h-24 w-24 bg-zinc-800 shrink-0 ${viewerBorderId === 'none' ? 'border-[#141416]' : 'border-transparent'}`}
                    >
                       <img src={profile!.avatar_url} alt="Avatar" className="h-full w-full rounded-full object-cover" />
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
                      <h3 className="text-xl font-bold text-white">{profile!.username}</h3>
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
                      <span className="text-[13px] font-bold text-zinc-300">{getRank(profile!.email, profile!.id, profile!.rank).name}</span>
                    </div>
                    {bioData.mood && (
                      <p className="text-sm mt-1 mb-1 text-emerald-400 font-medium">{bioData.mood}</p>
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

                    {ytVideoId && isPlaying && (
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
                    </div>

                    <div className="h-64 overflow-y-auto px-6 py-4 custom-scrollbar z-10 relative">
                      {activeTab === 'bio' ? (
                        <div className="text-sm text-zinc-300">
                          {bioData.text ? (
                            <Markdown remarkPlugins={[remarkGfm, remarkBreaks]} components={MarkdownComponents}>
                              {scrubContent(bioData.text)}
                            </Markdown>
                          ) : (
                            <p className="text-zinc-500">No bio provided yet.</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
                            <span className="text-zinc-400 text-sm">Last online</span>
                            <span className="text-zinc-200 text-sm">{profile!.updated_at ? format(new Date(profile!.updated_at), 'dd MMM yyyy, HH:mm') : 'Online Now'}</span>
                          </div>
                          <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
                            <span className="text-zinc-400 text-sm">Gender</span>
                            <span className="text-zinc-200 text-sm">{profile!.gender}</span>
                          </div>
                          <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
                            <span className="text-zinc-400 text-sm">Age</span>
                            <span className="text-zinc-200 text-sm">{profile!.age}</span>
                          </div>
                          <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
                            <span className="text-zinc-400 text-sm">Current Room</span>
                            <span className="text-emerald-500 font-medium text-sm">Main</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="px-6 pb-6 pt-2 z-10 relative">
                    <div className="flex flex-col gap-2">
                      <button onClick={() => setActiveEditModal('mood')} className="w-full py-2 bg-[#1e1e22] border border-zinc-800 hover:bg-[#252529] text-white rounded-lg text-sm font-medium transition-colors">Edit Mood</button>
                      <button onClick={() => setActiveEditModal('bio')} className="w-full py-2 bg-[#1e1e22] border border-zinc-800 hover:bg-[#252529] text-white rounded-lg text-sm font-medium transition-colors">Edit Bio</button>
                      <button onClick={() => setActiveEditModal('info')} className="w-full py-2 bg-[#1e1e22] border border-zinc-800 hover:bg-[#252529] text-white rounded-lg text-sm font-medium transition-colors">Edit Age & Gender</button>
                      <button onClick={() => setActiveEditModal('username')} className="w-full py-2 bg-[#1e1e22] border border-zinc-800 hover:bg-[#252529] text-white rounded-lg text-sm font-medium transition-colors">Edit Username</button>
                      <button onClick={() => setActiveEditModal('music')} className="w-full py-2 bg-[#1e1e22] border border-zinc-800 hover:bg-[#252529] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"><Music className="w-4 h-4 text-emerald-500" /> Edit Profile Music</button>
                      <button onClick={() => setActiveEditModal('card_bg')} className="w-full py-2 bg-[#1e1e22] border border-zinc-800 hover:bg-[#252529] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"><ImageIcon className="w-4 h-4 text-emerald-500" /> Edit Profile Card Background</button>
                      <button onClick={() => setActiveEditModal('border')} className="w-full py-2 bg-[#1e1e22] border border-zinc-800 hover:bg-[#252529] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Edit Profile Border</button>
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
      {activeEditModal === 'border' && (
        <ProfileBorderForm 
          profile={profile!} 
          bioData={bioData} 
          onClose={() => setActiveEditModal(null)} 
          onSave={(val: any) => {
            const newBio = stringifyBio({ 
              ...bioData, 
              profile_border: val.profile_border
            });
            updateProfileData({ bio: newBio });
          }} 
        />
      )}
    </div>
  );
}

function ProfileBorderForm({ profile, onClose, onSave, bioData }: any) {
  const [index, setIndex] = useState(() => {
    const currentId = bioData.profile_border || 'none';
    const foundIdx = PROFILE_BORDERS.findIndex(b => b.id === currentId);
    return foundIdx >= 0 ? foundIdx : 0;
  });
  const [showGrid, setShowGrid] = useState(false);

  const currentBorder = PROFILE_BORDERS[index];

  const handlePrev = () => {
    setIndex(prev => (prev - 1 + PROFILE_BORDERS.length) % PROFILE_BORDERS.length);
  };

  const handleNext = () => {
    setIndex(prev => (prev + 1) % PROFILE_BORDERS.length);
  };

  const handleSave = () => {
    onSave({ profile_border: currentBorder.id });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto select-none">
      <div className="w-full max-w-sm rounded-2xl bg-[#09090b] border border-zinc-800 p-6 flex flex-col gap-6 relative shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        
        {/* Header bar aligned with mockup */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white font-extrabold text-sm tracking-widest uppercase flex items-center gap-1.5">
              🎨 Profile Borders
            </span>
          </div>
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-full px-2.5 py-0.5 text-xs font-bold text-amber-400">
            <span>🪙</span>
            <span>1000</span>
          </div>
        </div>

        {/* Style selection indicator */}
        <div className="text-center">
          <span className="text-[10px] uppercase tracking-[0.25em] font-black text-zinc-500">STYLE {index + 1} OF {PROFILE_BORDERS.length}</span>
          <h4 className="text-sm font-bold text-emerald-400 mt-1">{currentBorder.name}</h4>
        </div>

        {/* Live Preview card exact mockup structure and wrapped in activeBorder styling! */}
        <div className="flex justify-center w-full">
          <div 
            style={currentBorder.cardStyle} 
            className={`w-full max-w-[270px] overflow-hidden rounded-2xl bg-[#141416] border shadow-2xl relative select-none shrink-0 transition-all duration-300 ${currentBorder.className || ''}`}
          >
            {/* Banner banner_url */}
            <div className="h-16 w-full relative shrink-0">
              <img src={profile.banner_url || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop'} alt="Banner" className="h-full w-full object-cover opacity-80" />
            </div>

            {/* Content card_bg container */}
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
                {/* Avatar with offset */}
                <div 
                  style={currentBorder.avatarStyle}
                  className={`mt-[-28px] border-4 rounded-full h-14 w-14 bg-zinc-800 relative z-20 shrink-0 overflow-hidden ${currentBorder.id === 'none' ? 'border-[#141416]' : 'border-transparent'}`}
                >
                  <img src={profile.avatar_url} alt="Avatar" className="h-full w-full rounded-full object-cover" />
                </div>

                {/* Nickname and verified badges */}
                <div className="text-center mt-1.5 w-full">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">💎 VIP</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-white leading-tight mt-1">{profile.username}</h3>
                  <span className="text-[8px] font-bold text-red-500 tracking-widest uppercase block mt-0.5 animate-pulse">Preview Mode</span>
                </div>

                {/* Simulated content info tab exact match to image mockup */}
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
                    <span>🎂 Language</span>
                    <span className="text-zinc-300 font-bold">English</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View Grid Overlay Drawer if open */}
        {showGrid && (
          <div className="absolute inset-x-0 bottom-0 bg-[#09090b] border-t border-zinc-800 rounded-t-2xl p-4 z-40 max-h-[80%] overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-zinc-800/80">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Available Borders Grid</span>
              <button onClick={() => setShowGrid(false)} className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider hover:text-emerald-300">Done</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PROFILE_BORDERS.map((border, bIdx) => (
                <button
                  key={border.id}
                  onClick={() => {
                    setIndex(bIdx);
                    setShowGrid(false);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-0.5 transition-all ${
                    index === bIdx 
                      ? 'bg-emerald-500/10 border-emerald-500 text-white' 
                      : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-[11px] font-bold truncate">{border.name}</span>
                  <span className="text-[9px] text-zinc-500 font-mono">Free</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation row mimicking exact layout of image */}
        <div className="flex items-center justify-between gap-3 shrink-0">
          <button 
            type="button" 
            onClick={handlePrev}
            className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800/80 hover:bg-zinc-800 flex items-center justify-center text-white active:scale-95 transition-all outline-none"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button 
            type="button" 
            onClick={() => setShowGrid(true)}
            className="flex-1 h-10 rounded-xl bg-[#141416] border border-zinc-800 hover:bg-zinc-800 hover:text-white flex items-center justify-center gap-1.5 text-zinc-400 text-[10px] font-bold tracking-wider uppercase active:scale-95 transition-all outline-none"
          >
            <Grid className="w-3.5 h-3.5 text-emerald-400" />
            <span>View Grid</span>
          </button>

          <button 
            type="button" 
            onClick={handleNext}
            className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800/80 hover:bg-zinc-800 flex items-center justify-center text-white active:scale-95 transition-all outline-none"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Action button row matching 'Next Style ➔' and '✓ Save' of image! */}
        <div className="flex items-center gap-2.5 shrink-0 border-t border-zinc-900 pt-3.5">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-2 text-[10px] font-bold text-zinc-400 hover:text-white text-center tracking-wide uppercase transition-colors"
          >
            Cancel
          </button>
          
          <button 
            type="button"
            onClick={handleNext}
            className="flex-1 py-2 rounded-full bg-zinc-900/60 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold text-[10px] tracking-wider uppercase transition-all flex items-center justify-center gap-1 active:scale-95"
          >
            <span>Next Style</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button 
            type="button"
            onClick={handleSave}
            className="flex-1 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] tracking-wider uppercase shadow-lg shadow-emerald-900/20 hover:shadow-emerald-950/30 active:scale-95 transition-all flex items-center justify-center gap-1 border border-emerald-500"
          >
            <Check className="w-3 h-3" />
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Super simple wrapper for sub-modals
function EditModal({ title, onClose, onSave, children }: any) {
  const [data, setData] = useState({});
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`w-full ${title === 'Edit Bio' ? 'max-w-lg md:max-w-xl' : 'max-w-sm'} rounded-xl bg-zinc-900 border border-zinc-700 p-6 transition-all`}>
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

  const addSpotify = () => {
    const url = prompt("Enter Spotify Track/Album/Playlist URL:");
    if (url) {
      insertText(`[Spotify](${url})`, '');
    }
  }

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
             const url = prompt("Enter URL (Only Spotify or direct image links allowed):"); 
             if(url) {
               if (isSafeUrl(url)) {
                 insertText(`[link text](${url})`); 
               } else {
                 alert("Blocked: Only Spotify links and direct image links are permitted.");
               }
             }
           }} className="w-7 h-7 flex items-center justify-center hover:bg-zinc-800 rounded text-zinc-300">
             <LinkIcon className="w-4 h-4" />
           </button>
           <button title="Spotify" type="button" onClick={addSpotify} className="w-7 h-7 flex items-center justify-center hover:bg-zinc-800 rounded text-emerald-500">
             <Music className="w-4 h-4" />
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

