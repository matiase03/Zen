import React, { useState } from 'react';
import { 
  CheckCircle2, FolderDown, Cpu, Tv, RefreshCw, 
  HelpCircle, ArrowRight, ShieldCheck, AlertCircle, FileCheck
} from 'lucide-react';

export const DarkOSGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'single_sd' | 'dual_sd'>('single_sd');

  return (
    <div className="w-full max-w-5xl mx-auto my-6 space-y-6">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-['Press_Start_2P'] text-[10px] text-amber-400">
            GUÍA DE INSTALACIÓN PASO A PASO
          </span>
          <span className="text-xs bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded border border-indigo-700/50">
            R36S • DarkOS RE (ArkOS Fork)
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-['Rajdhani'] text-white">
          Cómo Instalar Zenonia 3 en tu R36S con DarkOS RE
        </h2>
        <p className="text-slate-300 text-sm max-w-3xl mt-2 leading-relaxed">
          <strong>DarkOS RE</strong> (DarkOS Retro Edition) es una de las distribuciones más rápidas y optimizadas para la consola <strong>R36S</strong>. Sigue estos pasos para que el juego aparezca en la sección de <strong>PORTS</strong> con controles nativos y pantalla completa en <strong>640x480</strong>.
        </p>

        {/* SD Card Setup Toggle */}
        <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-800">
          <span className="text-xs text-slate-400">¿Cómo tienes configurada tu R36S?</span>
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setActiveTab('single_sd')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === 'single_sd'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1 Sola Tarjeta SD (TF1)
            </button>
            <button
              onClick={() => setActiveTab('dual_sd')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === 'dual_sd'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2 Tarjetas SD (TF1 Sistema + TF2 Juegos)
            </button>
          </div>
        </div>
      </div>

      {/* Step by Step Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-400 font-['Press_Start_2P'] text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Descarga</span>
            </div>

            <h3 className="text-lg font-bold font-['Rajdhani'] text-white mb-2">
              Descarga el ZIP de Zenonia 3
            </h3>

            <p className="text-slate-300 text-xs leading-relaxed">
              Descarga el paquete preparado desde la pestaña <strong className="text-amber-400">Paquete PortMaster</strong> de esta aplicación (<code className="text-amber-300">zenonia3_r36s_portmaster.zip</code>).
            </p>

            <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400">
              El archivo contiene el ejecutable <strong className="text-slate-200">Zenonia 3.sh</strong> y la carpeta <strong className="text-slate-200">zenonia3/</strong> con la librería <strong className="text-slate-200">libgameDSO.so</strong> y los datos de tu APK.
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-400 font-['Press_Start_2P'] text-xs flex items-center justify-center font-bold">
                2
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Copiar a la SD</span>
            </div>

            <h3 className="text-lg font-bold font-['Rajdhani'] text-white mb-2">
              Copia los archivos a la carpeta de Ports
            </h3>

            <p className="text-slate-300 text-xs leading-relaxed">
              Apaga la R36S, saca la tarjeta MicroSD e insértala en tu ordenador mediante un lector de tarjetas USB:
            </p>

            <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-amber-300 space-y-1">
              {activeTab === 'single_sd' ? (
                <>
                  <div>Partición: <span className="text-white">EASYROMS</span> (o <span className="text-white">ROMS</span>)</div>
                  <div>Ruta destino: <span className="text-emerald-400 font-bold">/roms/ports/</span></div>
                </>
              ) : (
                <>
                  <div>Tarjeta: <span className="text-white">TF2 (Ranura Derecha de Juegos)</span></div>
                  <div>Ruta destino: <span className="text-emerald-400 font-bold">/roms2/ports/</span> (o <span className="text-emerald-400 font-bold">/ports/</span>)</div>
                </>
              )}
            </div>

            <div className="text-[11px] text-slate-400 mt-2">
              Debes colocar el archivo <code>Zenonia 3.sh</code> directamente dentro de la carpeta <code>ports</code>, y la carpeta <code>zenonia3</code> a su lado.
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-400 font-['Press_Start_2P'] text-xs flex items-center justify-center font-bold">
                3
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Permisos</span>
            </div>

            <h3 className="text-lg font-bold font-['Rajdhani'] text-white mb-2">
              Verifica los Permisos de Ejecución
            </h3>

            <p className="text-slate-300 text-xs leading-relaxed">
              En sistemas basados en Linux como DarkOS RE / ArkOS, el archivo <code>.sh</code> debe tener permisos de ejecución para poder abrirse:
            </p>

            <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
              <div className="text-slate-500"># Si tienes acceso por terminal o SSH:</div>
              <div className="text-amber-400">chmod +x /roms/ports/"Zenonia 3.sh"</div>
              <div className="text-amber-400">chmod +x /roms/ports/zenonia3/*.sh</div>
            </div>

            <div className="text-[11px] text-slate-400 mt-2">
              * Si usas Windows para copiar los archivos a una partición exFAT/FAT32, DarkOS RE los asigna automáticamente al arrancar.
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-400 font-['Press_Start_2P'] text-xs flex items-center justify-center font-bold">
                4
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">A Jugar</span>
            </div>

            <h3 className="text-lg font-bold font-['Rajdhani'] text-white mb-2">
              Arranca Zenonia 3 en DarkOS RE
            </h3>

            <p className="text-slate-300 text-xs leading-relaxed">
              Vuelve a insertar la tarjeta en tu R36S y enciende la consola:
            </p>

            <ol className="mt-3 space-y-1.5 text-xs text-slate-300 list-decimal list-inside bg-slate-950 p-3 rounded-lg border border-slate-800">
              <li>En el menú principal de DarkOS RE, entra en la sección <strong className="text-amber-400">PORTS</strong>.</li>
              <li>Si no ves la lista actualizada, pulsa <kbd className="bg-slate-800 px-1 rounded text-white">SELECT</kbd> y elige <strong className="text-slate-200">Refresh Gamelist</strong>.</li>
              <li>Verás <strong className="text-amber-400">Zenonia 3: The Midgard Story</strong> con su carátula.</li>
              <li>¡Pulsa <kbd className="bg-slate-800 px-1 rounded text-white">A</kbd> para iniciar el juego!</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Troubleshooting and Tips Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
        <h3 className="font-['Press_Start_2P'] text-xs text-amber-400 flex items-center gap-2 mb-4">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          CONSEJOS Y PREGUNTAS FRECUENTES (R36S)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-950/70 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <Tv className="w-4 h-4 text-amber-400" />
              <span>Resolución 640x480</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              La pantalla IPS de la R36S tiene exactamente 640x480 píxeles a 4:3. Zenonia 3 se ajusta al píxel perfecto sin bandas negras ni estiramiento deformado.
            </p>
          </div>

          <div className="p-4 bg-slate-950/70 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Rendimiento Rockchip RK3326</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              El script <code>Zenonia 3.sh</code> activa automáticamente el gobernador <strong className="text-slate-300">performance</strong> en la CPU Cortex-A35 para garantizar 60 FPS estables.
            </p>
          </div>

          <div className="p-4 bg-slate-950/70 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Salida Segura (HotKey)</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Para salir del juego en cualquier momento y guardar tu partida, pulsa simultáneamente <kbd className="bg-slate-800 px-1 rounded text-white">SELECT + START</kbd>. Volverás directamente a DarkOS RE.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
