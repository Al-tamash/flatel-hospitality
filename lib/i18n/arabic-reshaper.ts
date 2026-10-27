/**
 * Lightweight Arabic Text Reshaper & BiDi Reverser for PDF Generation
 * Converts Arabic Unicode characters to presentation forms (isolated, initial, medial, final)
 * and resolves RTL text ordering for canvas/PDF rendering engines like jsPDF.
 */

interface ArabicCharForms {
  isolated: number;
  final: number;
  initial?: number;
  medial?: number;
}

const ARABIC_GLYPH_TABLE: Record<number, ArabicCharForms> = {
  0x0621: { isolated: 0xfe80, final: 0xfe80 }, // Hamza
  0x0622: { isolated: 0xfe81, final: 0xfe82 }, // Alef with Madda Above
  0x0623: { isolated: 0xfe83, final: 0xfe84 }, // Alef with Hamza Above
  0x0624: { isolated: 0xfe85, final: 0xfe86 }, // Waw with Hamza Above
  0x0625: { isolated: 0xfe87, final: 0xfe88 }, // Alef with Hamza Below
  0x0626: { isolated: 0xfe89, final: 0xfe8a, initial: 0xfe8b, medial: 0xfe8c }, // Yeh with Hamza Above
  0x0627: { isolated: 0xfe8d, final: 0xfe8e }, // Alef
  0x0628: { isolated: 0xfe8f, final: 0xfe90, initial: 0xfe91, medial: 0xfe92 }, // Beh
  0x0629: { isolated: 0xfe93, final: 0xfe94 }, // Teh Marbuta
  0x062a: { isolated: 0xfe95, final: 0xfe96, initial: 0xfe97, medial: 0xfe98 }, // Teh
  0x062b: { isolated: 0xfe99, final: 0xfe9a, initial: 0xfe9b, medial: 0xfe9c }, // Theh
  0x062c: { isolated: 0xfe9d, final: 0xfe9e, initial: 0xfe9f, medial: 0xfea0 }, // Jeem
  0x062d: { isolated: 0xfea1, final: 0xfea2, initial: 0xfea3, medial: 0xfea4 }, // Hah
  0x062e: { isolated: 0xfea5, final: 0xfea6, initial: 0xfea7, medial: 0xfea8 }, // Khah
  0x062f: { isolated: 0xfea9, final: 0xfeaa }, // Dal
  0x0630: { isolated: 0xfeab, final: 0xfeac }, // Thal
  0x0631: { isolated: 0xfead, final: 0xfeae }, // Reh
  0x0632: { isolated: 0xfeaf, final: 0xfeb0 }, // Zain
  0x0633: { isolated: 0xfeb1, final: 0xfeb2, initial: 0xfeb3, medial: 0xfeb4 }, // Seen
  0x0634: { isolated: 0xfeb5, final: 0xfeb6, initial: 0xfeb7, medial: 0xfeb8 }, // Sheen
  0x0635: { isolated: 0xfeb9, final: 0xfeba, initial: 0xfebb, medial: 0xfebc }, // Sad
  0x0636: { isolated: 0xfebd, final: 0xfebe, initial: 0xfebf, medial: 0xfec0 }, // Dad
  0x0637: { isolated: 0xfec1, final: 0xfec2, initial: 0xfec3, medial: 0xfec4 }, // Tah
  0x0638: { isolated: 0xfec5, final: 0xfec6, initial: 0xfec7, medial: 0xfec8 }, // Zah
  0x0639: { isolated: 0xfec9, final: 0xfeca, initial: 0xfecb, medial: 0xfecc }, // Ain
  0x063a: { isolated: 0xfecd, final: 0xfece, initial: 0xfecf, medial: 0xfed0 }, // Ghain
  0x0641: { isolated: 0xfed1, final: 0xfed2, initial: 0xfed3, medial: 0xfed4 }, // Feh
  0x0642: { isolated: 0xfed5, final: 0xfed6, initial: 0xfed7, medial: 0xfed8 }, // Qaf
  0x0643: { isolated: 0xfed9, final: 0xfeda, initial: 0xfedb, medial: 0xfedc }, // Kaf
  0x0644: { isolated: 0xfedd, final: 0xfede, initial: 0xfedf, medial: 0xfee0 }, // Lam
  0x0645: { isolated: 0xfee1, final: 0xfee2, initial: 0xfee3, medial: 0xfee4 }, // Meem
  0x0646: { isolated: 0xfee5, final: 0xfee6, initial: 0xfee7, medial: 0xfee8 }, // Noon
  0x0647: { isolated: 0xfee9, final: 0xfeea, initial: 0xfeeb, medial: 0xfeec }, // Heh
  0x0648: { isolated: 0xfeed, final: 0xfeee }, // Waw
  0x0649: { isolated: 0xfeef, final: 0xfef0 }, // Alef Maksura
  0x064a: { isolated: 0xfef1, final: 0xfef2, initial: 0xfef3, medial: 0xfef4 }, // Yeh
};

// Check if character can connect to following characters
function connectsToNext(code: number): boolean {
  const forms = ARABIC_GLYPH_TABLE[code];
  return Boolean(forms && forms.initial && forms.medial);
}

// Check if character can connect to preceding characters
function connectsToPrev(code: number): boolean {
  const forms = ARABIC_GLYPH_TABLE[code];
  return Boolean(forms && forms.final);
}

function isArabicChar(code: number): boolean {
  return (code >= 0x0600 && code <= 0x06ff) || (code >= 0x0750 && code <= 0x077f) || (code >= 0x08a0 && code <= 0x08ff);
}

/**
 * Reshapes an Arabic string into connected cursive glyphs with Lam-Alef ligatures.
 */
export function reshapeArabic(text: string): string {
  if (!text) return "";

  // 1. Process Lam-Alef ligatures first
  const withLigatures = text
    .replace(/\u0644\u0622/g, "\uFEF5") // Lam + Alef Madda
    .replace(/\u0644\u0623/g, "\uFEF7") // Lam + Alef Hamza Above
    .replace(/\u0644\u0625/g, "\uFEF9") // Lam + Alef Hamza Below
    .replace(/\u0644\u0627/g, "\uFEFB"); // Lam + Alef

  const chars = Array.from(withLigatures);
  const result: string[] = [];

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const code = char.charCodeAt(0);
    const forms = ARABIC_GLYPH_TABLE[code];

    if (!forms) {
      // Check if it's an already replaced Lam-Alef ligature
      if (code >= 0xfef5 && code <= 0xfefc) {
        const prevCode = i > 0 ? chars[i - 1].charCodeAt(0) : 0;
        const prevConnects = connectsToNext(prevCode);
        // Odd codes are isolated, even codes are final
        const baseCode = (code % 2 === 1) ? code : code - 1;
        result.push(String.fromCharCode(prevConnects ? baseCode + 1 : baseCode));
      } else {
        result.push(char);
      }
      continue;
    }

    const prevCode = i > 0 ? chars[i - 1].charCodeAt(0) : 0;
    const nextCode = i < chars.length - 1 ? chars[i + 1].charCodeAt(0) : 0;

    const prevConnects = connectsToNext(prevCode);
    const nextConnects = connectsToPrev(nextCode);

    let shapedCode = forms.isolated;

    if (prevConnects && nextConnects && forms.medial) {
      shapedCode = forms.medial;
    } else if (prevConnects && forms.final) {
      shapedCode = forms.final;
    } else if (nextConnects && forms.initial) {
      shapedCode = forms.initial;
    } else {
      shapedCode = forms.isolated;
    }

    result.push(String.fromCharCode(shapedCode));
  }

  return result.join("");
}

/**
 * Reverses shaped Arabic words for Right-to-Left (RTL) PDF canvas layout,
 * while preserving Left-to-Right (LTR) order for numbers, Latin words, and prices.
 */
export function shapeAndBidiArabic(text: string): string {
  if (!text) return "";

  // Segment text into words / tokens
  const tokens = text.split(/(\s+|[0-9]+[.,]?[0-9]*|INR|\₹|\:|\-|\(|\)|\/)/g);
  const shapedTokens = tokens.map((token) => {
    if (!token) return "";
    // If token contains Arabic letters, reshape and reverse it
    const hasArabic = Array.from(token).some((c) => isArabicChar(c.charCodeAt(0)) || (c.charCodeAt(0) >= 0xfe80 && c.charCodeAt(0) <= 0xfefc));
    if (hasArabic) {
      const reshaped = reshapeArabic(token);
      return Array.from(reshaped).reverse().join("");
    }
    return token;
  });

  // Reverse overall token order so sentence starts from the right
  return shapedTokens.reverse().join("");
}
