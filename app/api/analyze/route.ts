import OpenAI from "openai";
import {
  type OutfitRecommendation,
  type LocalizedAdvice,
  EMPTY_RECOMMENDATION,
} from "@/lib/outfit-recommendation";

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

const STYLE_DNA_SYSTEM = `You are an AI fashion stylist. Respond with ONLY valid JSON (no markdown, no code fences, no extra text).

Evaluate the user's CURRENT wardrobe items they described — score how well their existing pieces work together, then suggest a complementary ideal outfit profile.

StyleDNA — pick exactly one letter per position:
1. M (Minimal) or E (Expressive)
2. C (Classic) or D (Dynamic / trendy)
3. S (Sharp / structured) or R (Relaxed)
4. N (Neutral palette) or B (Bold colors)

JSON schema:
{
  "styleDNA": "XXXX",
  "styleDNASummary": "Minimal · Classic · Sharp · Neutral",
  "styleTags": ["3-6 short English style keywords"],
  "outfit": {
    "title": "Short catchy outfit name",
    "occasion": "When to wear it",
    "highlight": "One-line vibe (max 12 words)",
    "pieces": [
      { "slot": "Top|Bottom|Outerwear|Shoes|Accessory", "item": "garment name", "note": "optional tip" }
    ]
  },
  "look": {
    "archetypes": [{ "name": "Quiet Luxury", "score": 94 }],
    "keyPieces": [{ "name": "Structured Wool Coat", "brand": "Theory" }],
    "colors": [{ "hex": "#1C1C1E", "role": "base" }],
    "quote": "Poetic one-line style quote in English, max 15 words, no quotes in string"
  },
  "stylingAdvice": {
    "suitabilityScore": 78,
    "zh": {
      "summary": "2-3 sentences in Simplified Chinese: overall fit of user's current wardrobe combo",
      "points": ["3-5 bullets in Chinese: concrete styling tips to improve or elevate the look"]
    },
    "en": {
      "summary": "Same meaning as zh.summary, in English, 2-3 sentences",
      "points": ["3-5 bullets in English, matching zh.points intent"]
    }
  }
}

Rules:
- styleDNA: exactly 4 uppercase letters
- stylingAdvice.suitabilityScore: integer 0-100 for how cohesive the user's CURRENT uploaded wardrobe is
- stylingAdvice.zh and stylingAdvice.en must convey the same advice in each language
- look.archetypes: exactly 5 items, scores 55-98
- look.keyPieces: exactly 3 items with brand names
- look.colors: exactly 5 hex codes
- outfit.pieces: 4-6 items for the recommended ideal look
- Product tone only — never chatty, never use "I"`;

function extractJson(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

function parseLocalizedAdvice(
  raw: unknown,
  fallback: LocalizedAdvice
): LocalizedAdvice {
  if (!raw || typeof raw !== "object") return fallback;
  const obj = raw as Record<string, unknown>;
  return {
    summary: String(obj.summary ?? fallback.summary),
    points: Array.isArray(obj.points)
      ? obj.points.map((p) => String(p)).filter(Boolean)
      : fallback.points,
  };
}

function normalizeRecommendation(
  data: Record<string, unknown>
): OutfitRecommendation {
  const outfit = (data.outfit as Record<string, unknown>) ?? {};
  const look = (data.look as Record<string, unknown>) ?? {};
  const adviceRaw =
    data.stylingAdvice ?? data.reasoning ?? {};
  const advice = adviceRaw as Record<string, unknown>;
  const pieces = Array.isArray(outfit.pieces) ? outfit.pieces : [];

  const normalizedPieces = pieces.map((p) => {
    const piece = p as Record<string, unknown>;
    return {
      slot: String(piece.slot ?? "Item"),
      item: String(piece.item ?? ""),
      note: piece.note ? String(piece.note) : undefined,
    };
  });

  const archetypes = Array.isArray(look.archetypes)
    ? look.archetypes.slice(0, 5).map((a) => {
        const ar = a as Record<string, unknown>;
        return {
          name: String(ar.name ?? "Style"),
          score: Math.min(100, Math.max(0, Number(ar.score) || 70)),
        };
      })
    : [];

  const keyPieces = Array.isArray(look.keyPieces)
    ? look.keyPieces.slice(0, 3).map((k) => {
        const kp = k as Record<string, unknown>;
        return {
          name: String(kp.name ?? ""),
          brand: String(kp.brand ?? ""),
        };
      })
    : normalizedPieces.slice(0, 3).map((p) => ({
        name: p.item,
        brand: p.slot,
      }));

  const colors = Array.isArray(look.colors)
    ? look.colors.slice(0, 5).map((c) => {
        const col = c as Record<string, unknown>;
        let hex = String(col.hex ?? "#888888");
        if (!hex.startsWith("#")) hex = `#${hex}`;
        return {
          hex: hex.toUpperCase(),
          role: col.role ? String(col.role) : undefined,
        };
      })
    : [];

  const quote =
    String(look.quote ?? "") || String(outfit.highlight ?? "") || "";

  const legacySummary = String(advice.summary ?? "");
  const legacyPoints = Array.isArray(advice.points)
    ? advice.points.map((p) => String(p)).filter(Boolean)
    : [];

  const zh = parseLocalizedAdvice(advice.zh, {
    summary: legacySummary,
    points: legacyPoints,
  });
  const en = parseLocalizedAdvice(advice.en, {
    summary: legacySummary,
    points: legacyPoints,
  });

  const suitabilityScore = Math.min(
    100,
    Math.max(0, Number(advice.suitabilityScore) || 0)
  );

  return {
    styleDNA: String(data.styleDNA ?? "")
      .toUpperCase()
      .slice(0, 4),
    styleDNASummary: String(data.styleDNASummary ?? ""),
    styleTags: Array.isArray(data.styleTags)
      ? data.styleTags.map((t) => String(t)).filter(Boolean)
      : [],
    outfit: {
      title: String(outfit.title ?? "Curated Look"),
      occasion: String(outfit.occasion ?? ""),
      highlight: String(outfit.highlight ?? ""),
      pieces: normalizedPieces,
    },
    look: { archetypes, keyPieces, colors, quote },
    stylingAdvice: {
      suitabilityScore,
      zh,
      en,
    },
  };
}

function parseRecommendation(raw: string | null | undefined): OutfitRecommendation {
  if (!raw?.trim()) return EMPTY_RECOMMENDATION;

  try {
    const data = JSON.parse(extractJson(raw)) as Record<string, unknown>;
    return normalizeRecommendation(data);
  } catch {
    return {
      ...EMPTY_RECOMMENDATION,
      stylingAdvice: {
        suitabilityScore: 0,
        zh: { summary: raw.trim(), points: [] },
        en: { summary: raw.trim(), points: [] },
      },
    };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userPrompt = body.prompt;

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: STYLE_DNA_SYSTEM },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    return Response.json(
      parseRecommendation(completion.choices[0].message.content)
    );
  } catch (error) {
    console.error(error);

    return Response.json({
      ...EMPTY_RECOMMENDATION,
      stylingAdvice: {
        suitabilityScore: 0,
        zh: {
          summary: "分析失败，请稍后重试。",
          points: [],
        },
        en: {
          summary: "Analysis failed. Please try again.",
          points: [],
        },
      },
    });
  }
}
