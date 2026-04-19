// Import JSZip and FileSaver (though FileSaver is used in the main thread for download)
// For Web Workers, we use importScripts for external libraries
importScripts('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');

self.onmessage = async (event) => {
    const { type, files, data } = event.data;

    if (type === 'COMPRESS') {
        try {
            const zip = new JSZip();
            files.forEach(file => {
                zip.file(file.name, file.data); // Add ArrayBuffer directly
            });

            // Generate the ZIP file as a Blob
            const compressedBlob = await zip.generateAsync({
                type: "blob",
                compression: "DEFLATE", // Lossless compression
                compressionOptions: {
                    level: 9 // Max compression level
                }
            });

            self.postMessage({ type: 'COMPRESS_RESULT', success: true, result: compressedBlob });

        } catch (e) {
            self.postMessage({ type: 'COMPRESS_RESULT', success: false, message: e.message || "Unknown compression error" });
        }
    } else if (type === 'DECOMPRESS') {
        try {
            const zip = await JSZip.loadAsync(data); // Load ArrayBuffer
            const decompressedFiles = {};

            // Iterate over each file in the zip and extract its data
            for (const filename in zip.files) {
                if (!zip.files[filename].dir) { // Exclude directories
                    decompressedFiles[filename] = await zip.files[filename].async("arraybuffer");
                }
            }
            self.postMessage({ type: 'DECOMPRESS_RESULT', success: true, result: decompressedFiles });
        } catch (e) {
            self.postMessage({ type: 'DECOMPRESS_RESULT', success: false, message: e.message || "Unknown decompression error" });
        }
    }
};