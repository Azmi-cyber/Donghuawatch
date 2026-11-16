# DonghuaWatch

Situs nonton donghua subtitle Indonesia. Dibuat dengan Next.js 14 (App Router), TypeScript, dan Tailwind CSS, dengan tampilan neobrutalism abu-abu dan emas. Siap di-deploy ke Vercel.

Situs: https://donghuawatch.web.id

## Fitur

- Beranda, ongoing, completed, terbaru, jadwal rilis, genre, daftar A-Z, dan daftar per musim
- Pencarian dengan riwayat pencarian terakhir
- Halaman detail: sinopsis, genre, daftar episode, dan rekomendasi
- Halaman nonton: pilihan server, daftar episode berbentuk kotak nomor, link download per kualitas, dan komentar
- Riwayat tontonan yang disimpan di browser
- Login Google (opsional)
- Komentar per episode, wajib login untuk menulis
- Akun Premium tanpa iklan, diaktifkan admin lewat panel khusus
- Tampilan responsif untuk HP dan desktop

## Teknologi

- Next.js 14 dan React 18
- TypeScript
- Tailwind CSS
- NextAuth v4 (Google OAuth)
- Upstash Redis lewat REST API, untuk komentar dan data Premium
- lucide-react dan sonner

## Menjalankan di lokal

Butuh Node.js 18.17 atau lebih baru (disarankan 20).

```bash
npm install
cp .env.example .env.local
npm run dev
```

Buka http://localhost:3000. Untuk mengecek build produksi:

```bash
npm run build
npm start
```

## Environment variable

| Nama | Wajib | Keterangan |
|------|-------|------------|
| `NEXT_PUBLIC_API_BASE` | Tidak | Base URL API sumber data. Bawaan: `https://www.sankavollerei.web.id/anime` |
| `GOOGLE_CLIENT_ID` | Untuk login | Client ID OAuth dari Google Cloud |
| `GOOGLE_CLIENT_SECRET` | Untuk login | Client secret OAuth |
| `NEXTAUTH_SECRET` | Untuk login | String acak. Buat dengan `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Untuk login | URL situs, mis. `https://donghuawatch.web.id` (tanpa garis miring di akhir) |
| `UPSTASH_REDIS_REST_URL` | Untuk komentar dan Premium | URL REST database Upstash. Nama `KV_REST_API_URL` juga dibaca |
| `UPSTASH_REDIS_REST_TOKEN` | Untuk komentar dan Premium | Token REST Upstash. Nama `KV_REST_API_TOKEN` juga dibaca |
| `ADMIN_EMAILS` | Untuk panel admin | Email admin, pisahkan dengan koma |

Tanpa database Upstash, komentar dan data Premium hanya disimpan di memori server dan hilang saat server restart. Cukup untuk mencoba di lokal, tidak untuk produksi.

## Deploy ke Vercel

1. Push repo ke GitHub.
2. Di Vercel pilih **Add New > Project** dan impor repo ini.
3. Isi environment variable di atas (environment Production).
4. Deploy. Setelah mengubah env, lakukan **Redeploy** agar nilainya terpakai.

## Login Google

1. Di [Google Cloud Console](https://console.cloud.google.com/), buka **APIs & Services > Credentials** dan buat **OAuth client ID** bertipe *Web application*.
2. Isi **Authorized JavaScript origins**: `https://domainmu`
3. Isi **Authorized redirect URIs**: `https://domainmu/api/auth/callback/google`
   (untuk lokal tambahkan `http://localhost:3000` dan `http://localhost:3000/api/auth/callback/google`)
4. Salin Client ID dan secret ke environment variable.
5. Di bagian OAuth consent screen, isi nama aplikasi, domain, dan tautan `/privacy` serta `/terms`, lalu ubah status ke *In production*.

## Komentar

Komentar disimpan per episode dan hanya bisa ditulis oleh akun yang login.

- Maksimal 500 karakter, tanpa link
- Satu komentar per 10 detik untuk setiap akun
- 200 komentar terbaru disimpan per episode
- Pengguna hanya bisa menghapus komentarnya sendiri

Kode ada di `app/api/comments/route.ts` dan `lib/commentStore.ts`.

## Premium dan iklan

Akun Premium tidak melihat iklan. Pembelian dilakukan manual lewat WhatsApp, lalu admin mengaktifkannya.

- Halaman beli: `/premium`
- Panel admin: `/admin/premium` (hanya email di `ADMIN_EMAILS`). Admin memasukkan email Google pembeli dan memilih durasi: 5 hari, 1 bulan, 3 bulan, 6 bulan, atau 1 tahun. Kalau akun masih aktif, durasi baru disambung dari tanggal habisnya.
- Harga, paket, dan nomor WhatsApp diatur di `lib/premium.ts`
- Pengaturan iklan (link iklan klik dan jedanya) ada di `components/AdScripts.tsx`
- Deteksi adblock ada di `components/AdblockWall.tsx`

## Cara kerja data

Browser tidak memanggil API sumber secara langsung. Semua permintaan lewat route di server:

- `/api/proxy/*` meneruskan request ke API sumber dengan timeout 15 detik dan cache 60 detik
- `/api/image?url=...` mengambil poster dengan header yang sesuai, dengan cache 1 hari dan gambar pengganti bila gagal

Bentuk JSON dari API sumber bisa berbeda-beda, jadi semua pembacaan data dikumpulkan di `lib/parse.ts`. Kalau ada bagian yang kosong di tampilan, buka `/debug?path=donghua/home/1` untuk melihat respons mentahnya, lalu tambahkan nama field yang benar di fungsi parser terkait.

| Gejala | Fungsi yang diubah di `lib/parse.ts` |
|---|---|
| Kartu tanpa judul, poster, atau slug | `normalizeItem()` |
| Beranda kosong | `parseHome()` |
| Pagination tidak muncul | `parsePagination()` |
| Detail: sinopsis, genre, daftar episode | `parseDetail()`, `parseEpisodes()` |
| Video tidak muncul | `parseStreams()` |
| Link download kosong | `parseDownloads()` |
| Tombol sebelumnya/berikutnya salah | `parseEpisodePage()` |
| Jadwal kosong | `parseSchedule()` |

Slug di sumber data kadang berubah. `smartDetail()` di `lib/api.ts` mencoba slug asli, beberapa varian, slug dari halaman episode, lalu mencari lewat judul. Slug yang berhasil disimpan di browser dan URL otomatis dikoreksi.

## Struktur folder

```
app/            halaman dan route API (proxy, image, auth, comments, premium, admin)
components/     komponen UI (navbar, kartu, pemutar, komentar, modal, dsb.)
lib/            api, parser, context, hook, penyimpanan komentar dan premium
public/         logo
```

## SEO

`app/sitemap.ts` dan `app/robots.ts` menghasilkan `/sitemap.xml` dan `/robots.txt`. Daftarkan situs di Google Search Console lalu kirim sitemap-nya.

## Catatan

- Konten video dan gambar berasal dari pihak ketiga dan milik pemegang hak ciptanya masing-masing.
- Riwayat tontonan tersimpan di browser (localStorage) dan tidak tersinkron antar perangkat.
- Halaman `/debug` hanya alat bantu pengembangan. Matikan atau batasi sebelum dipakai publik.
