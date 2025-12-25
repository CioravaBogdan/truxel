const fs = require('fs');

const testCases = [
    { original: 'ÃŽ', expected: 'Î' },
    { original: 'ðŸš€', expected: '🚀' },
    { original: 'Łž', expected: 'Ş' }, // This one is tricky. Ł=C5 81, ž=C5 BE. Ş=C5 9E. 
    // Łž -> C5 81 C5 BE. 
    // Ş -> C5 9E.
    // This doesn't look like the same pattern.
    // Let's check what C5 9E looks like in Win1252.
    // C5 = Å. 9E = ž.
    // So Ş should be Åž.
    // Why did I see Łž?
    // Maybe it was Åž and I misread or the terminal output was weird?
    // Let's test Åž -> Ş.
    { original: 'Åž', expected: 'Ş' },
    { original: 'Ð›Ð¾Ð³Ñ–Ð½', expected: 'Логін' }
];

function tryFix(str) {
    // Method 1: Windows-1252 to UTF-8
    // We need a way to map characters back to bytes 0x00-0xFF based on Windows-1252
    // Node 'latin1' is ISO-8859-1.
    // We need a custom mapper for the 0x80-0x9F range if we want to be precise.
    // But let's try 'binary' (latin1) first.
    
    try {
        const buffer = Buffer.from(str, 'binary');
        const decoded = buffer.toString('utf8');
        return decoded;
    } catch (e) {
        return 'ERROR';
    }
}

// Custom Windows-1252 decoder/encoder simulation
// We want to take a string like "ÃŽ", get the bytes C3 8E, and treat them as UTF-8 bytes.
// "Ã" is U+00C3. In Latin1 it is byte C3.
// "Ž" is U+017D. In Latin1... it DOES NOT EXIST.
// "Ž" exists in Windows-1252 at 0x8E.
// So Buffer.from('Ž', 'latin1') will probably give '?' or garbage because 0x8E is control in Latin1.
// We need a Windows-1252 encoder.

const win1252 = {
    '€': 0x80, '‚': 0x82, 'ƒ': 0x83, '„': 0x84, '…': 0x85, '†': 0x86, '‡': 0x87,
    'ˆ': 0x88, '‰': 0x89, 'Š': 0x8A, '‹': 0x8B, 'Œ': 0x8C, 'Ž': 0x8E,
    '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97,
    '˜': 0x98, '™': 0x99, 'š': 0x9A, '›': 0x9B, 'œ': 0x9C, 'ž': 0x9E, 'Ÿ': 0x9F
};

function stringToWin1252Bytes(str) {
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const code = char.charCodeAt(0);
        if (code < 0x80) {
            bytes.push(code);
        } else if (code >= 0xA0 && code <= 0xFF) {
            bytes.push(code); // Latin1 range matches Win1252 mostly
        } else if (win1252[char]) {
            bytes.push(win1252[char]);
        } else {
            // Fallback for things that shouldn't be here if it's pure Win1252 mojibake
            // But "Ã" (C3) is in A0-FF range.
            // "Ž" (8E) is in the map.
            // What about "Ł"? U+0141. Not in Win1252.
            // If we see "Ł", it means the mojibake is NOT pure Win1252.
            // Maybe it's MacRoman? Or just some other mess.
            bytes.push(63); // ?
        }
    }
    return Buffer.from(bytes);
}

console.log('Testing fixes:');
testCases.forEach(tc => {
    const fixed = stringToWin1252Bytes(tc.original).toString('utf8');
    console.log(`Original: ${tc.original} -> Fixed: ${fixed} (Expected: ${tc.expected}) - Match: ${fixed === tc.expected}`);
});
