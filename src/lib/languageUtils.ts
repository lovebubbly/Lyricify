/**
 * Detect if text is primarily English (ASCII-based)
 * Returns true if the text contains mostly English characters
 */
export function isEnglishText(text: string): boolean {
    if (!text || text.trim().length === 0) return false;

    // Remove punctuation, numbers, and whitespace for analysis
    const cleanText = text.replace(/[\s\d\p{P}]/gu, '');

    if (cleanText.length === 0) return true; // Only punctuation/numbers

    // Count ASCII letters (English)
    let englishCount = 0;
    let nonEnglishCount = 0;

    for (const char of cleanText) {
        const code = char.charCodeAt(0);

        // ASCII letters (A-Z, a-z)
        if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
            englishCount++;
        }
        // Korean characters (Hangul syllables, Jamo, compatibility Jamo)
        else if (
            (code >= 0xAC00 && code <= 0xD7AF) || // Hangul Syllables
            (code >= 0x1100 && code <= 0x11FF) || // Hangul Jamo
            (code >= 0x3130 && code <= 0x318F)    // Hangul Compatibility Jamo
        ) {
            nonEnglishCount++;
        }
        // Other non-ASCII characters (Japanese, Chinese, etc.)
        else if (code > 127) {
            nonEnglishCount++;
        }
    }

    // If more than 80% is English, consider it English text
    const totalNonSpace = englishCount + nonEnglishCount;
    if (totalNonSpace === 0) return true;

    return (englishCount / totalNonSpace) > 0.8;
}

/**
 * Check if text contains Korean characters
 */
export function containsKorean(text: string): boolean {
    if (!text) return false;

    const koreanRegex = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/;
    return koreanRegex.test(text);
}

/**
 * Check if we should show subtitle for a given main lyric line
 * Returns false if the main line is already in English (no need for translation)
 */
export function shouldShowSubtitle(mainText: string, subText: string | undefined): boolean {
    if (!subText) return false;

    // If main text is primarily English, don't show English subtitle
    if (isEnglishText(mainText)) {
        return false;
    }

    return true;
}
