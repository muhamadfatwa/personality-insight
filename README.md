# Personality Insight — V3.1 + Personality Adventure

Website memiliki dua pengalaman:

1. **Personality Insight**
   - 50 pertanyaan
   - pembacaan sementara setiap 10 pertanyaan
   - hasil kepribadian lengkap

2. **Personality Adventure**
   - cerita interaktif pendek
   - The Forbidden Forest
   - 10 pilihan
   - scoring tersembunyi
   - satu kesimpulan panjang berdasarkan seluruh perjalanan

## File
- index.html
- style.css
- app.js
- data.js

## Menjalankan
Buka `index.html` di browser atau deploy ke GitHub Pages.

Catatan: Personality Insight adalah alat eksplorasi, bukan diagnosis psikologis atau tes MBTI resmi. Personality Adventure dibuat untuk hiburan dan refleksi.


## Ilustrasi Personality Adventure

Aplikasi sekarang mendukung ilustrasi 16:9 untuk setiap scene.

Buat folder:

`images/adventure/`

Lalu masukkan 10 gambar dengan nama:

- `scene-01.png`
- `scene-02.png`
- `scene-03.png`
- `scene-04.png`
- `scene-05.png`
- `scene-06.png`
- `scene-07.png`
- `scene-08.png`
- `scene-09.png`
- `scene-10.png`

Gambar sebaiknya berasio 16:9. Sistem akan otomatis menampilkan gambar sesuai scene. Jika gambar belum ada/gagal dimuat, emoji lama akan menjadi fallback.

## Ilustrasi Adventure
Setiap scene menggunakan gambar 16:9 dari folder `images/adventure/` dengan nama `scene-01.png` sampai `scene-10.png`. Pastikan 10 file ilustrasi dimasukkan ke folder tersebut.

UI adventure sudah dilengkapi badge nomor adegan, transisi gambar, efek hover pilihan, dan tampilan responsif.


## Multi-story Adventure engine
Stories are registered in `app.js` inside `ADVENTURE_STORIES`. An available story needs `id`, `title`, `tag`, `description`, `meta`, `icon`, `cover`, `status:"available"`, and `scenes`. Coming stories can use `status:"coming"` and omit `scenes`.


## Personality Adventure — Story 2

Cerita kedua sudah terintegrasi: **Kota yang Berhenti pada Pukul 03:17**.

Letakkan ilustrasi cerita kedua di `images/adventure/0317/` dengan nama:
`scene-01.png` sampai `scene-10.png`.

Cerita pertama tetap menggunakan `images/adventure/forbidden/scene-01.png` sampai `scene-10.png`.

## Personality Adventure — Story 2

Cerita kedua sudah terintegrasi: **Kota yang Berhenti pada Pukul 03:17**.

Letakkan ilustrasi cerita kedua di `images/adventure/0317/` dengan nama `scene-01.png` sampai `scene-10.png`.

Cerita pertama tetap menggunakan `images/adventure/forbidden/scene-01.png` sampai `scene-10.png`.
