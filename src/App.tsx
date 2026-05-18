import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { DashboardCamat } from './components/DashboardCamat';
import { FormPenilaian } from './components/FormPenilaian';
import { FormInputKinerja } from './components/FormInputKinerja';
import { DataRTRW } from './components/DataRTRW';
import { RekapPenilaian } from './components/RekapPenilaian';
import { analyzeLaporan } from './services/geminiService';
import { saveToGoogleSheet } from './services/sheetsService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, FileText, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, BarChart3, Users, Building2, Wallet, LayoutDashboard, FileEdit, CheckSquare, ClipboardList, Shield, Navigation, Menu, X, LogOut } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const KELURAHAN_OPTIONS = [
  "Baru", "Bulogading", "Lae-Lae", "Lajangiru", "Losari",
  "Maloku", "Mangkura", "Pisang Selatan", "Pisang Utara", "Sawerigading"
];

const DummyPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center p-12 text-slate-400 h-full mt-10">
    <ClipboardList size={48} className="mb-4 text-slate-300" />
    <h2 className="text-xl font-bold text-slate-600 mb-2">{title}</h2>
    <p>Halaman ini masih dalam tahap simulasi / pengembangan.</p>
  </div>
);

import { UserManagement } from './components/UserManagement';

type ActiveMenu = 'dashboard' | 'data-rtrw' | 'input-rt' | 'input-rw' | 'penilai-rt' | 'penilai-rw' | 'rekap-rt' | 'rekap-rw' | 'users';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>('Admin');
  const [username, setUsername] = useState<string>('');
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>('dashboard');
  
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    const role = localStorage.getItem('userRole') || 'Admin';
    const storedUsername = localStorage.getItem('username') || '';
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      setUserRole(role);
      setUsername(storedUsername);

      // Default route assignments for limited roles
      if (role === 'RT') {
         setActiveMenu('input-rt');
      } else if (role === 'RW') {
         setActiveMenu('input-rw');
      }
    }
    setIsAuthChecking(false);
  }, []);

  const hasAccess = (menu: ActiveMenu) => {
    if (userRole === 'Admin') return true;
    
    if (userRole === 'RT') {
      return menu === 'input-rt';
    }
    
    if (userRole === 'RW') {
      return menu === 'input-rw';
    }
    
    if (userRole === 'Pimpinan') {
      // Pimpinan Camat: Semua kecuali Manajemen Pengguna dan Data RT/RW
      if (menu === 'users' || menu === 'data-rtrw') return false;
      return true;
    }
    
    if (userRole === 'Penilai') {
      // Penilaian Lapangan (Lurah): "Semua menu yang ada di lurah app"
      // Asumsikan semua kecuali 'users'
      if (menu === 'users') return false;
      return true;
    }

    return false;
  };

  const [step, setStep] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [jsonOutput, setJsonOutput] = useState<any | null>(null);

  // Form states
  // Step 1: Profil
  const [kelurahan, setKelurahan] = useState('');
  const [rtRw, setRtRw] = useState('');
  const [namaKetua, setNamaKetua] = useState('');
  const [periode, setPeriode] = useState('');
  
  // Step 2: Lingkungan
  const [longwis, setLongwis] = useState('');
  const [fotoLongwis, setFotoLongwis] = useState<File | null>(null);
  const [bankSampah, setBankSampah] = useState('');
  const [fotoBankSampah, setFotoBankSampah] = useState<File | null>(null);
  const [sombere, setSombere] = useState('');
  const [fotoSombere, setFotoSombere] = useState<File | null>(null);

  // Step 3: Keuangan
  const [targetRetribusi, setTargetRetribusi] = useState('');
  const [realisasiRetribusi, setRealisasiRetribusi] = useState('');
  const [fotoRetribusi, setFotoRetribusi] = useState<File | null>(null);
  const [targetPbb, setTargetPbb] = useState('');
  const [realisasiPbb, setRealisasiPbb] = useState('');
  const [fotoPbb, setFotoPbb] = useState<File | null>(null);

  // Step 4: Administrasi
  const [bukuAdm, setBukuAdm] = useState('');
  const [fotoBukuAdm, setFotoBukuAdm] = useState<File | null>(null);
  const [dataPenduduk, setDataPenduduk] = useState('');
  const [fotoDataPenduduk, setFotoDataPenduduk] = useState<File | null>(null);

  // Step 5: Deteksi Dini
  const [kerawananSosial, setKerawananSosial] = useState('');
  const [fotoKerawananSosial, setFotoKerawananSosial] = useState<File | null>(null);
  const [kerawananBencana, setKerawananBencana] = useState('');
  const [fotoKerawananBencana, setFotoKerawananBencana] = useState<File | null>(null);

  const targetRetribusiNum = Number(targetRetribusi) || 0;
  const realisasiRetribusiNum = Number(realisasiRetribusi) || 0;
  const selisihRetribusi = targetRetribusiNum - realisasiRetribusiNum;

  const targetPbbNum = Number(targetPbb) || 0;
  const realisasiPbbNum = Number(realisasiPbb) || 0;
  const selisihPbb = targetPbbNum - realisasiPbbNum;

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setJsonOutput(null);

    try {
      const data: any = { kelurahan, rtRw, namaKetua, periode, longwis, bankSampah, sombere, targetRetribusi, realisasiRetribusi, targetPbb, realisasiPbb, bukuAdm, dataPenduduk, kerawananSosial, kerawananBencana };
      if (fotoLongwis) data.fotoLongwis = await fileToGenerativePart(fotoLongwis);
      if (fotoBankSampah) data.fotoBankSampah = await fileToGenerativePart(fotoBankSampah);
      if (fotoSombere) data.fotoSombere = await fileToGenerativePart(fotoSombere);
      if (fotoRetribusi) data.fotoRetribusi = await fileToGenerativePart(fotoRetribusi);
      if (fotoPbb) data.fotoPbb = await fileToGenerativePart(fotoPbb);
      if (fotoBukuAdm) data.fotoBukuAdm = await fileToGenerativePart(fotoBukuAdm);
      if (fotoDataPenduduk) data.fotoDataPenduduk = await fileToGenerativePart(fotoDataPenduduk);
      if (fotoKerawananSosial) data.fotoKerawananSosial = await fileToGenerativePart(fotoKerawananSosial);
      if (fotoKerawananBencana) data.fotoKerawananBencana = await fileToGenerativePart(fotoKerawananBencana);

      const responseText = await analyzeLaporan(data);
      if (responseText) {
        setResult(responseText);
        let parsedJson = null;
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try { 
              parsedJson = JSON.parse(jsonMatch[1] || jsonMatch[0]);
              setJsonOutput(parsedJson); 
            } 
            catch (e) { console.error(e); }
        }
        
        // Save to Google Sheets
        await saveToGoogleSheet({
          sheetName: 'Laporan_Kinerja',
          kelurahan,
          rtRw,
          namaKetua,
          periode,
          longwis,
          bankSampah,
          sombere,
          targetRetribusi,
          realisasiRetribusi,
          selisihRetribusi,
          targetPbb,
          realisasiPbb,
          selisihPbb,
          bukuAdm,
          dataPenduduk,
          kerawananSosial,
          kerawananBencana,
          aiScore: parsedJson?.performance_stats?.score_avg || "",
          aiSummary: parsedJson?.executive_summary || ""
        });

        setActiveMenu('dashboard');
        setStep(1);
      }
    } catch (error) {
      console.error(error);
      alert('Gagal menganalisis laporan.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (setter: React.Dispatch<React.SetStateAction<File | null>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setter(e.target.files[0]);
  };

  const inputClasses = "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-purple-500 focus-visible:border-transparent transition-all";
  const labelClasses = "text-slate-800 font-medium";

  const renderStepperHeader = () => {
    const steps = [
      { id: 1, name: 'Profil' }, 
      { id: 2, name: 'Lingkungan & Sosial' }, 
      { id: 3, name: 'Keuangan' }, 
      { id: 4, name: 'Administrasi' }, 
      { id: 5, name: 'Deteksi Dini' }
    ];
    return (
      <div className="flex items-start justify-between w-full max-w-3xl mx-auto mb-10 mt-6 relative px-4">
        {steps.map((st, index) => {
          const isActive = step === st.id;
          const isPast = step > st.id;
          return (
            <React.Fragment key={st.id}>
              <div className="flex flex-col items-center w-20 md:w-24 relative z-10">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold shadow-sm transition-all duration-300 ${
                  isActive ? 'bg-purple-600 text-white ring-4 ring-purple-100 scale-110' : 
                  isPast ? 'bg-emerald-500 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'
                }`}>
                  {isPast ? <CheckCircle2 size={18} /> : st.id}
                </div>
                <span className={`text-[10px] md:text-xs font-medium mt-3 md:mt-4 text-center transition-all duration-300 leading-tight ${
                  isActive ? 'text-purple-700 font-bold' : isPast ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  {st.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 mt-4 md:mt-5 h-0.5 bg-slate-200 relative rounded-full overflow-hidden mx-1 md:mx-2">
                  <div className={`absolute top-0 bottom-0 left-0 bg-emerald-500 transition-all duration-500 ${step > index + 1 ? 'w-full' : 'w-0'}`}></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const renderFormInput = () => {
    const isRT = activeMenu === 'input-rt';
    
    return (
      <Card className="shadow-xl border border-slate-200 max-w-3xl mx-auto relative overflow-hidden bg-slate-50 rounded-2xl">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-purple-600"></div>
        <CardHeader className="border-b border-slate-200 pb-8 pt-8 relative z-10 bg-white">
          <CardTitle className="text-2xl text-slate-900 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              {isRT ? <Users size={24} /> : <Building2 size={24} />}
            </div>
            Form Laporan Kinerja {isRT ? 'RT' : 'RW'}
          </CardTitle>
          <CardDescription className="text-slate-500 text-base mt-2">
            Lengkapi formulir kinerja dengan teliti untuk evaluasi AI.
          </CardDescription>
          <div className="pt-6">{renderStepperHeader()}</div>
        </CardHeader>

        <CardContent className="p-6 md:p-8 relative z-10">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="kelurahan" className={labelClasses}>Pilih Kelurahan</Label>
                    <div className="relative">
                      <select id="kelurahan" required value={kelurahan} onChange={(e) => setKelurahan(e.target.value)}
                        className={`flex h-10 w-full appearance-none rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${inputClasses}`}
                      >
                        <option value="" disabled className="text-slate-500">-- Pilih Kelurahan --</option>
                        {KELURAHAN_OPTIONS.map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                         <ArrowLeft size={16} className="-rotate-90" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rtRw" className={labelClasses}>Nomor {isRT ? 'RT' : 'RW'}</Label>
                    <Input id="rtRw" required placeholder={isRT ? "Contoh: 02" : "Contoh: 01"} value={rtRw} onChange={e => setRtRw(e.target.value)} className={inputClasses} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="namaKetua" className={labelClasses}>Nama Ketua {isRT ? 'RT' : 'RW'}</Label>
                    <Input id="namaKetua" required placeholder="Nama Lengkap" value={namaKetua} onChange={e => setNamaKetua(e.target.value)} className={inputClasses} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="periode" className={labelClasses}>Periode Laporan</Label>
                    <Input id="periode" required placeholder="Contoh: Agustus 2023" value={periode} onChange={e => setPeriode(e.target.value)} className={inputClasses} />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-3">
                  <Label className={labelClasses}>1. Lorong Wisata (Longwis) / Urban Farming</Label>
                  <Textarea className={`min-h-[100px] ${inputClasses}`} placeholder="Jelaskan kondisi pengelolaan lorong, kegiatan urban farming..." value={longwis} onChange={e => setLongwis(e.target.value)} />
                  <div className="flex items-center gap-3 mt-2">
                    <Input id="fotoLongwis" type="file" accept="image/*" onChange={handleFileChange(setFotoLongwis)} className="hidden" />
                    <Label htmlFor="fotoLongwis" className="cursor-pointer inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg transition-all font-medium border border-slate-200 text-sm shadow-sm hover:shadow">
                      <Upload size={16} /> {fotoLongwis ? fotoLongwis.name : 'Upload Foto Longwis/Kawasan'}
                    </Label>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className={labelClasses}>2. Bank Sampah</Label>
                  <Textarea className={`min-h-[100px] ${inputClasses}`} placeholder="Jumlah nasabah, edukasi warga tentang pemilahan sampah..." value={bankSampah} onChange={e => setBankSampah(e.target.value)} />
                  <div className="flex items-center gap-3 mt-2">
                    <Input id="fotoBankSampah" type="file" accept="image/*" onChange={handleFileChange(setFotoBankSampah)} className="hidden" />
                    <Label htmlFor="fotoBankSampah" className="cursor-pointer inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg transition-all font-medium border border-slate-200 text-sm shadow-sm hover:shadow">
                      <Upload size={16} /> {fotoBankSampah ? fotoBankSampah.name : 'Upload Foto Bank Sampah'}
                    </Label>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className={labelClasses}>3. Sombere & Smart City</Label>
                  <Textarea className={`min-h-[100px] ${inputClasses}`} placeholder="Kegiatan kerja bakti, pertemuan rutin, keamanan/siskamling..." value={sombere} onChange={e => setSombere(e.target.value)} />
                  <div className="flex items-center gap-3 mt-2">
                    <Input id="fotoSombere" type="file" accept="image/*" onChange={handleFileChange(setFotoSombere)} className="hidden" />
                    <Label htmlFor="fotoSombere" className="cursor-pointer inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg transition-all font-medium border border-slate-200 text-sm shadow-sm hover:shadow">
                      <Upload size={16} /> {fotoSombere ? fotoSombere.name : 'Upload Foto Sombere/Kegiatan Warga'}
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">4. Retribusi Sampah</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="targetRetribusi" className={labelClasses}>Target Nominal Retribusi (Rp)</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 font-medium">Rp</div>
                      <Input id="targetRetribusi" type="number" required className={`pl-10 ${inputClasses}`} placeholder="2000000" value={targetRetribusi} onChange={e => setTargetRetribusi(e.target.value)} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="realisasiRetribusi" className={labelClasses}>Realisasi Retribusi (Rp)</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 font-medium">Rp</div>
                      <Input id="realisasiRetribusi" type="number" required className={`pl-10 ${inputClasses}`} placeholder="1850000" value={realisasiRetribusi} onChange={e => setRealisasiRetribusi(e.target.value)} />
                    </div>
                  </div>

                  <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                    <div>
                      <h4 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
                        <Wallet size={16} className="text-purple-600"/> Selisih / Defisit Retribusi
                      </h4>
                    </div>
                    <div className={`text-lg font-bold tracking-tight px-4 py-1.5 rounded-lg shadow-sm border ${selisihRetribusi > 0 ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                      {selisihRetribusi > 0 ? '-' : selisihRetribusi < 0 ? '+' : ''}{formatRupiah(Math.abs(selisihRetribusi))}
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-3 pt-2">
                    <Label className={labelClasses}>Bukti Transfer / Penyetoran Retribusi</Label>
                    <div className="flex items-center gap-3">
                      <Input id="fotoRetribusi" type="file" accept="image/*" onChange={handleFileChange(setFotoRetribusi)} className="hidden" />
                      <Label htmlFor="fotoRetribusi" className="cursor-pointer inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg transition-all font-medium border border-slate-200 text-sm shadow-sm hover:shadow">
                        <Upload size={16} /> {fotoRetribusi ? fotoRetribusi.name : 'Upload Struk Transfer Retribusi'}
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="mt-8 mb-4 border-t border-slate-200 pt-6">
                   <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">5. Pajak Bumi dan Bangunan (PBB)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetPbb" className={labelClasses}>Target PBB (Rp)</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 font-medium">Rp</div>
                      <Input id="targetPbb" type="number" required className={`pl-10 ${inputClasses}`} placeholder="5000000" value={targetPbb} onChange={e => setTargetPbb(e.target.value)} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="realisasiPbb" className={labelClasses}>Realisasi PBB (Rp)</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 font-medium">Rp</div>
                      <Input id="realisasiPbb" type="number" required className={`pl-10 ${inputClasses}`} placeholder="4500000" value={realisasiPbb} onChange={e => setRealisasiPbb(e.target.value)} />
                    </div>
                  </div>

                  <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                    <div>
                      <h4 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
                        <Wallet size={16} className="text-purple-600"/> Selisih / Defisit PBB
                      </h4>
                    </div>
                    <div className={`text-lg font-bold tracking-tight px-4 py-1.5 rounded-lg shadow-sm border ${selisihPbb > 0 ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                      {selisihPbb > 0 ? '-' : selisihPbb < 0 ? '+' : ''}{formatRupiah(Math.abs(selisihPbb))}
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-3 pt-2">
                    <Label className={labelClasses}>Bukti Penagihan / Pembayaran PBB</Label>
                    <div className="flex items-center gap-3">
                      <Input id="fotoPbb" type="file" accept="image/*" onChange={handleFileChange(setFotoPbb)} className="hidden" />
                      <Label htmlFor="fotoPbb" className="cursor-pointer inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg transition-all font-medium border border-slate-200 text-sm shadow-sm hover:shadow">
                        <Upload size={16} /> {fotoPbb ? fotoPbb.name : 'Upload Dokumen Laporan PBB'}
                      </Label>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {step === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-3">
                  <Label className={labelClasses}>6. Buku Administrasi RT/RW</Label>
                  <Textarea className={`min-h-[100px] ${inputClasses}`} placeholder="Ketertiban dan akurasi pencatatan surat menyurat warga..." value={bukuAdm} onChange={e => setBukuAdm(e.target.value)} />
                  <div className="flex items-center gap-3 mt-2">
                    <Input id="fotoBukuAdm" type="file" accept="image/*" onChange={handleFileChange(setFotoBukuAdm)} className="hidden" />
                    <Label htmlFor="fotoBukuAdm" className="cursor-pointer inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg transition-all font-medium border border-slate-200 text-sm shadow-sm hover:shadow">
                      <Upload size={16} /> {fotoBukuAdm ? fotoBukuAdm.name : 'Upload Foto Buku Administrasi'}
                    </Label>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className={labelClasses}>7. Data Penduduk Non-Permanen</Label>
                  <Textarea className={`min-h-[100px] ${inputClasses}`} placeholder="Update pendataan warga pendatang kos/kontrakan..." value={dataPenduduk} onChange={e => setDataPenduduk(e.target.value)} />
                  <div className="flex items-center gap-3 mt-2">
                    <Input id="fotoDataPenduduk" type="file" accept="image/*" onChange={handleFileChange(setFotoDataPenduduk)} className="hidden" />
                    <Label htmlFor="fotoDataPenduduk" className="cursor-pointer inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg transition-all font-medium border border-slate-200 text-sm shadow-sm hover:shadow">
                      <Upload size={16} /> {fotoDataPenduduk ? fotoDataPenduduk.name : 'Upload Foto Laporan Penduduk'}
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-3">
                  <Label className={labelClasses}>8. Deteksi Dini Kerawanan Sosial</Label>
                  <Textarea className={`min-h-[100px] ${inputClasses}`} placeholder="Laporan potensi konflik warga, kenakalan remaja..." value={kerawananSosial} onChange={e => setKerawananSosial(e.target.value)} />
                  <div className="flex items-center gap-3 mt-2">
                    <Input id="fotoKerawananSosial" type="file" accept="image/*" onChange={handleFileChange(setFotoKerawananSosial)} className="hidden" />
                    <Label htmlFor="fotoKerawananSosial" className="cursor-pointer inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg transition-all font-medium border border-slate-200 text-sm shadow-sm hover:shadow">
                      <Upload size={16} /> {fotoKerawananSosial ? fotoKerawananSosial.name : 'Upload Bukti Sosial (Opsional)'}
                    </Label>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className={labelClasses}>9. Deteksi Dini Kerawanan Bencana</Label>
                  <Textarea className={`min-h-[100px] ${inputClasses}`} placeholder="Kesiapsiagaan, titik genangan air, pohon tumbang, dll..." value={kerawananBencana} onChange={e => setKerawananBencana(e.target.value)} />
                  <div className="flex items-center gap-3 mt-2">
                    <Input id="fotoKerawananBencana" type="file" accept="image/*" onChange={handleFileChange(setFotoKerawananBencana)} className="hidden" />
                    <Label htmlFor="fotoKerawananBencana" className="cursor-pointer inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg transition-all font-medium border border-slate-200 text-sm shadow-sm hover:shadow">
                      <Upload size={16} /> {fotoKerawananBencana ? fotoKerawananBencana.name : 'Upload Bukti Bencana (Opsional)'}
                    </Label>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-8 border-t border-slate-200 mt-12">
              <Button type="button" variant="outline" className="w-32 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-sm" onClick={() => setStep(step - 1)} disabled={step === 1 || loading}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
              </Button>

              {step < 5 ? (
                <Button type="button" className="w-36 bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-200 border-0 transition-all" onClick={() => setStep(step + 1)}>
                  Selanjutnya <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading} className="w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 shadow-md shadow-emerald-200 border-0 transition-all">
                  {loading ? <><Loader2 className="animate-spin w-4 h-4 mr-2" /> Sedang Mengirim...</> : <><CheckCircle2 className="w-4 h-4 mr-2" /> Kirim & Analisis</>}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    );
  };

  const renderDashboard = () => {
    if (loading) {
      return (
        <Card className="min-h-[500px] flex flex-col items-center justify-center p-12 text-slate-700 shadow-xl border border-slate-200 bg-white rounded-2xl">
          <Loader2 className="w-16 h-16 animate-spin mb-6 text-purple-600" />
          <h3 className="text-2xl font-bold tracking-tight">AI sedang Menganalisis...</h3>
          <p className="text-slate-500 mt-3 font-medium text-lg text-center max-w-sm">Mengevaluasi bukti finansial dan menganalisa kondisi lapangan.</p>
        </Card>
      );
    }
    if (!result) {
      return (
        <Card className="min-h-[500px] flex flex-col items-center justify-center p-12 shadow-sm bg-slate-50 border border-slate-200 border-dashed rounded-2xl">
          <div className="p-6 rounded-full bg-white mb-6 shadow-sm border border-slate-100">
            <BarChart3 className="w-20 h-20 text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-700 tracking-tight">Dashboard Belum Tersedia</h3>
          <p className="text-slate-500 mt-3 max-w-md text-center text-lg">Input data melalui tab formulir untuk melihat hasil evaluasi kinerja cerdas.</p>
        </Card>
      );
    }

    return (
      <div className="space-y-6 animate-in fade-in duration-700 zoom-in-95">
        {jsonOutput && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-purple-600 text-white shadow-xl border-0 relative overflow-hidden rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-4 -translate-y-4">
                <BarChart3 size={120} />
              </div>
              <CardContent className="p-6 relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="text-purple-200 text-xs font-bold mb-1 uppercase tracking-widest">Capaian Retribusi</div>
                  <div className="text-5xl font-black mt-2">{jsonOutput.financial_stats?.percentage}%</div>
                </div>
                <div className="flex items-center gap-2 mt-6 text-sm bg-black/10 w-fit px-4 py-2 rounded-xl">
                  {jsonOutput.financial_stats?.payment_status?.includes('VALID') ? <CheckCircle2 size={18} className="text-emerald-300" /> : <AlertCircle size={18} className="text-rose-300" />}
                  <span className="font-semibold tracking-wide">{jsonOutput.financial_stats?.payment_status}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-slate-200 text-slate-900 rounded-2xl">
              <CardContent className="p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-widest">Skor Non-Fisik</div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <div className="text-5xl font-black">{jsonOutput.performance_stats?.score_avg}</div>
                    <div className="text-xl font-bold text-slate-400">/ 100</div>
                  </div>
                </div>
                <div className="mt-6 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Status Lingkungan</div>
                  <div className="font-bold text-lg">{jsonOutput.performance_stats?.status_lingkungan}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-slate-200 text-slate-900 rounded-2xl">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="text-slate-500 text-xs font-bold mb-2 uppercase tracking-widest">Unit Kerja (Analisis)</div>
                  <div className="text-2xl font-bold text-slate-900">{jsonOutput.kelurahan}</div>
                  <div className="text-purple-600 font-semibold text-lg flex items-center gap-2 mt-1">
                    <Users size={18} /> RT/RW: {jsonOutput.unit_kerja}
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-sm font-semibold text-slate-500">Bukti Fisik</span>
                  <span className="font-bold text-emerald-600">{jsonOutput.performance_stats?.evidence_completeness}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {jsonOutput && (
          <Card className="bg-purple-50 flex flex-col md:flex-row shadow-sm border border-purple-100 overflow-hidden relative rounded-2xl">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-600"></div>
            <div className="p-6 md:p-8 flex items-start gap-5">
              <div className="p-3 bg-white rounded-xl shadow-sm text-purple-600 shrink-0 border border-purple-100">
                <FileText size={32} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">Ringkasan Eksekutif Camat</h3>
                <p className="text-slate-700 leading-relaxed font-medium md:text-xl italic">
                  "{jsonOutput.executive_summary}"
                </p>
              </div>
            </div>
          </Card>
        )}

        <Card className="shadow-lg border border-slate-200 bg-white rounded-2xl">
          <CardHeader className="border-b border-slate-100 bg-slate-50">
            <CardTitle className="text-xl text-slate-800">Laporan Evaluasi AI Detail</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8 text-slate-700">
            <div className="prose prose-purple max-w-none">
              <Markdown remarkPlugins={[remarkGfm]}>{result.replace(/```json\n([\s\S]*?)\n```/, '')}</Markdown>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isAuthChecking) {
    return <div className="h-screen w-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>;
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => {
      setIsAuthenticated(true);
      setUserRole(localStorage.getItem('userRole') || 'Admin');
      setUsername(localStorage.getItem('username') || '');
    }} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 font-sans text-slate-800 selection:bg-purple-500/30 selection:text-purple-900">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 shadow-sm z-50 w-64 transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-purple-600 rounded flex items-center justify-center text-white shrink-0">
               <LayoutDashboard size={20} />
             </div>
             <div className="font-extrabold text-xl text-purple-800 tracking-tight leading-tight">EKIN-RTRW</div>
           </div>
           <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
             <X size={20} className="text-slate-500" />
           </button>
        </div>
        
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                <Shield className="w-5 h-5 text-slate-500" />
             </div>
             <div className="overflow-hidden">
               <p className="font-bold text-sm text-slate-900 truncate">{username || 'Kecamatan'}</p>
               <p className="text-xs text-emerald-600 flex items-center mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span> Online</p>
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
           
           {(hasAccess('dashboard') || hasAccess('data-rtrw')) && (
             <>
               <p className="px-5 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 mt-2">Menu Utama</p>
               <nav className="space-y-0.5 px-2">
                 {hasAccess('dashboard') && (
                   <button onClick={() => { setActiveMenu('dashboard'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors ${activeMenu === 'dashboard' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                      <LayoutDashboard className="w-4 h-4 shrink-0" /> Dashboard
                   </button>
                 )}
                 {hasAccess('data-rtrw') && (
                   <button onClick={() => { setActiveMenu('data-rtrw'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors ${activeMenu === 'data-rtrw' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                      <Users className="w-4 h-4 shrink-0" /> Data RT/RW
                   </button>
                 )}
               </nav>
             </>
           )}

           {(hasAccess('input-rt') || hasAccess('input-rw')) && (
             <div className="mt-6 mb-2">
               <p className="px-5 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">User RT/RW</p>
               <nav className="space-y-0.5 px-2">
                 {hasAccess('input-rt') && (
                   <button onClick={() => { setActiveMenu('input-rt'); setStep(1); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors ${activeMenu === 'input-rt' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                      <FileEdit className="w-4 h-4 shrink-0" /> Input Kinerja RT
                   </button>
                 )}
                 {hasAccess('input-rw') && (
                   <button onClick={() => { setActiveMenu('input-rw'); setStep(1); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors ${activeMenu === 'input-rw' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                      <FileEdit className="w-4 h-4 shrink-0" /> Input Kinerja RW
                   </button>
                 )}
               </nav>
             </div>
           )}

           {(hasAccess('penilai-rt') || hasAccess('penilai-rw') || hasAccess('rekap-rt') || hasAccess('rekap-rw')) && (
             <div className="mt-6 mb-2">
               <p className="px-5 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Lurah App</p>
               <nav className="space-y-0.5 px-2">
                 {hasAccess('penilai-rt') && (
                   <button onClick={() => { setActiveMenu('penilai-rt'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors ${activeMenu === 'penilai-rt' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                      <CheckSquare className="w-4 h-4 shrink-0" /> Penilaian RT
                   </button>
                 )}
                 {hasAccess('penilai-rw') && (
                   <button onClick={() => { setActiveMenu('penilai-rw'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors ${activeMenu === 'penilai-rw' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                      <CheckSquare className="w-4 h-4 shrink-0" /> Penilaian RW
                   </button>
                 )}
                 {hasAccess('rekap-rt') && (
                   <button onClick={() => { setActiveMenu('rekap-rt'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors ${activeMenu === 'rekap-rt' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                      <ClipboardList className="w-4 h-4 shrink-0" /> Rekap Penilaian RT
                   </button>
                 )}
                 {hasAccess('rekap-rw') && (
                   <button onClick={() => { setActiveMenu('rekap-rw'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors ${activeMenu === 'rekap-rw' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                      <ClipboardList className="w-4 h-4 shrink-0" /> Rekap Penilaian RW
                   </button>
                 )}
               </nav>
             </div>
           )}
           
           {hasAccess('users') && (
             <div className="mt-6 mb-2">
               <p className="px-5 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Sistem</p>
               <nav className="space-y-0.5 px-2">
                 <button onClick={() => { setActiveMenu('users'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors ${activeMenu === 'users' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <Users className="w-4 h-4 shrink-0" /> Manajemen Pengguna
                 </button>
               </nav>
             </div>
           )}
           <div className="mt-auto pt-6 mb-2">
             <nav className="space-y-0.5 px-2">
               <button onClick={() => { localStorage.removeItem('isAuthenticated'); localStorage.removeItem('username'); localStorage.removeItem('userRole'); setIsAuthenticated(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100`}>
                  <LogOut className="w-4 h-4 shrink-0" /> Keluar
               </button>
             </nav>
           </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f8fafc]">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0 z-10 shadow-sm relative">
           <div className="flex items-center gap-3 md:gap-4">
             <button 
               className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-md"
               onClick={() => setIsSidebarOpen(true)}
             >
               <Menu size={24} />
             </button>
             <div className="w-8 h-8 rounded shrink-0 items-center justify-center bg-slate-50 border border-slate-200 hidden md:flex">
               <Navigation className="w-4 h-4 text-slate-500 rotate-90" />
             </div>
             <div>
               <h1 className="font-bold text-slate-800 text-sm md:text-base leading-tight tracking-tight">KECAMATAN UJUNG PANDANG | KOTA MAKASSAR</h1>
               <p className="text-[11px] md:text-xs text-red-600 font-bold uppercase tracking-wider mt-0.5">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</p>
             </div>
           </div>

           <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2">
                <span className="bg-purple-600 text-white font-bold px-3 py-1 rounded text-sm shadow-sm">2026</span>
             </div>
             <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                 <Shield className="w-4 h-4 text-slate-600" />
               </div>
               <div className="text-sm font-bold text-slate-700 hidden lg:block">User {username || 'Kecamatan'}</div>
             </div>
           </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
           {activeMenu === 'dashboard' && hasAccess('dashboard') && <DashboardCamat />}
           {activeMenu === 'input-rt' && hasAccess('input-rt') && <FormInputKinerja type="RT" />}
           {activeMenu === 'input-rw' && hasAccess('input-rw') && <FormInputKinerja type="RW" />}
           {activeMenu === 'penilai-rt' && hasAccess('penilai-rt') && <FormPenilaian type="RT" />}
           {activeMenu === 'penilai-rw' && hasAccess('penilai-rw') && <FormPenilaian type="RW" />}
           
           {activeMenu === 'data-rtrw' && hasAccess('data-rtrw') && <DataRTRW />}
           {activeMenu === 'rekap-rt' && hasAccess('rekap-rt') && <RekapPenilaian type="RT" />}
           {activeMenu === 'rekap-rw' && hasAccess('rekap-rw') && <RekapPenilaian type="RW" />}
           {activeMenu === 'users' && hasAccess('users') && <UserManagement />}
        </main>
      </div>
    </div>
  );
}
