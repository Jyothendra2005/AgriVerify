# AgriVerify

AgriVerify is a highly accessible, farmer-friendly, multi-regional language agricultural chat application equipped with real-time text-to-speech, interactive audio transcription, visual identification utilities, and robust scientific curation. 

Designed for smallholders across diverse geographies, AgriVerify matches farmer queries against local agronomical database registries first before securely consulting Google Gemini LLM fallback pipelines. When fallback pipelines are triggered, an automated review flow queues recommendations for human curation under the **Expert Review Board** dashboard, ensuring only high-quality, farmer-safe guidelines reach local communities.

---

## 🛠 Features

- **Multi-Regional Multimodality**: Farmers can seamlessly ask questions in English, Telugu, Hindi, Kannada, Tamil, Marathi, or Bengali.
- **Vocal Empowerment**: Integrated Web Speech API features for regional language Speech-To-Text (STT) transcribe query logs, accompanied by instant Text-To-Speech (TTS) readout of scientific answers.
- **Curation Pipeline & Expert Review Board**: Protects farmers from hallucinated material. If a query requires the AI Fallback (Tier 3), it goes into a review queue where expert scientists can review, edit, approve, or reject advice before it goes live.
- **Slick, Focused Design**: Clean, visual layout using fluid container dimensions, custom typography accents (featuring "Inter" and "JetBrains Mono"), custom status boards, and rich visual controls.

---


## 🧱 Technical Architecture

AgriVerify is built as a **Full-Stack Web Application**:

1. **Frontend (SPA)**: Built using **React (v18+)**, **TypeScript**, and **Vite**, utilizing **Tailwind CSS** for visual consistency and layouts.
2. **Backend**: An **Express** mock server configured in `server.ts` handles:
   - Client asset distribution
   - Local dictionary lookup matches (Tier 1 & Tier 2 query parsing)
   - Proxying fallback queries securely to the **Gemini API** using `process.env.GEMINI_API_KEY`
   - Cointainerization and standard HTTP routing over port `3000`

---

## 📦 Local Installation & Setup

If you have exported this codebase from Google AI Studio to GitHub or downloaded a ZIP archive, you can run and develop it locally using the following steps:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18 or higher) installed on your system.

### 1. Clone & Install Dependencies
First, clone the repository (or extract the zip) and install npm packages:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and define your Google Gemini key:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Reference `.env.example` in the repository for necessary variables).*

### 3. Run Development Server
Start the development server with Hot Module Replacement:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 4. Build Code & Start Production Server
To build compile-safe, production-bundled code and start the Node.js production service:
```bash
npm run build
npm start
```

---
