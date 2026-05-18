import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Shield, KeyRound, AlertCircle, Loader2 } from 'lucide-react';
import { fetchFromGoogleSheet } from '../services/sheetsService';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login = ({ onLoginSuccess }: LoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Coba ambil dari Spreadsheet sheet "Users" dengan disable cache untuk login
      const res = await fetchFromGoogleSheet('Users', true);
      
      let isValid = false;

      // Bypass Hardcoded credentials for super admin
      if (username === 'admin' && password === 'samiun15') {
        isValid = true;
        localStorage.setItem('userRole', 'Admin');
      } else if (res.success && res.data && res.data.length > 0) {
        // Cek login ke database (Google Sheets)
        // Kolom sesuai instruksi: Username, Password
        const user = res.data.find(
          (u: any) => u.Username === username && String(u.Password) === password
        );
        
        if (user) {
          isValid = true;
          // Opsional: simpan role ke local storage jika perlu
          if (user.Role) {
            localStorage.setItem('userRole', user.Role);
          } else {
            localStorage.setItem('userRole', 'Admin'); // fallback Default jika tidak ada
          }
          if (user.Kelurahan) {
            localStorage.setItem('userKelurahan', user.Kelurahan);
          } else {
            localStorage.setItem('userKelurahan', 'Tidak Ada / Kecamatan');
          }
        }
      }

      if (isValid) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', username);
        if (username === 'admin' && password === 'samiun15') {
            localStorage.setItem('userKelurahan', 'Tidak Ada / Kecamatan');
        }
        onLoginSuccess();
      } else {
        setError('Username atau password salah. Silakan coba lagi.');
      }
    } catch (err) {
      console.error(err);
      // Fallback ke hardcoded jika API gagal/belum siap
      if (username === 'admin' && password === 'samiun15') {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', username);
        onLoginSuccess();
      } else {
        setError('Terjadi kesalahan saat memverifikasi login atau database Users belum siap.');
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 z-10" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
      
      <Card className="w-full max-w-md shadow-2xl border-0 relative z-10 bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-purple-600" />
        
        <CardHeader className="space-y-3 pb-6 pt-8 px-8 border-b border-slate-100">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center shadow-inner">
              <Shield size={32} className="text-purple-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-extrabold text-center text-slate-800 tracking-tight">EKIN-RTRW</CardTitle>
          <CardDescription className="text-center text-slate-500 font-medium">
            Sistem Evaluasi Kinerja RT/RW<br/>Kecamatan Ujung Pandang
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 px-8 pb-8">
          <form onSubmit={handleLogin} className="space-y-5">
            
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-sm font-medium flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
            
            <div className="space-y-2 relative">
              <Label htmlFor="username" className="text-slate-700 font-bold text-sm">Username</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Shield size={16} />
                </div>
                <Input 
                  id="username" 
                  type="text" 
                  placeholder="Masukkan username" 
                  required 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 h-11 bg-slate-50 border-slate-200 focus-visible:ring-purple-600 focus-visible:ring-opacity-50 transition-all rounded-xl"
                />
              </div>
            </div>
            
            <div className="space-y-2 relative">
              <Label htmlFor="password" className="text-slate-700 font-bold text-sm">Password</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound size={16} />
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Masukkan password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 bg-slate-50 border-slate-200 focus-visible:ring-purple-600 focus-visible:ring-opacity-50 transition-all rounded-xl"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-11 mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memeriksa Kredensial...</>
              ) : (
                'Masuk Aplikasi'
              )}
            </Button>
            
          </form>
        </CardContent>
        <div className="bg-slate-50 text-center py-4 text-xs font-semibold text-slate-400 border-t border-slate-100">
          &copy; {new Date().getFullYear()} Kecamatan Ujung Pandang, Makassar
        </div>
      </Card>
    </div>
  );
};
