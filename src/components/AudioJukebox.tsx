import React, { useState } from 'react';
import { Volume2, Play, Pause, Music, Sparkles, Swords, Layers, Shield, Disc3, Search, Zap } from 'lucide-react';
import { soundManager } from '../utils/audio';

export const AudioJukebox: React.FC = () => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Curated list of significant Zenonia 3 audio files extracted from the APK
  const AUDIO_ITEMS = [
    { file: 's000.ogg', name: 'Intro / Selección de Menú', category: 'ui', desc: 'Sonido clásico de campana y confirmación en menús' },
    { file: 's001.ogg', name: 'Tajo Básico de Espada (Sword 1)', category: 'combat', desc: 'Corte rápido con la espada de Chale' },
    { file: 's002.ogg', name: 'Tajo de Espada 2 (Combo Hit)', category: 'combat', desc: 'Segundo impacto en la secuencia de combo' },
    { file: 's003.ogg', name: 'Golpe Directo (Flesh Impact)', category: 'combat', desc: 'Sonido de impacto físico sobre monstruo' },
    { file: 's004.ogg', name: 'Esquiva / Dash Rápido', category: 'combat', desc: 'Deslizamiento evasivo con viento' },
    { file: 's005.ogg', name: 'Habilidad Mágica 1 (Energy Burst)', category: 'skills', desc: 'Explosión de energía elemental de Deva' },
    { file: 's006.ogg', name: 'Habilidad 2 (Whirlwind Slash)', category: 'skills', desc: 'Giro con viento huracanado cortante' },
    { file: 's007.ogg', name: 'Poción de Vida / Maná', category: 'items', desc: 'Burbujeo de recuperación de HP/SP' },
    { file: 's008.ogg', name: 'Rugido de Monstruo (Beast Roar)', category: 'monsters', desc: 'Alerta y rugido de bestias salvajes en Midgard' },
    { file: 's009.ogg', name: '¡LEVEL UP! (Fanfarria de Nivel)', category: 'fanfare', desc: 'Campanas y melodía épica de subida de nivel' },
    { file: 's011.ogg', name: 'Corte Doble (Shadow Hunter)', category: 'combat', desc: 'Tajo rápido de dagas dobles de Ecne' },
    { file: 's012.ogg', name: 'Fallo / Sin Maná (Error SP)', category: 'ui', desc: 'Tono sordo cuando no hay suficiente energía SP' },
    { file: 's013.ogg', name: 'Bloqueo de Escudo (Shield Block)', category: 'combat', desc: 'Impacto metálico en la defensa' },
    { file: 's014.ogg', name: '¡GOLPE CRÍTICO! (Heavy Crit)', category: 'combat', desc: 'Impacto demoledor con sonido contundente' },
    { file: 's015.ogg', name: 'Disparo de Cañón (Mechanic Launcher)', category: 'combat', desc: 'Fogonazo de proyectil de Raby' },
    { file: 's016.ogg', name: 'Explosión de Granada', category: 'skills', desc: 'Detonación de trampa de área' },
    { file: 's017.ogg', name: 'Equipar Objeto (Inventario)', category: 'items', desc: 'Clic metálico al equipar armas y armaduras' },
    { file: 's018.ogg', name: 'Desequipar / Tirar Objeto', category: 'items', desc: 'Sonido de gestión en mochila' },
    { file: 's020.ogg', name: 'Rugido de Jefe (Boss Alert)', category: 'monsters', desc: 'Alerta de combate contra guardián del calabozo' },
    { file: 's021.ogg', name: 'Hada Guardiana (Fairy Sparkle)', category: 'skills', desc: 'Efecto de polvo de estrellas de Runa' },
    { file: 's023.ogg', name: 'Invocación de Rayo', category: 'skills', desc: 'Descarga eléctrica de chamán' },
    { file: 's024.ogg', name: 'Lluvia de Meteoros', category: 'skills', desc: 'Impacto cósmico masivo' },
    { file: 's025.ogg', name: 'Recoger Monedas de Oro', category: 'items', desc: 'Tintineo de monedas de oro en el suelo' },
    { file: 's026.ogg', name: 'Recoger Joyas Zen (Zen Gem)', category: 'items', desc: 'Gema preciosa recogida' },
    { file: 's027.ogg', name: 'Abrir Cofre del Tesoro', category: 'items', desc: 'Recompensa de mazmorra abierta' },
    { file: 's028.ogg', name: 'Portal Dimensional Activo', category: 'ui', desc: 'Resonancia del portal a Deva Castle' },
    { file: 's029.ogg', name: 'Muerte de Monstruo', category: 'monsters', desc: 'Disipación de enemigo caído' },
    { file: 's031.ogg', name: '¡Misión Cumplida! (Quest Done)', category: 'fanfare', desc: 'Fanfarria al completar encargo de aldeanos' },
    { file: 's032.ogg', name: 'Aceptar Misión', category: 'ui', desc: 'Nuevo objetivo añadido al diario' },
    { file: 's033.ogg', name: 'Golpe a Jefe (Heavy Boss Hit)', category: 'combat', desc: 'Impacto contra armadura pesada' }
  ];

  const categories = [
    { id: 'all', label: 'Todos (77)', icon: Disc3 },
    { id: 'combat', label: 'Combate & Espada', icon: Swords },
    { id: 'skills', label: 'Habilidades & Magia', icon: Sparkles },
    { id: 'items', label: 'Ítems & Pociones', icon: Shield },
    { id: 'monsters', label: 'Monstruos', icon: Zap },
    { id: 'fanfare', label: 'Fanfarrias & Nivel', icon: Music },
    { id: 'ui', label: 'Interfaz & Menús', icon: Layers }
  ];

  const filteredAudio = AUDIO_ITEMS.filter(item => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.file.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handlePlaySound = (file: string) => {
    setPlayingId(file);
    soundManager.playSfx(file);
    setTimeout(() => {
      setPlayingId(null);
    }, 1200);
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-6 space-y-6">
      {/* Jukebox Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/60 to-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-['Press_Start_2P'] text-[10px] text-amber-400">
                EXPLORADOR DE AUDIO Y EFECTOS
              </span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                77 Pistas OGG Extraídas
              </span>
            </div>
            <h2 className="text-2xl font-bold font-['Rajdhani'] text-white">
              Banda Sonora y Efectos de Sonido Originales
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mt-1">
              Todos los efectos de sonido y fanfarrias auténticos de Zenonia 3 extraídos directamente de los archivos <code className="text-amber-300">res/raw/s*.ogg</code> del APK para verificar la fidelidad de audio en la R36S.
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar sonido o efecto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-800">
          {categories.map((c) => {
            const IconComponent = c.icon;
            const isSelected = activeCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-slate-950/80 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Audio Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredAudio.map((item) => {
          const isPlaying = playingId === item.file;
          return (
            <div
              key={item.file}
              className={`p-4 rounded-xl border transition flex items-center justify-between gap-3 ${
                isPlaying
                  ? 'bg-amber-500/20 border-amber-500 shadow-md scale-[1.02]'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-amber-400 px-1.5 py-0.5 bg-slate-950 rounded border border-slate-800">
                    {item.file}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase">{item.category}</span>
                </div>
                <h4 className="text-sm font-bold text-white truncate">
                  {item.name}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {item.desc}
                </p>
              </div>

              <button
                onClick={() => handlePlaySound(item.file)}
                className={`p-3 rounded-full flex-shrink-0 transition shadow-lg ${
                  isPlaying
                    ? 'bg-amber-500 text-slate-950 scale-110'
                    : 'bg-slate-800 text-slate-200 hover:bg-amber-500 hover:text-slate-950'
                }`}
                title="Reproducir audio"
              >
                {isPlaying ? <Volume2 className="w-4 h-4 animate-bounce" /> : <Play className="w-4 h-4" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
