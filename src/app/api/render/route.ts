import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execPromise = promisify(exec);
const writeFilePromise = promisify(fs.writeFile);
const readFilePromise = promisify(fs.readFile);
const unlinkPromise = promisify(fs.unlink);

export async function POST(req: NextRequest) {
    const tmpDir = os.tmpdir();
    const uniqueId = Date.now().toString() + Math.random().toString(36).substring(7);
    const audioPath = path.join(tmpDir, `audio_${uniqueId}.mp3`);
    const coverPath = path.join(tmpDir, `cover_${uniqueId}.png`);
    const outputPath = path.join(tmpDir, `video_${uniqueId}.mp4`);

    try {
        const formData = await req.formData();
        const audioFile = formData.get('audio') as File;
        const coverFile = formData.get('coverArt') as File;
        const dataString = formData.get('data') as string;

        if (!audioFile || !coverFile || !dataString) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const data = JSON.parse(dataString);

        // Save files to temp dir
        const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
        const coverBuffer = Buffer.from(await coverFile.arrayBuffer());

        await writeFilePromise(audioPath, audioBuffer);
        await writeFilePromise(coverPath, coverBuffer);

        // Prepare input props
        // We need to pass file paths that Remotion can access. 
        // Since we are running locally, absolute paths work.
        const inputProps = {
            ...data,
            audioUrl: audioPath, // Remotion can read from local path
            coverArtUrl: coverPath // Remotion can read from local path
        };

        // Calculate duration in frames if not provided (fallback) or use provided
        // For now trust the duration passed from frontend which calculated it from audio metadata

        const propsJson = JSON.stringify(inputProps);

        // Command to render
        // We use npx remotion render
        // output path
        console.log('Starting render...');

        // Escape single quotes in JSON for shell command (basic protection)
        const escapedProps = propsJson.replace(/'/g, "'\\''");

        const command = `npx remotion render src/remotion/index.ts LyricVideo ${outputPath} --props='${escapedProps}'`;

        await execPromise(command, { cwd: process.cwd() });

        console.log('Render complete.');

        // Read result
        const videoBuffer = await readFilePromise(outputPath);

        // Cleanup
        await Promise.all([
            unlinkPromise(audioPath).catch(console.error),
            unlinkPromise(coverPath).catch(console.error),
            unlinkPromise(outputPath).catch(console.error),
        ]);

        return new NextResponse(videoBuffer, {
            headers: {
                'Content-Type': 'video/mp4',
                'Content-Disposition': 'attachment; filename="lyric-video.mp4"',
            },
        });

    } catch (error) {
        console.error('Render error:', error);

        // Cleanup on error
        try {
            if (fs.existsSync(audioPath)) await unlinkPromise(audioPath);
            if (fs.existsSync(coverPath)) await unlinkPromise(coverPath);
            if (fs.existsSync(outputPath)) await unlinkPromise(outputPath);
        } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
        }

        return NextResponse.json(
            { error: 'Rendering failed', details: (error as Error).message },
            { status: 500 }
        );
    }
}
