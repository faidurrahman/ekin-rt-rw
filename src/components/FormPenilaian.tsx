import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Save, RefreshCw, Eye, Image as ImageIcon, ArrowLeft, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { photoStore } from '../store/photoStore';

const indicators = [
  { id: 'I', title: 'Lorong Wisata (Longwis)' },
  { no: '1', parent: 'I', desc: 'Jumlah Lorong Wisata (LONGWIS) yang ditangani oleh masing-masing ketua RT dan dibina oleh ketua RW', vs: 'Dok' },
  { no: '2', parent: 'I', desc: 'Tersedianya bukti dokumentasi foto kondisi dan foto tahapan kegiatan penanganan dan pembinaan lorong wisata mulai 25% hingga 100%', vs: 'Eks', hasImage: true },
  { id: 'II', title: 'Bank Sampah' },
  { no: '1', parent: 'II', desc: 'Berjalannya proses pemilahan sampah rumah tangga', vs: 'KK' },
  { no: '2', parent: 'II', desc: 'Jumlah warga/rumah tangga terdaftar sebagai Nasabah Bank Sampah', vs: 'KK' },
  { id: 'III', title: 'Retribusi Sampah' },
  { no: '1', parent: 'III', desc: 'Menetapkan jumlah target wajib retribusi', vs: 'NPWR' },
  { no: '2', parent: 'III', desc: 'Jumlah capaian pencapaian target retribusi', vs: 'Persen/Bulan', hasImage: true },
  { id: 'IV', title: 'Pajak Bumi dan Bangunan (PBB)' },
  { no: '1', parent: 'IV', desc: 'Tersedianya data objek pajak Bumi & Bangunan (Berdasarkan Lembaran SPPT)', vs: 'NOP' },
  { no: '2', parent: 'IV', desc: 'Jumlah realisasi pencapaian target PBB Tahun Berjalan', vs: 'Persen/Bulan', hasImage: true },
  { id: 'V', title: 'Sombere dan Smart City' },
  { no: '1', parent: 'V', desc: 'Volume pelaksanaan Rapat/Pertemuan setiap bulan', vs: 'Kegiatan' },
  { no: '2', parent: 'V', desc: 'Volume pelaksanaan kerja bakti tiap bulan', vs: 'Kegiatan' },
  { no: '3', parent: 'V', desc: 'Jumlah kelompok pengajian', vs: 'Kelompok' },
  { no: '4', parent: 'V', desc: 'Pelaksanaan pertemuan/rapat kegiatan keagamaan setiap bulan', vs: 'Kegiatan' },
  { no: '5', parent: 'V', desc: 'Terbentuk jadwal ronda', vs: 'Regu' },
  { no: '6', parent: 'V', desc: 'Tingkat Ketaatan Warga terhadap Jadwal Ronda', vs: 'Kegiatan' },
  { id: 'VI', title: 'Buku Administrasi RT dan RW' },
  { no: '1', parent: 'VI', desc: 'Tersedia 8 buku administrasi RT dan RW yang didistribusikan oleh kelurahan', vs: 'Buku' },
  { no: '2', parent: 'VI', desc: 'Jumlah buku dan keaktifan dalam proses pengisian/pencatatan', vs: 'Buku', hasImage: true },
  { id: 'VII', title: 'Deteksi Dini Kerawanan Sosial' },
  { no: '1', parent: 'VII', desc: 'Ketua RT melakukan pemantauan aktivitas warga yang diduga dapat mengganggu ketentraman', vs: 'Kegiatan' },
  { no: '2', parent: 'VII', desc: 'Ketua RT melaporkan hasil pemantauan kepada ketua RW', vs: 'Kegiatan', hasImage: true },
  { no: '3', parent: 'VII', desc: 'Ketua RW melaporkan kepada Walikota Makassar melalui Badan Kesbangpol', vs: 'Laporan' },
  { id: 'VIII', title: 'Data Penduduk Non Permanen' },
  { no: '1', parent: 'VIII', desc: 'Ketua RT melakukan pemantauan terhadap warga yang diduga merupakan warga pendatang', vs: 'Laporan', hasImage: true },
  { no: '2', parent: 'VIII', desc: 'Tersedianya data penduduk non permanen secara akurat', vs: 'Laporan' },
  { id: 'IX', title: 'Deteksi Dini Kerawanan Bencana' },
  { no: '1', parent: 'IX', desc: 'Deteksi potensi terjadinya bencana', vs: 'Laporan' },
  { no: '2', parent: 'IX', desc: 'Memiliki data wilayah rawan bencana', vs: 'Laporan' },
  { no: '3', parent: 'IX', desc: 'Respon aktif terhadap laporan terjadinya bencana', vs: 'Laporan', hasImage: true },
  { no: '4', parent: 'IX', desc: 'Koordinasi dengan pihak terkait untuk penanganan', vs: 'Laporan' },
];

const getVal = (obj: any, possibleKeys: string[]) => {
  if (!obj) return '';
  for (const k of Object.keys(obj)) {
    if (possibleKeys.includes(k.trim().toLowerCase())) return obj[k];
  }
  return '';
};

// Helper for extracting direct view image URLs from Google Drive links
const extractGoogleDriveImages = (text: string) => {
  if (!text) return [];
  const urls: string[] = [];
  
  // Try to find file IDs using various standard G-Drive formats
  const regexFileD = /\/file\/d\/([a-zA-Z0-9_-]+)/g;
  const regexId = /[?&]id=([a-zA-Z0-9_-]+)/g;
  const regexUc = /\/uc\?.*?id=([a-zA-Z0-9_-]+)/g;

  const ids = new Set<string>();
  let match;
  while ((match = regexFileD.exec(text)) !== null) {
    if (match[1]) ids.add(match[1]);
  }
  while ((match = regexId.exec(text)) !== null) {
    if (match[1]) ids.add(match[1]);
  }
  while ((match = regexUc.exec(text)) !== null) {
    if (match[1]) ids.add(match[1]);
  }

  // Convert IDs to direct view links
  Array.from(ids).forEach(id => {
    urls.push(`https://drive.google.com/uc?export=view&id=${id}`);
  });

  // If no IDs were found but it's a URL directly, just return it
  if (urls.length === 0 && text.startsWith('http')) {
     // Maybe it's a direct URL already (though could be a folder)
     // Let's filter out known folder formats just in case? No, we will handle folder URLs separately if needed.
     
     // But wait, the user's issue was that it was a folder URL? "Url gambar saat ini bersumber dari google drive" -> meaning they *upload* an image URL, or a folder URL? "link folder / url foto" in the column.
     // Let's just return the URL itself if it's not a google drive file URL we parsed. Oh wait, if we return it here, it will try to render as <img> block. Let's just return empty array if no files found and handle the folder iframe fallback.
  }

  return urls;
};

export const FormPenilaian = ({ type }: { type: 'RT' | 'RW' }) => {
  const [scores, setScores] = useState<Record<string, { target: string, capaian: string }>>({});
  const [selectedKinerja, setSelectedKinerja] = useState<any>(null);
  
  const handleScoreChange = (itemKey: string, field: 'target' | 'capaian', value: string) => {
    setScores(prev => ({
      ...prev,
      [itemKey]: {
        ...(prev[itemKey] || { target: '', capaian: '' }),
        [field]: value
      }
    }));
  };

  const calculateNilai = (itemKey: string) => {
    const target = parseFloat(scores[itemKey]?.target) || 0;
    const capaian = parseFloat(scores[itemKey]?.capaian) || 0;
    
    if (target > 0 && capaian >= 0) {
      const nilai = Math.round((capaian / target) * 100);
      return nilai > 100 ? 100 : nilai;
    }
    return 0;
  };

  const [periode, setPeriode] = useState('');
  const [dataBerkas, setDataBerkas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterTahun, setFilterTahun] = useState('2026');
  const [filterBulan, setFilterBulan] = useState('');
  const [filterKelurahan, setFilterKelurahan] = useState('');
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadBerkas = async () => {
      const { fetchFromGoogleSheet } = await import('../services/sheetsService');
      
      // Optismistik / Cache dulu biar cepat
      const cached = localStorage.getItem('cache_Data_Berkas');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const filtered = parsed.filter((item: any) => {
            const tipe = getVal(item, ['tipe', 'jabatan', 'tipe/jabatan']);
            return typeof tipe === 'string' && tipe.includes(type);
          });
          if (mounted) {
            setDataBerkas(filtered);
            setLoading(false);
          }
        } catch(e){}
      } else {
        if (mounted) setLoading(true);
      }

      // Background fetch utk data terbaru
      const res = await fetchFromGoogleSheet('Data_Berkas', true);
      if (res.success && mounted) {
        const filtered = res.data.filter((item: any) => {
           const tipe = getVal(item, ['tipe', 'jabatan', 'tipe/jabatan']);
           return typeof tipe === 'string' && tipe.includes(type);
        });
        setDataBerkas(filtered);
      }
      if (mounted) setLoading(false);
    };
    loadBerkas();
    return () => { mounted = false; };
  }, [type]);

  const filteredBerkas = dataBerkas.filter((item) => {
    const timestampStr = getVal(item, ['timestamp', 'tanggal']).toString();
    const periodStr = getVal(item, ['periode']).toString();
    const kelurahanStr = getVal(item, ['kelurahan']).toString();

    let match = true;

    if (filterTahun) {
      try {
        const d = new Date(timestampStr);
        if (!isNaN(d.getTime())) {
          if (d.getFullYear().toString() !== filterTahun) match = false;
        } else if (!timestampStr.includes(filterTahun)) {
          match = false;
        }
      } catch (e) {
        if (!timestampStr.includes(filterTahun)) match = false;
      }
    }

    if (filterBulan && !periodStr.toLowerCase().includes(filterBulan.toLowerCase()) && !timestampStr.toLowerCase().includes(filterBulan.toLowerCase())) {
      match = false;
    }

    if (filterKelurahan && !kelurahanStr.toLowerCase().includes(filterKelurahan.toLowerCase())) {
      match = false;
    }

    return match;
  });

  const handleBukaPenilaian = (berkas: any) => {
    setSelectedKinerja(berkas);
    // Prefill data if needed (scores aren't saved in berkas, so start fresh)
    setScores({});
    setPeriode(berkas.periode || berkas.Periode || '');
  };

  const handleKembali = () => {
    setSelectedKinerja(null);
  };


  const [saving, setSaving] = useState(false);

  const calculateTotalNilai = () => {
    let total = 0;
    Object.keys(scores).forEach(key => {
      total += calculateNilai(key);
    });
    return total;
  };

  const handleSimpan = async () => {
    if (!selectedKinerja) return;
    
    setSaving(true);
    const { saveToGoogleSheet } = await import('../services/sheetsService');
    
    const payload = {
      sheetName: 'Laporan_Kinerja',
      kelurahan: 'KELURAHAN MANGKURA',
      tipe: `Ketua ${type}`,
      nama: selectedKinerja.namaKetua || selectedKinerja['Nama Ketua'] || selectedKinerja.nama || '',
      rw: selectedKinerja.rw || selectedKinerja.RW || '',
      rt: selectedKinerja.rt || selectedKinerja.RT || '',
      nik: selectedKinerja.nik || selectedKinerja.NIK || '',
      periode: periode,
      totalSkorPenilaian: calculateTotalNilai(),
    };

    const res = await saveToGoogleSheet(payload);
    setSaving(false);
    
    if (res.success) {
      alert("Nilai berhasil disimpan!");
      setScores({});
      setPeriode('');
      setSelectedKinerja(null);
    } else {
      alert("Gagal menyimpan data.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {!selectedKinerja ? (
        <>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Daftar Input Kinerja {type}</h2>
              <p className="text-sm text-gray-500 mt-1">Pilih RT/RW yang telah melakukan input kinerja untuk dinilai</p>
            </div>
            <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 bg-white">
              <RefreshCw className="w-4 h-4" />
              Segarkan
            </button>
          </div>

          {/* Section Filter */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 space-y-3 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              {/* Dropdown Tahun */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tahun</label>
                <select 
                  value={filterTahun}
                  onChange={(e) => setFilterTahun(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Semua Tahun</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>

              {/* Dropdown Bulan */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Bulan</label>
                <select 
                  value={filterBulan}
                  onChange={(e) => setFilterBulan(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Semua Bulan</option>
                  <option value="Januari">Januari</option>
                  <option value="Februari">Februari</option>
                  <option value="Maret">Maret</option>
                  <option value="April">April</option>
                  <option value="Mei">Mei</option>
                  <option value="Juni">Juni</option>
                  <option value="Juli">Juli</option>
                  <option value="Agustus">Agustus</option>
                  <option value="September">September</option>
                  <option value="Oktober">Oktober</option>
                  <option value="November">November</option>
                  <option value="Desember">Desember</option>
                </select>
              </div>
            </div>

            {/* Dropdown Kelurahan */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Kelurahan</label>
              <select 
                value={filterKelurahan}
                onChange={(e) => setFilterKelurahan(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Pilih Kelurahan...</option>
                <option value="Baru">Baru</option>
                <option value="Bulogading">Bulogading</option>
                <option value="Lae-Lae">Lae-Lae</option>
                <option value="Lajangiru">Lajangiru</option>
                <option value="Losari">Losari</option>
                <option value="Maloku">Maloku</option>
                <option value="Mangkura">Mangkura</option>
                <option value="Pisang Selatan">Pisang Selatan</option>
                <option value="Pisang Utara">Pisang Utara</option>
                <option value="Sawerigading">Sawerigading</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="py-8 text-center text-slate-500 bg-white border border-gray-200 rounded-xl shadow-sm">Memuat data...</div>
            ) : filteredBerkas.length === 0 ? (
              <div className="py-8 text-center text-slate-500 bg-white border border-gray-200 rounded-xl shadow-sm">Belum ada input kinerja dari {type} yang sesuai filter.</div>
            ) : (
              filteredBerkas.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                  <div className="bg-gray-50 flex text-xs font-bold text-gray-600 p-3 border-b border-gray-200">
                    <div className="w-12 text-center">NO</div>
                    <div className="flex-1">TANGGAL INPUT</div>
                    <div className="w-48 text-right">NAMA / JABATAN</div>
                  </div>
                  <div className="p-3 flex items-center text-sm text-gray-800">
                    <div className="w-12 text-center text-blue-600 font-semibold">{index + 1}</div>
                    <div className="flex-1 text-xs truncate pr-2">
                       {item.Timestamp || item.timestamp || item.Tanggal || item.tanggal || '-'} 
                       <div className="text-gray-500 mt-1">{item.periode || item.Periode || '-'}</div>
                    </div>
                    <div className="w-48 text-right">
                      <div className="font-bold">{item.namaKetua || item['Nama Ketua'] || item.nama || '-'}</div>
                      <div className="text-xs text-gray-500">{item.tipe || item.Tipe || item['Tipe/Jabatan'] || '-'}</div>
                      {item.kelurahan || item.Kelurahan ? (
                        <div className="text-[10px] text-gray-400 mt-1">{item.kelurahan || item.Kelurahan}</div>
                      ) : null}
                    </div>
                  </div>
                  <div className="p-3 bg-white border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => handleBukaPenilaian(item)}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-4 rounded-lg shadow-sm text-sm font-medium transition duration-200 w-full sm:w-auto"
                    >
                      Beri Penilaian
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleKembali} className="h-8 w-8 text-slate-500 hover:text-slate-800">
                <ArrowLeft size={18} />
              </Button>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Penilaian {type}</h2>
                <p className="text-sm text-slate-500">Form isian evaluasi kinerja {type} oleh Lurah</p>
              </div>
            </div>
          </div>

          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="uppercase font-bold text-orange-600 text-sm tracking-wider border-b-2 border-orange-600 pb-1 inline-block">Informasi Penilaian</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label className="text-red-500">Kelurahan *</Label>
                  <Input value={selectedKinerja.kelurahan || selectedKinerja.Kelurahan || "KELURAHAN MANGKURA"} readOnly className="bg-slate-100" />
                </div>
                
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label className="text-red-500">Nama {type} *</Label>
                  <Input value={selectedKinerja.namaKetua || selectedKinerja['Nama Ketua'] || selectedKinerja.nama || ''} readOnly className="bg-slate-100 font-semibold" />
                </div>

                <div className="space-y-2">
                  <Label className="text-red-500">Periode Penilaian *</Label>
                  <Input value={periode} readOnly className="bg-slate-100 font-semibold" />
                </div>
              </div>
            </CardContent>
          </Card>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead className="bg-[#f0ece1] text-xs uppercase font-bold text-slate-700 sticky top-0">
              <tr>
                <th className="py-3 px-2 border-r border-b">NO</th>
                <th className="py-3 px-4 border-r border-b text-left">INDIKATOR PENILAIAN</th>
                <th className="py-3 px-2 border-r border-b w-16">Vol & Sat</th>
                <th className="py-3 px-2 border-r border-b w-20">Target</th>
                <th className="py-3 px-2 border-r border-b w-20">Capaian</th>
                <th className="py-3 px-2 border-r border-b w-20">Nilai</th>
                <th className="py-3 px-2 border-b w-24">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {indicators.map((item, idx) => {
                if (item.id) {
                  return (
                    <tr key={`group-${item.id}`} className="bg-[#fff9eb]">
                      <td className="py-2 px-2 border-r border-b font-bold text-orange-800">{item.id}</td>
                      <td colSpan={6} className="py-2 px-4 border-b font-bold text-orange-800 text-left">
                        {item.title}
                      </td>
                    </tr>
                  );
                }
                
                const itemKey = `${item.parent}-${item.no}`;
                
                return (
                  <tr key={`item-${itemKey}`} className="hover:bg-slate-50">
                    <td className="py-2 px-2 border-r border-b text-slate-600">{item.no}</td>
                    <td className="py-2 px-4 border-r border-b text-left text-slate-700">
                      {item.desc}
                    </td>
                    <td className="py-2 px-2 border-r border-b text-xs text-slate-600">{item.vs}</td>
                    <td className="py-2 px-2 border-r border-b">
                      <Input 
                        type="number" 
                        placeholder="..." 
                        className="h-8 text-center bg-slate-50 border-slate-200" 
                        value={scores[itemKey]?.target || ''}
                        onChange={(e) => handleScoreChange(itemKey, 'target', e.target.value)}
                      />
                    </td>
                    <td className="py-2 px-2 border-r border-b">
                      <Input 
                        type="number" 
                        placeholder="..." 
                        className="h-8 text-center bg-slate-50 border-slate-200" 
                        value={scores[itemKey]?.capaian || ''}
                        onChange={(e) => handleScoreChange(itemKey, 'capaian', e.target.value)}
                      />
                    </td>
                    <td className="py-2 px-2 border-r border-b">
                      <Input 
                        type="text" 
                        value={calculateNilai(itemKey)} 
                        readOnly
                        className="h-8 text-center font-bold text-slate-700 bg-slate-50 border-slate-200" 
                      />
                    </td>
                    <td className="py-2 px-2 border-b">
                      <div className="flex items-center justify-center">
                        <Dialog>
                          <DialogTrigger className="h-8 px-3 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-semibold rounded flex items-center justify-center transition-colors" title="Lihat Bukti Foto/Dok">
                            <ImageIcon size={14} className="mr-1" /> Bukti
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md md:max-w-4xl p-0 flex flex-col h-[80vh] overflow-hidden">
                            <DialogHeader className="p-4 border-b bg-white">
                              <DialogTitle>Bukti Evaluasi: {item.title || item.parent} - {item.no}</DialogTitle>
                            </DialogHeader>
                            <div className="flex-1 w-full bg-slate-100 relative overflow-hidden">
                              {(() => {
                                const url = selectedKinerja['Link Folder / URL Foto'] || selectedKinerja.linkFolderUrlFoto || selectedKinerja['link folder'];
                                const images = extractGoogleDriveImages(url || '');
                                
                                if (images.length > 0) {
                                  return (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 w-full h-full overflow-y-auto">
                                      {images.map((src, i) => (
                                        <img 
                                          key={i} 
                                          src={src} 
                                          alt="Bukti" 
                                          referrerPolicy="no-referrer"
                                          className="w-full h-64 rounded border border-slate-300 shadow-sm object-cover bg-white cursor-pointer hover:opacity-90 transition-opacity" 
                                          onClick={() => setLightboxImg(src)}
                                        />
                                      ))}
                                    </div>
                                  );
                                }

                                let embedUrl = null;
                                if (url) {
                                  const m = url.match(/\/folders\/([a-zA-Z0-9-_]+)/) || url.match(/id=([a-zA-Z0-9-_]+)/);
                                  if (m && m[1]) embedUrl = `https://drive.google.com/embeddedfolderview?id=${m[1]}#grid`;
                                }
                                if (embedUrl) {
                                  return <iframe src={embedUrl} className="w-full h-full border-0 bg-white min-h-[400px]"></iframe>;
                                } else {
                                  return (
                                    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500">
                                      <ImageIcon size={48} className="mx-auto mb-2 opacity-30" />
                                      <p>Link folder Google Drive tidak ditemukan atau formatnya tidak valid.</p>
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="bg-white p-4 border-t">
            <div className="flex flex-col gap-1 font-bold text-sm text-slate-800 mb-6">
                <div className="flex items-center gap-2">
                   <div className="bg-slate-100 px-3 py-1 rounded">INDIKATOR: <span className="text-blue-600">9</span></div>
                   <div className="bg-slate-100 px-3 py-1 rounded">SUB INDIKATOR: <span className="text-blue-600">25</span></div>
                </div>
                <div className="mt-2 text-lg text-emerald-700">
                  TOTAL SKOR PENILAIAN: {calculateTotalNilai()}
                </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm h-9 px-4 disabled:opacity-50"
                  onClick={handleSimpan}
                  disabled={saving}
                >
                   {saving ? 'Menyimpan...' : 'Simpan'}
                </Button>
                <Button variant="destructive" onClick={handleKembali} className="bg-red-500 hover:bg-red-600 text-white rounded-sm h-9 px-4">
                   Kembali
                </Button>
              </div>
            </div>
        </div>
      </div>
      </>
      )}

      {/* Lightbox for Enlarger */}
      {lightboxImg && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 transition-opacity duration-300" 
          onClick={() => setLightboxImg(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all" 
            onClick={() => setLightboxImg(null)}
          >
             <X size={24} />
          </button>
          <img 
            src={lightboxImg} 
            referrerPolicy="no-referrer"
            className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl scale-100 transition-transform duration-300 transform" 
            onClick={(e) => e.stopPropagation()} 
            alt="Bukti Membesar"
          />
        </div>
      )}

    </div>
  );
};
