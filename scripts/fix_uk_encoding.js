const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../locales/uk.json');

try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // The content is double-encoded. 
    // It was UTF-8 bytes interpreted as Windows-1252/Latin-1, then saved as UTF-8.
    // To fix:
    // 1. Get the code points of the current string (which are actually the bytes of the original UTF-8)
    // 2. Re-assemble those bytes into a buffer
    // 3. Decode that buffer as UTF-8
    
    // However, we need to be careful. Some characters might be correct (ASCII).
    // ASCII characters (00-7F) are the same in UTF-8 and Windows-1252.
    // The problem is with bytes >= 0x80.
    
    // Let's try a "binary" roundtrip.
    // In Node.js, 'binary' encoding is an alias for 'latin1'.
    // It maps bytes 0-255 to U+0000-U+00FF.
    
    const fixedContent = Buffer.from(content, 'binary').toString('utf8');
    
    // Check if it looks like valid JSON
    JSON.parse(fixedContent);
    
    console.log('Successfully fixed encoding for uk.json');
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    
} catch (e) {
    console.error('Failed to fix uk.json:', e);
    
    // Fallback: Try to fix specific common patterns if the global fix fails
    // But for uk.json, it looks like a global double-encoding issue.
}
