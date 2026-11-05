(function () {
  "use strict";

  const { qs, qsa, icon, openDialog, closeDialog, toast, rupiah, escapeHtml } = window.Nuvora;
  const store = window.NuvoraStore;
  const qtyFormat = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });
  const pointFormat = new Intl.NumberFormat("id-ID");
  const ui = {
    page: "ringkasan",
    requestedPage: "ringkasan",
    role: "admin",
    productCategory: "all",
    productPhoto: null,
    txPage: 1,
    txPageSize: 5,
    correctionTarget: null,
    memberTarget: null,
    memberHistoryTarget: null,
    backupTimer: null,
  };

  const seedTransactions = [
    {
      id: "tx86", time: "10.42", order: "#TRX-0086", cashier: "Dina Pratama", type: "Dine-in",
      payment: "QRIS manual", status: "lunas", sync: true, total: 48000, customer: "Meja 04",
      qrisRef: "QRIS-30A-118", cashGiven: null, change: null,
      items: [
        { name: "Paket Nuvora", qty: 1, price: 18000 },
        { name: "Beef Burger", qty: 1, price: 25000 },
        { name: "Extra Telur", qty: 1, price: 5000 },
      ],
    },
    {
      id: "tx85", time: "10.31", order: "#TRX-0085", cashier: "Dina Pratama", type: "Takeaway",
      payment: "Tunai", status: "lunas", sync: true, total: 36000, customer: "Walk-in",
      cashGiven: 50000, change: 14000, note: "",
      items: [
        { name: "Beef Burger", qty: 1, price: 25000 },
        { name: "Es Teh", qty: 1, price: 6000 },
        { name: "Extra Telur", qty: 1, price: 5000 },
      ],
    },
    {
      id: "tx84", time: "10.18", order: "#TRX-0084", cashier: "Raka Saputra", type: "Dine-in",
      payment: "Tunai", status: "lunas", sync: true, total: 27000, customer: "Meja 02",
      cashGiven: 30000, change: 3000, note: "",
      items: [
        { name: "Chicken Burger", qty: 1, price: 22000 },
        { name: "Air Mineral", qty: 1, price: 5000 },
      ],
    },
    {
      id: "tx83", time: "10.07", order: "#TRX-0083", cashier: "Sari Wulandari", type: "Delivery manual",
      payment: "QRIS manual", status: "lunas", sync: false, total: 65000, customer: "Pesanan WhatsApp",
      qrisRef: "QRIS-30A-117", cashGiven: null,
      note: "Tersimpan lokal di perangkat kasir. Menunggu sinkronisasi.",
      items: [
        { name: "Paket Hemat", qty: 1, price: 25000 },
        { name: "Beef Burger", qty: 1, price: 25000 },
        { name: "Kopi Susu", qty: 1, price: 15000 },
      ],
    },
    {
      id: "tx82", time: "09.56", order: "#TRX-0082", cashier: "Dina Pratama", type: "Takeaway",
      payment: "Tunai", status: "lunas", sync: true, total: 22000, customer: "Walk-in",
      cashGiven: 25000, change: 3000, note: "",
      items: [{ name: "Chicken Burger", qty: 1, price: 22000 }],
    },
    {
      id: "tx81", time: "09.42", order: "#TRX-0081", cashier: "Raka Saputra", type: "Dine-in",
      payment: "QRIS manual", status: "lunas", sync: false, total: 42000, customer: "Meja 06",
      qrisRef: "QRIS-30A-116", cashGiven: null,
      note: "Tersimpan lokal di perangkat kasir. Menunggu sinkronisasi.",
      items: [
        { name: "Chicken Burger", qty: 1, price: 22000 },
        { name: "Nasi Telur", qty: 1, price: 15000 },
        { name: "Air Mineral", qty: 1, price: 5000 },
      ],
    },
    {
      id: "tx80", time: "09.30", order: "#TRX-0080", cashier: "Dina Pratama", type: "Dine-in",
      payment: "Tunai", status: "refund", sync: true, total: 18000, customer: "Meja 03",
      cashGiven: 20000, change: 2000, note: "Refund penuh demo. Alasan: salah input metode pembayaran.",
      items: [{ name: "Paket Nuvora", qty: 1, price: 18000 }],
    },
    {
      id: "tx79", time: "09.12", order: "#TRX-0079", cashier: "Sari Wulandari", type: "Takeaway",
      payment: "Tunai", status: "lunas", sync: true, total: 31000, customer: "Walk-in",
      cashGiven: 50000, change: 19000, note: "",
      items: [
        { name: "Nasi Ayam", qty: 1, price: 20000 },
        { name: "Es Teh", qty: 1, price: 6000 },
        { name: "Air Mineral", qty: 1, price: 5000 },
      ],
    },
    {
      id: "tx78", date: "2026-09-29", time: "19.10", order: "#TRX-0078", cashier: "Dina Pratama", type: "Dine-in",
      payment: "Tunai", status: "lunas", sync: true, total: 33000, customer: "Meja 05",
      cashGiven: 50000, change: 17000, note: "",
      items: [
        { name: "Paket Nuvora", qty: 1, price: 18000 },
        { name: "Nasi Telur", qty: 1, price: 15000 },
      ],
    },
    {
      id: "tx77", date: "2026-09-12", time: "12.25", order: "#TRX-0077", cashier: "Raka Saputra", type: "Takeaway",
      payment: "QRIS manual", status: "lunas", sync: true, total: 27000, customer: "Walk-in",
      qrisRef: "QRIS-30A-109", cashGiven: null, note: "",
      items: [
        { name: "Chicken Burger", qty: 1, price: 22000 },
        { name: "Air Mineral", qty: 1, price: 5000 },
      ],
    },
    {
      id: "tx76", date: "2026-08-31", time: "20.03", order: "#TRX-0076", cashier: "Sari Wulandari", type: "Dine-in",
      payment: "Tunai", status: "lunas", sync: true, total: 36000, customer: "Meja 01",
      cashGiven: 40000, change: 4000, note: "",
      items: [
        { name: "Paket Hemat", qty: 1, price: 25000 },
        { name: "Es Teh", qty: 1, price: 6000 },
        { name: "Extra Telur", qty: 1, price: 5000 },
      ],
    },
    {
      id: "tx75", date: "2026-08-10", time: "11.14", order: "#TRX-0075", cashier: "Dina Pratama", type: "Takeaway",
      payment: "Tunai", status: "lunas", sync: true, total: 25000, customer: "Walk-in",
      cashGiven: 50000, change: 25000, note: "",
      items: [
        { name: "Nasi Ayam", qty: 1, price: 20000 },
        { name: "Air Mineral", qty: 1, price: 5000 },
      ],
    },
  ];

  const transactions = store.getTransactions();

  function isoDateFromText(value) {
    const text = String(value || "").trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
    const months = { jan: 1, feb: 2, mar: 3, apr: 4, mei: 5, jun: 6, jul: 7, agu: 8, sep: 9, okt: 10, nov: 11, des: 12 };
    const match = text.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
    if (!match) return "2026-10-30";
    const month = months[match[2].slice(0, 3).toLowerCase()] || 10;
    return `${match[3]}-${String(month).padStart(2, "0")}-${String(match[1]).padStart(2, "0")}`;
  }

  function seedToStoreTransaction(tx) {
    const order = tx.order || tx.id;
    return {
      id: order,
      order,
      date: isoDateFromText(tx.date),
      time: tx.time,
      cashier: tx.cashier,
      type: tx.type,
      payment: tx.payment,
      subtotal: tx.total,
      total: tx.total,
      sync: tx.sync !== false,
      status: tx.status || "lunas",
      cashGiven: tx.cashGiven ?? null,
      change: tx.change ?? null,
      cashAmount: tx.payment === "Tunai" ? tx.total : null,
      qrisAmount: null,
      rounding: 0,
      split: null,
      qrisRef: tx.qrisRef || null,
      note: tx.note || "",
      customer: tx.customer || "Walk-in",
      items: (tx.items || []).map((item) => ({ name: item.name, qty: item.qty, price: item.price })),
    };
  }

  function migrateSeedTransactions() {
    const keys = new Set(transactions.flatMap((tx) => [tx.id, tx.order].filter(Boolean)));
    let added = false;
    seedTransactions.forEach((seed) => {
      const order = seed.order || seed.id;
      if (!order || keys.has(order) || keys.has(seed.id)) return;
      transactions.push(seedToStoreTransaction(seed));
      keys.add(order);
      added = true;
    });
    if (added) store.saveTransactions();
  }

  migrateSeedTransactions();

  const products = store.getProducts();
  const members = store.getMembers();

  const ingredients = store.getIngredients();
  const stockMovements = store.getStockMovements();

  const opnameHistory = [
    { date: "29 Okt 2026 · 22.10", ingredient: "Ayam fillet", system: 2, physical: 1.8, actor: "Admin Demo", status: "Menunggu review", tone: "warning" },
    { date: "20 Okt 2026 · 21.45", ingredient: "Beras", system: 12, physical: 12.4, actor: "Admin Demo", status: "Disetujui", tone: "success" },
  ];

  const employees = store.getEmployees();

  const attendanceRecords = [
    { id: "a01", date: "30 Okt 2026", name: "Dina Pratama", role: "Kasir", in: "08.12", out: "—", location: "Dalam area", statusCode: "hadir", status: "Hadir", seed: "Masuk 08.12 · dalam area (simulasi)" },
    { id: "a02", date: "30 Okt 2026", name: "Raka Saputra", role: "Kasir", in: "08.04", out: "—", location: "Dalam area", statusCode: "hadir", status: "Hadir", seed: "Masuk 08.04 · dalam area (simulasi)" },
    { id: "a03", date: "30 Okt 2026", name: "Nadia Aulia", role: "Dapur", in: "07.58", out: "—", location: "Dalam area", statusCode: "hadir", status: "Hadir", seed: "Masuk 07.58 · dalam area (simulasi)" },
    { id: "a04", date: "30 Okt 2026", name: "Bima Kurnia", role: "Dapur", in: "08.21", out: "—", location: "Dalam area", statusCode: "terlambat", status: "Terlambat", seed: "Masuk 08.21 · dalam area (simulasi)" },
    { id: "a05", date: "29 Okt 2026", name: "Dina Pratama", role: "Kasir", in: "07.58", out: "16.05", location: "Dalam area", statusCode: "hadir", status: "Hadir", seed: "Masuk 07.58 · pulang 16.05" },
    { id: "a06", date: "29 Okt 2026", name: "Raka Saputra", role: "Kasir", in: "08.03", out: "15.45", location: "Di luar area", statusCode: "koreksi", status: "Perlu koreksi", seed: "Pulang 15.45 · tidak ada bukti lokasi" },
    { id: "a07", date: "29 Okt 2026", name: "Nadia Aulia", role: "Dapur", in: "07.55", out: "16.08", location: "Dalam area", statusCode: "hadir", status: "Hadir", seed: "Masuk 07.55 · pulang 16.08" },
    { id: "a08", date: "29 Okt 2026", name: "Sari Wulandari", role: "Pemimpin tim", in: "07.45", out: "17.10", location: "Dalam area", statusCode: "hadir", status: "Hadir", seed: "Masuk 07.45 · pulang 17.10" },
  ];

  const expenses = [
    { id: "x01", date: "30 Okt 2026", category: "Bahan baku", description: "Pembelian ayam fillet 5 kg", actor: "Admin Demo", receipt: true, amount: 225000 },
    { id: "x02", date: "30 Okt 2026", category: "Operasional", description: "Gas elpiji 3 kg", actor: "Sari", receipt: true, amount: 45000 },
    { id: "x03", date: "29 Okt 2026", category: "Bahan baku", description: "Sayur dan bumbu harian", actor: "Sari", receipt: false, amount: 185000 },
    { id: "x04", date: "28 Okt 2026", category: "Perawatan", description: "Servis kulkas kecil", actor: "Admin Demo", receipt: true, amount: 350000 },
    { id: "x05", date: "27 Okt 2026", category: "Lain-lain", description: "Plastik kemasan takeaway", actor: "Admin Demo", receipt: true, amount: 120000 },
    { id: "x06", date: "26 Okt 2026", category: "Operasional", description: "Listrik bulan Oktober", actor: "Admin Demo", receipt: true, amount: 150000 },
    { id: "x07", date: "25 Okt 2026", category: "Operasional", description: "Air bulan Oktober", actor: "Admin Demo", receipt: false, amount: 80000 },
    { id: "x08", date: "24 Okt 2026", category: "Lain-lain", description: "Kebersihan dan sampah", actor: "Admin Demo", receipt: true, amount: 90000 },
  ];

  let auditEvents = [
    { id: "au01", time: "30 Okt 2026 · 10.45", actor: "Admin Demo", action: "Refund penuh transaksi", object: "#TRX-0080", reason: "Salah input metode pembayaran", result: "Berhasil", category: "Transaksi", before: "Lunas · Tunai", after: "Refund · Tunai" },
    { id: "au02", time: "30 Okt 2026 · 10.10", actor: "Admin Demo", action: "Penyesuaian stok", object: "Ayam fillet · −0,2 kg", reason: "Opname demo", result: "Menunggu review", category: "Stok", before: "2,2 kg", after: "2,0 kg" },
    { id: "au03", time: "30 Okt 2026 · 09.20", actor: "Dina Pratama", action: "Login kasir", object: "Perangkat KASIR-01", reason: "Mulai shift pagi", result: "Berhasil", category: "Akses", before: "—", after: "Sesi aktif" },
    { id: "au04", time: "29 Okt 2026 · 22.15", actor: "Admin Demo", action: "Menyimpan opname", object: "Ayam fillet", reason: "Stok opname harian", result: "Berhasil", category: "Stok", before: "2,2 kg", after: "1,8 kg fisik" },
    { id: "au05", time: "29 Okt 2026 · 17.02", actor: "Sari Wulandari", action: "Mengajukan koreksi absensi", object: "Raka Saputra · 29 Okt", reason: "Lupa absen pulang", result: "Menunggu review", category: "Absensi", before: "Pulang 15.45", after: "Diajukan: 16.02" },
    { id: "au06", time: "29 Okt 2026 · 15.40", actor: "Admin Demo", action: "Mengubah harga produk", object: "Beef Burger", reason: "Penyesuaian menu demo", result: "Berhasil", category: "Transaksi", before: "Rp 24.000", after: "Rp 25.000" },
    { id: "au07", time: "28 Okt 2026 · 23.00", actor: "Sistem demo", action: "Backup terjadwal", object: "nuvora-backup-demo.zip", reason: "Jadwal harian", result: "Berhasil", category: "Akses", before: "—", after: "Belum diuji restore" },
    { id: "au08", time: "27 Okt 2026 · 09.10", actor: "Admin Demo", action: "Membuka audit log", object: "Audit log", reason: "Review aktivitas operasional", result: "Berhasil", category: "Akses", before: "—", after: "Read-only" },
  ];

  const recipes = {
    paket: {
      name: "Paket Nuvora", status: "Lengkap", tone: "success",
      note: "Contoh komposisi demo; konversi satuan dan pemakaian bahan belum disetujui sebagai formula produksi.",
      items: [
        { name: "Ayam fillet", qty: "150 g", cost: 3750 },
        { name: "Beras", qty: "120 g", cost: 1440 },
        { name: "Telur", qty: "1 butir", cost: 2400 },
        { name: "Minyak goreng", qty: "15 ml", cost: 225 },
        { name: "Saus sambal", qty: "30 g", cost: 600 },
      ],
    },
    burger: {
      name: "Beef Burger", status: "Perlu cek", tone: "warning",
      note: "Daging sapi memiliki stok 0 pada data demo. Keputusan produk tanpa stok dan resep belum final.",
      items: [
        { name: "Daging sapi", qty: "100 g", cost: 6000 },
        { name: "Roti burger", qty: "1 buah", cost: 3500 },
        { name: "Keju lembar", qty: "1 lembar", cost: 1200 },
        { name: "Saus sambal", qty: "20 g", cost: 400 },
      ],
    },
    tea: {
      name: "Es Teh", status: "Lengkap", tone: "success",
      note: "Contoh komposisi demo. Harga bahan adalah angka ilustrasi.",
      items: [
        { name: "Teh celup", qty: "1 kantong", cost: 500 },
        { name: "Gula pasir", qty: "20 g", cost: 300 },
        { name: "Air", qty: "200 ml", cost: 1000 },
      ],
    },
  };

  function formatQty(value) {
    return qtyFormat.format(Number(value) || 0).replace("-", "−");
  }

  function initials(name) {
    return String(name).split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  }

  function badge(text, tone) {
    return `<span class="badge badge-${tone}">${escapeHtml(text)}</span>`;
  }

  function paymentBadge(payment) {
    return badge(payment, payment === "QRIS manual" ? "info" : "neutral");
  }

  function transactionStatus(status) {
    return {
      lunas: { text: "Lunas", tone: "success" },
      pending: { text: "Menunggu sync", tone: "warning" },
      void: { text: "Dibatalkan", tone: "danger" },
      refund: { text: "Refund", tone: "danger" },
    }[status] || { text: status, tone: "neutral" };
  }

  function transactionDateLabel(tx) {
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const [year, month, day] = isoDateFromText(tx.date).split("-").map(Number);
    return `${day} ${months[month - 1]} ${year}`;
  }

  function transactionMonthLabel(month) {
    return {
      "2026-11": "1–30 Nov 2026",
      "2026-10": "1–31 Okt 2026",
      "2026-09": "1–30 Sep 2026",
      "2026-08": "1–31 Agu 2026",
      all: "Semua bulan",
    }[month] || "Periode demo";
  }

  function syncCell(sync) {
    if (sync === true) return `<span class="status-dot ok">Tersinkron</span>`;
    if (sync === false) return `<span class="status-dot warn">Menunggu</span>`;
    return `<span class="muted">—</span>`;
  }

  function productIcon(category) {
    return { Paket: "layers", Makanan: "utensils", Minuman: "cup", Tambahan: "fries" }[category] || "utensils";
  }

  function nowClock() {
    return new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" })
      .format(new Date())
      .replace(":", ".");
  }

  function setActiveNav(page) {
    qsa(".nav-item[data-page]").forEach((item) => {
      const active = item.dataset.page === page;
      item.classList.toggle("active", active);
      if (active) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
  }

  function showPage(page, navPage) {
    const section = qs(`.admin-page[data-page="${page}"]`);
    if (!section) return;
    ui.page = page;
    qsa(".admin-page").forEach((item) => item.classList.toggle("active", item === section));
    qs("#crumbCurrent").textContent = section.dataset.title || "Admin";
    document.title = `${section.dataset.title || "Admin"} — Nuvora Admin Prototype`;
    setActiveNav(navPage || page);
    document.body.classList.remove("sidebar-open");
    window.scrollTo(0, 0);
  }

  function requestPage(page) {
    ui.requestedPage = page;
    const section = qs(`.admin-page[data-page="${page}"]`);
    if (!section) return;
    if (ui.role === "kasir" && section.dataset.restrictedPage === "kasir") {
      qs("#deniedMessage").textContent = `Peran Kasir tidak memiliki izin membuka ${section.dataset.title || "halaman ini"} pada prototype. Matriks izin final belum disetujui (SEC-002).`;
      showPage("__denied", page);
      return;
    }
    showPage(page);
  }

  function updateRoleUi() {
    const kasir = ui.role === "kasir";
    qs("#topbarRoleLabel").textContent = kasir ? "Akses terbatas · simulasi" : "Akses penuh · simulasi";
    qs("#topbarUserName").textContent = kasir ? "Kasir Demo" : "Admin Demo";
    qs("#topbarAvatar").textContent = kasir ? "KS" : "AD";
  }

  function requireAdminAction(message) {
    if (ui.role !== "kasir") return true;
    toast(message || "Simulasi role Kasir: aksi tulis ini belum diizinkan dan matriks izin masih USULAN.", "warning");
    return false;
  }

  function addAudit(entry) {
    auditEvents.unshift({
      id: `au${Date.now()}`,
      time: `30 Okt 2026 · ${nowClock()}`,
      actor: ui.role === "kasir" ? "Kasir Demo" : "Admin Demo",
      result: "Berhasil",
      category: "Akses",
      before: "—",
      after: "—",
      ...entry,
    });
    renderAudit();
    renderSearchResults(qs("#searchModalInput") ? qs("#searchModalInput").value : "");
  }

  function renderRecentTransactions() {
    const body = qs("#recentTransactions");
    body.innerHTML = transactions.slice(0, 5).map((tx) => {
      const status = transactionStatus(tx.status);
      return `<tr class="clickable-row" data-tx-id="${escapeHtml(tx.id)}">
        <td>${escapeHtml(tx.time)}</td>
        <td class="mono row-title">${escapeHtml(tx.order || tx.id)}</td>
        <td>${escapeHtml(tx.type)}</td>
        <td>${paymentBadge(tx.payment)}</td>
        <td>${badge(status.text, status.tone)}</td>
        <td class="num row-title">${rupiah(tx.total)}</td>
      </tr>`;
    }).join("");
  }

  function filteredTransactions() {
    const query = qs("#txSearch").value.trim().toLowerCase();
    const filter = qs("#txStatusFilter").value;
    const month = qs("#txMonthFilter").value;
    return transactions.filter((tx) => {
      const matchesMonth = month === "all" || isoDateFromText(tx.date).slice(0, 7) === month;
      const matchesStatus = filter === "all" || (filter === "pending" ? tx.sync === false : tx.status === filter);
      const haystack = `${tx.order || tx.id} ${tx.cashier} ${tx.type} ${tx.payment} ${tx.member ? tx.member.name : tx.customer || ""}`.toLowerCase();
      return matchesMonth && matchesStatus && (!query || haystack.includes(query));
    });
  }

  function renderTxPager(pages) {
    const pager = qs("#txPager");
    if (!pager) return;
    const page = ui.txPage;
    const buttons = [
      `<button type="button" data-tx-page="${page - 1}" ${page === 1 ? "disabled" : ""} aria-label="Halaman sebelumnya">‹</button>`,
      ...Array.from({ length: pages }, (_, index) => index + 1).map((number) => `<button type="button" data-tx-page="${number}" class="${number === page ? "active" : ""}" ${number === page ? 'aria-current="page"' : ""} aria-label="Halaman ${number}">${number}</button>`),
      `<button type="button" data-tx-page="${page + 1}" ${page === pages ? "disabled" : ""} aria-label="Halaman berikutnya">›</button>`,
    ];
    pager.innerHTML = buttons.join("");
  }

  function renderTransactions() {
    const body = qs("#transactionsBody");
    const allRows = filteredTransactions();
    const pages = Math.max(1, Math.ceil(allRows.length / ui.txPageSize));
    ui.txPage = Math.min(Math.max(1, ui.txPage), pages);
    const start = (ui.txPage - 1) * ui.txPageSize;
    const rows = allRows.slice(start, start + ui.txPageSize);
    body.innerHTML = rows.length
      ? rows.map((tx) => {
          const status = transactionStatus(tx.status);
          return `<tr class="clickable-row" data-tx-id="${escapeHtml(tx.id)}">
            <td><span class="row-title">${transactionDateLabel(tx)}</span><span class="row-sub">${escapeHtml(tx.time)}</span></td>
            <td class="mono row-title">${escapeHtml(tx.order || tx.id)}</td>
            <td>${escapeHtml(tx.cashier)}</td>
            <td>${escapeHtml(tx.type)}</td>
            <td>${paymentBadge(tx.payment)}</td>
            <td>${badge(status.text, status.tone)}</td>
            <td>${syncCell(tx.sync)}</td>
            <td class="num row-title">${rupiah(tx.total)}</td>
            <td class="num"><button class="row-menu" type="button" aria-label="Lihat ${escapeHtml(tx.order || tx.id)}" data-tx-view="${escapeHtml(tx.id)}">${icon("more")}</button></td>
          </tr>`;
        }).join("")
      : `<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">${icon("search")}</div><h4>Transaksi tidak ditemukan</h4><p>Ubah bulan, kata kunci, atau filter status.</p></div></td></tr>`;
    qs("#txCountLabel").textContent = `${allRows.length} transaksi · ${pages} halaman`;
    qs("#txFooterLabel").textContent = allRows.length
      ? `Menampilkan ${start + 1}–${start + rows.length} dari ${allRows.length} transaksi · ${ui.txPageSize}/halaman`
      : "Tidak ada transaksi demo yang cocok";
    qs("#txPeriodLabel").innerHTML = `${icon("calendar")} ${escapeHtml(transactionMonthLabel(qs("#txMonthFilter").value))}`;
    renderTxPager(pages);
  }

  function openTransaction(id) {
    const tx = transactions.find((item) => item.id === id);
    if (!tx) return;
    const status = transactionStatus(tx.status);
    const order = tx.order || tx.id;
    const customer = tx.member ? tx.member.name : tx.customer || "Walk-in";
    qs("#transactionDialogSub").textContent = `${order} · snapshot transaksi demo`;
    const itemRows = tx.items.map((item) => `<tr><td class="row-title">${escapeHtml(item.name)}</td><td class="num">${item.qty}</td><td class="num">${rupiah(item.price)}</td><td class="num row-title">${rupiah(item.qty * item.price)}</td></tr>`).join("");
    const subtotal = Number(tx.subtotal) || tx.total + Number(tx.member && tx.member.discount) || tx.total;
    const memberDiscount = Number(tx.member && tx.member.discount) || 0;
    const isSplit = tx.payment === "Tunai + QRIS";
    let paymentRows = `<div class="settings-row"><span>Referensi QRIS</span><b>${escapeHtml(tx.qrisRef || "—")}</b></div><div class="settings-row"><span>Verifikasi</span><b>Manual oleh kasir</b></div>`;
    if (tx.payment === "Tunai") {
      paymentRows = `<div class="settings-row"><span>Uang diterima</span><b>${rupiah(tx.cashGiven)}</b></div><div class="settings-row"><span>Kembalian</span><b>${rupiah(tx.change)}</b></div>`;
    } else if (isSplit) {
      paymentRows = `<div class="settings-row"><span>Tunai</span><b>${rupiah(tx.cashAmount)}</b></div>
        <div class="settings-row"><span>QRIS</span><b>${rupiah(tx.qrisAmount)}</b></div>
        <div class="settings-row"><span>Pembulatan tunai</span><b>${Number(tx.rounding) > 0 ? "+" : ""}${rupiah(tx.rounding || 0)}</b></div>
        <div class="settings-row"><span>Uang tunai diterima</span><b>${rupiah(tx.cashGiven)}</b></div>
        <div class="settings-row"><span>Kembalian</span><b>${rupiah(tx.change)}</b></div>
        <div class="settings-row"><span>Referensi QRIS</span><b>${escapeHtml(tx.qrisRef || "—")}</b></div>`;
    } else if (tx.payment === "Poin") {
      paymentRows = `<div class="settings-row"><span>Ditutup dengan poin</span><b>${tx.member ? `${pointFormat.format(Number(tx.member.redeemed) || 0)} poin` : "—"}</b></div>`;
    }
    const memberRows = tx.member
      ? `<div class="settings-row"><span>Member</span><b>${escapeHtml(tx.member.name)}</b></div>
        <div class="settings-row"><span>Poin ditukar</span><b>${tx.member.redeemed ? `−${pointFormat.format(tx.member.redeemed)} poin` : "—"}</b></div>
        <div class="settings-row"><span>Poin didapat</span><b>${tx.member.earned ? `+${pointFormat.format(tx.member.earned)} poin` : "—"}</b></div>
        <div class="settings-row"><span>Saldo poin</span><b>${pointFormat.format(Number(tx.member.pointsAfter) || 0)} poin</b></div>`
      : "";
    qs("#transactionDetail").innerHTML = `
      <div class="detail-grid">
        <div class="detail-box"><span>Waktu</span><b>${transactionDateLabel(tx)} · ${tx.time}</b></div>
        <div class="detail-box"><span>Kasir</span><b>${escapeHtml(tx.cashier)}</b></div>
        <div class="detail-box"><span>Jenis pesanan</span><b>${escapeHtml(tx.type)}</b></div>
        <div class="detail-box"><span>Pelanggan</span><b>${escapeHtml(customer)}</b></div>
        <div class="detail-box"><span>Pembayaran</span><b>${escapeHtml(tx.payment)}</b></div>
        <div class="detail-box"><span>Status &amp; sync</span><b>${escapeHtml(status.text)} · ${tx.sync ? "Tersinkron" : "Menunggu"}</b></div>
      </div>
      <div class="table-wrap" style="margin-top:14px">
        <table class="table">
          <thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Harga snapshot</th><th class="num">Subtotal</th></tr></thead>
          <tbody>${itemRows}</tbody>
        </table>
      </div>
      <div style="max-width:340px;margin:12px 0 0 auto">
        <div class="settings-row"><span>Subtotal</span><b>${rupiah(subtotal)}</b></div>
        ${memberDiscount ? `<div class="settings-row"><span>Poin member</span><b>−${rupiah(memberDiscount)}</b></div>` : `<div class="settings-row"><span>Diskon umum</span><b>${rupiah(0)} <span class="tiny muted">· aturan diskon belum final</span></b></div>`}
        <div class="settings-row"><span>Total</span><b>${rupiah(tx.total)}</b></div>
        ${paymentRows}
        ${memberRows}
      </div>
      ${tx.status === "void" ? `<div class="notice notice-danger" style="margin-top:12px">${icon("alert")}<span><strong>Transaksi dibatalkan.</strong> ${escapeHtml(tx.voidReason || "—")}${tx.voidAt ? ` · ${escapeHtml(tx.voidAt)}` : ""}${tx.voidBy ? ` · ${escapeHtml(tx.voidBy)}` : ""}</span></div>` : ""}
      ${tx.status === "refund" ? `<div class="notice notice-danger" style="margin-top:12px">${icon("alert")}<span><strong>Refund demo.</strong> ${escapeHtml(tx.note)}</span></div>` : ""}
      ${tx.sync === false ? `<div class="notice notice-warning" style="margin-top:12px">${icon("wifi-off")}<span><strong>Belum tersinkron.</strong> ${escapeHtml(tx.note || "Transaksi ini menunggu sinkronisasi demo.")}</span></div>` : ""}
      <div class="notice notice-info" style="margin-top:12px">${icon("info")}<span><strong>Snapshot.</strong> Nama dan harga item disimpan saat transaksi dibuat; perubahan master menu tidak mengubah riwayat ini (POS-004).</span></div>
      <div class="sheet-actions" style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-outline" style="flex:1" type="button" data-close-dialog>Tutup</button>
        ${tx.status === "lunas" ? `<button class="btn btn-danger" style="flex:1" type="button" data-tx-void="${escapeHtml(tx.id)}">Batalkan transaksi</button>` : ""}
      </div>
    `;
    openDialog("transactionDialog");
  }

  function adminNowLabel() {
    const date = new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" })
      .format(new Date())
      .replace(/\./g, "");
    return `${date} · ${nowClock()}`;
  }

  function adminStockMovementId() {
    return `m-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  function restoreStockForAdmin(tx) {
    if (!tx.stockEffects || !tx.stockEffects.length || tx.stockRestored) return false;
    const productsById = new Map(products.map((product) => [product.id, product]));
    const ingredientsById = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]));
    const time = adminNowLabel();
    const actor = ui.role === "kasir" ? "Kasir Demo" : "Admin Demo";
    tx.stockEffects.forEach((effect) => {
      if (effect.type === "ingredient") {
        const ingredient = ingredientsById.get(effect.id);
        if (ingredient) ingredient.stock = Number(((Number(ingredient.stock) || 0) + effect.qty).toFixed(3));
        stockMovements.unshift({
          id: adminStockMovementId(),
          time,
          ingredient: effect.name,
          type: "Masuk",
          qty: effect.qty,
          unit: effect.unit,
          source: `Pembatalan ${tx.order || tx.id}`,
          actor,
          note: "Pengembalian stok karena transaksi dibatalkan dari Admin",
        });
      } else {
        const product = productsById.get(effect.id);
        if (product) product.stock = (Number(product.stock) || 0) + effect.qty;
        stockMovements.unshift({
          id: adminStockMovementId(),
          time,
          ingredient: effect.name,
          type: "Masuk",
          qty: effect.qty,
          unit: effect.unit,
          source: `Pembatalan ${tx.order || tx.id}`,
          actor,
          note: "Pengembalian stok produk jadi karena transaksi dibatalkan dari Admin",
        });
      }
    });
    tx.stockRestored = true;
    store.saveProducts();
    store.saveIngredients();
    store.saveStockMovements();
    return true;
  }

  function reverseMemberPointsForAdmin(tx) {
    if (!tx.member || tx.member.voided) return false;
    const member = members.find((item) => item.id === tx.member.id);
    if (!member) {
      tx.member.voided = true;
      return false;
    }
    const delta = (Number(tx.member.redeemed) || 0) - (Number(tx.member.earned) || 0);
    const before = Number(member.points) || 0;
    const after = Math.max(0, before + delta);
    member.history = Array.isArray(member.history) ? member.history : [];
    if (delta !== 0) {
      member.history.unshift({
        at: adminNowLabel(),
        type: "void",
        points: delta,
        note: `Void ${tx.order || tx.id}`,
        txId: tx.order || tx.id,
        actor: ui.role === "kasir" ? "Kasir Demo" : "Admin Demo",
      });
      member.points = after;
    }
    tx.member.voided = true;
    tx.member.pointsAfterVoid = member.points;
    store.saveMembers();
    return true;
  }

  function productSummary() {
    const active = products.filter((item) => item.active).length;
    const noRecipe = products.filter((item) => !item.recipe).length;
    const values = [products.length, active, new Set(products.map((item) => item.category)).size, noRecipe];
    qsa('[data-page="produk"] .product-summary .summary-line b').forEach((el, index) => {
      if (values[index] != null) el.textContent = values[index];
    });
  }

  function renderProducts() {
    const query = qs("#productSearch").value.trim().toLowerCase();
    const rows = products.filter((product) => {
      const categoryMatch = ui.productCategory === "all" || product.category === ui.productCategory;
      return categoryMatch && (!query || product.name.toLowerCase().includes(query));
    });
    qs("#productBody").innerHTML = rows.length
      ? rows.map((product) => {
          const margin = product.hpp > 0 ? Math.round(((product.price - product.hpp) / product.price) * 100) : null;
          const thumb = product.photo
            ? `<span class="product-thumb has-photo"><img src="${escapeHtml(product.photo)}" alt=""></span>`
            : `<span class="product-thumb">${icon(productIcon(product.category))}</span>`;
          return `<tr>
            <td><div class="product-name-cell">${thumb}<span class="row-title">${escapeHtml(product.name)}<span class="row-sub">${escapeHtml(product.id.toUpperCase())}</span></span></div></td>
            <td><span class="badge badge-neutral">${escapeHtml(product.category)}</span></td>
            <td class="num">${rupiah(product.price)}</td>
            <td class="num">${product.hpp ? rupiah(product.hpp) : "—"}</td>
            <td class="num">${margin == null ? "—" : `${margin}%`}</td>
            <td>${product.recipe ? badge("Ada", "success") : badge("Tanpa resep", "warning")}</td>
            <td><span style="display:inline-flex;gap:4px;flex-wrap:wrap">${product.active ? badge("Aktif", "success") : badge("Nonaktif", "neutral")}${product.soldOut ? badge("Sold-out", "danger") : ""}</span></td>
            <td class="num"><span style="display:inline-flex;gap:4px"><button class="row-menu" type="button" data-product-soldout="${product.id}" aria-label="${product.soldOut ? "Tandai tersedia" : "Tandai sold-out"} ${escapeHtml(product.name)}" title="${product.soldOut ? "Tandai tersedia" : "Tandai sold-out"}">${icon(product.soldOut ? "check-circle" : "x-circle")}</button><button class="row-menu" type="button" data-product-toggle="${product.id}" aria-label="${product.active ? "Nonaktifkan" : "Aktifkan"} ${escapeHtml(product.name)}" title="${product.active ? "Nonaktifkan" : "Aktifkan"} produk">${icon("edit")}</button></span></td>
          </tr>`;
        }).join("")
      : `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">${icon("search")}</div><h4>Produk tidak ditemukan</h4><p>Ubah pencarian atau kategori.</p></div></td></tr>`;
    const total = products.length;
    qs("#productCountLabel").textContent = `${rows.length} dari ${total} produk demo`;
    productSummary();
  }

  function resetProductPhoto() {
    ui.productPhoto = null;
    const preview = qs("#newProductPhotoPreview");
    const input = qs("#newProductPhoto");
    if (input) input.value = "";
    if (preview) {
      preview.classList.remove("has-photo");
      preview.innerHTML = icon("camera");
    }
  }

  function renderIngredients() {
    const query = qs("#stockSearch").value.trim().toLowerCase();
    const rows = ingredients.filter((item) => !query || `${item.name} ${item.unit}`.toLowerCase().includes(query));
    qs("#ingredientBody").innerHTML = rows.map((item) => {
      const status = item.stock < 0 ? { text: "Stok negatif", tone: "danger" } : item.stock < item.min ? { text: "Menipis", tone: "warning" } : { text: "Aman", tone: "success" };
      return `<tr>
        <td class="row-title">${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.unit)}</td>
        <td class="num">${formatQty(item.stock)}</td>
        <td class="num">${formatQty(item.min)}</td>
        <td>${badge(status.text, status.tone)}</td>
        <td>${item.conversion ? badge("Tervalidasi", "success") : badge("Belum", "warning")}</td>
        <td class="num"><button class="row-menu" type="button" data-admin-demo="Ubah bahan belum aktif; aturan satuan dan konversi belum disetujui." aria-label="Ubah ${escapeHtml(item.name)}">${icon("edit")}</button></td>
      </tr>`;
    }).join("");
    const statBlocks = qsa('[data-page="stok"] .stock-stat');
    if (statBlocks.length === 4) {
      statBlocks[0].querySelector("b").textContent = ingredients.length;
      statBlocks[0].querySelector("small").textContent = `${ingredients.filter((item) => !item.conversion).length} tanpa konversi tervalidasi`;
      statBlocks[1].querySelector("b").textContent = ingredients.filter((item) => item.stock >= 0 && item.stock < item.min).length;
      statBlocks[2].querySelector("b").textContent = ingredients.filter((item) => item.stock < 0).length;
    }
  }

  function renderStockMovements() {
    const query = qs("#stockSearch").value.trim().toLowerCase();
    const rows = stockMovements.filter((item) => !query || `${item.ingredient} ${item.source} ${item.actor} ${item.note}`.toLowerCase().includes(query));
    qs("#stockMovementBody").innerHTML = rows.length
      ? rows.map((item) => {
          const tone = item.type === "Masuk" ? "success" : item.type === "Keluar" ? "info" : "warning";
          const qty = item.type === "Penyesuaian"
            ? `<span style="color:var(--${item.qty >= 0 ? "success" : "danger"});font-weight:650">${item.qty > 0 ? "+" : ""}${formatQty(item.qty)} ${escapeHtml(item.unit)}</span>`
            : `<span style="color:var(--${item.type === "Masuk" ? "success" : "ink-soft"})">${item.type === "Masuk" ? "+" : "−"}${formatQty(Math.abs(item.qty))} ${escapeHtml(item.unit)}</span>`;
          return `<tr>
            <td>${escapeHtml(item.time)}</td>
            <td class="row-title">${escapeHtml(item.ingredient)}</td>
            <td>${badge(item.type, tone)}</td>
            <td class="num">${qty}</td>
            <td>${escapeHtml(item.source)}</td>
            <td>${escapeHtml(item.actor)}</td>
            <td class="row-sub">${escapeHtml(item.note)}</td>
          </tr>`;
        }).join("")
      : `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">${icon("search")}</div><h4>Pergerakan tidak ditemukan</h4><p>Coba kata kunci bahan atau sumber lain.</p></div></td></tr>`;
  }

  function renderRecipe(key) {
    const recipe = recipes[key];
    if (!recipe) return;
    qsa("[data-recipe]").forEach((button) => button.classList.toggle("active", button.dataset.recipe === key));
    const total = recipe.items.reduce((sum, item) => sum + item.cost, 0);
    qs("#recipeDetail").innerHTML = `
      <div class="recipe-detail-head">
        <div><h2>${escapeHtml(recipe.name)}</h2><p>Resep demo · komposisi belum menjadi formula final</p></div>
        <div class="bom-total"><span>HPP contoh</span><b>${rupiah(total)}</b></div>
      </div>
      <div class="table-wrap">
        <table class="table"><thead><tr><th>Bahan</th><th>Takaran demo</th><th class="num">Biaya contoh</th></tr></thead><tbody>
          ${recipe.items.map((item) => `<tr><td class="row-title">${escapeHtml(item.name)}</td><td>${escapeHtml(item.qty)}</td><td class="num">${rupiah(item.cost)}</td></tr>`).join("")}
        </tbody></table>
      </div>
      <div style="padding:13px 16px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;border-top:1px solid var(--border)">
        ${badge(recipe.status, recipe.tone)}
        <span class="tiny muted">${escapeHtml(recipe.note)}</span>
      </div>
    `;
  }

  function renderOpnameHistory() {
    qs("#opnameHistoryBody").innerHTML = opnameHistory.map((row) => {
      const diff = row.physical - row.system;
      return `<tr>
        <td>${escapeHtml(row.date)}</td>
        <td class="row-title">${escapeHtml(row.ingredient)}</td>
        <td class="num">${formatQty(row.system)}</td>
        <td class="num">${formatQty(row.physical)}</td>
        <td class="num" style="color:var(--${diff >= 0 ? "success" : "danger"})">${diff > 0 ? "+" : ""}${formatQty(diff)}</td>
        <td>${escapeHtml(row.actor)}</td>
        <td>${badge(row.status, row.tone)}</td>
      </tr>`;
    }).join("");
  }

  function renderEmployees() {
    const query = qs("#employeeSearch").value.trim().toLowerCase();
    const rows = employees.filter((item) => !query || `${item.name} ${item.role}`.toLowerCase().includes(query));
    qs("#employeeBody").innerHTML = rows.length
      ? rows.map((item) => `<tr>
          <td><div class="employee-cell"><span class="avatar">${escapeHtml(initials(item.name))}</span><span><b>${escapeHtml(item.name)}</b><span>${escapeHtml(item.id.toUpperCase())}</span></span></div></td>
          <td>${escapeHtml(item.role)}</td>
          <td>${escapeHtml(item.outlet)}</td>
          <td>${escapeHtml(item.joined)}</td>
          <td>${item.active ? badge("Aktif", "success") : badge("Nonaktif", "neutral")}</td>
          <td class="num"><button class="row-menu" type="button" data-employee-toggle="${item.id}" aria-label="${item.active ? "Nonaktifkan" : "Aktifkan"} ${escapeHtml(item.name)}">${icon("edit")}</button></td>
        </tr>`).join("")
      : `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">${icon("search")}</div><h4>Karyawan tidak ditemukan</h4><p>Ubah kata kunci pencarian.</p></div></td></tr>`;
    const active = employees.filter((item) => item.active).length;
    const inactive = employees.length - active;
    const count = qs('[data-page="karyawan"] .table-panel-head p');
    if (count) count.textContent = `${active} karyawan aktif · ${inactive} nonaktif`;
  }

  function memberHistory(member) {
    return Array.isArray(member.history) ? member.history : [];
  }

  function loyaltySettings() {
    return store.getSettings().loyalty;
  }

  function historyTypeLabel(type) {
    return { earn: "Perolehan", redeem: "Penukaran", adjust: "Penyesuaian", void: "Void" }[type] || type || "Lainnya";
  }

  function historyTypeTone(type) {
    return { earn: "success", redeem: "info", adjust: "warning", void: "danger" }[type] || "neutral";
  }

  function renderMemberStats() {
    const active = members.filter((member) => member.active).length;
    const points = members.reduce((sum, member) => sum + (Number(member.points) || 0), 0);
    const pointValue = Number(loyaltySettings().pointValue) || 0;
    qs("#memberTotalStat").textContent = pointFormat.format(members.length);
    qs("#memberActiveStat").textContent = pointFormat.format(active);
    qs("#memberPointsStat").textContent = pointFormat.format(points);
    qs("#memberValueStat").textContent = rupiah(points * pointValue);
  }

  function renderMembers() {
    const query = qs("#memberSearch").value.trim().toLowerCase();
    const rows = members.filter((member) => !query || `${member.name} ${member.phone}`.toLowerCase().includes(query));
    qs("#memberBody").innerHTML = rows.length
      ? rows.map((member) => {
          const historyCount = memberHistory(member).length;
          const currentPoints = Number(member.points) || 0;
          return `<tr>
            <td><div class="employee-cell"><span class="avatar">${escapeHtml(initials(member.name))}</span><span><b>${escapeHtml(member.name)}</b><span>${escapeHtml(member.id.toUpperCase())}</span></span></div></td>
            <td class="mono">${escapeHtml(member.phone)}</td>
            <td class="num row-title">${pointFormat.format(currentPoints)}</td>
            <td>${escapeHtml(member.joined)}</td>
            <td>${member.active ? badge("Aktif", "success") : badge("Nonaktif", "neutral")}</td>
            <td class="num">${historyCount ? `${pointFormat.format(historyCount)} entri` : `<span class="muted">—</span>`}</td>
            <td class="num"><span style="display:inline-flex;gap:4px"><button class="row-menu" type="button" data-member-adjust="${escapeHtml(member.id)}" aria-label="Sesuaikan poin ${escapeHtml(member.name)}" title="Sesuaikan poin">${icon("sliders")}</button><button class="row-menu" type="button" data-member-history="${escapeHtml(member.id)}" aria-label="Riwayat poin ${escapeHtml(member.name)}" title="Riwayat poin">${icon("history")}</button><button class="row-menu" type="button" data-member-toggle="${escapeHtml(member.id)}" aria-label="${member.active ? "Nonaktifkan" : "Aktifkan"} ${escapeHtml(member.name)}" title="${member.active ? "Nonaktifkan" : "Aktifkan"} pelanggan">${icon(member.active ? "x-circle" : "check-circle")}</button></span></td>
          </tr>`;
        }).join("")
      : `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">${icon("search")}</div><h4>Pelanggan tidak ditemukan</h4><p>Ubah nama atau nomor telepon yang dicari.</p></div></td></tr>`;
    const active = members.filter((member) => member.active).length;
    qs("#memberCountLabel").textContent = `${pointFormat.format(rows.length)} dari ${pointFormat.format(members.length)} pelanggan`;
    qs("#memberFooterLabel").textContent = `${pointFormat.format(active)} aktif · ${pointFormat.format(members.length - active)} nonaktif · data demo`;
    renderMemberStats();
  }

  function renderMemberHistory(member) {
    const entries = memberHistory(member);
    const rows = entries.map((entry) => {
      const points = Number(entry.points) || 0;
      return `<tr>
        <td>${escapeHtml(entry.at || "—")}</td>
        <td>${badge(historyTypeLabel(entry.type), historyTypeTone(entry.type))}</td>
        <td class="num"><span class="history-points ${points > 0 ? "positive" : points < 0 ? "negative" : ""}">${points > 0 ? "+" : ""}${pointFormat.format(points)}</span></td>
        <td class="row-sub">${escapeHtml(entry.note || "—")}</td>
        <td class="mono">${escapeHtml(entry.txId || "—")}</td>
        <td>${escapeHtml(entry.actor || "—")}</td>
      </tr>`;
    }).join("");
    qs("#memberHistoryBody").innerHTML = `
      <div class="detail-grid">
        <div class="detail-box"><span>Pelanggan</span><b>${escapeHtml(member.name)}</b></div>
        <div class="detail-box"><span>Telepon</span><b>${escapeHtml(member.phone)}</b></div>
        <div class="detail-box"><span>Saldo poin</span><b>${pointFormat.format(Number(member.points) || 0)} poin</b></div>
        <div class="detail-box"><span>Status</span><b>${member.active ? "Aktif" : "Nonaktif"} · bergabung ${escapeHtml(member.joined)}</b></div>
      </div>
      ${entries.length
        ? `<div class="table-wrap" style="margin-top:14px"><table class="table"><thead><tr><th>Waktu</th><th>Jenis</th><th class="num">Poin</th><th>Catatan</th><th>Transaksi</th><th>Aktor</th></tr></thead><tbody>${rows}</tbody></table></div>`
        : `<div class="empty-state" style="min-height:220px;margin-top:14px"><div class="empty-icon">${icon("history")}</div><h4>Belum ada riwayat poin</h4><p>Riwayat akan muncul setelah ada perolehan, penukaran, atau penyesuaian poin.</p></div>`}
    `;
  }

  function openMemberHistory(id) {
    const member = members.find((item) => item.id === id);
    if (!member) return;
    ui.memberHistoryTarget = member.id;
    qs("#memberHistorySub").textContent = `${member.name} · ${pointFormat.format(Number(member.points) || 0)} poin`;
    renderMemberHistory(member);
    openDialog("memberHistoryDialog");
  }

  function updatePointsPreview() {
    const member = members.find((item) => item.id === ui.memberTarget);
    const preview = qs("#pointsPreview");
    if (!member || !preview) return;
    const amount = Number(qs("#pointsAmount").value);
    const next = (Number(member.points) || 0) + (Number.isFinite(amount) ? amount : 0);
    preview.textContent = `${pointFormat.format(next)} poin`;
    preview.style.color = next < 0 ? "var(--danger)" : "";
  }

  function openPointsDialog(id) {
    const member = members.find((item) => item.id === id);
    if (!member) return;
    ui.memberTarget = member.id;
    qs("#pointsDialogSub").textContent = `${member.name} · ${member.phone}`;
    qs("#pointsCurrent").textContent = `${pointFormat.format(Number(member.points) || 0)} poin`;
    qs("#pointsAmount").value = "";
    qs("#pointsReason").value = "";
    qs("#pointsAmount").classList.remove("input-error");
    qs("#pointsReason").classList.remove("input-error");
    updatePointsPreview();
    openDialog("pointsDialog");
  }

  function updateLoyaltyExample() {
    const earnPerPoint = Math.max(1, Number(qs("#loyaltyEarnPerPoint").value) || 0);
    const pointValue = Math.max(1, Number(qs("#loyaltyPointValue").value) || 0);
    const minRedeem = Math.max(1, Number(qs("#loyaltyMinRedeem").value) || 0);
    const example = `${pointFormat.format(minRedeem)} poin = ${rupiah(minRedeem * pointValue)}`;
    qs("#loyaltyExample").textContent = example;
    qs("#loyaltyEarnHint").textContent = rupiah(earnPerPoint);
    qs("#loyaltyRedeemHint").textContent = example;
    qs("#loyaltyEarnNote").textContent = `Setiap ${rupiah(earnPerPoint)} belanja menghasilkan 1 poin.`;
  }

  function loadLoyaltySettings() {
    const loyalty = loyaltySettings();
    const active = Boolean(loyalty.active);
    const toggle = qs("#loyaltyActiveSwitch");
    qs("#loyaltyEarnPerPoint").value = loyalty.earnPerPoint;
    qs("#loyaltyPointValue").value = loyalty.pointValue;
    qs("#loyaltyMinRedeem").value = loyalty.minRedeem;
    toggle.setAttribute("aria-checked", String(active));
    toggle.setAttribute("aria-label", active ? "Nonaktifkan program loyalitas" : "Aktifkan program loyalitas");
    qs("#loyaltySettingsBadge").className = `badge badge-${active ? "success" : "neutral"}`;
    qs("#loyaltySettingsBadge").textContent = active ? "Aktif" : "Nonaktif";
    const statusBadge = qs("#loyaltyStatusBadge");
    statusBadge.className = `badge badge-${active ? "live" : "neutral"}`;
    statusBadge.innerHTML = active ? `<span class="pill-dot"></span> Loyalitas aktif` : "Loyalitas nonaktif";
    updateLoyaltyExample();
  }

  function renderAttendance() {
    const query = qs("#attendanceSearch").value.trim().toLowerCase();
    const filter = qs("#attendanceFilter").value;
    const rows = attendanceRecords.filter((item) => {
      const filterMatch = filter === "all" || item.statusCode === filter;
      return filterMatch && (!query || item.name.toLowerCase().includes(query));
    });
    qs("#attendanceBody").innerHTML = rows.length
      ? rows.map((item) => `<tr>
          <td>${escapeHtml(item.date)}</td>
          <td><div class="employee-cell"><span class="avatar">${escapeHtml(initials(item.name))}</span><span><b>${escapeHtml(item.name)}</b><span>${escapeHtml(item.role)}</span></span></div></td>
          <td class="num">${escapeHtml(item.in)}</td>
          <td class="num">${escapeHtml(item.out)}</td>
          <td>${item.location === "Di luar area" ? badge(item.location, "warning") : escapeHtml(item.location)}</td>
          <td>${badge(item.status, item.statusCode === "hadir" ? "success" : "warning")}</td>
          <td class="num">${item.correctionSubmitted ? `<span class="small muted">Terkirim</span>` : `<button class="btn btn-ghost btn-sm" type="button" data-attendance-correct="${item.id}">${item.statusCode === "koreksi" ? "Tinjau" : "Koreksi"}</button>`}</td>
        </tr>`).join("")
      : `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">${icon("search")}</div><h4>Catatan tidak ditemukan</h4><p>Ubah nama atau filter status.</p></div></td></tr>`;
  }

  function expenseCategoryTone(category) {
    return { "Bahan baku": "info", Operasional: "neutral", Perawatan: "warning", "Lain-lain": "neutral" }[category] || "neutral";
  }

  function renderExpenses() {
    qs("#expenseBody").innerHTML = expenses.map((item) => `<tr>
      <td>${escapeHtml(item.date)}</td>
      <td>${badge(item.category, expenseCategoryTone(item.category))}</td>
      <td class="row-title">${escapeHtml(item.description)}</td>
      <td>${escapeHtml(item.actor)}</td>
      <td>${item.receipt ? badge("Ada", "success") : badge("Belum", "warning")}</td>
      <td class="num">${rupiah(item.amount)}</td>
    </tr>`).join("");
    const total = expenses.reduce((sum, item) => sum + item.amount, 0);
    qs("#expenseTotal").textContent = rupiah(total);
    qs("#expenseCount").textContent = expenses.length;
    const waiting = qsa('[data-page="pengeluaran"] .product-summary .summary-line b')[2];
    if (waiting) waiting.textContent = expenses.filter((item) => !item.receipt).length;
  }

  function auditTone(result) {
    if (/berhasil|disetujui|selesai/i.test(result)) return "success";
    if (/gagal|ditolak/i.test(result)) return "danger";
    return "warning";
  }

  function renderAudit() {
    const filter = qs("#auditFilter").value;
    const rows = auditEvents.filter((item) => filter === "all" || item.category === filter);
    qs("#auditBody").innerHTML = rows.length
      ? rows.map((item) => `<tr>
          <td>${escapeHtml(item.time)}</td>
          <td>${escapeHtml(item.actor)}</td>
          <td class="row-title">${escapeHtml(item.action)}</td>
          <td>${escapeHtml(item.object)}</td>
          <td class="row-sub">${escapeHtml(item.reason)}</td>
          <td>${badge(item.result, auditTone(item.result))}</td>
          <td class="num"><button class="row-menu" type="button" data-audit-id="${item.id}" aria-label="Lihat detail audit">${icon("eye")}</button></td>
        </tr>`).join("")
      : `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">${icon("filter")}</div><h4>Tidak ada peristiwa</h4><p>Filter ini belum memiliki catatan demo.</p></div></td></tr>`;
    const count = qs('[data-page="audit"] .table-panel-head p');
    if (count) count.textContent = `${auditEvents.length} peristiwa demo`;
  }

  function openAudit(id) {
    const event = auditEvents.find((item) => item.id === id);
    if (!event) return;
    qs("#auditDetail").innerHTML = `
      <div class="detail-grid">
        <div class="detail-box"><span>Waktu</span><b>${escapeHtml(event.time)}</b></div>
        <div class="detail-box"><span>Aktor</span><b>${escapeHtml(event.actor)}</b></div>
        <div class="detail-box"><span>Tindakan</span><b>${escapeHtml(event.action)}</b></div>
        <div class="detail-box"><span>Objek</span><b>${escapeHtml(event.object)}</b></div>
        <div class="detail-box"><span>Kategori</span><b>${escapeHtml(event.category)}</b></div>
        <div class="detail-box"><span>Hasil</span><b>${escapeHtml(event.result)}</b></div>
      </div>
      <div class="detail-box" style="margin-top:10px"><span>Alasan / konteks</span><b>${escapeHtml(event.reason)}</b></div>
      <div class="audit-change"><div><span>Sebelum</span><b class="before">${escapeHtml(event.before)}</b></div><div><span>Sesudah</span><b class="after">${escapeHtml(event.after)}</b></div></div>
      <div class="notice notice-info" style="margin-top:12px">${icon("info")}<span>Audit log pada prototype bersifat read-only dan tidak dapat diubah dari antarmuka operasional.</span></div>
      <div class="sheet-actions" style="margin-top:14px"><button class="btn btn-outline btn-block" type="button" data-close-dialog>Tutup</button></div>
    `;
    openDialog("auditDialog");
  }

  function openCorrection(id) {
    const record = attendanceRecords.find((item) => item.id === id);
    if (!record) return;
    ui.correctionTarget = id;
    qs("#correctionSub").textContent = `${record.name} · ${record.date} · data demo`;
    qs("#adminCorrectionSeed").value = record.seed;
    qs("#adminCorrectionReason").value = "";
    qs("#adminCorrectionReason").classList.remove("input-error");
    openDialog("correctionDialog");
  }

  function renderSearchResults(query) {
    const target = qs("#searchResults");
    if (!target) return;
    const q = String(query || "").trim().toLowerCase();
    const index = [
      ...transactions.slice(0, 6).map((tx) => ({ page: "penjualan", icon: "receipt", title: tx.order || tx.id, sub: `Transaksi · ${tx.cashier} · ${tx.payment} · ${rupiah(tx.total)}`, badge: transactionStatus(tx.status), keywords: `${tx.order || tx.id} ${tx.cashier} ${tx.type} ${tx.member ? tx.member.name : ""}` })),
      ...products.slice(0, 8).map((product) => ({ page: "produk", icon: productIcon(product.category), title: product.name, sub: `Menu · ${product.category} · ${rupiah(product.price)}`, badge: { text: product.active ? "Aktif" : "Nonaktif", tone: product.active ? "success" : "neutral" }, keywords: product.name })),
      ...employees.map((item) => ({ page: "karyawan", icon: "user", title: item.name, sub: `Karyawan · ${item.role} · ${item.active ? "aktif" : "nonaktif"}`, badge: { text: item.active ? "Aktif" : "Nonaktif", tone: item.active ? "success" : "neutral" }, keywords: `${item.name} ${item.role}` })),
      ...members.map((member) => ({ page: "pelanggan", icon: "badge-check", title: member.name, sub: `Pelanggan · ${member.phone} · ${pointFormat.format(Number(member.points) || 0)} poin`, badge: { text: member.active ? "Aktif" : "Nonaktif", tone: member.active ? "success" : "neutral" }, keywords: `${member.name} ${member.phone} ${member.points}` })),
      ...ingredients.slice(0, 8).map((item) => ({ page: "stok", icon: "boxes", title: item.name, sub: `Bahan · ${formatQty(item.stock)} ${item.unit} · minimum ${formatQty(item.min)} ${item.unit}`, badge: { text: item.stock < item.min ? "Perlu cek" : "Aman", tone: item.stock < item.min ? "warning" : "success" }, keywords: item.name })),
    ];
    const rows = index.filter((item) => !q || `${item.title} ${item.sub} ${item.keywords}`.toLowerCase().includes(q)).slice(0, 8);
    target.innerHTML = rows.length
      ? rows.map((item) => `<button class="search-result" type="button" data-search-page="${item.page}"><span class="result-icon">${icon(item.icon)}</span><span><b>${escapeHtml(item.title)}</b><span>${escapeHtml(item.sub)}</span></span>${badge(item.badge.text, item.badge.tone)}</button>`).join("")
      : `<div class="empty-state" style="padding:24px 10px"><div class="empty-icon">${icon("search")}</div><h4>Tidak ada hasil</h4><p>Cari menu, transaksi, karyawan, pelanggan, atau bahan dengan kata lain.</p></div>`;
  }

  function openSearch(query) {
    const input = qs("#searchModalInput");
    input.value = query || "";
    renderSearchResults(input.value);
    openDialog("searchDialog");
    window.setTimeout(() => {
      input.focus();
      input.select();
    }, 30);
  }

  function resetBackup() {
    if (ui.backupTimer) window.clearInterval(ui.backupTimer);
    ui.backupTimer = null;
    qs("#backupProgressWrap").style.display = "none";
    qs("#backupDone").style.display = "none";
    qs("#backupProgress").style.width = "0%";
    qs("#backupPercent").textContent = "0%";
    const button = qs("#startBackup");
    button.disabled = false;
    button.textContent = "Mulai backup demo";
  }

  function startBackup() {
    if (!requireAdminAction("Simulasi role Kasir tidak memiliki akses ke pengaturan/backup.")) return;
    if (ui.backupTimer) return;
    qs("#backupProgressWrap").style.display = "block";
    qs("#backupDone").style.display = "none";
    const button = qs("#startBackup");
    button.disabled = true;
    button.textContent = "Memproses…";
    let progress = 0;
    ui.backupTimer = window.setInterval(() => {
      progress = Math.min(100, progress + Math.ceil(Math.random() * 17));
      qs("#backupProgress").style.width = `${progress}%`;
      qs("#backupPercent").textContent = `${progress}%`;
      if (progress >= 100) {
        window.clearInterval(ui.backupTimer);
        ui.backupTimer = null;
        qs("#backupDone").style.display = "block";
        button.textContent = "Backup demo selesai";
        toast("Simulasi backup selesai. Tidak ada file nyata yang dibuat.", "success");
      }
    }, 260);
  }

  function wireNavigation() {
    qsa(".nav-item[data-page]").forEach((button) => {
      button.addEventListener("click", () => requestPage(button.dataset.page));
    });
    qsa("[data-page-link]").forEach((button) => {
      button.addEventListener("click", () => requestPage(button.dataset.pageLink));
    });
    qs("#sidebarToggle").addEventListener("click", (event) => {
      event.stopPropagation();
      document.body.classList.toggle("sidebar-open");
    });
    document.addEventListener("click", (event) => {
      if (!document.body.classList.contains("sidebar-open")) return;
      if (event.target.closest("#adminSidebar") || event.target.closest("#sidebarToggle")) return;
      document.body.classList.remove("sidebar-open");
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") document.body.classList.remove("sidebar-open");
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch("");
      }
    });
    qs("#rolePreview").addEventListener("change", (event) => {
      ui.role = event.target.value;
      updateRoleUi();
      requestPage(ui.requestedPage);
    });
    qs("#deniedBack").addEventListener("click", () => requestPage("ringkasan"));
    qs("#deniedSwitch").addEventListener("click", () => {
      ui.role = "admin";
      qs("#rolePreview").value = "admin";
      updateRoleUi();
      requestPage(ui.requestedPage);
    });
  }

  function wireTransactions() {
    ["#recentTransactions", "#transactionsBody"].forEach((selector) => {
      qs(selector).addEventListener("click", (event) => {
        const row = event.target.closest("tr[data-tx-id]");
        if (row) openTransaction(row.dataset.txId);
      });
    });
    qs("#txSearch").addEventListener("input", () => {
      ui.txPage = 1;
      renderTransactions();
    });
    qs("#txMonthFilter").addEventListener("change", () => {
      ui.txPage = 1;
      renderTransactions();
    });
    qs("#txStatusFilter").addEventListener("change", () => {
      ui.txPage = 1;
      renderTransactions();
    });
    qs("#txPager").addEventListener("click", (event) => {
      const button = event.target.closest("[data-tx-page]");
      if (!button || button.disabled) return;
      const page = Number(button.dataset.txPage);
      if (!Number.isFinite(page)) return;
      ui.txPage = page;
      renderTransactions();
    });
    qs("#transactionDetail").addEventListener("click", (event) => {
      const button = event.target.closest("[data-tx-void]");
      if (!button) return;
      if (!requireAdminAction("Simulasi role Kasir: membatalkan transaksi belum diizinkan.")) return;
      const tx = transactions.find((item) => item.id === button.dataset.txVoid);
      if (!tx || tx.status !== "lunas") return;
      const order = tx.order || tx.id;
      const confirmed = window.confirm(`Batalkan transaksi ${order} sebesar ${rupiah(tx.total)}? Status akan menjadi Dibatalkan dan masuk antrean sync demo.`);
      if (!confirmed) return;
      tx.status = "void";
      tx.sync = false;
      tx.voidReason = "Dibatalkan dari Admin";
      tx.voidAt = new Date().toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
      tx.voidBy = "Admin Nuvora";
      const stockRestored = restoreStockForAdmin(tx);
      const pointsReversed = reverseMemberPointsForAdmin(tx);
      store.saveTransactions();
      closeDialog("transactionDialog");
      renderTransactions();
      renderRecentTransactions();
      renderProducts();
      renderIngredients();
      renderStockMovements();
      renderMembers();
      renderSearchResults(qs("#searchModalInput") ? qs("#searchModalInput").value : "");
      addAudit({ action: "Membatalkan transaksi", object: order, reason: "Pembatalan demo dari Admin", category: "Transaksi", before: "Lunas", after: "Dibatalkan" });
      toast(`${order} dibatalkan pada demo dan masuk antrean sinkronisasi.${stockRestored ? " Stok dikembalikan." : ""}${pointsReversed ? " Poin member dikembalikan." : ""}`, "success");
    });
  }

  function wireProducts() {
    qs("#productSearch").addEventListener("input", renderProducts);
    qsa("[data-product-category]").forEach((button) => {
      button.addEventListener("click", () => {
        ui.productCategory = button.dataset.productCategory;
        qsa("[data-product-category]").forEach((chip) => {
          const active = chip === button;
          chip.classList.toggle("is-active", active);
          chip.setAttribute("aria-pressed", String(active));
        });
        renderProducts();
      });
    });
    qs("#productBody").addEventListener("click", (event) => {
      const soldOutButton = event.target.closest("[data-product-soldout]");
      if (soldOutButton) {
        if (!requireAdminAction("Simulasi role Kasir: mengubah status sold-out belum diizinkan.")) return;
        const product = products.find((item) => item.id === soldOutButton.dataset.productSoldout);
        if (!product) return;
        product.soldOut = !product.soldOut;
        store.saveProducts();
        renderProducts();
        addAudit({ action: product.soldOut ? "Menandai produk sold-out" : "Menandai produk tersedia", object: product.name, reason: "Ketersediaan manual", category: "Transaksi", before: product.soldOut ? "Tersedia" : "Sold-out", after: product.soldOut ? "Sold-out" : "Tersedia" });
        toast(`${product.name} ${product.soldOut ? "ditandai sold-out dan diblokir di POS" : "kembali tersedia di POS"}.`, product.soldOut ? "warning" : "success");
        return;
      }
      const button = event.target.closest("[data-product-toggle]");
      if (!button) return;
      if (!requireAdminAction("Simulasi role Kasir: mengubah status produk belum diizinkan.")) return;
      const product = products.find((item) => item.id === button.dataset.productToggle);
      if (!product) return;
      product.active = !product.active;
      store.saveProducts();
      renderProducts();
      addAudit({ action: product.active ? "Mengaktifkan produk" : "Menonaktifkan produk", object: product.name, reason: "Simulasi prototype", category: "Transaksi", before: product.active ? "Nonaktif" : "Aktif", after: product.active ? "Aktif" : "Nonaktif" });
      toast(`${product.name} ${product.active ? "diaktifkan" : "dinonaktifkan"} pada sesi demo.`, "success");
    });
    qs("#newProductPhoto").addEventListener("change", (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) {
        resetProductPhoto();
        return;
      }
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
        toast("Foto harus berupa JPG, PNG, atau WebP.", "warning");
        resetProductPhoto();
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast("Ukuran foto maksimal 2 MB pada demo ini.", "warning");
        resetProductPhoto();
        return;
      }
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        ui.productPhoto = String(reader.result);
        const preview = qs("#newProductPhotoPreview");
        preview.innerHTML = `<img src="${escapeHtml(ui.productPhoto)}" alt="">`;
        preview.classList.add("has-photo");
      });
      reader.readAsDataURL(file);
    });
    qs("#productDialog").addEventListener("close", () => {
      qs("#productForm").reset();
      resetProductPhoto();
    });
    qs("#productForm").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!requireAdminAction("Simulasi role Kasir: menambah produk belum diizinkan.")) return;
      const name = qs("#newProductName").value.trim();
      const category = qs("#newProductCategory").value;
      const price = Number(qs("#newProductPrice").value);
      if (!name || !price) {
        toast("Nama dan harga jual wajib diisi.", "warning");
        return;
      }
      const product = {
        id: store.nextId("p", products),
        name,
        category,
        price,
        hpp: 0,
        recipe: false,
        active: true,
        soldOut: false,
        stock: 0,
        icon: productIcon(category),
        ...(ui.productPhoto ? { photo: ui.productPhoto } : {}),
      };
      products.unshift(product);
      store.saveProducts();
      renderProducts();
      addAudit({ action: "Menambah produk", object: name, reason: "Input produk demo", category: "Transaksi", before: "—", after: `${category} · ${rupiah(price)}` });
      closeDialog("productDialog");
      toast(`${name} ditambahkan ke daftar demo.`, "success");
    });
  }

  function wireIngredients() {
    qs("#stockSearch").addEventListener("input", () => {
      renderIngredients();
      renderStockMovements();
    });
    qsa("[data-recipe]").forEach((button) => {
      button.addEventListener("click", () => renderRecipe(button.dataset.recipe));
    });
    document.addEventListener("click", (event) => {
      const demo = event.target.closest("[data-admin-demo]");
      if (demo) toast(demo.dataset.adminDemo, "warning");
    });
  }

  function wireOpname() {
    const form = qs("#opnameForm");
    form.addEventListener("input", (event) => {
      const input = event.target.closest("[data-opname-input]");
      if (!input) return;
      const key = input.dataset.opnameInput;
      const system = Number(qs(`[data-system="${key}"]`).dataset.system);
      const diff = Number(input.value) - system;
      const cell = qs(`[data-diff="${key}"]`);
      cell.textContent = `${diff > 0 ? "+" : ""}${formatQty(diff)}`;
      cell.style.color = diff === 0 ? "" : `var(--${diff > 0 ? "success" : "danger"})`;
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!requireAdminAction("Simulasi role Kasir: opname belum diizinkan.")) return;
      const reason = qs("#opnameReason").value.trim();
      if (!reason) {
        qs("#opnameReason").classList.add("input-error");
        toast("Alasan opname wajib diisi.", "warning");
        return;
      }
      qs("#opnameReason").classList.remove("input-error");
      const changes = qsa("[data-opname-input]").map((input) => {
        const system = Number(qs(`[data-system="${input.dataset.opnameInput}"]`).dataset.system);
        const physical = Number(input.value);
        const ingredientName = { ayam: "Ayam fillet", beras: "Beras", telur: "Telur" }[input.dataset.opnameInput];
        return { ingredient: ingredientName, system, physical, diff: physical - system };
      }).filter((item) => item.diff !== 0);
      closeDialog("opnameDialog");
      form.reset();
      qsa("[data-diff]").forEach((cell) => { cell.textContent = "0"; cell.style.color = ""; });
      if (!changes.length) {
        toast("Tidak ada selisih fisik; tidak ada penyesuaian demo yang dibuat.", "info");
        return;
      }
      changes.forEach((item) => {
        opnameHistory.unshift({ date: `30 Okt 2026 · ${nowClock()}`, ingredient: item.ingredient, system: item.system, physical: item.physical, actor: "Admin Demo", status: "Menunggu review", tone: "warning" });
      });
      renderOpnameHistory();
      addAudit({ action: "Mengajukan penyesuaian opname", object: changes.map((item) => item.ingredient).join(", "), reason, result: "Menunggu review", category: "Stok", before: changes.map((item) => `${item.ingredient}: ${formatQty(item.system)}`).join(" · "), after: changes.map((item) => `${item.ingredient}: ${formatQty(item.physical)} fisik`).join(" · ") });
      toast(`${changes.length} penyesuaian opname demo menunggu review. Saldo stok tidak diubah.`, "success");
    });
  }

  function wireEmployees() {
    qs("#employeeSearch").addEventListener("input", renderEmployees);
    qs("#employeeBody").addEventListener("click", (event) => {
      const button = event.target.closest("[data-employee-toggle]");
      if (!button) return;
      if (!requireAdminAction("Simulasi role Kasir: mengubah status karyawan belum diizinkan.")) return;
      const employee = employees.find((item) => item.id === button.dataset.employeeToggle);
      if (!employee) return;
      employee.active = !employee.active;
      store.saveEmployees();
      renderEmployees();
      addAudit({ action: employee.active ? "Mengaktifkan karyawan" : "Menonaktifkan karyawan", object: employee.name, reason: "Simulasi prototype", category: "Akses", before: employee.active ? "Nonaktif" : "Aktif", after: employee.active ? "Aktif" : "Nonaktif" });
      toast(`${employee.name} ${employee.active ? "diaktifkan" : "dinonaktifkan"} pada sesi demo.`, "success");
    });
    qs("#employeeForm").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!requireAdminAction("Simulasi role Kasir: menambah karyawan belum diizinkan.")) return;
      const name = qs("#newEmployeeName").value.trim();
      const role = qs("#newEmployeeRole").value;
      if (!name) {
        toast("Nama karyawan wajib diisi.", "warning");
        return;
      }
      employees.push({ id: store.nextId("e", employees), name, role, outlet: "Outlet Melati", joined: "30 Okt 2026", active: true });
      store.saveEmployees();
      renderEmployees();
      addAudit({ action: "Menambah karyawan", object: name, reason: "Input karyawan demo", category: "Akses", before: "—", after: `${role} · aktif` });
      closeDialog("employeeDialog");
      event.target.reset();
      toast(`${name} ditambahkan sebagai data demo. Akun login belum dibuat.`, "success");
    });
  }

  function wireMembers() {
    qs("#memberSearch").addEventListener("input", renderMembers);
    qs("#memberBody").addEventListener("click", (event) => {
      const adjustButton = event.target.closest("[data-member-adjust]");
      if (adjustButton) {
        openPointsDialog(adjustButton.dataset.memberAdjust);
        return;
      }
      const historyButton = event.target.closest("[data-member-history]");
      if (historyButton) {
        openMemberHistory(historyButton.dataset.memberHistory);
        return;
      }
      const toggleButton = event.target.closest("[data-member-toggle]");
      if (!toggleButton) return;
      if (!requireAdminAction("Simulasi role Kasir: mengubah status pelanggan belum diizinkan.")) return;
      const member = members.find((item) => item.id === toggleButton.dataset.memberToggle);
      if (!member) return;
      member.active = !member.active;
      store.saveMembers();
      renderMembers();
      addAudit({ action: member.active ? "Mengaktifkan pelanggan" : "Menonaktifkan pelanggan", object: member.name, reason: "Simulasi prototype", category: "Pelanggan", before: member.active ? "Nonaktif" : "Aktif", after: member.active ? "Aktif" : "Nonaktif" });
      toast(`${member.name} ${member.active ? "diaktifkan" : "dinonaktifkan"} pada sesi demo.`, "success");
    });
    qs("#memberForm").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!requireAdminAction("Simulasi role Kasir: menambah pelanggan belum diizinkan.")) return;
      const nameInput = qs("#newMemberName");
      const phoneInput = qs("#newMemberPhone");
      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const digits = phone.replace(/\D/g, "");
      const nameValid = name.length >= 2;
      const phoneValid = /^[0-9+\s().-]+$/.test(phone) && digits.length >= 8 && digits.length <= 15;
      nameInput.classList.toggle("input-error", !nameValid);
      phoneInput.classList.toggle("input-error", !phoneValid);
      if (!nameValid || !phoneValid) {
        toast(!nameValid ? "Nama pelanggan minimal 2 karakter." : "Nomor telepon tidak valid. Gunakan 8–15 digit.", "warning");
        return;
      }
      const member = {
        id: store.nextId("mem", members),
        name,
        phone,
        points: 0,
        joined: "30 Okt 2026",
        active: true,
        history: [],
      };
      members.push(member);
      store.saveMembers();
      renderMembers();
      addAudit({ action: "Menambah pelanggan", object: name, reason: "Input pelanggan demo", category: "Pelanggan", before: "—", after: `${phone} · 0 poin · aktif` });
      closeDialog("memberDialog");
      toast(`${name} ditambahkan sebagai pelanggan demo dengan 0 poin.`, "success");
    });
    qs("#memberDialog").addEventListener("close", () => {
      qs("#memberForm").reset();
      qs("#newMemberName").classList.remove("input-error");
      qs("#newMemberPhone").classList.remove("input-error");
    });
    qs("#pointsAmount").addEventListener("input", updatePointsPreview);
    qs("#pointsForm").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!requireAdminAction("Simulasi role Kasir: menyesuaikan poin pelanggan belum diizinkan.")) return;
      const member = members.find((item) => item.id === ui.memberTarget);
      if (!member) {
        closeDialog("pointsDialog");
        return;
      }
      const amountInput = qs("#pointsAmount");
      const reasonInput = qs("#pointsReason");
      const delta = Number(amountInput.value);
      const reason = reasonInput.value.trim();
      if (!Number.isInteger(delta) || delta === 0) {
        amountInput.classList.add("input-error");
        toast("Jumlah poin harus bilangan bulat dan tidak nol.", "warning");
        return;
      }
      amountInput.classList.remove("input-error");
      if (!reason) {
        reasonInput.classList.add("input-error");
        toast("Alasan penyesuaian wajib diisi.", "warning");
        return;
      }
      reasonInput.classList.remove("input-error");
      const current = Number(member.points) || 0;
      const next = current + delta;
      if (next < 0) {
        amountInput.classList.add("input-error");
        toast(`Poin tidak boleh di bawah 0. Maksimal pengurangan ${pointFormat.format(current)} poin.`, "warning");
        return;
      }
      member.points = next;
      member.history = memberHistory(member);
      member.history.unshift({
        at: `30 Okt 2026 · ${nowClock()}`,
        type: "adjust",
        points: delta,
        note: reason,
        txId: "",
        actor: ui.role === "kasir" ? "Kasir Demo" : "Admin Demo",
      });
      store.saveMembers();
      renderMembers();
      addAudit({ action: "Menyesuaikan poin pelanggan", object: `${member.name} · ${delta > 0 ? "+" : ""}${pointFormat.format(delta)} poin`, reason, category: "Pelanggan", before: `${pointFormat.format(current)} poin`, after: `${pointFormat.format(next)} poin` });
      if (ui.memberHistoryTarget === member.id) {
        qs("#memberHistorySub").textContent = `${member.name} · ${pointFormat.format(next)} poin`;
        renderMemberHistory(member);
      }
      closeDialog("pointsDialog");
      toast(`Poin ${member.name} ${delta > 0 ? "ditambah" : "dikurangi"} ${pointFormat.format(Math.abs(delta))}. Saldo baru ${pointFormat.format(next)} poin.`, "success");
    });
    qs("#pointsDialog").addEventListener("close", () => {
      qs("#pointsForm").reset();
      qs("#pointsAmount").classList.remove("input-error");
      qs("#pointsReason").classList.remove("input-error");
      ui.memberTarget = null;
    });
    qs("#loyaltyActiveSwitch").addEventListener("click", () => {
      const toggle = qs("#loyaltyActiveSwitch");
      const next = toggle.getAttribute("aria-checked") !== "true";
      toggle.setAttribute("aria-checked", String(next));
      toggle.setAttribute("aria-label", next ? "Nonaktifkan program loyalitas" : "Aktifkan program loyalitas");
      qs("#loyaltySettingsBadge").className = `badge badge-${next ? "success" : "neutral"}`;
      qs("#loyaltySettingsBadge").textContent = next ? "Aktif" : "Nonaktif";
    });
    ["#loyaltyEarnPerPoint", "#loyaltyPointValue", "#loyaltyMinRedeem"].forEach((selector) => {
      qs(selector).addEventListener("input", updateLoyaltyExample);
    });
    qs("#loyaltySettingsForm").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!requireAdminAction("Simulasi role Kasir: mengubah aturan loyalitas belum diizinkan.")) return;
      const previous = loyaltySettings();
      const active = qs("#loyaltyActiveSwitch").getAttribute("aria-checked") === "true";
      const earnPerPoint = Math.max(1, Math.round(Number(qs("#loyaltyEarnPerPoint").value) || 0));
      const pointValue = Math.max(1, Math.round(Number(qs("#loyaltyPointValue").value) || 0));
      const minRedeem = Math.max(1, Math.round(Number(qs("#loyaltyMinRedeem").value) || 0));
      const settings = store.getSettings();
      settings.loyalty = { active, earnPerPoint, pointValue, minRedeem };
      store.saveSettings();
      loadLoyaltySettings();
      renderMembers();
      addAudit({ action: "Menyimpan aturan loyalitas", object: "Aturan poin pelanggan", reason: "Pengaturan demo", category: "Pelanggan", before: `${previous.active ? "Aktif" : "Nonaktif"} · ${rupiah(previous.earnPerPoint)}/poin · ${pointFormat.format(previous.minRedeem)} poin = ${rupiah(previous.minRedeem * previous.pointValue)}`, after: `${active ? "Aktif" : "Nonaktif"} · ${rupiah(earnPerPoint)}/poin · ${pointFormat.format(minRedeem)} poin = ${rupiah(minRedeem * pointValue)}` });
      toast("Aturan loyalitas disimpan di localStorage demo.", "success");
    });
  }

  function wireAttendance() {
    qs("#attendanceSearch").addEventListener("input", renderAttendance);
    qs("#attendanceFilter").addEventListener("change", renderAttendance);
    qs("#attendanceBody").addEventListener("click", (event) => {
      const button = event.target.closest("[data-attendance-correct]");
      if (button) openCorrection(button.dataset.attendanceCorrect);
    });
    qs("#adminCorrectionForm").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!requireAdminAction("Simulasi role Kasir: koreksi absensi belum diizinkan.")) return;
      const reason = qs("#adminCorrectionReason").value.trim();
      if (!reason) {
        qs("#adminCorrectionReason").classList.add("input-error");
        toast("Alasan koreksi wajib diisi.", "warning");
        return;
      }
      const record = attendanceRecords.find((item) => item.id === ui.correctionTarget);
      if (record) {
        record.correctionSubmitted = true;
        record.status = "Koreksi diajukan";
        record.statusCode = "koreksi";
        renderAttendance();
        addAudit({ action: "Mengajukan koreksi absensi", object: `${record.name} · ${record.date}`, reason, result: "Menunggu review", category: "Absensi", before: record.seed, after: "Menunggu review" });
      }
      qs("#adminCorrectionReason").value = "";
      qs("#adminCorrectionReason").classList.remove("input-error");
      closeDialog("correctionDialog");
      toast("Koreksi absensi demo dikirim ke antrean review. Perubahan belum diterapkan.", "success");
    });
  }

  function wireExpenses() {
    qs("#expenseForm").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!requireAdminAction("Simulasi role Kasir: mencatat pengeluaran belum diizinkan.")) return;
      const category = qs("#expenseCategory").value;
      const description = qs("#expenseDescription").value.trim();
      const amount = Number(qs("#expenseAmount").value);
      if (!description || !amount) {
        toast("Keterangan dan jumlah wajib diisi.", "warning");
        return;
      }
      expenses.unshift({ id: `x${Date.now()}`, date: "30 Okt 2026", category, description, actor: "Admin Demo", receipt: false, amount });
      renderExpenses();
      addAudit({ action: "Mencatat pengeluaran", object: description, reason: "Input pengeluaran demo", category: "Akses", before: "—", after: `${category} · ${rupiah(amount)}` });
      closeDialog("expenseDialog");
      event.target.reset();
      toast("Pengeluaran demo ditambahkan. Kas nyata tidak berubah.", "success");
    });
  }

  function wireAudit() {
    qs("#auditFilter").addEventListener("change", renderAudit);
    qs("#auditBody").addEventListener("click", (event) => {
      const button = event.target.closest("[data-audit-id]");
      if (button) openAudit(button.dataset.auditId);
    });
  }

  function wireReports() {
    qsa("[data-report-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        qsa("[data-report-tab]").forEach((tab) => tab.setAttribute("aria-selected", String(tab === button)));
        qsa("[data-report-panel]").forEach((panel) => { panel.hidden = panel.dataset.reportPanel !== button.dataset.reportTab; });
      });
    });
    qsa("[data-subtab]").forEach((button) => {
      button.addEventListener("click", () => {
        const tabs = button.closest(".subtabs");
        qsa("[data-subtab]", tabs).forEach((tab) => tab.setAttribute("aria-selected", String(tab === button)));
        const container = button.closest(".table-panel") || document;
        qsa(".tab-panel", container).forEach((panel) => panel.classList.toggle("active", panel.id === button.getAttribute("aria-controls")));
      });
    });
  }

  function loadOutletSettings() {
    const settings = store.getSettings();
    qs("#outletName").value = settings.outletName;
    qs("#outletPhone").value = settings.outletPhone;
    qs("#outletAddress").value = settings.outletAddress;
  }

  function wireSettings() {
    qs("#saveOutlet").addEventListener("click", () => {
      if (!requireAdminAction("Simulasi role Kasir tidak memiliki akses ke pengaturan outlet.")) return;
      const settings = store.getSettings();
      settings.outletName = qs("#outletName").value.trim() || "Outlet Melati";
      settings.outletPhone = qs("#outletPhone").value.trim();
      settings.outletAddress = qs("#outletAddress").value.trim();
      store.saveSettings();
      addAudit({ action: "Menyimpan profil outlet", object: settings.outletName, reason: "Pengaturan demo", category: "Akses", before: "—", after: "Profil outlet diperbarui" });
      toast("Profil outlet disimpan di localStorage browser demo.", "success");
    });
    qs("#resetMasterBtn").addEventListener("click", () => {
      if (!requireAdminAction("Simulasi role Kasir tidak memiliki akses ke reset data master.")) return;
      if (!window.confirm("Reset produk, karyawan, bahan, member, dan pengaturan ke data awal? Transaksi dan absensi tidak diubah.")) return;
      store.resetMaster();
      loadOutletSettings();
      loadLoyaltySettings();
      renderProducts();
      renderEmployees();
      renderMembers();
      renderSearchResults("");
      addAudit({ action: "Reset data master", object: "Produk, karyawan, pelanggan, pengaturan", reason: "Reset demo", category: "Akses", before: "Data lokal", after: "Data awal" });
      toast("Data master dikembalikan ke kondisi awal demo.", "success");
    });
    qs("#startBackup").addEventListener("click", startBackup);
    qs("#backupDialog").addEventListener("close", resetBackup);
    document.addEventListener("click", (event) => {
      const toggle = event.target.closest("[data-toggle-switch]");
      if (!toggle) return;
      const next = toggle.getAttribute("aria-checked") !== "true";
      toggle.setAttribute("aria-checked", String(next));
      toast(`Pengaturan demo ${next ? "diaktifkan" : "dinonaktifkan"}. Tidak ada perangkat nyata yang terhubung.`, "info");
    });
  }

  function wireSearch() {
    qs("#globalSearchInput").addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      openSearch(event.target.value);
    });
    qs("#searchModalInput").addEventListener("input", (event) => renderSearchResults(event.target.value));
    qs("#searchResults").addEventListener("click", (event) => {
      const result = event.target.closest("[data-search-page]");
      if (!result) return;
      closeDialog("searchDialog");
      requestPage(result.dataset.searchPage);
    });
    document.addEventListener("click", (event) => {
      const closer = event.target.closest("[data-close-dialog]");
      if (closer) {
        const dialog = closer.closest("dialog");
        if (dialog) closeDialog(dialog);
      }
    });
  }

  function init() {
    updateRoleUi();
    loadOutletSettings();
    renderRecentTransactions();
    renderTransactions();
    renderProducts();
    renderIngredients();
    renderStockMovements();
    renderRecipe("paket");
    renderOpnameHistory();
    renderEmployees();
    loadLoyaltySettings();
    renderMembers();
    renderAttendance();
    renderExpenses();
    renderAudit();
    renderSearchResults("");
    wireNavigation();
    wireTransactions();
    wireProducts();
    wireIngredients();
    wireOpname();
    wireEmployees();
    wireMembers();
    wireAttendance();
    wireExpenses();
    wireAudit();
    wireReports();
    wireSettings();
    wireSearch();
    store.subscribe(() => {
      renderProducts();
      renderEmployees();
      renderIngredients();
      renderStockMovements();
      loadLoyaltySettings();
      renderMembers();
      loadOutletSettings();
      renderSearchResults("");
    });
    showPage("ringkasan");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
