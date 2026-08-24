# CLAUDE.md — UPDA ITB Study Platform

Baca file ini sebelum melakukan apapun. File ini berisi semua konteks yang dibutuhkan untuk bekerja di project ini.

---

## Project Overview

Platform web untuk persiapan **Ujian Potensi Dasar Akademik (UPDA) ITB** — ujian masuk pascasarjana ITB yang setara TPA Bappenas, skor 200–800, target minimum 475.

Dua modul utama:
- **Belajar** — drill soal per topik dengan pembahasan
- **Try Out** — simulasi ujian penuh 250 soal / 3 jam

---

## Tech Stack

```
Framework    : Next.js 14 (App Router)
Database     : Supabase (PostgreSQL)
Auth         : Supabase Auth (email + password)
AI           : Groq API — model: llama-3.3-70b-versatile
Deploy       : Vercel
Styling      : Tailwind CSS
Icons        : Lucide React (SVG only, NO emoji in UI)
Charts       : Recharts
State        : Zustand (tryout session state)
Forms        : React Hook Form + Zod
Animation    : Framer Motion (subtle only, max 200ms)
```

---

## Commands

```bash
# Development
npm run dev

# Build
npm run build

# Seed soal teks via Groq (jalankan SEKALI setelah setup)
npx tsx scripts/seed-text-questions.ts

# Seed soal visual programatik (jalankan SEKALI setelah setup)
npx tsx scripts/seed-visual-questions.ts

# Type check
npm run type-check

# Lint
npm run lint
```

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
NEXT_PUBLIC_APP_URL=
```

Semua wajib diisi sebelum `npm run dev`. Jangan hardcode nilai apapun ke dalam kode.

---

## Struktur UPDA ITB

```
Subtest       Topik                Soal   Durasi   Sumber Soal
─────────────────────────────────────────────────────────────
Verbal        Sinonim              25     15 min   Groq AI
Verbal        Antonim              25     15 min   Groq AI
Verbal        Padanan Kata         25     15 min   Groq AI
Verbal        Pemahaman Teks       15     15 min   Groq AI
Kuantitatif   Aritmetika           25     15 min   Groq AI + validasi
Kuantitatif   Deret Bilangan       25     15 min   Groq AI + validasi
Kuantitatif   Operasi Matematika   25     15 min   Groq AI + validasi
Kuantitatif   Analisis Data        15     15 min   Groq AI + validasi
Logika        Formal               15     15 min   Groq AI
Logika        Matematika           15     15 min   Groq AI + validasi
Logika        Angka                20     15 min   Groq AI + validasi
Logika        Visual               20     15 min   SVG Generator
─────────────────────────────────────────────────────────────
Total                              250    180 min
```

**Scoring:**
```
scaled_score = 200 + (benar/total * 100 / 100) * 600
final_score  = avg(scaled_verbal, scaled_kuantitatif, scaled_logika)
Lulus        = final_score >= 475
```

---

## Database Schema (Ringkasan)

```sql
profiles           -- data user (id, name, target_score)
questions          -- bank soal (teks + visual JSON)
tryout_sessions    -- sesi try out (skor, status, AI summary)
tryout_answers     -- jawaban per soal per sesi
drill_answers      -- jawaban sesi belajar/drill
bookmarks          -- soal yang di-bookmark user
study_streaks      -- streak belajar harian
ai_analysis_cache  -- cache Overall Analysis (expire 24 jam)
```

Semua tabel pakai **Row Level Security (RLS)**. User hanya bisa akses data miliknya sendiri. Table `questions` read-only untuk semua authenticated users.

---

## Soal Visual (Logika Visual)

Soal visual **tidak pakai AI dan tidak menyimpan gambar**. Disimpan sebagai JSON descriptor di kolom `visual_data`, di-render jadi SVG di browser saat runtime.

```typescript
// Contoh descriptor soal visual
{
  type: 'odd_one_out' | 'sequence' | 'matrix' | 'mirror',
  question: string,
  items/sequence/grid/source: ShapeDescriptor[],
  options: Record<'A'|'B'|'C'|'D'|'E', ShapeDescriptor>,
  answer: 'A'|'B'|'C'|'D'|'E',
  explanation: string
}

// Shape Descriptor
{
  shape: 'circle'|'square'|'triangle'|'diamond'|'star'|'pentagon'|'hexagon'|'arrow'|'cylinder'|'cross',
  fill: 'outline'|'solid'|'half'|'dotted',
  inner?: 'circle'|'star'|'cross'|'dot'|'crescent'|'triangle'|'square'|null,
  rotation?: 0|45|90|135|180|225|270|315,
  size?: 'small'|'medium'|'large'
}
```

Renderer ada di `components/visual/`. Jangan ubah JSON structure tanpa update renderer.

---

## Fitur AI

### Post-Test Summary (otomatis setelah try out)
- Di-generate otomatis setelah user selesai try out
- Data: skor per topik, akurasi, kecepatan, attempt ke-berapa
- Disimpan di `tryout_sessions.ai_summary`

### Overall Analysis (on-demand di dashboard)
- Dipanggil saat user klik tombol "Analisis Menyeluruh"
- Data: semua metric dashboard (tren skor, akurasi per topik, kecepatan)
- Di-cache 24 jam di `ai_analysis_cache`
- Jangan re-generate jika cache masih valid

### Groq Rate Limits
- Model: `llama-3.3-70b-versatile`
- Seed script: generate batch 25 soal per request, delay 2 detik antar request
- Response harus pure JSON — strip markdown backticks sebelum JSON.parse()
- Selalu wrap Groq call dalam try-catch, retry max 3x jika gagal

---

## Konvensi Kode

### Naming
```
Components    : PascalCase       → QuestionCard.tsx
Hooks         : camelCase + use  → useTryoutSession.ts
API routes    : kebab-case       → /api/tryout/[sessionId]/complete-topic
DB columns    : snake_case       → topic_accuracy, created_at
TS types      : PascalCase       → TryoutSession, ShapeDescriptor
Constants     : UPPER_SNAKE      → TOPICS, TARGET_TIMES
```

### API Routes (App Router)
```typescript
// Semua API route harus:
// 1. Validasi auth dulu
// 2. Validasi input dengan Zod
// 3. Return consistent shape: { data, error }
// 4. Handle error dengan proper HTTP status codes

export async function POST(req: Request) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // ...
}
```

### Supabase Client
```typescript
// Browser components → lib/supabase/client.ts
// Server components / API routes → lib/supabase/server.ts
// Seed scripts → service role key dari lib/supabase/admin.ts
// JANGAN pakai service role key di browser/client-side
```

### Tailwind
- Gunakan design tokens dari `tailwind.config.ts` (sudah define custom colors)
- Jangan inline arbitrary values kecuali terpaksa
- Dark mode tidak ada di v1, skip

---

## Design System (Penting)

```
Background halaman : gray-50  (#f9fafb)
Card background    : white    (#ffffff)
Card border        : gray-200 (#e5e7eb)
Teks heading       : gray-900 (#111827)
Teks body          : gray-700 (#374151)
Teks secondary     : gray-500 (#6b7280)
Aksen utama        : blue-600 (#2563eb)
Benar/lulus        : green-500 (#22c55e)
Salah/gagal        : red-500  (#ef4444)
Warning/timer      : amber-500 (#f59e0b)

Subtest colors:
  Verbal        → blue-500
  Kuantitatif   → emerald-500
  Logika        → violet-500

Fonts:
  Heading → Plus Jakarta Sans (600, 700, 800)
  Body    → Inter (300, 400, 500, 600)

Border radius:
  Card   → rounded-xl (12px)
  Button → rounded-lg  (8px)
  Badge  → rounded-full

Shadow: shadow-sm only — jangan shadow-lg atau shadow-xl
Gradien: TIDAK ADA
Emoji di UI: TIDAK ADA — gunakan Lucide icons
```

---

## Rules — Jangan Dilanggar

1. **Jangan generate soal kuantitatif tanpa validasi matematika** — setiap soal hitung-hitungan harus diverifikasi jawabannya secara programatik sebelum masuk DB.

2. **Jangan pakai `service_role_key` di client-side** — hanya untuk server/scripts.

3. **Jangan skip RLS** — semua tabel harus punya policy sebelum dipakai.

4. **Jangan simpan gambar untuk soal visual** — selalu gunakan JSON descriptor + SVG renderer.

5. **Jangan re-generate Overall AI Analysis jika cache masih valid** — cek `ai_analysis_cache.expires_at` dulu.

6. **Jangan hardcode string topik** — selalu refer ke `lib/constants.ts`:
   ```typescript
   import { TOPICS, SUBTESTS } from '@/lib/constants'
   ```

7. **Jangan buat halaman baru tanpa auth guard** — semua halaman di `(app)/` harus protected.

8. **Jangan pakai `any` di TypeScript** — gunakan proper types dari `types/index.ts`.

9. **Jangan generate seluruh seed sekaligus** — gunakan delay antar batch untuk menghindari Groq rate limit.

10. **Jangan tambah dependency baru tanpa alasan jelas** — stack sudah cukup.

---

## Urutan Development (Phase by Phase)

```
Phase 1 → Setup: Next.js + Supabase + Auth + Schema + RLS
Phase 2 → Seed: text questions (Groq) + visual generator
Phase 3 → SVG visual question renderer + shape library
Phase 4 → Modul Belajar (drill)
Phase 5 → Modul Try Out (sesi aktif + timer + navigasi)
Phase 6 → Halaman Hasil + Post-Test AI Summary
Phase 7 → Dashboard + charts + Overall AI Analysis
Phase 8 → Bookmark + polish + responsive
```

Selesaikan dan test setiap phase sebelum lanjut ke berikutnya.

---

## Referensi File Penting

```
PRD lengkap         → PRD-UPDA-ITB.md
DB schema SQL       → supabase/schema.sql
Constants           → src/lib/constants.ts
Types               → src/types/index.ts
Groq prompts        → src/lib/groq/generators/
Visual generator    → src/lib/visual/generator.ts
Seed scripts        → scripts/
```

---

*Jika ada yang tidak jelas, baca PRD-UPDA-ITB.md terlebih dahulu sebelum bertanya atau berasumsi.*
