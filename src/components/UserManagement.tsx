import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, AlertCircle, CheckCircle2, Loader2, Edit, Trash2, MapPin, Shield, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { saveToGoogleSheet, fetchFromGoogleSheet } from '../services/sheetsService';

const KELURAHAN_OPTIONS = [
  "Baru", "Bulogading", "Lae-Lae", "Lajangiru", "Losari",
  "Maloku", "Mangkura", "Pisang Selatan", "Pisang Utara", "Sawerigading", "Tidak Ada / Kecamatan"
];

export const UserManagement = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin');
  const [kelurahan, setKelurahan] = useState('Tidak Ada / Kecamatan');
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [expandedKelurahan, setExpandedKelurahan] = useState<Record<string, boolean>>({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{show: boolean, type: 'success' | 'error', title: string, message: string} | null>(null);

  const loadUsers = async () => {
    setLoadingUsers(true);
    const res = await fetchFromGoogleSheet('Users', true);
    if (res.success && typeof res.data === 'object' && Array.isArray(res.data)) {
      // Menambahkan index dan filter row kosong
      const validUsers = res.data
        .map((u: any, idx: number) => ({ ...u, rowIndex: idx + 2 }))
        .filter((u: any) => u.Username && u.Username.toString().trim() !== '');
      setUsers(validUsers);
    }
    setLoadingUsers(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleEdit = (user: any) => {
    setUsername(user.Username || '');
    setPassword(user.Password || '');
    setRole(user.Role || 'Admin');
    setKelurahan(user.Kelurahan || 'Tidak Ada / Kecamatan');
    setEditingRow(user.rowIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (rowIndex: number) => {
    if (!window.confirm("Yakin ingin menghapus user ini?")) return;
    
    setIsLoading(true);
    setNotification(null);
    try {
      const payload = {
        action: 'delete',
        sheetName: 'Users',
        rowIndex: rowIndex
      };
      const res = await saveToGoogleSheet(payload);
      if (res.success) {
        setNotification({
          show: true,
          type: 'success',
          title: 'Berhasil',
          message: 'Pengguna berhasil dihapus!'
        });
        loadUsers();
      } else {
        setNotification({
          show: true,
          type: 'error',
          title: 'Gagal',
          message: res.message || 'Gagal menghapus user.'
        });
      }
    } catch (err) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'Terjadi kesalahan sistem.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !role) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Peringatan',
        message: 'Semua kolom harus diisi!'
      });
      return;
    }

    setIsLoading(true);
    setNotification(null);

    try {
      const payload: any = {
        sheetName: 'Users',
        Username: username,
        Password: password,
        Role: role,
        Kelurahan: kelurahan !== 'Tidak Ada / Kecamatan' ? kelurahan : '',
        Timestamp: new Date().toISOString()
      };

      if (editingRow) {
        payload.action = 'edit';
        payload.rowIndex = editingRow;
      } else {
        payload.action = 'create';
      }

      const res = await saveToGoogleSheet(payload);
      
      if (res.success) {
        setNotification({
          show: true,
          type: 'success',
          title: 'Berhasil',
          message: editingRow ? 'Pengguna berhasil diperbarui!' : 'Pengguna berhasil ditambahkan!' 
        });
        setUsername('');
        setPassword('');
        setRole('Admin');
        setKelurahan('Tidak Ada / Kecamatan');
        setEditingRow(null);
        loadUsers();
      } else {
        setNotification({
          show: true,
          type: 'error',
          title: 'Gagal',
          message: res.message || 'Gagal menyimpan data.' 
        });
      }
    } catch (err) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'Terjadi kesalahan sistem.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Group users by Kelurahan
  const groupedUsers = users.reduce((acc, user) => {
    const k = user.Kelurahan || 'Kecamatan / Eksternal';
    if (!acc[k]) acc[k] = [];
    acc[k].push(user);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Pengguna</h1>
          <p className="text-slate-500 text-sm">Tambahkan akun login baru untuk aplikasi e-Kinerja.</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-4 items-start shadow-sm mb-6">
        <AlertCircle className="text-yellow-600 shrink-0 mt-0.5 w-5 h-5" />
        <div className="space-y-1">
          <h3 className="font-bold text-yellow-900 text-sm">Update Spreadsheet Dibutuhkan</h3>
          <p className="text-sm text-yellow-800">
            Pastikan Anda telah menambahkan kolom <strong className="font-mono">Kelurahan</strong> pada sheet <strong>Users</strong> (baris pertama) jika Anda ingin menyimpan data Kelurahan.
          </p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg">{editingRow ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</CardTitle>
          <CardDescription>Masukkan detail kredensial untuk pengguna.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSaveUser} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="font-semibold text-slate-700 mt-2">Username</Label>
                <Input 
                  id="username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: admin_ujp" 
                  className="bg-slate-50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-semibold text-slate-700 mt-2">Password</Label>
                <Input 
                  id="password" 
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password" 
                  className="bg-slate-50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role" className="font-semibold text-slate-700 mt-2">Role Akses</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="bg-slate-50">
                    <SelectValue placeholder="Pilih Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin Kecamatan</SelectItem>
                    <SelectItem value="Penilai">Penilai Lapangan (Lurah)</SelectItem>
                    <SelectItem value="Pimpinan">Pimpinan / Camat</SelectItem>
                    <SelectItem value="RT">Ketua RT</SelectItem>
                    <SelectItem value="RW">Ketua RW</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kelurahan" className="font-semibold text-slate-700 mt-2">Wilayah Kelurahan</Label>
                <Select value={kelurahan} onValueChange={setKelurahan}>
                  <SelectTrigger className="bg-slate-50">
                    <SelectValue placeholder="Pilih Kelurahan" />
                  </SelectTrigger>
                  <SelectContent>
                    {KELURAHAN_OPTIONS.map((k) => (
                      <SelectItem key={k} value={k}>{k}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="w-full md:w-auto mt-6 bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> {editingRow ? 'Update Pengguna' : 'Simpan Pengguna'}</>
                )}
              </Button>
              {editingRow && (
                <Button type="button" variant="outline" className="w-full md:w-auto mt-6" onClick={() => { setEditingRow(null); setUsername(''); setPassword(''); setRole('Admin'); setKelurahan('Tidak Ada / Kecamatan'); }}>
                  Batal Edit
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Daftar Pengguna</h2>
          <p className="text-slate-500 text-sm">Kelola kredensial pengguna, dikelompokkan berdasarkan kelurahan.</p>
        </div>

        {loadingUsers ? (
          <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
            Belum ada data pengguna aktif.
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedUsers).sort().map(([kelName, kelUsers]) => {
              const usersArr = kelUsers as any[];
              const isExpanded = expandedKelurahan[kelName];
              return (
              <div key={kelName} className="space-y-3 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <button 
                  onClick={() => setExpandedKelurahan(prev => ({...prev, [kelName]: !prev[kelName]}))}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{kelName}</h3>
                      <p className="text-xs text-slate-500">{usersArr.length} pengguna terdaftar</p>
                    </div>
                  </div>
                  <div className="text-slate-400">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                </button>
                
                {isExpanded && (
                <div className="p-4 pt-0 grid grid-cols-1 gap-3">
                  {usersArr.map((user: any, idx: number) => (
                    <div key={idx} className="bg-white border text-sm border-slate-200 rounded-lg p-3 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-purple-200 transition-colors shadow-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-base">{user.Username}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            user.Role === 'Admin' || user.Role === 'Pimpinan' ? 'bg-amber-100 text-amber-800' :
                            user.Role === 'RT' ? 'bg-blue-100 text-blue-800' :
                            user.Role === 'RW' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-purple-100 text-purple-800' // Penilai
                          }`}>
                            {user.Role}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                           <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> PW: {user.Password}</span>
                           {user.Timestamp && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(user.Timestamp).toLocaleDateString('id-ID')}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(user)} className="h-8 gap-1 border-blue-200 text-blue-700 hover:bg-blue-50">
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(user.rowIndex)} className="h-8 gap-1 border-rose-200 text-rose-700 hover:bg-rose-50">
                          <Trash2 className="w-3.5 h-3.5" /> Hapus
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>
            )})}
          </div>
        )}
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

