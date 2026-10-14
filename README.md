# Timer Panggung

Aplikasi web untuk menampilkan sisa waktu sesi dan keterangan di layar iPad, supaya mudah dibaca pengisi acara di panggung dari jarak jauh. Dibuat untuk iPad Gen 8, tanpa framework dan tanpa proses build.

## Fitur

- Daftar sesi: nama, durasi (menit dan detik), dan keterangan untuk panggung.
- Input mudah: tombol − / +, pilihan cepat (1, 3, 5, 10, 15, 20, 30, 45, 60 menit), dan ketik langsung.
- Angka sisa waktu sangat besar, tetap terbaca dari jauh.
- Warna otomatis: normal, kuning (menipis), merah (hampir habis), merah berkedip dengan tanda `+` (waktu lewat).
- Kontrol operator: Mulai/Jeda, ±1 menit, sesi berikutnya/sebelumnya, ulang sesi, sembunyikan tombol.
- Presisi: waktu dihitung dari jam sistem (`Date.now()`), bukan dari hitungan interval, sehingga tidak melenceng.
- Layar dijaga tetap menyala (Screen Wake Lock) selama timer tampil.
- Data sesi tersimpan di perangkat (`localStorage`).
- Bisa dibuka tanpa internet setelah kunjungan pertama (service worker).

## Struktur folder

```
timer-panggung/
├── index.html            Halaman utama (pengaturan + layar panggung)
├── css/style.css         Tampilan
├── js/app.js             Logika timer, pengaturan, dan pendaftaran service worker
├── sw.js                 Service worker (mode offline)
├── manifest.webmanifest  Metadata aplikasi untuk Layar Utama
├── icons/                Ikon aplikasi (svg + png 180/192/512)
├── vercel.json           Pengaturan hosting Vercel
├── README.md             Dokumentasi ini
├── LICENSE               Lisensi MIT
└── .gitignore
```

## Cara menjalankan di komputer

Buka `index.html` langsung di browser untuk mencoba. Fitur offline (service worker) hanya aktif lewat `https://` atau `localhost`. Untuk mencobanya secara lokal:

```bash
python3 -m http.server 8000
# buka http://localhost:8000
```

## Deploy ke GitHub dan Vercel

1. Buat repository baru di GitHub, misalnya `timer-panggung`.
2. Upload seluruh isi folder ini (halaman repo → **Add file → Upload files**, drag semua file dan folder, lalu **Commit changes**). Pastikan `index.html` berada di root repo, bukan di dalam sub-folder.
3. Buka [vercel.com](https://vercel.com), pilih **Add New → Project**, lalu import repo tadi.
4. Biarkan semua pengaturan default (Framework Preset: *Other*, tanpa Build Command), klik **Deploy**.
5. Setiap kali kamu mengubah file di GitHub, Vercel otomatis deploy ulang.

## Pasang di iPad

1. Buka link Vercel di **Safari**. Tunggu sampai halaman termuat penuh (ini sekaligus menyimpan versi offline).
2. Tekan tombol **Bagikan** → **Tambah ke Layar Utama**.
3. Buka dari ikon di Layar Utama. Aplikasi tampil layar penuh tanpa bilah Safari.
4. Atur **Pengaturan → Layar & Kecerahan → Kunci Otomatis → Tidak Pernah**, dan sambungkan pengisi daya selama acara.
5. Putar iPad ke mode landscape.

## Cara pakai saat acara

1. Isi semua sesi di layar pengaturan, lalu tekan **Mulai Acara**.
2. Tekan **Mulai** saat pembicara naik panggung.
3. Tekan **Berikutnya** untuk pindah sesi. Timer berikutnya tidak jalan otomatis, jadi operator yang menentukan kapan mulai.
4. Tekan **Sembunyikan** agar layar bersih untuk panggung. Titik tiga samar di pojok kanan bawah memunculkan tombol lagi.
5. Tekan **Edit** untuk kembali ke daftar sesi.

## Mengubah pengaturan

| Yang ingin diubah | Lokasi |
| --- | --- |
| Batas waktu kuning/merah | Fungsi `draw()` di `js/app.js` (variabel `warn` dan `dang`) |
| Warna dan ukuran huruf | `css/style.css` (variabel `:root` dan blok `#run`) |
| Pilihan cepat durasi | Array `[1,3,5,10,...]` di fungsi `renderSetup()` |

**Penting:** setelah mengubah file apa pun, naikkan `VERSION` di `sw.js` (misalnya `v1` → `v2`). Kalau tidak, iPad bisa tetap memakai versi lama yang tersimpan di cache.

## Catatan teknis

- Screen Wake Lock butuh iPadOS 16.4 ke atas. Jika iPad belum mendukung, andalkan pengaturan Kunci Otomatis di atas.
- Data sesi tersimpan per perangkat dan per browser. Data tidak ikut pindah ke iPad lain.
- Jika layar iPad sempat terkunci saat timer berjalan, waktu tetap akurat karena dihitung dari jam sistem.
- Tidak ada suara alarm. Peringatan hanya berupa warna dan kedipan.

## Lisensi

MIT, lihat file `LICENSE`.
