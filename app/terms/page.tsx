import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Syarat Layanan', description: 'Syarat layanan DonghuaWatch.' };

export default function Page() {
  return (
    <LegalPage title="Syarat Layanan" updated="15 November 2026">
      <section>
        <p>Dengan memakai DonghuaWatch, kamu menyetujui syarat berikut.</p>
      </section>
      <section>
        <h2>Penggunaan</h2>
        <ul>
          <li>Layanan disediakan apa adanya, tanpa jaminan ketersediaan atau kelengkapan konten.</li>
          <li>Dilarang menyalahgunakan layanan, termasuk spam, menyerang server, atau mengotomatisasi akses secara berlebihan.</li>
        </ul>
      </section>
      <section>
        <h2>Komentar</h2>
        <ul>
          <li>Kamu bertanggung jawab atas komentar yang kamu tulis.</li>
          <li>Kami dapat menghapus komentar yang melanggar aturan, berisi spam, atau menyinggung.</li>
        </ul>
      </section>
      <section>
        <h2>Premium</h2>
        <ul>
          <li>Premium menghilangkan iklan pada akun Google yang didaftarkan selama masa aktifnya.</li>
          <li>Pembelian dilakukan manual melalui WhatsApp. Premium yang sudah diaktifkan tidak dapat dipindahkan ke akun lain.</li>
        </ul>
      </section>
      <section>
        <h2>Hak cipta</h2>
        <p>Konten video dan gambar adalah milik pemegang hak ciptanya masing-masing. Pemilik hak cipta yang ingin mengajukan permintaan penghapusan dapat menghubungi kami.</p>
      </section>
      <section>
        <h2>Perubahan</h2>
        <p>Syarat ini dapat berubah sewaktu-waktu. Penggunaan layanan setelah perubahan berarti kamu menyetujuinya.</p>
      </section>
      <section>
        <h2>Kontak</h2>
        <p>WhatsApp: +62 821-7926-668</p>
      </section>
    </LegalPage>
  );
}
