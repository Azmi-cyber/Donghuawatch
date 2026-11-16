import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Kebijakan Privasi', description: 'Kebijakan privasi DonghuaWatch.' };

export default function Page() {
  return (
    <LegalPage title="Kebijakan Privasi" updated="15 November 2026">
      <section>
        <p>DonghuaWatch (&quot;kami&quot;) beroperasi di https://donghuawatch.web.id. Halaman ini menjelaskan data apa yang kami kumpulkan dan bagaimana kami menggunakannya.</p>
      </section>
      <section>
        <h2>Data yang kami kumpulkan</h2>
        <ul>
          <li><b>Login Google (opsional):</b> alamat email, nama, dan foto profil dari akun Google kamu. Kami tidak mengakses data Google lain seperti Drive, Kontak, atau Gmail.</li>
          <li><b>Komentar:</b> isi komentar, nama, foto profil, dan waktu komentar, yang tampil publik di halaman episode.</li>
          <li><b>Status Premium:</b> email akun yang memiliki Premium beserta tanggal berakhirnya.</li>
          <li><b>Statistik pengunjung:</b> ID acak anonim yang disimpan di browser untuk menghitung jumlah pengunjung unik. Kami tidak menyimpan alamat IP atau data pribadi untuk statistik ini.</li>
          <li><b>Penyimpanan di browser:</b> riwayat tontonan, pencarian terakhir, pilihan server, dan penghitung iklan, yang tersimpan di perangkatmu (localStorage) dan tidak dikirim ke server kami.</li>
        </ul>
      </section>
      <section>
        <h2>Cara kami menggunakan data</h2>
        <ul>
          <li>Mengidentifikasi akunmu agar bisa berkomentar dan menggunakan Premium.</li>
          <li>Menampilkan dan menghapus komentarmu.</li>
          <li>Menyembunyikan iklan untuk akun Premium.</li>
        </ul>
        <p className="mt-2">Kami tidak menjual data pribadimu.</p>
      </section>
      <section>
        <h2>Iklan dan pihak ketiga</h2>
        <p>Situs ini menampilkan iklan dari jaringan iklan pihak ketiga, yang dapat memakai cookie atau teknologi serupa untuk menayangkan iklan. Pemutar video dan data konten berasal dari penyedia pihak ketiga yang memiliki kebijakan privasinya sendiri. Login memakai layanan Google OAuth.</p>
      </section>
      <section>
        <h2>Penyimpanan dan penghapusan</h2>
        <p>Komentar dan data Premium disimpan sampai dihapus. Kamu dapat menghapus komentarmu sendiri kapan saja. Untuk meminta penghapusan data akunmu, hubungi kami lewat kontak di bawah.</p>
      </section>
      <section>
        <h2>Anak-anak</h2>
        <p>Layanan ini tidak ditujukan untuk anak di bawah 13 tahun.</p>
      </section>
      <section>
        <h2>Kontak</h2>
        <p>WhatsApp: +62 821-7926-668</p>
      </section>
    </LegalPage>
  );
}
