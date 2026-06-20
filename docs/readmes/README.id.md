# Truthmark

**Agen Anda menulis kode. Truthmark memelihara dokumentasi yang ditujukan untuk manusia dan dapat ditinjau melalui Git.**

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

![Banner Truthmark](../assets/truthmark-banner.png)

## 🚀 Mulai cepat: berjalan lokal dalam lima menit

Jalankan ini di dalam repositori Git yang ingin Anda kelola dengan Truthmark:

```bash
cd /path/to/your-repo
npm install -g truthmark
truthmark config
```

Aktifkan host AI yang benar-benar Anda gunakan. Konfigurasi baru bersifat netral terhadap host, jadi tambahkan daftar `platforms` tingkat atas ke `.truthmark/config.yml` sebelum inisialisasi:

```yaml
version: 2
platforms:
  - codex        # or: claude-code, github-copilot, opencode, antigravity, cursor
truthmark:
  workspace: docs/truthmark
  generated:
    portal:
      enabled: false
```

Kemudian pasang dokumen kebenaran lokal repositori, perutean, dan permukaan alur kerja agen:

```bash
truthmark init
truthmark check
git diff
```

Sekarang coba jalur adopsi yang paling umum: dokumentasikan satu perilaku yang sudah ada dari kode dan pengujian. Di host pengodean AI Anda, minta alur kerja yang terpasang:

```text
/truthmark-document document the implemented session timeout behavior across src/auth/session.ts and tests/auth/session.test.ts
```

Setelah itu, pengguna biasanya tidak perlu memanggil Truth Sync secara langsung. Teruslah membuat kode melalui host AI Anda; instruksi repositori yang terpasang memberi tahu agen untuk menjalankan pengujian yang relevan dan melakukan tinjauan Truth Sync sebelum serah terima ketika kode fungsional berubah. Anda meninjau diff kode yang dihasilkan beserta diff dokumen truth.

Jika Anda hanya menginginkan validasi CLI dan belum menginginkan alur kerja AI khusus host, biarkan `platforms` tidak dicantumkan dan jalankan `truthmark init && truthmark check`; Anda dapat menambahkan platform nanti dan menjalankan ulang `truthmark init`.

## 💡 Masalah: kesenjangan dokumentasi AI

Agen pengodean AI luar biasa dalam menulis kode dengan cepat. Namun kecepatan ini menciptakan mode kegagalan baru yang berbahaya: **cerita repositori menyimpang dari kenyataan.**

* Perilaku hilang dalam riwayat chat yang sementara.
* Dokumen arsitektur cepat tertinggal.
* Keputusan produk lenyap setelah serah terima.
* Peninjau kode dibiarkan memeriksa diff kode mentah tanpa memahami "mengapa".
* Setiap sesi AI baru dipaksa menemukan ulang kebenaran repositori Anda dari awal.

## 🎯 Solusi: Truthmark

**Truthmark** memasang lapisan alur kerja native Git ke dalam repositori Anda. Ini memperbaiki bagian pengembangan AI yang biasanya rusak: membantu dokumentasi tetap selaras dengan kode.

Alih-alih berharap manusia dan agen AI ingat memperbarui dokumen, Truthmark menjadikan dokumentasi sebagai kebiasaan sistematis dan dapat ditinjau langsung di dalam repositori Anda.

### ✨ Mengapa Truthmark unik

Truthmark bukan sekadar alat dokumentasi lain. Ia terintegrasi mendalam ke dalam alur kerja AI:

* **🚫 Tanpa ketergantungan vendor:** Tidak ada layanan ter-host, tidak ada basis data tersembunyi, tidak ada server tambahan untuk dioperasikan.
* **🌳 100% native Git:** Semuanya hidup di repositori Anda. Kebenaran bergerak bersama branch Anda.
* **🤝 Kontrak yang dimiliki manusia dan diikuti agen:** Pemelihara memiliki kontrak repositori; agen mengikuti instruksi yang terpasang saat membuat kode.
* **✅ Kepercayaan melalui verifikasi:** Pekerjaan AI menjadi lebih mudah dipercaya karena pekerjaan yang mengubah perilaku menyertakan keputusan atau diff dokumen kebenaran yang dapat ditinjau manusia.

## 🔄 Cara kerjanya

Ketika agen AI memodifikasi kode Anda, pekerjaannya belum selesai. Truthmark memasang penjaga alur kerja saat penyelesaian yang diikuti agen sebelum serah terima:

1. 💻 **Kode:** Agen memodifikasi kode fungsional.
2. 🧪 **Uji:** Pengujian yang relevan dijalankan.
3. 🔍 **Periksa:** Truthmark memeriksa dokumentasi yang dipetakan sebagai bagian dari tinjauan akhir yang terpasang.
4. 📝 **Dokumentasikan:** Dokumen diperbarui oleh agen ketika kebenaran repositori berubah.
5. 👀 **Tinjau:** Manusia meninjau *diff kode* + *diff kebenaran*.

## 🛠 Cara Anda berinteraksi dengan Truthmark

Truthmark memiliki satu kontrak lokal repositori dengan dua cara pemakaian.

### Manusia memasang dan memvalidasi kontrak

Pemelihara dan CI menggunakan CLI:

* `truthmark config` - membuat konfigurasi awal.
* `truthmark init` - memasang atau menyegarkan perutean, scaffold dokumen kebenaran, dan instruksi host AI.
* `truthmark check` - memvalidasi kebenaran repositori dari terminal.

### Agen mengikuti kontrak saat membuat kode

Truthmark memasang instruksi lokal repositori untuk host pengodean AI yang didukung seperti Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity, dan Cursor.

Alur normalnya sederhana:

1. Minta agen Anda melakukan perubahan kode, atau minta ia mendokumentasikan perilaku yang sudah ada.
2. Instruksi yang terpasang memberi tahu agen kapan harus menguji, kapan memperbarui dokumen kebenaran, dan kapan berhenti untuk tinjauan manusia.
3. Anda meninjau diff Git biasa: kode plus perubahan dokumen kebenaran apa pun.

Permintaan agen yang dimulai pengguna sengaja dibuat sedikit:

* `/truthmark-document` - mendokumentasikan perilaku terimplementasi yang sudah ada dari kode dan pengujian.
* `/truthmark-realize` - mengimplementasikan kode dari dokumen kebenaran yang sudah ada.
* `/truthmark-check` - mengaudit kebenaran repositori.

Truth Sync bukan cara biasa untuk memulai pekerjaan; itu adalah tinjauan akhir setelah perubahan kode fungsional.
Truth Structure bukan perintah harian; ia memperbaiki perutean atau kepemilikan hanya ketika hal itu memblokir pekerjaan.

## Yang Anda dapatkan

| Kapabilitas | Apa yang dilakukan |
| --- | --- |
| Kebenaran native Git | Menyimpan kebenaran repositori dalam Markdown dan konfigurasi yang di-commit. |
| Dokumentasi berlingkup branch | Kebenaran bergerak bersama branch alih-alih hidup dalam sesi privat. |
| CLI manusia | Memberi pemelihara perintah penyiapan, penyegaran, validasi, dan inspeksi. |
| Kontrak agen terpasang | Memberi agen panduan native host untuk dokumentasi, realisasi, audit, sinkronisasi akhir, dan perbaikan perutean terbatas. |
| Perutean eksplisit | Memetakan area kode ke dokumen kebenaran kanonis. |
| Serah terima yang dapat ditinjau | Menghasilkan diff Git biasa untuk kode maupun dokumen kebenaran. |
| Operasi lokal terlebih dahulu | Tidak membutuhkan layanan ter-host, daemon, basis data, atau server MCP. |
| Batas tulis yang lebih aman | Memisahkan alur kerja code-first, doc-first, read-only, dan doc-only. |
| Validasi | Melaporkan masalah perutean, otoritas, frontmatter, tautan, permukaan yang dihasilkan, cakupan branch, kesegaran, dan coverage. |
| Portal opsional | Menghasilkan situs presentasi HTML statis yang di-commit dari dokumen kebenaran Markdown ketika diaktifkan dan diminta secara eksplisit. |

## Gambaran visual

![Fitur Truthmark](../assets/truthmark-features.png)

**Fitur:** apa yang dipasang Truthmark dan bagaimana permukaan alur kerja dibagi.

![Posisi Truthmark](../assets/truthmark-position.png)

**Posisi:** di mana Truthmark berada relatif terhadap prompt, memori, dan alur kerja spesifikasi.

![Alur sinkronisasi Truthmark](../assets/truthmark-syncflow.png)

**Alur sinkronisasi:** bagaimana Truth Sync menutup perubahan kode normal sebelum serah terima.

## Mengapa tim mengadopsinya

Truthmark ditujukan untuk tim yang sudah tahu bahwa agen AI dapat menghasilkan kode.

Masalah berikutnya adalah tata kelola.

Bukan tata kelola sebagai seremoni. Tata kelola sebagai pertanyaan sederhana:

> Setelah perubahan berbantuan AI ini, apakah repositori masih mengatakan kebenaran?

Truthmark membantu tim menjawabnya dengan file yang di-commit, perutean eksplisit, dan diff yang dapat ditinjau.

Ini berguna saat Anda membutuhkan:

- penyimpangan dokumentasi yang lebih kecil
- serah terima yang lebih baik
- kebenaran produk khusus branch
- dokumentasi arsitektur dan API yang tahan lama
- kepemilikan eksplisit antara dokumen dan kode
- batas tulis agen yang lebih aman
- dokumentasi yang dapat ditinjau alih-alih memori tersembunyi
- alur kerja AI yang tetap bekerja dari file repositori yang di-commit

## Di mana Truthmark cocok

Truthmark tidak menggantikan prompt, memori, spesifikasi, pengujian, atau tinjauan kode.

Ia memberi alur kerja tersebut tempat yang tahan lama untuk mendarat di Git.

| Kebutuhan | Lebih cocok |
| --- | --- |
| Output lebih baik dari satu sesi agen | Prompt yang lebih baik |
| Kontinuitas pribadi atau tingkat sesi | Alat memori |
| Pekerjaan fitur yang dimulai dengan rencana | Alur kerja spesifikasi |
| Truth berlingkup branch yang ikut bersama kode | Truthmark |
| Memvalidasi kebenaran perilaku | Pengujian dan tinjauan |
| Meninjau perubahan dokumentasi berbantuan AI | Truthmark plus tinjauan Git |

Jalur Truthmark sengaja dirancang sempit:

```text
make repository truth explicit
route it to code
memasang panduan agen di sekelilingnya
keep the result reviewable in Git
```

## Pelajari lebih dalam

README adalah etalase: konteks cepat, mulai cepat, dan model mental inti.

Untuk penggunaan per perintah, perbandingan permukaan, detail platform yang didukung, konfigurasi, perutean, Portal, dan contoh, baca [Panduan Pengguna Truthmark](../user-guide.md).

## Status proyek

Rilis saat ini menyediakan:

- perintah CLI lokal untuk config, init, check, index, impact, dan status alur kerja
- instruksi agen lokal repositori yang dihasilkan untuk Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity, dan Cursor
- diagnostik perutean, otoritas, frontmatter, tautan, kesegaran, permukaan yang dihasilkan, cakupan branch, dan coverage
- dokumen kebenaran berlingkup branch dan artefak kecerdasan repositori turunan

## Dokumentasi

- [Panduan pengguna](../user-guide.md)
- [Indeks dokumen](../README.md)
- [Ikhtisar arsitektur](../truthmark/engineering/architecture/overview.md)
- [Kontrak API dan CLI](../truthmark/engineering/contracts/config-route-and-check-contracts.md)
- [Panduan pemeliharaan kebenaran repositori](../standards/maintaining-repository-truth.md)

Untuk perintah pengembangan lokal dan kontribusi, lihat [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Batas desain

Truthmark sengaja kecil: lokal, di-commit, berlingkup branch, dan dapat ditinjau.

Ini bukan layanan ter-host, server MCP, basis data vektor, lapisan memori tersembunyi, produk penegakan CI, atau mesin penulisan ulang kode otonom. Ini membantu kebenaran repositori tetap terlihat; tidak menggantikan pengujian, tinjauan kode, atau penilaian manusia.

## Lisensi

MIT. Lihat [LICENSE](../../LICENSE).
