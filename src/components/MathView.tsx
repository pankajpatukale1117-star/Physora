import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathViewProps {
  math: string;
  block?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Normalizes mixed math strings (Unicode superscripts, fractions, square roots)
 * into standard, valid LaTeX expressions for KaTeX.
 */
function normalizeMathToLatex(raw: string): string {
  if (!raw) return '';
  let str = raw.trim();

  // Replace bullet points with \cdot
  str = str.replace(/[•·]/g, ' \\cdot ');

  // Vectors: convert letter followed by combining arrow (⃗) to \vec{letter}
  str = str.replace(/([A-Za-z])[\u20D7\u2192]/g, '\\vec{$1}');
  str = str.replace(/([A-Za-z])⃗/g, '\\vec{$1}');

  // Unit vectors: convert letter followed by combining circumflex (̂) to \hat{letter}
  str = str.replace(/([A-Za-z])[\u0302]/g, '\\hat{$1}');
  str = str.replace(/([A-Za-z])̂/g, '\\hat{$1}');

  // Unicode superscripts & subscripts
  str = str
    .replace(/ⁿ⁻¹/g, '^{n-1}')
    .replace(/⁻¹/g, '^{-1}')
    .replace(/⁻²/g, '^{-2}')
    .replace(/⁻³/g, '^{-3}')
    .replace(/⁻ⁿ/g, '^{-n}')
    .replace(/⁻/g, '^-')
    .replace(/ⁿ/g, '^n')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/ₙ/g, '_n')
    .replace(/₁/g, '_1')
    .replace(/₂/g, '_2')
    .replace(/ᵢ/g, '_i')
    .replace(/ₒ/g, '_o')
    .replace(/½/g, '\\frac{1}{2}')
    .replace(/¼/g, '\\frac{1}{4}')
    .replace(/¾/g, '\\frac{3}{4}');

  // Unicode Greek & mathematical operators
  str = str
    .replace(/θ/g, '\\theta ')
    .replace(/λ/g, '\\lambda ')
    .replace(/Δ/g, '\\Delta ')
    .replace(/μ/g, '\\mu ')
    .replace(/η/g, '\\eta ')
    .replace(/π/g, '\\pi ')
    .replace(/ε/g, '\\varepsilon ')
    .replace(/ψ/g, '\\psi ')
    .replace(/ω/g, '\\omega ')
    .replace(/ρ/g, '\\rho ')
    .replace(/σ/g, '\\sigma ')
    .replace(/∮/g, '\\oint ')
    .replace(/∫/g, '\\int ')
    .replace(/Σ/g, '\\sum ')
    .replace(/∇/g, '\\nabla ')
    .replace(/∝/g, '\\propto ')
    .replace(/≤/g, '\\le ')
    .replace(/≥/g, '\\ge ')
    .replace(/≠/g, '\\neq ')
    .replace(/×/g, '\\times ')
    .replace(/⇒/g, '\\implies ')
    .replace(/→/g, '\\to ')
    .replace(/∞/g, '\\infty ')
    .replace(/lim_\{h→0\}/g, '\\lim_{h \\to 0}')
    .replace(/lim_\{h\\to 0\}/g, '\\lim_{h \\to 0}')
    .replace(/lim_\{n→∞\}/g, '\\lim_{n \\to \\infty}')
    .replace(/lim_\{n\\to\\infty\}/g, '\\lim_{n \\to \\infty}');

  // Square roots like √[...] or √(...) or √x
  str = str
    .replace(/√\[(.*?)\]/g, '\\sqrt{$1}')
    .replace(/√\((.*?)\)/g, '\\sqrt{$1}')
    .replace(/√([A-Za-z0-9]+)/g, '\\sqrt{$1}');

  return str;
}

/**
 * Safe fallback that produces clean, human-readable unicode math without ANY raw LaTeX macros
 * in the unlikely event that KaTeX fails.
 */
function createReadableFallback(latex: string): string {
  return latex
    .replace(/\\vec\{([^}]+)\}/g, '$1⃗')
    .replace(/\\hat\{([^}]+)\}/g, '$1̂')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\eta/g, 'η')
    .replace(/\\pi/g, 'π')
    .replace(/\\mu/g, 'μ')
    .replace(/\\varepsilon/g, 'ε')
    .replace(/\\psi/g, 'ψ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\rho/g, 'ρ')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\oint/g, '∮')
    .replace(/\\int/g, '∫')
    .replace(/\\sum/g, 'Σ')
    .replace(/\\nabla/g, '∇')
    .replace(/\\propto/g, '∝')
    .replace(/\\cdot/g, '·')
    .replace(/\\times/g, '×')
    .replace(/\\implies/g, '⇒')
    .replace(/\\to/g, '→')
    .replace(/\\infty/g, '∞')
    .replace(/\\le/g, '≤')
    .replace(/\\ge/g, '≥')
    .replace(/\\neq/g, '≠')
    .replace(/\\pm/g, '±')
    .replace(/\\sin/g, 'sin')
    .replace(/\\cos/g, 'cos')
    .replace(/\\tan/g, 'tan')
    .replace(/\\quad/g, ' ')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/_\{([^}]+)\}/g, '_{$1}')
    .replace(/\^\{([^}]+)\}/g, '^($1)')
    .replace(/[{}]/g, '')
    .replace(/\\/g, '');
}

export const MathView: React.FC<MathViewProps> = ({
  math,
  block = false,
  className = '',
  style
}) => {
  const html = useMemo(() => {
    if (!math) return '';
    const normalized = normalizeMathToLatex(math);

    try {
      return katex.renderToString(normalized, {
        displayMode: block,
        throwOnError: true,
        output: 'htmlAndMathml',
        strict: false
      });
    } catch {
      // If full expression fails, try simple fallback rendering
      const fallbackClean = createReadableFallback(normalized);
      try {
        return katex.renderToString(fallbackClean, {
          displayMode: block,
          throwOnError: false,
          output: 'htmlAndMathml',
          strict: false
        });
      } catch {
        return `<span class="katex-fallback" style="font-family: var(--font-math), serif; font-style: italic;">${fallbackClean}</span>`;
      }
    }
  }, [math, block]);

  return (
    <span
      className={`physora-math-view ${block ? 'physora-math-block' : 'physora-math-inline'} ${className}`}
      style={{
        display: block ? 'flex' : 'inline-flex',
        alignItems: 'center',
        justifyContent: block ? 'center' : 'baseline',
        overflowX: block ? 'auto' : 'visible',
        maxWidth: '100%',
        ...style
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default MathView;
