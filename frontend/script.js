/* ═══════════════════════════════════════════════════════════════
   AI PODCAST GENERATOR — script.js
   API: FastAPI + gTTS
   Endpoint: POST /stream/stream-tts
   Body: FormData { text: string, lang: string }
   Response: StreamingResponse audio/mpeg → collected as Blob
   ═══════════════════════════════════════════════════════════════ */

// ── Config ──────────────────────────────────────────────────────
const API_ENDPOINT  = '/stream/stream-tts';
const HEALTH_URL    = '/health';
const MAX_CHARS     = 5000;
const WARN_THRESH   = 4000;

// ── DOM References ───────────────────────────────────────────────
const scriptInput   = document.getElementById('script-input');
const charCounter   = document.getElementById('char-counter');
const langSelect    = document.getElementById('lang-select');
const generateBtn   = document.getElementById('generate-btn');
const loaderSection = document.getElementById('loader-section');
const loaderStep    = document.getElementById('loader-step');
const errorBanner   = document.getElementById('error-banner');
const errorMessage  = document.getElementById('error-message');
const errorClose    = document.getElementById('error-close');
const resultCard    = document.getElementById('result-card');
const audioPlayer   = document.getElementById('audio-player');
const downloadBtn   = document.getElementById('download-btn');
const regenerateBtn = document.getElementById('regenerate-btn');
const audioTitle    = document.getElementById('audio-title');
const audioLang     = document.getElementById('audio-lang');
const audioSize     = document.getElementById('audio-size');
const resultTime    = document.getElementById('result-time');
const statusDot     = document.getElementById('status-dot');
const statusLabel   = document.getElementById('status-label');

// ── State ────────────────────────────────────────────────────────
let currentAudioURL = null;
let stepInterval    = null;
let stepIndex       = 0;
let startTime       = null;

// ── Loading Step Messages ────────────────────────────────────────
const STEPS = [
  'Sending to /stream/stream-tts…',
  'Chunking text into paragraphs…',
  'Running gTTS synthesis…',
  'Streaming audio chunks…',
  'Assembling MP3 buffer…',
  'Finalizing audio…',
];

// ── Language display map ─────────────────────────────────────────
const LANG_LABELS = {
  'en':    'English (US)',
  'en-uk': 'English (UK)',
  'en-au': 'English (AU)',
  'fr':    'French',
  'de':    'German',
  'es':    'Spanish',
  'it':    'Italian',
  'pt':    'Portuguese',
  'hi':    'Hindi',
  'ja':    'Japanese',
  'ko':    'Korean',
  'zh':    'Chinese',
  'ar':    'Arabic',
  'ru':    'Russian',
};


/* ══════════════════════════════════════════════════════════════
   API HEALTH CHECK
   Calls GET /health on load to show connection status
══════════════════════════════════════════════════════════════ */
async function checkApiHealth() {
  setStatus('checking', 'Connecting to API…');
  try {
    const res = await fetch(HEALTH_URL, { method: 'GET', signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      setStatus('online', 'API Online');
    } else {
      setStatus('offline', `API Error (${res.status})`);
    }
  } catch (_) {
    setStatus('offline', 'API Offline — start the FastAPI server');
  }
}

function setStatus(state, label) {
  statusDot.className   = `status-dot ${state}`;
  statusLabel.className = `status-label ${state}`;
  statusLabel.textContent = label;
}


/* ══════════════════════════════════════════════════════════════
   CHARACTER COUNTER
══════════════════════════════════════════════════════════════ */
function updateCharCounter() {
  const len = scriptInput.value.length;
  charCounter.textContent = `${len.toLocaleString()} / ${MAX_CHARS.toLocaleString()}`;
  charCounter.classList.remove('warn', 'limit');
  if (len >= MAX_CHARS)    charCounter.classList.add('limit');
  else if (len >= WARN_THRESH) charCounter.classList.add('warn');

  generateBtn.disabled = len === 0;
}

scriptInput.addEventListener('input', updateCharCounter);
updateCharCounter();


/* ══════════════════════════════════════════════════════════════
   UI STATE HELPERS
══════════════════════════════════════════════════════════════ */
function showLoader() {
  hideError();
  hideResult();
  loaderSection.setAttribute('aria-hidden', 'false');
  loaderSection.classList.add('visible');
  stepIndex = 0;
  loaderStep.textContent = STEPS[0];
  stepInterval = setInterval(() => {
    stepIndex = (stepIndex + 1) % STEPS.length;
    loaderStep.textContent = STEPS[stepIndex];
  }, 1800);
}

function hideLoader() {
  loaderSection.classList.remove('visible');
  loaderSection.setAttribute('aria-hidden', 'true');
  clearInterval(stepInterval);
}

function showError(msg) {
  errorMessage.textContent = msg || 'An unexpected error occurred.';
  errorBanner.setAttribute('aria-hidden', 'false');
  errorBanner.classList.add('visible');
  errorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideError() {
  errorBanner.classList.remove('visible');
  errorBanner.setAttribute('aria-hidden', 'true');
}

function showResult(blobURL, lang, elapsedMs, sizeBytes) {
  // Revoke previous blob to free memory
  if (currentAudioURL?.startsWith('blob:')) URL.revokeObjectURL(currentAudioURL);
  currentAudioURL = blobURL;

  // Metadata labels
  const snippet    = scriptInput.value.trim().slice(0, 42);
  audioTitle.textContent = snippet ? `"${snippet}${snippet.length >= 42 ? '…' : ''}"` : 'Generated Episode';
  audioLang.textContent  = `Language: ${LANG_LABELS[lang] ?? lang}`;
  audioSize.textContent  = sizeBytes ? `Size: ${formatBytes(sizeBytes)}` : '';
  resultTime.textContent = elapsedMs ? `Generated in ${(elapsedMs / 1000).toFixed(1)}s` : '';

  audioPlayer.src = blobURL;
  audioPlayer.load();

  resultCard.setAttribute('aria-hidden', 'false');
  resultCard.classList.add('visible');
  resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideResult() {
  resultCard.classList.remove('visible');
  resultCard.setAttribute('aria-hidden', 'true');
}

function setGenerating(isGenerating) {
  generateBtn.disabled = isGenerating || scriptInput.value.trim().length === 0;
  generateBtn.querySelector('.btn-text').textContent = isGenerating ? 'Generating…' : 'Generate Podcast';
}

function formatBytes(bytes) {
  if (bytes < 1024)         return `${bytes} B`;
  if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}


/* ══════════════════════════════════════════════════════════════
   CORE: GENERATE PODCAST
   Calls POST /stream/stream-tts with FormData
   {
     text: string    — the podcast script
     lang: string    — gTTS language code, e.g. "en", "fr", "hi"
   }
   FastAPI returns StreamingResponse (audio/mpeg).
   We collect the full blob, then wire to the <audio> element.
══════════════════════════════════════════════════════════════ */
async function generatePodcast() {
  const text = scriptInput.value.trim();
  if (!text) return;

  const lang = langSelect.value;

  hideError();
  hideResult();
  showLoader();
  setGenerating(true);
  startTime = Date.now();

  try {
    // ── Build FormData for FastAPI Form(...) fields ──
    const formData = new FormData();
    formData.append('text', text);
    formData.append('lang', lang);

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      body:   formData,
      // Note: do NOT set Content-Type — browser auto-sets multipart/form-data
    });

    // ── Handle HTTP errors ──
    if (!response.ok) {
      let errMsg = `Server error ${response.status}: ${response.statusText}`;
      try {
        const errData = await response.json();
        if (errData.error || errData.detail || errData.message) {
          errMsg = errData.error ?? errData.detail ?? errData.message;
          // FastAPI validation errors come as detail arrays
          if (Array.isArray(errMsg)) {
            errMsg = errMsg.map(e => e.msg).join(', ');
          }
        }
      } catch (_) { /* body not JSON */ }
      throw new Error(errMsg);
    }

    // ── Collect the full streaming response as a Blob ──
    // FastAPI StreamingResponse sends chunked audio/mpeg.
    // response.blob() accumulates all chunks automatically.
    const audioBlob = await response.blob();

    if (audioBlob.size === 0) {
      throw new Error('Server returned empty audio. Check gTTS and paragraph_chunk service.');
    }

    const elapsed = Date.now() - startTime;
    const blobURL = URL.createObjectURL(audioBlob);

    hideLoader();
    showResult(blobURL, lang, elapsed, audioBlob.size);
    setStatus('online', 'API Online');

  } catch (err) {
    hideLoader();

    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      showError('Request timed out. The server may be overloaded — try a shorter script.');
    } else if (err.message.toLowerCase().includes('failed to fetch') || err.message.toLowerCase().includes('networkerror')) {
      showError('Cannot reach the FastAPI server. Make sure it is running: uvicorn main:app --reload');
      setStatus('offline', 'API Offline');
    } else {
      showError(err.message);
    }
  } finally {
    setGenerating(false);
  }
}


/* ══════════════════════════════════════════════════════════════
   GENERATE PODCAST (TOPIC)
   Calls POST /generate-podcast with a topic and handles response
══════════════════════════════════════════════════════════════ */
async function generatePodcast() {
  const topic = scriptInput.value.trim();
  if (!topic) {
    showError('Please enter a topic to generate a podcast.');
    return;
  }

  setStatus('checking', 'Generating podcast…');
  try {
    const res = await fetch('/generate-podcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
    });

    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      currentAudioURL = url;

      audioPlayer.src = url;
      audioPlayer.style.display = 'block';
      downloadBtn.href = url;
      downloadBtn.download = `${topic.replace(/\s+/g, '_')}_podcast.mp3`;
      downloadBtn.style.display = 'block';

      setStatus('online', 'Podcast generated successfully!');
    } else {
      showError(`Failed to generate podcast (Status: ${res.status})`);
    }
  } catch (err) {
    showError('An error occurred while generating the podcast.');
  }
}

function showError(message) {
  errorBanner.style.display = 'block';
  errorMessage.textContent = message;
}


/* ══════════════════════════════════════════════════════════════
   DOWNLOAD
   Creates a temporary <a> to trigger browser download
══════════════════════════════════════════════════════════════ */
function downloadAudio() {
  if (!currentAudioURL) return;

  const langCode = langSelect.value;
  const snippet  = scriptInput.value.trim().slice(0, 28).replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, '_');
  const filename = `podcast_${langCode}_${snippet || 'episode'}.mp3`;

  const a    = document.createElement('a');
  a.href     = currentAudioURL;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}


/* ══════════════════════════════════════════════════════════════
   EVENT LISTENERS
══════════════════════════════════════════════════════════════ */
generateBtn.addEventListener('click', async () => {
  const text = scriptInput.value.trim();
  if (!text) {
    showError('Please enter a script to generate audio.');
    return;
  }

  setStatus('checking', 'Generating audio…');
  try {
    const formData = new FormData();
    formData.append('text', text);

    const res = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      currentAudioURL = url;

      audioPlayer.src = url;
      audioPlayer.style.display = 'block';
      downloadBtn.href = url;
      downloadBtn.download = 'generated_audio.mp3';
      downloadBtn.style.display = 'block';

      setStatus('online', 'Audio generated successfully!');
    } else {
      showError(`Failed to generate audio (Status: ${res.status})`);
    }
  } catch (err) {
    showError('An error occurred while generating audio.');
  }
});

errorClose.addEventListener('click',  hideError);
downloadBtn.addEventListener('click', downloadAudio);

regenerateBtn.addEventListener('click', () => {
  hideResult();
  generatePodcast();
});

// Ctrl/Cmd + Enter shortcut
scriptInput.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !generateBtn.disabled) {
    generatePodcast();
  }
});

// Free blob memory on unload
window.addEventListener('beforeunload', () => {
  if (currentAudioURL?.startsWith('blob:')) URL.revokeObjectURL(currentAudioURL);
});


/* ══════════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  checkApiHealth();

  // Staggered card entrance
  document.querySelectorAll('.card').forEach((card, i) => {
    card.style.animationDelay = `${i * 0.08}s`;
  });
});