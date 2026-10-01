import React, { useEffect, useState } from 'react';
import { ExternalLink, LogIn, LogOut, Music2, Search, Disc3 } from 'lucide-react';
import { spotifyHandleCallback, spotifyHasToken, spotifyIsConfigured, spotifyLogin, spotifyLogout, spotifySearch, spotifyTrackEmbedUrl } from '../services/spotifyApi';

const DEFAULT_PLAYLIST = 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator&theme=0';

export default function SpotifyPlayer() {
  const [connected, setConnected] = useState(spotifyHasToken());
  const [query, setQuery] = useState('lofi focus');
  const [results, setResults] = useState({ tracks: { items: [] }, playlists: { items: [] } });
  const [embedUrl, setEmbedUrl] = useState(DEFAULT_PLAYLIST);
  const [manualUrl, setManualUrl] = useState('');
  const [selectedMedia, setSelectedMedia] = useState({ title: 'Deep Focus', subtitle: 'Focus playlist', image: '' });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const tracks = Array.isArray(results?.tracks?.items) ? results.tracks.items.filter(Boolean) : [];
  const playlists = Array.isArray(results?.playlists?.items) ? results.playlists.items.filter(Boolean) : [];

  useEffect(() => { spotifyHandleCallback().then((token) => { if (token) setConnected(true); }).catch((error) => setMessage(error.message)); }, []);

  const connect = async () => { try { await spotifyLogin(); } catch (error) { setMessage(error.message); } };
  const chooseMedia = (url, media) => { const playerUrl = spotifyTrackEmbedUrl(url); if (!playerUrl) return; setEmbedUrl(playerUrl); setSelectedMedia(media); setMessage(''); };
  const search = async (event) => {
    event.preventDefault(); if (!query.trim()) return; setBusy(true); setMessage('');
    try { setResults(await spotifySearch(query.trim())); } catch (error) { setMessage(error.message); setConnected(spotifyHasToken()); } finally { setBusy(false); }
  };
  const useUrl = (event) => { event.preventDefault(); const url = spotifyTrackEmbedUrl(manualUrl); if (!url) { setMessage('Paste a Spotify track, album, or playlist link.'); return; } setEmbedUrl(url); setSelectedMedia({ title: 'Your selection', subtitle: 'Spotify', image: '' }); setManualUrl(''); setMessage(''); };

  return (
    <div className="glass-card p-6 border border-slate-200 dark:border-indigo-950/20 lg:col-span-2 min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div><span className="text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-500 flex items-center gap-2"><Music2 size={14} className="text-emerald-500" /> Spotify focus player</span><p className="text-xs text-slate-500 leading-relaxed mt-2">Choose a soundtrack and let the record spin while you focus.</p></div>
        {connected ? <button onClick={() => { spotifyLogout(); setConnected(false); setResults({ tracks: { items: [] }, playlists: { items: [] } }); }} className="text-xs text-slate-500 hover:text-rose-500 flex items-center gap-1"><LogOut size={13} /> Disconnect</button> : <button onClick={connect} disabled={!spotifyIsConfigured()} className="text-xs btn-primary px-3 py-2 flex items-center gap-1 disabled:opacity-50"><LogIn size={13} /> Connect Spotify</button>}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(230px,0.8fr)_minmax(0,1.2fr)] gap-6 items-center">
        <div className="flex flex-col items-center justify-center gap-4 py-2">
          <div className="relative w-44 h-44 rounded-full p-2 bg-[#111318] shadow-[0_12px_35px_rgba(0,0,0,.45)] animate-[spin_9s_linear_infinite]" aria-label={`${selectedMedia.title} spinning record`}>
            <div className="w-full h-full rounded-full bg-[repeating-radial-gradient(circle_at_center,#24272c_0,#24272c_2px,#111318_3px,#111318_5px)] p-3"><div className="w-full h-full rounded-full overflow-hidden bg-emerald-500/20 border-4 border-[#0b0d10]">{selectedMedia.image ? <img src={selectedMedia.image} alt={`${selectedMedia.title} artwork`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Disc3 size={54} className="text-emerald-400" /></div>}</div></div>
            <span className="absolute left-1/2 top-1/2 w-5 h-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white border-4 border-slate-800 shadow" />
          </div>
          <div className="text-center"><p className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[220px]">{selectedMedia.title}</p><p className="text-[10px] text-slate-500 truncate max-w-[220px]">{selectedMedia.subtitle}</p></div>
        </div>

        <div className="min-w-0">
          {connected && <form onSubmit={search} className="flex gap-2 mb-3"><div className="flex-1 flex items-center gap-2 px-3 rounded-xl border border-slate-200 dark:border-surface-500/30 bg-white/50 dark:bg-surface-700/30"><Search size={14} className="text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full py-2.5 bg-transparent text-xs focus:outline-none" placeholder="Search Spotify" /></div><button className="px-3 rounded-xl border border-slate-200 dark:border-surface-500/30 text-xs font-bold" disabled={busy}>{busy ? '...' : 'Search'}</button></form>}
          <div className="space-y-1 max-h-36 overflow-y-auto">{tracks.map((track) => <button key={track.id} onClick={() => chooseMedia(track.external_urls?.spotify, { title: track.name || 'Spotify track', subtitle: (track.artists || []).map((artist) => artist.name).join(', '), image: track.album?.images?.[0]?.url || '' })} className="w-full text-left flex items-center gap-3 p-2 rounded-xl hover:bg-emerald-500/10 transition-colors"><img src={track.album?.images?.[2]?.url || track.album?.images?.[0]?.url} alt={track.name || 'Spotify track artwork'} className="w-9 h-9 rounded-lg object-cover" /><span className="min-w-0"><span className="block text-xs font-bold truncate">{track.name || 'Spotify track'}</span><span className="block text-[10px] text-slate-500 truncate">{(track.artists || []).map((artist) => artist.name).join(', ')}</span></span></button>)}{playlists.map((playlist) => <button key={playlist.id} onClick={() => chooseMedia(playlist.external_urls?.spotify, { title: playlist.name || 'Spotify playlist', subtitle: 'Playlist', image: playlist.images?.[0]?.url || '' })} className="w-full text-left flex items-center gap-3 p-2 rounded-xl hover:bg-emerald-500/10 transition-colors"><img src={playlist.images?.[0]?.url} alt={playlist.name || 'Spotify playlist cover'} className="w-9 h-9 rounded-lg object-cover" /><span className="text-xs font-bold truncate">{playlist.name || 'Spotify playlist'}</span></button>)}</div>
          <form onSubmit={useUrl} className="flex gap-2 mt-3 mb-3"><input value={manualUrl} onChange={(event) => setManualUrl(event.target.value)} className="min-w-0 flex-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-surface-500/30 bg-white/50 dark:bg-surface-700/30 text-xs focus:outline-none" placeholder="Paste Spotify link" /><button className="px-3 rounded-xl border border-slate-200 dark:border-surface-500/30 text-xs font-bold">Use</button></form>
          <iframe title="Spotify focus player" src={embedUrl} width="100%" height="152" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" className="rounded-xl" />
          {!spotifyIsConfigured() && <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-3">Add <code>VITE_SPOTIFY_CLIENT_ID</code> to enable search, or paste a link above.</p>}
          {message && <p className="text-[10px] text-rose-500 mt-3">{message}</p>}
          <a href={embedUrl.replace('/embed', '')} target="_blank" rel="noreferrer" className="mt-2 text-[10px] text-slate-500 hover:text-emerald-500 flex items-center justify-end gap-1">Open in Spotify <ExternalLink size={11} /></a>
        </div>
      </div>
    </div>
  );
}
