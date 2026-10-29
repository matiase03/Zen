import React, { useState } from 'react';
import { Gamepad2, Check, Download, RotateCcw, Copy, Sliders, Shield, Zap, Sparkles } from 'lucide-react';
import { R36SMapping } from '../types/game';

export const ControlsMapper: React.FC = () => {
  // Preset definitions
  const PRESETS: Record<string, { name: string; desc: string; mapping: R36SMapping }> = {
    default: {
      name: 'Default R36S (Recomendado)',
      desc: 'Mapeo optimizado estilo ARPG moderno: A para ataque/interactuar, B para dash/cancelar, X y Y para habilidades.',
      mapping: {
        dpad_up: 'up',
        dpad_down: 'down',
        dpad_left: 'left',
        dpad_right: 'right',
        a: 'x',        // Ataque / Acción
        b: 'z',        // Dash / Cancelar
        x: 'c',        // Skill 1
        y: 'v',        // Skill 2
        l1: '1',       // Poción de Vida
        r1: '2',       // Skill 3
        l2: '3',       // Menú Hada
        r2: '4',       // Inventario
        select: 'm',   // Mapa
        start: 'enter' // Pausa
      }
    },
    nintendo: {
      name: 'Estilo SNES / GBA (B = Ataque)',
      desc: 'Para jugadores nostálgicos de Game Boy Advance: B es el ataque principal y A es salto/interactuar.',
      mapping: {
        dpad_up: 'up',
        dpad_down: 'down',
        dpad_left: 'left',
        dpad_right: 'right',
        a: 'z',
        b: 'x',
        x: 'v',
        y: 'c',
        l1: '1',
        r1: '2',
        l2: '3',
        r2: '4',
        select: 'm',
        start: 'enter'
      }
    },
    action: {
      name: 'Modo Acción Rápida (Y = Ataque)',
      desc: 'Coloca el pulgar sobre Y para atacar rápidamente y B para esquivar al instante.',
      mapping: {
        dpad_up: 'up',
        dpad_down: 'down',
        dpad_left: 'left',
        dpad_right: 'right',
        a: 'z',
        b: 'c',
        x: 'v',
        y: 'x',
        l1: '1',
        r1: '2',
        l2: '3',
        r2: '4',
        select: 'm',
        start: 'enter'
      }
    }
  };

  const [activePreset, setActivePreset] = useState<string>('default');
  const [currentMapping, setCurrentMapping] = useState<R36SMapping>(PRESETS.default.mapping);
  const [selectedButton, setSelectedButton] = useState<keyof R36SMapping | null>('a');
  const [copied, setCopied] = useState<boolean>(false);

  const buttonLabels: Record<keyof R36SMapping, { label: string; action: string; desc: string }> = {
    a: { label: 'Botón A', action: 'Ataque / Acción / Confirmar', desc: 'Ataca con el arma principal o habla con NPCs' },
    b: { label: 'Botón B', action: 'Dash / Cancelar / Menú', desc: 'Esquiva rápidamente o cierra menús' },
    x: { label: 'Botón X', action: 'Habilidad 1 (Quick Slot 1)', desc: 'Desata tu habilidad primaria' },
    y: { label: 'Botón Y', action: 'Habilidad 2 (Quick Slot 2)', desc: 'Desata tu habilidad secundaria' },
    l1: { label: 'Gatillo L1', action: 'Usar Poción de Vida', desc: 'Consume una poción de recuperación' },
    r1: { label: 'Gatillo R1', action: 'Habilidad 3 / Especial', desc: 'Habilidad definitiva o ataque en área' },
    l2: { label: 'Gatillo L2', action: 'Menú de Hada / Atributos', desc: 'Abre el estado y poderes de tu hada' },
    r2: { label: 'Gatillo R2', action: 'Inventario de Equipo', desc: 'Abre tus armas, armaduras y accesorios' },
    dpad_up: { label: 'D-Pad Arriba', action: 'Mover Arriba', desc: 'Desplaza al personaje hacia el norte' },
    dpad_down: { label: 'D-Pad Abajo', action: 'Mover Abajo', desc: 'Desplaza al personaje hacia el sur' },
    dpad_left: { label: 'D-Pad Izquierda', action: 'Mover Izquierda', desc: 'Desplaza al personaje hacia el oeste' },
    dpad_right: { label: 'D-Pad Derecha', action: 'Mover Derecha', desc: 'Desplaza al personaje hacia el este' },
    select: { label: 'Botón SELECT', action: 'Mapa de Midgard / Misiones', desc: 'Muestra el mapa del mundo y misiones activas' },
    start: { label: 'Botón START', action: 'Pausa / Opciones del Sistema', desc: 'Pausa el juego y accede al menú del sistema' }
  };

  const generateGptkContent = () => {
    return `# ==========================================================
# Zenonia 3 - gptokeyb Custom Mapping for R36S (DarkOS RE)
# Generated dynamically from Zenonia 3 PortMaster Suite
# ==========================================================

back = ${currentMapping.select}
start = ${currentMapping.start}

a = ${currentMapping.a}
b = ${currentMapping.b}
x = ${currentMapping.x}
y = ${currentMapping.y}

l1 = ${currentMapping.l1}
r1 = ${currentMapping.r1}
l2 = ${currentMapping.l2}
r2 = ${currentMapping.r2}

up = ${currentMapping.dpad_up}
down = ${currentMapping.dpad_down}
left = ${currentMapping.dpad_left}
right = ${currentMapping.dpad_right}

left_analog_up = ${currentMapping.dpad_up}
left_analog_down = ${currentMapping.dpad_down}
left_analog_left = ${currentMapping.dpad_left}
left_analog_right = ${currentMapping.dpad_right}

# Safe kill switch to DarkOS RE
hotkey = back
hotkey_start = esc
`;
  };

  const downloadGptk = () => {
    const text = generateGptkContent();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zenonia3.gptk';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyGptk = () => {
    navigator.clipboard.writeText(generateGptkContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-['Press_Start_2P'] text-[10px] text-amber-400">
                CONFIGURADOR GPTOKEYB
              </span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                R36S Dual-Stick Handheld
              </span>
            </div>
            <h2 className="text-2xl font-bold font-['Rajdhani'] text-white">
              Mapeo de Controles Físicos para DarkOS RE
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mt-1">
              Zenonia 3 originalmente requería pantalla táctil. En la R36S, <strong className="text-amber-400">gptokeyb</strong> traduce cada botón físico y stick analógico en llamadas directas al motor CLET del juego a 60 Hz.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={downloadGptk}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-sm shadow transition"
            >
              <Download className="w-4 h-4" />
              Descargar .gptk
            </button>
            <button
              onClick={copyGptk}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-sm transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800">
          {Object.entries(PRESETS).map(([key, p]) => (
            <button
              key={key}
              onClick={() => {
                setActivePreset(key);
                setCurrentMapping(p.mapping);
              }}
              className={`p-3.5 rounded-xl border text-left transition ${
                activePreset === key
                  ? 'bg-amber-500/10 border-amber-500/60 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`font-['Rajdhani'] font-bold text-base ${activePreset === key ? 'text-amber-400' : 'text-slate-200'}`}>
                  {p.name}
                </span>
                {activePreset === key && <Check className="w-4 h-4 text-amber-400" />}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {p.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Controller Grid & Button Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Buttons List */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-['Press_Start_2P'] text-xs text-amber-400">
              BOTONES DEL DISPOSITIVO
            </h3>
            <span className="text-xs text-slate-400">Haz clic para inspeccionar</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(Object.keys(buttonLabels) as (keyof R36SMapping)[]).map((btnKey) => {
              const info = buttonLabels[btnKey];
              const isSelected = selectedButton === btnKey;

              return (
                <button
                  key={btnKey}
                  onClick={() => setSelectedButton(btnKey)}
                  className={`p-3 rounded-lg border text-left flex items-start justify-between transition ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500/80 shadow-md'
                      : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-['Press_Start_2P'] text-[9px] ${isSelected ? 'text-amber-300' : 'text-slate-300'}`}>
                        {info.label}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {info.action}
                    </div>
                  </div>

                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                    {currentMapping[btnKey]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Button Details & Live .gptk Output */}
        <div className="lg:col-span-5 space-y-6">
          {/* Selected Button Card */}
          {selectedButton && (
            <div className="bg-slate-900 border-2 border-amber-500/40 rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-['Press_Start_2P'] text-amber-400 mb-2">
                <Sliders className="w-4 h-4" />
                <span>{buttonLabels[selectedButton].label}</span>
              </div>

              <div className="text-lg font-bold font-['Rajdhani'] text-white">
                {buttonLabels[selectedButton].action}
              </div>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {buttonLabels[selectedButton].desc}
              </p>

              <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Clave mapeada en gptokeyb:</span>
                <span className="font-mono text-sm text-amber-400 font-bold">
                  {selectedButton} = {currentMapping[selectedButton]}
                </span>
              </div>
            </div>
          )}

          {/* Generated gptk Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <span className="font-mono text-xs text-slate-300 font-semibold">
                zenonia3.gptk (Previsualización)
              </span>
              <span className="text-[10px] text-emerald-400">✓ Válido para DarkOS RE</span>
            </div>

            <div className="p-4 bg-slate-950/80 font-mono text-xs text-slate-300 max-h-[220px] overflow-y-auto">
              <pre>{generateGptkContent()}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
