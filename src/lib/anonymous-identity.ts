const NAMES = [
  'Shadow',
  'Echo',
  'Phantom',
  'Ghost',
  'Cipher',
  'Raven',
  'Storm',
  'Frost',
  'Blaze',
  'Nova',
  'Dusk',
  'Dawn',
  'Mist',
  'Veil',
  'Ember',
  'Ash',
  'Tide',
  'Flux',
  'Haze',
  'Wren',
];

const COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f59e0b',
];

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function generateAnonymousIdentity() {
  const username = NAMES[Math.floor(Math.random() * NAMES.length)];
  const avatar = username[0];
  const avatarColor = COLORS[hashName(username) % COLORS.length];
  return { username, avatar, avatarColor };
}
