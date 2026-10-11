const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

const form = document.getElementById('upload-form');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileListEl = document.getElementById('file-list');
const submitBtn = document.getElementById('submit-btn');
const statusEl = document.getElementById('status');

let selectedFiles = [];

function setStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = `status ${type || ''}`.trim();
}

function syncFileInput() {
  const dataTransfer = new DataTransfer();
  selectedFiles.forEach((file) => dataTransfer.items.add(file));
  fileInput.files = dataTransfer.files;
}

function renderFileList() {
  fileListEl.innerHTML = '';
  selectedFiles.forEach((file, index) => {
    const li = document.createElement('li');
    const sizeKb = Math.round(file.size / 1024);
    li.innerHTML = `<span>${file.name} (${sizeKb} KB)</span>`;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = '✕';
    removeBtn.setAttribute('aria-label', `Remove ${file.name}`);
    removeBtn.addEventListener('click', () => {
      selectedFiles.splice(index, 1);
      syncFileInput();
      renderFileList();
    });

    li.appendChild(removeBtn);
    fileListEl.appendChild(li);
  });
}

function addFiles(fileArray) {
  setStatus('', '');

  for (const file of fileArray) {
    if (selectedFiles.length >= MAX_FILES) {
      setStatus(`You can upload up to ${MAX_FILES} screenshots.`, 'error');
      break;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setStatus(`Unsupported file type: ${file.name}`, 'error');
      continue;
    }
    if (file.size > MAX_FILE_SIZE) {
      setStatus(`"${file.name}" exceeds the 10 MB limit.`, 'error');
      continue;
    }
    selectedFiles.push(file);
  }

  syncFileInput();
  renderFileList();
}

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    fileInput.click();
  }
});
dropZone.tabIndex = 0;

fileInput.addEventListener('change', (event) => {
  addFiles(Array.from(event.target.files));
});

['dragenter', 'dragover'].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add('drag-over');
  });
});

['dragleave', 'drop'].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.remove('drag-over');
  });
});

dropZone.addEventListener('drop', (event) => {
  const files = Array.from(event.dataTransfer.files || []);
  addFiles(files);
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (selectedFiles.length === 0) {
    setStatus('Please attach at least one screenshot.', 'error');
    return;
  }

  submitBtn.disabled = true;
  setStatus('Submitting...', '');

  try {
    const formData = new FormData(form);
    const response = await fetch('/api/submit', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      setStatus(result.error || 'Something went wrong. Please try again.', 'error');
      return;
    }

    setStatus('✅ ' + result.message, 'success');
    form.reset();
    selectedFiles = [];
    syncFileInput();
    renderFileList();
    if (window.turnstile) {
      window.turnstile.reset();
    }
  } catch (error) {
    setStatus('Network error. Please try again.', 'error');
  } finally {
    submitBtn.disabled = false;
  }
});
