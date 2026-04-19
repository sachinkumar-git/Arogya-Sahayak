document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const compressBtn = document.getElementById('compressBtn');
    const decompressBtn = document.getElementById('decompressBtn');
    const statusDiv = document.getElementById('status');
    const selectedFilesList = document.getElementById('selectedFilesList');

    let selectedFiles = []; // Stores File objects selected by the user
    let compressedBlob = null; // Stores the latest compressed Blob for decompression demo

    // Create a Web Worker for compression/decompression
    const worker = new Worker('worker.js');

    // --- Event Listeners ---

    fileInput.addEventListener('change', (event) => {
        selectedFiles = Array.from(event.target.files);
        updateFileList();
        compressBtn.disabled = selectedFiles.length === 0;
        decompressBtn.disabled = true; // Disable decompression until something is compressed
        statusDiv.textContent = `Status: ${selectedFiles.length} file(s) selected.`;
    });

    compressBtn.addEventListener('click', async () => {
        if (selectedFiles.length === 0) {
            alert('Please select files first.');
            return;
        }

        compressBtn.disabled = true;
        statusDiv.textContent = 'Status: Starting compression... This may take a moment.';

        // Prepare files for the worker: Read as ArrayBuffers
        const filesData = await Promise.all(selectedFiles.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve({
                        name: file.name,
                        data: e.target.result // ArrayBuffer
                    });
                };
                reader.readAsArrayBuffer(file);
            });
        }));

        // Post message to worker to start compression
        worker.postMessage({ type: 'COMPRESS', files: filesData });
    });

    decompressBtn.addEventListener('click', async () => {
        if (!compressedBlob) {
            alert('No compressed data available to decompress.');
            return;
        }

        decompressBtn.disabled = true;
        statusDiv.textContent = 'Status: Starting decompression...';

        // Read the compressed Blob as an ArrayBuffer for the worker
        const compressedData = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsArrayBuffer(compressedBlob);
        });

        worker.postMessage({ type: 'DECOMPRESS', data: compressedData });
    });

    // --- Worker Message Handler ---

    worker.onmessage = (event) => {
        const { type, success, message, result } = event.data;

        if (type === 'COMPRESS_RESULT') {
            compressBtn.disabled = false;
            if (success) {
                compressedBlob = result; // Store the compressed Blob
                statusDiv.textContent = `Status: Compression successful! File size: ${(result.size / 1024).toFixed(2)} KB.`;
                decompressBtn.disabled = false;
                saveAs(result, 'clinical_report_packet.zip'); // Trigger download
            } else {
                statusDiv.textContent = `Status: Compression failed. ${message}`;
                decompressBtn.disabled = true;
            }
        } else if (type === 'DECOMPRESS_RESULT') {
            decompressBtn.disabled = false;
            if (success) {
                statusDiv.textContent = `Status: Decompression successful! Extracted ${Object.keys(result).length} files. Check console for details.`;
                // In a real app, you might want to display these files or allow downloading them
                console.log("Decompressed Files:");
                for (const filename in result) {
                    // Each result[filename] is an ArrayBuffer
                    console.log(`  - ${filename} (Size: ${(result[filename].byteLength / 1024).toFixed(2)} KB)`);
                    // Example: To convert back to text for display (assuming text file)
                    // const textDecoder = new TextDecoder();
                    // console.log("      Content:", textDecoder.decode(result[filename]));
                }
            } else {
                statusDiv.textContent = `Status: Decompression failed. ${message}`;
            }
        } else if (type === 'ERROR') {
            statusDiv.textContent = `Status: Worker Error - ${message}`;
            compressBtn.disabled = false;
            decompressBtn.disabled = false;
            console.error("Worker error:", message);
        }
    };

    // --- UI Update Helper ---
    function updateFileList() {
        selectedFilesList.innerHTML = ''; // Clear existing list
        if (selectedFiles.length === 0) {
            selectedFilesList.innerHTML = '<li>No files selected yet.</li>';
        } else {
            selectedFiles.forEach(file => {
                const li = document.createElement('li');
                li.textContent = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
                selectedFilesList.appendChild(li);
            });
        }
    }

    // Initial state
    compressBtn.disabled = true;
});