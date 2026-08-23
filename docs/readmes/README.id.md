# Truthmark

**Agen Anda menulis kode. Truthmark menjaga dokumentasi yang ditujukan untuk manusia dan siap ditinjau di Git.**

Truthmark memasang alur kerja native Git yang memungkinkan agen pengodean AI membuat dokumentasi produk dan rekayasa baru dari kode serta pengujian yang sudah ada, menjaganya tetap mutakhir setelah setiap perubahan kode, dan memberikan diff Markdown biasa untuk Anda tinjau.

[![versi npm](https://img.shields.io/npm/v/truthmark?color=cb3837&label=npm)](https://www.npmjs.com/package/truthmark)
[![CI](https://github.com/merlinhu1/truthmark/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/merlinhu1/truthmark/actions/workflows/ci.yml)
[![Lisensi: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![Node.js >=24](https://img.shields.io/badge/node-%3E%3D24-339933?logo=node.js&logoColor=white)](../../package.json)

[Mulai](#mulai-cepat-buat-dokumen-truth-pertama-anda) · [Situs web](https://merlinhu1.github.io/truthmark/) · [Panduan pengguna](https://github.com/merlinhu1/truthmark/blob/main/docs/user-guide.md) · [GitHub](https://github.com/merlinhu1/truthmark)

<details>
<summary>Baca README ini dalam salah satu dari 16 bahasa</summary>

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

</details>

## Buat dokumentasi pertama. Jaga agar tetap benar.

Sebagian besar alat dokumentasi berhenti setelah pembuatan. Truthmark memberi agen siklus hidup dokumentasi lengkap di dalam repositori Anda:

- **Buat dokumentasi baru dari perangkat lunak yang berfungsi.** Truth Document membaca kode dan pengujian, lalu membuat dokumentasi produk atau rekayasa dengan cakupan yang jelas.
- **Jaga dokumentasi tetap selaras secara otomatis.** Truth Sync berjalan saat serah terima agen setelah perubahan kode fungsional dan memperbarui kebenaran repositori sebelum pekerjaan dinyatakan selesai.
- **Ubah dokumentasi kembali menjadi kode.** Truth Realize mengimplementasikan dokumen truth yang disetujui sambil mempertahankan alur kerja doc-first yang rapi.
- **Perbaiki kepemilikan seiring pertumbuhan basis kode.** Truth Structure membuat rute dengan cakupan jelas dan dokumen awal untuk area baru atau yang terlalu luas.
- **Tinjau semuanya di Git.** Kode, keputusan, kontrak, arsitektur, operasi, dan perilaku bergerak bersama branch.

Tanpa basis pengetahuan ter-host. Tanpa memori agen privat. Tanpa dokumentasi yang terjebak dalam riwayat chat.

## Mulai cepat: buat dokumen truth pertama Anda

**Persyaratan:** Node.js 24 atau yang lebih baru, repositori Git, dan host pengodean AI yang didukung untuk alur kerja agen.

Jalankan perintah berikut di dalam repositori yang ingin Anda kelola dengan Truthmark:

```bash
cd /path/to/your-repo
npm install -g truthmark
truthmark init
```

`truthmark init` memungkinkan Anda memilih Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity, Cursor, atau penyiapan antarmuka baris perintah yang netral terhadap host.

Sekarang minta agen yang telah dikonfigurasi untuk mendokumentasikan satu perilaku nyata:

```text
/truthmark-document document the implemented session timeout behavior across src/auth/session.ts and tests/auth/session.test.ts
```

Truth Document membuat dokumen truth baru dengan cakupan jelas jika belum ada, memperbarui pemilik yang sudah ada jika tersedia, dan memperbarui perutean bila diperlukan. Alur ini tidak mengubah kode fungsional.

Tinjau hasilnya:

```bash
truthmark check
git status --short --untracked-files=all
git diff
```

Sekarang Anda akan memiliki:

```text
docs/truthmark/engineering/behaviors/session-timeout.md
docs/truthmark/routes/areas/authentication.md
```

Path yang tepat mengikuti struktur kepemilikan repositori Anda. File baru muncul di `git status`; perubahan pada file yang dilacak muncul di `git diff`.

Cara pemanggilan berbeda menurut host. OpenCode menggunakan `/skill truthmark-document`, Antigravity menggunakan `@truthmark-document`, dan host lain yang didukung menggunakan permukaan skill atau perintah garis miring native masing-masing. Lihat [tabel platform](https://github.com/merlinhu1/truthmark/blob/main/docs/user-guide.md#supported-agent-platforms) untuk perintah yang tepat.

Untuk skrip dan integrasi berkelanjutan, berikan platform yang dipilih secara eksplisit:

```bash
truthmark init --platform codex --platform cursor
truthmark init --json
```

Pilih `none` secara interaktif atau jalankan `truthmark init --clear-platforms` untuk repositori yang netral terhadap host. Anda dapat menambahkan platform agen nanti dengan menjalankan ulang `truthmark init`.

Untuk diagnostik kesegaran relatif terhadap branch, berikan basis Git:

```bash
truthmark check --base <base-ref>
```

## Cara kerja Truthmark

<picture>
  <source media="(max-width: 700px)" srcset="../assets/truthmark-workflow-mobile.svg">
  <img src="../assets/truthmark-workflow.svg" alt="Cara kerja Truthmark" width="1440">
</picture>

Antarmuka baris perintah Truthmark memasang dan memvalidasi kontrak repositori. Agen pengodean Anda melakukan peninjauan bukti dan pekerjaan dokumentasi melalui alur kerja native host yang telah terpasang.

Perubahan kode normal mengikuti satu putaran sederhana:

1. Agen mengubah kode fungsional.
2. Pengujian yang relevan dijalankan.
3. Truth Sync memeriksa dokumentasi yang dipetakan.
4. Agen membuat atau memperbarui dokumentasi dan perutean saat kebenaran repositori berubah.
5. Anda meninjau diff kode dan diff truth secara bersamaan.

## Alur kerja

| Alur kerja           | Gunakan saat                                                              | Hasil                                                                              |
| -------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Truth Document**   | Kode yang sudah ada memerlukan dokumentasi                                | Membuat atau memperbarui dokumentasi produk dan rekayasa berbasis bukti            |
| **Truth Sync**       | Kode fungsional berubah                                                   | Menjaga dokumentasi yang dipetakan dan perutean tetap selaras sebelum serah terima |
| **Truth Structure**  | Area baru memerlukan kepemilikan atau dokumentasi yang ada terlalu luas   | Membuat rute dengan cakupan jelas dan kerangka dokumen awal                        |
| **Truth Realize**    | Dokumen truth yang disetujui harus menjadi perangkat lunak yang berfungsi | Memperbarui kode fungsional dari dokumentasi                                       |
| **Truth Check**      | Kebenaran repositori perlu diaudit                                        | Melaporkan masalah perutean, kepemilikan, bukti, dan dokumentasi                   |
| **Truthmark Portal** | Tim menginginkan situs dokumentasi yang mudah dijelajahi                  | Menghasilkan presentasi HTML statis yang di-commit dari dokumen truth Markdown     |

Truthmark memasang alur kerja ini sebagai permukaan repositori native untuk Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity, dan Cursor.

## Yang Anda dapatkan

### Dokumentasi yang berawal dari kenyataan

Truthmark dapat membuat dokumentasi untuk kapabilitas produk, perilaku implementasi, antarmuka pemrograman aplikasi, arsitektur, alur kerja, operasi, dan pengujian. Kode dan pengujian menyediakan bukti; dokumen Markdown dengan cakupan jelas mempertahankan hasilnya.

### Dokumentasi yang bertahan melewati perubahan berikutnya

Rute menghubungkan area kode ke dokumen kanonis. Saat agen mengubah perilaku, Truth Sync mengetahui tempat kebenaran terkait harus berada dan menjaga serah terima tetap dapat ditinjau.

### Kebenaran produk dan rekayasa di jalur terpisah

Kebenaran produk merekam janji kepada pengguna, batasan, keputusan, dan kriteria penerimaan. Kebenaran rekayasa merekam perilaku saat ini, kontrak, arsitektur, alur kerja, operasi, dan perilaku pengujian.

### Kolaborasi native Git

Semua yang penting berada dalam file repositori yang di-commit. Kebenaran mengikuti branch, bekerja dengan pull request biasa, dan tetap terlihat oleh setiap pemelihara serta agen pengodean.

### Operasi yang mengutamakan lokal

Truthmark tidak memerlukan layanan ter-host, daemon, basis data, penyimpanan vektor, atau server Model Context Protocol. Repositori membawa alur kerja dokumentasinya sendiri.

## Posisi Truthmark

| Kebutuhan                                         | Pilihan terbaik              |
| ------------------------------------------------- | ---------------------------- |
| Output yang lebih baik dari satu sesi agen        | Prompt yang lebih baik       |
| Kontinuitas pribadi atau tingkat sesi             | Alat memori                  |
| Pekerjaan fitur yang dimulai dengan perencanaan   | Alur kerja spesifikasi       |
| Dokumentasi berlingkup branch yang mengikuti kode | **Truthmark**                |
| Kebenaran perilaku                                | Pengujian dan tinjauan kode  |
| Dokumentasi berbantuan AI yang dapat ditinjau     | **Truthmark + tinjauan Git** |

Truthmark dibuat untuk pemelihara dan tim rekayasa yang sudah menggunakan agen pengodean AI dan ingin repositori terus menyampaikan kebenaran secepat kode berubah.

## Host yang didukung dan baris perintah

Host agen yang didukung:

- Codex
- Claude Code
- GitHub Copilot
- OpenCode
- Antigravity
- Cursor

<details>
<summary>Referensi baris perintah</summary>

| Perintah                                                          | Tujuan                                                                                                   |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `truthmark init`                                                  | Membuat atau menyegarkan konfigurasi, perutean, template, dan alur kerja host yang dipilih               |
| `truthmark check [--base <ref>]`                                  | Memvalidasi kebenaran repositori dan secara opsional menjalankan diagnostik kesegaran branch             |
| `truthmark index --json`                                          | Memeriksa metadata turunan repositori dan perutean                                                       |
| `truthmark impact --base <ref> --json`                            | Memetakan file yang berubah ke dokumentasi, pemilik, dan pengujian terdekat                              |
| `truthmark workflow status --workflow <id> [--base <ref>] --json` | Memeriksa penerapan dan target alur kerja                                                                |
| `truthmark validate ...`                                          | Memvalidasi laporan alur kerja dan sewa penulisan                                                        |
| `truthmark uninstall --dry-run\|--apply`                          | Meninjau atau menghapus permukaan host yang dihasilkan sambil mempertahankan truth yang ditulis pengguna |

Output JSON terstruktur tersedia di seluruh antarmuka baris perintah untuk skrip dan integrasi berkelanjutan.

</details>

## Pelajari lebih lanjut

- [Panduan pengguna Truthmark](https://github.com/merlinhu1/truthmark/blob/main/docs/user-guide.md)
- [Indeks dokumentasi](https://github.com/merlinhu1/truthmark/blob/main/docs/README.md)
- [Ikhtisar arsitektur](https://github.com/merlinhu1/truthmark/blob/main/docs/truthmark/engineering/architecture/overview.md)
- [Kontrak konfigurasi, perutean, dan perintah](https://github.com/merlinhu1/truthmark/blob/main/docs/truthmark/engineering/contracts/config-route-and-check-contracts.md)
- [Berkontribusi](https://github.com/merlinhu1/truthmark/blob/main/CONTRIBUTING.md)

**Pasang Truthmark, pilih host pengodean Anda, dan ubah satu perilaku nyata menjadi dokumentasi hari ini.**

## Lisensi

MIT. Lihat [LICENSE](../../LICENSE).
