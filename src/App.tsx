import React, { useState } from 'react';
import { R36SSimulator } from './components/R36SSimulator';
import { PortMasterPackage } from './components/PortMasterPackage';
import { ControlsMapper } from './components/ControlsMapper';
import { DarkOSGuide } from './components/DarkOSGuide';
import { AudioJukebox } from './components/AudioJukebox';
import { 
  Gamepad2, Download, Sliders, BookOpen, Music, 
  Sparkles, ShieldCheck, CheckCircle2, ChevronRight, Terminal, Loader2
} from 'lucide-react';
import { downloadZipPackage, DownloadProgress } from './utils/downloader';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('simulator');
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({
    status: 'idle',
    progress: 0
  });

  const handleHeaderDownload = async () => {
    await downloadZipPackage(setDownloadProgress);
  };

  const navTabs = [
    { id: 'simulator', label: '🎮 Simulador R36S (640x480)', shortLabel: 'Simulador' },
    { id: 'package', label: '📦 Descargar PortMaster ZIP', shortLabel: 'Descarga' },
    { id: 'controls', label: '🕹️ Mapeo de Controles (gptk)', shortLabel: 'Controles' },
    { id: 'guide', label: '📖 Guía DarkOS RE', shortLabel: 'Instalación' },
    { id: 'audio', label: '🎵 Audio Jukebox (77 OGGs)', shortLabel: 'Sonidos' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Inter',sans-serif]">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <img 
              src="/game_assets/icon.png" 
              alt="Zenonia 3 Icon" 
              className="w-10 h-10 rounded-xl shadow-md border border-amber-500/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-['Rajdhani'] font-bold text-xl sm:text-2xl text-white tracking-wide flex items-center gap-2">
                  ZENONIA 3
                  <span className="text-amber-400 font-['Press_Start_2P'] text-[9px]">R36S</span>
                </h1>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/40 uppercase">
                  PortMaster Suite
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Port optimizado para R36S con DarkOS RE • Resolución 640x480 • Controles Físicos
              </p>
            </div>
          </div>

          {/* Quick Action Download Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleHeaderDownload}
              disabled={downloadProgress.status === 'downloading'}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold font-['Rajdhani'] text-sm tracking-wide rounded-lg shadow-md shadow-amber-500/20 transition transform active:scale-95 disabled:opacity-75"
            >
              {downloadProgress.status === 'downloading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>DESCARGANDO ({downloadProgress.progress}%)...</span>
                </>
              ) : downloadProgress.status === 'ready' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                  <span>¡DESCARGADO!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>DESCARGAR .ZIP (25 MB)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4">
        {activeTab === 'simulator' && <R36SSimulator onSelectTab={setActiveTab} />}
        {activeTab === 'package' && <PortMasterPackage />}
        {activeTab === 'controls' && <ControlsMapper />}
        {activeTab === 'guide' && <DarkOSGuide />}
        {activeTab === 'audio' && <AudioJukebox />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="text-slate-400">
              Zenonia 3: The Midgard Story © Gamevil (2011). Adaptación no oficial para la comunidad de R36S y DarkOS RE.
            </p>
            <p className="mt-1">
              Compatible con ArkOS, DarkOS RE, AmberELEC y sistemas basados en PortMaster para chip Rockchip RK3326.
            </p>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>Display: 640x480 (4:3)</span>
            <span>•</span>
            <span>SoC: RK3326</span>
            <span>•</span>
            <span>Controls: gptokeyb</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
