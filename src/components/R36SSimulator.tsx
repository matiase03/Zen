import React, { useState, useEffect, useRef } from 'react';
import { ZENONIA_CLASSES } from '../data/classes';
import { CharacterClass, PlayerStats, Monster, DamageNumber } from '../types/game';
import { soundManager } from '../utils/audio';
import { 
  Volume2, VolumeX, Maximize2, RotateCcw, 
  Gamepad2, Zap, Shield, Heart, Sparkles, Swords
} from 'lucide-react';

interface R36SSimulatorProps {
  onSelectTab?: (tab: string) => void;
}

export const R36SSimulator: React.FC<R36SSimulatorProps> = ({ onSelectTab }) => {
  // Game states: 'intro' | 'title' | 'class_select' | 'playing' | 'paused'
  const [gameState, setGameState] = useState<'intro' | 'title' | 'class_select' | 'playing' | 'paused'>('title');
  const [selectedClassIndex, setSelectedClassIndex] = useState<number>(0);
  const selectedClass = ZENONIA_CLASSES[selectedClassIndex];
  
  // Console shell color theme
  const [shellColor, setShellColor] = useState<'purple' | 'black' | 'white'>('purple');
  const [crtFilter, setCrtFilter] = useState<boolean>(true);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.7);
  const [r36sScale, setR36sScale] = useState<'fit' | 'large'>('fit');
  
  // Gamepad/Key active states for visual button presses on R36S bezel
  const [activeButtons, setActiveButtons] = useState<Record<string, boolean>>({});

  // Player RPG stats
  const [stats, setStats] = useState<PlayerStats>({
    hp: 420,
    maxHp: 420,
    sp: 180,
    maxSp: 180,
    level: 1,
    exp: 0,
    maxExp: 100,
    gold: 350,
    zen: 50,
    attack: 48,
    defense: 28,
    critRate: 15,
  });

  const [potionCount, setPotionCount] = useState<number>(5);
  const [killCount, setKillCount] = useState<number>(0);
  const [activeDialogue, setActiveDialogue] = useState<string | null>(
    "¡Chale! Las hadas de Deva han detectado una brecha oscura en Midgard. ¡Usa tu espada y defiende el reino!"
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Player position and movement in 640x480 screen
  const playerRef = useRef({
    x: 320,
    y: 240,
    vx: 0,
    vy: 0,
    dir: 'down' as 'up' | 'down' | 'left' | 'right',
    isAttacking: false,
    attackTimer: 0,
    attackFrame: 0,
    combo: 0,
    skillCooldowns: [0, 0, 0],
    invulnerableTimer: 0,
  });

  // Monsters list in canvas
  const monstersRef = useRef<Monster[]>([
    { id: 1, name: 'Limo de Midgard', type: 'slime', x: 180, y: 150, hp: 90, maxHp: 90, attack: 14, defense: 4, speed: 1.2, expReward: 35, goldReward: 25 },
    { id: 2, name: 'Limo de Midgard', type: 'slime', x: 460, y: 170, hp: 90, maxHp: 90, attack: 14, defense: 4, speed: 1.2, expReward: 35, goldReward: 25 },
    { id: 3, name: 'Lobo Umbrío', type: 'wolf', x: 200, y: 340, hp: 150, maxHp: 150, attack: 22, defense: 8, speed: 1.8, expReward: 55, goldReward: 40 },
    { id: 4, name: 'Goblin Deva', type: 'goblin', x: 440, y: 320, hp: 180, maxHp: 180, attack: 26, defense: 10, speed: 1.4, expReward: 70, goldReward: 60 },
  ]);

  const damageNumbersRef = useRef<DamageNumber[]>([]);
  const slashParticlesRef = useRef<{ x: number; y: number; size: number; alpha: number; color: string }[]>([]);
  const fairyRef = useRef({ x: 340, y: 220, angle: 0 });

  // Handle Button Press (Visual + Game Logic)
  const pressButton = (btn: string) => {
    setActiveButtons(prev => ({ ...prev, [btn]: true }));

    if (btn === 'start') {
      soundManager.playSfx('menu_select');
      if (gameState === 'title') {
        setGameState('class_select');
      } else if (gameState === 'class_select') {
        setGameState('playing');
        soundManager.playSfx('s000.ogg');
      } else if (gameState === 'playing') {
        setGameState('paused');
      } else if (gameState === 'paused') {
        setGameState('playing');
      }
      return;
    }

    if (btn === 'select') {
      soundManager.playSfx('menu_select');
      if (activeDialogue) {
        setActiveDialogue(null);
      } else {
        setActiveDialogue("Mapa de Midgard: El Templo de los Deva se encuentra al norte. Los portales oscuros están activos.");
      }
      return;
    }

    if (gameState === 'class_select') {
      if (btn === 'dpad_left' || btn === 'left') {
        soundManager.playSfx('s000.ogg');
        setSelectedClassIndex(prev => (prev > 0 ? prev - 1 : ZENONIA_CLASSES.length - 1));
      } else if (btn === 'dpad_right' || btn === 'right') {
        soundManager.playSfx('s000.ogg');
        setSelectedClassIndex(prev => (prev < ZENONIA_CLASSES.length - 1 ? prev + 1 : 0));
      } else if (btn === 'a') {
        soundManager.playSfx('s009.ogg');
        setGameState('playing');
      } else if (btn === 'b') {
        setGameState('title');
      }
      return;
    }

    if (gameState === 'playing') {
      // Actions
      if (btn === 'a') {
        triggerAttack();
      } else if (btn === 'x') {
        triggerSkill(0);
      } else if (btn === 'y') {
        triggerSkill(1);
      } else if (btn === 'r1') {
        triggerSkill(2);
      } else if (btn === 'l1') {
        usePotion();
      } else if (btn === 'b') {
        // Dash
        triggerDash();
      }
    }
  };

  const releaseButton = (btn: string) => {
    setActiveButtons(prev => ({ ...prev, [btn]: false }));
  };

  // Keyboard controls listener
  useEffect(() => {
    const keyMap: Record<string, string> = {
      ArrowUp: 'dpad_up',
      KeyW: 'dpad_up',
      ArrowDown: 'dpad_down',
      KeyS: 'dpad_down',
      ArrowLeft: 'dpad_left',
      KeyA: 'dpad_left',
      ArrowRight: 'dpad_right',
      KeyD: 'dpad_right',
      KeyZ: 'a',       // A on R36S = Action / Attack
      KeyJ: 'a',
      KeyX: 'b',       // B on R36S = Dash / Cancel
      KeyK: 'b',
      KeyC: 'x',       // X on R36S = Skill 1
      KeyU: 'x',
      KeyV: 'y',       // Y on R36S = Skill 2
      KeyI: 'y',
      Digit1: 'l1',    // L1 = Potion
      Digit2: 'r1',    // R1 = Skill 3
      Digit3: 'l2',
      Digit4: 'r2',
      Enter: 'start',  // Start
      KeyM: 'select',  // Select / Map
      Backspace: 'select',
      Escape: 'start'
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const btn = keyMap[e.code];
      if (btn) {
        e.preventDefault();
        pressButton(btn);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const btn = keyMap[e.code];
      if (btn) {
        releaseButton(btn);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, selectedClassIndex]);

  // Attack trigger
  const triggerAttack = () => {
    const p = playerRef.current;
    if (p.isAttacking && p.attackTimer > 6) return;

    p.isAttacking = true;
    p.attackTimer = 16;
    p.combo = (p.combo + 1) % 3;
    soundManager.playSfx(p.combo === 2 ? 's014.ogg' : 's001.ogg');

    // Spawn slash particles
    const reach = 45;
    let slashX = p.x;
    let slashY = p.y;
    if (p.dir === 'up') slashY -= reach;
    if (p.dir === 'down') slashY += reach;
    if (p.dir === 'left') slashX -= reach;
    if (p.dir === 'right') slashX += reach;

    for (let i = 0; i < 8; i++) {
      slashParticlesRef.current.push({
        x: slashX + (Math.random() - 0.5) * 30,
        y: slashY + (Math.random() - 0.5) * 30,
        size: Math.random() * 6 + 3,
        alpha: 1.0,
        color: p.combo === 2 ? '#f59e0b' : '#38bdf8'
      });
    }

    // Hit monsters in range
    let hitAny = false;
    monstersRef.current.forEach(m => {
      const dist = Math.hypot(m.x - slashX, m.y - slashY);
      if (dist < 46) {
        hitAny = true;
        const isCrit = Math.random() * 100 < stats.critRate;
        const baseDmg = stats.attack + Math.floor(Math.random() * 16) - 5;
        const finalDmg = isCrit ? Math.floor(baseDmg * 1.8) : baseDmg;

        m.hp -= Math.max(1, finalDmg - m.defense);
        m.isHit = true;
        m.hitTimer = 10;

        // Knockback
        if (p.dir === 'up') m.y -= 15;
        if (p.dir === 'down') m.y += 15;
        if (p.dir === 'left') m.x -= 15;
        if (p.dir === 'right') m.x += 15;

        // Damage number
        damageNumbersRef.current.push({
          id: Date.now() + Math.random(),
          text: finalDmg,
          x: m.x,
          y: m.y - 20,
          color: isCrit ? '#f59e0b' : '#ffffff',
          opacity: 1.0,
          isCrit
        });
      }
    });

    if (hitAny) {
      soundManager.playSfx('s003.ogg');
    }
  };

  // Skill trigger
  const triggerSkill = (slot: number) => {
    const p = playerRef.current;
    const skill = selectedClass.skills[slot];
    if (!skill) return;

    if (stats.sp < skill.spCost) {
      soundManager.playSfx('s012.ogg');
      damageNumbersRef.current.push({
        id: Date.now(),
        text: '¡Sin SP!',
        x: p.x,
        y: p.y - 30,
        color: '#60a5fa',
        opacity: 1.0
      });
      return;
    }

    // Deduct SP
    setStats(prev => ({ ...prev, sp: prev.sp - skill.spCost }));
    soundManager.playSfx(slot === 0 ? 's005.ogg' : slot === 1 ? 's006.ogg' : 's021.ogg');

    // AoE burst around player
    monstersRef.current.forEach(m => {
      const dist = Math.hypot(m.x - p.x, m.y - p.y);
      if (dist < 130) {
        const dmg = Math.floor(skill.damage * (1 + stats.level * 0.15));
        m.hp -= Math.max(1, dmg - m.defense);
        m.isHit = true;
        m.hitTimer = 15;

        damageNumbersRef.current.push({
          id: Date.now() + Math.random(),
          text: `💥 ${dmg}`,
          x: m.x,
          y: m.y - 25,
          color: '#fbbf24',
          opacity: 1.0,
          isCrit: true
        });
      }
    });

    // Ring of particles
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
      slashParticlesRef.current.push({
        x: p.x + Math.cos(angle) * 30,
        y: p.y + Math.sin(angle) * 30,
        size: 8,
        alpha: 1.0,
        color: slot === 0 ? '#38bdf8' : slot === 1 ? '#a855f7' : '#10b981'
      });
    }
  };

  const usePotion = () => {
    if (potionCount <= 0) return;
    if (stats.hp >= stats.maxHp && stats.sp >= stats.maxSp) return;

    setPotionCount(prev => prev - 1);
    soundManager.playSfx('s007.ogg');
    const healHp = Math.floor(stats.maxHp * 0.45);
    const healSp = Math.floor(stats.maxSp * 0.45);

    setStats(prev => ({
      ...prev,
      hp: Math.min(prev.maxHp, prev.hp + healHp),
      sp: Math.min(prev.maxSp, prev.sp + healSp),
    }));

    damageNumbersRef.current.push({
      id: Date.now(),
      text: `+${healHp} HP`,
      x: playerRef.current.x,
      y: playerRef.current.y - 30,
      color: '#4ade80',
      opacity: 1.0
    });
  };

  const triggerDash = () => {
    const p = playerRef.current;
    soundManager.playSfx('s004.ogg');
    const dashDist = 48;
    if (p.dir === 'up') p.y = Math.max(40, p.y - dashDist);
    if (p.dir === 'down') p.y = Math.min(430, p.y + dashDist);
    if (p.dir === 'left') p.x = Math.max(40, p.x - dashDist);
    if (p.dir === 'right') p.x = Math.min(600, p.x + dashDist);
    p.invulnerableTimer = 15;
  };

  // 60FPS Game Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tick = 0;

    const loop = () => {
      tick++;

      // Update game entities if in 'playing' state
      if (gameState === 'playing') {
        const p = playerRef.current;
        const speed = 3.2;

        // Player movement according to active D-Pad or stick
        let moveX = 0;
        let moveY = 0;
        if (activeButtons['dpad_up'] || activeButtons['up']) { moveY -= 1; p.dir = 'up'; }
        if (activeButtons['dpad_down'] || activeButtons['down']) { moveY += 1; p.dir = 'down'; }
        if (activeButtons['dpad_left'] || activeButtons['left']) { moveX -= 1; p.dir = 'left'; }
        if (activeButtons['dpad_right'] || activeButtons['right']) { moveX += 1; p.dir = 'right'; }

        if (moveX !== 0 && moveY !== 0) {
          moveX *= 0.7071;
          moveY *= 0.7071;
        }

        p.x = Math.max(40, Math.min(600, p.x + moveX * speed));
        p.y = Math.max(40, Math.min(440, p.y + moveY * speed));

        if (p.attackTimer > 0) p.attackTimer--;
        if (p.attackTimer === 0) p.isAttacking = false;
        if (p.invulnerableTimer > 0) p.invulnerableTimer--;

        // Fairy movement (orbits player)
        fairyRef.current.angle += 0.05;
        fairyRef.current.x = p.x + Math.cos(fairyRef.current.angle) * 32;
        fairyRef.current.y = p.y - 12 + Math.sin(fairyRef.current.angle) * 16;

        // Monsters AI & respawn
        monstersRef.current.forEach(m => {
          if (m.isHit && m.hitTimer && m.hitTimer > 0) {
            m.hitTimer--;
            if (m.hitTimer === 0) m.isHit = false;
          }

          // Move toward player if alive
          if (m.hp > 0) {
            const dx = p.x - m.x;
            const dy = p.y - m.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 28 && dist < 240) {
              m.x += (dx / dist) * m.speed;
              m.y += (dy / dist) * m.speed;
            }

            // Attack player
            if (dist <= 30 && p.invulnerableTimer === 0 && tick % 45 === 0) {
              const enemyDmg = Math.max(2, m.attack - Math.floor(stats.defense * 0.4));
              soundManager.playSfx('s003.ogg');
              p.invulnerableTimer = 20;

              setStats(prev => {
                const nextHp = Math.max(0, prev.hp - enemyDmg);
                return { ...prev, hp: nextHp };
              });

              damageNumbersRef.current.push({
                id: Date.now() + Math.random(),
                text: `-${enemyDmg}`,
                x: p.x,
                y: p.y - 25,
                color: '#ef4444',
                opacity: 1.0
              });
            }
          } else {
            // Respawn monster after death
            m.x = 80 + Math.random() * 480;
            m.y = 80 + Math.random() * 320;
            m.hp = m.maxHp;
            setKillCount(k => k + 1);
            soundManager.playSfx('s026.ogg');

            // Give EXP & Gold
            setStats(prev => {
              const newExp = prev.exp + m.expReward;
              const newGold = prev.gold + m.goldReward;
              if (newExp >= prev.maxExp) {
                soundManager.playSfx('s009.ogg');
                return {
                  ...prev,
                  level: prev.level + 1,
                  exp: newExp - prev.maxExp,
                  maxExp: Math.floor(prev.maxExp * 1.5),
                  maxHp: prev.maxHp + 45,
                  hp: prev.maxHp + 45,
                  maxSp: prev.maxSp + 20,
                  sp: prev.maxSp + 20,
                  attack: prev.attack + 6,
                  defense: prev.defense + 4,
                  gold: newGold
                };
              }
              return { ...prev, exp: newExp, gold: newGold };
            });
          }
        });

        // Update damage numbers
        damageNumbersRef.current.forEach(d => {
          d.y -= 0.8;
          d.opacity -= 0.02;
        });
        damageNumbersRef.current = damageNumbersRef.current.filter(d => d.opacity > 0);

        // Update slash particles
        slashParticlesRef.current.forEach(pt => {
          pt.alpha -= 0.04;
          pt.size = Math.max(0.5, pt.size - 0.2);
        });
        slashParticlesRef.current = slashParticlesRef.current.filter(pt => pt.alpha > 0);
      }

      // RENDER
      ctx.imageSmoothingEnabled = false;

      if (gameState === 'title') {
        renderTitleScreen(ctx, tick);
      } else if (gameState === 'class_select') {
        renderClassSelect(ctx, tick, selectedClass);
      } else if (gameState === 'playing' || gameState === 'paused') {
        renderGameField(ctx, tick);
        if (gameState === 'paused') {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
          ctx.fillRect(0, 0, 640, 480);
          ctx.fillStyle = '#fbbf24';
          ctx.font = '24px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('PAUSA - DARKOS RE', 320, 220);
          ctx.font = '12px "Press Start 2P", monospace';
          ctx.fillStyle = '#f8fafc';
          ctx.fillText('Presiona START para continuar', 320, 260);
          ctx.fillText('SELECT + START para salir a EmulationStation', 320, 290);
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, selectedClassIndex, stats, activeButtons]);

  // Render Title Screen
  const renderTitleScreen = (ctx: CanvasRenderingContext2D, tick: number) => {
    // Dark sky / mountain background
    const grad = ctx.createLinearGradient(0, 0, 0, 480);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#1e1b4b');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 480);

    // Floating particles/embers
    for (let i = 0; i < 25; i++) {
      const px = (Math.sin(tick * 0.02 + i) * 320 + 320);
      const py = (480 - ((tick * 1.5 + i * 20) % 480));
      ctx.fillStyle = i % 2 === 0 ? 'rgba(251, 191, 36, 0.6)' : 'rgba(168, 85, 247, 0.5)';
      ctx.beginPath();
      ctx.arc(px, py, (i % 3) + 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Title Logo Banner
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fbbf24';
    ctx.font = '32px "Press Start 2P", monospace';
    ctx.shadowColor = '#d97706';
    ctx.shadowBlur = 12;
    ctx.fillText('ZENONIA 3', 320, 150);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText('THE MIDGARD STORY', 320, 185);

    // DarkOS RE & R36S Badge
    ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.roundRect(140, 220, 360, 44, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillText('PORTMASTER R36S EDITION', 320, 247);

    // Start prompt
    if (Math.floor(tick / 30) % 2 === 0) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px "Press Start 2P", monospace';
      ctx.fillText('PRESIONA START / A PARA INICIAR', 320, 340);
    }

    // Bottom copyright
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('GAMEVIL (2011) - PORT R36S DARKOS RE 640x480', 320, 440);
  };

  // Render Class Selection
  const renderClassSelect = (ctx: CanvasRenderingContext2D, tick: number, cls: CharacterClass) => {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, 640, 480);

    // Header
    ctx.fillStyle = '#fbbf24';
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SELECCIONA TU CLASE', 320, 45);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText('Usa D-Pad Izq / Der para cambiar clase | A para confirmar', 320, 70);

    // 4 Class tabs
    const tabW = 125;
    ZENONIA_CLASSES.forEach((c, idx) => {
      const tx = 40 + idx * 140;
      const isSelected = idx === selectedClassIndex;
      ctx.fillStyle = isSelected ? '#1e293b' : '#0f172a';
      ctx.strokeStyle = isSelected ? '#f59e0b' : '#334155';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.roundRect(tx, 95, tabW, 36, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isSelected ? '#fbbf24' : '#64748b';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(c.name, tx + tabW / 2, 117);
    });

    // Main Class Display Card
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.roundRect(40, 145, 560, 270, 10);
    ctx.fill();
    ctx.stroke();

    // Portrait Box
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.roundRect(65, 170, 160, 210, 8);
    ctx.fill();
    ctx.stroke();

    // Class Name & Lore
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f8fafc';
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.fillText(cls.title, 245, 185);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px "Inter", sans-serif';
    ctx.fillText(`Arma: ${cls.primaryWeapon}`, 245, 210);

    // Stats Bar Grid
    const statNames: (keyof typeof cls.stats)[] = ['str', 'dex', 'con', 'int'];
    const statLabels = { str: 'FUERZA (STR)', dex: 'DESTREZA (DEX)', con: 'CONSTITUCIÓN (CON)', int: 'INTELIGENCIA (INT)' };

    statNames.forEach((sKey, sIdx) => {
      const sy = 235 + sIdx * 25;
      const val = cls.stats[sKey];

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.fillText(statLabels[sKey], 245, sy);

      // Gauge
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(430, sy - 10, 140, 10);
      ctx.fillStyle = sKey === 'str' ? '#ef4444' : sKey === 'dex' ? '#a855f7' : sKey === 'con' ? '#f59e0b' : '#38bdf8';
      ctx.fillRect(430, sy - 10, (val / 20) * 140, 10);
    });

    // Skill icons preview
    ctx.fillStyle = '#f8fafc';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText('HABILIDADES DISPONIBLES:', 245, 360);

    cls.skills.forEach((sk, skIdx) => {
      const kx = 245 + skIdx * 110;
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#f59e0b';
      ctx.roundRect(kx, 375, 100, 30, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = '9px "Inter", sans-serif';
      ctx.fillText(`${sk.icon} ${sk.name}`, kx + 8, 395);
    });
  };

  // Render Playable Game Field
  const renderGameField = (ctx: CanvasRenderingContext2D, tick: number) => {
    // Grassland Map background
    ctx.fillStyle = '#14532d'; // Deep lush green
    ctx.fillRect(0, 0, 640, 480);

    // Decorative grass patches
    ctx.fillStyle = '#166534';
    for (let x = 0; x < 640; x += 40) {
      for (let y = 0; y < 480; y += 40) {
        if ((x + y) % 80 === 0) {
          ctx.fillRect(x + 4, y + 4, 12, 12);
        }
      }
    }

    // Dirt paths (Midgard Crossroads)
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 210, 640, 60);
    ctx.fillRect(290, 0, 60, 480);

    // Cobblestones
    ctx.fillStyle = '#92400e';
    for (let i = 0; i < 640; i += 24) {
      ctx.fillRect(i + 2, 212, 20, 26);
      ctx.fillRect(i + 14, 240, 20, 26);
    }

    // Castle / Forest Boundary Trees
    ctx.fillStyle = '#064e3b';
    for (let i = 0; i < 640; i += 48) {
      ctx.beginPath();
      ctx.arc(i + 24, 24, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(i + 24, 460, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    // Portal to Deva Castle
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(320, 45, 24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.fill();

    // Draw Monsters
    monstersRef.current.forEach(m => {
      ctx.save();
      ctx.translate(m.x, m.y);

      // Monster Flash on hit
      if (m.isHit) {
        ctx.fillStyle = '#ffffff';
      } else if (m.type === 'slime') {
        ctx.fillStyle = '#22c55e';
      } else if (m.type === 'goblin') {
        ctx.fillStyle = '#d97706';
      } else {
        ctx.fillStyle = '#64748b';
      }

      // Sprite Body
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Monster Eyes
      ctx.fillStyle = '#000000';
      ctx.fillRect(-6, -4, 3, 3);
      ctx.fillRect(3, -4, 3, 3);

      // Health bar above monster
      ctx.fillStyle = '#334155';
      ctx.fillRect(-16, -22, 32, 5);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-16, -22, (Math.max(0, m.hp) / m.maxHp) * 32, 5);

      // Name label
      ctx.fillStyle = '#ffffff';
      ctx.font = '8px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(m.name, 0, -28);

      ctx.restore();
    });

    // Draw Player
    const p = playerRef.current;
    ctx.save();
    ctx.translate(p.x, p.y);

    // Player Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 15, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Player Sprite Body (Chale)
    if (p.invulnerableTimer > 0 && Math.floor(tick / 3) % 2 === 0) {
      ctx.fillStyle = '#cbd5e1';
    } else {
      ctx.fillStyle = selectedClass.id === 'sword_knight' ? '#dc2626' :
                      selectedClass.id === 'shadow_hunter' ? '#9333ea' :
                      selectedClass.id === 'mechanic_launcher' ? '#2563eb' : '#059669';
    }

    // Body
    ctx.fillRect(-10, -12, 20, 24);
    // Head / Hair (Chale blonde/silver spikes)
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(0, -16, 10, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-4, -16, 2, 3);
    ctx.fillRect(2, -16, 2, 3);

    // Weapon Swing animation
    if (p.isAttacking) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      if (p.dir === 'right') {
        ctx.arc(10, 0, 24, -Math.PI / 3, Math.PI / 3);
      } else if (p.dir === 'left') {
        ctx.arc(-10, 0, 24, (2 * Math.PI) / 3, (4 * Math.PI) / 3);
      } else if (p.dir === 'up') {
        ctx.arc(0, -10, 24, -Math.PI, 0);
      } else {
        ctx.arc(0, 10, 24, 0, Math.PI);
      }
      ctx.stroke();
    }

    ctx.restore();

    // Fairy (Runa) floating with glowing wings
    const f = fairyRef.current;
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.ellipse(-5, -3, 6, 2, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5, -3, 6, 2, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Render Slash particles
    slashParticlesRef.current.forEach(pt => {
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = pt.alpha;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });

    // Render Floating Damage Numbers
    damageNumbersRef.current.forEach(d => {
      ctx.save();
      ctx.globalAlpha = d.opacity;
      ctx.font = d.isCrit ? 'bold 16px "Press Start 2P", monospace' : 'bold 12px "Press Start 2P", monospace';
      ctx.fillStyle = d.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.textAlign = 'center';
      ctx.strokeText(String(d.text), d.x, d.y);
      ctx.fillText(String(d.text), d.x, d.y);
      ctx.restore();
    });

    // R36S Zenonia 3 HUD (Top Left)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.roundRect(12, 12, 220, 68, 6);
    ctx.fill();
    ctx.stroke();

    // Player level & class badge
    ctx.fillStyle = '#fbbf24';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`LV.${stats.level} ${selectedClass.name}`, 22, 30);

    // HP Bar
    ctx.fillStyle = '#334155';
    ctx.fillRect(22, 38, 140, 8);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(22, 38, (stats.hp / stats.maxHp) * 140, 8);
    ctx.fillStyle = '#ffffff';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText(`${stats.hp}/${stats.maxHp}`, 168, 46);

    // SP Bar
    ctx.fillStyle = '#334155';
    ctx.fillRect(22, 52, 140, 7);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(22, 52, (stats.sp / stats.maxSp) * 140, 7);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${stats.sp}/${stats.maxSp}`, 168, 59);

    // EXP Bar (Bottom screen edge)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 474, 640, 6);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(0, 474, (stats.exp / stats.maxExp) * 640, 6);

    // Gold & Zen (Top Right)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#f59e0b';
    ctx.roundRect(470, 12, 158, 38, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText(`💰 ${stats.gold} G`, 482, 28);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`💎 ${stats.zen} ZEN`, 482, 42);

    // Action Slots (Bottom Right - matching Zenonia 3 quick action layout)
    const slotX = 570;
    const slotY = 410;
    // Attack button circle
    ctx.fillStyle = activeButtons['a'] ? '#f59e0b' : 'rgba(239, 68, 68, 0.8)';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(slotX, slotY, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('A', slotX, slotY + 4);

    // Quick Skill Slots
    const quickSlots = [
      { key: 'X', icon: selectedClass.skills[0]?.icon || '⚔️', x: slotX - 44, y: slotY - 14 },
      { key: 'Y', icon: selectedClass.skills[1]?.icon || '🛡️', x: slotX - 30, y: slotY - 50 },
      { key: 'R1', icon: selectedClass.skills[2]?.icon || '💥', x: slotX + 14, y: slotY - 54 },
      { key: 'L1', icon: `🧪 ${potionCount}`, x: slotX - 84, y: slotY + 4 },
    ];

    quickSlots.forEach(qs => {
      ctx.fillStyle = activeButtons[qs.key.toLowerCase()] ? '#f59e0b' : 'rgba(15, 23, 42, 0.8)';
      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(qs.x, qs.y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.font = '10px "Inter", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(qs.icon, qs.x, qs.y + 4);
    });

    // Active Dialogue Box if shown
    if (activeDialogue) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.roundRect(40, 340, 560, 85, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('RUNA (Hada Guardiana):', 55, 362);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '12px "Inter", sans-serif';
      ctx.fillText(activeDialogue, 55, 385);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.fillText('[ SELECT / Tocar para cerrar ]', 370, 412);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto my-4">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 mb-4 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
          <span className="font-['Press_Start_2P'] text-xs text-amber-400 tracking-wider">
            R36S 640x480 VIEWPORT
          </span>
          <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
            DarkOS RE / PortMaster
          </span>
        </div>

        {/* Console & Display options */}
        <div className="flex items-center gap-3 mt-2 sm:mt-0">
          {/* Shell color */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Carcasa:</span>
            <button
              onClick={() => setShellColor('purple')}
              className={`w-5 h-5 rounded-full bg-purple-700 border-2 transition ${shellColor === 'purple' ? 'border-amber-400 scale-110' : 'border-slate-600 opacity-70'}`}
              title="Púrpura Translúcido (Iconic R36S)"
            />
            <button
              onClick={() => setShellColor('black')}
              className={`w-5 h-5 rounded-full bg-slate-900 border-2 transition ${shellColor === 'black' ? 'border-amber-400 scale-110' : 'border-slate-600 opacity-70'}`}
              title="Negro Mate"
            />
            <button
              onClick={() => setShellColor('white')}
              className={`w-5 h-5 rounded-full bg-slate-200 border-2 transition ${shellColor === 'white' ? 'border-amber-400 scale-110' : 'border-slate-600 opacity-70'}`}
              title="Blanco Retro"
            />
          </div>

          {/* CRT toggle */}
          <button
            onClick={() => setCrtFilter(!crtFilter)}
            className={`text-xs px-2.5 py-1 rounded border transition ${crtFilter ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
          >
            CRT Scanlines {crtFilter ? 'ON' : 'OFF'}
          </button>

          {/* Mute button */}
          <button
            onClick={() => {
              const muted = soundManager.toggleMute();
              setSoundMuted(muted);
            }}
            className="p-1.5 text-slate-300 hover:text-amber-400 bg-slate-800 rounded border border-slate-700 transition"
            title="Silenciar / Activar Sonido"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* R36S Handheld Console Body */}
      <div 
        className={`relative w-full max-w-[840px] p-6 sm:p-8 rounded-[48px] shadow-2xl transition-all duration-300 border-4 select-none ${
          shellColor === 'purple'
            ? 'bg-gradient-to-b from-purple-900/90 via-indigo-950/90 to-purple-950/90 border-purple-500/40 shadow-purple-950/50 backdrop-blur-sm'
            : shellColor === 'black'
            ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-neutral-950 border-slate-700 shadow-black'
            : 'bg-gradient-to-b from-slate-200 via-slate-100 to-slate-300 border-slate-400 shadow-slate-950 text-slate-900'
        }`}
      >
        {/* Top Shoulder Buttons (L1, L2, R1, R2) */}
        <div className="flex justify-between items-center px-8 -mt-9 mb-4">
          <div className="flex gap-2">
            <button
              onMouseDown={() => pressButton('l2')}
              onMouseUp={() => releaseButton('l2')}
              className={`px-4 py-1.5 text-[10px] font-['Press_Start_2P'] rounded-t-lg border-t-2 border-x-2 transition ${
                activeButtons['l2']
                  ? 'bg-amber-500 text-slate-950 border-amber-300'
                  : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
              }`}
            >
              L2
            </button>
            <button
              onMouseDown={() => pressButton('l1')}
              onMouseUp={() => releaseButton('l1')}
              className={`px-5 py-2 text-xs font-['Press_Start_2P'] rounded-t-lg border-t-2 border-x-2 transition ${
                activeButtons['l1']
                  ? 'bg-amber-500 text-slate-950 border-amber-300'
                  : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
              }`}
            >
              L1 [Poción]
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-black/40 rounded-full border border-white/10 text-[10px] text-slate-300 font-['Rajdhani'] font-bold tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            R36S HANDHELD CONSOLE
          </div>

          <div className="flex gap-2">
            <button
              onMouseDown={() => pressButton('r1')}
              onMouseUp={() => releaseButton('r1')}
              className={`px-5 py-2 text-xs font-['Press_Start_2P'] rounded-t-lg border-t-2 border-x-2 transition ${
                activeButtons['r1']
                  ? 'bg-amber-500 text-slate-950 border-amber-300'
                  : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
              }`}
            >
              R1 [Skill 3]
            </button>
            <button
              onMouseDown={() => pressButton('r2')}
              onMouseUp={() => releaseButton('r2')}
              className={`px-4 py-1.5 text-[10px] font-['Press_Start_2P'] rounded-t-lg border-t-2 border-x-2 transition ${
                activeButtons['r2']
                  ? 'bg-amber-500 text-slate-950 border-amber-300'
                  : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
              }`}
            >
              R2
            </button>
          </div>
        </div>

        {/* 640x480 Screen Bezel */}
        <div className="relative mx-auto w-full max-w-[640px] aspect-[4/3] bg-black p-3 rounded-2xl shadow-inner border-4 border-black/80 flex items-center justify-center overflow-hidden">
          {/* CRT Scanline Filter Overlay */}
          {crtFilter && (
            <div className="pointer-events-none absolute inset-0 z-30 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] opacity-70"></div>
          )}

          {/* Vignette & Screen Glow */}
          <div className="pointer-events-none absolute inset-0 z-20 shadow-[inset_0_0_35px_rgba(0,0,0,0.85)]"></div>

          {/* Canvas Viewport */}
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="w-full h-full object-contain cursor-pointer"
            onClick={() => {
              if (gameState === 'title') {
                pressButton('start');
              } else if (activeDialogue) {
                setActiveDialogue(null);
              }
            }}
          />
        </div>

        {/* Handheld Controls Bottom Area */}
        <div className="grid grid-cols-3 items-center mt-6 pt-2">
          {/* LEFT: D-Pad & Left Analog Stick */}
          <div className="flex flex-col items-center gap-4">
            {/* Cross D-Pad */}
            <div className="relative w-28 h-28">
              {/* Up */}
              <button
                onMouseDown={() => pressButton('dpad_up')}
                onMouseUp={() => releaseButton('dpad_up')}
                className={`absolute top-0 left-9 w-10 h-10 rounded-t-md bg-neutral-800 border-t border-x border-neutral-700 shadow-md active:bg-amber-500 transition flex items-center justify-center ${activeButtons['dpad_up'] ? 'bg-amber-500 text-black' : 'text-slate-400'}`}
              >
                ▲
              </button>
              {/* Left */}
              <button
                onMouseDown={() => pressButton('dpad_left')}
                onMouseUp={() => releaseButton('dpad_left')}
                className={`absolute top-9 left-0 w-10 h-10 rounded-l-md bg-neutral-800 border-l border-y border-neutral-700 shadow-md active:bg-amber-500 transition flex items-center justify-center ${activeButtons['dpad_left'] ? 'bg-amber-500 text-black' : 'text-slate-400'}`}
              >
                ◀
              </button>
              {/* Center */}
              <div className="absolute top-9 left-9 w-10 h-10 bg-neutral-900 border border-neutral-800"></div>
              {/* Right */}
              <button
                onMouseDown={() => pressButton('dpad_right')}
                onMouseUp={() => releaseButton('dpad_right')}
                className={`absolute top-9 right-0 w-10 h-10 rounded-r-md bg-neutral-800 border-r border-y border-neutral-700 shadow-md active:bg-amber-500 transition flex items-center justify-center ${activeButtons['dpad_right'] ? 'bg-amber-500 text-black' : 'text-slate-400'}`}
              >
                ▶
              </button>
              {/* Down */}
              <button
                onMouseDown={() => pressButton('dpad_down')}
                onMouseUp={() => releaseButton('dpad_down')}
                className={`absolute bottom-0 left-9 w-10 h-10 rounded-b-md bg-neutral-800 border-b border-x border-neutral-700 shadow-md active:bg-amber-500 transition flex items-center justify-center ${activeButtons['dpad_down'] ? 'bg-amber-500 text-black' : 'text-slate-400'}`}
              >
                ▼
              </button>
            </div>

            {/* Left Analog Stick */}
            <div className="w-16 h-16 rounded-full bg-neutral-900 border-2 border-neutral-700 shadow-inner flex items-center justify-center">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-700 border border-neutral-600 shadow-md flex items-center justify-center text-[9px] text-neutral-400 font-bold">
                L-STICK
              </div>
            </div>
          </div>

          {/* CENTER: Speaker Grilles, Function & Select/Start */}
          <div className="flex flex-col items-center justify-between h-full gap-5">
            {/* FN Button */}
            <button
              onClick={() => {
                soundManager.playSfx('menu_select');
                if (gameState === 'playing') setGameState('paused');
                else if (gameState === 'paused') setGameState('playing');
              }}
              className="px-3 py-1 bg-neutral-800 rounded-full border border-neutral-700 text-[10px] font-['Press_Start_2P'] text-slate-300 shadow hover:bg-neutral-700 active:bg-amber-500 active:text-black transition"
            >
              FN / MENU
            </button>

            {/* Speaker Grilles */}
            <div className="flex gap-1.5 opacity-60">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-1 h-5 rounded-full bg-black shadow-inner"></div>
              ))}
            </div>

            {/* Select & Start Pill Buttons */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-1">
                <button
                  onMouseDown={() => pressButton('select')}
                  onMouseUp={() => releaseButton('select')}
                  className={`w-10 h-3.5 -rotate-25 rounded-full border shadow transition ${
                    activeButtons['select'] ? 'bg-amber-400 border-amber-300' : 'bg-neutral-800 border-neutral-700 active:bg-amber-400'
                  }`}
                />
                <span className="text-[8px] font-['Press_Start_2P'] text-slate-400 tracking-wider">SELECT</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <button
                  onMouseDown={() => pressButton('start')}
                  onMouseUp={() => releaseButton('start')}
                  className={`w-10 h-3.5 -rotate-25 rounded-full border shadow transition ${
                    activeButtons['start'] ? 'bg-amber-400 border-amber-300' : 'bg-neutral-800 border-neutral-700 active:bg-amber-400'
                  }`}
                />
                <span className="text-[8px] font-['Press_Start_2P'] text-slate-400 tracking-wider">START</span>
              </div>
            </div>
          </div>

          {/* RIGHT: ABXY Buttons & Right Analog Stick */}
          <div className="flex flex-col items-center gap-4">
            {/* ABXY Diamond Buttons */}
            <div className="relative w-28 h-28">
              {/* X Button (Top) */}
              <button
                onMouseDown={() => pressButton('x')}
                onMouseUp={() => releaseButton('x')}
                className={`absolute top-0 left-9 w-10 h-10 rounded-full font-['Press_Start_2P'] text-xs font-bold border-2 shadow-lg transition flex items-center justify-center ${
                  activeButtons['x']
                    ? 'bg-blue-500 text-white border-blue-300 scale-95'
                    : 'bg-neutral-800 text-blue-400 border-neutral-700 hover:bg-neutral-700 active:bg-blue-500 active:text-white'
                }`}
                title="Skill 1 / Especial"
              >
                X
              </button>

              {/* Y Button (Left) */}
              <button
                onMouseDown={() => pressButton('y')}
                onMouseUp={() => releaseButton('y')}
                className={`absolute top-9 left-0 w-10 h-10 rounded-full font-['Press_Start_2P'] text-xs font-bold border-2 shadow-lg transition flex items-center justify-center ${
                  activeButtons['y']
                    ? 'bg-green-500 text-white border-green-300 scale-95'
                    : 'bg-neutral-800 text-green-400 border-neutral-700 hover:bg-neutral-700 active:bg-green-500 active:text-white'
                }`}
                title="Skill 2"
              >
                Y
              </button>

              {/* A Button (Right - Action) */}
              <button
                onMouseDown={() => pressButton('a')}
                onMouseUp={() => releaseButton('a')}
                className={`absolute top-9 right-0 w-10 h-10 rounded-full font-['Press_Start_2P'] text-xs font-bold border-2 shadow-lg transition flex items-center justify-center ${
                  activeButtons['a']
                    ? 'bg-red-500 text-white border-red-300 scale-95'
                    : 'bg-neutral-800 text-red-400 border-neutral-700 hover:bg-neutral-700 active:bg-red-500 active:text-white'
                }`}
                title="Ataque / Acción"
              >
                A
              </button>

              {/* B Button (Bottom) */}
              <button
                onMouseDown={() => pressButton('b')}
                onMouseUp={() => releaseButton('b')}
                className={`absolute bottom-0 left-9 w-10 h-10 rounded-full font-['Press_Start_2P'] text-xs font-bold border-2 shadow-lg transition flex items-center justify-center ${
                  activeButtons['b']
                    ? 'bg-amber-500 text-slate-950 border-amber-300 scale-95'
                    : 'bg-neutral-800 text-amber-400 border-neutral-700 hover:bg-neutral-700 active:bg-amber-500 active:text-black'
                }`}
                title="Dash / Cancelar"
              >
                B
              </button>
            </div>

            {/* Right Analog Stick */}
            <div className="w-16 h-16 rounded-full bg-neutral-900 border-2 border-neutral-700 shadow-inner flex items-center justify-center">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-700 border border-neutral-600 shadow-md flex items-center justify-center text-[9px] text-neutral-400 font-bold">
                R-STICK
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Controls Cheat Sheet */}
      <div className="w-full max-w-[840px] mt-4 p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Gamepad2 className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-white">Controles de Teclado PC:</span>
          <span>Flechas / WASD: Mover</span>
          <span className="text-amber-400 font-bold">Z: Ataque (A)</span>
          <span>X: Dash (B)</span>
          <span>C: Skill 1 (X)</span>
          <span>V: Skill 2 (Y)</span>
          <span>1: Poción (L1)</span>
          <span>Enter: START</span>
        </div>

        {onSelectTab && (
          <button
            onClick={() => onSelectTab('package')}
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition"
          >
            Descargar Archivos para R36S (.ZIP)
          </button>
        )}
      </div>
    </div>
  );
};
