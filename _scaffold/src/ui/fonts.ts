// Font stacks for the UI (and for anyone drawing text into canvases/textures). GDD §14.5:
// Fraunces (soft + WONK) for display (door names, titles), Nunito for body/barks/menus,
// JetBrains Mono for System windows, numbers and timers. Black Han Sans is the Korean flavour face
// for large tags only (it turns to mush below ~14 px); small Korean tags use the system gothic.
// Fallbacks follow the GDD so the single-file build looks right with no network.

export const FONT = {
  display: '"Fraunces", Georgia, "Times New Roman", serif',
  body: '"Nunito", system-ui, "Segoe UI", "Helvetica Neue", sans-serif',
  mono: '"JetBrains Mono", "Cascadia Mono", ui-monospace, Consolas, "SF Mono", monospace',
  kr: '"Black Han Sans", "Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif',
  krSmall: '"Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", "Noto Sans CJK KR", sans-serif',
} as const;

const HREF =
  'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,500..900,0..100,0..1' +
  '&family=Nunito:wght@400..900' +
  '&family=JetBrains+Mono:wght@400..800' +
  '&family=Black+Han+Sans' +
  '&display=swap';

/** Every Korean glyph the UI prints in the large flavour face, so its subsets load up front. */
const KR_SAMPLE = '시스템퀘스트경고위험보상오류후원제단목표일반희귀영웅신화맹세기록';

let loading: Promise<void> | null = null;

/** Inject the Google Fonts stylesheet once. Resolves when fonts are ready or after `timeoutMs`. */
export function loadFonts(timeoutMs = 2500): Promise<void> {
  if (loading) return loading;
  if (typeof document === 'undefined') return (loading = Promise.resolve());
  if (!document.querySelector('link[data-tf-fonts]')) {
    for (const origin of ['https://fonts.googleapis.com', 'https://fonts.gstatic.com']) {
      const pre = document.createElement('link');
      pre.rel = 'preconnect';
      pre.href = origin;
      if (origin.includes('gstatic')) pre.crossOrigin = 'anonymous';
      document.head.appendChild(pre);
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = HREF;
    link.dataset.tfFonts = '1';
    document.head.appendChild(link);
  }
  let ready: Promise<unknown> = Promise.resolve();
  if (document.fonts) {
    const fonts = document.fonts;
    // Faces only download when text first uses them; ask for them now so the first System window
    // does not type out in a fallback face and then jump.
    const want = ['600 16px "JetBrains Mono"', '800 16px "Fraunces"', '700 16px "Nunito"'];
    ready = Promise.all([
      ...want.map((f) => fonts.load(f).catch(() => [])),
      fonts.load('16px "Black Han Sans"', KR_SAMPLE).catch(() => []),
    ]).then(() => fonts.ready);
  }
  loading = Promise.race([ready.then(() => undefined), new Promise<void>((r) => setTimeout(r, timeoutMs))]);
  return loading;
}

/** True once the display faces actually resolved (false when running on fallbacks). */
export function displayFontLoaded(): boolean {
  if (typeof document === 'undefined' || !document.fonts) return false;
  // FontFaceSet.check() is true for undeclared families, so look for loaded faces instead.
  const loaded = new Set<string>();
  for (const f of document.fonts) if (f.status === 'loaded') loaded.add(f.family.replace(/"/g, ''));
  return loaded.has('JetBrains Mono') && loaded.has('Fraunces') && loaded.has('Nunito');
}
