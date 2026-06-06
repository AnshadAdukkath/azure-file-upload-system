const uploadZone = document.getElementById('upload-zone');
const fileInput = document.getElementById('file-input');
const uploadForm = document.getElementById('upload-form');
const filePreview = document.getElementById('file-preview');
const fileName = document.getElementById('file-name');
const removeFile = document.getElementById('remove-file');

// Click to trigger file input
uploadZone.addEventListener('click', () => fileInput.click());

// Drag and drop handlers
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    uploadZone.addEventListener(eventName, () => uploadZone.classList.add('drag-over'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    uploadZone.addEventListener(eventName, () => uploadZone.classList.remove('drag-over'), false);
});

uploadZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length) {
        fileInput.files = files;
        updatePreview(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (fileInput.files.length) {
        updatePreview(fileInput.files[0]);
    }
});

function updatePreview(file) {
    fileName.textContent = file.name;
    filePreview.style.display = 'flex';
    uploadZone.style.display = 'none';
}

removeFile.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.value = '';
    filePreview.style.display = 'none';
    uploadZone.style.display = 'block';
});
