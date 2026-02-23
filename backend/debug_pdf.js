const pdfParse = require('pdf-parse');
console.log('Type of pdf-parse:', typeof pdfParse);
console.log('Is it a function?', typeof pdfParse === 'function');
console.log('Object keys:', Object.keys(pdfParse));

try {
    const fs = require('fs');
    if (!fs.existsSync('test.pdf')) {
        console.log('test.pdf does not exist, creating placeholder');
        // This is not a real PDF, will fail parsing but should at least not throw "not a function"
        // Wait, pdf() expects a buffer.
        const buffer = Buffer.from('fake pdf content');
        try {
            pdfParse(buffer).then(data => {
                console.log('Data:', data.text);
            }).catch(e => {
                console.log('Parse error (expected for fake PDF):', e.message);
            });
        } catch (e) {
            console.error('Call failed:', e.message);
        }
    }
} catch (e) {
    console.error(e);
}
