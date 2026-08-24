# Product Requirements Document
## UPDA ITB — Platform Belajar & Try Out
**Version:** 2.0  
**Stack:** Next.js 14 · Supabase · Groq AI · Vercel  
**Status:** Ready for Development

---

## 1. Overview

Platform web untuk persiapan Ujian Potensi Dasar Akademik (UPDA) ITB. Terdiri dari dua modul utama: **Belajar** (drill per topik) dan **Try Out** (simulasi ujian penuh). Seluruh history, progress, analisis AI, dan soal visual berbasis SVG tersimpan per akun pengguna.

### Target User
Calon mahasiswa pascasarjana ITB yang membutuhkan platform belajar terstruktur untuk mencapai skor UPDA minimum 475 (skala 200–800).

---

## 2. Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| AI Engine | Groq API — `llama-3.3-70b-versatile` |
| Deployment | Vercel |
| Styling | Tailwind CSS |
| Icons | Lucide React (SVG) |
| Charts | Recharts |
| State Management | Zustand |
| Form & Validation | React Hook Form + Zod |
| Animation | Framer Motion (subtle only) |

---

## 3. Struktur UPDA ITB

| Subtest | Topik | Jumlah Soal | Durasi | Sumber Soal |
|---|---|---|---|---|
| Verbal | Sinonim | 25 | 15 menit | Groq AI |
| Verbal | Antonim | 25 | 15 menit | Groq AI |
| Verbal | Padanan Kata | 25 | 15 menit | Groq AI |
| Verbal | Pemahaman Teks | 15 | 15 menit | Groq AI |
| Kuantitatif | Aritmetika | 25 | 15 menit | Groq AI + validasi |
| Kuantitatif | Deret Bilangan | 25 | 15 menit | Groq AI + validasi |
| Kuantitatif | Operasi Matematika | 25 | 15 menit | Groq AI + validasi |
| Kuantitatif | Analisis Data | 15 | 15 menit | Groq AI + validasi |
| Logika | Formal | 15 | 15 menit | Groq AI |
| Logika | Matematika | 15 | 15 menit | Groq AI + validasi |
| Logika | Angka | 20 | 15 menit | Groq AI + validasi |
| Logika | Visual | 20 | 15 menit | **SVG Generator** |

**Total: 250 soal · 180 menit · Skor: 200–800 · Target minimum: 475**

---

## 4. Sistem Penilaian

```
raw_score_per_topic    = (benar / total) * 100
scaled_score_per_topic = 200 + (raw / 100) * 600

scaled_verbal       = avg(sinonim, antonim, padanan, pemahaman)
scaled_kuantitatif  = avg(aritmetika, deret, operasi, analisis)
scaled_logika       = avg(formal, matematika, angka, visual)

final_score = avg(scaled_verbal, scaled_kuantitatif, scaled_logika)
```

Status: **Lulus** jika `final_score >= 475`

---

## 5. Strategi Soal

### 5.1 Soal Teks (11 topik) — Groq AI

Semua soal di-generate via Groq dan disimpan permanen di Supabase sebagai bank soal. Seed dilakukan sekali saat setup dengan target **5x jumlah soal per topik**.

**Target bank soal:**

| Topik | Soal/Try Out | Bank (5x) |
|---|---|---|
| Sinonim | 25 | 125 |
| Antonim | 25 | 125 |
| Padanan Kata | 25 | 125 |
| Pemahaman Teks | 15 | 75 |
| Aritmetika | 25 | 125 |
| Deret Bilangan | 25 | 125 |
| Operasi Matematika | 25 | 125 |
| Analisis Data | 15 | 75 |
| Logika Formal | 15 | 75 |
| Logika Matematika | 15 | 75 |
| Logika Angka | 20 | 100 |
| **Total teks** | **230** | **1.150** |

**Validasi soal kuantitatif:** setiap soal matematika/deret yang di-generate, backend menjalankan kalkulasi ulang untuk verifikasi jawaban sebelum insert ke DB. Soal yang jawabannya tidak konsisten di-discard dan di-generate ulang.

**Prompt strategy per topik:**
```
System: "Kamu adalah pembuat soal TPA/UPDA ITB yang ahli. Buat soal 
berkualitas tinggi setara ujian pascasarjana. Return ONLY valid JSON 
array, tanpa markdown, tanpa teks lain."

User per topik — contoh Sinonim:
"Buat 10 soal SINONIM untuk UPDA ITB. Tingkat kesulitan: sedang-tinggi.
Gunakan kosakata akademik yang sering muncul di TPA Bappenas.
Format: [{ question, options: {A,B,C,D,E}, answer, explanation, difficulty }]"
```

---

### 5.2 Soal Visual (Logika Visual) — SVG Programatik

Soal visual **tidak menggunakan AI dan tidak menyimpan gambar**. Setiap soal disimpan sebagai **JSON descriptor** di DB, lalu di-render menjadi SVG di browser saat runtime.

#### Tipe Soal Visual

**Tipe 1: Odd One Out**
5 gambar ditampilkan, 1 yang tidak sesuai pola.
```json
{
  "type": "odd_one_out",
  "question": "Pada lima gambar berikut, manakah yang berbeda?",
  "items": [
    { "id": "A", "shape": "diamond", "fill": "outline", "inner": "crescent", "rotation": 45 },
    { "id": "B", "shape": "diamond", "fill": "outline", "inner": "crescent", "rotation": 90 },
    { "id": "C", "shape": "diamond", "fill": "outline", "inner": "circle",   "rotation": 45 },
    { "id": "D", "shape": "diamond", "fill": "outline", "inner": "crescent", "rotation": 135 },
    { "id": "E", "shape": "diamond", "fill": "outline", "inner": "crescent", "rotation": 180 }
  ],
  "answer": "C",
  "explanation": "Semua gambar berisi bulan sabit di dalam, kecuali C yang berisi lingkaran penuh."
}
```

**Tipe 2: Sequence Completion**
Deretan pola, cari gambar selanjutnya.
```json
{
  "type": "sequence",
  "question": "Carilah gambar selanjutnya dari pola berikut",
  "sequence": [
    { "shape": "circle", "fill": "outline", "dots": 1 },
    { "shape": "circle", "fill": "outline", "dots": 2 },
    { "shape": "circle", "fill": "outline", "dots": 3 }
  ],
  "options": {
    "A": { "shape": "circle", "fill": "solid",   "dots": 4 },
    "B": { "shape": "circle", "fill": "outline", "dots": 4 },
    "C": { "shape": "circle", "fill": "outline", "dots": 3 },
    "D": { "shape": "square", "fill": "outline", "dots": 4 },
    "E": { "shape": "circle", "fill": "outline", "dots": 5 }
  },
  "answer": "B",
  "explanation": "Pola: lingkaran outline dengan titik bertambah 1 setiap suku."
}
```

**Tipe 3: Matrix Completion**
Grid 3x3, satu kotak kosong (tanda tanya), cari yang sesuai.
```json
{
  "type": "matrix",
  "question": "Manakah yang sesuai untuk melengkapi gambar berikut?",
  "grid": [
    [
      { "shape": "circle",   "fill": "outline", "inner": "cross"  },
      { "shape": "triangle", "fill": "outline", "inner": null      },
      { "shape": "star",     "fill": "outline", "inner": null      }
    ],
    [
      { "shape": "circle",   "fill": "solid",   "inner": "cross"  },
      { "shape": "triangle", "fill": "solid",   "inner": null      },
      { "shape": "star",     "fill": "solid",   "inner": null      }
    ],
    [
      { "shape": "circle",   "fill": "outline", "size": "large"   },
      { "shape": "triangle", "fill": "outline", "size": "large"   },
      null
    ]
  ],
  "options": {
    "A": { "shape": "star", "fill": "solid",   "size": "large" },
    "B": { "shape": "star", "fill": "outline", "size": "small" },
    "C": { "shape": "star", "fill": "outline", "size": "large" },
    "D": { "shape": "circle","fill": "outline", "size": "large" },
    "E": { "shape": "star", "fill": "solid",   "size": "small" }
  },
  "answer": "C",
  "explanation": "Row 3 mengikuti pola row 1: fill outline, ukuran large."
}
```

**Tipe 4: Mirror / Rotation**
Tampilkan 1 gambar, cari bayangannya dari pilihan.
```json
{
  "type": "mirror",
  "question": "Manakah bayangan cermin dari gambar berikut?",
  "source": { "shape": "arrow", "direction": "right", "fill": "solid", "tail": "double" },
  "options": {
    "A": { "shape": "arrow", "direction": "left",  "fill": "solid",   "tail": "double" },
    "B": { "shape": "arrow", "direction": "right", "fill": "outline", "tail": "double" },
    "C": { "shape": "arrow", "direction": "left",  "fill": "solid",   "tail": "single" },
    "D": { "shape": "arrow", "direction": "up",    "fill": "solid",   "tail": "double" },
    "E": { "shape": "arrow", "direction": "left",  "fill": "outline", "tail": "single" }
  },
  "answer": "A",
  "explanation": "Bayangan cermin membalik arah horizontal: panah kanan menjadi panah kiri."
}
```

#### Shape Library (SVG Primitives)

```typescript
type Shape = 
  | 'circle' | 'square' | 'triangle' | 'diamond' 
  | 'star' | 'pentagon' | 'hexagon' | 'arrow' 
  | 'cylinder' | 'cross'

type Fill = 'outline' | 'solid' | 'half' | 'dotted'

type Inner = 
  | 'circle' | 'star' | 'cross' | 'dot' 
  | 'crescent' | 'triangle' | 'square' | null

type Rotation = 0 | 45 | 90 | 135 | 180 | 225 | 270 | 315

type Size = 'small' | 'medium' | 'large'
```

#### SVG Renderer Component

```typescript
// components/visual/ShapeRenderer.tsx
interface ShapeProps {
  shape: Shape
  fill: Fill
  inner?: Inner
  rotation?: Rotation
  size?: Size
  strokeColor?: string
  fillColor?: string
}

// Render setiap shape sebagai SVG path/primitive
// Transformasi diterapkan via SVG transform="rotate()"
// Inner shape di-overlay di tengah shape utama
```

#### Visual Question Generator (`scripts/generate-visual.ts`)

Generator membuat soal visual secara programatik tanpa AI:

```typescript
function generateOddOneOut(): VisualQuestion {
  // 1. Pilih shape random
  // 2. Tentukan properti "mayoritas" (misal: diamond + outline + crescent)
  // 3. Generate 4 item dengan properti mayoritas
  // 4. Generate 1 item "odd" dengan 1 properti berbeda
  // 5. Shuffle posisi
  // 6. Buat explanation otomatis berdasarkan properti yang berbeda
}

function generateSequence(): VisualQuestion {
  // 1. Pilih shape dan properti yang akan berubah (fill, rotation, inner, count)
  // 2. Generate sequence 3-4 item
  // 3. Generate jawaban benar (item ke-4/5)
  // 4. Generate 4 distractor (mirip tapi salah satu properti berbeda)
}

function generateMatrix(): VisualQuestion {
  // 1. Tentukan pola baris/kolom (shape berubah per kolom, fill berubah per baris)
  // 2. Fill grid 3x3
  // 3. Kosongi 1 cell (biasanya kanan bawah)
  // 4. Generate distractors
}
```

Target bank soal visual: **100 soal** (5x dari 20 soal try out), di-generate via `node scripts/generate-visual.js`.

---

## 6. Fitur Lengkap

### 6.1 Autentikasi

- Register email + password + nama
- Login / Logout
- Lupa password via email reset (Supabase built-in)
- Profile page: nama, target skor, tanggal bergabung
- Tidak ada OAuth di v1

---

### 6.2 Modul Belajar (`/belajar`)

**Halaman Pilih Topik (`/belajar`)**
- Grid 12 kartu topik, dikelompokkan per subtest
- Setiap kartu: nama topik, progress bar (% soal dikerjakan dari bank), badge jumlah soal
- Warna aksen berbeda per subtest (biru Verbal, hijau Kuantitatif, ungu Logika)

**Halaman Drill (`/belajar/[topic]`)**
- Header: nama topik + tombol konfigurasi (jumlah soal: 10/20/30, timer on/off)
- Soal tampil satu per satu
- Visual questions: render SVG dari JSON descriptor
- Setelah pilih jawaban: langsung tampil pembahasan + highlight jawaban benar/salah
- Navigasi bebas (soal berikutnya / sebelumnya)
- Tombol bookmark di setiap soal
- Progress bar atas (soal ke-N dari total)
- Soal diambil random dari bank, tidak mengulang dalam satu sesi

---

### 6.3 Modul Try Out (`/tryout`)

**Halaman List (`/tryout`)**
- Tombol "Mulai Try Out Baru" (prominent, di atas)
- Tabel riwayat: tanggal, skor final, status (Lulus/Belum), durasi, tombol "Lihat Hasil"

**Halaman Sesi Aktif (`/tryout/[sessionId]`)**

Urutan subtest: `Verbal → Kuantitatif → Logika`  
Urutan topik dalam subtest: sesuai urutan resmi UPDA

Setiap subtopik:
- Header: nama topik + nomor soal saat ini + countdown `MM:SS`
- Timer warna: normal → amber (<3 menit) → merah + pulse (<1 menit)
- Soal ditampilkan satu per satu, navigasi bebas
- Panel navigasi bawah: grid nomor soal (putih=belum, biru=sudah dijawab, abu=dilewati)
- Tombol "Selesaikan & Lanjut" dengan modal konfirmasi
- Jika timer habis: auto-submit soal yang sudah dijawab, lanjut otomatis
- Antar subtopik: layar transisi 5 detik ("Subtopik berikutnya: Antonim")

State management sesi (Zustand):
```typescript
interface TryoutSession {
  sessionId: string
  currentSubtest: string
  currentTopic: string
  currentQuestionIndex: number
  answers: Record<questionId, string>  // { "uuid": "A" }
  timeRemaining: number
  status: 'active' | 'transitioning' | 'completed'
}
```

**Halaman Hasil (`/tryout/[sessionId]/hasil`)**

Section 1 — Skor Utama:
- Angka skor besar (200–800), hijau jika ≥475 merah jika <475
- Label "Lulus" / "Belum Lulus"
- Breakdown 3 subtest (Verbal / Kuantitatif / Logika) dalam bar horizontal

Section 2 — Breakdown Per Topik:
- Tabel: nama topik, benar/total, %, skor subtest
- Warna sel % : hijau ≥70%, kuning 50–69%, merah <50%

Section 3 — Post-Test AI Summary (auto-generate):
- Loading state saat Groq sedang proses
- Narasi 3–4 paragraf: apa yang bagus, apa yang perlu diperbaiki, rekomendasi untuk sesi berikutnya
- Data yang dikirim ke Groq: skor per topik, benar/salah per topik, durasi, attempt ke-berapa

Section 4 — Review Soal:
- Filter: "Semua" / "Salah" / "Benar" / per topik
- Setiap soal: teks soal + pilihan + highlight jawaban user vs jawaban benar + pembahasan
- Tombol bookmark di setiap soal

Footer:
- Tombol "Coba Lagi" (mulai session baru)
- Tombol "Kembali ke Dashboard"

---

### 6.4 Dashboard (`/dashboard`)

Dashboard adalah pusat monitoring dan analitik. Semua data diambil dari akumulasi seluruh history tes dan drill.

#### Row 1 — Summary Cards (4 kartu kecil)
- **Skor Terakhir** — angka + perubahan dari sesi sebelumnya (misal: +12 dari sesi ke-4)
- **Total Try Out** — jumlah sesi selesai
- **Total Soal Dikerjakan** — drill + try out gabungan
- **Streak** — berapa hari berturut-turut aktif belajar (dengan ikon api)

#### Row 2 — Skor Trend (chart lebar)
- Line chart: skor final tiap try out (x=sesi ke-N, y=skor 200–800)
- Garis merah horizontal di y=475 sebagai target
- Tooltip: tanggal + skor + detail per subtest saat hover
- Jika belum ada data: empty state dengan ilustrasi

#### Row 3 — Pemahaman Per Subtest (3 gauge/donut kecil)
- **Verbal** — % rata-rata akurasi dari semua try out + drill
- **Kuantitatif** — idem
- **Logika** — idem
- Di bawah tiap gauge: label "Kuat / Perlu Latihan / Lemah"

#### Row 4 — Akurasi Per Topik (bar chart horizontal)
- 12 bar untuk 12 topik, diurutkan dari akurasi terendah ke tertinggi
- Warna: hijau ≥70%, kuning 50–69%, merah <50%
- Sumber data: gabungan semua try out dan drill

#### Row 5 — Kecepatan Rata-rata Per Topik
- Bar chart: rata-rata detik/soal per topik
- Garis referensi: target waktu ideal (15 menit / jumlah soal × 60)
- Bar merah = di atas target (terlalu lambat)

#### Row 6 — AI Overall Analysis
- Tombol "Analisis Menyeluruh" (biru, lebar penuh section)
- Saat diklik: loading state → tampil panel narasi dari Groq
- Data yang dikirim ke Groq: semua metric yang ada di dashboard (skor trend, akurasi per topik, kecepatan, total sesi, streak)
- Output: analisis menyeluruh progress belajar + prioritas topik yang harus difokuskan + estimasi kesiapan ujian
- Hasil di-cache 24 jam (tidak re-generate jika diklik berkali-kali di hari yang sama)

#### Row 7 — Soal yang Paling Sering Salah
- Tabel 5 soal dengan error rate tertinggi across semua sesi
- Kolom: topik, potongan teks soal, % salah, tombol "Pelajari"

---

### 6.5 Bookmark (`/bookmark`)
- List semua soal yang di-bookmark
- Filter per topik dan subtest
- Mode review: kerjakan ulang soal bookmark satu per satu dengan pembahasan
- Tombol hapus bookmark per soal atau bulk

---

## 7. Database Schema

### `profiles`
```sql
id            uuid references auth.users primary key
name          text not null
target_score  integer default 475
created_at    timestamptz default now()
updated_at    timestamptz default now()
```

### `questions`
```sql
id            uuid primary key default gen_random_uuid()
subtest       text not null   -- 'verbal' | 'kuantitatif' | 'logika'
topic         text not null   -- 'sinonim' | 'antonim' | ... | 'visual'
question_type text default 'text'  -- 'text' | 'visual'
-- Untuk soal teks:
question      text
options       jsonb           -- { "A": "...", "B": "...", ... }
answer        text            -- 'A' | 'B' | 'C' | 'D' | 'E'
explanation   text
difficulty    text default 'medium'
-- Untuk soal visual:
visual_data   jsonb           -- JSON descriptor (type, items/grid/sequence, options, answer)
-- Meta:
is_validated  boolean default false
created_at    timestamptz default now()
```

### `tryout_sessions`
```sql
id                  uuid primary key default gen_random_uuid()
user_id             uuid references profiles(id) on delete cascade
status              text default 'in_progress'  -- 'in_progress' | 'completed'
score_verbal        integer
score_kuantitatif   integer
score_logika        integer
score_final         integer
topic_scores        jsonb   -- { "sinonim": 72, "antonim": 64, ... }
topic_accuracy      jsonb   -- { "sinonim": 0.72, "antonim": 0.64, ... }
topic_avg_time      jsonb   -- { "sinonim": 28.5, ... } detik per soal
ai_summary          text    -- post-test summary dari Groq
ai_generated_at     timestamptz
started_at          timestamptz default now()
completed_at        timestamptz
duration_seconds    integer
attempt_number      integer  -- sesi ke berapa untuk user ini
```

### `tryout_answers`
```sql
id              uuid primary key default gen_random_uuid()
session_id      uuid references tryout_sessions(id) on delete cascade
question_id     uuid references questions(id)
user_answer     text    -- null jika tidak dijawab
is_correct      boolean
subtest         text
topic           text
time_spent_sec  integer  -- berapa detik user di soal ini
answered_at     timestamptz
```

### `drill_answers`
```sql
id              uuid primary key default gen_random_uuid()
user_id         uuid references profiles(id) on delete cascade
question_id     uuid references questions(id)
user_answer     text
is_correct      boolean
topic           text
subtest         text
time_spent_sec  integer
answered_at     timestamptz default now()
```

### `bookmarks`
```sql
id              uuid primary key default gen_random_uuid()
user_id         uuid references profiles(id) on delete cascade
question_id     uuid references questions(id)
created_at      timestamptz default now()
unique (user_id, question_id)
```

### `study_streaks`
```sql
user_id         uuid references profiles(id) primary key
current_streak  integer default 0
longest_streak  integer default 0
last_activity   date
```

### `ai_analysis_cache`
```sql
user_id         uuid references profiles(id) primary key
analysis_text   text
generated_at    timestamptz
expires_at      timestamptz  -- generated_at + 24 jam
```

---

## 8. API Routes

### Auth
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/reset-password
GET  /api/auth/me
```

### Questions
```
GET  /api/questions?topic=sinonim&limit=25&exclude=[ids,...]
GET  /api/questions/[id]
POST /api/questions/generate    -- trigger Groq batch generate (seed script)
```

### Try Out
```
POST /api/tryout/start
GET  /api/tryout/[sessionId]
GET  /api/tryout/[sessionId]/questions        -- ambil semua soal sesi
POST /api/tryout/[sessionId]/answer           -- { questionId, answer, timeSpent }
POST /api/tryout/[sessionId]/complete-topic   -- selesaikan 1 subtopik
POST /api/tryout/[sessionId]/complete         -- selesaikan seluruh sesi + hitung skor
GET  /api/tryout/[sessionId]/result           -- hasil + generate AI summary
GET  /api/tryout/history                      -- list semua sesi user
```

### Drill
```
GET  /api/drill/questions?topic=sinonim&limit=10&exclude=[ids]
POST /api/drill/answer    -- { questionId, answer, timeSpent }
```

### Analytics
```
GET  /api/analytics/dashboard   -- semua metric dashboard
GET  /api/analytics/ai-analysis -- ambil/generate overall AI analysis
```

### Bookmarks
```
GET    /api/bookmarks
POST   /api/bookmarks           -- { questionId }
DELETE /api/bookmarks/[id]
```

---

## 9. Groq AI Integration

### 9.1 Generate Soal Teks

```typescript
// lib/groq/generators/[topic].ts

const PROMPTS: Record<string, string> = {
  sinonim: `Buat {count} soal SINONIM untuk UPDA ITB (setara TPA Bappenas S2/S3).
Gunakan kosakata akademik, ilmiah, dan kata serapan yang sering muncul di TPA.
Variasikan tingkat kesulitan: 30% mudah, 50% sedang, 20% sulit.`,

  antonim: `Buat {count} soal ANTONIM untuk UPDA ITB.
Sertakan kata-kata yang memiliki antonim tidak langsung (berlawanan konsep, bukan hanya lawan kata sederhana).`,

  padanan: `Buat {count} soal PADANAN HUBUNGAN KATA untuk UPDA ITB.
Variasikan tipe hubungan: sebab-akibat, bagian-keseluruhan, fungsi, kategori, analogi profesi.`,

  pemahaman_teks: `Buat {count} set soal PEMAHAMAN TEKS untuk UPDA ITB. 
Setiap set: 1 teks (150-250 kata, topik akademik/sains/sosial) + 3-4 pertanyaan pemahaman.
Teks harus padat informasi dan membutuhkan pemahaman mendalam.`,

  aritmetika: `Buat {count} soal ARITMETIKA untuk UPDA ITB.
Topik: pecahan, desimal, persen, eksponen, akar, perbandingan, rata-rata.
PENTING: Setiap soal harus memiliki 1 jawaban yang pasti benar secara matematis.`,

  deret: `Buat {count} soal DERET BILANGAN untuk UPDA ITB.
Variasikan: deret aritmetika, geometri, fibonacci-like, deret ganda, pola interleaved.
Sertakan deret huruf juga (20% dari total).`,

  operasi_matematika: `Buat {count} soal OPERASI MATEMATIKA BERPOLA untuk UPDA ITB.
Format: tabel/matriks bilangan dengan pola tertentu, cari nilai yang kosong.
Pola bisa berupa: operasi baris, operasi kolom, diagonal, atau kombinasi.`,

  analisis_data: `Buat {count} soal ANALISIS DATA / CERITA untuk UPDA ITB.
Topik: perbandingan, kecepatan-jarak-waktu, keuntungan-rugi, probabilitas, persamaan linear.
Tingkat kesulitan: setara soal matematika pascasarjana.`,

  logika_formal: `Buat {count} soal LOGIKA FORMAL (silogisme) untuk UPDA ITB.
Format: premis mayor + premis minor → simpulkan.
Variasikan: semua/sebagian, kondisional, inklusif/eksklusif.`,

  logika_matematika: `Buat {count} soal LOGIKA MATEMATIKA untuk UPDA ITB.
Tipe: perbandingan nilai variabel (x vs y), pernyataan benar/salah, implikasi matematika.`,

  logika_angka: `Buat {count} soal LOGIKA ANGKA / CERITA ANALITIS untuk UPDA ITB.
Tipe: pengurutan, pengelompokan, constraint satisfaction (misal: siapa duduk di mana).`
}

const RESPONSE_FORMAT = `
Return ONLY a valid JSON array. No markdown, no explanation, no backticks.
[
  {
    "question": "teks soal lengkap",
    "options": { "A": "...", "B": "...", "C": "...", "D": "...", "E": "..." },
    "answer": "A",
    "explanation": "penjelasan kenapa jawabannya A, bukan yang lain",
    "difficulty": "easy|medium|hard"
  }
]`
```

### 9.2 Post-Test AI Summary

```typescript
// Dipanggil otomatis setelah try out selesai
// Data dikirim sebagai konteks ke Groq

async function generatePostTestSummary(sessionData: SessionResult): Promise<string> {
  const prompt = `
Kamu adalah tutor TPA/UPDA yang memberikan feedback setelah sesi try out.

DATA TES TERBARU:
- Skor final: ${sessionData.score_final}/800 (target: 475)
- Verbal: ${sessionData.score_verbal} | Kuantitatif: ${sessionData.score_kuantitatif} | Logika: ${sessionData.score_logika}
- Akurasi per topik:
${Object.entries(sessionData.topic_accuracy).map(([t, a]) => `  ${t}: ${Math.round(a * 100)}%`).join('\n')}
- Rata-rata waktu per soal per topik:
${Object.entries(sessionData.topic_avg_time).map(([t, s]) => `  ${t}: ${s}s (target: ${getTargetTime(t)}s)`).join('\n')}
- Ini adalah try out ke-${sessionData.attempt_number}

Berikan feedback dalam 3 paragraf:
1. Apresiasi pencapaian + highlight yang bagus dari sesi ini
2. Identifikasi 2-3 kelemahan spesifik dengan penjelasan konkret
3. Rekomendasi belajar yang actionable untuk sesi berikutnya

Gunakan bahasa Indonesia yang hangat dan memotivasi. Jangan gunakan bullet points.
`
  // ... call Groq API
}
```

### 9.3 Overall AI Analysis

```typescript
// Dipanggil saat user klik tombol di dashboard
// Ambil semua data history dari DB dulu, baru kirim ke Groq

async function generateOverallAnalysis(userId: string): Promise<string> {
  // 1. Cek cache (ai_analysis_cache table)
  // 2. Jika cache valid (<24 jam), return cached result
  // 3. Jika tidak, query semua data dari DB:
  
  const dashboardData = await getDashboardMetrics(userId)
  
  const prompt = `
Kamu adalah konsultan TPA/UPDA yang menganalisis progress belajar secara menyeluruh.

RINGKASAN PROGRESS PENGGUNA:
- Total try out selesai: ${dashboardData.totalSessions}
- Skor tertinggi: ${dashboardData.highestScore}
- Skor rata-rata: ${dashboardData.avgScore}
- Tren skor (dari awal sampai terbaru): ${dashboardData.scoreTrend.join(' → ')}

AKURASI PER TOPIK (rata-rata semua sesi):
${dashboardData.topicAccuracy.map(t => `- ${t.name}: ${t.accuracy}%`).join('\n')}

KECEPATAN PER TOPIK (rata-rata detik/soal):
${dashboardData.topicSpeed.map(t => `- ${t.name}: ${t.avgSec}s (target: ${t.targetSec}s)`).join('\n')}

TOPIK DENGAN ERROR RATE TERTINGGI:
${dashboardData.hardestTopics.map(t => `- ${t.name}: salah ${t.errorRate}% dari semua percobaan`).join('\n')}

Berikan analisis menyeluruh dalam 4-5 paragraf:
1. Gambaran umum progress (apakah menuju target 475?)
2. Kekuatan yang sudah solid
3. Kelemahan yang paling perlu diprioritaskan + alasannya
4. Rekomendasi rencana belajar konkret (topik apa, berapa soal per hari)
5. Estimasi kesiapan ujian berdasarkan tren yang ada

Gunakan bahasa Indonesia yang profesional tapi tidak kaku. Jangan gunakan bullet points.
`
  // ... call Groq, simpan ke cache
}
```

---

## 10. Design System

### Palet Warna
```css
/* Brand Blue */
--blue-50:   #eff6ff
--blue-100:  #dbeafe
--blue-200:  #bfdbfe
--blue-500:  #3b82f6
--blue-600:  #2563eb
--blue-700:  #1d4ed8
--blue-900:  #1e3a8a

/* Neutrals */
--gray-50:   #f9fafb   /* page background */
--gray-100:  #f3f4f6   /* card hover */
--gray-200:  #e5e7eb   /* border */
--gray-400:  #9ca3af   /* placeholder */
--gray-500:  #6b7280   /* secondary text */
--gray-700:  #374151   /* body text */
--gray-900:  #111827   /* heading */
--white:     #ffffff   /* card background */

/* Semantic */
--green-500: #22c55e   /* benar / lulus */
--green-50:  #f0fdf4
--red-500:   #ef4444   /* salah / gagal */
--red-50:    #fef2f2
--amber-500: #f59e0b   /* warning / timer */
--amber-50:  #fffbeb

/* Subtest Accent */
--verbal-color:       #3b82f6   /* biru */
--kuantitatif-color:  #10b981   /* hijau */
--logika-color:       #8b5cf6   /* ungu */
```

### Tipografi
```css
/* Font: Plus Jakarta Sans (heading) + Inter (body) */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@300;400;500;600&display=swap');

--font-heading: 'Plus Jakarta Sans', sans-serif;
--font-body:    'Inter', sans-serif;

/* Scale */
--text-xs:   0.75rem   /* 12px — label, badge */
--text-sm:   0.875rem  /* 14px — secondary */
--text-base: 1rem      /* 16px — body */
--text-lg:   1.125rem  /* 18px — soal text */
--text-xl:   1.25rem   /* 20px — section title */
--text-2xl:  1.5rem    /* 24px — page title */
--text-3xl:  1.875rem  /* 30px — score number */
--text-5xl:  3rem      /* 48px — score besar */
```

### Spacing & Layout
```css
/* Sidebar */
--sidebar-width: 240px

/* Content */
--content-max-width: 1100px
--content-padding:   2rem (32px)

/* Card */
--card-padding:       1.5rem (24px)
--card-radius:        0.75rem (12px)
--card-border:        1px solid var(--gray-200)
--card-shadow:        0 1px 3px rgba(0,0,0,0.06)

/* Button */
--btn-radius:         0.5rem (8px)
--btn-height-md:      40px
--btn-height-lg:      48px
```

### Prinsip Desain
- Background halaman: `gray-50` — tidak murni putih, lebih nyaman untuk baca lama
- Card: putih dengan border tipis `gray-200` dan shadow sangat subtle
- Tidak ada gradien, tidak ada shadow dramatis
- Aksen biru hanya untuk elemen interaktif (tombol primer, link, state aktif)
- Ikon: Lucide React, ukuran 18px untuk body, 20px untuk navigasi
- Tidak ada emoji di UI — gunakan ikon SVG
- Animasi: hanya fade-in dan slide-up subtle (Framer Motion, duration 150–200ms)
- Line-height body: 1.6 untuk kenyamanan baca lama

### Komponen UI Utama

**Sidebar**
- Lebar 240px, `bg-white`, `border-r border-gray-200`
- Logo + nama app di atas (padding 24px)
- Nav items: `icon + label`, highlight biru saat aktif
- User avatar + nama di bawah

**Question Card**
```
┌─────────────────────────────────────┐
│ Soal 12 / 25          [Sinonim]     │  ← nomor + badge topik
├─────────────────────────────────────┤
│                                     │
│  Teks soal di sini...               │  ← text-lg, line-height 1.7
│                                     │
├─────────────────────────────────────┤
│ A  pilihan jawaban                  │  ← option button
│ B  pilihan jawaban                  │
│ C  pilihan jawaban                  │
│ D  pilihan jawaban                  │
│ E  pilihan jawaban                  │
└─────────────────────────────────────┘
```

**Option Button States:**
```
Default:  bg-white    border-gray-200  text-gray-700
Hover:    bg-blue-50  border-blue-200  text-blue-700
Selected: bg-blue-50  border-blue-500  text-blue-800
Correct:  bg-green-50 border-green-500 text-green-800
Wrong:    bg-red-50   border-red-500   text-red-800
```

**Visual Question Layout:**
```
┌─────────────────────────────────────┐
│ Soal 8 / 20      [Logika Visual]    │
├─────────────────────────────────────┤
│  Pada lima gambar berikut,          │
│  manakah yang berbeda?              │
│                                     │
│  [SVG A]  [SVG B]  [SVG C]         │
│  [SVG D]  [SVG E]                  │
│                                     │
│  ○ A    ○ B    ○ C    ○ D    ○ E   │  ← radio buttons
└─────────────────────────────────────┘
```

**Dashboard Monitoring Card:**
```
┌─────────────────────────────────────┐
│ Verbal                 [Subtest]    │
│                                     │
│      ████████░░  72%                │  ← donut / progress
│      ▲ Meningkat dari 68%           │
│                                     │
│  Sinonim     ████░░  65%           │
│  Antonim     ██████  78%           │
│  Padanan     ████░░  68%           │
│  Pem. Teks   ███████ 82%           │
└─────────────────────────────────────┘
```

---

## 11. Struktur Folder

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx               ← sidebar + topbar + auth guard
│   │   ├── dashboard/page.tsx
│   │   ├── belajar/
│   │   │   ├── page.tsx             ← pilih topik
│   │   │   └── [topic]/page.tsx     ← drill session
│   │   ├── tryout/
│   │   │   ├── page.tsx             ← list + start
│   │   │   ├── [sessionId]/
│   │   │   │   ├── page.tsx         ← sesi aktif
│   │   │   │   └── hasil/page.tsx   ← hasil + AI summary
│   │   └── bookmark/page.tsx
│   └── api/
│       ├── auth/
│       │   └── [...route]/route.ts
│       ├── questions/
│       │   ├── route.ts
│       │   └── generate/route.ts
│       ├── tryout/
│       │   ├── start/route.ts
│       │   ├── [sessionId]/
│       │   │   ├── route.ts
│       │   │   ├── questions/route.ts
│       │   │   ├── answer/route.ts
│       │   │   ├── complete-topic/route.ts
│       │   │   ├── complete/route.ts
│       │   │   └── result/route.ts
│       │   └── history/route.ts
│       ├── drill/
│       │   ├── questions/route.ts
│       │   └── answer/route.ts
│       ├── analytics/
│       │   ├── dashboard/route.ts
│       │   └── ai-analysis/route.ts
│       └── bookmarks/
│           ├── route.ts
│           └── [id]/route.ts
│
├── components/
│   ├── ui/                          ← button, card, badge, input, modal, tooltip
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   ├── question/
│   │   ├── QuestionCard.tsx
│   │   ├── OptionButton.tsx
│   │   └── ExplanationBox.tsx
│   ├── visual/                      ← SVG question renderer
│   │   ├── ShapeRenderer.tsx        ← render 1 shape dari descriptor
│   │   ├── VisualQuestion.tsx       ← layout soal visual lengkap
│   │   ├── shapes/                  ← SVG paths per shape
│   │   │   ├── circle.tsx
│   │   │   ├── diamond.tsx
│   │   │   ├── triangle.tsx
│   │   │   ├── star.tsx
│   │   │   ├── arrow.tsx
│   │   │   └── ...
│   │   └── fills/                   ← fill patterns (outline, solid, half)
│   ├── tryout/
│   │   ├── Timer.tsx
│   │   ├── QuestionNav.tsx          ← grid nomor soal
│   │   ├── SubtestTransition.tsx    ← layar transisi antar subtopik
│   │   └── ScoreDisplay.tsx
│   ├── dashboard/
│   │   ├── SummaryCards.tsx
│   │   ├── ScoreTrendChart.tsx      ← recharts line chart
│   │   ├── SubtestGauge.tsx         ← donut chart per subtest
│   │   ├── TopicAccuracyChart.tsx   ← bar chart horizontal
│   │   ├── SpeedChart.tsx
│   │   └── AIAnalysisPanel.tsx
│   └── shared/
│       ├── LoadingSpinner.tsx
│       ├── EmptyState.tsx
│       └── AILoadingCard.tsx        ← skeleton saat Groq loading
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                ← browser client
│   │   └── server.ts                ← server client
│   ├── groq/
│   │   ├── client.ts
│   │   ├── generators/              ← prompt per topik
│   │   └── analyzers/               ← post-test + overall analysis
│   ├── visual/
│   │   ├── generator.ts             ← generate soal visual programatik
│   │   └── validator.ts
│   ├── scoring.ts                   ← kalkulasi skor 200-800
│   └── constants.ts                 ← TOPICS, SUBTESTS, TARGET_TIMES
│
├── stores/
│   └── tryout.store.ts              ← Zustand tryout session state
│
├── types/
│   └── index.ts
│
└── scripts/
    ├── seed-text-questions.ts       ← generate + seed soal teks via Groq
    └── seed-visual-questions.ts     ← generate + seed soal visual programatik
```

---

## 12. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Groq
GROQ_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://upda-itb.vercel.app
NODE_ENV=production
```

---

## 13. Supabase RLS Policies

```sql
-- Profiles
alter table profiles enable row level security;
create policy "Users manage own profile"
  on profiles using (auth.uid() = id);

-- Questions (read-only untuk authenticated users)
alter table questions enable row level security;
create policy "Authenticated users can read questions"
  on questions for select using (auth.role() = 'authenticated');

-- Tryout Sessions
alter table tryout_sessions enable row level security;
create policy "Users manage own sessions"
  on tryout_sessions using (auth.uid() = user_id);

-- Tryout Answers
alter table tryout_answers enable row level security;
create policy "Users manage own answers"
  on tryout_answers using (
    session_id in (
      select id from tryout_sessions where user_id = auth.uid()
    )
  );

-- Drill Answers
alter table drill_answers enable row level security;
create policy "Users manage own drill answers"
  on drill_answers using (auth.uid() = user_id);

-- Bookmarks
alter table bookmarks enable row level security;
create policy "Users manage own bookmarks"
  on bookmarks using (auth.uid() = user_id);

-- AI Analysis Cache
alter table ai_analysis_cache enable row level security;
create policy "Users manage own analysis cache"
  on ai_analysis_cache using (auth.uid() = user_id);
```

---

## 14. Seed Script

```bash
# Jalankan sekali setelah setup Supabase
npx tsx scripts/seed-text-questions.ts    # ~1150 soal teks via Groq
npx tsx scripts/seed-visual-questions.ts  # ~100 soal visual programatik
```

`seed-text-questions.ts` — logic:
1. Loop semua 11 topik teks
2. Generate batch 25 soal per request (Groq rate limit friendly)
3. Validasi soal kuantitatif dengan kalkulasi ulang
4. Insert ke `questions` table dengan `is_validated = true`
5. Retry otomatis jika JSON parse error

`seed-visual-questions.ts` — logic:
1. Generate 25 soal tiap tipe (odd_one_out, sequence, matrix, mirror)
2. Setiap soal di-validate: apakah answer benar secara logika
3. Insert ke `questions` table dengan `question_type = 'visual'`

---

## 15. Deployment Checklist

- [ ] Buat project Supabase baru
- [ ] Jalankan SQL schema (semua CREATE TABLE + RLS)
- [ ] Set env vars di Vercel
- [ ] Deploy ke Vercel
- [ ] Jalankan seed scripts
- [ ] Set Supabase Site URL = URL Vercel
- [ ] Set Supabase Redirect URLs = `https://[app].vercel.app/auth/callback`
- [ ] Test full flow: register → belajar → try out → hasil → dashboard → AI analysis

---

## 16. Out of Scope (v1)

- Leaderboard antar pengguna
- Push notification / reminder
- Mobile app native
- Share hasil ke sosmed
- Video/audio materi
- Multi-bahasa

---

## 17. Estimasi Pengerjaan

| Phase | Scope | Estimasi |
|---|---|---|
| 1 | Setup: Next.js + Supabase + Auth + Schema | 1 hari |
| 2 | Seed: text questions (Groq) + visual generator | 1 hari |
| 3 | SVG Visual Question renderer + shape library | 1.5 hari |
| 4 | Modul Belajar (drill + visual) | 1.5 hari |
| 5 | Modul Try Out (sesi + timer + navigasi) | 2 hari |
| 6 | Halaman Hasil + Post-Test AI Summary | 1 hari |
| 7 | Dashboard + semua charts + Overall AI Analysis | 1.5 hari |
| 8 | Bookmark + polish UI + responsive | 1 hari |
| **Total** | | **~10.5 hari** |

---

*PRD v2.0 — mencakup semua fitur yang disepakati termasuk SVG visual questions, post-test AI summary, overall analysis button di dashboard, dan dashboard monitoring lengkap. Siap untuk Claude Code.*
