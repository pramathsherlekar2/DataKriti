# DataKriti: AI-Powered Kannada Document Digitization & Intelligence Platform

> **Tagline:** *From Kannada Documents to Digital Knowledge.*  
> **ಕನ್ನಡ ದಾಖಲೆಗಳಿಂದ ಡಿಜಿಟಲ್ ಜ್ಞಾನದೆಡೆಗೆ**

DataKriti is an enterprise-grade, hackathon-ready full-stack AI platform built to digitize, restore, verify, understand, translate, and speak Kannada (ಕನ್ನಡ) documents. It addresses the historic bottleneck in regional language digitization—from complex subscript ligatures (ಒತ್ತಕ್ಷರಗಳು) and vowel signs to ink deterioration and ancient inscription degradation.

---

## 🌟 Key Architecture & Capabilities

### 1. Smart Document Ingestion
- Upload scanned images (JPG, PNG) and multi-page PDFs with drag-and-drop.
- Direct camera capture mode for physical documents.
- 1-Click pre-loaded official Kannada sample documents (Official Karnataka Government Circular and 16th-century Vijayanagara Inscription).

### 2. High-Precision Multimodal Kannada OCR
- Powered by `gemini-3.8-flash` vision models.
- Preserves exact Kannada Unicode characters, compound ligatures, vowel diacritics, and reading order.
- Supports mixed Kannada and English terminology.

### 3. Document Restoration Studio
- Real-time client-side canvas processing pipeline:
  - Contrast enhancement & brightness normalization
  - Grayscale conversion and shadow suppression
  - Laplacian high-pass sharpening filter
  - Orientation deskewing (-15° to +15°) and rotation
  - Faded-text recovery boosting faint ink strokes
- Interactive Split-Slider, Side-by-Side, and Enhanced-only comparison views.
- "Run OCR with Enhanced Image" action that boosts low-quality recognition without overwriting original files.

### 4. Kannada Document Recovery Intelligence
- Evaluates document condition before OCR: Quality score (0–100), blur level, contrast, skew, and lighting field.
- Identifies specific physical defects and recommends enhancement operations with linguistic reasoning.
- 1-Click automatic restoration applying the optimal filters.

### 5. OCR Verification Studio & Heatmap
- Side-by-side workspace: Zoomable source document on the left, editable Unicode text on the right.
- Real confidence heatmap highlighting words needing review.
- Undo/redo history stack, word counts, and diff view comparing original OCR vs. corrected text.

### 6. Kannada OCR Error Intelligence
- Contextual correction suggestions for uncertain Kannada words based on Kannada morphology, Sandhi, and Ottakshara spelling variations.
- 1-Click Accept, Reject, or manual edit.

### 7. Multilingual Indian Language Translation
- Translate Kannada into **8 Indian languages**:
  1. English
  2. Marathi (मराठी)
  3. Hindi (हिन्दी)
  4. Punjabi (ਪੰਜਾਬੀ)
  5. Gujarati (ગુજરાતી)
  6. Telugu (తెలుగు)
  7. Tamil (தமிழ்)
  8. Malayalam (മലയാളം)
- Administrative vocabulary glossary table and cultural translation notes.

### 8. AI Document Summary & Understanding Modes
- Dynamic summaries: Short, Standard, and Detailed lengths.
- Plain citizen explanation (ಜನಸಾಮಾನ್ಯರಿಗೆ ಸರಳ ವಿವರಣೆ) converting complex circulars into easy reading.
- Adapts to 6 Document Categories: Government, Educational, Historical, Newspaper, Personal, and General.

### 9. Smart Entity & Information Extraction
- Automatically extracts:
  - Organizations and Departments
  - Mandatory deadlines & timelines
  - Monetary amounts and fees (₹)
  - Circular / file reference numbers
  - Helpline numbers, emails, and postal addresses
  - Key administrative directives

### 10. Ask Your Document with Source Citations
- Contextual conversational Q&A grounded exclusively in the uploaded document.
- Explicit notice if a query is not present in the document.
- Clickable verified source citations showing the exact supporting Kannada quote.

### 11. Kannada Voice Reader (TTS)
- Natural text-to-speech reading using Web Speech API with Kannada voice detection (`kn-IN`).
- Interactive sentence highlight tracking playback in real time.
- Play, pause, resume, stop, and speed controls (0.75x, 1.0x, 1.25x, 1.5x).

### 12. Searchable Document Library & Offline Mode
- Local persistence using IndexedDB (`datakriti_db`).
- Search across filenames, Kannada keywords, and translations.
- Filter by category, date, and favourites.
- Full offline availability for viewing, editing, and exporting cached documents.

### 13. Document Export Centre
- Export as **Searchable PDF** with selectable Kannada text layer.
- Export as **Microsoft Word (DOCX)** with formatted letterhead styling.
- Export as **Clean UTF-8 TXT** with metadata headers.
- Export individual translations.

### 14. Cultural Design System & Custom Accent Colors
- Default Warm Ivory light theme & Deep Midnight dark theme.
- 9 Heritage-inspired accent color tokens:
  - Royal Amethyst (Purple)
  - Mysore Cobalt (Blue)
  - Western Ghats Emerald (Green)
  - Karnataka Haldi Gold (Yellow)
  - Hampi Vermilion (Red)
  - Channapatna Ochre (Orange)
  - Lotus Blossom (Pink)
  - Obsidian Ink (Black)
  - Silver Slate (White)

---

## 🚀 Running the Platform

1. **Development Server:**
   ```bash
   npm run dev
   ```
2. **Compile Verification:**
   ```bash
   npm run lint
   npm run build
   ```
3. **Environment Secrets:**
   Set `GEMINI_API_KEY` in Google AI Studio **Settings > Secrets**.
