import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Printer } from 'lucide-react';

const mockDataTemplate = (type: 'RT' | 'RW') => [
  { id: 1, nik: '7371041209650001', nama: 'Drs. MUHAMMAD ARDI MUHAMMADING', jabatan: type === 'RT' ? 'Ketua RT 001/001' : 'Ketua RW 001', rw: '001', tanggal: '2026-01-31', periode: 'Januari', nilai: 91, kelurahan: 'KELURAHAN MANGKURA' },
  { id: 2, nik: '7371131207900005', nama: 'ANDI IKRAR YUDISTIRA', jabatan: type === 'RT' ? 'Ketua RT 002/001' : 'Ketua RW 002', rw: '001', tanggal: '2026-01-31', periode: 'Januari', nilai: 91, kelurahan: 'KELURAHAN MANGKURA' },
  { id: 3, nik: '7371046610860001', nama: 'MILA KARMILA', jabatan: type === 'RT' ? 'Ketua RT 003/001' : 'Ketua RW 003', rw: '001', tanggal: '2026-01-31', periode: 'Januari', nilai: 91, kelurahan: 'KELURAHAN MANGKURA' },
  { id: 4, nik: '7371041604960001', nama: 'NOER ALAMSYAH', jabatan: type === 'RT' ? 'Ketua RT 001/002' : 'Ketua RW 001', rw: '002', tanggal: '2026-01-31', periode: 'Januari', nilai: 91, kelurahan: 'KELURAHAN MANGKURA' },
  { id: 5, nik: '7371045902610002', nama: 'IR. YACHFA ARYATI D', jabatan: type === 'RT' ? 'Ketua RT 002/002' : 'Ketua RW 002', rw: '002', tanggal: '2026-01-31', periode: 'Januari', nilai: 91, kelurahan: 'KELURAHAN MANGKURA' },
  { id: 6, nik: '7371041908940001', nama: 'MUHAMMAD FADLI AHRI', jabatan: type === 'RT' ? 'Ketua RT 003/002' : 'Ketua RW 003', rw: '002', tanggal: '2026-01-31', periode: 'Januari', nilai: 91, kelurahan: 'KELURAHAN MANGKURA' },
  { id: 7, nik: '7371043105660001', nama: 'M. YASID SALEH BUSTHAMI', jabatan: type === 'RT' ? 'Ketua RT 001/003' : 'Ketua RW 001', rw: '003', tanggal: '2026-01-31', periode: 'Januari', nilai: 91, kelurahan: 'KELURAHAN MANGKURA' },
  { id: 8, nik: '7371046705790001', nama: 'ROSMAWATI R', jabatan: type === 'RT' ? 'Ketua RT 002/003' : 'Ketua RW 002', rw: '003', tanggal: '2026-01-31', periode: 'Januari', nilai: 92, kelurahan: 'KELURAHAN MANGKURA' },
  { id: 9, nik: '3522141909920003', nama: 'MOCH MIFTAKHUL ANAM', jabatan: type === 'RT' ? 'Ketua RT 003/003' : 'Ketua RW 003', rw: '003', tanggal: '2026-01-31', periode: 'Januari', nilai: 91, kelurahan: 'KELURAHAN MANGKURA' },
  { id: 10, nik: '7371142105870012', nama: 'RONALD MAURICE DUPUY', jabatan: type === 'RT' ? 'Ketua RT 001/004' : 'Ketua RW 001', rw: '004', tanggal: '2026-01-31', periode: 'Januari', nilai: 91, kelurahan: 'KELURAHAN MANGKURA' },
];

export const RekapPenilaian = ({ type }: { type: 'RT' | 'RW' }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      const { fetchFromGoogleSheet } = await import('../services/sheetsService');
      
      const getVal = (obj: any, possibleKeys: string[]) => {
        for (const k of Object.keys(obj)) {
          if (possibleKeys.includes(k.trim().toLowerCase())) return obj[k];
        }
        return '';
      };

      const filterLogic = (item: any) => {
        const jab = getVal(item, ['tipe', 'jabatan', 'tipe/jabatan']);
        return typeof jab === 'string' && jab.toUpperCase().includes(type);
      };

      const cached = localStorage.getItem('cache_Laporan_Kinerja');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const filteredData = parsed.filter(filterLogic);
          if (mounted) {
            setData(filteredData);
            setLoading(false);
          }
        } catch(e){}
      } else {
        if (mounted) setLoading(true);
      }

      const res = await fetchFromGoogleSheet('Laporan_Kinerja', true);
      if (res.success && mounted) {
        const filteredData = res.data.filter(filterLogic);
        setData(filteredData);
      }
      if (mounted) setLoading(false);
    };
    loadData();
    return () => { mounted = false; };
  }, [type]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Rekap Penilaian {type} / {type === 'RT' ? 'RW' : 'Kelurahan'}</h2>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
          <div className="flex flex-col md:flex-row gap-6 w-full md:w-auto">
            <div className="space-y-1 w-full md:w-auto">
              <label className="text-xs font-bold text-slate-700">Kolom:</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <Select defaultValue="nama">
                  <SelectTrigger className="w-full sm:w-[180px] bg-white h-9 border-slate-300">
                    <SelectValue placeholder="Pilih Kolom" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nama">Nama</SelectItem>
                    <SelectItem value="nik">NIK</SelectItem>
                    <SelectItem value="jabatan">Jabatan</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative w-full sm:w-auto">
                  <Input type="text" className="w-full sm:w-[200px] h-9 pr-8" placeholder="..." />
                  <Search className="absolute right-2 top-2.5 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="space-y-1 w-full md:w-auto">
              <label className="text-xs font-bold text-slate-700">Pilih RW:</label>
              <Select>
                <SelectTrigger className="w-full sm:w-[180px] bg-white h-9 border-slate-300">
                  <SelectValue placeholder="-- Pilih --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="001">001</SelectItem>
                  <SelectItem value="002">002</SelectItem>
                  <SelectItem value="003">003</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 w-full md:w-auto">
              <label className="text-xs font-bold text-slate-700">Pilih Bulan:</label>
              <Select>
                <SelectTrigger className="w-full sm:w-[180px] bg-white h-9 border-slate-300">
                  <SelectValue placeholder="-- Pilih --" />
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
          
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white h-9">
            <Printer className="w-4 h-4 mr-2" /> Cetak
          </Button>
        </div>

        <div className="bg-white border rounded shadow-sm overflow-hidden mt-2">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead className="bg-[#6b318d] text-white">
                <tr>
                  <th className="py-3 px-2 border border-[#7a3b9f] font-semibold w-10">NO.</th>
                  <th className="py-3 px-4 border border-[#7a3b9f] font-semibold">NIK</th>
                  <th className="py-3 px-4 border border-[#7a3b9f] font-semibold text-left whitespace-nowrap min-w-[200px]">NAMA</th>
                  <th className="py-3 px-2 border border-[#7a3b9f] font-semibold">JABATAN</th>
                  <th className="py-3 px-2 border border-[#7a3b9f] font-semibold w-12">RW</th>
                  <th className="py-3 px-4 border border-[#7a3b9f] font-semibold">TANGGAL</th>
                  <th className="py-3 px-4 border border-[#7a3b9f] font-semibold">PERIODE PENILAIAN</th>
                  <th className="py-3 px-2 border border-[#7a3b9f] font-semibold w-16">NILAI</th>
                  <th className="py-3 px-4 border border-[#7a3b9f] font-semibold">KELURAHAN</th>
                  <th className="py-3 px-2 border border-[#7a3b9f] font-semibold">ARSIP</th>
                </tr>
              </thead>
              <tbody>
                  {loading ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-slate-500">Memuat data dari Spreadsheet...</td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-slate-500">Belum ada data penilaian.</td>
                  </tr>
                ) : data.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 border-b">
                    <td className="py-2 px-2 border-r text-slate-500">{idx + 1}</td>
                    <td className="py-2 px-4 border-r text-slate-700">{item.nik || item.NIK || '-'}</td>
                    <td className="py-2 px-4 border-r text-left text-slate-800 font-medium whitespace-nowrap">{item.nama || item['nama ketua'] || item['Nama Ketua'] || '-'}</td>
                    <td className="py-2 px-2 border-r text-slate-700 min-w-[120px]">{item.jabatan || item.Jabatan || item['tipe/jabatan'] || item['Tipe/Jabatan'] || '-'}</td>
                    <td className="py-2 px-2 border-r text-slate-700">{item.rw || item.RW || '-'}</td>
                    <td className="py-2 px-4 border-r text-slate-700">{item.tanggal || item.Timestamp || item.timestamp || '-'}</td>
                    <td className="py-2 px-4 border-r text-slate-700">{item.periode || item.Periode || '-'}</td>
                    <td className="py-2 px-2 border-r text-slate-700 font-bold">{item.nilai || item['total skor penilaian'] || item['Total Skor Penilaian'] || item.Nilai || '-'}</td>
                    <td className="py-2 px-4 border-r text-slate-700">{item.kelurahan || item.Kelurahan || '-'}</td>
                    <td className="py-2 px-2 text-slate-500">-</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
