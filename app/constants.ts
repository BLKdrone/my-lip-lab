export interface Pigment {
  id: string;
  label: string;
  hex: string;
  rgb: number[];
  count?: number;
  isGlitter?: boolean;
}

export interface OriginalColor {
  id: string;
  name: string;
  hex: string;
  glow: string;
  recipe: Record<string, number>;
}

export interface SavedLook {
  id: string;
  name: string;
  hex: string;
  timestamp: number;
  recipe?: Record<string, number>;
  isOriginal?: boolean;
}

export const ORIGINALS: OriginalColor[] = [
  { 
    id: "sunset-rose", 
    name: "Sunset Rose", 
    hex: "#E8637A", 
    glow: "#f08090",
    recipe: { red: 5, pink: 3, white: 1 }
  },
  { 
    id: "coral-bliss", 
    name: "Coral Bliss", 
    hex: "#F4845F", 
    glow: "#f9a07a",
    recipe: { orange: 5, yellow: 3, white: 1 }
  },
  { 
    id: "berry-pop", 
    name: "Berry Pop", 
    hex: "#9B4B7E", 
    glow: "#c06099",
    recipe: { purple: 5, pink: 3, glitter: 1 }
  },
  { 
    id: "dusty-pink", 
    name: "Dusty Pink", 
    hex: "#D3827B", 
    glow: "#fec898",
    recipe: { yellow: 3, red: 2, pink: 4 }
  },
  { 
    id: "nude-satin", 
    name: "Nude Satin", 
    hex: "#d2b48c", 
    glow: "#e3d5ca",
    recipe: { white: 5, orange: 2, pink: 2 }
  },
  { 
    id: "cherry-glaze", 
    name: "Cherry Glaze", 
    hex: "#be123c", 
    glow: "#fb7185",
    recipe: { red: 7, orange: 1, yellow: 1 }
  },
  { 
    id: "peach-sorbet", 
    name: "Peach Sorbet", 
    hex: "#ffb07c", 
    glow: "#ffcf9d",
    recipe: { white: 5, yellow: 3, orange: 1 }
  },
  { 
    id: "crimson-velvet", 
    name: "Crimson Velvet", 
    hex: "#991b1b", 
    glow: "#dc2626",
    recipe: { red: 8, purple: 1 }
  },
  { 
    id: "electric-mauve", 
    name: "Electric Mauve", 
    hex: "#a855f7", 
    glow: "#c084fc",
    recipe: { purple: 5, pink: 3, white: 1 }
  }
];

export const PIGMENTS: Pigment[] = [
  { id: "red", label: "Red", hex: "#E03050", rgb: [224, 48, 80] },
  { id: "yellow", label: "Yellow", hex: "#F5C518", rgb: [245, 197, 24] },
  { id: "pink", label: "Pink", hex: "#F472B6", rgb: [244, 114, 182] },
  { id: "white", label: "White", hex: "#FFFFFF", rgb: [255, 255, 255] },
  { id: "orange", label: "Orange", hex: "#FFA500", rgb: [255, 165, 0] },
  { id: "purple", label: "Purple", hex: "#800080", rgb: [128, 0, 128] },
  { id: "glitter", label: "Glitter", hex: "#E2E8F0", rgb: [226, 232, 240], isGlitter: true },
];
