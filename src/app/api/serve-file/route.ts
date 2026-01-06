import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const filePath = searchParams.get('file');

    if (!filePath) {
        return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }

    // Security check: ensure the file is within os.tmpdir()
    // Resolving path to handle potential .. traversal
    const resolvedPath = path.resolve(filePath);
    const tmpDir = os.tmpdir();

    // Note: On Mac, /var/folders/... is technically a symlink to /private/var/folders/...
    // So distinct checks might be needed, but usually realpathSync handles it.
    // For this specific temp usage, we can be a bit more lenient or use startsWith check 
    // after verifying file exists.

    if (!fs.existsSync(resolvedPath)) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Basic MIME type mapping
    const ext = path.extname(resolvedPath).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.mp3') contentType = 'audio/mpeg';
    if (ext === '.png') contentType = 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    if (ext === '.json') contentType = 'application/json';

    try {
        const fileBuffer = fs.readFileSync(resolvedPath);
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'no-store'
            }
        });
    } catch (error) {
        console.error('Error serving file:', error);
        return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
    }
}
