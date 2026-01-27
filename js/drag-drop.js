/**
 * Powers Landscaping LLC - Drag & Drop File Upload
 * Handles image uploads for project submissions
 */

class FileUploader {
    constructor(dropZoneId, fileInputId, previewContainerId) {
        this.dropZone = document.getElementById(dropZoneId);
        this.fileInput = document.getElementById(fileInputId);
        this.previewContainer = document.getElementById(previewContainerId);
        this.files = [];
        this.maxFiles = 10;
        this.maxFileSize = 10 * 1024 * 1024; // 10MB per file
        this.allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic'];

        if (this.dropZone && this.fileInput) {
            this.init();
        }
    }

    init() {
        // Click to upload
        this.dropZone.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') {
                this.fileInput.click();
            }
        });

        // File input change
        this.fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // Drag & drop events
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, this.preventDefaults.bind(this), false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, () => {
                this.dropZone.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, () => {
                this.dropZone.classList.remove('drag-over');
            });
        });

        this.dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            this.handleFiles(files);
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleFiles(fileList) {
        const filesArray = Array.from(fileList);

        filesArray.forEach(file => {
            // Check file count
            if (this.files.length >= this.maxFiles) {
                alert(`Maximum ${this.maxFiles} files allowed`);
                return;
            }

            // Check file type
            if (!this.allowedTypes.includes(file.type)) {
                alert(`File type not supported: ${file.name}\nPlease upload images (JPG, PNG, GIF, WebP)`);
                return;
            }

            // Check file size
            if (file.size > this.maxFileSize) {
                alert(`File too large: ${file.name}\nMaximum size is 10MB`);
                return;
            }

            // Check for duplicates
            const isDuplicate = this.files.some(f =>
                f.name === file.name && f.size === file.size
            );
            if (isDuplicate) {
                return;
            }

            this.files.push(file);
            this.previewFile(file);
        });

        this.updateDropZoneText();
    }

    previewFile(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'file-preview-item';
            previewItem.dataset.fileName = file.name;

            previewItem.innerHTML = `
                <img src="${e.target.result}" alt="${file.name}">
                <button type="button" class="remove-file" title="Remove">&times;</button>
            `;

            previewItem.querySelector('.remove-file').addEventListener('click', () => {
                this.removeFile(file.name);
                previewItem.remove();
            });

            this.previewContainer.appendChild(previewItem);
        };

        reader.readAsDataURL(file);
    }

    removeFile(fileName) {
        this.files = this.files.filter(f => f.name !== fileName);
        this.updateDropZoneText();
    }

    updateDropZoneText() {
        const countText = this.dropZone.querySelector('.file-count');
        if (countText) {
            if (this.files.length > 0) {
                countText.textContent = `${this.files.length} file${this.files.length > 1 ? 's' : ''} selected`;
            } else {
                countText.textContent = '';
            }
        }
    }

    getFiles() {
        return this.files;
    }

    clear() {
        this.files = [];
        this.previewContainer.innerHTML = '';
        this.fileInput.value = '';
        this.updateDropZoneText();
    }

    // Convert files to base64 for email attachment
    async getFilesAsBase64() {
        const base64Files = [];

        for (const file of this.files) {
            const base64 = await this.fileToBase64(file);
            base64Files.push({
                name: file.name,
                type: file.type,
                data: base64
            });
        }

        return base64Files;
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize file uploader if elements exist
    if (document.getElementById('dropZone')) {
        window.fileUploader = new FileUploader('dropZone', 'fileInput', 'filePreview');
    }
});
