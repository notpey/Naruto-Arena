'use strict';

// Player avatars are shown at 100x100. Anything larger is centre-cropped and scaled down here,
// keeping its format so animated GIFs (and animated WebPs) stay animated.
const sharp = require('sharp');

const AVATAR_SIZE = 100;
const AVATAR_SOURCE_MAX_BYTES = 2 * 1024 * 1024;
const AVATAR_OUTPUT_MAX_BYTES = 512 * 1024;
const AVATAR_FORMATS = {
    png: 'image/png',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
};

class AvatarImageError extends Error {}

async function readAvatarInfo(buffer) {
    let metadata;
    try {
        metadata = await sharp(buffer, { animated: true }).metadata();
    } catch (error) {
        throw new AvatarImageError('That image could not be read. Use a PNG, JPEG, GIF, or WebP image.');
    }
    if (!AVATAR_FORMATS[metadata.format]) {
        throw new AvatarImageError('Unsupported image format. Use PNG, JPEG, GIF, or WebP.');
    }
    const frames = metadata.pages || 1;
    return {
        format: metadata.format,
        width: metadata.width,
        // Animated images report the full frame strip as their height.
        height: frames > 1 ? metadata.pageHeight : metadata.height,
        frames,
    };
}

// Returns { buffer, mime, width, height, resized }. Images that are already 100x100 pass through untouched.
async function prepareAvatarImage(buffer) {
    if (!Buffer.isBuffer(buffer) || !buffer.length) {
        throw new AvatarImageError('A valid image is required.');
    }
    if (buffer.length > AVATAR_SOURCE_MAX_BYTES) {
        throw new AvatarImageError('That image is over 2 MB. Pick a smaller one.');
    }
    const info = await readAvatarInfo(buffer);
    const mime = AVATAR_FORMATS[info.format];
    if (info.width === AVATAR_SIZE && info.height === AVATAR_SIZE) {
        if (buffer.length > AVATAR_OUTPUT_MAX_BYTES) {
            throw new AvatarImageError('That avatar is over 512 KB. Use a shorter or simpler animation.');
        }
        return { buffer, mime, width: AVATAR_SIZE, height: AVATAR_SIZE, resized: false };
    }

    let pipeline = sharp(buffer, { animated: info.frames > 1 }).resize(AVATAR_SIZE, AVATAR_SIZE, {
        fit: 'cover',
        position: 'centre',
    });
    if (info.format === 'gif') pipeline = pipeline.gif({ effort: 7 });
    else if (info.format === 'webp') pipeline = pipeline.webp({ quality: 90 });
    else if (info.format === 'jpeg') pipeline = pipeline.jpeg({ quality: 90, mozjpeg: true });
    else pipeline = pipeline.png({ compressionLevel: 9 });

    const output = await pipeline.toBuffer();
    if (output.length > AVATAR_OUTPUT_MAX_BYTES) {
        throw new AvatarImageError('That avatar is still over 512 KB after resizing. Use a shorter or simpler animation.');
    }
    return { buffer: output, mime, width: AVATAR_SIZE, height: AVATAR_SIZE, resized: true };
}

function toDataUrl(prepared) {
    return `data:${prepared.mime};base64,${prepared.buffer.toString('base64')}`;
}

function parseImageDataUrl(dataUrl) {
    const match = typeof dataUrl === 'string' ? /^data:(image\/[a-z+.-]+);base64,([A-Za-z0-9+/=\s]+)$/i.exec(dataUrl) : null;
    if (!match) throw new AvatarImageError('A valid image data URL is required.');
    return Buffer.from(match[2], 'base64');
}

// Uploaded file (as a data URL) -> the data URL to store on the profile.
async function prepareAvatarDataUrl(dataUrl) {
    return toDataUrl(await prepareAvatarImage(parseImageDataUrl(dataUrl)));
}

// Remote image -> its own URL when it is already 100x100, otherwise a resized copy as a data URL.
async function prepareAvatarFromRemote(url, fetchBuffer) {
    const prepared = await prepareAvatarImage(await fetchBuffer(url));
    return prepared.resized ? toDataUrl(prepared) : url;
}

module.exports = {
    AVATAR_SIZE,
    AVATAR_SOURCE_MAX_BYTES,
    AVATAR_OUTPUT_MAX_BYTES,
    AvatarImageError,
    prepareAvatarImage,
    prepareAvatarDataUrl,
    prepareAvatarFromRemote,
};
