try {
    console.log("Checking multer...");
    require('multer');
    console.log("multer OK");
} catch (e) {
    console.error("multer FAILED:", e.message);
}

try {
    console.log("Checking pdf-parse...");
    require('pdf-parse');
    console.log("pdf-parse OK");
} catch (e) {
    console.error("pdf-parse FAILED:", e.message);
}

try {
    console.log("Checking mammoth...");
    require('mammoth');
    console.log("mammoth OK");
} catch (e) {
    console.error("mammoth FAILED:", e.message);
}

console.log("Done checking deps.");
