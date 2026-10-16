---
title: Answer questions with web sources
description: Use Fliplet AI with hosted web search and display returned citations as safe, clickable links beside the answer.
type: guide
tags: [js-api, ai, web-search, citations]
v3_relevant: true
deprecated: false
---
# Answer questions with web sources

Use `Fliplet.AI.createCompletion()` with OpenAI Responses and hosted web search to answer questions using web sources. Display the returned citation annotations alongside the answer so readers can inspect its sources.

## Contents

- [Before you start](#before-you-start)
- [Complete question and answer example](#complete-question-and-answer-example)
- [Citation and error behavior](#citation-and-error-behavior)
- [Related docs](#related-docs)

## Before you start

Run this browser example after the screen HTML and Fliplet are ready. `Fliplet.AI` is available through `fliplet-core`; no provider key belongs in app code. The app needs AI access and credits. Select a compatible [Responses model](models); this example explicitly uses `gpt-6.1-sol`.

The request sends the question to the configured provider and enables its `web_search` tool. It does not query private app records or sign in to websites. Use this flow for public information, and review source dates and content before relying on an answer. Enabling a search tool does not prove that a search ran or that every claim is supported.

### Example resources

Reuse the parser and sanitizer from the [AI reply presentation resources](chatbot#example-resources) if already configured. For a V3 screen, declare both named resources below in app resources; the JavaScript loads them on demand. Buffered research does not need the socket dependency. For other app setups, load these pinned URLs using [dependencies and assets](/Dependencies-and-assets), replace the two lazy-loading calls with your loader, and retain the availability check. Review security updates when maintaining pinned dependencies.

<!-- example: grounded-resources -->
```json
[
  { "name": "ai-chat-marked", "latest": "https://cdn.jsdelivr.net/npm/marked@18.1.0/lib/marked.umd.js", "lazy": true },
  { "name": "ai-chat-purify", "latest": "https://cdn.jsdelivr.net/npm/dompurify@3.4.16/dist/purify.min.js", "lazy": true }
]
```

## Complete question and answer example

Add this HTML, then the JavaScript below. The renderer reads offsets from each unchanged response text part, preserves each annotated span and appends a citation placeholder, parses Markdown, sanitizes it, and inserts visible **Source 1** links using the returned URLs. The source title is available as the link tooltip and accessible label. OpenAI requires visible, clickable inline citations when displaying web results; see its [web search contract](https://developers.openai.com/api/docs/guides/tools-web-search).

<!-- example: grounded-html -->
```html
<form id="research-form">
  <label for="research-question">Question about public information</label>
  <textarea id="research-question" required maxlength="2000"></textarea>
  <button id="research-submit" type="submit">Research</button>
</form>
<p id="research-status" role="status"></p>
<div id="research-answer" style="overflow-wrap: anywhere"></div>
```

<!-- example: grounded-main -->
```js
function checkResearchRenderer() {
  if (!window.marked || typeof window.marked.parse !== 'function' ||
      !window.DOMPurify || !window.DOMPurify.isSupported) {
    throw new Error('Answer formatting could not load. Check your connection and retry.');
  }
}

async function ensureResearchRenderer() {
  await Promise.all([
    Fliplet.require.lazy('ai-chat-marked'),
    Fliplet.require.lazy('ai-chat-purify')
  ]);
  checkResearchRenderer();
}

function researchSourceUrl(value) {
  if (typeof value !== 'string' || /[\u0000-\u0020\u007f]/.test(value)) return null;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url : null;
  } catch (_) { return null; }
}

function renderWebAnswer(result, container) {
  if (!result || result.status !== 'completed' || result.error) {
    throw new Error('The answer was not completed. Try again when ready.');
  }
  const output = Array.isArray(result.output) ? result.output : [];
  const parts = output.filter(item => item && item.type === 'message')
    .flatMap(item => Array.isArray(item.content) ? item.content : []);
  if (parts.some(part => part && part.type === 'refusal')) {
    throw new Error('The model declined to answer this question.');
  }
  const textParts = parts.filter(part => part && part.type === 'output_text' && typeof part.text === 'string');
  if (!textParts.some(part => part.text.trim())) throw new Error('No answer text was returned.');
  const fragment = document.createDocumentFragment();
  let citationCount = 0;
  for (const part of textParts) {
    const text = part.text;
    const citations = (Array.isArray(part.annotations) ? part.annotations : [])
      .filter(annotation => annotation && annotation.type === 'url_citation')
      .sort((a, b) => a.start_index - b.start_index);
    const prefix = 'FLIPLETCITATION' + crypto.randomUUID().replace(/-/g, '');
    const sources = [];
    let cursor = 0;
    let displayText = '';
    for (const citation of citations) {
      const start = citation.start_index;
      const end = citation.end_index;
      const url = researchSourceUrl(citation.url);
      if (!Number.isInteger(start) || !Number.isInteger(end) || start < cursor ||
          end <= start || end > text.length || !url) {
        throw new Error('Source links could not be displayed reliably. The answer has been withheld.');
      }
      const number = ++citationCount;
      const marker = prefix + number + 'END';
      displayText += text.slice(cursor, end) + ' ' + marker;
      sources.push({ marker, number, url, title: typeof citation.title === 'string' ? citation.title : url.hostname });
      cursor = end;
    }
    displayText += text.slice(cursor);
    checkResearchRenderer();
    const section = document.createElement('div');
    section.innerHTML = window.DOMPurify.sanitize(window.marked.parse(displayText), {
      ALLOWED_TAGS: ['p', 'br', 'ul', 'ol', 'li', 'strong', 'em', 'del', 'blockquote',
        'pre', 'code', 'a', 'h1', 'h2', 'h3', 'h4', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
      ALLOWED_ATTR: ['href', 'title'],
      ALLOWED_URI_REGEXP: /^https?:/i
    });
    for (const link of section.querySelectorAll('a')) {
      const url = researchSourceUrl(link.getAttribute('href'));
      if (!url) link.replaceWith(...link.childNodes);
      else { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
    }
    for (const source of sources) {
      const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT);
      const matches = [];
      let node;
      while ((node = walker.nextNode())) {
        let start = node.data.indexOf(source.marker);
        while (start !== -1) {
          matches.push({ node, start });
          start = node.data.indexOf(source.marker, start + source.marker.length);
        }
      }
      if (matches.length !== 1) {
        throw new Error('Source links could not be displayed reliably. The answer has been withheld.');
      }
      const match = matches[0];
      // A citation inside a model-written Markdown link must not create nested anchors.
      const enclosingLink = match.node.parentElement.closest('a');
      if (enclosingLink) enclosingLink.replaceWith(...enclosingLink.childNodes);
      const link = document.createElement('a');
      link.href = source.url.href;
      link.textContent = 'Source ' + source.number;
      link.title = source.title;
      link.setAttribute('aria-label', source.title + ': ' + link.textContent);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      match.node.replaceWith(document.createTextNode(match.node.data.slice(0, match.start)), link,
        document.createTextNode(match.node.data.slice(match.start + source.marker.length)));
    }
    fragment.append(section);
  }
  container.replaceChildren(fragment);
  const searched = output.some(item => item && item.type === 'web_search_call' && item.status === 'completed');
  return !citationCount ? 'No usable source citations were returned. Treat this answer as unverified.'
    : !searched ? 'Source links returned; completed web search was not confirmed.'
      : 'Open the inline source links to check the answer.';
}

const researchForm = document.getElementById('research-form');
const researchQuestion = document.getElementById('research-question');
const researchSubmit = document.getElementById('research-submit');
const researchStatus = document.getElementById('research-status');
const researchAnswer = document.getElementById('research-answer');
let researchBusy = false;
researchForm.addEventListener('submit', async function(event) {
  event.preventDefault();
  if (researchBusy) return;
  const question = researchQuestion.value.trim();
  if (!question || question.length > 2000) {
    researchStatus.textContent = 'Enter a question of 1 to 2,000 characters.';
    return;
  }
  researchBusy = researchSubmit.disabled = true;
  researchQuestion.disabled = true;
  researchAnswer.replaceChildren();
  researchStatus.textContent = 'Researching…';
  try {
    await ensureResearchRenderer();
    const result = await Fliplet.AI.createCompletion({
      model: 'gpt-6.1-sol',
      useResponses: true,
      tools: [{ type: 'web_search' }],
      input: 'Search the web to answer this question. Cite sources and identify uncertainty. ' + question,
      max_output_tokens: 2000
    });
    researchStatus.textContent = renderWebAnswer(result, researchAnswer);
  } catch (error) {
    researchAnswer.replaceChildren();
    researchStatus.textContent = error instanceof Error ? error.message : 'Research failed. Try again when ready.';
  } finally {
    researchBusy = researchSubmit.disabled = false;
    researchQuestion.disabled = false;
  }
});
```

The form retains the question after failure and makes another request only when the reader selects **Research** again. It blocks duplicate submissions while a request is pending. A retry is a new AI request and can incur usage.

## Citation and error behavior

Responses returns typed `output` items. The renderer reads only `message.content` parts with `type: 'output_text'`, and their flat `url_citation` annotations (`url`, `title`, `start_index`, `end_index`). It evaluates offsets separately for each original text part, before joining or formatting anything. It keeps duplicate URLs when they cite different passages. See the [Responses reference](https://developers.openai.com/api/reference/resources/responses/methods/create).

Invalid offsets, overlapping ranges, unsafe URL schemes and credential-bearing URLs withhold the answer. Missing annotations display the formatted text with an explicit unverified status and no generated source links. The response object and original text remain unchanged. The display copy keeps the annotated words and appends a source link after them, because an annotation can cover a factual claim rather than a disposable citation marker. An existing Markdown citation link may therefore appear beside the generated source link. Only the display copy is formatted. Marked parses Markdown; DOMPurify sanitizes the resulting HTML before insertion. Citation URLs bypass Markdown parsing and are assigned through DOM properties after sanitization. Source labels and titles use text properties. If formatting removes or duplicates a citation placeholder, the answer is withheld rather than attaching a source to the wrong passage. Ordinary Markdown links are not counted as returned citations.

HTTP and HTTPS links are allowed; a valid URL is not an endorsement of its destination.

A failed or incomplete response, refusal, empty answer or request error leaves a visible message and the question available for correction. Authentication, credits, rate limits and model/tool compatibility can also cause failures; see [AI errors](/API/core/ai#shared-access-and-errors). The example buffers the final answer to demonstrate citation handling.

For interactive research, follow the [progressive reply guidance](chatbot#stream-a-reply) and [streaming terminal-result contract](/API/core/ai#terminal-results). Safely format accumulated raw text as provisional output through your app's framework renderer. Use `{ returnResult: true }` to retain the native final Responses result. After successful completion, finalize the answer from that result, applying annotations to each original text part before formatting a display copy as above. Partial deltas do not establish a completed search or usable source citations; keep provisional output visibly unverified.

## Related docs

- [AI JavaScript reference](/API/core/ai)
- [AI models](models)
- [AI reply presentation and conversations](chatbot)
- [Analyze PDFs and images](media-inputs)
- [Tools and authorized actions](tool-calling)
