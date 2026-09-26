// Konten halaman legal (syarat, privasi, refund, kontak).
// Dipakai oleh src/app/legal/[slug]/page.tsx

export const LEGAL_UPDATED = '26 September 2026'

// WAJIB diisi sebelum submit verifikasi merchant DOKU.
// Placeholder dalam kurung siku sengaja dibiarkan terlihat di halaman
// supaya ketahuan kalau belum diisi.
export const CONTACT = {
  operator: 'Moch Rizaldy Firmansyah',
  email: 'rizaldysukun5@gmail.com',
  whatsapp: '085755963542',
  address: 'Jl. Cipamokolan No.50, Cipamokolan, Kec. Rancasari, Kota Bandung, Jawa Barat 40292',
  hours: 'Senin–Jumat, 09.00–17.00 WIB',
}

export type LegalSection = {
  heading: string
  paragraphs?: string[]
  list?: string[]
}

export type LegalDoc = {
  slug: string
  title: string
  description: string
  intro: string
  sections: LegalSection[]
}

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: 'syarat-ketentuan',
    title: 'Syarat & Ketentuan',
    description: 'Ketentuan penggunaan layanan Belajar TPA.',
    intro:
      'Dengan membuat akun atau menggunakan layanan Belajar TPA, Anda dianggap telah membaca, memahami, dan menyetujui syarat dan ketentuan berikut.',
    sections: [
      {
        heading: '1. Tentang Layanan',
        paragraphs: [
          'Belajar TPA adalah platform edukasi berbasis web yang menyediakan latihan soal dan simulasi ujian untuk persiapan Tes Potensi Akademik (TPA). Layanan diakses melalui browser dan bersifat sepenuhnya digital, tanpa pengiriman barang fisik.',
          'Belajar TPA merupakan layanan persiapan mandiri dan tidak berafiliasi, bekerja sama, maupun mendapat endorsement dari institusi penyelenggara ujian mana pun. Soal yang disediakan merupakan materi latihan dan bukan soal ujian yang sesungguhnya.',
          'Kami tidak menjanjikan kelulusan atau pencapaian skor tertentu pada ujian yang Anda ikuti. Hasil yang diperoleh bergantung pada usaha dan kondisi masing-masing pengguna.',
        ],
      },
      {
        heading: '2. Akun Pengguna',
        paragraphs: [
          'Untuk menggunakan layanan, Anda perlu membuat akun dengan alamat email yang aktif dan valid. Anda bertanggung jawab menjaga kerahasiaan kata sandi serta seluruh aktivitas yang terjadi pada akun Anda.',
          'Satu akun diperuntukkan bagi satu orang pengguna. Akun tidak boleh dipinjamkan, dibagikan, atau diperjualbelikan kepada pihak lain.',
          'Kami berhak menangguhkan atau menghapus akun yang terbukti melanggar ketentuan ini, tanpa pengembalian dana atas sisa masa langganan.',
        ],
      },
      {
        heading: '3. Langganan dan Pembayaran',
        paragraphs: [
          'Kami menyediakan paket gratis dengan fitur terbatas serta paket berbayar dengan periode bulanan dan tahunan. Rincian fitur dan harga yang berlaku tercantum pada halaman harga di situs kami.',
          'Pembayaran diproses melalui penyedia jasa pembayaran pihak ketiga. Seluruh harga yang tercantum dinyatakan dalam Rupiah dan sudah termasuk pajak apabila berlaku.',
          'Akses ke fitur berbayar diaktifkan secara otomatis setelah pembayaran terkonfirmasi, dan berlaku sampai tanggal berakhirnya masa langganan.',
        ],
      },
      {
        heading: '4. Perpanjangan dan Pembatalan',
        paragraphs: [
          'Masa langganan berakhir pada tanggal yang tertera di akun Anda. Setelah masa tersebut berakhir dan tidak diperpanjang, akun secara otomatis kembali ke paket gratis.',
          'Anda dapat berhenti berlangganan kapan saja. Penghentian berlaku untuk periode berikutnya, sedangkan masa langganan yang sudah dibayar tetap dapat digunakan sampai habis.',
          'Data belajar, riwayat try out, dan progres Anda tetap tersimpan meskipun akun kembali ke paket gratis.',
        ],
      },
      {
        heading: '5. Hak Kekayaan Intelektual',
        paragraphs: [
          'Seluruh materi dalam platform, termasuk soal, pembahasan, tampilan antarmuka, dan perangkat lunaknya, merupakan milik Belajar TPA dan dilindungi hukum yang berlaku.',
          'Materi hanya boleh digunakan untuk keperluan belajar pribadi. Anda dilarang menyalin, menyebarluaskan, memperbanyak, atau memperjualbelikan materi tersebut tanpa izin tertulis dari kami.',
        ],
      },
      {
        heading: '6. Penggunaan yang Dilarang',
        list: [
          'Membagikan akses akun kepada pihak lain.',
          'Mengambil, menyalin, atau mengunduh materi secara massal, termasuk dengan bantuan program otomatis.',
          'Mencoba mengakses sistem, data pengguna lain, atau bagian layanan yang bukan hak Anda.',
          'Mengganggu, membebani, atau merusak kelangsungan operasional layanan.',
          'Menggunakan layanan untuk tujuan yang melanggar hukum yang berlaku di Indonesia.',
        ],
      },
      {
        heading: '7. Batasan Tanggung Jawab',
        paragraphs: [
          'Layanan disediakan sebagaimana adanya. Kami berupaya menjaga agar platform dapat diakses dan berjalan dengan baik, namun tidak menjamin layanan bebas sepenuhnya dari gangguan, kesalahan sistem, atau pemeliharaan terjadwal.',
          'Kami tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan maupun ketidakmampuan menggunakan layanan. Tanggung jawab kami dibatasi maksimal sebesar biaya langganan yang telah Anda bayarkan untuk periode berjalan.',
        ],
      },
      {
        heading: '8. Perubahan Ketentuan',
        paragraphs: [
          'Kami dapat memperbarui syarat dan ketentuan ini sewaktu-waktu, misalnya ketika ada perubahan fitur atau ketentuan harga. Versi terbaru akan selalu dimuat pada halaman ini beserta tanggal pembaruannya.',
          'Penggunaan layanan setelah pembaruan diberlakukan dianggap sebagai persetujuan Anda terhadap ketentuan yang baru.',
        ],
      },
      {
        heading: '9. Hukum yang Berlaku',
        paragraphs: [
          'Syarat dan ketentuan ini tunduk pada hukum Republik Indonesia. Setiap perselisihan akan diupayakan penyelesaiannya secara musyawarah terlebih dahulu sebelum ditempuh jalur hukum.',
        ],
      },
    ],
  },
  {
    slug: 'kebijakan-privasi',
    title: 'Kebijakan Privasi',
    description: 'Bagaimana Belajar TPA mengumpulkan, menggunakan, dan melindungi data Anda.',
    intro:
      'Kebijakan ini menjelaskan data apa saja yang kami kumpulkan saat Anda menggunakan Belajar TPA, untuk apa data tersebut digunakan, dan bagaimana kami menjaganya.',
    sections: [
      {
        heading: '1. Data yang Kami Kumpulkan',
        paragraphs: ['Kami hanya mengumpulkan data yang diperlukan agar layanan dapat berjalan:'],
        list: [
          'Data akun: nama dan alamat email yang Anda isi saat mendaftar.',
          'Data belajar: jawaban latihan, hasil try out, skor, akurasi, kecepatan pengerjaan, dan soal yang Anda tandai.',
          'Data langganan: status paket dan tanggal berakhirnya masa langganan.',
          'Data teknis: alamat IP dan informasi perangkat yang tercatat otomatis oleh sistem demi keamanan layanan.',
        ],
      },
      {
        heading: '2. Data Pembayaran',
        paragraphs: [
          'Kami tidak menyimpan nomor kartu, data rekening, maupun kredensial pembayaran Anda. Seluruh proses pembayaran ditangani langsung oleh penyedia jasa pembayaran berlisensi, dan kami hanya menerima notifikasi berisi status pembayaran untuk mengaktifkan langganan Anda.',
        ],
      },
      {
        heading: '3. Penggunaan Data',
        list: [
          'Menyediakan dan menjalankan fitur belajar serta try out.',
          'Menampilkan perkembangan skor dan analisis hasil belajar Anda.',
          'Mengaktifkan dan mengelola status langganan.',
          'Mengirim informasi penting terkait akun atau layanan.',
          'Menjaga keamanan layanan dan mencegah penyalahgunaan.',
        ],
      },
      {
        heading: '4. Layanan Pihak Ketiga',
        paragraphs: [
          'Agar layanan dapat berjalan, kami menggunakan penyedia pihak ketiga berikut: layanan basis data dan autentikasi untuk menyimpan data akun serta riwayat belajar, layanan hosting untuk menjalankan situs, penyedia layanan kecerdasan buatan untuk menghasilkan analisis hasil belajar, serta penyedia jasa pembayaran untuk memproses transaksi.',
          'Pada fitur analisis hasil belajar, data yang dikirim berupa ringkasan performa seperti skor, akurasi, dan kecepatan pengerjaan. Kami tidak mengirimkan nama, email, atau identitas pribadi Anda ke layanan tersebut.',
          'Kami tidak menjual, menyewakan, atau memperdagangkan data pribadi Anda kepada pihak mana pun.',
        ],
      },
      {
        heading: '5. Keamanan Data',
        paragraphs: [
          'Seluruh koneksi ke layanan kami dienkripsi melalui HTTPS. Kata sandi disimpan dalam bentuk terenkripsi dan tidak dapat kami lihat. Akses ke data dibatasi sehingga setiap pengguna hanya dapat membuka data miliknya sendiri.',
          'Meski demikian, tidak ada sistem yang sepenuhnya kebal. Kami mendorong Anda menggunakan kata sandi yang kuat dan tidak membagikannya kepada siapa pun.',
        ],
      },
      {
        heading: '6. Penyimpanan Data',
        paragraphs: [
          'Data Anda disimpan selama akun masih aktif. Apabila Anda meminta penghapusan akun, data pribadi Anda akan dihapus, kecuali catatan transaksi yang wajib kami simpan untuk keperluan pembukuan dan kepatuhan hukum.',
        ],
      },
      {
        heading: '7. Hak Anda',
        list: [
          'Meminta salinan data pribadi yang kami simpan.',
          'Memperbaiki data akun yang tidak akurat.',
          'Meminta penghapusan akun beserta data pribadi Anda.',
          'Menarik persetujuan atas pemrosesan data dengan menghentikan penggunaan layanan.',
        ],
      },
      {
        heading: '8. Cookie',
        paragraphs: [
          'Kami menggunakan cookie seperlunya untuk menjaga sesi login Anda tetap aktif. Kami tidak menggunakan cookie untuk iklan maupun pelacakan lintas situs.',
        ],
      },
      {
        heading: '9. Perubahan Kebijakan',
        paragraphs: [
          'Kebijakan ini dapat diperbarui sewaktu-waktu. Versi terbaru akan selalu dimuat pada halaman ini beserta tanggal pembaruannya.',
        ],
      },
    ],
  },
  {
    slug: 'kebijakan-refund',
    title: 'Kebijakan Refund',
    description: 'Ketentuan pengembalian dana untuk langganan Belajar TPA.',
    intro:
      'Kami ingin Anda puas menggunakan layanan ini. Berikut ketentuan pengembalian dana yang berlaku untuk pembelian paket berlangganan Belajar TPA.',
    sections: [
      {
        heading: '1. Ketentuan Umum',
        paragraphs: [
          'Produk yang kami jual berupa akses digital yang aktif seketika setelah pembayaran terkonfirmasi. Pengajuan pengembalian dana dapat disampaikan paling lambat 7 (tujuh) hari kalender sejak tanggal pembayaran.',
        ],
      },
      {
        heading: '2. Kondisi yang Dapat Dikembalikan',
        list: [
          'Terjadi pembayaran ganda untuk paket yang sama.',
          'Pembayaran berhasil dipotong, namun akses paket berbayar tidak aktif dan tidak dapat kami perbaiki.',
          'Terdapat gangguan teknis dari sisi kami yang membuat layanan tidak dapat digunakan dan tidak berhasil diselesaikan dalam waktu wajar.',
        ],
      },
      {
        heading: '3. Kondisi yang Tidak Dapat Dikembalikan',
        list: [
          'Pengajuan disampaikan lebih dari 7 hari sejak tanggal pembayaran.',
          'Fitur berbayar telah digunakan secara signifikan, misalnya telah mengerjakan try out penuh atau latihan soal dalam jumlah besar.',
          'Perubahan keputusan pribadi setelah layanan digunakan, termasuk alasan tidak sempat belajar.',
          'Hasil ujian tidak sesuai harapan, karena layanan ini bersifat sarana latihan dan tidak menjanjikan skor tertentu.',
          'Akun ditangguhkan akibat pelanggaran Syarat & Ketentuan.',
        ],
      },
      {
        heading: '4. Cara Mengajukan',
        paragraphs: [
          `Kirim permohonan ke ${CONTACT.email} dengan mencantumkan alamat email akun, tanggal pembayaran, bukti pembayaran, serta alasan pengajuan.`,
          'Kami akan meninjau dan memberikan tanggapan dalam 3 (tiga) hari kerja sejak permohonan lengkap diterima.',
        ],
      },
      {
        heading: '5. Waktu Proses',
        paragraphs: [
          'Apabila pengajuan disetujui, dana dikembalikan ke metode pembayaran yang sama dengan saat transaksi dilakukan. Proses pengembalian memerlukan waktu 7–14 hari kerja, tergantung kebijakan bank atau penyedia jasa pembayaran.',
          'Akses ke paket berbayar akan dinonaktifkan bersamaan dengan disetujuinya pengembalian dana.',
        ],
      },
      {
        heading: '6. Pembatalan Langganan',
        paragraphs: [
          'Anda dapat berhenti berlangganan kapan saja. Pembatalan menghentikan penagihan pada periode berikutnya, dan tidak membatalkan pembayaran periode yang sedang berjalan. Akses tetap dapat digunakan sampai masa langganan berakhir.',
        ],
      },
    ],
  },
  {
    slug: 'kontak',
    title: 'Kontak',
    description: 'Hubungi tim Belajar TPA.',
    intro:
      'Ada pertanyaan seputar layanan, langganan, atau pembayaran? Silakan hubungi kami melalui kanal berikut.',
    sections: [
      {
        heading: 'Informasi Kontak',
        list: [
          `Nama usaha: ${CONTACT.operator}`,
          `Email: ${CONTACT.email}`,
          `WhatsApp: ${CONTACT.whatsapp}`,
          `Alamat: ${CONTACT.address}`,
          `Jam operasional: ${CONTACT.hours}`,
        ],
      },
      {
        heading: 'Waktu Tanggapan',
        paragraphs: [
          'Pesan yang masuk kami tanggapi paling lambat 1 (satu) hari kerja. Pesan yang diterima di luar jam operasional akan diproses pada hari kerja berikutnya.',
        ],
      },
      {
        heading: 'Bantuan Terkait Pembayaran',
        paragraphs: [
          'Untuk kendala pembayaran atau pengajuan pengembalian dana, sertakan alamat email akun, tanggal transaksi, dan bukti pembayaran agar proses penanganan lebih cepat.',
        ],
      },
    ],
  },
]

export function getLegalDoc(slug: string): LegalDoc | undefined {
  return LEGAL_DOCS.find((doc) => doc.slug === slug)
}
