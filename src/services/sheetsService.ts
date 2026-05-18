// ========================================
// 🚀 CONFIG
// ========================================
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz04wI2LGqoLSGenXaH1zZBMP9viIoodyAKqHvvTyFw3DybQonntG-422BOD-v_W3fB/exec";


// ========================================
// 📥 SIMPAN / UPDATE / DELETE DATA
// ========================================
export const saveToGoogleSheet = async (data: any) => {
  try {
    const payload = {
      action: data.action || 'create',
      ...data,
      sheetName: data.sheetName || "Data_Berkas",
      parentFolderId: "1pfTfPZxK4wFAhMkIfGgz19TNMyTJzJwR"
    };

    console.log("🚀 KIRIM DATA:", payload);

    const response = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();

    let result;
    try {
      result = JSON.parse(text);
    } catch (err) {
      console.error("❌ RESPONSE BUKAN JSON:", text);
      return { success: false, message: "Response bukan JSON" };
    }

    console.log("✅ RESPONSE:", result);

    if (!result.success) {
      return {
        success: false,
        message: result.message || "Gagal dari server"
      };
    }

    // hapus cache biar data fresh
    localStorage.removeItem(`cache_${payload.sheetName}`);

    return result;

  } catch (err) {
    console.error("❌ ERROR SAVE:", err);

    return {
      success: false,
      message: (err as Error).message || "Network error"
    };
  }
};


// ========================================
// 📤 AMBIL DATA DARI SHEET
// ========================================
export const fetchFromGoogleSheet = async (sheetName = "DataRTRW", forceRefresh = false) => {
  const cacheKey = `cache_${sheetName}`;

  try {
    // ===== ambil dari cache dulu =====
    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        console.log("⚡ CACHE DIPAKAI");
        return { success: true, data: JSON.parse(cached) };
      }
    }

    // ===== fetch dari server =====
    const url = `${WEB_APP_URL}?sheetName=${encodeURIComponent(sheetName)}`;

    console.log("🌐 FETCH:", url);

    const response = await fetch(url, { method: "GET" });
    const text = await response.text();

    let result;
    try {
      result = JSON.parse(text);
    } catch (err) {
      console.error("❌ RESPONSE BUKAN JSON:", text);
      return { success: false, message: "Response bukan JSON" };
    }

    console.log("📥 DATA:", result);

    if (!result.success) {
      return { success: false, message: result.message };
    }

    // simpan cache (normalize keys first)
    const normalizedData = (result.data || []).map((row: any) => {
      const cleanRow: any = {};
      for (const k of Object.keys(row)) {
        cleanRow[k.trim()] = row[k];
      }
      return cleanRow;
    });

    localStorage.setItem(cacheKey, JSON.stringify(normalizedData));

    return {
      success: true,
      data: normalizedData
    };

  } catch (err) {
    console.error("❌ ERROR FETCH:", err);

    return {
      success: false,
      message: err.message || "Fetch error"
    };
  }
};