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

        // Determine base URL from request headers
        const host = req.headers.get('host') || 'localhost:3000';
        const protocol = 'http'; // Assumed http for local rendering
        const baseUrl = `${protocol}://${host}`;

        // Prepare input props
        // We use the proxy API to serve the files via HTTP to bypass file:// restrictions
        const inputProps = {
            ...data,
            audioUrl: `${baseUrl}/api/serve-file?file=${encodeURIComponent(audioPath)}`,
            coverArtUrl: `${baseUrl}/api/serve-file?file=${encodeURIComponent(coverPath)}`
        };

        // Calculate duration in frames if not provided (fallback) or use provided
        // For now trust the duration passed from frontend which calculated it from audio metadata

        const propsPath = path.join(tmpDir, `props_${uniqueId}.json`);

        // Write props to file to avoid command line length limits and quoting issues
        await writeFilePromise(propsPath, JSON.stringify(inputProps));

        console.log('Starting render...');

        const fps = data.settings?.fps || 60;

        // Calculate total frames. Expect frontend to pass durationInFrames.
        // If not, default to 300 (5 seconds at 60fps) to avoid 0 frame error
        const durationInFrames = data.durationInFrames || 300;

        // Use --props=<file> format works if the file path is absolute
        // calculateMetadata in Root.tsx will dynamically set the duration from props
        // --concurrency=50% uses half of CPU cores, --log=verbose shows progress
        const command = `npx remotion render src/remotion/index.tsx LyricVideo ${outputPath} --props=${propsPath} --fps=${fps} --crf=18 --log=verbose --concurrency=50%`;

        try {
            await execPromise(command, { cwd: process.cwd() });
        } catch (execError: any) {
            console.error('Remotion CLI failed:', execError);
            const stderr = execError.stderr ? execError.stderr.toString() : '';
            const stdout = execError.stdout ? execError.stdout.toString() : '';
            throw new Error(`Remotion rendering failed: ${stderr || stdout || execError.message}`);
        }

        console.log('Render complete.');

        // Read result
        const videoBuffer = await readFilePromise(outputPath);

        // Cleanup
        await Promise.all([
            unlinkPromise(audioPath).catch(console.error),
            unlinkPromise(coverPath).catch(console.error),
            unlinkPromise(outputPath).catch(console.error),
            unlinkPromise(propsPath).catch(console.error),
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
            // propsPath is not defined in this scope if failed before
        } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
        }

        return NextResponse.json(
            { error: 'Rendering failed', details: (error as Error).message },
            { status: 500 }
        );
    }
}
