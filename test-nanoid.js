const { nanoid } = require('nanoid');
try {
    console.log('Nanoid generated:', nanoid(10));
} catch (e) {
    console.error('Nanoid failed:', e);
}
