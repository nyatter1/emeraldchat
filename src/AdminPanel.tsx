import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { X, ShieldCheck, Plus, Trash2, Bot, Upload } from 'lucide-react';
import { Profile } from '../types';

export function AdminPanel({ currentUserProfile, onClose }: { currentUserProfile: Profile, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'ranks' | 'bots'>('ranks');
  const [ranks, setRanks] = useState<any[]>([]);
  const [bots, setBots] = useState<any[]>([]);
  
  // Rank Form
  const [rankName, setRankName] = useState('');
  const [rankColor, setRankColor] = useState('#ffffff');
  const [isStaff, setIsStaff] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [canBan, setCanBan] = useState(false);

  // Bot Form
  const [botName, setBotName] = useState('');
  const [botPfp, setBotPfp] = useState<File | null>(null);
  const [botPfpUrl, setBotPfpUrl] = useState('');
  const [botScript, setBotScript] = useState('// This script is triggered on new message\n// variables available: message, supabase\nif(message.content === "!ping") {\n  await supabase.from("messages").insert({ user_id: botProfileId, content: "pong!" });\n}');

  useEffect(() => {
    fetchRanks();
    fetchBots();
  }, []);

  const fetchRanks = async () => {
    const { data } = await supabase.from('custom_ranks').select('*').order('created_at', { ascending: true });
    if (data) setRanks(data);
  };

  const fetchBots = async () => {
    const { data } = await supabase.from('bots').select('*').order('created_at', { ascending: true });
    if (data) setBots(data);
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

  const createBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botName) return;

    let pfpUrl = '';
    if (botPfp) {
      const ext = botPfp.name.split('.').pop();
      const path = `bots/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, botPfp);
      if (uploadError) { toast.error(uploadError.message); return; }
      const { data: pubData } = supabase.storage.from('avatars').getPublicUrl(path);
      pfpUrl = pubData.publicUrl;
    }

    // Create profile
    const fakeId = crypto.randomUUID();
    const { error: profileError } = await supabase.from('profiles').insert({
      id: fakeId,
      email: `bot-${fakeId}@emerald.local`,
      username: botName,
      avatar_url: pfpUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + fakeId,
      rank: 'Bot'
    });

    if (profileError) { toast.error(profileError.message); return; }

    const { error } = await supabase.from('bots').insert({
      profile_id: fakeId,
      name: botName,
      script: botScript,
      created_by: currentUserProfile.id
    });
    
    if (error) { toast.error(error.message); return; }
    toast.success('Bot created successfully!');
    setBotName('');
    setBotPfp(null);
    fetchBots();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[200] flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-[#09090b] w-full max-w-4xl max-h-[90vh] rounded-2xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-[#111]">
          <div className="flex items-center gap-2 text-red-500 font-bold">
            <ShieldCheck className="w-5 h-5" />
            <span className="tracking-wider">Admin Panel</span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-800 rounded-md transition-colors"><X className="w-5 h-5 text-zinc-400" /></button>
        </div>

        <div className="flex border-b border-zinc-800">
          <button onClick={() => setActiveTab('ranks')} className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider ${activeTab === 'ranks' ? 'bg-red-500/10 text-red-400 border-b-2 border-red-500' : 'text-zinc-500 hover:text-zinc-300'}`}>Ranks</button>
          <button onClick={() => setActiveTab('bots')} className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider ${activeTab === 'bots' ? 'bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-zinc-300'}`}>Bot Maker</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'ranks' && (
            <div className="space-y-6">
              <div className="bg-[#111] p-5 rounded-xl border border-zinc-800">
                <h3 className="text-white font-bold mb-4">Create New Rank</h3>
                <form onSubmit={createRank} className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs uppercase text-zinc-500 font-bold mb-1">Rank Name</label>
                      <input value={rankName} onChange={e => setRankName(e.target.value)} required placeholder="e.g. Moderator" className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-md p-2 text-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-zinc-500 font-bold mb-1">Color</label>
                      <input type="color" value={rankColor} onChange={e => setRankColor(e.target.value)} className="h-[38px] w-[50px] bg-transparent cursor-pointer rounded-md border border-zinc-800" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={isStaff} onChange={e => setIsStaff(e.target.checked)} className="accent-red-500 w-4 h-4" />
                      <span className="text-sm font-medium text-zinc-300">Is Staff</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={canDelete} onChange={e => setCanDelete(e.target.checked)} className="accent-red-500 w-4 h-4" />
                      <span className="text-sm font-medium text-zinc-300">Can Delete Msg</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={canBan} onChange={e => setCanBan(e.target.checked)} className="accent-red-500 w-4 h-4" />
                      <span className="text-sm font-medium text-zinc-300">Can Ban Users</span>
                    </label>
                  </div>
                  <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-md transition-colors">Create Rank</button>
                </form>
              </div>

              <div className="space-y-2">
                <h3 className="text-white font-bold mb-3">Custom Ranks</h3>
                {ranks.length === 0 ? (
                  <p className="text-zinc-500 text-sm">No custom ranks created.</p>
                ) : ranks.map(r => (
                  <div key={r.id} className="flex items-center justify-between bg-[#111] border border-zinc-800 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                      <span className="font-bold text-white">{r.name}</span>
                      {r.is_staff && <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider">Staff</span>}
                    </div>
                    <div className="flex gap-2">
                      {r.can_delete_messages && <span className="text-zinc-500 text-xs">Delete Msg</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bots' && (
            <div className="space-y-6">
              <div className="bg-[#111] p-5 rounded-xl border border-zinc-800">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Bot className="w-5 h-5 text-emerald-500"/> Create Bot</h3>
                <form onSubmit={createBot} className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div>
                      <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">Avatar</label>
                      <label className="w-16 h-16 border-2 border-dashed border-zinc-700 hover:border-emerald-500 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden transition-colors">
                         {botPfpUrl ? <img src={botPfpUrl} className="w-full h-full object-cover" /> : <Upload className="w-6 h-6 text-zinc-500" />}
                         <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                           if(e.target.files?.[0]) {
                             setBotPfp(e.target.files[0]);
                             setBotPfpUrl(URL.createObjectURL(e.target.files[0]));
                           }
                         }} />
                      </label>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs uppercase text-zinc-500 font-bold mb-1">Bot Name</label>
                      <input value={botName} onChange={e => setBotName(e.target.value)} required placeholder="QuizBot, TriviaMaster..." className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-md p-2 text-white text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-zinc-500 font-bold mb-1">Trigger Script (JS)</label>
                    <textarea 
                      value={botScript} 
                      onChange={e => setBotScript(e.target.value)} 
                      rows={8}
                      className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-md p-3 text-emerald-400 font-mono text-xs leading-relaxed focus:border-emerald-500 outline-none"
                    />
                    <p className="text-[10px] text-zinc-500 mt-1">Runs when a new message is posted to main chat. <code>message</code> object is available.</p>
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-md transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">Deploy Bot</button>
                </form>
              </div>

               <div className="space-y-2">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">Active Bots</h3>
                {bots.length === 0 ? (
                  <p className="text-zinc-500 text-sm">No bots created.</p>
                ) : bots.map(b => (
                  <div key={b.id} className="flex flex-col bg-[#111] border border-zinc-800 p-4 rounded-lg gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-400 text-base">{b.name}</span>
                      <button 
                        onClick={async () => {
                          await supabase.from('profiles').delete().eq('id', b.profile_id); // cascades
                          toast.success('Bot deleted!');
                          fetchBots();
                        }}
                        className="text-red-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <pre className="bg-[#050505] p-2 rounded text-[10px] text-zinc-400 font-mono overflow-auto max-h-[100px] border border-zinc-900 border-dashed">{b.script}</pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
