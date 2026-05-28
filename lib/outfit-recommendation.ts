export type OutfitPiece = {
  slot: string;
  item: string;
  note?: string;
};

export type StyleArchetype = {
  name: string;
  score: number;
};

export type KeyPiece = {
  name: string;
  brand: string;
};

export type ColorSwatch = {
  hex: string;
  role?: string;
};

export type LocalizedAdvice = {
  summary: string;
  points: string[];
};

export type StylingAdvice = {
  suitabilityScore: number;
  zh: LocalizedAdvice;
  en: LocalizedAdvice;
};

export type OutfitRecommendation = {
  styleDNA: string;
  styleDNASummary: string;
  styleTags: string[];
  outfit: {
    title: string;
    occasion: string;
    highlight: string;
    pieces: OutfitPiece[];
  };
  look: {
    archetypes: StyleArchetype[];
    keyPieces: KeyPiece[];
    colors: ColorSwatch[];
    quote: string;
  };
  stylingAdvice: StylingAdvice;
};

export const EMPTY_RECOMMENDATION: OutfitRecommendation = {
  styleDNA: "",
  styleDNASummary: "",
  styleTags: [],
  outfit: {
    title: "",
    occasion: "",
    highlight: "",
    pieces: [],
  },
  look: {
    archetypes: [],
    keyPieces: [],
    colors: [],
    quote: "",
  },
  stylingAdvice: {
    suitabilityScore: 0,
    zh: { summary: "", points: [] },
    en: { summary: "", points: [] },
  },
};
