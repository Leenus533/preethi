/**
 * Decorative hero composition: graph paper and a parabola, a benzene ring, a DNA helix,
 * and a mock session card. Pure SVG and CSS, so it ships no image bytes and needs no photograph.
 *
 * On load it plays once, in the order a tutor would draw it: axes, then the curve, then the
 * point where it turns, then the note. The session card settles in alongside and its progress
 * bar fills. After that only two things keep moving, very slowly: the benzene ring turns and
 * the helix breathes. Everything is static under prefers-reduced-motion.
 */
export function HeroVisual({ className = "" }: { className?: string }) {
  return (
    <div className={`hv relative ${className}`} aria-hidden="true">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-cream-300 bg-pine-50 shadow-[var(--shadow-card)] lg:aspect-[4/5]">
        {/* Graph paper with a parabola, anchored bottom-left. */}
        <svg viewBox="0 0 320 240" className="absolute -bottom-6 -left-4 w-[78%] text-pine-300" fill="none">
          <defs>
            <pattern id="hero-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M20 0H0V20" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect x="20" y="10" width="290" height="220" fill="url(#hero-grid)" />
          <path className="hv-draw hv-axes" pathLength={1} d="M40 10V220M40 220H310" stroke="var(--color-pine-500)" strokeWidth="1.2" />
          <path className="hv-draw hv-ticks" pathLength={1} d="M60 60h18M60 100h18" stroke="var(--color-pine-400)" strokeWidth="1" />
          <path
            className="hv-draw hv-curve"
            pathLength={1}
            d="M52 30 Q160 400 296 30"
            stroke="var(--color-pine-700)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle className="hv-pop hv-vertex" cx="174" cy="199.5" r="4" fill="var(--color-clay-600)" />
          <circle className="hv-ring" cx="174" cy="199.5" r="9" stroke="var(--color-clay-600)" strokeWidth="1.2" strokeOpacity="0.5" />
        </svg>

        {/* Handwritten-style annotation pointing back at the vertex. */}
        <div className="absolute bottom-[4%] left-[47%] z-10 hidden items-start gap-1 sm:flex">
          <svg
            viewBox="0 0 48 40"
            className="h-9 w-10 shrink-0 text-clay-700"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path className="hv-draw hv-arrow" pathLength={1} d="M44 6C36 20 26 30 6 34" />
            <path className="hv-draw hv-arrowhead" pathLength={1} d="M6 34l8-6M6 34l9 3" />
          </svg>
          <span className="hv-rise hv-note font-display -translate-y-1 whitespace-nowrap text-[1.05rem] leading-none text-clay-700">
            where it clicks
          </span>
        </div>

        {/* Benzene ring, top-right. */}
        <svg
          viewBox="0 0 100 100"
          className="hv-fade hv-benzene absolute right-[9%] top-[4%] w-[20%] text-pine-700 lg:w-[22%] lg:top-[5%]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinejoin="round"
        >
          <g className="hv-turn">
            <path d="M50 8 86.4 29v42L50 92 13.6 71V29z" />
            <circle cx="50" cy="50" r="24" strokeWidth="1.8" />
            <circle cx="50" cy="8" r="3" fill="var(--color-cream-50)" />
            <circle cx="86.4" cy="71" r="3" fill="var(--color-cream-50)" />
            <circle cx="13.6" cy="71" r="3" fill="var(--color-cream-50)" />
          </g>
        </svg>

        {/* DNA helix, left edge. */}
        <svg
          viewBox="0 0 100 200"
          className="hv-fade hv-helix absolute left-[6%] top-[7%] h-[44%] text-pine-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        >
          <g className="hv-breathe">
            <path d="M20 0C20 50 80 50 80 100 80 150 20 150 20 200" />
            <path d="M80 0C80 50 20 50 20 100 20 150 80 150 80 200" stroke="var(--color-clay-600)" />
            <g strokeWidth="1.6" stroke="var(--color-pine-300)">
              <path d="M22 13.6h56M26 24.8h48M37 38.4h26M37 61.6h26M26 75.2h48M22 86.4h56" />
              <path d="M22 113.6h56M26 124.8h48M37 138.4h26M37 161.6h26M26 175.2h48M22 186.4h56" />
            </g>
          </g>
        </svg>

        {/* Session card, with a sticker pinned to its corner. */}
        <div className="absolute right-[6%] top-[29%] w-[62%] max-w-[17rem] lg:top-[36%]">
          <div className="hv-rise hv-card rounded-xl border border-cream-300 bg-white p-4 shadow-[var(--shadow-soft)]">
            <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted">Next session</span>
            <p className="font-display mt-2 text-[1.2rem] leading-tight text-pine-900">A-level Chemistry</p>
            <p className="mt-1 flex items-center gap-1.5 text-[0.8rem] text-ink-soft">
              <span className="hv-live h-1.5 w-1.5 rounded-full bg-pine-500" />
              Thursday 17:30 to 18:30 · Google Meet
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["Rate equations", "Arrhenius", "Past paper Q6"].map((t, i) => (
                <span
                  key={t}
                  className="hv-rise hv-chip rounded-md bg-cream-100 px-2 py-1 text-[0.7rem] font-medium text-ink-soft"
                  style={{ animationDelay: `${1.05 + i * 0.09}s` }}
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-3 border-t border-cream-200 pt-3">
              <div className="flex items-baseline justify-between text-[0.75rem]">
                <span className="text-muted">Working at</span>
                <span className="font-display text-base text-pine-800">
                  B <span className="text-muted">→</span> <span className="hv-rise hv-grade inline-block">A</span>
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cream-200">
                <div className="hv-fill h-full w-[72%] rounded-full bg-pine-700" />
              </div>
            </div>
          </div>
          <div className="hv-sticker absolute -right-3 -top-5 rotate-6 rounded-lg border border-clay-200 bg-clay-100 px-3 py-2 shadow-[var(--shadow-soft)]">
            <p className="font-display text-[1.25rem] leading-none text-clay-700">A · A · A</p>
            <p className="mt-1 text-[0.62rem] font-medium text-clay-700">Biology, Chemistry, Maths</p>
          </div>
        </div>
      </div>
    </div>
  );
}
