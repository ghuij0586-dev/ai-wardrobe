"use client";

import { useState } from "react";
import type { StylingAdvice } from "@/lib/outfit-recommendation";
import "./outfit-advice.css";

type Locale = "zh" | "en";

type Props = {
  advice: StylingAdvice;
};

function scoreLabel(score: number, locale: Locale) {
  if (locale === "zh") {
    if (score >= 85) return "非常协调";
    if (score >= 70) return "搭配良好";
    if (score >= 50) return "尚可优化";
    return "建议调整";
  }
  if (score >= 85) return "Excellent match";
  if (score >= 70) return "Good cohesion";
  if (score >= 50) return "Room to improve";
  return "Needs work";
}

export function OutfitAdvice({ advice }: Props) {
  const [locale, setLocale] = useState<Locale>("zh");
  const content = locale === "zh" ? advice.zh : advice.en;
  const score = advice.suitabilityScore;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  const hasContent =
    content.summary || content.points.length > 0 || score > 0;

  if (!hasContent) return null;

  return (
    <section
      className="report-block report-block--advice"
      aria-labelledby="advice-heading"
    >
      <div className="report-block-head advice-head">
        <span className="report-block-icon" aria-hidden>
          ◎
        </span>
        <div className="advice-head-text">
          <h3 id="advice-heading" className="report-block-title">
            穿搭建议
          </h3>
          <p className="report-block-sub">Styling advice · Fit score</p>
        </div>
        <div className="advice-locale" role="group" aria-label="Language">
          <button
            type="button"
            className={`advice-locale-btn${locale === "zh" ? " advice-locale-btn--active" : ""}`}
            onClick={() => setLocale("zh")}
          >
            中文
          </button>
          <button
            type="button"
            className={`advice-locale-btn${locale === "en" ? " advice-locale-btn--active" : ""}`}
            onClick={() => setLocale("en")}
          >
            EN
          </button>
        </div>
      </div>

      <div className="advice-body">
        <div className="advice-score-panel">
          <div className="advice-score-ring" aria-hidden>
            <svg viewBox="0 0 120 120" className="advice-score-svg">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 60 60)"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="advice-score-center">
              <span className="advice-score-value">{score}</span>
              <span className="advice-score-unit">
                {locale === "zh" ? "分" : "pts"}
              </span>
            </div>
          </div>
          <p className="advice-score-label">
            {locale === "zh" ? "当前搭配适合度" : "Outfit suitability"}
          </p>
          <p className="advice-score-tier">{scoreLabel(score, locale)}</p>
        </div>

        <div className="advice-copy">
          {content.summary && (
            <p className="advice-summary">{content.summary}</p>
          )}
          {content.points.length > 0 && (
            <ul className="advice-points">
              {content.points.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
