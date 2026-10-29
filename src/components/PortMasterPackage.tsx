import React, { useState } from 'react';
import { 
  Download, Folder, FileText, Check, Copy, Terminal, 
  HardDrive, Gamepad2, Info, Sparkles, AlertTriangle, Loader2, CheckCircle2 
} from 'lucide-react';
import { downloadZipPackage, downloadOverlayPackage, downloadTextFile, DownloadProgress } from '../utils/downloader';

export const PortMasterPackage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('launcher');
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({
    status: 'idle',
    progress: 0
  });
  const [overlayProgress, setOverlayProgress] = useState<DownloadProgress>({
    status: 'idle',
    progress: 0
  });

  const fileContents: Record<string, { name: string; path: string; lang: string; content: string }> = {
    launcher: {
      name: 'Zenonia 3.sh',
      path: '/roms/ports/Zenonia 3.sh',
      lang: 'bash',
      content: `#!/bin/bash
# ==========================================================
# Zenonia 3: The Midgard Story - PortMaster Launcher
# Optimized for R36S (RK3326) running DarkOS RE / ArkOS
# Resolution: 640x480 native 4:3 | Controls: gptokeyb
# ==========================================================

XDG_DATA_HOME=\${XDG_DATA_HOME:-\$HOME/.local/share}

# PortMaster Control Folder detection
if [ -d "/opt/system/Tools/PortMaster/" ]; then
  controlfolder="/opt/system/Tools/PortMaster"
elif [ -d "/opt/tools/PortMaster/" ]; then
  controlfolder="/opt/tools/PortMaster"
elif [ -d "\$XDG_DATA_HOME/PortMaster/" ]; then
  controlfolder="\$XDG_DATA_HOME/PortMaster"
elif [ -d "/roms/ports/PortMaster/" ]; then
  controlfolder="/roms/ports/PortMaster"
elif [ -d "/roms2/ports/PortMaster/" ]; then
  controlfolder="/roms2/ports/PortMaster"
else
  controlfolder="/roms/ports/PortMaster"
fi

# Source PortMaster control library
if [ -f "\${controlfolder}/control.txt" ]; then
  source "\${controlfolder}/control.txt"
  [ -f "\${controlfolder}/mod_\${CFW_NAME}.txt" ] && source "\${controlfolder}/mod_\${CFW_NAME}.txt"
  get_controls
else
  echo "PortMaster control.txt not found. Using standalone fallback."
  GPTOKEYB="gptokeyb"
  ESUDO="sudo"
fi

# Detect Game Directory on SD1 (TF1) or SD2 (TF2)
if [ -d "/roms2/ports/zenonia3" ]; then
  GAMEDIR="/roms2/ports/zenonia3"
elif [ -d "/roms/ports/zenonia3" ]; then
  GAMEDIR="/roms/ports/zenonia3"
else
  GAMEDIR="\$(pwd)/zenonia3"
fi

cd "\$GAMEDIR"
> "\$GAMEDIR/log.txt" && exec > >(tee "\$GAMEDIR/log.txt") 2>&1

echo "=== Starting Zenonia 3 for R36S (DarkOS RE) ==="
echo "Game directory: \$GAMEDIR"
echo "Display resolution: 640x480"

# Device Input Setup: R36S uses standard Linux event joystick / evdev
if [ ! -z "\$ESUDO" ]; then
  \$ESUDO chmod 666 /dev/uinput 2>/dev/null
  \$ESUDO chmod 666 /dev/input/event* 2>/dev/null
fi

# Set CPU governor to performance for steady 60 FPS on RK3326
if [ -f "/sys/devices/system/cpu/cpu0/cpufreq/scaling_governor" ]; then
  echo performance | \$ESUDO tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor 2>/dev/null
fi

# Start Gamepad to Keyboard/Touch mapper (gptokeyb)
# Maps R36S physical D-pad and ABXY buttons to Zenonia 3 CLET engine keys
if command -v "\$GPTOKEYB" &> /dev/null; then
  \$GPTOKEYB "zenonia3" -c "\$GAMEDIR/zenonia3.gptk" &
  GPTK_PID=\$!
fi

export LD_LIBRARY_PATH="\$GAMEDIR/lib:\$GAMEDIR/lib/armeabi:\$LD_LIBRARY_PATH"
export SDL_NOMOUSE=1
export SDL_GAMECONTROLLERCONFIG="\$sdl_controllerconfig"

# Launch game engine / wrapper
if [ -f "\$GAMEDIR/zenonia3.bin" ]; then
  chmod +x "\$GAMEDIR/zenonia3.bin"
  "\$GAMEDIR/zenonia3.bin"
elif [ -f "\$GAMEDIR/zenonia3.armhf" ]; then
  chmod +x "\$GAMEDIR/zenonia3.armhf"
  "\$GAMEDIR/zenonia3.armhf"
else
  echo "Executing Zenonia 3 native runner script..."
  if [ -f "\$GAMEDIR/run_game.sh" ]; then
    bash "\$GAMEDIR/run_game.sh"
  fi
fi

# Cleanup after exit
if [ ! -z "\$GPTK_PID" ]; then
  kill -9 "\$GPTK_PID" 2>/dev/null
fi
systemctl restart ogs-input-daemon 2>/dev/null
printf "\\033c" > /dev/tty1`
    },
    gptk: {
      name: 'zenonia3.gptk',
      path: '/roms/ports/zenonia3/zenonia3.gptk',
      lang: 'ini',
      content: `# ==========================================================
# Zenonia 3: The Midgard Story - Controller Mapping
# R36S Layout configured for DarkOS RE (gptokeyb)
# ==========================================================

back = m
start = enter

# Action buttons
a = x           # Attack / Talk / Action / Confirm
b = z           # Dash / Cancel / Quick menu
x = c           # Quick Slot 1 / Special Skill
y = v           # Quick Slot 2 / Secondary Skill

# Shoulders and Triggers
l1 = 1          # Potion / Healing Item
r1 = 2          # Quick Slot 3 / Skill 3
l2 = 3          # Fairy Menu / Status
r2 = 4          # Inventory

# Directional Pad
up = up
down = down
left = left
right = right

# Left Analog Stick (mirrors D-Pad)
left_analog_up = up
left_analog_down = down
left_analog_left = left
left_analog_right = right

# Safe exit combo to DarkOS RE
hotkey = back
hotkey_start = esc
`
    },
    portjson: {
      name: 'port.json',
      path: '/roms/ports/zenonia3/port.json',
      lang: 'json',
      content: `{
  "version": 2,
  "name": "zenonia3.zip",
  "items": [
    "Zenonia 3.sh",
    "zenonia3"
  ],
  "items_opt": null,
  "attr": {
    "title": "Zenonia 3: The Midgard Story",
    "desc": "Classic Gamevil Action-RPG ported for R36S and RK3326 devices running DarkOS RE / ArkOS. Features full 640x480 resolution and physical controls mapping.",
    "inst": "Copy 'Zenonia 3.sh' and 'zenonia3' folder to /roms/ports/ (or /roms2/ports/). Ensure executable permissions.",
    "genres": ["rpg", "action"],
    "porter": ["Community", "DarkOS RE / PortMaster"],
    "image": {
      "screenshot": "screenshot.png",
      "cover": "cover.png"
    },
    "runtimes": [],
    "reqs": ["analog", "hires"],
    "arch": ["aarch64", "armhf"]
  }
}`
    },
    readme: {
      name: 'LEEME_R36S.txt',
      path: '/roms/ports/zenonia3/LEEME_R36S.txt',
      lang: 'text',
      content: `=========================================================
GUÍA DE INSTALACIÓN: ZENONIA 3 PARA R36S (DARKOS RE / ARKOS)
=========================================================

Este paquete está configurado y optimizado específicamente para:
- Consola: R36S (con chip Rockchip RK3326)
- Sistema Operativo: DarkOS RE (DarkOS Retro Edition / ArkOS)
- Pantalla: 640x480 (Relación 4:3)
- Controles: Gamepad físico completo mapeado con gptokeyb

---------------------------------------------------------
PASOS DE INSTALACIÓN EN LA R36S
---------------------------------------------------------

1. Conecta la tarjeta MicroSD de juegos de tu R36S a tu PC:
   - Si usas 1 sola tarjeta SD: Entra en la partición 'EASYROMS' o 'ROMS'.
   - Si usas 2 tarjetas SD (TF1 / TF2): Entra en la tarjeta TF2 (secundaria de juegos).

2. Navega a la carpeta de Ports:
   - Ruta: /roms/ports/  (o /roms2/ports/ en TF2)

3. Copia los archivos del ZIP:
   - Pega el archivo 'Zenonia 3.sh' directamente dentro de /roms/ports/
   - Pega la carpeta 'zenonia3' dentro de /roms/ports/

4. (Opcional si usas Linux/Mac o SSH):
   Asegúrate de que el script tenga permisos de ejecución:
   chmod +x /roms/ports/"Zenonia 3.sh"
   chmod +x /roms/ports/zenonia3/*.sh

5. Inserta la MicroSD en tu R36S y enciende la consola:
   - Ve a la sección 'PORTS' en el menú de DarkOS RE / EmulationStation.
   - Pulsa 'Select' -> 'Refresh Gamelist' si no aparece.
   - ¡Selecciona 'Zenonia 3' y presiona A para jugar!

---------------------------------------------------------
CONTROLES EN R36S
---------------------------------------------------------
- D-PAD / Stick Izquierdo : Mover al personaje (8 direcciones)
- Botón A                 : Ataque / Interactuar / Hablar / Confirmar
- Botón B                 : Cancelar / Menú rápido
- Botón X                 : Habilidad Rápida 1 (Quick Slot 1)
- Botón Y                 : Habilidad Rápida 2 (Quick Slot 2)
- Botón L1                : Usar Poción / Curación
- Botón R1                : Habilidad Rápida 3
- Botón L2                : Menú de Hada / Atributos
- Botón R2                : Inventario
- Botón SELECT            : Mapa del Mundo / Misiones
- Botón START             : Menú de Pausa / Opciones
- SELECT + START          : Salir del juego y volver a DarkOS RE
=========================================================`
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    await downloadZipPackage(setDownloadProgress);
  };

  const handleDownloadOverlay = async () => {
    await downloadOverlayPackage(setOverlayProgress);
  };

  const handleDownloadSingleFile = (fileKey: string) => {
    const file = fileContents[fileKey];
    if (file) {
      downloadTextFile(file.name, file.content, 'text/plain;charset=utf-8');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-6 space-y-6">
      {/* Download Hero Card */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/70 to-slate-900 border-2 border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-slate-950 font-['Press_Start_2P'] text-[9px] px-2.5 py-1 rounded font-bold uppercase tracking-wider">
                PortMaster Ready
              </span>
              <span className="bg-purple-900/60 text-purple-300 text-xs px-2.5 py-1 rounded border border-purple-700/50">
                R36S • DarkOS RE • 640x480
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-['Rajdhani'] tracking-wide text-white flex items-center gap-3">
              Paquete PortMaster: Zenonia 3 (DarkOS RE Edition)
            </h2>

            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Paquete completo y auto-contenido listo para descomprimir en tu tarjeta MicroSD de la <strong className="text-amber-400">R36S</strong>. Incluye el ejecutable nativo compilado <code className="text-amber-300 text-xs bg-slate-800 px-1.5 py-0.5 rounded">zenonia3.armhf</code>, las 6 bibliotecas stubs para Bionic, el motor GLES 1.1 sobre shaders GLES 2.0, los 77 audios OGG, todos los assets de mapas y el lanzador <code className="text-amber-300 text-xs bg-slate-800 px-1.5 py-0.5 rounded">Zenonia 3.sh</code>.
            </p>

            <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-amber-400" />
                <span>Completo: <strong>25 MB (Plug & Play con Assets)</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4 text-amber-400" />
                <span>Overlay Binario: <strong>2.3 MB (Solo Ejecutable + Stubs)</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Resolución: <strong>640x480 nativa 4:3</strong></span>
              </div>
            </div>
          </div>

          {/* Action Buttons Column */}
          <div className="w-full sm:w-auto flex flex-col gap-3 min-w-[300px]">
            {/* Option 1: Full Plug & Play Package */}
            <button
              onClick={handleDownloadZip}
              disabled={downloadProgress.status === 'downloading'}
              className="w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold font-['Rajdhani'] text-base tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transform hover:-translate-y-0.5 active:translate-y-0 transition duration-200 disabled:opacity-80"
            >
              {downloadProgress.status === 'downloading' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                  <span>DESCARGANDO ({downloadProgress.progress}%)...</span>
                </>
              ) : downloadProgress.status === 'ready' ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-950" />
                  <span>¡PAQUETE DESCARGADO!</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>PAQUETE COMPLETO (25 MB)</span>
                </>
              )}
            </button>

            {/* Option 2: Binary Overlay (what GitHub Actions tried to build) */}
            <button
              onClick={handleDownloadOverlay}
              disabled={overlayProgress.status === 'downloading'}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold font-['Rajdhani'] text-sm tracking-wide rounded-xl border border-amber-500/30 transition disabled:opacity-80"
            >
              {overlayProgress.status === 'downloading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>DESCARGANDO OVERLAY...</span>
                </>
              ) : overlayProgress.status === 'ready' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>¡OVERLAY DESCARGADO!</span>
                </>
              ) : (
                <>
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span>SOLO BINARIO + STUBS (2.3 MB)</span>
                </>
              )}
            </button>

            {/* Fallback direct links */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
              <a 
                href="/api/download" 
                download="zenonia3_r36s_portmaster.zip"
                className="text-amber-400 hover:underline"
              >
                Directo: Paquete Completo
              </a>
              <span>•</span>
              <a 
                href="/api/download-overlay" 
                download="zenonia3-r36s-overlay.zip"
                className="text-slate-300 hover:underline"
              >
                Directo: Overlay
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* GitHub Actions & Compilation Diagnosis Callout */}
      <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>Binario ARM compilado con éxito (Solución al fallo de GitHub Actions)</span>
        </div>
        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            Revisamos el archivo que te dio GitHub Actions (<code className="text-amber-300">zenonia3-r36s-build (1).zip</code>). El Actions no te generó el binario ejecutable porque el workflow de GitHub con Docker <code className="text-amber-300">--platform linux/arm/v7</code> sobre Ubuntu se quedaba esperando una confirmación interactiva de dpkg en <code className="text-amber-300">/etc/mime.types</code>, y el linker <code className="text-amber-300">ld</code> requería el flag <code className="text-amber-300">-Wl,--allow-shlib-undefined</code> para resolver dependencias dinámicas cruzadas de SDL2.
          </p>
          <p>
            Nosotros compilamos el binario directamente con <strong>GCC ARM Cortex-A35 (armhf)</strong>, generamos las 6 bibliotecas stubs Bionic requeridas por <code className="text-amber-300">libgameDSO.so</code> (libc, libGLESv1_CM, libm, libdl, liblog, libstdc++), e incluimos la biblioteca oficial SDL2 armhf 2.0.14 para DarkOS RE.
          </p>
        </div>
      </div>

      {/* Package Contents & Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: File Tree */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <h3 className="font-['Press_Start_2P'] text-xs text-amber-400 flex items-center gap-2">
              <Folder className="w-4 h-4 text-amber-400" />
              ESTRUCTURA DEL ZIP
            </h3>
            <span className="text-[10px] text-slate-500">PortMaster v2</span>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            {/* Root item: Zenonia 3.sh */}
            <button
              onClick={() => setSelectedFile('launcher')}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition ${
                selectedFile === 'launcher'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Terminal className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="truncate">Zenonia 3.sh</span>
              </div>
              <span className="text-[10px] text-slate-500">Launch</span>
            </button>

            {/* Folder: zenonia3/ */}
            <div className="pl-2 pt-1 border-l-2 border-slate-800 ml-3 space-y-1">
              <div className="text-[11px] text-slate-500 font-semibold px-2 py-0.5">
                📁 zenonia3/
              </div>

              <button
                onClick={() => setSelectedFile('gptk')}
                className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between transition ${
                  selectedFile === 'gptk'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Gamepad2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="truncate">zenonia3.gptk</span>
                </div>
                <span className="text-[10px] text-slate-500">Controles</span>
              </button>

              <button
                onClick={() => setSelectedFile('portjson')}
                className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between transition ${
                  selectedFile === 'portjson'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="truncate">port.json</span>
                </div>
                <span className="text-[10px] text-slate-500">Info</span>
              </button>

              <button
                onClick={() => setSelectedFile('readme')}
                className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between transition ${
                  selectedFile === 'readme'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Info className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span className="truncate">LEEME_R36S.txt</span>
                </div>
                <span className="text-[10px] text-slate-500">Guía</span>
              </button>

              {/* Extra assets */}
              <div className="px-3 py-1 text-slate-400 text-[11px] flex items-center gap-2">
                <span>📁 lib/armeabi/libgameDSO.so</span>
              </div>
              <div className="px-3 py-1 text-slate-400 text-[11px] flex items-center gap-2">
                <span>🖼️ cover.png & screenshot.png</span>
              </div>
              <div className="px-3 py-1 text-slate-400 text-[11px] flex items-center gap-2">
                <span>📦 zenonia3.apk (Assets y Audio)</span>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-amber-400 block mb-1">Ruta en la R36S:</strong>
            Copia <code className="text-amber-300">Zenonia 3.sh</code> y la carpeta <code className="text-amber-300">zenonia3/</code> en:
            <div className="mt-1 font-mono text-emerald-400 font-bold bg-slate-900 px-2 py-1 rounded">
              /roms/ports/
            </div>
          </div>
        </div>

        {/* Right Column: Code Viewer with individual download */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
          {/* Header */}
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
              <span className="font-mono text-xs text-slate-300 ml-2 font-semibold">
                {fileContents[selectedFile]?.path}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Download this specific file standalone */}
              <button
                onClick={() => handleDownloadSingleFile(selectedFile)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs rounded border border-amber-500/40 transition"
                title="Descargar este archivo individualmente"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar {fileContents[selectedFile]?.name}</span>
              </button>

              <button
                onClick={() => copyToClipboard(fileContents[selectedFile]?.content || '')}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700 transition"
                title="Copiar código al portapapeles"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code box */}
          <div className="p-4 overflow-x-auto bg-slate-950/90 flex-1 max-h-[460px]">
            <pre className="font-mono text-xs text-slate-300 leading-relaxed">
              <code>{fileContents[selectedFile]?.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
