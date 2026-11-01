// Shared rules for shop cosmetics: what an admin may publish, and what players may buy.
const CATEGORIES = ['avatars', 'borders', 'titles'];
const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
// draft: hidden while being prepared. live: sold in the shop. retired: no longer sold, owners keep it.
const STATUSES = ['draft', 'live', 'retired'];
const NAME_LIMITS = { avatars: 40, borders: 40, titles: 28 };
const DESCRIPTION_LIMIT = 160;
const MAX_PRICE = 100000;
const MIN_IMAGE_SIZE = 100;

const IMGUR_DIRECT = /^https?:\/\/i\.imgur\.com\/([A-Za-z0-9]{5,10})\.(png|jpe?g|gif|webp)$/i;
const IMGUR_PAGE = /^https?:\/\/(?:www\.|m\.)?imgur\.com\/([A-Za-z0-9]{5,10})\/?$/i;
const IMGUR_ALBUM = /^https?:\/\/(?:www\.|m\.)?imgur\.com\/(?:a|gallery|t)\//i;

const getItemStatus = (item) => (STATUSES.includes(item?.status) ? item.status : 'live');
const isOnSale = (item) => getItemStatus(item) === 'live';

// Accepts direct links or single-image page links and returns the direct i.imgur.com URL.
function normalizeImgurUrl(value) {
    const raw = String(value || '').trim().replace(/[?#].*$/, '');
    if (!raw) return { error: 'An Imgur image link is required.' };
    if (IMGUR_ALBUM.test(raw)) {
        return { error: 'Album and gallery links cannot be used. Open the single image and copy its direct link (i.imgur.com/…).' };
    }
    const direct = IMGUR_DIRECT.exec(raw);
    if (direct) return { url: `https://i.imgur.com/${direct[1]}.${direct[2].toLowerCase().replace('jpeg', 'jpg')}` };
    const page = IMGUR_PAGE.exec(raw);
    if (page) return { url: `https://i.imgur.com/${page[1]}.png` };
    return { error: 'Use an Imgur image link, for example https://i.imgur.com/abc1234.png.' };
}

function slugify(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 32) || 'item';
}

function createCosmeticId(category, name) {
    const prefix = { avatars: 'avatar', borders: 'border', titles: 'title' }[category] || 'item';
    return `${prefix}_${slugify(name)}_${Math.random().toString(36).slice(2, 6)}`;
}

// Validates an admin create (no `existing`) or partial update. Image contents are checked separately.
function validateCosmeticInput(input = {}, existing = null) {
    const errors = [];
    const has = (key) => !existing || Object.prototype.hasOwnProperty.call(input, key);
    const category = existing ? existing.category : String(input.category || '').trim().toLowerCase();
    if (!CATEGORIES.includes(category)) {
        return { errors: ['Category must be avatars, borders, or titles.'] };
    }
    const item = existing ? { ...existing } : { category };

    if (has('name')) {
        const name = String(input.name || '').trim().replace(/\s+/g, ' ');
        if (!name) errors.push('A name is required.');
        else if (name.length > NAME_LIMITS[category]) errors.push(`Names for ${category} can be at most ${NAME_LIMITS[category]} characters.`);
        item.name = name;
    }
    if (has('description')) {
        const description = String(input.description || '').trim();
        if (description.length > DESCRIPTION_LIMIT) errors.push(`Descriptions can be at most ${DESCRIPTION_LIMIT} characters.`);
        item.description = description;
    }
    if (has('rarity')) {
        const rarity = String(input.rarity || '').trim().toLowerCase();
        if (!RARITIES.includes(rarity)) errors.push('Pick a rarity.');
        item.rarity = rarity;
    }
    if (has('price')) {
        const price = Number(input.price);
        if (input.price === '' || input.price == null || !Number.isInteger(price) || price < 0 || price > MAX_PRICE) {
            errors.push(`Price must be a whole number of Ryo from 0 to ${MAX_PRICE.toLocaleString('en-US')}.`);
        }
        item.price = price;
    }
    if (has('status')) {
        const status = String(input.status || (existing ? '' : 'draft')).trim().toLowerCase();
        if (!STATUSES.includes(status)) errors.push('Status must be draft, live, or retired.');
        item.status = status;
    }
    if (category === 'titles') {
        delete item.imageUrl;
    } else if (has('imageUrl')) {
        const requested = String(input.imageUrl || '').trim();
        // Items published before the Imgur workflow keep their original asset path.
        if (existing && requested === existing.imageUrl) {
            item.imageUrl = existing.imageUrl;
        } else {
            const normalized = normalizeImgurUrl(requested);
            if (normalized.error) errors.push(normalized.error);
            else if (category === 'borders' && /\.jpg$/.test(normalized.url)) errors.push('Borders need a transparent center, so use a PNG or WebP image (JPG has no transparency).');
            item.imageUrl = normalized.url || requested;
        }
    }
    return { item, errors };
}

// Problems with the actual image file, given what inspectRemoteImage reports.
function checkCosmeticImage(category, info) {
    const errors = [];
    const warnings = [];
    if (info.width !== info.height) {
        errors.push(`The image must be square; this one is ${info.width}×${info.height}.`);
    }
    if (Math.min(info.width, info.height) < MIN_IMAGE_SIZE) {
        errors.push(`The image must be at least ${MIN_IMAGE_SIZE}×${MIN_IMAGE_SIZE}; this one is ${info.width}×${info.height}.`);
    }
    if (category === 'borders') {
        if (!['png', 'webp'].includes(info.format)) {
            errors.push('Borders must be PNG or WebP so the avatar shows through.');
        } else if (info.hasAlpha === false) {
            errors.push('This border has no transparent pixels, so it would cover the avatar. Export it with a transparent center.');
        }
    }
    if (Math.max(info.width, info.height) > 1024) {
        warnings.push('This image is larger than it needs to be; 150–300px loads faster.');
    }
    return { errors, warnings };
}

module.exports = {
    CATEGORIES,
    RARITIES,
    STATUSES,
    NAME_LIMITS,
    MAX_PRICE,
    getItemStatus,
    isOnSale,
    normalizeImgurUrl,
    createCosmeticId,
    validateCosmeticInput,
    checkCosmeticImage,
};
