# CivicLens

**People’s Priorities: AI for Constituency Development Planning**
CivicLens is a unified portal for Members of Parliament (MPs) in India. It accepts unstructured, multilingual citizen feedback and uses **Google Gemini 2.5** to synthesize that data against structured municipal reference datasets, generating objective, evidence-backed priority themes for development.

## 🚀 Hackathon Demo Flow (For Judges)

To evaluate this prototype end-to-end, follow these steps:

1. **Intake Layer (Citizen View):** 
   - Navigate to `/submit`.
   - Act as a citizen. Type a complaint in English, Hindi, or Bengali (e.g. "Water pipeline is broken in Ward 7" or use the Hindi equivalent).
   - *Note: Audio recording is supported but transcription in the demo may fall back to text if browser media devices are blocked.*
   - Submit the concern.

2. **AI Synthesis (The Trust Layer):**
   - Navigate to `/mp/themes` (The MP Dashboard).
   - Click the **"Run AI Synthesis (Demo)"** button at the top right.
   - *What happens under the hood:* The API fetches the raw submissions, groups them, and passes them to Gemini 2.5 to extract entities, translate, and compare against `reference_data` to generate an evidence-backed rationale. It enforces a strict **Zero Hallucination Safeguard** to ensure AI doesn't invent statistics.

3. **Decision Support (MP View):**
   - The newly generated theme will appear in the dashboard.
   - Click **"View Source Data"** to expand the exact municipal datasets that Gemini used to calculate the Justification Score.
   - Observe the **Amber Warning Badge** on Priority #3. This demonstrates our hallucination safeguard catching a fabricated AI statistic in real-time.

## 🏗 Architecture

- **Frontend:** Next.js 16 (App Router), Tailwind CSS v4, Lucide Icons.
- **Backend / DB:** Next.js API Routes (`/api/synthesize`) connected to Supabase (PostgreSQL).
- **AI Engine:** Google Gemini 2.5 Pro (`@google/generative-ai`).
- **Data Note:** To ensure a reliable demo, the municipal datasets (`reference_data` and `development_plans`) are simulated locally via JSON files in `public/data/`. In production, these would be connected to live municipal API endpoints.

## 🛠 Getting Started Locally

1. Clone the repository.
2. Install dependencies: `npm install`
3. Add your `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000).

*Built in accordance with GIGW accessibility standards for Indian Government websites.*
