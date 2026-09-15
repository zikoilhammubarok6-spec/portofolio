# Ziko Ilham Mubarok — Interactive Portfolio

Portfolio statis futuristik dengan HTML5, CSS3, JavaScript Vanilla, Three.js, dan WebGL. Hero section memakai `SphereGeometry` sebagai Bumi 3D, texture permukaan realistis, normal/specular map, cloud layer, atmosphere, lighting, dan stars. Three.js menggunakan CDN versi `0.159.0` yang kompatibel dengan browser script klasik.

## Struktur

```text
portfolio/
├── index.html
├── style.css
├── script.js
├── README.md
└── assets/
    ├── images/
    └── icons/
```

Folder `assets` menyimpan texture Earth lokal agar deployment static tidak bergantung pada CORS atau server texture eksternal:

- `assets/images/earth/earth_atmos_2048.jpg`, `earth_normal_2048.jpg`, `earth_specular_2048.jpg`, dan `earth_clouds_1024.png`
- Sumber: [Three.js examples textures](https://github.com/mrdoob/three.js/tree/dev/examples/textures/planets)
- Three.js examples textures didistribusikan dalam repository Three.js; cek lisensi repository sebelum redistribusi atau mengganti texture.

## Menjalankan

Jalankan dengan **Local Server**, bukan dengan dobel-klik `index.html`:

- VS Code: klik kanan `index.html` lalu pilih **Open with Live Server**.
- Terminal: `npx serve .` atau `python -m http.server 8000`, lalu buka `http://localhost:8000`.

Saat file dibuka langsung lewat `file://`, browser berbasis Chromium (Edge maupun Chrome) menandai gambar lokal sebagai cross-origin sehingga texture Bumi **tidak bisa** dipakai sebagai WebGL texture. Script mendeteksi hal ini, menampilkan pesan di console (`[Earth] ... texture failed to load.`) serta toast di halaman, lalu mengganti permukaan Bumi dengan texture prosedural (laut biru, benua hijau, dan tudung es) agar bola Bumi tetap terlihat seperti planet. Koneksi internet tetap diperlukan untuk CDN Three.js, fonts, dan icons.

### Bumi terlihat polos / bukan Bumi asli

Bumi dengan permukaan prosedural (blob laut dan benua, tanpa awan) berarti texture asli gagal dimuat. Cek urutan berikut:

1. Pastikan halaman dijalankan dari `http://localhost` (Live Server), bukan `file://`.
2. Cek tab Console (F12) untuk pesan `[Earth] ... texture failed to load.`
3. Pastikan file `assets/images/earth/*.jpg` dan `*.png` ada dan tidak berubah nama.
4. Texture gagal dimuat tidak memunculkan fallback WEBGL; fallback itu hanya untuk WebGL yang benar-benar tidak tersedia.

## Interaksi Earth

- Desktop: mouse position memberi tilt halus, drag memutar, wheel melakukan zoom, dan double-click mengembalikan rotasi serta zoom awal.
- Mobile: swipe/drag memutar, pinch zoom, dan halaman tetap dapat discroll karena gesture hanya aktif pada canvas.
- Sensor: pada browser yang membutuhkan permission, tombol **Enable Motion** meminta akses melalui user gesture. Browser lain mengaktifkan Device Orientation bila tersedia, dengan kalibrasi awal, pemetaan alpha/beta/gamma tiga-sumbu, clamp, smoothing, dan fallback touch/mouse bila sensor tidak tersedia atau ditolak.
- WebGL hanya menampilkan fallback bila context benar-benar tidak tersedia atau renderer gagal dibuat. Kegagalan texture dicatat dengan `console.error`, lalu permukaan diganti texture prosedural tanpa menyamarkan kegagalan WebGL.
- Rendering dipause ketika tab tidak aktif, pixel ratio dibatasi, dan `prefers-reduced-motion` dihormati.

## Kustomisasi

Ganti placeholder kontak di `index.html`, data project di bagian atas `script.js`, dan warna pada `:root` di `style.css`. Link project saat ini menampilkan notifikasi karena belum ada URL publik.

## Deploy

Tidak ada build step atau backend. Upload folder ini ke repository GitHub lalu aktifkan GitHub Pages dari branch utama. Folder yang sama juga dapat di-drag ke Netlify atau dipakai sebagai static deployment di Vercel.
