import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { 
  X, ShieldCheck, Plus, Trash2, Upload, Coins, Paintbrush, Icon,
  Eye, Settings, Search, Users, Ban, VolumeX, Clock, Sparkles, 
  Layers, Globe, Wallet, Music, Heart, Gem, Power, RefreshCw
} from 'lucide-react';
import { Profile } from '../types';

interface CustomRankItem {
  id: string;
  name: string;
  color: string;
  is_staff: boolean;
  can_delete_messages: boolean;
  can_ban_users: boolean;
  created_at?: string;
}

interface CustomAddonObj {
  id: string;
  name: string;
  icon: string;
  code: string;
  enabled: boolean;
}

export function AdminPanel({ currentUserProfile, onClose }: { currentUserProfile: Profile, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'ranks' | 'moderation' | 'addons'>('moderation');
  
  // Shared remote bio state from test@gmail.com
  const [globalBio, setGlobalBio] = useState<any>({});
  
  // Ranks tab state
  const [ranks, setRanks] = useState<CustomRankItem[]>([]);
  const [rankName, setRankName] = useState('');
  const [rankColor, setRankColor] = useState('#ffffff');
  const [isStaff, setIsStaff] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [canBan, setCanBan] = useState(false);

  // Moderation tab state
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  // Quick mute/kick form states
  const [muteMins, setMuteMins] = useState<number>(10);
  const [muteReason, setMuteReason] = useState<string>('Spamming in public chat');
  const [kickMins, setKickMins] = useState<number>(5);
  const [kickReasonInput, setKickReasonInput] = useState<string>('Inappropriate behavior');
  const [banReasonInput, setBanReasonInput] = useState<string>('Severe terms of service violations');

  // Addons tab states
  const [newAddonId, setNewAddonId] = useState('');
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonIcon, setNewAddonIcon] = useState('Sparkles');
  const [newAddonCode, setNewAddonCode] = useState(
`<div class="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md mx-auto text-center space-y-4 shadow-red-500/10 shadow-lg">
  <div class="text-3xl">🎰</div>
  <h3 class="text-lg font-bold text-emerald-400">Lucky Fortune Spin</h3>
  <p class="text-xs text-zinc-400">Test your fortune with this simple sandboxed mini-game!</p>
  <div id="fortune-output" class="text-lg font-bold text-white px-4 py-2 border border-zinc-800 bg-black/50 rounded-lg">Click spin!</div>
  <button onclick="spinFortune()" class="px-4 py-1.5 text-xs font-bold text-black bg-emerald-400 rounded-lg hover:bg-emerald-300 transition-all font-sans">Spin Fortune</button>
  <script>
    function spinFortune() {
      const out = document.getElementById('fortune-output');
      out.innerText = '🌀 Spinning...';
      setTimeout(() => {
        const values = ['👑 Golden Fortune', '💎 Triple Gems Found!', '👾 Rare Bot Companion', '🍀 Standard Good Luck', '❌ Empty Spindle'];
        const chosen = values[Math.floor(Math.random() * values.length)];
        out.innerText = chosen;
      }, 500);
    }
  </script>
</div>`
  );

  useEffect(() => {
    fetchRanks();
    fetchProfiles();
    fetchGlobalBio();
  }, []);

  const fetchGlobalBio = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('email', 'test@gmail.com').single();
    if (data && data.bio) {
      try {
        const parsed = JSON.parse(data.bio);
        setGlobalBio(parsed);
      } catch (e) {
        setGlobalBio({});
      }
    }
  };

  const saveGlobalStateObj = async (updatedFields: any) => {
    try {
      const { data: testProfile } = await supabase.from('profiles').select('*').eq('email', 'test@gmail.com').single();
      if (testProfile) {
        let currentBioParsed = {};
        try {
          currentBioParsed = JSON.parse(testProfile.bio || '{}');
        } catch (e) {
          currentBioParsed = {};
        }

        const nextBio = { ...currentBioParsed, ...updatedFields };
        setGlobalBio(nextBio);
        
        await supabase
          .from('profiles')
          .update({ bio: JSON.stringify(nextBio) })
          .eq('id', testProfile.id);
      }
    } catch (err) {
      toast.error('Central database sync failed');
    }
  };

  const fetchRanks = async () => {
    const { data } = await supabase.from('custom_ranks').select('*').order('created_at', { ascending: true });
    if (data) setRanks(data);
  };

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*').order('username', { ascending: true });
    if (data) setProfiles(data);
  };

  const createRank = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('custom_ranks').insert({
      name: rankName,
      color: rankColor,
      is_staff: isStaff,
      can_delete_messages: canDelete,
      can_ban_users: canBan
    });
    if (error) { toast.error(error.message); return; }
    toast.success('Rank created!');
    setRankName('');
    fetchRanks();
  };

  const handleDeleteRank = async (rankId: string) => {
    const { error } = await supabase.from('custom_ranks').delete().eq('id', rankId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Rank deleted successfully');
      fetchRanks();
    }
  };

  const filteredProfiles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return profiles.filter(p => {
      return (p.username || '').toLowerCase().includes(q) || (p.email || '').toLowerCase().includes(q);
    });
  }, [profiles, searchQuery]);

  // Statistics summaries
  const stats = useMemo(() => {
    const total = profiles.length;
    const banned = globalBio.banned_users?.length || 0;
    const muted = globalBio.muted_users?.length || 0;
    
    let activeKicks = 0;
    const kickExpires = globalBio.kicked_expires || {};
    const now = new Date();
    Object.keys(kickExpires).forEach(userId => {
      if (new Date(kickExpires[userId]) > now) {
        activeKicks++;
      }
    });

    return { total, banned, muted, activeKicks };
  }, [profiles, globalBio]);

  // Mute operational action triggers
  const handleApplyMute = async () => {
    if (!selectedUser) return;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + muteMins * 60 * 1000);
    
    const nextMutedList = [...(globalBio.muted_users || [])];
    if (!nextMutedList.includes(selectedUser.id)) {
      nextMutedList.push(selectedUser.id);
    }
    
    const nextMutedExpires = { ...(globalBio.muted_expires || {}) };
    nextMutedExpires[selectedUser.id] = expiresAt.toISOString();

    const nextMutedReasons = { ...(globalBio.muted_reasons || {}) };
    nextMutedReasons[selectedUser.id] = muteReason;

    await saveGlobalStateObj({
      muted_users: nextMutedList,
      muted_expires: nextMutedExpires,
      muted_reasons: nextMutedReasons
    });
    toast.success(`Muted ${selectedUser.username} for ${muteMins} minutes.`);
    fetchGlobalBio();
  };

  const handleRevokeMute = async () => {
    if (!selectedUser) return;
    
    const nextMutedList = (globalBio.muted_users || []).filter((id: string) => id !== selectedUser.id);
    
    const nextMutedExpires = { ...(globalBio.muted_expires || {}) };
    delete nextMutedExpires[selectedUser.id];

    const nextMutedReasons = { ...(globalBio.muted_reasons || {}) };
    delete nextMutedReasons[selectedUser.id];

    await saveGlobalStateObj({
      muted_users: nextMutedList,
      muted_expires: nextMutedExpires,
      muted_reasons: nextMutedReasons
    });
    toast.success(`Revoked mute for ${selectedUser.username}`);
    fetchGlobalBio();
  };

  // Kick operational action triggers
  const handleApplyKick = async () => {
    if (!selectedUser) return;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + kickMins * 60 * 1000);

    const nextKickedExpires = { ...(globalBio.kicked_expires || {}) };
    nextKickedExpires[selectedUser.id] = expiresAt.toISOString();

    const nextKickedDuration = { ...(globalBio.kicked_duration || {}) };
    nextKickedDuration[selectedUser.id] = kickMins;

    const nextKickedReasons = { ...(globalBio.kicked_reasons || {}) };
    nextKickedReasons[selectedUser.id] = kickReasonInput;

    await saveGlobalStateObj({
      kicked_expires: nextKickedExpires,
      kicked_duration: nextKickedDuration,
      kicked_reasons: nextKickedReasons
    });
    toast.success(`Kicked ${selectedUser.username} with duration of ${kickMins} minutes.`);
    fetchGlobalBio();
  };

  const handleRevokeKick = async () => {
    if (!selectedUser) return;

    const nextKickedExpires = { ...(globalBio.kicked_expires || {}) };
    delete nextKickedExpires[selectedUser.id];

    const nextKickedDuration = { ...(globalBio.kicked_duration || {}) };
    delete nextKickedDuration[selectedUser.id];

    const nextKickedReasons = { ...(globalBio.kicked_reasons || {}) };
    delete nextKickedReasons[selectedUser.id];

    await saveGlobalStateObj({
      kicked_expires: nextKickedExpires,
      kicked_duration: nextKickedDuration,
      kicked_reasons: nextKickedReasons
    });
    toast.success(`Revoked kick timer for ${selectedUser.username}`);
    fetchGlobalBio();
  };

  // Ban operational action triggers
  const handleApplyBan = async () => {
    if (!selectedUser) return;
    
    const nextBannedList = [...(globalBio.banned_users || [])];
    if (!nextBannedList.includes(selectedUser.id)) {
      nextBannedList.push(selectedUser.id);
    }

    const nextBannedReasons = { ...(globalBio.banned_reasons || {}) };
    nextBannedReasons[selectedUser.id] = banReasonInput;

    await saveGlobalStateObj({
      banned_users: nextBannedList,
      banned_reasons: nextBannedReasons
    });
    toast.success(`Permanently banned ${selectedUser.username}`);
    fetchGlobalBio();
  };

  const handleRevokeBan = async () => {
    if (!selectedUser) return;

    const nextBannedList = (globalBio.banned_users || []).filter((id: string) => id !== selectedUser.id);

    const nextBannedReasons = { ...(globalBio.banned_reasons || {}) };
    delete nextBannedReasons[selectedUser.id];

    await saveGlobalStateObj({
      banned_users: nextBannedList,
      banned_reasons: nextBannedReasons
    });
    toast.success(`Ban revoked for ${selectedUser.username}`);
    fetchGlobalBio();
  };

  // First party addons management
  const isAddonDisabled = (addonId: string) => {
    return (globalBio.addons_disabled || []).includes(addonId);
  };

  const handleToggleAddon = async (addonId: string) => {
    const nextDisabled = [...(globalBio.addons_disabled || [])];
    if (nextDisabled.includes(addonId)) {
      const updated = nextDisabled.filter(x => x !== addonId);
      await saveGlobalStateObj({ addons_disabled: updated });
    } else {
      nextDisabled.push(addonId);
      await saveGlobalStateObj({ addons_disabled: nextDisabled });
    }
    toast.success(`Addons settings changed for "${addonId}"`);
    fetchGlobalBio();
  };

  // Import dynamic custom addons
  const handleImportAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddonId.trim() || !newAddonName.trim() || !newAddonCode.trim()) {
      toast.error('Please fill in all addon specifications');
      return;
    }

    const nextCustomList = [...(globalBio.addons_custom || [])];
    const existingIndex = nextCustomList.findIndex(x => x.id === newAddonId);

    const newAddonItem: CustomAddonObj = {
      id: newAddonId.trim().toLowerCase().replace(/\s+/g, '-'),
      name: newAddonName.trim(),
      icon: newAddonIcon,
      code: newAddonCode,
      enabled: true
    };

    if (existingIndex > -1) {
      nextCustomList[existingIndex] = newAddonItem;
    } else {
      nextCustomList.push(newAddonItem);
    }

    await saveGlobalStateObj({
      addons_custom: nextCustomList,
      addons_updated_at: new Date().toISOString()
    });

    toast.success(`Addon "${newAddonName}" successfully imported! System reloading databases...`);
    setNewAddonId('');
    setNewAddonName('');
    fetchGlobalBio();
  };

  const handleToggleCustomAddon = async (id: string) => {
    const nextCustomList = (globalBio.addons_custom || []).map((x: any) => {
      if (x.id === id) {
        return { ...x, enabled: x.enabled === false ? true : false };
      }
      return x;
    });

    await saveGlobalStateObj({
      addons_custom: nextCustomList,
      addons_updated_at: new Date().toISOString()
    });
    toast.success('Configuration updated. reloading site interfaces...');
    fetchGlobalBio();
  };

  const handleDeleteCustomAddon = async (id: string) => {
    const nextCustomList = (globalBio.addons_custom || []).filter((x: any) => x.id !== id);
    await saveGlobalStateObj({
      addons_custom: nextCustomList,
      addons_updated_at: new Date().toISOString()
    });
    toast.success('Addon deleted. updating registers...');
    fetchGlobalBio();
  };

  // Check state of the selected user
  const userStatus = useMemo(() => {
    if (!selectedUser) return null;
    const id = selectedUser.id;
    
    const isBanned = (globalBio.banned_users || []).includes(id);
    
    const muteExpiry = globalBio.muted_expires?.[id];
    const isMuted = muteExpiry && new Date(muteExpiry) > new Date();
    
    const kickExpiry = globalBio.kicked_expires?.[id];
    const isKicked = kickExpiry && new Date(kickExpiry) > new Date();

    return { isBanned, isMuted, isKicked, muteExpiry, kickExpiry };
  }, [selectedUser, globalBio]);

  return (
    <div className="fixed inset-0 bg-black/80 z-[200] flex justify-center items-center p-4 backdrop-blur-sm select-none">
      <div className="bg-[#0c0c0e] w-full max-w-6xl h-[90vh] rounded-2xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header bar */}
        <div className="p-5 border-b border-zinc-900 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/10 p-2 text-red-500 rounded-xl border border-red-500/20">
              <ShieldCheck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-white text-base font-black tracking-tight uppercase">Global Administrator Command Room</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Emerald Vault Security Enforcement System</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-zinc-500 hover:text-white bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-850 text-xs font-bold transition-all"
          >
            Terminal logout
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-zinc-900 bg-zinc-950/40">
          <button 
            onClick={() => setActiveTab('moderation')} 
            className={`flex-1 py-3.5 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'moderation' ? 'bg-red-500/10 text-red-400 border-b-2 border-red-500' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            🛡️ Safe Chat Moderation
          </button>
          <button 
            onClick={() => setActiveTab('ranks')} 
            className={`flex-1 py-3.5 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'ranks' ? 'bg-indigo-500/10 text-indigo-400 border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            ⭐ Authority & Ranks
          </button>
          <button 
            onClick={() => setActiveTab('addons')} 
            className={`flex-1 py-3.5 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'addons' ? 'bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            🧩 Dynamic Addon Workspace
          </button>
        </div>

        {/* Workspace Panels */}
        <div className="flex-1 overflow-hidden p-6 bg-zinc-950/20">
          
          {/* SEC 1: MODERATION WORKSPACE */}
          {activeTab === 'moderation' && (
            <div className="h-full flex flex-col gap-6">
              
              {/* Stats Overview */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Registered Accounts</p>
                    <p className="text-xl font-black text-white mt-1">{stats.total}</p>
                  </div>
                  <Users className="w-8 h-8 text-indigo-500 opacity-60" />
                </div>
                <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Banned Pool</p>
                    <p className="text-xl font-black text-red-500 mt-1">{stats.banned}</p>
                  </div>
                  <Ban className="w-8 h-8 text-red-500 opacity-60" />
                </div>
                <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Muted Users</p>
                    <p className="text-xl font-black text-amber-500 mt-1">{stats.muted}</p>
                  </div>
                  <VolumeX className="w-8 h-8 text-amber-500 opacity-60" />
                </div>
                <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Kicked Pool</p>
                    <p className="text-xl font-black text-orange-400 mt-1">{stats.activeKicks}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-400 opacity-60" />
                </div>
              </div>

              {/* Core moderation workflow split area */}
              <div className="flex-1 min-h-0 grid grid-cols-12 gap-6">
                
                {/* Search & Left listing */}
                <div className="col-span-5 bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex flex-col min-h-0">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
                    <input 
                      type="text" 
                      placeholder="Filter accounts by email or username..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-[#141416] border border-zinc-900 hover:border-zinc-850 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white outline-none focus:border-red-500 transition-colors"
                    />
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-1.5 custom-scrollbar">
                    {filteredProfiles.length === 0 ? (
                      <div className="py-12 text-center text-xs text-zinc-600">No matching user accounts recorded.</div>
                    ) : filteredProfiles.map(p => {
                      const isBnd = (globalBio.banned_users || []).includes(p.id);
                      
                      const mutExp = globalBio.muted_expires?.[p.id];
                      const isMut = mutExp && new Date(mutExp) > new Date();
                      
                      const kckExp = globalBio.kicked_expires?.[p.id];
                      const isKck = kckExp && new Date(kckExp) > new Date();

                      return (
                        <div 
                          key={p.id}
                          onClick={() => setSelectedUser(p)}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${selectedUser?.id === p.id ? 'bg-red-500/10 border-red-500/40 shadow-md' : 'bg-zinc-900/30 border-zinc-900/80 hover:bg-zinc-900/60 hover:border-zinc-850'}`}
                        >
                          <div className="flex items-center gap-3">
                            <img src={p.avatar_url || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + p.id} className="w-8 h-8 rounded-full border border-zinc-800" />
                            <div>
                              <div className="text-xs font-bold text-white">{p.username || 'Anonymous'}</div>
                              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{p.email}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isBnd && <span className="bg-red-950 border border-red-800 text-red-400 text-[10px] px-2 py-0.5 rounded font-black font-mono">BANNED</span>}
                            {!isBnd && isKck && <span className="bg-amber-950 border border-amber-800 text-amber-400 text-[10px] px-2 py-0.5 rounded font-black font-mono">KICKED</span>}
                            {!isBnd && isMut && <span className="bg-orange-950 border border-orange-850 text-orange-400 text-[10px] px-2 py-0.5 rounded font-black font-mono">MUTED</span>}
                            {!isBnd && !isKck && !isMut && <span className="bg-emerald-950 border border-emerald-900 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-black font-mono">NORMAL</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Moderate parameters command board */}
                <div className="col-span-7 bg-zinc-950 border border-zinc-900 rounded-xl p-5 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
                  {!selectedUser ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                      <div className="p-4 rounded-full bg-zinc-900 border border-zinc-850">
                        <Users className="w-8 h-8 text-zinc-650" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-300">Administrative Actions Lockdoor</h3>
                        <p className="text-xs text-zinc-500 max-w-sm mt-1">Please select any registered account from the list viewport to regulate, mute, kick, or ban restrictions.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      
                      {/* Active profile header */}
                      <div className="flex items-start justify-between border-b border-zinc-900 pb-4">
                        <div className="flex items-center gap-3">
                          <img src={selectedUser.avatar_url || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + selectedUser.id} className="w-12 h-12 rounded-xl border border-zinc-800" />
                          <div>
                            <h2 className="text-white font-extrabold text-sm">{selectedUser.username || 'Anonymous'}</h2>
                            <p className="text-zinc-500 text-[10px] font-mono mt-0.5">UID: {selectedUser.id}</p>
                            <p className="text-zinc-500 text-[10px] font-mono">EMAIL: {selectedUser.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-mono tracking-wider font-black text-indigo-400 bg-indigo-950 border border-indigo-900 px-2 py-1 rounded">
                            {selectedUser.rank || 'Member'}
                          </span>
                        </div>
                      </div>

                      {/* MUTING OPERATIONS PANEL */}
                      <div className="border border-zinc-900 bg-[#0f0f11]/80 rounded-xl p-4 space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-900/60 pb-2">
                          <div className="flex items-center gap-1.5">
                            <VolumeX className="w-4 h-4 text-orange-400" />
                            <span className="text-xs font-black text-white uppercase tracking-wider">Muting Restriction Console</span>
                          </div>
                          {userStatus?.isMuted && (
                            <span className="text-[9px] uppercase font-bold text-orange-400 bg-orange-950/40 px-2 py-0.5 rounded tracking-wide border border-orange-900/30">Muted Active</span>
                          )}
                        </div>

                        {userStatus?.isMuted ? (
                          <div className="space-y-3 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800">
                            <div>
                              <p className="text-[10px] text-zinc-500 font-mono">REASON CHARGED:</p>
                              <p className="text-xs text-white mt-0.5">{globalBio.muted_reasons?.[selectedUser.id] || 'No reason documented'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-zinc-500 font-mono">EXPIRES AT:</p>
                              <p className="text-xs text-orange-400 font-mono mt-0.5">{new Date(userStatus.muteExpiry).toLocaleString()}</p>
                            </div>
                            <button 
                              onClick={handleRevokeMute}
                              className="w-full py-1.5 text-xs font-bold text-red-400 border border-red-500/30 bg-red-950/10 rounded-lg hover:bg-red-500 hover:text-white transition-all cursor-pointer uppercase font-mono"
                            >
                              UNMUTE SPEAKER IMMEDIATELY
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] text-zinc-500 uppercase tracking-wider font-mono mb-1">Mute duration (Mins)</label>
                                <input 
                                  type="number" 
                                  value={muteMins}
                                  onChange={e => setMuteMins(Number(e.target.value))}
                                  className="w-full bg-zinc-900 border border-zinc-850 rounded-lg p-2 text-xs text-white font-mono"
                                />
                              </div>
                              <div className="flex flex-col justify-end">
                                <div className="grid grid-cols-4 gap-1">
                                  {[5, 15, 30, 60].map(m => (
                                    <button 
                                      key={m}
                                      onClick={() => setMuteMins(m)}
                                      className={`py-2 text-[10px] font-bold rounded border ${muteMins === m ? 'border-orange-500 text-orange-400 bg-orange-950/10' : 'border-zinc-850 text-zinc-400 bg-zinc-900 hover:text-zinc-200'}`}
                                    >
                                      {m}m
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider font-mono mb-1">Mute Offense Reason</label>
                              <input 
                                type="text"
                                value={muteReason}
                                onChange={e => setMuteReason(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-850 rounded-lg p-2 text-xs text-white"
                              />
                            </div>
                            <button 
                              onClick={handleApplyMute}
                              className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-black font-black text-xs uppercase rounded-lg transition-all tracking-wider cursor-pointer"
                            >
                              APPLY TIMED MUTE
                            </button>
                          </div>
                        )}
                      </div>

                      {/* KICKING OPERATIONS PANEL */}
                      <div className="border border-zinc-900 bg-[#0f0f11]/80 rounded-xl p-4 space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-900/60 pb-2">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-black text-white uppercase tracking-wider">Kicking Protocol Desk</span>
                          </div>
                          {userStatus?.isKicked && (
                            <span className="text-[9px] uppercase font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded tracking-wide border border-amber-900/30">Kicked Active</span>
                          )}
                        </div>

                        {userStatus?.isKicked ? (
                          <div className="space-y-3 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800">
                            <div>
                              <p className="text-[10px] text-zinc-500 font-mono">REASON SPECIFIED:</p>
                              <p className="text-xs text-white mt-0.5">{globalBio.kicked_reasons?.[selectedUser.id] || 'No reason documented'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-zinc-500 font-mono">TIMEOUT EXPIRES AT:</p>
                              <p className="text-xs text-amber-400 font-mono mt-0.5">{new Date(userStatus.kickExpiry).toLocaleString()}</p>
                            </div>
                            <button 
                              onClick={handleRevokeKick}
                              className="w-full py-1.5 text-xs font-bold text-red-400 border border-red-500/30 bg-red-950/10 rounded-lg hover:bg-red-500 hover:text-white transition-all cursor-pointer uppercase font-mono"
                            >
                              UNPLUG KICK BAN IMMEDIATELY
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] text-zinc-500 uppercase tracking-wider font-mono mb-1">Kick Restrict Duration (Mins)</label>
                                <input 
                                  type="number" 
                                  value={kickMins}
                                  onChange={e => setKickMins(Number(e.target.value))}
                                  className="w-full bg-zinc-900 border border-zinc-850 rounded-lg p-2 text-xs text-white font-mono"
                                />
                              </div>
                              <div className="flex flex-col justify-end">
                                <div className="grid grid-cols-4 gap-1">
                                  {[1, 5, 20, 120].map(m => (
                                    <button 
                                      key={m}
                                      onClick={() => setKickMins(m)}
                                      className={`py-2 text-[10px] font-bold rounded border ${kickMins === m ? 'border-amber-500 text-amber-400 bg-amber-950/40 font-mono' : 'border-zinc-850 text-zinc-400 bg-zinc-900 hover:text-zinc-200'}`}
                                    >
                                      {m}m
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider font-mono mb-1">Kick Violation Reason</label>
                              <input 
                                type="text"
                                value={kickReasonInput}
                                onChange={e => setKickReasonInput(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-850 rounded-lg p-2 text-xs text-white"
                              />
                            </div>
                            <button 
                              onClick={handleApplyKick}
                              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase rounded-lg transition-all tracking-wider cursor-pointer font-sans"
                            >
                              DISPATCH TEMPORARY KICK
                            </button>
                          </div>
                        )}
                      </div>

                      {/* PERMANENT BAN OPERATIONS PANEL */}
                      <div className="border border-zinc-900 bg-[#0f0f11]/80 rounded-xl p-4 space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-900/60 pb-2">
                          <div className="flex items-center gap-1.5">
                            <Ban className="w-4 h-4 text-red-500" />
                            <span className="text-xs font-black text-white uppercase tracking-wider">Supreme Permanent Ban Desk</span>
                          </div>
                          {userStatus?.isBanned && (
                            <span className="text-[9px] uppercase font-bold text-red-500 bg-red-950/40 px-2 py-0.5 rounded tracking-wide border border-red-900/30">Banned Standing</span>
                          )}
                        </div>

                        {userStatus?.isBanned ? (
                          <div className="space-y-3 bg-zinc-900/60 p-3 rounded-lg border border-red-900/35">
                            <div>
                              <p className="text-[10px] text-zinc-500 font-mono">PRIMARY VIOLATION REASON:</p>
                              <p className="text-xs text-white font-bold mt-0.5">{globalBio.banned_reasons?.[selectedUser.id] || 'No reason documented'}</p>
                            </div>
                            <button 
                              onClick={handleRevokeBan}
                              className="w-full py-1.5 text-xs font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-950/10 rounded-lg hover:bg-emerald-500 hover:text-white transition-all cursor-pointer uppercase font-mono"
                            >
                              REVOKE BAN (RESTORE MEMBERSHIP)
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider font-mono mb-1">Permanent Ban Reason</label>
                              <input 
                                type="text"
                                value={banReasonInput}
                                onChange={e => setBanReasonInput(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-850 rounded-lg p-2 text-xs text-white"
                              />
                            </div>
                            <button 
                              onClick={handleApplyBan}
                              className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase rounded-lg transition-all tracking-widest cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse"
                            >
                              EXECUTE FULL BAN
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* SEC 2: AUTHORITY & CUSTOM RANKS TAB */}
          {activeTab === 'ranks' && (
            <div className="grid grid-cols-12 gap-6 h-full overflow-y-auto custom-scrollbar">
              
              <div className="col-span-5 bg-zinc-950 border border-zinc-900 p-5 rounded-xl self-start">
                <h3 className="text-white text-xs font-extrabold uppercase tracking-widest mb-4 border-b border-zinc-900 pb-2">Generate New Rank</h3>
                <form onSubmit={createRank} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase text-zinc-500 font-bold mb-1">Rank Title</label>
                    <input 
                      value={rankName || ''} 
                      onChange={e => setRankName(e.target.value)} 
                      required 
                      placeholder="e.g. Server Staff" 
                      className="w-full bg-[#1a1a1c] border border-zinc-900 rounded-lg p-2 text-white text-xs outline-none focus:border-indigo-500 transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-zinc-500 font-bold mb-1">Hex Hex Color</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={rankColor} 
                        onChange={e => setRankColor(e.target.value)} 
                        className="h-[34px] w-[50px] bg-transparent cursor-pointer rounded border border-zinc-800" 
                      />
                      <input 
                        value={rankColor} 
                        onChange={e => setRankColor(e.target.value)} 
                        className="flex-1 bg-[#1a1a1c] border border-zinc-900 rounded-lg p-2 text-white text-xs font-mono" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3 bg-zinc-900/30 p-3 rounded-lg border border-zinc-900/80">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input type="checkbox" checked={isStaff} onChange={e => setIsStaff(e.target.checked)} className="accent-indigo-500 w-4 h-4 cursor-pointer" />
                      <span className="text-xs font-semibold text-zinc-300">Grant Staff Privileges</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input type="checkbox" checked={canDelete} onChange={e => setCanDelete(e.target.checked)} className="accent-indigo-500 w-4 h-4 cursor-pointer" />
                      <span className="text-xs font-semibold text-zinc-300">Can Purge Messages</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input type="checkbox" checked={canBan} onChange={e => setCanBan(e.target.checked)} className="accent-indigo-500 w-4 h-4 cursor-pointer" />
                      <span className="text-xs font-semibold text-zinc-300">Can Restrict Accounts</span>
                    </label>
                  </div>

                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-lg">
                    Build Customs Rank
                  </button>
                </form>
              </div>

              <div className="col-span-7 bg-zinc-950 border border-zinc-900 p-5 rounded-xl min-h-[300px]">
                <h3 className="text-white text-xs font-extrabold uppercase tracking-widest mb-4 border-b border-zinc-900 pb-2">Identified Custom Ranks</h3>
                {ranks.length === 0 ? (
                  <p className="text-zinc-500 text-xs py-4 text-center">No custom rank nodes constructed.</p>
                ) : (
                  <div className="space-y-2">
                    {ranks.map(r => (
                      <div key={r.id} className="flex items-center justify-between bg-[#141416]/90 border border-zinc-900 p-3.5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm shadow-white/10" style={{ backgroundColor: r.color }} />
                          <span className="font-bold text-white text-xs">{r.name}</span>
                          {r.is_staff && (
                            <span className="bg-red-500/15 border border-red-900/60 text-red-400 px-2 py-0.5 rounded text-[9px] uppercase font-black tracking-widest">
                              Staff Override
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex gap-2 text-[10px] text-zinc-500 uppercase font-mono">
                            {r.can_delete_messages && <span>• PURGE</span>}
                            {r.can_ban_users && <span>• RESTRICT</span>}
                          </div>
                          <button 
                            onClick={() => handleDeleteRank(r.id)}
                            className="bg-zinc-900 hover:bg-red-950/40 p-1.5 text-zinc-500 hover:text-red-400 rounded-md border border-zinc-850 hover:border-red-900/40 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* SEC 3: ADDONS WORKSPACE TAB */}
          {activeTab === 'addons' && (
            <div className="grid grid-cols-12 gap-6 h-full overflow-y-auto custom-scrollbar">
              
              {/* Default Addon Toggles row */}
              <div className="col-span-5 space-y-6">
                
                <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-xl">
                  <h3 className="text-white text-xs font-black uppercase tracking-widest mb-4 border-b border-zinc-900 pb-2">System Integrations</h3>
                  
                  <div className="space-y-4">
                    
                    {/* Addon 1: Paint */}
                    <div className="flex items-center justify-between bg-zinc-900/30 p-3 rounded-lg border border-zinc-900">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1 px-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                          <Paintbrush className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Paint Canvas Module</p>
                          <p className="text-[10px] text-zinc-500 font-mono">Addon ID: paint</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleToggleAddon('paint')}
                        className={`flex items-center gap-1 px-3 py-1 text-[10px] font-black rounded-md uppercase border transition-all ${
                          !isAddonDisabled('paint') 
                          ? 'bg-emerald-500/12 text-emerald-400 border-emerald-500/30 font-bold' 
                          : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{!isAddonDisabled('paint') ? 'Active' : 'Disabled'}</span>
                      </button>
                    </div>

                    {/* Addon 2: Currency */}
                    <div className="flex items-center justify-between bg-zinc-900/30 p-3 rounded-lg border border-zinc-900">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1 px-2 bg-amber-500/10 text-amber-400 rounded-lg">
                          <Coins className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Treasury & Coins Exchange</p>
                          <p className="text-[10px] text-zinc-500 font-mono">Addon ID: currency</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleToggleAddon('currency')}
                        className={`flex items-center gap-1 px-3 py-1 text-[10px] font-black rounded-md uppercase border transition-all ${
                          !isAddonDisabled('currency') 
                          ? 'bg-emerald-500/12 text-emerald-400 border-emerald-500/30 font-bold' 
                          : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{!isAddonDisabled('currency') ? 'Active' : 'Disabled'}</span>
                      </button>
                    </div>

                    {/* Addon 3: Profile Insights */}
                    <div className="flex items-center justify-between bg-zinc-900/30 p-3 rounded-lg border border-zinc-900">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1 px-2 bg-pink-500/10 text-pink-400 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Profile Views Tracker</p>
                          <p className="text-[10px] text-zinc-500 font-mono">Addon ID: profile-views</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleToggleAddon('profile-views')}
                        className={`flex items-center gap-1 px-3 py-1 text-[10px] font-black rounded-md uppercase border transition-all ${
                          !isAddonDisabled('profile-views') 
                          ? 'bg-emerald-500/12 text-emerald-400 border-emerald-500/30 font-bold' 
                          : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{!isAddonDisabled('profile-views') ? 'Active' : 'Disabled'}</span>
                      </button>
                    </div>

                    {/* Addon 4: Media Uploader */}
                    <div className="flex items-center justify-between bg-zinc-900/30 p-3 rounded-lg border border-zinc-900">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1 px-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                          <Upload className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Media Send & Uploader</p>
                          <p className="text-[10px] text-zinc-500 font-mono">Addon ID: media-uploader</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleToggleAddon('media-uploader')}
                        className={`flex items-center gap-1 px-3 py-1 text-[10px] font-black rounded-md uppercase border transition-all ${
                          !isAddonDisabled('media-uploader') 
                          ? 'bg-emerald-500/12 text-emerald-400 border-emerald-500/30 font-bold' 
                          : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{!isAddonDisabled('media-uploader') ? 'Active' : 'Disabled'}</span>
                      </button>
                    </div>

                  </div>
                </div>

                {/* Import addon trigger note */}
                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-2">
                  <p className="text-zinc-400 text-xs font-semibold flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                    <span>Real-Time Hot Reload Activated</span>
                  </p>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    Once a custom modded addon is imported or deleted, the application broadcasts an index synchronization event which automatically reloads the interface for all active online users.
                  </p>
                </div>

              </div>

              {/* Import Custom Addons Form & active list */}
              <div className="col-span-7 space-y-6">
                
                {/* Custom Addon Creater */}
                <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-xl">
                  <h3 className="text-white text-xs font-extrabold uppercase tracking-widest mb-4 border-b border-zinc-900 pb-2">Import Custom Addon Spec</h3>
                  <form onSubmit={handleImportAddon} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase text-zinc-505 font-bold mb-1 font-mono">ADDON ID (Permanent)</label>
                        <input 
                          value={newAddonId}
                          onChange={e => setNewAddonId(e.target.value)}
                          placeholder="e.g. dice-simulator"
                          required
                          className="w-full bg-[#1a1a1c] border border-zinc-900 rounded-lg p-2 text-white text-xs focus:border-emerald-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-zinc-505 font-bold mb-1 font-mono">Icon Element</label>
                        <select 
                          className="w-full bg-[#1a1a1c] border border-zinc-900 rounded-lg p-2 text-white text-xs focus:border-emerald-500 outline-none"
                          value={newAddonIcon}
                          onChange={e => setNewAddonIcon(e.target.value)}
                        >
                          {['Sparkles', 'Layers', 'Settings', 'Globe', 'Wallet', 'Music', 'Heart', 'Coins', 'Paintbrush', 'Gem', 'Eye'].map(ic => (
                            <option key={ic} value={ic}>{ic}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-zinc-505 font-bold mb-1 font-mono">Display Name</label>
                      <input 
                        value={newAddonName}
                        onChange={e => setNewAddonName(e.target.value)}
                        placeholder="e.g. Magic Dice"
                        required
                        className="w-full bg-[#1a1a1c] border border-zinc-900 rounded-lg p-2 text-white text-xs focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] uppercase text-zinc-505 font-bold font-mono">HTML + CSS + JavaScript (Sandboxed Code)</label>
                        <span className="text-[10px] text-zinc-500 font-sans">Tailwind handles automatically</span>
                      </div>
                      <textarea 
                        value={newAddonCode}
                        onChange={e => setNewAddonCode(e.target.value)}
                        rows={6}
                        required
                        className="w-full bg-[#070709] border border-zinc-900 rounded-lg p-2 text-[10px] text-emerald-500 font-mono focus:border-emerald-500 outline-none leading-relaxed"
                      />
                    </div>
                    <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      Import and Sync Addon
                    </button>
                  </form>
                </div>

                {/* Active Custom Addons List */}
                <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-xl">
                  <h3 className="text-white text-xs font-extrabold uppercase tracking-widest mb-4 border-b border-zinc-900 pb-2">Active Custom Addons Modded Registry</h3>
                  {(!globalBio.addons_custom || globalBio.addons_custom.length === 0) ? (
                    <p className="text-zinc-500 text-xs py-4 text-center">No custom addons imported yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {(globalBio.addons_custom || []).map((addon: any) => (
                        <div key={addon.id} className="flex items-center justify-between bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-900">
                          <div className="flex items-center gap-3">
                            <span className="text-xs uppercase bg-[#34d399]/15 text-emerald-400 px-2 py-1 rounded font-mono font-bold">
                              {addon.icon}
                            </span>
                            <div>
                              <p className="text-xs font-black text-white">{addon.name}</p>
                              <p className="text-[9px] text-zinc-550 font-mono">ID: {addon.id}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleToggleCustomAddon(addon.id)}
                              className={`px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all border ${
                                addon.enabled !== false 
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                                : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                              }`}
                            >
                              {addon.enabled !== false ? 'Enabled' : 'Disabled'}
                            </button>
                            <button 
                              onClick={() => handleDeleteCustomAddon(addon.id)}
                              className="p-1 px-2.5 bg-zinc-900 hover:bg-rose-950/40 text-zinc-550 hover:text-rose-400 rounded-md border border-zinc-850 hover:border-rose-900/40 transition-all cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
