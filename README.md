# ContentForge AI

> **One Idea. Every Platform. Your Control.**
> *Event → Attend → Feedback → AI Multi-Platform Content*

ContentForge AI is a focused, hackathon-ready social media content studio that converts real-world events and genuine attendee feedback into tailored social posts across Instagram, LinkedIn, X (Twitter), Facebook, and YouTube.

---

## 🎯 The Core User Journey

```
EVENT ORGANIZER creates event
        ↓
USER discovers & views event
        ↓
USER attends event ("✓ Attended")
        ↓
USER shares genuine feedback & rating
        ↓
AI understands Event Data + User Feedback
        ↓
AI generates 3 platform-specific variations
        ↓
Refine, Copy, and Save
```

---

## 🚀 Key Features

1. **Event Organizer Portal ("Create Event")**:
   - Organizers specify Event Name, Description, Date, Time, Location, Speaker, Topics, and Image.
   - Dynamic real event cards rendered immediately with exact information entered.
2. **Attendee Experience ("Events" & "Attend")**:
   - Attendees view full event information and click **"Attend Event"**.
   - Displays **"✓ Attended"** and prompts the user to **"Give Feedback"**.
3. **Genuine Feedback Capture ("My Feedback")**:
   - Large experience input area: *"Tell us what you liked, what you learned, or what interested you about this event..."*
   - 1–5 star rating system.
   - Multi-platform selection: Instagram, LinkedIn, X, Facebook, YouTube.
4. **Real AI Content Generation (Gemini 3.8 / 3.1 Flash)**:
   - **Source of Truth**: The actual event parameters and user feedback are sent directly to Gemini.
   - **Zero Predefined Samples**: If the user attends a "Cyber Security Workshop", content is about cyber security; if they attend an "AI Seminar", content is about that seminar.
   - **3 Distinct Variations per Network**:
     - **Variation 1 — Professional**
     - **Variation 2 — Engaging**
     - **Variation 3 — Storytelling**
   - Each variation provides: Hook, Post Content, Hashtags, and CTA.
5. **AI Content Score**:
   - Breakdown of **Authenticity**, **Engagement**, and **Platform Fit** (out of 100).
6. **"Why This Works"**:
   - Contextual strategic explanation directly referencing the attendee's stated feedback and the specific event.
7. **1-Click Refinements**:
   - *Make Shorter*, *Make More Professional*, *Make More Engaging*, *Improve Hook*.
   - Dynamically re-invokes Gemini to update the current variation while strictly preserving event context.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express
- **Database**: SQLite (`sql.js` WebAssembly engine with local file persistence)
- **AI**: Google Gemini API (`@google/genai` TypeScript SDK with model cascade)

---

## 📦 Quick Start

### 1. Configure Environment
```bash
cp .env.example .env
```
Ensure `GEMINI_API_KEY` is present.

### 2. Run Full-Stack Server
```bash
npm run dev
```
Open `http://localhost:3000`.

### 3. Production Build
```bash
npm run build
npm start
```
