/**
 * Get audio duration from a file
 */
export function getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        const url = URL.createObjectURL(file);

        audio.onloadedmetadata = () => {
            URL.revokeObjectURL(url);
            resolve(audio.duration);
        };

        audio.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load audio file'));
        };

        audio.src = url;
    });
}

/**
 * Convert seconds to frame number
 */
export function secondsToFrames(seconds: number, fps: number = 30): number {
    return Math.round(seconds * fps);
}

/**
 * Convert frame number to seconds
 */
export function framesToSeconds(frames: number, fps: number = 30): number {
    return frames / fps;
}

/**
 * Calculate total frames for a duration
 */
export function calculateDurationInFrames(
    durationSeconds: number,
    fps: number = 30
): number {
    return Math.ceil(durationSeconds * fps);
}

/**
 * Create an object URL for a file (remember to revoke when done)
 */
export function createFileUrl(file: File): string {
    return URL.createObjectURL(file);
}

/**
 * Revoke an object URL to free memory
 */
export function revokeFileUrl(url: string): void {
    URL.revokeObjectURL(url);
}

/**
 * Format frame count to timecode (HH:MM:SS:FF)
 */
export function framesToTimecode(frames: number, fps: number = 30): string {
    const totalSeconds = Math.floor(frames / fps);
    const remainingFrames = frames % fps;

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0'),
        remainingFrames.toString().padStart(2, '0')
    ].join(':');
}

/**
 * Check if file is a valid audio file
 */
export function isValidAudioFile(file: File): boolean {
    const validTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/x-wav'];
    return validTypes.includes(file.type) ||
        file.name.endsWith('.wav') ||
        file.name.endsWith('.mp3');
}

/**
 * Check if file is a valid image file
 */
export function isValidImageFile(file: File): boolean {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    return validTypes.includes(file.type) ||
        file.name.endsWith('.png') ||
        file.name.endsWith('.jpg') ||
        file.name.endsWith('.jpeg');
}

/**
 * Check if file is a valid SRT file
 */
export function isValidSRTFile(file: File): boolean {
    return file.name.endsWith('.srt') || file.type === 'application/x-subrip';
}
