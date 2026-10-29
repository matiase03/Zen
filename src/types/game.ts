export interface CharacterClass {
  id: string;
  name: string;
  koreanName: string;
  title: string;
  portrait: string;
  badgeColor: string;
  stats: {
    str: number;
    dex: number;
    con: number;
    int: number;
  };
  description: string;
  primaryWeapon: string;
  skills: {
    name: string;
    description: string;
    icon: string;
    damage: number;
    spCost: number;
    cooldown: number;
  }[];
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  sp: number;
  maxSp: number;
  level: number;
  exp: number;
  maxExp: number;
  gold: number;
  zen: number;
  attack: number;
  defense: number;
  critRate: number;
}

export interface R36SMapping {
  dpad_up: string;
  dpad_down: string;
  dpad_left: string;
  dpad_right: string;
  a: string;
  b: string;
  x: string;
  y: string;
  l1: string;
  r1: string;
  l2: string;
  r2: string;
  select: string;
  start: string;
}

export interface Monster {
  id: number;
  name: string;
  type: 'slime' | 'goblin' | 'wolf' | 'boss';
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  expReward: number;
  goldReward: number;
  isHit?: boolean;
  hitTimer?: number;
}

export interface DamageNumber {
  id: number;
  text: string | number;
  x: number;
  y: number;
  color: string;
  opacity: number;
  isCrit?: boolean;
}
