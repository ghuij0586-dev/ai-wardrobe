import type { OutfitRecommendation } from "@/lib/outfit-recommendation";
import "./outfit-card.css";

const ARCHETYPE_BAR_CLASS = [
  "figma-archetype-bar--0",
  "figma-archetype-bar--1",
  "figma-archetype-bar--2",
  "figma-archetype-bar--3",
  "figma-archetype-bar--4",
] as const;

const PIECE_ICONS = ["🧥", "👜", "👢", "👔", "⌚", "👖"];

type Props = {
  data: OutfitRecommendation;
};

function AiFigure() {
  return (
    <svg
      className="figma-ai-figure"
      viewBox="0 0 88 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <ellipse cx="44" cy="28" rx="22" ry="24" fill="url(#aiGlow)" />
      <path
        d="M22 58 C22 58 18 120 20 175 L36 175 L40 95 L48 95 L52 175 L68 175 C70 120 66 58 66 58 Z"
        fill="url(#aiBody)"
      />
      <defs>
        <radialGradient id="aiGlow" cx="0.5" cy="0.5" r="0.5">
          <stop stopColor="#fdba74" />
          <stop offset="1" stopColor="#7c3aed" stopOpacity="0.3" />
        </radialGradient>
        <linearGradient id="aiBody" x1="44" y1="58" x2="44" y2="175">
          <stop stopColor="#fb923c" />
          <stop offset="0.5" stopColor="#c084fc" />
          <stop offset="1" stopColor="#1e1b4b" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function OutfitCard({ data }: Props) {
  const { look, outfit } = data;
  const quote = look.quote || outfit.highlight;
  const activeColorIndex = Math.min(2, Math.max(0, look.colors.length - 1));

  return (
    <div className="figma-outfit-card">
      <div className="figma-outfit-col figma-outfit-col--ai">
        <span className="figma-badge figma-badge--ai">AI</span>
        <div className="figma-ai-stage">
          <div className="figma-ai-grid" aria-hidden />
          <div className="figma-ai-scan" aria-hidden />
          <div className="figma-ai-particles" aria-hidden>
            <span />
            <span />
            <span />
            <span />
          </div>
          <AiFigure />
        </div>
        <span className="figma-col-label">AI Rendered</span>
      </div>

      <div className="figma-outfit-col figma-outfit-col--data">
        {look.archetypes.length > 0 && (
          <section className="figma-data-section">
            <h4 className="figma-data-title">Aesthetic Archetypes</h4>
            {look.archetypes.map((arch, i) => (
              <div key={arch.name} className="figma-archetype">
                <span className="figma-archetype-name">{arch.name}</span>
                <span className="figma-archetype-score">{arch.score}</span>
                <div className="figma-archetype-bar-wrap">
                  <div
                    className={`figma-archetype-bar ${ARCHETYPE_BAR_CLASS[i % 5]}`}
                    style={{ width: `${arch.score}%` }}
                  />
                </div>
              </div>
            ))}
          </section>
        )}

        {look.keyPieces.length > 0 && (
          <section className="figma-data-section">
            <h4 className="figma-data-title">Key Pieces</h4>
            {look.keyPieces.map((piece, i) => (
              <div key={`${piece.name}-${i}`} className="figma-key-piece">
                <span className="figma-key-icon" aria-hidden>
                  {PIECE_ICONS[i % PIECE_ICONS.length]}
                </span>
                <div className="figma-key-text">
                  <span className="figma-key-name">{piece.name}</span>
                  <span className="figma-key-brand">{piece.brand}</span>
                </div>
              </div>
            ))}
          </section>
        )}

        {look.colors.length > 0 && (
          <section className="figma-data-section">
            <h4 className="figma-data-title">Color Story</h4>
            <div className="figma-colors">
              {look.colors.map((color, i) => (
                <div
                  key={color.hex}
                  className={`figma-color-swatch${i === activeColorIndex ? " figma-color-swatch--active" : ""}`}
                >
                  <div
                    className="figma-color-block"
                    style={{ backgroundColor: color.hex }}
                    title={color.role}
                  />
                  <span className="figma-color-hex">{color.hex}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {quote && (
          <blockquote className="figma-quote">
            <span className="figma-quote-bar" aria-hidden />
            <p className="figma-quote-text">&ldquo;{quote}&rdquo;</p>
          </blockquote>
        )}
      </div>
    </div>
  );
}
