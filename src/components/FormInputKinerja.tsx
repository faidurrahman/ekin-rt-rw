import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Save, Image as ImageIcon, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { photoStore } from '../store/photoStore';
import { saveToGoogleSheet, fetchFromGoogleSheet } from '../services/sheetsService';
import { compressImageBlob } from '../lib/imageCompressionHelper';

const indicators = [
  { id: 'I', title: 'Lorong Wisata (Longwis)' },
  { no: '1', parent: 'I', desc: 'Jumlah Lorong Wisata (LONGWIS) yang ditangani oleh masing-masing ketua RT dan dibina oleh ketua RW', vs: 'Dok' },
  { no: '2', parent: 'I', desc: 'Tersedianya bukti dokumentasi foto kondisi dan foto tahapan kegiatan penanganan dan pembinaan lorong wisata mulai 25% hingga 100%', vs: 'Eks' },
  { id: 'II', title: 'Bank Sampah' },
  { no: '1', parent: 'II', desc: 'Berjalannya proses pemilahan sampah rumah tangga', vs: 'KK' },
  { no: '2', parent: 'II', desc: 'Jumlah warga/rumah tangga terdaftar sebagai Nasabah Bank Sampah', vs: 'KK' },
  { id: 'III', title: 'Retribusi Sampah' },
  { no: '1', parent: 'III', desc: 'Menetapkan jumlah target wajib retribusi', vs: 'NPWR' },
  { no: '2', parent: 'III', desc: 'Jumlah capaian pencapaian target retribusi', vs: 'Persen/Bulan' },
  { id: 'IV', title: 'Pajak Bumi dan Bangunan (PBB)' },
  { no: '1', parent: 'IV', desc: 'Tersedianya data objek pajak Bumi & Bangunan (Berdasarkan Lembaran SPPT)', vs: 'NOP' },
  { no: '2', parent: 'IV', desc: 'Jumlah realisasi pencapaian target PBB Tahun Berjalan', vs: 'Persen/Bulan' },
  { id: 'V', title: 'Sombere dan Smart City' },
  { no: '1', parent: 'V', desc: 'Volume pelaksanaan Rapat/Pertemuan setiap bulan', vs: 'Kegiatan' },
  { no: '2', parent: 'V', desc: 'Volume pelaksanaan kerja bakti tiap bulan', vs: 'Kegiatan' },
  { no: '3', parent: 'V', desc: 'Jumlah kelompok pengajian', vs: 'Kelompok' },
  { no: '4', parent: 'V', desc: 'Pelaksanaan pertemuan/rapat kegiatan keagamaan setiap bulan', vs: 'Kegiatan' },
  { no: '5', parent: 'V', desc: 'Terbentuk jadwal ronda', vs: 'Regu' },
  { no: '6', parent: 'V', desc: 'Tingkat Ketaatan Warga terhadap Jadwal Ronda', vs: 'Kegiatan' },
  { id: 'VI', title: 'Buku Administrasi RT dan RW' },
  { no: '1', parent: 'VI', desc: 'Tersedia 8 buku administrasi RT dan RW yang didistribusikan oleh kelurahan', vs: 'Buku' },
  { no: '2', parent: 'VI', desc: 'Jumlah buku dan keaktifan dalam proses pengisian/pencatatan', vs: 'Buku' },
  { id: 'VII', title: 'Deteksi Dini Kerawanan Sosial' },
  { no: '1', parent: 'VII', desc: 'Ketua RT melakukan pemantauan aktivitas warga yang diduga dapat mengganggu ketentraman', vs: 'Kegiatan' },
  { no: '2', parent: 'VII', desc: 'Ketua RT melaporkan hasil pemantauan kepada ketua RW', vs: 'Kegiatan' },
  { no: '3', parent: 'VII', desc: 'Ketua RW melaporkan kepada Walikota Makassar melalui Badan Kesbangpol', vs: 'Laporan' },
  { id: 'VIII', title: 'Data Penduduk Non Permanen' },
  { no: '1', parent: 'VIII', desc: 'Ketua RT melakukan pemantauan terhadap warga yang diduga merupakan warga pendatang', vs: 'Laporan' },
  { no: '2', parent: 'VIII', desc: 'Tersedianya data penduduk non permanen secara akurat', vs: 'Laporan' },
  { id: 'IX', title: 'Deteksi Dini Kerawanan Bencana' },
  { no: '1', parent: 'IX', desc: 'Deteksi potensi terjadinya bencana', vs: 'Laporan' },
  { no: '2', parent: 'IX', desc: 'Memiliki data wilayah rawan bencana', vs: 'Laporan' },
  { no: '3', parent: 'IX', desc: 'Respon aktif terhadap laporan terjadinya bencana', vs: 'Laporan' },
  { no: '4', parent: 'IX', desc: 'Koordinasi dengan pihak terkait untuk penanganan', vs: 'Laporan' },
];

export const FormInputKinerja = ({ type }: { type: 'RT' | 'RW' }) => {
  const [, setForceRender] = useState({});

  const KELURAHAN_OPTIONS = [
    "Baru", "Bulogading", "Lae-Lae", "Lajangiru", "Losari",
    "Maloku", "Mangkura", "Pisang Selatan", "Pisang Utara", "Sawerigading"
  ];

  const userRole = localStorage.getItem('userRole') || 'Admin';
  const initialKelurahan = localStorage.getItem('userKelurahan') || 'Mangkura';
  
  const isAdmin = userRole === 'Admin' || userRole === 'Pimpinan';

  const currentUsername = localStorage.getItem('username') || '';
  const [isLockedKetua, setIsLockedKetua] = useState(false);

  const [kelurahan, setKelurahan] = useState(isAdmin ? '' : initialKelurahan.replace('KELURAHAN ', ''));
  const [namaKetua, setNamaKetua] = useState('');
  const [periode, setPeriode] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [dataRTRW, setDataRTRW] = useState<any[]>([]);

  const [notification, setNotification] = useState<{show: boolean, type: 'success' | 'error', title: string, message: string} | null>(null);

  useEffect(() => {
    // Apabila role bukan admin dan default value nya 'Tidak Ada / Kecamatan', maka fallback ke Mangkura (atau di set oleh admin)
    // Walaupun user Kelurahan harusnya sdh di set sesuai kelurahannya
    if (!isAdmin && kelurahan === 'Tidak Ada / Kecamatan') {
        setKelurahan('');
    }
  }, [isAdmin, kelurahan]);

  useEffect(() => {
    if (!isLockedKetua) {
      setNamaKetua('');
    }
  }, [kelurahan, isLockedKetua]);

  useEffect(() => {
    const loadListNama = async () => {
      const res = await fetchFromGoogleSheet('DataRTRW');
      if (res.success) {
        setDataRTRW(res.data);
        
        // Auto-select and lock if NIK matches username
        const match = res.data.find((r: any) => {
           const nik = r.nik || r.NIK || "";
           const jabatan = r.jabatan || r.Jabatan || r.JABATAN || "";
           return String(nik) === currentUsername && jabatan.toUpperCase().includes(type.toUpperCase());
        });
        
        if (match) {
           const rKel = (match.kelurahan || match.Kelurahan || match.KELURAHAN || "").replace('KELURAHAN ', '').toUpperCase();
           const matchNama = match.nama || match.Nama || match.NAMA || "";
           setIsLockedKetua(true);
           setKelurahan(rKel);
           setTimeout(() => {
             setNamaKetua(matchNama);
           }, 0);
        }
      }
    };
    loadListNama();
  }, [currentUsername, type]);

  const [isCompressing, setIsCompressing] = useState<Record<string, boolean>>({});

  const handleFileChange = async (itemKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    if (!photoStore[itemKey]) {
      photoStore[itemKey] = [];
    }

    setIsCompressing(prev => ({ ...prev, [itemKey]: true }));

    try {
      const files = Array.from(e.target.files);
      
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        
        // Smart compression via reusable helper
        const compressedBlob = await compressImageBlob(file);
        
        // Convert Blob to Base64 to save in photoStore (ready to be sent as JSON string via AppScript)
        // If we were using FormData, we could directly append 'compressedBlob' here.
        const imgUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(compressedBlob);
        });

        photoStore[itemKey].push(imgUrl);
      }
    } catch (err) {
      console.error("Compression Error:", err);
      // Fallback directly to original file if compression fails? 
      // (Optional, but let's stick to catching it to prevent crash)
    } finally {
      setIsCompressing(prev => ({ ...prev, [itemKey]: false }));
      setForceRender({});
    }

    // Reset file input target
    e.target.value = '';
  };

  const removePhoto = (itemKey: string, index: number) => {
    if (photoStore[itemKey]) {
      photoStore[itemKey].splice(index, 1);
      setForceRender({});
    }
  };

  const handleSimpan = async () => {
    if (!namaKetua || !periode) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Peringatan',
        message: 'Nama dan Periode wajib diisi terlebih dahulu!'
      });
      return;
    }
    setIsSaving(true);
    
    // Gather all photos
    const allPhotos: string[] = [];
    Object.values(photoStore).forEach(arr => {
      arr.forEach(dataUrl => {
        // Remove 'data:image/jpeg;base64,' prefix just to be safe for Google Apps Script Utilities.base64Decode
        const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
        allPhotos.push(base64Data);
      });
    });

    const payload = {
      sheetName: 'Data_Berkas',
      kelurahan: `KELURAHAN ${kelurahan}`.toUpperCase(),
      tipe: type,
      namaKetua,
      periode,
      photos: allPhotos
    };

    console.log("MENGIRIM PAYLOAD KE APPS SCRIPT:", payload);

    const res = await saveToGoogleSheet(payload);
    setIsSaving(false);

    if (res.success) {
      // Clean up photo store after dispatch
      Object.keys(photoStore).forEach(key => delete photoStore[key]);
      setForceRender({});

      setNotification({
        show: true,
        type: 'success',
        title: 'Berhasil',
        message: 'Berhasil menyimpan data dan bukti ke Google Sheets & Drive.\n\nJika folder tidak muncul, cek App Script Logs Anda.'
      });
    } else {
      setNotification({
        show: true,
        type: 'error',
        title: 'Gagal Menyimpan',
        message: `${res.message || res.error || 'Terjadi kesalahan'}\n\nPerbaikan: Cek kolom pada SpreadSheet ('Timestamp', 'Kelurahan', 'Tipe/Jabatan', 'Nama Ketua', 'Periode', 'Link Folder / URL Foto')`
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Input Kinerja {type}</h2>
          <p className="text-sm text-slate-500">Form unggah bukti dukung kinerja {type}</p>
        </div>
      </div>

      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="uppercase font-bold text-orange-600 text-sm tracking-wider border-b-2 border-orange-600 pb-1 inline-block">Informasi Penilaian</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label className="text-red-500">Kelurahan *</Label>
              {isAdmin ? (
                <Select value={kelurahan} onValueChange={setKelurahan}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Pilih Kelurahan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {KELURAHAN_OPTIONS.map(kel => (
                      <SelectItem key={kel} value={kel.toUpperCase()}>{kel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={kelurahan.toUpperCase()} readOnly className="bg-slate-100 cursor-not-allowed" />
              )}
            </div>
            
            <div className="col-span-1 md:col-span-2 space-y-2">
              <Label className="text-red-500">Nama {type} *</Label>
              <Select value={namaKetua} onValueChange={setNamaKetua} disabled={!kelurahan || isLockedKetua}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder={`Pilih Ketua ${type}...`} />
                </SelectTrigger>
                <SelectContent className="min-w-[max-content] sm:min-w-[350px]">
                  {dataRTRW
                    .filter(r => {
                      const jabatan = r.jabatan || r.Jabatan || r.JABATAN || "";
                      const rKel = (r.kelurahan || r.Kelurahan || r.KELURAHAN || "").toUpperCase();
                      const isTypeMatch = typeof jabatan === 'string' && jabatan.toUpperCase().includes(type.toUpperCase());
                      const isKelMatch = rKel.includes(kelurahan.toUpperCase());
                      return isTypeMatch && isKelMatch;
                    })
                    .map((r, i) => {
                      const nama = r.nama || r.Nama || r.NAMA || "-";
                      const jabatan = r.jabatan || r.Jabatan || r.JABATAN || "";
                      const rw = r.rw || r.RW || "-";
                      const rt = r.rt || r.RT || "-";
                      
                      let label = "";
                      if (type.toUpperCase() === 'RT') {
                        label = `${jabatan} ${rt} / ${rw} - ${nama}`;
                      } else {
                        label = `${jabatan} ${rw} - ${nama}`;
                      }

                      return (
                        <SelectItem key={i} value={nama}>
                           {label}
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-red-500">Periode Penilaian *</Label>
              <Select value={periode} onValueChange={setPeriode}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Bulan..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Januari">Januari</SelectItem>
                  <SelectItem value="Februari">Februari</SelectItem>
                  <SelectItem value="Maret">Maret</SelectItem>
                  <SelectItem value="April">April</SelectItem>
                  <SelectItem value="Mei">Mei</SelectItem>
                  <SelectItem value="Juni">Juni</SelectItem>
                  <SelectItem value="Juli">Juli</SelectItem>
                  <SelectItem value="Agustus">Agustus</SelectItem>
                  <SelectItem value="September">September</SelectItem>
                  <SelectItem value="Oktober">Oktober</SelectItem>
                  <SelectItem value="November">November</SelectItem>
                  <SelectItem value="Desember">Desember</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
                variant="destructive" 
                className="bg-red-500 hover:bg-red-600"
                onClick={() => {
                    if (!isLockedKetua) {
                      setNamaKetua('');
                    }
                    setPeriode('');
                    if (isAdmin && !isLockedKetua) setKelurahan('');
                    Object.keys(photoStore).forEach(key => delete photoStore[key]);
                    setForceRender({});
                }}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead className="bg-[#f0ece1] text-xs uppercase font-bold text-slate-700 sticky top-0">
              <tr>
                <th className="py-3 px-2 border-r border-b w-12">NO</th>
                <th className="py-3 px-4 border-r border-b text-left">INDIKATOR PENILAIAN</th>
                <th className="py-3 px-2 border-b w-32">AKSI (Upload Bukti)</th>
              </tr>
            </thead>
            <tbody>
              {indicators.map((item, idx) => {
                if (item.id) {
                  return (
                    <tr key={`group-${item.id}`} className="bg-[#fff9eb]">
                      <td className="py-2 px-2 border-r border-b font-bold text-orange-800">{item.id}</td>
                      <td colSpan={2} className="py-2 px-4 border-b font-bold text-orange-800 text-left">
                        {item.title}
                      </td>
                    </tr>
                  );
                }
                
                const itemKey = `${item.parent}-${item.no}`;
                
                return (
                  <tr key={`item-${itemKey}`} className="hover:bg-slate-50">
                    <td className="py-2 px-2 border-r border-b text-slate-600 align-top">{item.no}</td>
                    <td className="py-2 px-4 border-r border-b text-left text-slate-700 align-top">
                      {item.desc}
                    </td>
                    <td className="py-2 px-2 border-b align-top w-48">
                      <div className="flex flex-col items-center gap-2">
                        <Label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 h-8 px-3 rounded flex items-center justify-center transition-colors text-xs font-semibold w-full" title="Upload Bukti Foto (Bisa lebih dari 1)">
                          <ImageIcon size={14} className="mr-1" /> Bukti
                          <Input type="file" accept="image/*" multiple className="hidden" disabled={isCompressing[itemKey]} onChange={(e) => handleFileChange(itemKey, e)} />
                        </Label>
                        
                        {isCompressing[itemKey] && (
                          <div className="flex items-center gap-1 text-[10px] text-blue-600 font-medium">
                            <Loader2 size={12} className="animate-spin" /> Mengompres...
                          </div>
                        )}
                        
                        {!isCompressing[itemKey] && photoStore[itemKey] && photoStore[itemKey].length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mt-2 w-full">
                            {photoStore[itemKey].map((src, pIdx) => (
                              <div key={pIdx} className="relative group rounded border overflow-hidden aspect-square">
                                <img src={src} alt="Bukti" className="w-full h-full object-cover" />
                                <button
                                  onClick={() => removePhoto(itemKey, pIdx)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
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
            </div>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={handleSimpan} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm h-9 px-6">
                   <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Menyimpan ke Drive (Harap Tunggu)...' : 'Simpan Semua Bukti'}
                </Button>
              </div>
            </div>
        </div>
      </div>

      {/* Notification Modal */}
      {notification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              {notification.type === 'success' ? (
                <div className="w-20 h-20 rounded-full border-4 border-emerald-100 flex items-center justify-center mb-6">
                   <div className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center">
                     <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                   </div>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full border-4 border-rose-100 flex items-center justify-center mb-6">
                   <div className="w-16 h-16 rounded-full border-4 border-rose-500 flex items-center justify-center">
                     <AlertCircle className="w-10 h-10 text-rose-500" />
                   </div>
                </div>
              )}
              <h3 className="text-2xl font-bold text-slate-700 mb-3">{notification.title}</h3>
              <p className="text-slate-500 whitespace-pre-line mb-8">
                {notification.message}
              </p>
              <Button 
                onClick={() => setNotification(null)}
                className="w-24 bg-[#3085d6] hover:bg-[#2b77c0] text-white font-medium"
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
