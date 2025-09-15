function textToBinary(text) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    return Array.from(bytes).map(byte => byte.toString(2).padStart(8, '0')).join('');
}

function binaryToText(binary) {
    const bytes = binary.match(/.{8}/g).map(byte => parseInt(byte, 2));
    const decoder = new TextDecoder();
    return decoder.decode(new Uint8Array(bytes));
}

function getMediaType(file) {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('video/')) return 'video';
    return null;
}

function encryptMessage() {
    const fileInput = document.getElementById('imageUpload');
    const message = document.getElementById('message').value;
    const key = document.getElementById('key').value;
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    if (fileInput.files.length === 0 || !message || !key) {
        alert('Please provide all inputs.');
        return;
    }

    if (!/^[a-zA-Z0-9]+$/.test(key)) {
        alert('Key must contain only alphabets and numbers (alphanumeric characters).');
        return;
    }

    const file = fileInput.files[0];
    const mediaType = getMediaType(file);
    const binaryData = textToBinary(key + '|' + message) + '00000000';

    if (mediaType === 'image') {
        let img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let data = imageData.data;

            for (let i = 0; i < binaryData.length; i++) {
                data[i * 4] = (data[i * 4] & 0xFE) | parseInt(binaryData[i]);
            }

            ctx.putImageData(imageData, 0, 0);

            const downloadBtn = document.getElementById('downloadBtn');
            downloadBtn.style.display = 'block';
            downloadBtn.onclick = function () {
                let link = document.createElement('a');
                link.download = 'encrypted.png';
                link.href = canvas.toDataURL();
                link.click();
            };

            const email = localStorage.getItem('email');
            const log = {
                type: "Encryption",
                fileFormat: mediaType,
                message,
                time: Date.now()
            };
            storeLog(email, log);
        };
    } else if (mediaType === 'audio' || mediaType === 'video') {
        const reader = new FileReader();
        reader.onload = function (e) {
            let arrayBuffer = e.target.result;
            let uint8Array = new Uint8Array(arrayBuffer);

            for (let i = 0; i < binaryData.length && i < uint8Array.length; i++) {
                uint8Array[i] = (uint8Array[i] & 0xFE) | parseInt(binaryData[i]);
            }

            const blob = new Blob([uint8Array], { type: file.type });
            const url = URL.createObjectURL(blob);

            const downloadBtn = document.getElementById('downloadBtn');
            downloadBtn.style.display = 'block';
            downloadBtn.onclick = function () {
                const link = document.createElement('a');
                link.href = url;
                link.download = `encrypted.${file.name.split('.').pop()}`;
                link.click();
            };

            const email = localStorage.getItem('email');
            const log = {
                type: "Encryption",
                fileFormat: mediaType,
                message,
                time: Date.now()
            };
            storeLog(email, log);
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert("Unsupported file type.");
    }
}

function decryptMessage() {
    const fileInput = document.getElementById('imageUpload');
    const key = document.getElementById('key').value;

    if (fileInput.files.length === 0 || !key) {
        alert('Please provide all inputs.');
        return;
    }

    if (!/^[a-zA-Z0-9]+$/.test(key)) {
        alert('Key must contain only alphabets and numbers (alphanumeric characters).');
        return;
    }

    const file = fileInput.files[0];
    const mediaType = getMediaType(file);

    if (mediaType === 'image') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            let binaryData = '';
            for (let i = 0; i < data.length; i += 4) {
                binaryData += (data[i] & 1).toString();
                if (binaryData.endsWith('00000000')) break;
            }

            processExtractedBinary(binaryData, key, mediaType);
        };
    } else if (mediaType === 'audio' || mediaType === 'video') {
        const reader = new FileReader();
        reader.onload = function (e) {
            const arrayBuffer = e.target.result;
            const uint8Array = new Uint8Array(arrayBuffer);
            let binaryData = '';
            for (let i = 0; i < uint8Array.length; i++) {
                binaryData += (uint8Array[i] & 1).toString();
                if (binaryData.endsWith('00000000')) break;
            }

            processExtractedBinary(binaryData, key, mediaType);
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert("Unsupported file type.");
    }
}

function processExtractedBinary(binaryData, key, mediaType) {
    const stopIndex = binaryData.indexOf('000000000');
    const cleanBinary = binaryData.slice(0, stopIndex);
    const extractedText = binaryToText(cleanBinary);
    const delimiterIndex = extractedText.indexOf('|');

    if (delimiterIndex === -1) {
        alert("Message format corrupted or no delimiter found.");
        return;
    }

    const storedKey = extractedText.slice(0, delimiterIndex);
    const message = extractedText.slice(delimiterIndex + 1);
    const email = localStorage.getItem('email');
    const log = {
        type: "Decryption",
        fileFormat: mediaType,
        message,
        time: Date.now()
    };
    storeLog(email, log);

    if (storedKey === key) {
        const display = document.getElementById('decodedMessage');
        if (display) {
            display.innerText = 'Message: ' + message;
        } else {
            alert('Message: ' + message);
        }
    } else {
        alert('Incorrect Key');
    }
}

async function storeLog(email, log) {
    try {
        const response = await axios.post('https://stagenography.onrender.com/logActivity', { email, log });
        console.log("Logs saved successfully");
        return response;
    } catch (error) {
        console.error('Error in saving log:', error);
        throw error;
    }
}
