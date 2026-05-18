import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || Object(import.meta.env).GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

export async function analyzeLaporan(data: any) {
  const prompt = `
Kamu adalah Sistem Pakar Analis Kinerja dan Retribusi Kecamatan Ujung Pandang. Tugas kamu adalah mengevaluasi kinerja RT/RW berdasarkan laporan berjenjang (9 Indikator Kota Makassar).

[DATA IDENTITAS]
- Kelurahan: ${data.kelurahan}
- Nomor RT / RW: ${data.rtRw}
- Nama Ketua RT/RW: ${data.namaKetua}
- Periode Laporan: ${data.periode}

[9 INDIKATOR KINERJA RT/RW]
1. Lorong Wisata (Longwis) / Ketahanan Pangan: ${data.longwis}
2. Bank Sampah: ${data.bankSampah}
3. Retribusi Sampah (Target: ${data.targetRetribusi}, Realisasi: ${data.realisasiRetribusi})
4. Pajak Bumi dan Bangunan (PBB) (Target: ${data.targetPbb}, Realisasi: ${data.realisasiPbb})
5. Sombere & Smart City: ${data.sombere}
6. Buku Administrasi RT/RW: ${data.bukuAdm}
7. Data Penduduk Non-Permanen: ${data.dataPenduduk}
8. Deteksi Dini Kerawanan Sosial: ${data.kerawananSosial}
9. Deteksi Dini Kerawanan Bencana: ${data.kerawananBencana}

[INSTRUKSI OUTPUT]
Berdasarkan data dan lampiran di atas, buatlah analisis yang terbagi menjadi 3 bagian:

--- BAGIAN 1: VERIFIKASI DOKUMEN & EVIDENS ---
1. Validasi Bukti Fifik: Evaluasi kelengkapan dan relevansi foto-foto yang diunggah untuk ke-9 indikator. Masing-masing foto harus sesuai dengan deskripsinya.
2. Validasi Retribusi & PBB: Apakah nominal / realisasi yang diinput sesuai dengan bukti foto? (Berikan status: VALID / TIDAK VALID / PERLU KLARIFIKASI).

--- BAGIAN 2: LAPORAN EVALUASI UNTUK CAMAT/LURAH ---
1. Analisis Indikator Keuangan (Retribusi & PBB): Jabarkan tingkat persentase capaian dan defisit jika ada.
2. Skor Kinerja Non-Fisik: Berikan nilai rata-rata (1-100) berdasarkan kualitas indikator lingkungan, sosial, dan administrasi.
3. Area Peningkatan: Sebutkan indikator mana yang paling lemah dan berikan 2 rekomendasi konkret.

--- BAGIAN 3: JSON STRUCTURE UNTUK DASHBOARD IBU CAMAT ---
Hasilkan kode JSON murni dengan blok \`\`\`json (serta properti sesuai format di bawah) agar data ini bisa langsung ditampilkan di Dashboard Kecamatan. Gunakan struktur berikut:
\`\`\`json
{
  "unit_kerja": "RT_RW_ID",
  "kelurahan": "NAMA_KELURAHAN",
  "financial_stats": {
    "percentage": 0,
    "payment_status": "STATUS_VALIDASI"
  },
  "performance_stats": {
    "score_avg": 0,
    "status_lingkungan": "BAIK/CUKUP/KURANG",
    "evidence_completeness": "LENGKAP/TIDAK LENGKAP PADA INDIKATOR X"
  },
  "executive_summary": "1 kalimat ringkasan (Sumbangsih RT/RW terhadap kebersihan, PBB, & kerawanan)"
}
\`\`\`
`;

  // Filter out any null parts
  const parts: any[] = [prompt];
  
  if (data.fotoLongwis) parts.push(data.fotoLongwis);
  if (data.fotoBankSampah) parts.push(data.fotoBankSampah);
  if (data.fotoRetribusi) parts.push(data.fotoRetribusi);
  if (data.fotoPbb) parts.push(data.fotoPbb);
  if (data.fotoSombere) parts.push(data.fotoSombere);
  if (data.fotoBukuAdm) parts.push(data.fotoBukuAdm);
  if (data.fotoDataPenduduk) parts.push(data.fotoDataPenduduk);
  if (data.fotoKerawananSosial) parts.push(data.fotoKerawananSosial);
  if (data.fotoKerawananBencana) parts.push(data.fotoKerawananBencana);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: parts,
      config: {
        maxOutputTokens: 2048,
        temperature: 0.2,
      }
    });

    return response.text;
  } catch (error) {
    console.error('Error analyzing data:', error);
    throw error;
  }
}
