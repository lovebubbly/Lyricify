import { LyricLine, ParsedSRT } from '@/types';

/**
 * Parse SRT file content into structured lyric lines
 * SRT Format:
 * 1
 * 00:00:01,000 --> 00:00:04,000
 * First line of lyrics
 * 
 * 2
 * 00:00:05,000 --> 00:00:08,000
 * Second line of lyrics
 */
export function parseSRT(content: string, fps: number = 30): ParsedSRT {
    const lines: LyricLine[] = [];

    // Normalize line endings and split into blocks
    const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const blocks = normalizedContent.trim().split(/\n\n+/);

    let maxEndTime = 0;

    for (const block of blocks) {
        const blockLines = block.trim().split('\n');

        if (blockLines.length < 3) continue;

        // Parse index (first line)
        const id = parseInt(blockLines[0], 10);
        if (isNaN(id)) continue;

        // Parse timestamps (second line)
        const timestampLine = blockLines[1];
        const timestampMatch = timestampLine.match(
            /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/
        );

        if (!timestampMatch) continue;

        const startTime = parseTimestamp(
            timestampMatch[1],
            timestampMatch[2],
            timestampMatch[3],
            timestampMatch[4]
        );

        const endTime = parseTimestamp(
            timestampMatch[5],
            timestampMatch[6],
            timestampMatch[7],
            timestampMatch[8]
        );

        // Parse text (remaining lines)
        const text = blockLines.slice(2).join('\n').trim();

        if (text) {
            lines.push({
                id,
                startTime,
                endTime,
                startFrame: Math.round(startTime * fps),
                endFrame: Math.round(endTime * fps),
                text
            });

            maxEndTime = Math.max(maxEndTime, endTime);
        }
    }

    return {
        lines: lines.sort((a, b) => a.startTime - b.startTime),
        duration: maxEndTime
    };
}

/**
 * Convert timestamp parts to seconds
 */
function parseTimestamp(
    hours: string,
    minutes: string,
    seconds: string,
    milliseconds: string
): number {
    return (
        parseInt(hours, 10) * 3600 +
        parseInt(minutes, 10) * 60 +
        parseInt(seconds, 10) +
        parseInt(milliseconds, 10) / 1000
    );
}

/**
 * Get the active lyric line at a given time
 */
export function getActiveLine(
    lines: LyricLine[],
    currentTime: number
): number {
    for (let i = 0; i < lines.length; i++) {
        if (currentTime >= lines[i].startTime && currentTime < lines[i].endTime) {
            return i;
        }
    }

    // If between lines, find the next upcoming line
    for (let i = 0; i < lines.length; i++) {
        if (currentTime < lines[i].startTime) {
            return i > 0 ? i - 1 : -1;
        }
    }

    // Past all lines
    return lines.length - 1;
}

/**
 * Get the active lyric line at a given frame
 */
export function getActiveLineByFrame(
    lines: LyricLine[],
    currentFrame: number
): number {
    for (let i = 0; i < lines.length; i++) {
        if (currentFrame >= lines[i].startFrame && currentFrame < lines[i].endFrame) {
            return i;
        }
    }

    // If between lines, find the next upcoming line
    for (let i = 0; i < lines.length; i++) {
        if (currentFrame < lines[i].startFrame) {
            return i > 0 ? i - 1 : -1;
        }
    }

    // Past all lines
    return lines.length - 1;
}

/**
 * Format seconds to mm:ss display
 */
export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Read an SRT file and parse it
 */
export async function readAndParseSRT(
    file: File,
    fps: number = 30
): Promise<ParsedSRT> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const content = e.target?.result as string;
            try {
                const parsed = parseSRT(content, fps);
                resolve(parsed);
            } catch (error) {
                reject(new Error('Failed to parse SRT file'));
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsText(file);
    });
}
