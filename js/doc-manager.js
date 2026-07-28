// ============================================
// DOCUMENT MANAGER - COMBINE & SPLIT ONLY
// ============================================


// ====================
// PREVENT DEV TOOL
// ===================

//prevent right clicking//
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});

//prevent keyboard shortcuts//
document.addEventListener('keydown', function(e) {
    if (e.key === 'F12') {
        e.preventDefault();
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.key === 'J'){
        e.preventDefault();
        return false;
    }
    if (e.ctrlKey && e.key === 'U') {
        e.preventDefault();
        return false;
    }
})  
// ============================================
// STATE MANAGEMENT
// ============================================
const docState = {
    combineFiles: [],
    splitFile: null,
    combinedBlob: null,
    splitBlobs: []
};

// Split specific state
let splitCurrentPage = 1;
let splitTotalPages = 0;
let splitPageBlobs = {};

// ============================================
// DOCUMENT MANAGER TAB SWITCHING
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Document Manager initialized!');
    
    // Tab switching
    document.querySelectorAll('.doc-manager-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.doc-manager-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const tab = this.dataset.tab;
            document.querySelectorAll('.doc-manager-content').forEach(c => c.classList.remove('active'));
            const target = document.getElementById(`doc-tab-${tab}`);
            if (target) {
                target.classList.add('active');
            }
        });
    });

    // Initialize upload areas
    initCombineUpload();
    initSplitUpload();
});

// ============================================
// NOTIFICATION SYSTEM
// ============================================
function docShowNotification(message, type = 'success') {
    const existing = document.querySelector('.doc-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `doc-notification ${type}`;
    notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i> ${message}`;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ============================================
// COMBINE SECTION
// ============================================
function initCombineUpload() {
    const uploadArea = document.getElementById('docCombineUploadArea');
    const fileInput = document.getElementById('docCombineFileInput');

    if (!uploadArea || !fileInput) {
        console.warn('<i class="fas fa-circle-xmark"></i> Combine upload elements not found!');
        return;
    }

    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
        if (files.length > 0) {
            addCombineFiles(files);
        } else {
            docShowNotification('Please upload PDF files only.', 'error');
        }
    });

    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
        if (files.length > 0) {
            addCombineFiles(files);
        } else {
            docShowNotification('Please upload PDF files only.', 'error');
        }
        e.target.value = '';
    });
}

function addCombineFiles(files) {
    files.forEach(file => {
        docState.combineFiles.push({
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            file: file,
            url: URL.createObjectURL(file)
        });
    });
    renderCombineFiles();
    docShowNotification(`${files.length} file(s) added successfully.`, 'success');
}

function renderCombineFiles() {
    const container = document.getElementById('docCombineFileList');
    if (!container) return;
    
    if (docState.combineFiles.length === 0) {
        container.innerHTML = `
            <div class="doc-empty-state">
                <i class="fas fa-inbox"></i>
                <p><i class="fas fa-info-circle" style="color: var(--gold);"></i> No files uploaded yet</p>
            </div>
        `;
        return;
    }

    container.innerHTML = docState.combineFiles.map((file, index) => `
        <div class="doc-file-item" draggable="true" data-index="${index}">
            <div class="file-info">
                <span class="drag-handle"><i class="fas fa-grip-lines"></i></span>
                <i class="fas fa-file-pdf" style="color: var(--gold);"></i>
                <div>
                    <div class="file-name"><i class="fas fa-file"></i> ${file.name}</div>
                    <div class="file-size"><i class="fas fa-weight-hanging"></i> ${(file.size / 1024).toFixed(1)} KB</div>
                </div>
            </div>
            <div class="file-actions">
                <button onclick="removeCombineFile(${index})" class="remove-btn" title="Remove">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `).join('');

    // Drag and drop reordering
    let dragIndex = null;
    document.querySelectorAll('#docCombineFileList .doc-file-item').forEach(item => {
        item.addEventListener('dragstart', (e) => {
            dragIndex = parseInt(item.dataset.index);
            item.classList.add('dragging');
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        item.addEventListener('drop', (e) => {
            e.preventDefault();
            const dropIndex = parseInt(item.dataset.index);
            if (dragIndex !== null && dragIndex !== dropIndex) {
                const [movedFile] = docState.combineFiles.splice(dragIndex, 1);
                docState.combineFiles.splice(dropIndex, 0, movedFile);
                renderCombineFiles();
            }
        });
    });
}

function removeCombineFile(index) {
    docState.combineFiles.splice(index, 1);
    renderCombineFiles();
    if (docState.combineFiles.length === 0) {
        const preview = document.getElementById('docCombinePreview');
        if (preview) preview.style.display = 'none';
    }
}

function openDocNameModal() {
    if (docState.combineFiles.length === 0) {
        docShowNotification('Please upload at least one PDF file.', 'error');
        return;
    }

    if (docState.combineFiles.length === 1) {
        docShowNotification('Please upload at least 2 PDF files to combine.', 'error');
        return;
    }

    const modal = document.getElementById('docNameModal');
    if (modal) modal.classList.add('active');
}

function closeDocNameModal() {
    const modal = document.getElementById('docNameModal');
    if (modal) modal.classList.remove('active');
}

async function confirmDocCombine() {
    const nameInput = document.getElementById('docDocumentNameInput');
    const name = nameInput ? nameInput.value.trim() || 'Combined_Document' : 'Combined_Document';
    closeDocNameModal();

    try {
        const { PDFDocument } = PDFLib;
        const mergedPdf = await PDFDocument.create();

        for (const file of docState.combineFiles) {
            const arrayBuffer = await file.file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            pages.forEach(page => mergedPdf.addPage(page));
        }

        const pdfBytes = await mergedPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        docState.combinedBlob = blob;

        const preview = document.getElementById('docCombinePreview');
        const previewContent = document.getElementById('docCombinePreviewContent');
        if (preview) preview.style.display = 'block';
        
        const url = URL.createObjectURL(blob);
        if (previewContent) {
            previewContent.innerHTML = `
                <iframe src="${url}"></iframe>
                <div style="margin-top: 12px; display: flex; gap: 12px; flex-wrap: wrap;">
                    <button class="btn-primary" onclick="downloadCombinedDoc()">
                        <i class="fas fa-download"></i> Download Combined PDF
                    </button>
                    <button class="btn-secondary" onclick="window.open('${url}', '_blank')">
                        <i class="fas fa-external-link-alt"></i> Open in New Tab
                    </button>
                </div>
            `;
        }

        docShowNotification(`<i class="fas fa-circle-check"></i> PDF combined successfully!`, 'success');
    } catch (error) {
        console.error('<i class="fas fa-xmark"></i> Error combining PDFs:', error);
        docShowNotification('Error combining PDFs. Please try again.', 'error');
    }
}

function downloadCombinedDoc() {
    if (!docState.combinedBlob) return;
    const nameInput = document.getElementById('docDocumentNameInput');
    const name = nameInput ? nameInput.value.trim() || 'Combined_Document' : 'Combined_Document';
    const link = document.createElement('a');
    link.href = URL.createObjectURL(docState.combinedBlob);
    link.download = `${name}.pdf`;
    link.click();
    docShowNotification(`Downloaded: ${name}.pdf`, 'success');
}

function viewCombinedDoc() {
    if (!docState.combinedBlob) return;
    const url = URL.createObjectURL(docState.combinedBlob);
    openDocViewModal(`<iframe src="${url}"></iframe>`);
}

// ============================================
// SPLIT SECTION
// ============================================
function initSplitUpload() {
    const uploadArea = document.getElementById('docSplitUploadArea');
    const fileInput = document.getElementById('docSplitFileInput');

    if (!uploadArea || !fileInput) {
        console.warn('<i class="fas fa-circle-xmark"></i> Split upload elements not found!');
        return;
    }

    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
        if (files.length > 0) {
            docState.splitFile = files[0];
            renderSplitFiles();
            loadSplitDocument();
            docShowNotification('PDF file uploaded successfully.', 'success');
        } else {
            docShowNotification('Please upload a PDF file.', 'error');
        }
    });

    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
        if (files.length > 0) {
            docState.splitFile = files[0];
            renderSplitFiles();
            loadSplitDocument();
            docShowNotification('PDF file uploaded successfully.', 'success');
        } else {
            docShowNotification('Please upload a PDF file.', 'error');
        }
        e.target.value = '';
    });

    const pageInput = document.getElementById('docSplitPageNumber');
    if (pageInput) {
        pageInput.addEventListener('change', function() {
            let val = parseInt(this.value);
            if (isNaN(val) || val < 1) val = 1;
            if (splitTotalPages > 0 && val > splitTotalPages) val = splitTotalPages;
            this.value = val;
            splitCurrentPage = val;
            updateSplitPageDisplay();
        });
    }
}

function renderSplitFiles() {
    const container = document.getElementById('docSplitFileList');
    if (!container) return;
    
    if (!docState.splitFile) {
        container.innerHTML = `
            <div class="doc-empty-state">
                <i class="fas fa-inbox"></i>
                <p><i class="fas fa-info-circle" style="color: var(--gold);"></i> No file uploaded yet</p>
            </div>
        `;
        const controls = document.getElementById('docSplitControls');
        if (controls) controls.style.display = 'none';
        return;
    }

    container.innerHTML = `
        <div class="doc-file-item">
            <div class="file-info">
                <i class="fas fa-file-pdf" style="color: var(--gold);"></i>
                <div>
                    <div class="file-name"><i class="fas fa-file"></i> ${docState.splitFile.name}</div>
                    <div class="file-size"><i class="fas fa-weight-hanging"></i> ${(docState.splitFile.size / 1024).toFixed(1)} KB</div>
                </div>
            </div>
            <div class="file-actions">
                <button onclick="clearDocFiles('split')" class="remove-btn" title="Remove">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
}

async function loadSplitDocument() {
    if (!docState.splitFile) return;

    try {
        const { PDFDocument } = PDFLib;
        const arrayBuffer = await docState.splitFile.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        splitTotalPages = pdf.getPageCount();
        splitCurrentPage = 1;
        splitPageBlobs = {};

        for (let i = 0; i < splitTotalPages; i++) {
            const newPdf = await PDFDocument.create();
            const [page] = await newPdf.copyPages(pdf, [i]);
            newPdf.addPage(page);
            const pdfBytes = await newPdf.save();
            splitPageBlobs[i] = new Blob([pdfBytes], { type: 'application/pdf' });
        }

        const controls = document.getElementById('docSplitControls');
        if (controls) controls.style.display = 'block';
        
        const fileNameEl = document.getElementById('docSplitFileName');
        const totalPagesEl = document.getElementById('docTotalPages');
        const totalPagesDisplayEl = document.getElementById('docTotalPagesDisplay');
        const totalPagesInputEl = document.getElementById('docTotalPagesInput');
        
        if (fileNameEl) fileNameEl.textContent = docState.splitFile.name;
        if (totalPagesEl) totalPagesEl.textContent = splitTotalPages;
        if (totalPagesDisplayEl) totalPagesDisplayEl.textContent = splitTotalPages;
        if (totalPagesInputEl) totalPagesInputEl.textContent = splitTotalPages;
        
        const pageInput = document.getElementById('docSplitPageNumber');
        if (pageInput) {
            pageInput.max = splitTotalPages;
            pageInput.value = 1;
        }

        updateSplitPageDisplay();
        docShowNotification(`Loaded ${splitTotalPages} pages successfully.`, 'success');

    } catch (error) {
        console.error('<i class="fas fa-xmark"></i> Error loading PDF:', error);
        docShowNotification('Error loading PDF. Please try again.', 'error');
    }
}

function updateSplitPageDisplay() {
    const selectedDisplay = document.getElementById('docSelectedPageDisplay');
    const previewPage = document.getElementById('docPreviewPageNumber');
    const pageInput = document.getElementById('docSplitPageNumber');
    
    if (selectedDisplay) selectedDisplay.textContent = splitCurrentPage;
    if (previewPage) previewPage.textContent = splitCurrentPage;
    if (pageInput) pageInput.value = splitCurrentPage;
}

function navigateSplitPage(direction) {
    let newPage = splitCurrentPage + direction;
    if (newPage < 1) newPage = 1;
    if (newPage > splitTotalPages) newPage = splitTotalPages;
    splitCurrentPage = newPage;
    updateSplitPageDisplay();
}

function viewSplitPage() {
    if (!splitPageBlobs[splitCurrentPage - 1]) return;
    const blob = splitPageBlobs[splitCurrentPage - 1];
    const url = URL.createObjectURL(blob);
    openDocViewModal(`<iframe src="${url}"></iframe>`);
}

async function splitSelectedPage() {
    if (!docState.splitFile) {
        docShowNotification('Please upload a PDF file.', 'error');
        return;
    }

    const pageInput = document.getElementById('docSplitPageNumber');
    const pageNumber = parseInt(pageInput ? pageInput.value : 1);
    if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > splitTotalPages) {
        docShowNotification(`Please enter a valid page number between 1 and ${splitTotalPages}.`, 'error');
        return;
    }

    try {
        const blob = splitPageBlobs[pageNumber - 1];
        if (!blob) {
            docShowNotification('Page not found. Please try again.', 'error');
            return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const name = docState.splitFile.name.replace('.pdf', '');
        link.href = url;
        link.download = `${name}_page_${pageNumber}.pdf`;
        link.click();

        addSplitResult(pageNumber, blob);
        docShowNotification(`Page ${pageNumber} extracted successfully!`, 'success');
    } catch (error) {
        console.error('<i class="fas fa-xmark"></i> Error splitting page:', error);
        docShowNotification('Error splitting page. Please try again.', 'error');
    }
}

function addSplitResult(pageNumber, blob) {
    if (!docState.splitBlobs) docState.splitBlobs = [];
    docState.splitBlobs.push({
        page: pageNumber,
        blob: blob,
        name: `${docState.splitFile.name.replace('.pdf', '')}_page_${pageNumber}.pdf`
    });

    renderSplitResults();
}

function renderSplitResults() {
    const container = document.getElementById('docSplitPreviewContent');
    const preview = document.getElementById('docSplitPreview');
    if (!container || !preview) return;
    
    preview.style.display = 'block';

    if (docState.splitBlobs.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--gray-500);">
                <i class="fas fa-inbox" style="font-size: 48px; color: var(--gray-300);"></i>
                <p style="margin-top: 8px;"><i class="fas fa-info-circle" style="color: var(--gold);"></i> No pages split yet. Select a page and click "Split This Page".</p>
            </div>
        `;
        return;
    }

    let html = `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;">`;
    
    docState.splitBlobs.forEach((item, index) => {
        const url = URL.createObjectURL(item.blob);
        html += `
            <div style="background: var(--off-white); padding: 16px; border-radius: 8px; text-align: center; border: 1px solid var(--gray-200); transition: var(--transition);">
                <i class="fas fa-file-pdf" style="font-size: 40px; color: var(--gold);"></i>
                <p style="font-size: 15px; font-weight: 700; margin: 8px 0; color: var(--primary);"><i class="fas fa-page"></i> Page ${item.page}</p>
                <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;">
                    <button class="btn-secondary" style="padding: 4px 12px; font-size: 12px;" onclick="downloadSplitResult(${index})">
                        <i class="fas fa-download"></i> Download
                    </button>
                    <button class="btn-secondary" style="padding: 4px 12px; font-size: 12px;" onclick="viewSplitResult(${index})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn-secondary" style="padding: 4px 12px; font-size: 12px; color: #dc3545;" onclick="removeSplitResult(${index})">
                        <i class="fas fa-times"></i> Remove
                    </button>
                </div>
            </div>
        `;
    });
    
    html += `</div>`;
    html += `
        <div style="margin-top: 16px; display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
            <button class="btn-primary" onclick="downloadAllSplitPages()">
                <i class="fas fa-download"></i> Download All (${docState.splitBlobs.length} pages)
            </button>
            <button class="btn-secondary" onclick="clearSplitResults()">
                <i class="fas fa-trash"></i> Clear All Results
            </button>
        </div>
    `;
    
    container.innerHTML = html;
}

function downloadSplitResult(index) {
    if (!docState.splitBlobs[index]) return;
    const item = docState.splitBlobs[index];
    const link = document.createElement('a');
    link.href = URL.createObjectURL(item.blob);
    link.download = item.name;
    link.click();
    docShowNotification(`Downloaded: ${item.name}`, 'success');
}

function viewSplitResult(index) {
    if (!docState.splitBlobs[index]) return;
    const url = URL.createObjectURL(docState.splitBlobs[index].blob);
    openDocViewModal(`<iframe src="${url}"></iframe>`);
}

function removeSplitResult(index) {
    docState.splitBlobs.splice(index, 1);
    renderSplitResults();
    if (docState.splitBlobs.length === 0) {
        const preview = document.getElementById('docSplitPreview');
        if (preview) preview.style.display = 'none';
    }
    docShowNotification('Result removed.', 'info');
}

function clearSplitResults() {
    docState.splitBlobs = [];
    renderSplitResults();
    const preview = document.getElementById('docSplitPreview');
    if (preview) preview.style.display = 'none';
    docShowNotification('All split results cleared.', 'info');
}

async function splitAllDocPages() {
    if (!docState.splitFile) {
        docShowNotification('Please upload a PDF file.', 'error');
        return;
    }

    try {
        docState.splitBlobs = [];

        for (let i = 0; i < splitTotalPages; i++) {
            docState.splitBlobs.push({
                page: i + 1,
                blob: splitPageBlobs[i],
                name: `${docState.splitFile.name.replace('.pdf', '')}_page_${i + 1}.pdf`
            });
        }

        renderSplitResults();
        docShowNotification(`Split into ${splitTotalPages} pages successfully!`, 'success');
    } catch (error) {
        console.error('<i class="fas fa-xmark"></i> Error splitting all pages:', error);
        docShowNotification('Error splitting all pages. Please try again.', 'error');
    }
}

function downloadAllSplitPages() {
    if (!docState.splitBlobs || docState.splitBlobs.length === 0) {
        docShowNotification('No split pages to download.', 'error');
        return;
    }
    
    docState.splitBlobs.forEach((item, index) => {
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(item.blob);
            link.download = item.name;
            link.click();
        }, index * 300);
    });
    
    docShowNotification(`Downloading ${docState.splitBlobs.length} pages...`, 'success');
}

// ============================================
// CLEAR FILES
// ============================================
function clearDocFiles(type) {
    if (type === 'combine') {
        docState.combineFiles = [];
        renderCombineFiles();
        const preview = document.getElementById('docCombinePreview');
        const content = document.getElementById('docCombinePreviewContent');
        if (preview) preview.style.display = 'none';
        if (content) content.innerHTML = '';
        docShowNotification('Files cleared.', 'info');
    } else if (type === 'split') {
        docState.splitFile = null;
        splitTotalPages = 0;
        splitCurrentPage = 1;
        splitPageBlobs = {};
        docState.splitBlobs = [];
        renderSplitFiles();
        const controls = document.getElementById('docSplitControls');
        const preview = document.getElementById('docSplitPreview');
        const content = document.getElementById('docSplitPreviewContent');
        if (controls) controls.style.display = 'none';
        if (preview) preview.style.display = 'none';
        if (content) content.innerHTML = '';
        docShowNotification('File cleared.', 'info');
    }
}

// ============================================
// VIEW MODAL
// ============================================
function openDocViewModal(content) {
    const modal = document.getElementById('docViewModal');
    const modalContent = document.getElementById('docViewModalContent');
    if (!modal || !modalContent) {
        console.warn('<i class="fas fa-circle-xmark"></i> View modal elements not found!');
        return;
    }
    modal.classList.add('active');
    modalContent.innerHTML = content;
}

function closeDocViewModal() {
    const modal = document.getElementById('docViewModal');
    if (modal) modal.classList.remove('active');
}

// ============================================
// MAKE FUNCTIONS GLOBALLY ACCESSIBLE
// ============================================
// COMBINE FUNCTIONS
window.openDocNameModal = openDocNameModal;
window.closeDocNameModal = closeDocNameModal;
window.confirmDocCombine = confirmDocCombine;
window.downloadCombinedDoc = downloadCombinedDoc;
window.viewCombinedDoc = viewCombinedDoc;
window.removeCombineFile = removeCombineFile;

// SPLIT FUNCTIONS
window.navigateSplitPage = navigateSplitPage;
window.viewSplitPage = viewSplitPage;
window.splitSelectedPage = splitSelectedPage;
window.splitAllDocPages = splitAllDocPages;
window.downloadSplitResult = downloadSplitResult;
window.viewSplitResult = viewSplitResult;
window.removeSplitResult = removeSplitResult;
window.clearSplitResults = clearSplitResults;
window.downloadAllSplitPages = downloadAllSplitPages;

// CLEAR FUNCTIONS
window.clearDocFiles = clearDocFiles;

// MODAL FUNCTIONS
window.closeDocViewModal = closeDocViewModal;
window.openDocViewModal = openDocViewModal;

console.log('✅ Document Manager loaded successfully!');
console.log('📄 Combine & Split features only - Convert removed.');