'use strict';

// Character art uploaded from the ACP Character Editor: portraits, skill images, passive and
// status icons. Images are centre-cropped to a square and scaled down to the game's 150px art
// size (smaller images keep their size), keeping their format so animations stay animated.
// They are stored in Mongo so they survive deploys, and served at /assets/character-art/<file>.
// The file name is a hash of the image, so the same image always gets the same URL.
const crypto = require('crypto');
const sharp = require('sharp');

const ART_SIZE = 150;
const ART_SOURCE_MAX_BYTES = 2 * 1024 * 1024;
const ART_OUTPUT_MAX_BYTES = 1024 * 1024;
const ART_URL_PREFIX = '/assets/character-art/';
const ART_FORMATS = {
    png: { mime: 'image/png', ext: 'png' },
    jpeg: { mime: 'image/jpeg', ext: 'jpg' },
    gif: { mime: 'image/gif', ext: 'gif' },
    webp: { mime: 'image/webp', ext: 'webp' },
};
const ART_FILE_PATTERN = /^[a-f0-9]{24}\.(png|jpg|gif|webp)$/;
const MIME_BY_EXT = Object.fromEntries(Object.values(ART_FORMATS).map(({ mime, ext }) => [ext, mime]));

class CharacterArtError extends Error {}

function parseDataUrl(dataUrl) {
    const match = typeof dataUrl === 'string'
        ? /^data:(image\/[a-z+.-]+);base64,([A-Za-z0-9+/=\s]+)$/i.exec(dataUrl)
        : null;
    if (!match) throw new CharacterArtError('Choose a PNG, JPEG, GIF, or WebP image.');
    return Buffer.from(match[2], 'base64');
}

async function prepareCharacterArt(buffer) {
    if (!Buffer.isBuffer(buffer) || !buffer.length) throw new CharacterArtError('Choose an image to upload.');
    if (buffer.length > ART_SOURCE_MAX_BYTES) throw new CharacterArtError('That image is over 2 MB. Pick a smaller one.');
    let metadata;
    try {
        metadata = await sharp(buffer, { animated: true }).metadata();
    } catch (error) {
        throw new CharacterArtError('That image could not be read. Use a PNG, JPEG, GIF, or WebP image.');
    }
    const format = ART_FORMATS[metadata.format];
    if (!format) throw new CharacterArtError('Unsupported image format. Use PNG, JPEG, GIF, or WebP.');
    const frames = metadata.pages || 1;
    const width = metadata.width;
    const height = frames > 1 ? metadata.pageHeight : metadata.height;
    const size = Math.min(ART_SIZE, width, height);

    let output = buffer;
    if (width !== size || height !== size) {
        let pipeline = sharp(buffer, { animated: frames > 1 }).resize(size, size, { fit: 'cover', position: 'centre' });
        if (metadata.format === 'gif') pipeline = pipeline.gif({ effort: 7 });
        else if (metadata.format === 'webp') pipeline = pipeline.webp({ quality: 90 });
        else if (metadata.format === 'jpeg') pipeline = pipeline.jpeg({ quality: 90, mozjpeg: true });
        else pipeline = pipeline.png({ compressionLevel: 9 });
        output = await pipeline.toBuffer();
    }
    if (output.length > ART_OUTPUT_MAX_BYTES) {
        throw new CharacterArtError('That image is still over 1 MB after resizing. Use a shorter or simpler animation.');
    }
    const hash = crypto.createHash('sha256').update(output).digest('hex').slice(0, 24);
    const file = `${hash}.${format.ext}`;
    return { file, url: ART_URL_PREFIX + file, mime: format.mime, buffer: output, width: size, height: size };
}

function createCharacterArtStore({ getCollection }) {
    const collection = () => (typeof getCollection === 'function' ? getCollection() : null);
    return {
        async upload(dataUrl, uploadedBy) {
            const prepared = await prepareCharacterArt(parseDataUrl(dataUrl));
            const store = collection();
            if (!store) throw new Error('Image storage is unavailable.');
            await store.updateOne(
                { file: prepared.file },
                { $setOnInsert: { file: prepared.file, mime: prepared.mime, data: prepared.buffer,
                    width: prepared.width, height: prepared.height, uploadedBy: uploadedBy || '', createdAt: new Date() } },
                { upsert: true }
            );
            return { url: prepared.url, width: prepared.width, height: prepared.height };
        },
        async find(file) {
            if (!ART_FILE_PATTERN.test(String(file || ''))) return null;
            const store = collection();
            if (!store) return null;
            const doc = await store.findOne({ file });
            if (!doc || !doc.data) return null;
            // The driver returns a BSON Binary; .buffer is its bytes.
            const data = Buffer.isBuffer(doc.data) ? doc.data : Buffer.from(doc.data.buffer || doc.data);
            return { mime: doc.mime || MIME_BY_EXT[file.split('.').pop()], data };
        },
    };
}

module.exports = {
    ART_SIZE,
    ART_URL_PREFIX,
    ART_FILE_PATTERN,
    CharacterArtError,
    prepareCharacterArt,
    createCharacterArtStore,
};
