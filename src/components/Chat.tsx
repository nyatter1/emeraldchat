import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, Message, News, ProfileLike } from '../types';
import { LogOut, Send, MoreVertical, X, Upload, Loader2, Link as LinkIcon, Image as ImageIcon, Music, List, ListOrdered, Quote, Minus, ShieldCheck, Menu, ThumbsUp, Heart, Laugh } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

const SPOTIFY_URL_REGEX = /https:\/\/open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)(\?.*)?/;
const IMAGE_EXT_REGEX = /\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i;
const FORBIDDEN_TLDS = /\.(online|site|indevs\.in)(\/.*)?$/i;

export const DEV_EMAILS = ['test@gmail.com', 'dev@gmail.com', 'haydensixseven@gmail.com'];
export const FOUNDER_EMAILS: string[] = []; // Add emails here
export const MOP_EMAILS: string[] = []; // Add emails here
export const SUPERADMIN_EMAILS: string[] = [];
export const ADMIN_EMAILS: string[] = [];
export const MOD_EMAILS: string[] = [];

export const RANK_ORDER = ['Developer', 'Founder', 'MoP', 'SuperAdmin', 'Admin', 'Mod', 'VIP'];

export function getRank(email?: string | null) {
  const e = email || '';
  if (DEV_EMAILS.includes(e)) {
    return { name: 'Developer', icon: 'https://raw.githubusercontent.com/nyatter1/ranks/main/verified.gif', level: 0 };
  }
  if (FOUNDER_EMAILS.includes(e)) {
    return { name: 'Founder', icon: 'https://raw.githubusercontent.com/nyatter1/ranks/main/founder.gif', level: 1 };
  }
  if (MOP_EMAILS.includes(e)) {
    return { name: 'MoP', icon: 'https://raw.githubusercontent.com/nyatter1/ranks/main/MoP.gif', level: 2 };
  }
  if (SUPERADMIN_EMAILS.includes(e)) {
    return { name: 'SuperAdmin', icon: 'https://raw.githubusercontent.com/nyatter1/ranks/main/superadmin.png', level: 3 };
  }
  if (ADMIN_EMAILS.includes(e)) {
    return { name: 'Admin', icon: 'https://raw.githubusercontent.com/nyatter1/ranks/main/admin.png', level: 4 };
  }
  if (MOD_EMAILS.includes(e)) {
    return { name: 'Mod', icon: 'https://raw.githubusercontent.com/nyatter1/ranks/main/mod.png', level: 5 };
  }
  return { name: 'VIP', icon: 'https://raw.githubusercontent.com/nyatter1/ranks/main/vip.gif', level: 6 };
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
      return <a href={href} target="_blank" rel="noreferrer" className="text-emerald-500 hover:underline break-all" {...props}>{children}</a>;
    }

    // Block other domains
    return <span className="text-zinc-500 line-through decoration-zinc-700 cursor-not-allowed" title="Link blocked for security">{children}</span>;
  },
  img: ({ src, alt }: any) => <img src={src} alt={alt} className="max-w-full rounded-lg my-2 border border-zinc-800" loading="lazy" />,
  p: ({ children }: any) => <div className="mb-2 last:mb-0 leading-relaxed text-zinc-300 break-words">{children}</div>,
  strong: ({ children }: any) => <strong className="font-bold text-zinc-100">{children}</strong>,
  em: ({ children }: any) => <em className="italic text-zinc-400">{children}</em>,
  h1: ({ children }: any) => <h1 className="text-xl font-bold text-white mt-4 mb-2">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-lg font-bold text-white mt-3 mb-2">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-base font-bold text-white mt-2 mb-1">{children}</h3>,
  ul: ({ children }: any) => <ul className="list-disc list-inside mb-3 space-y-1 text-zinc-300">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal list-inside mb-3 space-y-1 text-zinc-300">{children}</ol>,
  li: ({ children }: any) => <li className="text-sm">{children}</li>,
  blockquote: ({ children }: any) => <blockquote className="border-l-4 border-emerald-500/50 bg-emerald-500/5 pl-4 py-2 my-3 rounded-r-lg italic text-zinc-400">{children}</blockquote>,
  hr: () => <hr className="border-zinc-800 my-4" />,
  code: ({ inline, children }: any) => inline ? <code className="bg-zinc-800/50 text-emerald-400 px-1 py-0.5 rounded text-sm font-mono">{children}</code> : <code className="block bg-zinc-900 border border-zinc-800 text-zinc-300 p-3 rounded-lg text-sm font-mono my-2 overflow-x-auto whitespace-pre-wrap">{children}</code>
};

export interface BioData {
  text: string;
  mood: string;
}

export function parseBio(bioStr: string | null | undefined): BioData {
  if (!bioStr) return { text: '', mood: '' };
  try {
    const data = JSON.parse(bioStr);
    if (data.text !== undefined && data.mood !== undefined) {
      return data;
    }
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
       {isDev && (
         <button onClick={() => handleDeleteNews(news.id)} className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Delete News">
           <X className="w-5 h-5"/>
         </button>
       )}
       <div className="flex items-center gap-3 pr-8">
         <img src={news.profiles?.avatar_url} className="w-10 h-10 rounded-full object-cover border border-zinc-700" alt="" />
         <div className="flex flex-col">
           <div className="flex items-center gap-1.5">
             <img src={getRank(news.profiles?.email).icon} alt={getRank(news.profiles?.email).name} className="h-4 object-contain" />
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
                 <div key={comment.id} className="flex gap-2.5">
                   <img src={comment.profiles?.avatar_url} className="w-7 h-7 rounded-full object-cover border border-zinc-700 shrink-0" alt="" />
                   <div className="flex flex-col bg-[#1e1e22] rounded-2xl px-3 py-2 w-fit max-w-[90%]">
                     <span className="flex items-center gap-1.5 text-[13px] font-bold text-zinc-200 leading-tight mb-0.5">
                       <img src={getRank(comment.profiles?.email).icon} alt={getRank(comment.profiles?.email).name} className="h-3.5 object-contain" />
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioNewMsg = useRef<HTMLAudioElement | null>(null);
  const audioQuote = useRef<HTMLAudioElement | null>(null);
  const audioNewNews = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioNewMsg.current = new Audio('/new_messages.mp3');
    audioQuote.current = new Audio('/quote.mp3');
    audioNewNews.current = new Audio('/new_news.mp3');
  }, []);

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
          profiles ( id, username, avatar_url, banner_url, age, gender, bio, email )
        `)
        .order('created_at', { ascending: true })
        .limit(100);

      if (!error && data) {
        setMessages(data as any);
      }
    };

    fetchMessages();

    // Initial fetch of news
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          profiles ( id, username, avatar_url, banner_url, age, gender, bio, email ),
          news_likes ( id, news_id, user_id, created_at ),
          news_reactions ( id, news_id, user_id, reaction, created_at ),
          news_comments ( id, news_id, user_id, content, created_at, profiles ( id, username, avatar_url, email ) )
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
              audioQuote.current?.play().catch(() => {});
            } else {
              audioNewMsg.current?.play().catch(() => {});
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
        audioNewNews.current?.play().catch(() => {});
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
          const rankA = getRank(a.email).level;
          const rankB = getRank(b.email).level;
          const isA_Bot = a.id === TEST_BOT.id;
          const isB_Bot = b.id === TEST_BOT.id;

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
          .select(`*, profiles ( id, username, avatar_url, banner_url, age, gender, bio, email )`)
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
            {messages.map((msg, index) => {
              return (
                <div 
                  key={msg.id || index} 
                  className={`flex flex-col group py-1.5 hover:bg-zinc-900/50 transition-colors -mx-4 px-4 rounded-lg ${
                    msg.content.toLowerCase().includes(currentUserProfile.username.toLowerCase()) && msg.user_id !== currentUserProfile.id 
                    ? 'bg-emerald-500/5 border-l-2 border-emerald-500' 
                    : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img 
                      src={msg.profiles?.avatar_url || 'https://api.dicebear.com/7.x/identicon/svg?seed=default'} 
                      alt="Avatar" 
                      className="h-[42px] w-[42px] rounded-md object-cover shrink-0 mt-0.5 border border-zinc-800 cursor-pointer"
                      onClick={() => setSelectedProfileId(msg.user_id)}
                    />
                    <div className="flex flex-col w-full">
                      <div className="flex items-baseline justify-between mb-0.5">
                        <div className="flex items-center gap-2 leading-none">
                          <img src={getRank(msg.profiles?.email).icon} alt={getRank(msg.profiles?.email).name} className="h-4 object-contain" />
                          <span className="font-bold text-[15px] hover:underline cursor-pointer" onClick={() => setSelectedProfileId(msg.user_id)} style={{ color: msg.user_id === currentUserProfile.id ? '#10b981' : 'white' }}>{msg.profiles?.username || 'Unknown'}</span>
                          <span className="text-xs text-zinc-500">{format(new Date(msg.created_at), 'dd/MM HH:mm')}</span>
                        </div>
                      </div>
                      <div className="text-zinc-200 text-[15px] leading-relaxed break-words relative pr-12">
                        <Markdown remarkPlugins={[remarkGfm, remarkBreaks]} components={MarkdownComponents}>
                          {scrubContent(msg.content)}
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
        <div className="px-4 py-4">
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Online — {onlineUsers.length}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4 custom-scrollbar">
          <div className="space-y-1">
            {onlineUsers.map(user => (
              <button
                key={user.id}
                onClick={() => setSelectedProfileId(user.id)}
                className="flex w-full items-center gap-3 rounded-lg bg-[#1e1e22] px-3 py-2.5 transition-colors hover:bg-[#252529] focus:outline-none mb-1.5 border border-zinc-800/50"
              >
                <div className="relative shrink-0">
                  <img src={user.avatar_url} alt="Avatar" className="h-[34px] w-[34px] rounded-full object-cover" />
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#1e1e22] bg-emerald-500"></div>
                </div>
                <div className="flex flex-col items-start overflow-hidden w-full">
                  <div className="flex items-center gap-1.5 max-w-full">
                    <img src={getRank(user.email).icon} alt={getRank(user.email).name} className="h-4 object-contain" />
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
  const [activeEditModal, setActiveEditModal] = useState<'info' | 'username' | 'bio' | 'mood' | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'bio'>('bio');
  
  const isSelf = profileId === currentUserId;
  const bioData = profile ? parseBio(profile.bio) : { text: '', mood: '' };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-[#141416] border border-zinc-800 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
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
            
            <div className="px-6 pb-4 relative shrink-0">
              <div className="flex justify-between items-end">
                <div className="relative group -mt-12 mb-4 border-4 border-[#141416] rounded-full h-24 w-24 bg-zinc-800">
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
                  <img src={getRank(profile!.email).icon} alt={getRank(profile!.email).name} className="h-4 object-contain" />
                  <span className="text-[13px] font-bold text-zinc-300">{getRank(profile!.email).name}</span>
                </div>
                {bioData.mood && (
                  <p className="text-sm mt-1 mb-1 text-emerald-400 font-medium">{bioData.mood}</p>
                )}
              </div>
            </div>

            {!editMode ? (
              <div className="flex flex-col flex-1 pb-4 shadow-inner">
                <div className="flex gap-6 border-b border-zinc-800 px-6 shrink-0 h-10">
                  <button onClick={() => setActiveTab('bio')} className={`pb-1 flex items-center border-b-2 font-medium transition-colors text-sm ${activeTab === 'bio' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}>About Me</button>
                  <button onClick={() => setActiveTab('info')} className={`pb-1 flex items-center border-b-2 font-medium transition-colors text-sm ${activeTab === 'info' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}>Info</button>
                </div>

                <div className="h-64 overflow-y-auto px-6 py-4 custom-scrollbar">
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
              <div className="px-6 pb-6 pt-2">
                <div className="flex flex-col gap-2">
                  <button onClick={() => setActiveEditModal('mood')} className="w-full py-2 bg-[#1e1e22] border border-zinc-800 hover:bg-[#252529] text-white rounded-lg text-sm font-medium transition-colors">Edit Mood</button>
                  <button onClick={() => setActiveEditModal('bio')} className="w-full py-2 bg-[#1e1e22] border border-zinc-800 hover:bg-[#252529] text-white rounded-lg text-sm font-medium transition-colors">Edit Bio</button>
                  <button onClick={() => setActiveEditModal('info')} className="w-full py-2 bg-[#1e1e22] border border-zinc-800 hover:bg-[#252529] text-white rounded-lg text-sm font-medium transition-colors">Edit Age & Gender</button>
                  <button onClick={() => setActiveEditModal('username')} className="w-full py-2 bg-[#1e1e22] border border-zinc-800 hover:bg-[#252529] text-white rounded-lg text-sm font-medium transition-colors">Edit Username</button>
                </div>
              </div>
            )}
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
          const newBio = stringifyBio({ ...bioData, text: val.bio });
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
    </div>
  );
}

// Super simple wrapper for sub-modals
function EditModal({ title, onClose, onSave, children }: any) {
  const [data, setData] = useState({});
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-xl bg-zinc-900 border border-zinc-700 p-6">
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { 
    const bioData = parseBio(profile.bio);
    setData({ bio: bioData.text });
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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
         <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Edit Bio</label>
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
      <textarea ref={textareaRef} rows={8} value={data.bio ?? ''} onChange={e => setData({...data, bio: e.target.value})} className="w-full bg-[#1e1e22] border border-zinc-800 rounded-md px-3 py-2 text-white resize-none font-mono text-sm leading-relaxed custom-scrollbar focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none" placeholder="Type *bold*, _italic_, or Spotify links here..." />
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

