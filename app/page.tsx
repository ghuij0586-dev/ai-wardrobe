"use client";

import { useState } from "react";
import { OutfitReport } from "@/app/components/OutfitReport";
import type { OutfitRecommendation } from "@/lib/outfit-recommendation";

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v2.25m0 13.5V21m9-9h-2.25m-13.5 0H3m15.364-6.364-1.591 1.591M7.227 16.773l-1.591 1.591m0-11.182 1.591 1.591m9.546 9.546 1.591 1.591M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z"
      />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      />
    </svg>
  );
}

export default function Home() {
  const [images, setImages] = useState<string[]>([]);
  const [recommendation, setRecommendation] =
    useState<OutfitRecommendation | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const imageUrls = Array.from(files).map((file) =>
      URL.createObjectURL(file)
    );
    setImages(imageUrls);
  };

  const analyzeStyle = async () => {
    setLoading(true);
    setRecommendation(null);

    const wardrobeContext =
      images.length > 0
        ? `The user uploaded ${images.length} clothing item(s) from their current wardrobe. Analyze how well these pieces work together as an existing combination, score the suitability (0-100), and give styling advice to improve or elevate the look. Then suggest an ideal complementary outfit profile.`
        : "No wardrobe photos uploaded yet — analyze a stylish office outfit for a minimalist tech startup employee and note they should upload clothes for a personalized fit score.";

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: wardrobeContext }),
    });

    const data: OutfitRecommendation = await response.json();
    setRecommendation(data);
    setLoading(false);
  };

  const hasReport =
    recommendation &&
    (recommendation.look.archetypes.length > 0 ||
      recommendation.outfit.pieces.length > 0 ||
      recommendation.styleTags.length > 0 ||
      recommendation.stylingAdvice.zh.summary ||
      recommendation.stylingAdvice.en.summary);

  return (
    <main className="wardrobe-app">
      <div className="wardrobe-bg" aria-hidden>
        <div className="wardrobe-orb wardrobe-orb--violet" />
        <div className="wardrobe-orb wardrobe-orb--cyan" />
        <div className="wardrobe-orb wardrobe-orb--fuchsia" />
        <div className="wardrobe-grid-bg" />
      </div>

      <div className="wardrobe-content">
        <header className="wardrobe-header">
          <div className="wardrobe-container wardrobe-nav">
            <div className="wardrobe-nav-brand">
              <div className="wardrobe-logo">
                <SparkleIcon className="wardrobe-icon--sm" />
              </div>
              <span>AI Wardrobe</span>
            </div>
            <span className="wardrobe-status">
              <span className="wardrobe-status-dot" />
              AI Stylist Online
            </span>
          </div>
        </header>

        <div className="wardrobe-container">
          <section className="wardrobe-hero">
            <p className="wardrobe-badge">
              <SparkleIcon className="wardrobe-icon--sm" />
              Powered by AI
            </p>

            <h1 className="wardrobe-title">
              <span className="wardrobe-title-gradient">Your wardrobe,</span>
              <br />
              styled by AI
            </h1>

            <p className="wardrobe-subtitle">
              Upload your clothes and get personalized outfit recommendations —
              crafted for the modern professional.
            </p>

            <div className="wardrobe-actions">
              <label className="wardrobe-btn wardrobe-btn--glass">
                <UploadIcon className="wardrobe-icon" />
                Upload Clothes
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  hidden
                  onChange={handleUpload}
                />
              </label>

              <button
                type="button"
                onClick={analyzeStyle}
                disabled={loading}
                className="wardrobe-btn wardrobe-btn--primary"
              >
                {loading ? (
                  <>
                    <span className="wardrobe-spinner" />
                    AI Thinking…
                  </>
                ) : (
                  <>
                    <SparkleIcon className="wardrobe-icon" />
                    Generate Outfit
                  </>
                )}
              </button>
            </div>

            {images.length > 0 && (
              <p
                style={{
                  marginTop: "1rem",
                  fontSize: "0.875rem",
                  color: "#71717a",
                  fontFamily: "var(--font-geist-mono), monospace",
                }}
              >
                {images.length} item{images.length !== 1 ? "s" : ""} in wardrobe
              </p>
            )}
          </section>

          {images.length > 0 && (
            <section>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  letterSpacing: "-0.025em",
                }}
              >
                Your Wardrobe
              </h2>
              <p
                style={{
                  marginTop: "0.25rem",
                  fontSize: "0.875rem",
                  color: "#71717a",
                }}
              >
                Hover to preview · AI analyzes each piece
              </p>

              <div className="wardrobe-grid">
                {images.map((img, index) => (
                  <article key={index} className="wardrobe-card">
                    <div className="wardrobe-card-overlay" />
                    <span className="wardrobe-card-tag">
                      #{String(index + 1).padStart(2, "0")}
                    </span>
                    <img src={img} alt={`Clothing item ${index + 1}`} />
                  </article>
                ))}
              </div>
            </section>
          )}

          {images.length === 0 && !hasReport && !loading && (
            <div className="wardrobe-panel">
              <div className="wardrobe-panel-icon">
                <UploadIcon className="wardrobe-icon" />
              </div>
              <h3>Start building your digital closet</h3>
              <p>
                Upload photos of your tops, bottoms, and accessories. Our AI
                stylist will curate the perfect look.
              </p>
            </div>
          )}

          {loading && !hasReport && (
            <div className="wardrobe-panel">
              <p style={{ color: "#a1a1aa", fontSize: "0.875rem" }}>
                Building your style report…
              </p>
            </div>
          )}

          {hasReport && recommendation && (
            <OutfitReport data={recommendation} />
          )}
        </div>

        <footer className="wardrobe-footer">
          AI Wardrobe · Built for the future of personal style
        </footer>
      </div>
    </main>
  );
}
