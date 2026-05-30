import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, Message } from '../types';
import { LogOut, Send, MoreVertical, X, Upload, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

const SPOTIFY_URL_REGEX = /https:\/\/open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)(\?.*)?/;

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
    if (href && SPOTIFY_URL_REGEX.test(href)) {
      return (
        <div className="flex flex-col gap-1 w-full max-w-sm">
          <a href={href} target="_blank" rel="noreferrer" className="text-emerald-500 hover:underline break-all">{children}</a>
          <SpotifyEmbed url={href} />
        </div>
      );
    }
    return <a href={href} target="_blank" rel="noreferrer" className="text-emerald-500 hover:underline break-all" {...props}>{children}</a>;
  },
  img: ({ src, alt }: any) => <img src={src} alt={alt} className="max-w-full rounded-lg my-2 border border-zinc-800" loading="lazy" />,
  p: ({ children }: any) => <p className="mb-2 last:mb-0 leading-relaxed text-zinc-300 break-words">{children}</p>,
  strong: ({ children }: any) => <strong className="font-bold text-zinc-100">{children}</strong>,
  em: ({ children }: any) => <em className="italic text-zinc-400">{children}</em>,
  h1: ({ children }: any) => <h1 className="text-xl font-bold text-white mt-4 mb-2">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-lg font-bold text-white mt-3 mb-2">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-base font-bold text-white mt-2 mb-1">{children}</h3>,
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

export function Chat({ currentUserProfile, onSignOut, onProfileUpdate }: { currentUserProfile: Profile, onSignOut: () => void, onProfileUpdate: (p: Profile) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    // Subscribe to new messages
    const messageSubscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
        // Fetch the user profile for the new message to append properly
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', payload.new.user_id).single();
        if (profileData) {
         setMessages(prev => {
           if (prev.some(m => m.id === payload.new.id)) return prev;
           return [...prev, { ...payload.new, profiles: profileData } as any];
         });
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
        const uniqueUsers = Array.from(new Map(users.map(u => [u.id, u])).values());
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
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      
      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-4">
          <h1 className="text-lg font-bold tracking-tight text-emerald-500">Emerald Chat</h1>
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
                <div key={msg.id || index} className="flex flex-col group py-1 hover:bg-zinc-900/50 transition-colors -mx-4 px-4 rounded-lg">
                  <div className="flex items-start gap-3 cursor-pointer" onClick={() => setSelectedProfileId(msg.user_id)}>
                    <img 
                      src={msg.profiles?.avatar_url || 'https://api.dicebear.com/7.x/identicon/svg?seed=default'} 
                      alt="Avatar" 
                      className="h-[42px] w-[42px] rounded-md object-cover shrink-0 mt-0.5 border border-zinc-800"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-2 leading-none mb-1">
                        <span className="font-bold text-[15px] hover:underline" style={{ color: msg.user_id === currentUserProfile.id ? '#10b981' : 'white' }}>{msg.profiles?.username || 'Unknown'}</span>
                        <span className="text-xs text-zinc-500">{format(new Date(msg.created_at), 'dd/MM HH:mm')}</span>
                      </div>
                      <div className="text-zinc-200 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                        {msg.content}
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

      {/* Sidebar */}
      <div className="hidden w-[280px] flex-col border-l border-zinc-800 bg-[#141416] lg:flex">
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
                  <span className="max-w-full truncate text-[14px] font-bold text-zinc-200" style={{ color: user.id === currentUserProfile.id ? '#10b981' : '' }}>{user.username}</span>
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
      const { data } = await supabase.from('profiles').select('*').eq('id', profileId).single();
      setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, [profileId]);

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
                <h3 className="text-xl font-bold text-white">{profile!.username}</h3>
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
                          {bioData.text}
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
  useEffect(() => { 
    const bioData = parseBio(profile.bio);
    setData({ bio: bioData.text });
  }, []);
  return (
    <div>
      <label className="text-xs text-zinc-400 mb-1 block">Bio (Supports Markdown)</label>
      <textarea rows={10} value={data.bio ?? ''} onChange={e => setData({...data, bio: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white resize-none font-mono text-sm leading-relaxed custom-scrollbar" placeholder="Type *bold*, _italic_, or Spotify links here..." />
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

