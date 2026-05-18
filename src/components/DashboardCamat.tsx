import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { Users, FileText, Wallet, CheckCircle2, AlertCircle, Building2, TrendingUp, Trophy, BarChart3 } from 'lucide-react';

const mockChartData = [
  { name: 'Lorong Wisata', score: 85 },
  { name: 'Bank Sampah', score: 72 },
  { name: 'Sombere & Smart City', score: 90 },
  { name: 'Buku Administrasi', score: 95 },
  { name: 'Data Penduduk', score: 88 },
  { name: 'Kerawanan Sosial', score: 80 },
  { name: 'Kerawanan Bencana', score: 75 },
  { name: 'Retribusi Sampah', score: 82 },
  { name: 'PBB', score: 86 },
];

const mockRanking = [
  { rank: 1, unit: 'RT 001 / RW 002', kelurahan: 'Losari', score: 92, status: 'Sangat Baik', validation: 'Valid' },
  { rank: 2, unit: 'RT 003 / RW 001', kelurahan: 'Bulogading', score: 89, status: 'Sangat Baik', validation: 'Valid' },
  { rank: 3, unit: 'RT 002 / RW 004', kelurahan: 'Pisang Utara', score: 85, status: 'Baik', validation: 'Valid' },
  { rank: 4, unit: 'RT 001 / RW 001', kelurahan: 'Pusung', score: 81, status: 'Baik', validation: 'Valid' },
  { rank: 5, unit: 'RT 005 / RW 002', kelurahan: 'Maloku', score: 78, status: 'Cukup', validation: 'Perlu Klarifikasi' },
];

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd']; // Purple shades

export const DashboardCamat = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700 zoom-in-95 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 border-l-4 border-purple-600 pl-3">
            Dashboard Analis Kinerja RT/RW - Kecamatan Ujung Pandang
          </h2>
          <p className="text-slate-500 mt-1 pl-4 text-sm font-medium">Berdasarkan data input kinerja terbaru.</p>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white shadow-sm border border-slate-200 rounded-2xl relative overflow-hidden group hover:border-purple-200 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total RT/RW Dinilai</p>
                <h3 className="text-4xl font-black text-slate-900 mt-2">142</h3>
                <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" /> +12 dari bulan lalu
                </p>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-slate-200 rounded-2xl relative overflow-hidden group hover:border-indigo-200 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Rata-Rata Skor</p>
                <div className="flex items-baseline gap-1 mt-2">
                  <h3 className="text-4xl font-black text-slate-900">84.5</h3>
                  <span className="text-slate-400 font-bold text-lg">/100</span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-2 flex items-center">
                  Kategori: <Badge variant="outline" className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200">Sangat Baik</Badge>
                </p>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                <BarChart3 size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-slate-200 rounded-2xl relative overflow-hidden group hover:border-emerald-200 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Realisasi Keuangan</p>
                <h3 className="text-2xl font-black text-slate-900 mt-2">Rp 4.25B</h3>
                <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" /> 88% Capaian dari Target
                </p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                <Wallet size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* PERFORMANCE CHART */}
        <Card className="shadow-sm border border-slate-200 bg-white rounded-2xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Rata-Rata Indikator Kinerja Kecamatan
            </CardTitle>
            <CardDescription className="text-slate-500">
              Skor rata-rata berdasarkan 9 indikator penilaian (Skala 1-100).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={140} tick={{ fill: '#475569', fontSize: 13 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={20}>
                    {
                      mockChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.score > 85 ? '#8b5cf6' : entry.score > 75 ? '#a78bfa' : '#cbd5e1'} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* RANKING TABLE */}
        <Card className="shadow-sm border border-slate-200 bg-white rounded-2xl flex flex-col">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Top 5 Kinerja RT Terbaik
            </CardTitle>
            <CardDescription className="text-slate-500">
              Peringkat berdasarkan akumulasi skor akhir.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <div className="overflow-x-auto h-full">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-xl">Peringkat</th>
                    <th className="px-6 py-4">Unit RT/RW</th>
                    <th className="px-6 py-4">Total Skor</th>
                    <th className="px-6 py-4 rounded-tr-xl">Status Validasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mockRanking.map((row) => (
                    <tr key={row.rank} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold
                          ${row.rank === 1 ? 'bg-amber-400' : row.rank === 2 ? 'bg-slate-300' : row.rank === 3 ? 'bg-amber-600' : 'bg-slate-100 text-slate-600'}
                        `}>
                          {row.rank}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        <p className="font-bold text-slate-900">{row.unit}</p>
                        <p className="text-xs text-slate-500">Kel. {row.kelurahan}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-base">{row.score}</span>
                          <Badge variant="outline" className={`text-xs ml-1 ${row.score >= 85 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                            {row.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className={`font-medium gap-1 flex items-center w-fit ${row.validation === 'Valid' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}>
                          {row.validation === 'Valid' ? <CheckCircle2 size={12}/> : <AlertCircle size={12}/>}
                          {row.validation}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
};
