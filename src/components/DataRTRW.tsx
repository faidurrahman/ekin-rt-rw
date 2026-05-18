import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Printer,
  FileDown,
  Plus,
  Edit,
  Trash2,
  Search,
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import {
  fetchFromGoogleSheet,
  saveToGoogleSheet,
} from "../services/sheetsService";

export const DataRTRW = () => {
  const [view, setView] = useState<"list" | "form">("list");
  const [activeTab, setActiveTab] = useState<"aktif" | "tidak-aktif">("aktif");

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [notification, setNotification] = useState<{show: boolean, type: 'success' | 'error', title: string, message: string} | null>(null);
  const [selectedKelurahan, setSelectedKelurahan] = useState<string>("Semua");

  const KELURAHAN_OPTIONS = [
    "Baru", "Bulogading", "Lae-Lae", "Lajangiru", "Losari",
    "Maloku", "Mangkura", "Pisang Selatan", "Pisang Utara", "Sawerigading"
  ];

  // Form State
  const [formData, setFormData] = useState({
    kelurahan: "KELURAHAN MANGKURA",
    nik: "",
    nama: "",
    jabatan: "",
    rw: "",
    rt: "",
    tglMulai: "",
    noSk: "",
    tglSk: "",
    status: "aktif",
    tahunJabatan: "2026",
    telp: "",
    rek: "",
    npwp: "",
    alamat: "",
  });

  const loadData = async (forceRefresh = false) => {
    setLoading(true);
    const res = await fetchFromGoogleSheet("DataRTRW", forceRefresh);
    if (res.success) {
      const validData = res.data.map((u: any, idx: number) => ({ ...u, rowIndex: idx + 2 }));
      setData(validData);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const payload: any = {
      sheetName: "DataRTRW",
      ...formData,
    };
    if (editingRow) {
      payload.action = 'edit';
      payload.rowIndex = editingRow;
    } else {
      payload.action = 'create';
    }
    const res = await saveToGoogleSheet(payload);
    setSaving(false);
    if (res.success) {
      setNotification({
        show: true,
        type: 'success',
        title: 'Berhasil',
        message: editingRow ? 'Data berhasil diperbarui!' : 'Data berhasil disimpan!'
      });
      setView("list");
      setEditingRow(null);
      setFormData({
        kelurahan: "KELURAHAN MANGKURA",
        nik: "",
        nama: "",
        jabatan: "",
        rw: "",
        rt: "",
        tglMulai: "",
        noSk: "",
        tglSk: "",
        status: "aktif",
        tahunJabatan: "2026",
        telp: "",
        rek: "",
        npwp: "",
        alamat: "",
      });
      loadData(true);
    } else {
      setNotification({
        show: true,
        type: 'error',
        title: 'Gagal',
        message: 'Gagal menyimpan data.'
      });
    }
  };

  const handleEdit = (row: any) => {
    setFormData({
      kelurahan: row.kelurahan || row.Kelurahan || row.KELURAHAN || "KELURAHAN MANGKURA",
      nik: row.nik || row.NIK || "",
      nama: row.nama || row.Nama || row.NAMA || "",
      jabatan: row.jabatan || row.Jabatan || row.JABATAN || "",
      rw: row.rw || row.RW || "",
      rt: row.rt || row.RT || "",
      tglMulai: (row.tglMulai || row["Tanggal Mulai"] || row["TGL MULAI"])?.substring?.(0, 10) || "",
      noSk: row.noSk || row.NoSK || row["NO SK"] || "",
      tglSk: (row.tglSk || row.TglSk || row["TGL SK"])?.substring?.(0, 10) || "",
      status: (row.status || row.Status || row.STATUS || "aktif").toLowerCase(),
      tahunJabatan: row.tahunJabatan || row.TahunJabatan || row["TAHUN JABATAN"] || "2026",
      telp: row.telp || row["No Telp"] || row["NO TELP"] || "",
      rek: row.rek || row["No Rekening"] || row["NO REKENING"] || "",
      npwp: row.npwp || row.NPWP || "",
      alamat: row.alamat || row.Alamat || row.ALAMAT || "",
    });
    setEditingRow(row.rowIndex);
    setView("form");
  };

  const renderList = () => (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Data RT/RW</h2>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={activeTab === "aktif" ? "default" : "outline"}
          className={`rounded-none ${activeTab === "aktif" ? "bg-emerald-600 hover:bg-emerald-700" : "text-slate-600"}`}
          onClick={() => setActiveTab("aktif")}
        >
          AKTIF
        </Button>
        <Button
          variant={activeTab === "tidak-aktif" ? "default" : "outline"}
          className={`rounded-none ${activeTab === "tidak-aktif" ? "bg-red-500 hover:bg-red-600" : "text-slate-600"}`}
          onClick={() => setActiveTab("tidak-aktif")}
        >
          TIDAK AKTIF
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button 
          variant={selectedKelurahan === "Semua" ? "default" : "outline"} 
          size="sm"
          className={`rounded-full ${selectedKelurahan === "Semua" ? "bg-purple-600 hover:bg-purple-700 text-white" : "text-slate-600"}`}
          onClick={() => setSelectedKelurahan("Semua")}
        >
          Semua Kelurahan
        </Button>
        {KELURAHAN_OPTIONS.map(kel => (
          <Button 
            key={kel}
            variant={selectedKelurahan === kel ? "default" : "outline"} 
            size="sm"
            className={`rounded-full ${selectedKelurahan === kel ? "bg-purple-600 hover:bg-purple-700 text-white" : "text-slate-600"}`}
            onClick={() => setSelectedKelurahan(kel)}
          >
            {kel}
          </Button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 p-3 border rounded-lg">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm font-bold text-slate-700">Kolom</span>
          <Select defaultValue="nama">
            <SelectTrigger className="w-[120px] bg-white">
              <SelectValue placeholder="Pilih Kolom" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nama">Nama</SelectItem>
              <SelectItem value="nik">NIK</SelectItem>
              <SelectItem value="kelurahan">Kelurahan</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex-1 max-w-[200px] flex">
            <Input className="rounded-r-none bg-white" placeholder="Cari..." />
            <Button
              variant="outline"
              className="rounded-l-none border-l-0 px-3 bg-white"
            >
              <Search size={16} />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 h-9"
            onClick={() => loadData(true)}
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <Loader2 size={16} className="mr-2" />
            )}{" "}
            Muat Ulang
          </Button>
          <Button size="sm" className="bg-sky-500 hover:bg-sky-600 h-9">
            <Printer size={16} className="mr-2" /> Cetak Pdf
          </Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-9">
            <FileDown size={16} className="mr-2" /> Cetak Excel
          </Button>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 h-9"
            onClick={() => setView("form")}
          >
            <Plus size={16} className="mr-2" /> Tambah
          </Button>
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead className="bg-purple-800 text-white font-semibold">
              <tr>
                <th className="px-4 py-3 border-r border-purple-700 text-center">
                  NO.
                </th>
                <th className="px-4 py-3 border-r border-purple-700">
                  KELURAHAN
                </th>
                <th className="px-4 py-3 border-r border-purple-700">NIK</th>
                <th className="px-4 py-3 border-r border-purple-700">NAMA</th>
                <th className="px-4 py-3 border-r border-purple-700">
                  JABATAN
                </th>
                <th className="px-4 py-3 border-r border-purple-700 text-center">
                  RW
                </th>
                <th className="px-4 py-3 border-r border-purple-700 text-center">
                  RT
                </th>
                <th className="px-4 py-3 border-r border-purple-700">
                  TGL MULAI
                </th>
                <th className="px-4 py-3 border-r border-purple-700 text-center">
                  STATUS
                </th>
                <th className="px-4 py-3 border-r border-purple-700">ALAMAT</th>
                <th className="px-4 py-3 border-r border-purple-700">
                  NO TELP
                </th>
                <th className="px-4 py-3 border-r border-purple-700">NO REKENING</th>
                <th className="px-4 py-3 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={13}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
                    Memuat data dari Spreadsheet...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={13}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Belum ada data. Silakan tambah data baru atau pastikan Apps
                    Script sudah berjalan.
                  </td>
                </tr>
              ) : (
                data
                  .filter((r) => {
                    const statusStr = (r.status || r.Status || r.STATUS || "").toLowerCase();
                    const rKel = (r.kelurahan || r.Kelurahan || r.KELURAHAN || "").toUpperCase();
                    const isStatusMatch = activeTab === "aktif"
                      ? statusStr === "aktif"
                      : statusStr !== "aktif";
                      
                    const isKelMatch = selectedKelurahan === "Semua" || selectedKelurahan === "Semua Kelurahan" || rKel.includes(selectedKelurahan.toUpperCase());

                    return isStatusMatch && isKelMatch;
                  })
                  .map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 border-r text-center">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 border-r">
                        {row.kelurahan || row.Kelurahan || row.KELURAHAN}
                      </td>
                      <td className="px-4 py-3 border-r">
                        {row.nik || row.NIK}
                      </td>
                      <td className="px-4 py-3 border-r">
                        {row.nama || row.Nama || row.NAMA}
                      </td>
                      <td className="px-4 py-3 border-r">
                        {row.jabatan || row.Jabatan || row.JABATAN}
                      </td>
                      <td className="px-4 py-3 border-r text-center">
                        {row.rw || row.RW}
                      </td>
                      <td className="px-4 py-3 border-r text-center">
                        {row.rt || row.RT}
                      </td>
                      <td className="px-4 py-3 border-r">
                        {(row.tglMulai || row["Tanggal Mulai"] || row["TGL MULAI"])?.substring
                          ? (row.tglMulai || row["Tanggal Mulai"] || row["TGL MULAI"]).substring(
                              0,
                              10,
                            )
                          : ""}
                      </td>
                      <td className="px-4 py-3 border-r text-center">
                        {row.status || row.Status || row.STATUS}
                      </td>
                      <td className="px-4 py-3 border-r truncate max-w-[200px]">
                        {row.alamat || row.Alamat || row.ALAMAT}
                      </td>
                      <td className="px-4 py-3 border-r">
                        {row.telp || row["No Telp"] || row["NO TELP"]}
                      </td>
                      <td className="px-4 py-3 border-r">
                        {row.rek || row["No Rekening"] || row["NO REKENING"]}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 gap-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                          onClick={() => handleEdit(row)}
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </Button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderForm = () => (
    <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
      <div className="flex items-center justify-between border-b pb-4 border-blue-800">
        <h2 className="text-xl font-bold text-slate-800">Data RT/RW</h2>
      </div>

      <Card className="bg-slate-50 border-slate-200 rounded-none border-t-2 border-t-blue-800 border-x-0 shadow-none">
        <CardContent className="p-4 space-y-6 relative pt-6">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-slate-300"></div>
          <h3 className="font-semibold text-slate-700 text-sm">Form Isian</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-red-600 font-bold text-xs uppercase">
                Kelurahan *
              </Label>
              <Input
                value="KELURAHAN MANGKURA"
                readOnly
                className="bg-slate-100 border-slate-300 text-slate-500 rounded-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-red-600 font-bold text-xs uppercase">
                  NIK *
                </Label>
                <Input
                  className="border-slate-300 rounded-sm bg-white"
                  value={formData.nik}
                  onChange={(e) =>
                    setFormData({ ...formData, nik: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-1">
                <Label className="text-red-600 font-bold text-xs uppercase">
                  Nama Lengkap *
                </Label>
                <Input
                  className="border-slate-300 rounded-sm bg-white"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-red-600 font-bold text-xs uppercase">
                  Jabatan RT/RW *
                </Label>
                <Select
                  value={formData.jabatan}
                  onValueChange={(v) =>
                    setFormData({ ...formData, jabatan: v })
                  }
                >
                  <SelectTrigger className="bg-white border-slate-300 rounded-sm">
                    <SelectValue placeholder="-- Pilih --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ketua RT">Ketua RT</SelectItem>
                    <SelectItem value="Ketua RW">Ketua RW</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-red-600 font-bold text-xs uppercase">
                  Tanggal Mulai Menjabat *
                </Label>
                <Input
                  type="date"
                  className="border-slate-300 rounded-sm bg-white"
                  value={formData.tglMulai}
                  onChange={(e) =>
                    setFormData({ ...formData, tglMulai: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-red-600 font-bold text-xs uppercase">
                  RT *
                </Label>
                <Input
                  className="border-slate-300 rounded-sm bg-white"
                  placeholder="Contoh: 001"
                  value={formData.rt}
                  onChange={(e) =>
                    setFormData({ ...formData, rt: e.target.value })
                  }
                  disabled={formData.jabatan === "Ketua RW"}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-red-600 font-bold text-xs uppercase">
                  RW *
                </Label>
                <Input
                  className="border-slate-300 rounded-sm bg-white"
                  placeholder="Contoh: 001"
                  value={formData.rw}
                  onChange={(e) =>
                    setFormData({ ...formData, rw: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-red-600 font-bold text-xs uppercase">
                  Nomor SK *
                </Label>
                <Input
                  className="border-slate-300 rounded-sm bg-white"
                  value={formData.noSk}
                  onChange={(e) =>
                    setFormData({ ...formData, noSk: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-red-600 font-bold text-xs uppercase">
                  Tanggal SK *
                </Label>
                <Input
                  type="date"
                  className="border-slate-300 rounded-sm bg-white"
                  value={formData.tglSk}
                  onChange={(e) =>
                    setFormData({ ...formData, tglSk: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-red-600 font-bold text-xs uppercase">
                    Status *
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) =>
                      setFormData({ ...formData, status: v })
                    }
                  >
                    <SelectTrigger className="bg-white border-slate-300 rounded-sm">
                      <SelectValue placeholder="-- Pilih --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aktif">Aktif</SelectItem>
                      <SelectItem value="tidak_aktif">Tidak Aktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-red-600 font-bold text-xs uppercase">
                    Tahun Jabatan *
                  </Label>
                  <Input
                    value="2026"
                    readOnly
                    className="bg-slate-100 border-slate-300 text-slate-500 rounded-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="uppercase font-bold text-orange-600 text-sm tracking-wider border-b-2 border-orange-600 pb-2">
              INFORMASI TAMBAHAN
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700 text-xs">
                  No. Telp
                </Label>
                <Input
                  className="border-slate-300 rounded-sm bg-white"
                  value={formData.telp}
                  onChange={(e) =>
                    setFormData({ ...formData, telp: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700 text-xs">
                  No. Rekening
                </Label>
                <Input
                  className="border-slate-300 rounded-sm bg-white"
                  value={formData.rek}
                  onChange={(e) =>
                    setFormData({ ...formData, rek: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700 text-xs">
                  No. NPWP
                </Label>
                <Input
                  className="border-slate-300 rounded-sm bg-white"
                  value={formData.npwp}
                  onChange={(e) =>
                    setFormData({ ...formData, npwp: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-1"></div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700 text-xs">Alamat</Label>
              <Textarea
                className="min-h-[80px] bg-white border-slate-300 rounded-sm"
                value={formData.alamat}
                onChange={(e) =>
                  setFormData({ ...formData, alamat: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm h-9 px-4"
            >
              {saving ? "Menyimpan..." : (editingRow ? "Update" : "Simpan")}
            </Button>
            <Button
              variant="destructive"
              className="bg-red-500 hover:bg-red-600 text-white rounded-sm h-9 px-4"
              onClick={() => {
                setView("list");
                setEditingRow(null);
                setFormData({
                  kelurahan: "KELURAHAN MANGKURA",
                  nik: "",
                  nama: "",
                  jabatan: "",
                  rw: "",
                  rt: "",
                  tglMulai: "",
                  noSk: "",
                  tglSk: "",
                  status: "aktif",
                  tahunJabatan: "2026",
                  telp: "",
                  rek: "",
                  npwp: "",
                  alamat: "",
                });
              }}
            >
              Batal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      {view === "list" ? renderList() : renderForm()}
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
    </>
  );
};
