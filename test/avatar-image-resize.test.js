const test = require('node:test');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const { prepareAvatarImage, prepareAvatarDataUrl, prepareAvatarFromRemote, AvatarImageError } = require('../services/avatarImage');

const solid = (width, height, color) =>
    sharp({ create: { width, height, channels: 4, background: color } });

const animatedGif = async (width, height, frames) => {
    const parts = await Promise.all(
        Array.from({ length: frames }, (_, index) => solid(width, height, { r: index * 80, g: 40, b: 200, alpha: 1 }).png().toBuffer())
    );
    return sharp(parts, { join: { animated: true } }).gif({ delay: 100 }).toBuffer();
};

test('Avatar resize: large static images are cropped to 100x100 in their own format', async () => {
    for (const format of ['png', 'jpeg', 'webp']) {
        const source = await solid(400, 250, { r: 200, g: 50, b: 50, alpha: 1 }).toFormat(format).toBuffer();
        const result = await prepareAvatarImage(source);
        const meta = await sharp(result.buffer).metadata();
        assert.equal(result.resized, true);
        assert.equal(meta.format, format);
        assert.equal(meta.width, 100);
        assert.equal(meta.height, 100);
    }
});

test('Avatar resize: animated GIFs keep every frame', async () => {
    const source = await animatedGif(300, 300, 3);
    const result = await prepareAvatarImage(source);
    const meta = await sharp(result.buffer, { animated: true }).metadata();
    assert.equal(result.mime, 'image/gif');
    assert.equal(meta.format, 'gif');
    assert.equal(meta.pages, 3);
    assert.equal(meta.width, 100);
    assert.equal(meta.pageHeight, 100);
});

test('Avatar resize: 100x100 images pass through untouched', async () => {
    const source = await animatedGif(100, 100, 2);
    const result = await prepareAvatarImage(source);
    assert.equal(result.resized, false);
    assert.equal(result.buffer, source);
    assert.equal(await prepareAvatarFromRemote('https://i.imgur.com/abc1234.gif', async () => source), 'https://i.imgur.com/abc1234.gif');
});

test('Avatar resize: a large remote image is stored as a resized data URL', async () => {
    const source = await solid(640, 640, { r: 0, g: 0, b: 0, alpha: 1 }).png().toBuffer();
    const stored = await prepareAvatarFromRemote('https://example.com/big.png', async () => source);
    assert.match(stored, /^data:image\/png;base64,/);
    const meta = await sharp(Buffer.from(stored.split(',')[1], 'base64')).metadata();
    assert.deepEqual([meta.width, meta.height], [100, 100]);
});

test('Avatar resize: uploads accept data URLs and reject junk or oversized files', async () => {
    const source = await solid(200, 200, { r: 9, g: 9, b: 9, alpha: 1 }).jpeg().toBuffer();
    const stored = await prepareAvatarDataUrl(`data:image/jpeg;base64,${source.toString('base64')}`);
    assert.match(stored, /^data:image\/jpeg;base64,/);
    await assert.rejects(prepareAvatarDataUrl('not a data url'), AvatarImageError);
    await assert.rejects(prepareAvatarDataUrl(`data:image/png;base64,${Buffer.from('hello').toString('base64')}`), AvatarImageError);
    await assert.rejects(prepareAvatarImage(Buffer.alloc(2 * 1024 * 1024 + 1)), /over 2 MB/);
});
