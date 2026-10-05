---
title: Record or upload audio for transcription
description: "Upload or record audio with Fliplet.AI, retain audio for retry and let users review a transcript before inserting it into their text."
type: how-to
tags: [js-api, ai, transcription]
v3_relevant: true
deprecated: false
---
# Record or upload audio for transcription

Transcribe an audio file or a browser recording with `Fliplet.AI.transcribeAudio()`. Your app captures the audio, controls recording and decides how the returned text is displayed or inserted.

## Contents

- [Before you start](#before-you-start)
- [Upload an audio file](#upload-an-audio-file)
- [Record audio](#record-audio)
- [Complete recording and upload example](#complete-recording-and-upload-example)
- [Cancellation, timeout and retry](#cancellation-timeout-and-retry)
- [Verify and troubleshoot](#verify-and-troubleshoot)

## Before you start

`Fliplet.AI` is preloaded in Fliplet apps. Requests need valid Fliplet access and available AI credits. Select an explicitly supported [transcription model](/API/core/ai/models#transcription-models); this guide uses `gpt-4o-mini-transcribe` as an illustrative selection. See the [method reference](/API/core/ai#flipletaitranscribeaudio) for options and errors.

The method accepts an existing `Blob` or `File` and resolves to `{ text: String }`. It does not start the microphone, insert text or submit a form. Validate the base MIME type and file size before uploading: supported types are `audio/webm`, `audio/mp4`, `audio/mpeg`, `audio/wav` and `audio/ogg`; the maximum file size is 25 MiB inclusive. MIME parameters such as `audio/webm;codecs=opus` are accepted. A filename extension alone does not establish the audio's MIME type.

## Upload an audio file

Let the user choose a file, validate its MIME type and size, then call `transcribeAudio(file, { model })`. Keep the selected file after a failed request so the user can retry. The complete example below includes an upload input, pending controls, Cancel and Retry.

If a browser reports an empty or unsupported `file.type`, this example asks for a supported file. Do not guess a MIME type from the extension or relabel an incompatible encoding. Use a known valid source or an appropriate audio conversion before uploading.

## Record audio

Recording requires a secure context and browser support for `navigator.mediaDevices.getUserMedia` and `MediaRecorder`. Feature detection is still needed on supported devices. Test your target desktop and mobile browsers; embedded browser permission policies and device settings can affect microphone access.

1. Request microphone access after the user chooses **Start recording**.
2. Choose a recorder MIME type with `MediaRecorder.isTypeSupported()`, or use the browser's default and validate the result.
3. Collect non-empty `dataavailable` chunks.
4. On **Finish and transcribe**, call `recorder.stop()` and wait for its `stop` event. The final `dataavailable` event occurs before `stop`; building the Blob earlier can lose the final audio.
5. Release all microphone tracks, validate the completed Blob and send it for transcription.

The five-minute capture cap in the example is an app choice, not a Fliplet platform duration limit. File-size limits still apply to the completed recording.

## Complete recording and upload example

Add these controls to your screen and run the script after they exist. This example combines the recording workflow with file upload and retry. It displays an editable transcript separately; **Insert transcript** appends it to the text currently in the Notes field. A failed or cancelled operation leaves existing typed text intact.

```html
<label for="dictation-file">Audio file</label>
<input id="dictation-file" type="file" accept="audio/webm,audio/mp4,audio/mpeg,audio/wav,audio/ogg">
<button id="dictation-upload" type="button" disabled>Transcribe file</button>
<button id="dictation-record" type="button">Start recording</button>
<button id="dictation-cancel" type="button" disabled>Cancel</button>
<button id="dictation-retry" type="button" disabled>Retry transcription</button>
<p id="dictation-status" role="status"></p>
<label for="dictation-transcript">Transcript</label>
<textarea id="dictation-transcript"></textarea>
<button id="dictation-insert" type="button" disabled>Insert transcript</button>
<label for="dictation-notes">Notes</label>
<textarea id="dictation-notes"></textarea>
```

```js
const fileInput = document.getElementById('dictation-file');
const uploadButton = document.getElementById('dictation-upload');
const recordButton = document.getElementById('dictation-record');
const cancelButton = document.getElementById('dictation-cancel');
const retryButton = document.getElementById('dictation-retry');
const insertButton = document.getElementById('dictation-insert');
const statusElement = document.getElementById('dictation-status');
const transcriptElement = document.getElementById('dictation-transcript');
const notesElement = document.getElementById('dictation-notes');
const allowedMimeTypes = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
const recorderMimeTypes = ['audio/webm;codecs=opus', 'audio/mp4;codecs=mp4a.40.2', 'audio/mp4'];
const maxAudioBytes = 25 * 1024 * 1024;
const maxRecordingMs = 5 * 60 * 1000; // Example capture cap, not a platform duration limit.
let phase = 'idle';
let operation;
let retainedAudio;
let disposed = false;

function baseMimeType(mimeType) {
  return (mimeType || '').split(';', 1)[0].trim().toLowerCase();
}

function validateAudio(audio) {
  if (!audio || !audio.size) throw new Error('Select or record non-empty audio.');
  if (audio.size > maxAudioBytes) throw new Error('Audio exceeds 25 MiB. Choose a smaller file.');
  if (!allowedMimeTypes.includes(baseMimeType(audio.type))) {
    throw new Error('Unsupported or missing audio MIME type. Choose a supported file.');
  }
}

function setStatus(message) {
  if (!disposed) statusElement.textContent = message;
}

function updateControls() {
  const busy = phase !== 'idle';
  fileInput.disabled = busy;
  uploadButton.disabled = busy || !fileInput.files.length;
  recordButton.disabled = busy && phase !== 'recording';
  recordButton.textContent = phase === 'recording' ? 'Finish and transcribe' : 'Start recording';
  cancelButton.disabled = !busy || (operation && operation.cancelled);
  retryButton.disabled = busy || !retainedAudio;
  transcriptElement.disabled = busy;
  insertButton.disabled = busy || !transcriptElement.value.trim();
}

function releaseMicrophone(current) {
  if (current.stream) current.stream.getTracks().forEach(function(track) { track.stop(); });
  current.stream = undefined;
  window.clearTimeout(current.timer);
}

function complete(current) {
  releaseMicrophone(current);
  if (operation === current) {
    operation = undefined;
    phase = 'idle';
    if (!disposed) updateControls();
  }
}

function showError(error) {
  const messageByName = {
    NotAllowedError: 'Microphone permission was denied. You can upload a file instead.',
    NotFoundError: 'No microphone is available. You can upload a file instead.',
    NotReadableError: 'The microphone cannot be read. Check device settings and try again.',
    AbortError: 'Transcription cancelled.',
    TimeoutError: 'Transcription timed out. The audio is retained for retry.'
  };
  const messageByStatus = {
    400: 'The audio request was invalid. Check the file and selected model.',
    401: 'Authentication failed. Restore access before retrying.',
    402: 'Insufficient AI credits. Restore credits before retrying.',
    403: 'You are not permitted to transcribe in this app.',
    413: 'Audio exceeds 25 MiB. Choose a smaller file.',
    415: 'Unsupported audio format. Choose a supported file.',
    429: 'Too many requests. Wait before retrying.'
  };
  setStatus(messageByName[error && error.name] || messageByStatus[error && error.status]
    || (error && error.message) || 'Transcription failed. You can retry the retained audio.');
}

function newOperation() {
  const current = { cancelled: false };
  operation = current;
  return current;
}

async function transcribe(audio, current) {
  if (current.cancelled || disposed) return;
  validateAudio(audio);
  retainedAudio = audio;
  phase = 'transcribing';
  current.controller = typeof AbortController === 'function' ? new AbortController() : undefined;
  updateControls();
  setStatus('Transcribing...');
  const options = { model: 'gpt-4o-mini-transcribe', timeout: 120000 };
  if (current.controller) options.signal = current.controller.signal;
  const result = await Fliplet.AI.transcribeAudio(audio, options);
  // Ignore a late result even when the browser cannot abort the request.
  if (current.cancelled || disposed || operation !== current) return;
  if (!result || typeof result.text !== 'string' || !result.text.trim()) {
    throw new Error('No speech text was returned. The audio is retained for retry.');
  }
  transcriptElement.value = result.text;
  setStatus('Transcription complete. Review the text before inserting it.');
}

async function transcribeRetained(audio) {
  if (phase !== 'idle' || disposed) return;
  const current = newOperation();
  phase = 'preparing';
  updateControls();
  try {
    await transcribe(audio, current);
  } catch (error) {
    if (!current.cancelled) showError(error);
  } finally {
    complete(current);
  }
}

async function finishRecording() {
  if (phase !== 'recording' || !operation) return;
  const current = operation;
  phase = 'finishing';
  window.clearTimeout(current.timer);
  updateControls();
  setStatus(current.cancelled ? 'Discarding recording...' : 'Finishing recording...');
  try {
    if (current.recorder.state !== 'inactive') current.recorder.stop();
    const audio = await current.audioReady;
    releaseMicrophone(current); // Release tracks before waiting for the API.
    await transcribe(audio, current);
  } catch (error) {
    if (!current.cancelled) showError(error);
  } finally {
    if (current.cancelled) setStatus('Cancelled. Existing text was preserved.');
    complete(current);
  }
}

async function startRecording() {
  if (phase !== 'idle' || disposed) return;
  if (!window.isSecureContext || !navigator.mediaDevices
      || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
    setStatus('Recording requires a secure context and a supported browser. Upload a file instead.');
    return;
  }
  const current = newOperation();
  phase = 'preparing';
  retainedAudio = undefined;
  fileInput.value = '';
  updateControls();
  setStatus('Requesting microphone permission...');
  try {
    current.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (current.cancelled || disposed) { complete(current); return; }
    const mimeType = typeof MediaRecorder.isTypeSupported === 'function'
      ? recorderMimeTypes.find(function(type) { return MediaRecorder.isTypeSupported(type); })
      : undefined;
    current.recorder = mimeType
      ? new MediaRecorder(current.stream, { mimeType: mimeType })
      : new MediaRecorder(current.stream);
    const chunks = []; // Each recording owns its chunks; late events cannot affect another recording.
    current.recorder.addEventListener('dataavailable', function(event) {
      if (event.data && event.data.size) chunks.push(event.data);
    });
    current.audioReady = new Promise(function(resolve, reject) {
      current.recorder.addEventListener('stop', function() {
        const type = current.recorder.mimeType || (chunks[0] && chunks[0].type) || '';
        resolve(new Blob(chunks, { type: type })); // Includes the final dataavailable chunk.
      }, { once: true });
      current.recorder.addEventListener('error', function(event) {
        reject(event.error || new Error('Recording failed. Try recording again or upload a file.'));
        if (phase === 'recording' && operation === current) {
          if (!current.cancelled) showError(event.error || new Error('Recording failed.'));
          complete(current);
        }
      }, { once: true });
    });
    // An error can occur before Finish is clicked. Its UI handler above releases the microphone.
    current.audioReady.catch(function() {});
    current.recorder.start();
    phase = 'recording';
    current.timer = window.setTimeout(finishRecording, maxRecordingMs);
    setStatus('Recording. Capture stops after five minutes.');
    updateControls();
  } catch (error) {
    if (!current.cancelled) showError(error);
    complete(current);
  }
}

function cancel() {
  const current = operation;
  if (!current || current.cancelled) return;
  current.cancelled = true;
  if (current.controller) current.controller.abort();
  if (phase === 'recording') {
    finishRecording();
  } else {
    setStatus(phase === 'preparing'
      ? 'Cancelled. A pending microphone prompt must still be dismissed.'
      : 'Cancelled. Waiting for cleanup; any late result will be ignored.');
    updateControls();
  }
}

fileInput.addEventListener('change', function() {
  retainedAudio = fileInput.files[0];
  updateControls();
});
uploadButton.addEventListener('click', function() { transcribeRetained(fileInput.files[0]); });
retryButton.addEventListener('click', function() { transcribeRetained(retainedAudio); });
recordButton.addEventListener('click', function() {
  if (phase === 'recording') finishRecording();
  else startRecording();
});
cancelButton.addEventListener('click', cancel);
transcriptElement.addEventListener('input', updateControls);
insertButton.addEventListener('click', function() {
  if (phase !== 'idle' || !transcriptElement.value.trim()) return;
  // Append to the current value, including anything typed while the API was pending.
  notesElement.value += (notesElement.value ? '\n' : '') + transcriptElement.value.trim();
  notesElement.dispatchEvent(new Event('input', { bubbles: true }));
  transcriptElement.value = '';
  updateControls();
  notesElement.focus();
});
window.addEventListener('pagehide', function() {
  disposed = true;
  if (!operation) return;
  operation.cancelled = true;
  if (operation.controller) operation.controller.abort();
  try {
    if (operation.recorder && operation.recorder.state !== 'inactive') operation.recorder.stop();
  } finally {
    releaseMicrophone(operation);
  }
});
updateControls();
```

Use your framework's screen-disposal hook as well as appropriate page lifecycle events when adapting this example. Block the affected form's Save or Send while capture, finalization or transcription is pending. Keep typing and editing available wherever they do not conflict with the operation. This example does not submit Notes automatically.

## Cancellation, timeout and retry

Cancel during recording discards that capture. Cancel during a microphone prompt cannot close the browser's prompt; if access is later granted, the example immediately releases the tracks. Cancel during transcription uses an `AbortSignal` when available and ignores late results. The controls remain pending until cleanup finishes, so another operation cannot overlap.

The transcription timeout covers readiness, authentication refresh, upload, automatic retry and waiting for the response. Before provider handoff, cancellation or timeout stops processing. After handoff, it stops the caller waiting while provider work continues; successful work may still use AI credits. See [errors and limits](/API/core/ai#errors-and-limits) for the exact cancellation and timeout errors.

The example retains selected files and completed valid recordings in memory for **Retry transcription** after a failure or timeout. Retry is a new request and may use credits, including when a previous request timed out after provider handoff. Cancelling a capture does not retain that unfinished recording. Existing transcript text and Notes are preserved until a successful transcription replaces the transcript or the user inserts it.

## Verify and troubleshoot

Test these behaviors in the actual app and target browsers:

- Upload supported non-empty audio and confirm an editable transcript from the selected model.
- Record, finish and confirm the final spoken words are included; confirm the microphone indicator turns off before transcription finishes.
- Deny microphone permission, remove the microphone or use an unsupported recorder. Confirm controls recover and file upload remains available.
- Try empty audio, missing or unsupported MIME types and files above 25 MiB. Confirm validation prevents the request.
- Cancel during permission, recording, finalization and transcription. Confirm no late text appears and tracks are released.
- Trigger a timeout or request failure and retry the retained audio. Confirm the app reports the failure and does not send overlapping requests.
- Type into Notes while transcription is pending, then insert the reviewed transcript. Confirm existing text survives and nothing is submitted automatically.
- Check secure-context and microphone behavior on your supported desktop and mobile browsers, including Safari and iOS if used by your audience.

For permission, credits, MIME and size errors, consult the [method error reference](/API/core/ai#errors-and-limits). Resolve access or credits before retrying; for rate limits, wait before retrying. A recorder MIME type being supported does not guarantee that every file with that MIME type contains valid decodable audio.
