#Praktikum AVR Pertemuan 3: Input dan Objek Interaction (WebXR)

Folder ini berisi implementasi interaksi objek 3D menggunakan WebXR dan Three.js [cite: 1], termasuk implementasi fitur pengayaan interaksi objek.

##Informasi Kelompok
* **Nama Kelompok:** [Augmented duo]
* **Anggota Kelompok:**
  1. [Syadila Ayu Luthfiyyah | 2409020064]
  2. [Tegar Raya Harahap | 2409020069]

## Tabel Uji Fungsional

| No | Skenario Uji | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|--------------|------------------------|--------------|--------|
| 1 | Buka halaman di browser | Scene dan 3 objek utama tampil, tombol ENTER VR muncul[cite: 11] | Berjalan Normal | Lulus |
| 2 | Masuk sesi XR | Controller dan garis sinar tampil[cite: 11] | Berjalan Normal | Lulus |
| 3 | Arahkan sinar ke objek | Objek menyala redup (hover)[cite: 11] | Berjalan Normal | Lulus |
| 4 | Tekan dan tahan trigger pada objek | Objek ikut controller (grab)[cite: 11] | Berjalan Normal | Lulus |
| 5 | Lepas trigger | Objek tetap di posisi terakhir (release)[cite: 11] | Berjalan Normal | Lulus |
| 6 | Tekan grip pada objek | Warna objek berubah (squeeze)[cite: 11] | Berjalan Normal | Lulus |
| 7 | Geser thumbstick (Sumbu Y) saat objek digenggam | Skala objek berubah, dibatasi 0,3 sampai 3 kali[cite: 11] | Berjalan Normal | Lulus |
| 8 | Klik objek dengan mouse (desktop) | Warna objek berubah[cite: 11] | Berjalan Normal | Lulus |
| 9 | **[Pengayaan 1] Drop Zone** | Saat objek dilepas di atas area transparan lantai, warna area berubah menjadi hijau dan tercatat di log | Berjalan Normal | Lulus |
| 10 | **[Pengayaan 2] Rotasi Objek** | Geser thumbstick (Sumbu X / `gp.axes[2]`) saat memegang objek untuk memutar rotasinya | Berjalan Normal | Lulus |
| 11 | **[Pengayaan 3] Reset Scene** | Menekan tombol controller (`gp.buttons[4]`) mengembalikan seluruh objek ke posisi dan bentuk awal | Berjalan Normal | Lulus |
| 12 | **[Pengayaan 4] Tambah Objek** | Menampilkan 3 objek baru dengan geometri berbeda (Cylinder, Torus, Dodecahedron) dan semuanya interaktif | Berjalan Normal | Lulus |
