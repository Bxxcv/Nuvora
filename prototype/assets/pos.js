(function () {
  "use strict";

  const { qs, qsa, icon, openDialog, closeDialog, toast, rupiah, escapeHtml, dateShort } = window.Nuvora;
  const store = window.NuvoraStore;
  const products = store.getProducts();

  const seedHistory = [
    {
      id: "#TRX-0086", date: "30 Okt 2026", time: "10.18", cashier: "Sari Wulandari", type: "Dine-in",
      payment: "QRIS manual", total: 48000, sync: true, status: "lunas", cashGiven: null, change: null,
      qrisRef: "QRIS-30A-118", note: "",
      items: [
        { name: "Paket Nuvora", qty: 1, price: 18000 },
        { name: "Beef Burger", qty: 1, price: 25000 },
        { name: "Extra Telur", qty: 1, price: 5000 },
      ],
    },
    {
      id: "#TRX-0085", date: "30 Okt 2026", time: "10.07", cashier: "Sari Wulandari", type: "Takeaway",
      payment: "Tunai", total: 36000, sync: true, status: "lunas", cashGiven: 50000, change: 14000,
      qrisRef: null, note: "",
      items: [
        { name: "Beef Burger", qty: 1, price: 25000 },
        { name: "Es Teh", qty: 1, price: 6000 },
        { name: "Extra Telur", qty: 1, price: 5000 },
      ],
    },
    {
      id: "#TRX-0084", date: "30 Okt 2026", time: "09.56", cashier: "Sari Wulandari", type: "Dine-in",
      payment: "Tunai", total: 27000, sync: true, status: "lunas", cashGiven: 30000, change: 3000,
      qrisRef: null, note: "",
      items: [
        { name: "Chicken Burger", qty: 1, price: 22000 },
        { name: "Air Mineral", qty: 1, price: 5000 },
      ],
    },
    {
      id: "#TRX-0083", date: "30 Okt 2026", time: "09.42", cashier: "Sari Wulandari", type: "Delivery",
      payment: "QRIS manual", total: 65000, sync: false, status: "lunas", cashGiven: null, change: null,
      qrisRef: "QRIS-30A-117", note: "Pesanan WhatsApp. Tersimpan lokal, menunggu sinkronisasi.",
      items: [
        { name: "Paket Hemat", qty: 1, price: 25000 },
        { name: "Beef Burger", qty: 1, price: 25000 },
        { name: "Kopi Susu", qty: 1, price: 15000 },
      ],
    },
    {
      id: "#TRX-0082", date: "30 Okt 2026", time: "09.30", cashier: "Sari Wulandari", type: "Takeaway",
      payment: "Tunai", total: 22000, sync: true, status: "lunas", cashGiven: 25000, change: 3000,
      qrisRef: null, note: "",
      items: [{ name: "Chicken Burger", qty: 1, price: 22000 }],
    },
    {
      id: "#TRX-0081", date: "30 Okt 2026", time: "09.12", cashier: "Sari Wulandari", type: "Dine-in",
      payment: "QRIS manual", total: 42000, sync: false, status: "lunas", cashGiven: null, change: null,
      qrisRef: "QRIS-30A-116", note: "Tersimpan lokal, menunggu sinkronisasi.",
      items: [
        { name: "Chicken Burger", qty: 1, price: 22000 },
        { name: "Nasi Telur", qty: 1, price: 15000 },
        { name: "Air Mineral", qty: 1, price: 5000 },
      ],
    },
  ];

  const initialHistory = store.getTransactions();
  if (!initialHistory.length) {
    initialHistory.push(...clone(seedHistory));
    store.saveTransactions();
  }
  const initialOrderNumber = initialHistory.reduce((value, tx) => {
    const match = String(tx.id || "").match(/^#TRX-(\d+)$/);
    return match ? Math.max(value, Number(match[1])) : value;
  }, 86) + 1;

  const ui = {
    category: "all",
    orderType: "Dine-in",
    paymentMethod: null,
    cashReceived: 0,
    qrisVerified: false,
    splitCash: 0,
    splitQris: 0,
    splitCashReceived: 0,
    splitQrisVerified: false,
    offline: false,
    cart: [],
    history: initialHistory,
    nextOrderNumber: initialOrderNumber,
    expenses: Number(store.getSettings().expenses) || 45000,
    openingCash: Number(store.getSettings().openingCash) || 300000,
    currentReceipt: null,
    receiptFromHistory: false,
    view: "kasir",
    syncTimer: null,
    syncRunning: false,
    memberId: null,
    redeemPoints: 0,
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function roundCash(value) {
    return Math.max(0, Math.round((Number(value) || 0) / 100) * 100);
  }

  function splitTotals() {
    const total = payableTotal();
    const cash = roundCash(ui.splitCash);
    const qris = Number(ui.splitQris) || 0;
    const received = Number(ui.splitCashReceived) || 0;
    return {
      total,
      cash,
      qris,
      received,
      rounding: cash - (Number(ui.splitCash) || 0),
      change: received - cash,
      diff: total - (cash + qris),
    };
  }

  function nowTime() {
    return new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" })
      .format(new Date())
      .replace(":", ".");
  }

  function formatDateLong(date) {
    return new Intl.DateTimeFormat("id-ID", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
      .format(date || new Date())
      .replace(/\./g, "");
  }

  function badge(text, tone) {
    return `<span class="badge badge-${tone}">${escapeHtml(text)}</span>`;
  }

  function productById(id) {
    return products.find((item) => item.id === id);
  }

  function stockOf(product) {
    const value = Number(product && product.stock);
    return Number.isFinite(value) ? value : 0;
  }

  function iconOf(product) {
    return (product && product.icon) || { Paket: "layers", Makanan: "utensils", Minuman: "cup", Tambahan: "fries" }[(product && product.category) || ""] || "utensils";
  }

  function stockMovementId() {
    return `m-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  function applyStockForTransaction(tx) {
    const recipes = store.getRecipes();
    const ingredients = store.getIngredients();
    const movements = store.getStockMovements();
    const effects = [];
    const time = `${dateShort(new Date())} · ${nowTime()}`;
    tx.items.forEach((item) => {
      const product = productById(item.productId);
      if (!product) return;
      const recipe = recipes[product.id];
      if (Array.isArray(recipe) && recipe.length) {
        recipe.forEach((part) => {
          const ingredient = ingredients.find((entry) => entry.id === part.ingredientId);
          if (!ingredient) return;
          const qty = (Number(part.qty) || 0) * item.qty;
          const before = Number(ingredient.stock) || 0;
          const after = before - qty;
          ingredient.stock = Number(after.toFixed(3));
          effects.push({ type: "ingredient", id: ingredient.id, name: ingredient.name, qty, unit: ingredient.unit, before, after });
          movements.unshift({
            id: stockMovementId(),
            time,
            ingredient: ingredient.name,
            type: "Keluar",
            qty,
            unit: ingredient.unit,
            source: `Penjualan ${tx.id}`,
            actor: tx.cashier,
            note: `Resep ${product.name}`,
          });
        });
      } else {
        const before = stockOf(product);
        const after = before - item.qty;
        product.stock = after;
        effects.push({ type: "product", id: product.id, name: product.name, qty: item.qty, unit: "porsi", before, after });
        movements.unshift({
          id: stockMovementId(),
          time,
          ingredient: product.name,
          type: "Keluar",
          qty: item.qty,
          unit: "porsi",
          source: `Penjualan ${tx.id}`,
          actor: tx.cashier,
          note: "Stok produk jadi",
        });
      }
    });
    if (!effects.length) return;
    tx.stockEffects = effects;
    tx.stockRestored = false;
    store.saveProducts();
    store.saveIngredients();
    store.saveStockMovements();
  }

  function restoreStockForTransaction(tx) {
    if (!tx.stockEffects || !tx.stockEffects.length || tx.stockRestored) return;
    const productsById = new Map(store.getProducts().map((product) => [product.id, product]));
    const ingredientsById = new Map(store.getIngredients().map((ingredient) => [ingredient.id, ingredient]));
    const movements = store.getStockMovements();
    const time = `${dateShort(new Date())} · ${nowTime()}`;
    tx.stockEffects.forEach((effect) => {
      if (effect.type === "ingredient") {
        const ingredient = ingredientsById.get(effect.id);
        if (ingredient) ingredient.stock = Number(((Number(ingredient.stock) || 0) + effect.qty).toFixed(3));
        movements.unshift({
          id: stockMovementId(),
          time,
          ingredient: effect.name,
          type: "Masuk",
          qty: effect.qty,
          unit: effect.unit,
          source: `Pembatalan ${tx.id}`,
          actor: currentCashier().name,
          note: "Pengembalian stok karena transaksi dibatalkan",
        });
      } else {
        const product = productsById.get(effect.id);
        if (product) product.stock = stockOf(product) + effect.qty;
        movements.unshift({
          id: stockMovementId(),
          time,
          ingredient: effect.name,
          type: "Masuk",
          qty: effect.qty,
          unit: effect.unit,
          source: `Pembatalan ${tx.id}`,
          actor: currentCashier().name,
          note: "Pengembalian stok produk jadi",
        });
      }
    });
    tx.stockRestored = true;
    store.saveProducts();
    store.saveIngredients();
    store.saveStockMovements();
  }

  function initials(name) {
    return String(name || "Kasir").split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase();
  }

  function currentCashier() {
    return store.getCashier();
  }

  function renderCashier() {
    const cashier = currentCashier();
    const select = qs("#cashierSelect");
    qs("#posCashierName").textContent = cashier.name;
    qs("#posCashierAvatar").textContent = initials(cashier.name);
    qs("#sessionCashierName").textContent = cashier.name;
    if (select) {
      select.innerHTML = store.getCashiers().map((employee) => `<option value="${escapeHtml(employee.id)}">${escapeHtml(employee.name)} · ${escapeHtml(employee.role)}</option>`).join("");
      select.value = cashier.id;
    }
  }

  function productPhoto(product, className) {
    return product.photo
      ? `<img class="${className}" src="${escapeHtml(product.photo)}" alt="">`
      : "";
  }

  function totalOf(items) {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function cartTotal() {
    return ui.cart.reduce((sum, line) => {
      const product = productById(line.productId);
      return sum + (product ? product.price * line.qty : 0);
    }, 0);
  }

  function cartQuantity() {
    return ui.cart.reduce((sum, line) => sum + line.qty, 0);
  }

  function pointsText(value) {
    return `${(Number(value) || 0).toLocaleString("id-ID")} poin`;
  }

  function loyaltySettings() {
    const loyalty = store.getSettings().loyalty || {};
    return {
      active: loyalty.active !== false,
      earnPerPoint: Math.max(1, Number(loyalty.earnPerPoint) || 1000),
      pointValue: Math.max(1, Number(loyalty.pointValue) || 100),
      minRedeem: Math.max(1, Number(loyalty.minRedeem) || 100),
    };
  }

  function selectedMember() {
    if (!ui.memberId) return null;
    const member = store.getMembers().find((item) => item.id === ui.memberId);
    if (!member || !member.active) {
      ui.memberId = null;
      ui.redeemPoints = 0;
      return null;
    }
    return member;
  }

  function maxRedeemPoints() {
    const member = selectedMember();
    const loyalty = loyaltySettings();
    if (!member || !loyalty.active) return 0;
    return Math.min(Number(member.points) || 0, Math.floor(cartTotal() / loyalty.pointValue));
  }

  function effectiveRedeemPoints() {
    const member = selectedMember();
    const loyalty = loyaltySettings();
    if (!member || !loyalty.active) return 0;
    const max = maxRedeemPoints();
    const points = Math.min(Math.max(0, Math.floor(Number(ui.redeemPoints) || 0)), max);
    return points >= loyalty.minRedeem ? points : 0;
  }

  function memberDiscount() {
    const member = selectedMember();
    const loyalty = loyaltySettings();
    if (!member || !loyalty.active) return 0;
    return Math.min(cartTotal(), effectiveRedeemPoints() * loyalty.pointValue);
  }

  function payableTotal() {
    return Math.max(0, cartTotal() - memberDiscount());
  }

  function paymentBadge(payment) {
    if (payment === "Poin") return badge(payment, "success");
    return badge(payment, payment === "QRIS manual" || payment === "Tunai + QRIS" ? "info" : "neutral");
  }

  function statusBadge(status) {
    if (status === "void") return badge("Dibatalkan", "danger");
    if (status === "refund") return badge("Refund", "danger");
    return badge("Lunas", "success");
  }

  function statusLabel(status) {
    if (status === "void") return "Dibatalkan";
    if (status === "refund") return "Refund";
    return "Lunas";
  }

  function syncBadge(sync) {
    return sync ? `<span class="status-dot ok">Tersinkron</span>` : `<span class="status-dot warn">Menunggu</span>`;
  }

  function queueCount() {
    return ui.history.filter((tx) => !tx.sync).length;
  }

  function lowStockProducts() {
    return products.filter((product) => product.active !== false && stockOf(product) <= 3);
  }

  function sessionTotals() {
    const active = ui.history.filter((tx) => tx.status !== "refund" && tx.status !== "void");
    const cashSales = active.reduce((sum, tx) => {
      if (tx.payment === "Tunai") return sum + tx.total;
      if (tx.payment === "Tunai + QRIS") return sum + (Number(tx.cashAmount) || 0);
      return sum;
    }, 0);
    const qrisSales = active.reduce((sum, tx) => {
      if (tx.payment === "QRIS manual") return sum + tx.total;
      if (tx.payment === "Tunai + QRIS") return sum + (Number(tx.qrisAmount) || 0);
      return sum;
    }, 0);
    return {
      cashSales,
      qrisSales,
      expectedCash: ui.openingCash + cashSales - ui.expenses,
      queue: queueCount(),
    };
  }

  function renderProducts() {
    const query = qs("#posSearch").value.trim().toLowerCase();
    const rows = products.filter((product) => {
      const categoryMatch = ui.category === "all" || product.category === ui.category;
      return categoryMatch && (!query || product.name.toLowerCase().includes(query));
    });
    qs("#categoryTitle").textContent = ui.category === "all" ? "Semua menu" : ui.category;
    qs("#productCount").textContent = `${rows.length} produk`;
    qs("#productGrid").innerHTML = rows.length
      ?         rows.map((product) => {
          const low = stockOf(product) <= 3;
          const soldOut = product.soldOut === true;
          const photo = productPhoto(product, "pos-product-photo");
          return `<button class="pos-product" type="button" data-product-id="${product.id}" aria-label="${soldOut ? `${escapeHtml(product.name)} sedang sold-out` : `Tambah ${escapeHtml(product.name)} ke pesanan`}" ${soldOut ? "disabled aria-disabled=\"true\"" : ""}>
            <span class="pos-product-visual tone-${product.category.toLowerCase()}${photo ? " has-photo" : ""}">
              <span class="pos-product-stock${low || soldOut ? " is-low" : ""}">${soldOut ? "Sold-out" : `Stok ${stockOf(product)}`}</span>
              ${photo || `<span class="pos-product-art">${icon(iconOf(product))}</span>`}
            </span>
            <span class="pos-product-body">
              <span class="pos-product-name">${escapeHtml(product.name)}</span>
              <span class="pos-product-category">${escapeHtml(product.category)}</span>
              <span class="pos-product-bottom">
                <span class="pos-product-price">${rupiah(product.price)}</span>
                <span class="pos-card-add">${icon("plus")}</span>
              </span>
            </span>
          </button>`;
        }).join("")
      : `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">${icon("search")}</div><h4>Produk tidak ditemukan</h4><p>Ubah kata kunci atau kategori menu.</p></div>`;
    const lowCount = lowStockProducts().length;
    qs("#lowStockCount").textContent = `${lowCount} menu stok menipis`;
  }

  function renderCart() {
    const empty = ui.cart.length === 0;
    const discount = memberDiscount();
    qs("#cartItems").hidden = empty;
    qs("#cartEmpty").hidden = !empty;
    qs("#clearCartBtn").disabled = empty;
    qs("#payButton").disabled = empty;
    qs("#cartItems").innerHTML = ui.cart.map((line) => {
      const product = productById(line.productId);
      if (!product) return "";
      const overStock = line.qty > stockOf(product);
      return `<div class="pos-cart-item" data-cart-id="${product.id}">
        <span class="pos-cart-thumb">${productPhoto(product, "") || icon(iconOf(product))}</span>
        <div class="pos-cart-main">
          <b>${escapeHtml(product.name)}</b>
          <small>${rupiah(product.price)}${overStock ? ` · <span class="cart-stock-warning">melebihi stok demo (${stockOf(product)})</span>` : ""}</small>
          <div class="pos-cart-controls">
            <div class="pos-qty">
              <button type="button" data-cart-dec="${product.id}" aria-label="Kurangi ${escapeHtml(product.name)}">${icon("minus")}</button>
              <span>${line.qty}</span>
              <button type="button" data-cart-inc="${product.id}" aria-label="Tambah ${escapeHtml(product.name)}">${icon("plus")}</button>
            </div>
            <button class="pos-cart-remove" type="button" data-cart-remove="${product.id}" aria-label="Hapus ${escapeHtml(product.name)}">${icon("trash")}</button>
          </div>
        </div>
        <div class="pos-cart-line-total">${rupiah(product.price * line.qty)}</div>
      </div>`;
    }).join("");
    const subtotal = cartTotal();
    const total = Math.max(0, subtotal - discount);
    qs("#subtotalValue").textContent = rupiah(subtotal);
    qs("#totalValue").textContent = rupiah(total);
    qs("#memberDiscountRow").hidden = discount <= 0;
    qs("#memberDiscountTicket").textContent = `−${rupiah(discount)}`;
    qs("#ticketItemCount").textContent = empty ? "Belum ada item" : `${cartQuantity()} item · ${ui.cart.length} menu`;
    const holdCount = store.getHeldOrders().length;
    const holdButton = qs("#holdOrderBtn");
    if (holdButton) {
      holdButton.textContent = `Simpan order (${holdCount}/5)`;
      holdButton.disabled = empty || holdCount >= 5;
    }
    const openHoldButton = qs("#openHoldBtn");
    if (openHoldButton) {
      openHoldButton.hidden = holdCount === 0;
      openHoldButton.textContent = `Lihat order ditahan (${holdCount})`;
    }
  }

  function addToCart(productId) {
    const product = productById(productId);
    if (!product) return;
    if (product.soldOut) {
      toast(`${product.name} sedang sold-out dan tidak dapat dijual.`, "warning");
      return;
    }
    const line = ui.cart.find((item) => item.productId === productId);
    if (line) line.qty += 1;
    else ui.cart.push({ productId, qty: 1 });
    if (line && line.qty > stockOf(product)) {
      toast(`Jumlah melebihi stok demo (${stockOf(product)}). Penjualan tetap diizinkan; stok dapat menjadi minus.`, "warning");
    }
    renderCart();
  }

  function changeQuantity(productId, delta) {
    const line = ui.cart.find((item) => item.productId === productId);
    if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) ui.cart = ui.cart.filter((item) => item.productId !== productId);
    renderCart();
  }

  function removeFromCart(productId) {
    ui.cart = ui.cart.filter((item) => item.productId !== productId);
    renderCart();
  }

  function clearCart() {
    ui.cart = [];
    qs("#orderNote").value = "";
    renderCart();
    closeDialog("clearCartDialog");
    toast("Draft pesanan dikosongkan. Riwayat transaksi tidak berubah.", "info");
  }

  function nextHoldId() {
    const max = store.getHeldOrders().reduce((value, hold) => {
      const match = String(hold.id || "").match(/^HOLD-(\d+)$/);
      return match ? Math.max(value, Number(match[1])) : value;
    }, 0);
    return `HOLD-${String(max + 1).padStart(3, "0")}`;
  }

  function renderHeldOrders() {
    const holds = store.getHeldOrders();
    qs("#holdDialogSub").textContent = `${holds.length} dari 5 order aktif`;
    qs("#heldOrderList").innerHTML = holds.length
      ? holds.map((hold) => `<div class="held-order-item">
          <div class="held-order-main">
            <b>${escapeHtml(hold.id)} · ${escapeHtml(hold.orderType)}</b>
            <span>${escapeHtml(hold.time)} · ${escapeHtml(hold.cashier)} · ${hold.items.reduce((sum, item) => sum + item.qty, 0)} item${hold.note ? ` · ${escapeHtml(hold.note)}` : ""}</span>
          </div>
          <div class="held-order-total">${rupiah(hold.total)}</div>
          <div class="held-order-actions">
            <button class="btn btn-primary btn-sm" type="button" data-resume-hold="${escapeHtml(hold.id)}">Lanjutkan</button>
            <button class="btn btn-ghost btn-sm" type="button" data-delete-hold="${escapeHtml(hold.id)}">Hapus</button>
          </div>
        </div>`).join("")
      : `<div class="empty-state" style="padding:24px"><div class="empty-icon">${icon("bag")}</div><h4>Belum ada order ditahan</h4><p>Simpan draft dari halaman kasir untuk melanjutkannya nanti.</p></div>`;
    const button = qs("#holdOrderBtn");
    if (button) {
      button.textContent = `Simpan order (${holds.length}/5)`;
      button.disabled = ui.cart.length === 0 || holds.length >= 5;
    }
    const openButton = qs("#openHoldBtn");
    if (openButton) {
      openButton.hidden = holds.length === 0;
      openButton.textContent = `Lihat order ditahan (${holds.length})`;
    }
  }

  function saveHeldOrder() {
    if (!ui.cart.length) return;
    const holds = store.getHeldOrders();
    if (holds.length >= 5) {
      toast("Maksimal 5 order ditahan. Lanjutkan atau hapus salah satu order terlebih dahulu.", "warning");
      return;
    }
    const hold = {
      id: nextHoldId(),
      date: dateShort(new Date()),
      time: nowTime(),
      cashier: currentCashier().name,
      orderType: ui.orderType,
      note: qs("#orderNote").value.trim(),
      total: cartTotal(),
      items: ui.cart.map((line) => {
        const product = productById(line.productId);
        return { productId: line.productId, name: product ? product.name : "Produk", price: product ? product.price : 0, qty: line.qty };
      }),
    };
    holds.unshift(hold);
    store.saveHeldOrders();
    ui.cart = [];
    qs("#orderNote").value = "";
    ui.orderType = "Dine-in";
    qsa("[data-order-type]").forEach((button) => {
      const active = button.dataset.orderType === "Dine-in";
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    renderCart();
    renderHeldOrders();
    toast(`${hold.id} ditahan. Draft pesanan dikosongkan.`, "success");
  }

  function openHoldDialog() {
    renderHeldOrders();
    openDialog("holdDialog");
  }

  function resumeHeldOrder(id) {
    const holds = store.getHeldOrders();
    const hold = holds.find((item) => item.id === id);
    if (!hold) return;
    if (ui.cart.length && !window.confirm("Draft pesanan saat ini akan diganti dengan order yang ditahan. Lanjutkan?")) return;
    ui.cart = hold.items
      .filter((item) => productById(item.productId))
      .map((item) => ({ productId: item.productId, qty: item.qty }));
    ui.orderType = hold.orderType || "Dine-in";
    qs("#orderNote").value = hold.note || "";
    qsa("[data-order-type]").forEach((button) => {
      const active = button.dataset.orderType === ui.orderType;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    holds.splice(holds.indexOf(hold), 1);
    store.saveHeldOrders();
    closeDialog("holdDialog");
    renderCart();
    renderHeldOrders();
    setView("kasir");
    toast(`${hold.id} dilanjutkan ke draft pesanan.`, "success");
  }

  function deleteHeldOrder(id) {
    const holds = store.getHeldOrders();
    const hold = holds.find((item) => item.id === id);
    if (!hold) return;
    if (!window.confirm(`Hapus ${hold.id} dari order ditahan?`)) return;
    holds.splice(holds.indexOf(hold), 1);
    store.saveHeldOrders();
    renderHeldOrders();
    renderCart();
    toast(`${hold.id} dihapus dari order ditahan.`, "info");
  }

  function loadSampleOrder() {
    ui.cart = [
      { productId: "p01", qty: 1 },
      { productId: "p02", qty: 1 },
      { productId: "p04", qty: 2 },
    ];
    renderCart();
    toast("Contoh pesanan dimuat ke draft demo.", "info");
  }

  function renderConnection() {
    const queue = queueCount();
    const button = qs("#connectionToggle");
    button.classList.toggle("is-offline", ui.offline);
    button.classList.toggle("is-online", !ui.offline);
    button.setAttribute("aria-pressed", String(ui.offline));
    qs("#connectionLabel").textContent = ui.offline ? "Offline" : "Online";
    qs("#connectionSub").textContent = ui.offline
      ? (queue ? `${queue} transaksi lokal` : "Transaksi lokal")
      : (queue ? `${queue} menunggu sync` : "Demo lokal");
    qs("#syncQueueBtn").hidden = ui.offline || queue === 0;
    qs("#syncQueueCount").textContent = queue;
    qs("#demoOfflineToggle").setAttribute("aria-checked", String(ui.offline));
    qs("#demoQueueText").textContent = queue ? `${queue} transaksi menunggu.` : "Tidak ada antrean.";
    qs("#demoSyncBtn").disabled = ui.offline || queue === 0;
    qs("#sessionSyncBtn").disabled = ui.offline || queue === 0;
    qs("#sessionSyncBtn").textContent = ui.offline ? "Offline" : queue === 0 ? "Tidak ada antrean" : "Sinkronkan antrean";
    qs("#sessionQueue").textContent = queue ? `${queue} transaksi` : "Tidak ada antrean";
    qs("#sessionQueue").style.color = queue ? "var(--warning)" : "";
  }

  function renderHistory() {
    const filter = qs("#historyFilter").value;
    const rows = ui.history.filter((tx) => {
      if (filter === "synced") return tx.sync;
      if (filter === "pending") return !tx.sync;
      if (filter === "void") return tx.status === "void";
      if (filter === "refund") return tx.status === "refund";
      return true;
    });
    qs("#historyBody").innerHTML = rows.length
      ? rows.map((tx) => `<tr data-history-id="${escapeHtml(tx.id)}">
          <td>${escapeHtml(tx.time)}</td>
          <td class="mono row-title">${escapeHtml(tx.id)}</td>
          <td>${escapeHtml(tx.type)}${tx.member ? `<small class="history-member">${escapeHtml(tx.member.name)}</small>` : ""}</td>
          <td>${paymentBadge(tx.payment)}</td>
          <td>${statusBadge(tx.status)}</td>
          <td>${syncBadge(tx.sync)}</td>
          <td class="num row-title">${rupiah(tx.total)}</td>
        </tr>`).join("")
      : `<tr><td colspan="7"><div class="empty-state" style="padding:24px"><div class="empty-icon">${icon("receipt")}</div><h4>Tidak ada transaksi</h4><p>Filter ini belum memiliki transaksi demo.</p></div></td></tr>`;
    qs("#historyCountBadge").textContent = `${rows.length} transaksi`;
    qs("#historyCount").textContent = ui.history.length;
  }

  function stockStatus(product) {
    const stock = stockOf(product);
    if (stock <= 0) return { label: "Habis", tone: "danger" };
    if (stock <= 3) return { label: "Menipis", tone: "warning" };
    return { label: "Aman", tone: "success" };
  }

  function renderStock() {
    const query = qs("#stockSearch").value.trim().toLowerCase();
    const filter = qs("#stockFilter").value;
    const activeProducts = products.filter((product) => product.active !== false);
    const rows = activeProducts.filter((product) => {
      const matchesQuery = !query
        || product.name.toLowerCase().includes(query)
        || product.category.toLowerCase().includes(query);
      if (!matchesQuery) return false;
      if (filter === "low") return stockOf(product) > 0 && stockOf(product) <= 3;
      if (filter === "out") return stockOf(product) <= 0;
      return true;
    });

    const safe = activeProducts.filter((product) => stockOf(product) > 3).length;
    const low = activeProducts.filter((product) => stockOf(product) > 0 && stockOf(product) <= 3).length;
    const out = activeProducts.filter((product) => stockOf(product) <= 0).length;
    const needsCheck = low + out;

    qs("#stockTotal").textContent = activeProducts.length;
    qs("#stockSafe").textContent = safe;
    qs("#stockLow").textContent = low;
    qs("#stockOut").textContent = out;
    qs("#stockNavCount").textContent = needsCheck;
    qs("#stockCountLabel").textContent = `${rows.length} produk`;
    qs("#stockLowBadge").textContent = needsCheck ? `${needsCheck} perlu dicek` : "Semua stok aman";
    qs("#stockLowBadge").classList.remove("badge-warning", "badge-success");
    qs("#stockLowBadge").classList.add(needsCheck ? "badge-warning" : "badge-success");

    qs("#stockBody").innerHTML = rows.length
      ? rows.map((product) => {
          const status = stockStatus(product);
          return `<tr>
            <td><div class="pos-stock-product">
              <span class="pos-stock-thumb">${productPhoto(product, "") || icon(iconOf(product))}</span>
              <span class="pos-stock-name"><b>${escapeHtml(product.name)}</b><small>${escapeHtml(product.id.toUpperCase())}</small></span>
            </div></td>
            <td>${escapeHtml(product.category)}</td>
            <td class="num">${rupiah(product.price)}</td>
            <td><b>${stockOf(product)}</b></td>
            <td>${badge(status.label, status.tone)}</td>
          </tr>`;
        }).join("")
      : `<tr><td colspan="5"><div class="empty-state" style="padding:24px"><div class="empty-icon">${icon("boxes")}</div><h4>Stok tidak ditemukan</h4><p>Ubah kata kunci atau filter status stok.</p></div></td></tr>`;
  }

  function renderSession() {
    const totals = sessionTotals();
    const activeCount = ui.history.filter((tx) => tx.status !== "void" && tx.status !== "refund").length;
    qs("#sessionTransactionCount").textContent = `${activeCount} transaksi demo`;
    qs("#sessionOpeningCash").textContent = rupiah(ui.openingCash);
    qs("#sessionCashSales").textContent = rupiah(totals.cashSales);
    qs("#sessionQrisSales").textContent = rupiah(totals.qrisSales);
    qs("#sessionExpenses").textContent = rupiah(ui.expenses);
    qs("#sessionExpectedCash").textContent = rupiah(totals.expectedCash);
    qs("#sessionQrisSeparate").textContent = rupiah(totals.qrisSales);
    qs("#sessionRecentBody").innerHTML = ui.history.slice(0, 3).map((tx) => `<tr>
      <td>${escapeHtml(tx.time)}</td>
      <td class="mono row-title">${escapeHtml(tx.id)}</td>
      <td>${paymentBadge(tx.payment)}</td>
      <td>${statusBadge(tx.status)}</td>
      <td>${syncBadge(tx.sync)}</td>
      <td class="num row-title">${rupiah(tx.total)}</td>
    </tr>`).join("") || `<tr><td colspan="6"><div class="empty-state" style="padding:20px"><h4>Belum ada transaksi</h4></div></td></tr>`;
  }

  function setView(view) {
    ui.view = view;
    const wide = view !== "kasir";
    qs(".pos-grid-shell").classList.toggle("is-wide", wide);
    qsa("button[data-pos-view]").forEach((button) => {
      const active = button.dataset.posView === view;
      button.classList.toggle("active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    qsa(".pos-view").forEach((section) => {
      section.hidden = section.dataset.posView !== view;
    });
    if (view === "riwayat") renderHistory();
    if (view === "sesi") renderSession();
    if (view === "stok") renderStock();
    const labels = { kasir: "Kasir", riwayat: "Riwayat", sesi: "Sesi kas", stok: "Stok barang" };
    document.title = view === "kasir" ? "Nuvora Kasir — Prototype" : `${labels[view]} — Nuvora Kasir`;
    const pageBody = qs(`.pos-view[data-pos-view="${view}"] .pos-page-body`);
    if (pageBody) pageBody.scrollTop = 0;
  }

  function setSyncProgress(percent, title, status, detail) {
    const value = Math.max(0, Math.min(100, Math.round(percent)));
    qs("#syncOrb").style.setProperty("--sync-progress", `${value}%`);
    qs("#syncOrb").setAttribute("aria-valuenow", String(value));
    qs("#syncPercent").textContent = `${value}%`;
    qs("#syncTitle").textContent = title;
    qs("#syncStatus").textContent = status;
    qs("#syncDetail").textContent = detail;
  }

  function resetSyncDialog() {
    if (ui.syncTimer !== null) {
      window.clearInterval(ui.syncTimer);
      ui.syncTimer = null;
    }
    ui.syncRunning = false;
    qs("#syncPanel").classList.remove("is-complete");
    qs("#syncCloseBtn").hidden = true;
    setSyncProgress(0, "Menyinkronkan data", "Menyiapkan antrean lokal…", "0 dari 0 transaksi");
  }

  function syncQueue() {
    if (ui.offline) {
      toast("Mode offline aktif. Sinkronisasi tidak dapat berjalan pada simulasi ini.", "warning");
      return;
    }
    const pending = ui.history.filter((tx) => !tx.sync);
    if (!pending.length) {
      toast("Tidak ada transaksi yang menunggu sinkronisasi.", "info");
      return;
    }
    if (ui.syncRunning) {
      openDialog("syncDialog");
      return;
    }

    const total = pending.length;
    let progress = 0;
    ui.syncRunning = true;
    qs("#syncPanel").classList.remove("is-complete");
    qs("#syncCloseBtn").hidden = true;
    setSyncProgress(0, "Menyinkronkan data", "Menyiapkan antrean lokal…", `0 dari ${total} transaksi`);
    openDialog("syncDialog");

    ui.syncTimer = window.setInterval(() => {
      progress = Math.min(100, progress + 7 + Math.floor(Math.random() * 8));
      const processed = Math.min(total, Math.ceil((progress / 100) * total));
      let status = "Sync berjalan · menyiapkan data transaksi…";
      if (progress >= 20 && progress < 50) status = "Sync berjalan · mengunggah transaksi…";
      else if (progress >= 50 && progress < 78) status = "Sync berjalan · mencocokkan pembayaran…";
      else if (progress >= 78 && progress < 100) status = "Sync berjalan · menyimpan konfirmasi…";

      if (progress >= 100) {
        window.clearInterval(ui.syncTimer);
        ui.syncTimer = null;
        ui.syncRunning = false;
        pending.forEach((tx) => { tx.sync = true; });
        store.saveTransactions();
        qs("#syncPanel").classList.add("is-complete");
        setSyncProgress(100, "Sync selesai", "Semua transaksi demo sudah tersinkron.", `${total} dari ${total} transaksi`);
        qs("#syncCloseBtn").hidden = false;
        renderHistory();
        renderConnection();
        renderSession();
        return;
      }

      setSyncProgress(progress, "Menyinkronkan data", status, `${processed} dari ${total} transaksi`);
    }, 170);
  }

  function setOffline(value, announce) {
    ui.offline = value;
    renderConnection();
    if (qs("#paymentDialog").open) renderPayment();
    if (announce !== false) {
      toast(
        ui.offline
          ? "Mode offline disimulasikan. Transaksi baru akan menunggu sinkronisasi."
          : "Mode online disimulasikan. Antrean tetap perlu disinkronkan secara manual.",
        ui.offline ? "warning" : "info"
      );
    }
  }

  function openPayment() {
    if (!ui.cart.length) return;
    if (!loyaltySettings().active) ui.redeemPoints = 0;
    ui.paymentMethod = null;
    ui.cashReceived = 0;
    ui.qrisVerified = false;
    ui.splitCash = 0;
    ui.splitQris = 0;
    ui.splitCashReceived = 0;
    ui.splitQrisVerified = false;
    qs("#cashReceived").value = "";
    qs("#qrisVerified").checked = false;
    qs("#splitCash").value = "";
    qs("#splitQris").value = "";
    qs("#splitCashReceived").value = "";
    qs("#splitQrisVerified").checked = false;
    renderPayment();
    openDialog("paymentDialog");
  }

  function renderMemberPicker() {
    const query = qs("#memberSearchPos").value.trim().toLowerCase();
    const loyalty = loyaltySettings();
    const activeMembers = store.getMembers().filter((member) => member.active);
    const rows = activeMembers.filter((member) => !query || `${member.name} ${member.phone}`.toLowerCase().includes(query));
    qs("#memberDialogSub").textContent = loyalty.active
      ? `${activeMembers.length} member aktif · ${pointsText(loyalty.minRedeem)} = ${rupiah(loyalty.minRedeem * loyalty.pointValue)}`
      : "Program loyalitas sedang nonaktif di Admin.";
    qs("#memberList").innerHTML = rows.length
      ? rows.map((member) => `<button class="member-list-item${member.id === ui.memberId ? " is-selected" : ""}" type="button" data-pick-member="${escapeHtml(member.id)}">
          <span class="avatar">${escapeHtml(initials(member.name))}</span>
          <span class="member-list-main"><b>${escapeHtml(member.name)}</b><span>${escapeHtml(member.phone)}</span></span>
          <span class="member-list-points">${pointsText(member.points)}</span>
          ${member.id === ui.memberId ? badge("Dipilih", "success") : ""}
        </button>`).join("")
      : `<div class="empty-state" style="padding:24px"><div class="empty-icon">${icon("users")}</div><h4>Member tidak ditemukan</h4><p>Ubah kata kunci atau tambahkan member dari Admin Panel.</p></div>`;
  }

  function openMemberPicker() {
    qs("#memberSearchPos").value = "";
    renderMemberPicker();
    openDialog("memberDialog");
  }

  function selectMember(id) {
    const member = store.getMembers().find((item) => item.id === id && item.active);
    if (!member) return;
    ui.memberId = member.id;
    ui.redeemPoints = 0;
    closeDialog("memberDialog");
    renderPayment();
    renderCart();
    toast(`${member.name} dipilih. ${pointsText(member.points)} tersedia.`, "success");
  }

  function clearMember() {
    ui.memberId = null;
    ui.redeemPoints = 0;
    renderPayment();
    renderCart();
    toast("Member dilepas dari transaksi ini. Poin tidak berubah.", "info");
  }

  function updateMemberDisplays() {
    const member = selectedMember();
    const discount = memberDiscount();
    const total = Math.max(0, cartTotal() - discount);
    qs("#paymentTotal").textContent = rupiah(total);
    qs("#paymentMemberDiscountRow").hidden = discount <= 0;
    qs("#paymentMemberDiscount").textContent = `−${rupiah(discount)}`;
    qs("#memberDiscountValue").textContent = rupiah(discount);
    qs("#memberDiscountRow").hidden = discount <= 0;
    qs("#memberDiscountTicket").textContent = `−${rupiah(discount)}`;
    qs("#totalValue").textContent = rupiah(total);
    if (member) {
      const remaining = Math.max(0, (Number(member.points) || 0) - effectiveRedeemPoints());
      qs("#memberPayPoints").textContent = `${pointsText(remaining)} tersedia · potongan ${rupiah(discount)}`;
    }
  }

  function renderMemberPayment() {
    const loyalty = loyaltySettings();
    const member = selectedMember();
    qs("#chooseMemberBtn").disabled = !loyalty.active;
    qs("#memberPayHint").textContent = !loyalty.active
      ? "Program loyalitas nonaktif. Aktifkan di Admin Panel untuk memakai poin."
      : member
        ? "Poin dipakai otomatis setelah transaksi tersimpan."
        : "Pilih member untuk mengumpulkan atau menukar poin.";
    qs("#memberPayDetails").hidden = !member || !loyalty.active;
    if (!member || !loyalty.active) return;
    const input = qs("#redeemPoints");
    const max = maxRedeemPoints();
    ui.redeemPoints = effectiveRedeemPoints();
    input.max = String(max);
    input.step = "1";
    input.placeholder = `${loyalty.minRedeem} poin = ${rupiah(loyalty.minRedeem * loyalty.pointValue)}`;
    input.value = ui.redeemPoints ? String(ui.redeemPoints) : "";
    input.disabled = max < loyalty.minRedeem;
    qs("#memberPayName").textContent = member.name;
    qs("#memberPayPoints").textContent = `${pointsText(member.points)} tersedia`;
  }

  function renderPayment() {
    const subtotal = cartTotal();
    const discount = memberDiscount();
    const total = Math.max(0, subtotal - discount);
    qs("#paymentDialogSub").textContent = `${ui.orderType} · ${cartQuantity()} item · ${ui.offline ? "offline" : "online"}`;
    qs("#paymentSummary").innerHTML = ui.cart.map((line) => {
      const product = productById(line.productId);
      if (!product) return "";
      return `<div class="payment-bill-item"><span>${line.qty}× ${escapeHtml(product.name)}</span><span>${rupiah(product.price * line.qty)}</span></div>`;
    }).join("");
    qs("#paymentMemberDiscountRow").hidden = discount <= 0;
    qs("#paymentMemberDiscount").textContent = `−${rupiah(discount)}`;
    qs("#paymentTotal").textContent = rupiah(total);
    renderMemberPayment();
    updateMemberDisplays();
    if (total === 0 && discount > 0) qs("#memberPayHint").textContent = "Poin menutup seluruh total. Konfirmasi untuk menyelesaikan.";
    qsa("[data-payment-method]").forEach((button) => {
      const active = button.dataset.paymentMethod === ui.paymentMethod;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    qs("#cashPaymentFields").hidden = ui.paymentMethod !== "Tunai";
    qs("#qrisPaymentFields").hidden = ui.paymentMethod !== "QRIS manual";
    qs("#splitPaymentFields").hidden = ui.paymentMethod !== "Split";
    qs("#paymentOfflineNotice").hidden = !ui.offline;
    qs("#cashReceived").value = ui.paymentMethod === "Tunai" && ui.cashReceived ? String(ui.cashReceived) : "";
    qs("#qrisVerified").checked = ui.qrisVerified;
    qs("#splitCash").value = ui.paymentMethod === "Split" && ui.splitCash ? String(ui.splitCash) : "";
    qs("#splitQris").value = ui.paymentMethod === "Split" && ui.splitQris ? String(ui.splitQris) : "";
    qs("#splitCashReceived").value = ui.paymentMethod === "Split" && ui.splitCashReceived ? String(ui.splitCashReceived) : "";
    qs("#splitQrisVerified").checked = ui.splitQrisVerified;
    updateCashChange();
    updateSplitChange();
    updateConfirmState();
  }

  function updateCashChange() {
    const total = payableTotal();
    const received = Number(ui.cashReceived) || 0;
    const diff = received - total;
    const wrap = qs("#cashChangeWrap");
    qs("#cashChange").textContent = rupiah(diff);
    wrap.classList.toggle("is-short", diff < 0);
  }

  function updateSplitChange() {
    const split = splitTotals();
    qs("#splitRounding").textContent = `${split.rounding > 0 ? "+" : ""}${rupiah(split.rounding)}`;
    qs("#splitRoundingWrap").classList.toggle("is-short", split.rounding < 0);
    qs("#splitChange").textContent = rupiah(split.change);
    qs("#splitChangeWrap").classList.toggle("is-short", split.change < 0);
    const diffText = split.diff === 0
      ? "Pas"
      : `${split.diff > 0 ? "Kurang" : "Lebih"} ${rupiah(Math.abs(split.diff))}`;
    qs("#splitDiff").textContent = diffText;
    qs("#splitDiffWrap").classList.toggle("is-short", split.diff !== 0);
  }

  function updateConfirmState() {
    const total = payableTotal();
    const split = splitTotals();
    const valid = total === 0
      ? memberDiscount() > 0
      : total > 0 && (
        (ui.paymentMethod === "Tunai" && Number(ui.cashReceived) >= total) ||
        (ui.paymentMethod === "QRIS manual" && ui.qrisVerified) ||
        (ui.paymentMethod === "Split" && split.cash > 0 && split.qris > 0 && split.diff === 0 && split.received >= split.cash && ui.splitQrisVerified)
      );
    qs("#confirmPayment").disabled = !valid;
  }

  function choosePaymentMethod(method) {
    if (payableTotal() === 0) return;
    ui.paymentMethod = method;
    if (method === "Tunai" && !ui.cashReceived) ui.cashReceived = payableTotal();
    if (method === "Split") {
      const total = payableTotal();
      ui.splitCash = roundCash(total / 2);
      ui.splitQris = total - ui.splitCash;
      ui.splitCashReceived = ui.splitCash;
      ui.splitQrisVerified = false;
    }
    renderPayment();
  }

  function applyMemberPoints(tx, member, earned, redeemed, discount) {
    const current = store.getMembers().find((item) => item.id === member.id);
    if (!current) return;
    const before = Number(current.points) || 0;
    const after = Math.max(0, before - redeemed + earned);
    current.history = Array.isArray(current.history) ? current.history : [];
    const at = `${tx.date} · ${tx.time}`;
    if (earned > 0) {
      current.history.unshift({ at, type: "earn", points: earned, note: `Belanja ${rupiah(tx.total)}`, txId: tx.id, actor: tx.cashier });
    }
    if (redeemed > 0) {
      current.history.unshift({ at, type: "redeem", points: -redeemed, note: `Potongan ${rupiah(discount)}`, txId: tx.id, actor: tx.cashier });
    }
    current.points = after;
    tx.member = { id: current.id, name: current.name, phone: current.phone, earned, redeemed, discount, pointsBefore: before, pointsAfter: after };
    store.saveMembers();
  }

  function reverseMemberPoints(tx) {
    if (!tx.member || tx.member.voided) return;
    const current = store.getMembers().find((item) => item.id === tx.member.id);
    if (!current) return;
    const delta = (Number(tx.member.redeemed) || 0) - (Number(tx.member.earned) || 0);
    const before = Number(current.points) || 0;
    const after = Math.max(0, before + delta);
    current.history = Array.isArray(current.history) ? current.history : [];
    if (delta !== 0) {
      current.history.unshift({
        at: `${dateShort(new Date())} · ${nowTime()}`,
        type: "void",
        points: delta,
        note: `Void ${tx.id}`,
        txId: tx.id,
        actor: currentCashier().name,
      });
      current.points = after;
    }
    tx.member.voided = true;
    tx.member.pointsAfterVoid = current.points;
    store.saveMembers();
  }

  function finalizePayment() {
    const subtotal = cartTotal();
    const member = selectedMember();
    const loyalty = loyaltySettings();
    const redeemed = member && loyalty.active ? effectiveRedeemPoints() : 0;
    const discount = redeemed * loyalty.pointValue;
    const total = Math.max(0, subtotal - discount);
    const fullyRedeemed = total === 0;
    if ((!total && !discount) || (!fullyRedeemed && !ui.paymentMethod)) return;
    const cash = !fullyRedeemed && ui.paymentMethod === "Tunai";
    const split = splitTotals();
    if (!fullyRedeemed && cash && Number(ui.cashReceived) < total) {
      toast("Uang diterima kurang dari total.", "warning");
      return;
    }
    if (!fullyRedeemed && ui.paymentMethod === "QRIS manual" && !ui.qrisVerified) {
      toast("Centang konfirmasi pemeriksaan bukti QRIS terlebih dahulu.", "warning");
      return;
    }
    if (!fullyRedeemed && ui.paymentMethod === "Split") {
      if (!(split.cash > 0 && split.qris > 0)) {
        toast("Split pembayaran membutuhkan nominal tunai dan QRIS.", "warning");
        return;
      }
      if (split.diff !== 0) {
        toast(`Nominal tunai dan QRIS harus sama dengan total. Selisih ${rupiah(Math.abs(split.diff))}.`, "warning");
        return;
      }
      if (split.received < split.cash) {
        toast("Uang tunai diterima kurang dari nominal tunai.", "warning");
        return;
      }
      if (!ui.splitQrisVerified) {
        toast("Centang konfirmasi pemeriksaan bukti QRIS untuk bagian QRIS.", "warning");
        return;
      }
    }
    const note = qs("#orderNote").value.trim();
    const orderNumber = String(ui.nextOrderNumber).padStart(4, "0");
    const isSplit = !fullyRedeemed && ui.paymentMethod === "Split";
    const earned = member && loyalty.active ? Math.floor(total / loyalty.earnPerPoint) : 0;
    const transaction = {
      id: `#TRX-${orderNumber}`,
      date: dateShort(new Date()),
      time: nowTime(),
      cashier: currentCashier().name,
      type: ui.orderType,
      payment: fullyRedeemed ? "Poin" : isSplit ? "Tunai + QRIS" : ui.paymentMethod,
      subtotal,
      total,
      sync: !ui.offline,
      status: "lunas",
      cashGiven: cash ? Number(ui.cashReceived) : isSplit ? split.received : null,
      change: cash ? Number(ui.cashReceived) - total : isSplit ? split.change : null,
      cashAmount: cash ? total : isSplit ? split.cash : null,
      qrisAmount: isSplit ? split.qris : null,
      rounding: isSplit ? split.rounding : 0,
      split: isSplit ? { cash: split.cash, qris: split.qris, received: split.received, rounding: split.rounding } : null,
      qrisRef: !fullyRedeemed && (ui.paymentMethod === "QRIS manual" || isSplit) ? `QRIS-30A-${120 + ui.nextOrderNumber}` : null,
      note,
      items: ui.cart.map((line) => {
        const product = productById(line.productId);
        return { productId: product.id, name: product.name, qty: line.qty, price: product.price };
      }),
    };
    ui.history.unshift(transaction);
    if (member && loyalty.active) applyMemberPoints(transaction, member, earned, redeemed, discount);
    applyStockForTransaction(transaction);
    store.saveTransactions();
    ui.nextOrderNumber += 1;
    ui.cart = [];
    ui.paymentMethod = null;
    ui.cashReceived = 0;
    ui.qrisVerified = false;
    ui.splitCash = 0;
    ui.splitQris = 0;
    ui.splitCashReceived = 0;
    ui.splitQrisVerified = false;
    ui.memberId = null;
    ui.redeemPoints = 0;
    qs("#memberPayDetails").hidden = true;
    qs("#memberDiscountValue").textContent = rupiah(0);
    qs("#orderNote").value = "";
    closeDialog("paymentDialog");
    renderCart();
    renderProducts();
    renderStock();
    renderHistory();
    renderConnection();
    renderSession();
    showReceipt(transaction, false);
    toast(
      ui.offline
        ? "Transaksi demo tersimpan lokal dan menunggu sinkronisasi."
        : "Transaksi demo tercatat dan ditandai tersinkron.",
      ui.offline ? "warning" : "success"
    );
    const negative = (transaction.stockEffects || []).filter((effect) => effect.after < 0);
    if (negative.length) {
      toast(`Stok minus: ${negative.map((effect) => effect.name).join(", ")}. Transaksi tetap tercatat sesuai aturan demo.`, "warning");
    }
  }

  function receiptHtml(tx) {
    const settings = store.getSettings();
    const items = tx.items.map((item) => `<tr><td>${escapeHtml(item.name)}<small>${item.qty} × ${rupiah(item.price)}</small></td><td>${rupiah(item.qty * item.price)}</td></tr>`).join("");
    let paymentDetails = `<div class="receipt-foot-line"><span>Referensi QRIS</span><span>${escapeHtml(tx.qrisRef || "—")}</span></div><div class="receipt-foot-line"><span>Verifikasi</span><span>Manual oleh kasir</span></div>`;
    if (tx.payment === "Tunai") {
      paymentDetails = `<div class="receipt-foot-line"><span>Dibayar</span><span>${rupiah(tx.cashGiven)}</span></div><div class="receipt-foot-line"><span>Kembali</span><span>${rupiah(tx.change)}</span></div>`;
    } else if (tx.payment === "Tunai + QRIS") {
      paymentDetails = `<div class="receipt-foot-line"><span>Tunai</span><span>${rupiah(tx.cashAmount)}</span></div>
        <div class="receipt-foot-line"><span>QRIS</span><span>${rupiah(tx.qrisAmount)}</span></div>
        <div class="receipt-foot-line"><span>Pembulatan tunai</span><span>${tx.rounding > 0 ? "+" : ""}${rupiah(tx.rounding || 0)}</span></div>
        <div class="receipt-foot-line"><span>Dibayar tunai</span><span>${rupiah(tx.cashGiven)}</span></div>
        <div class="receipt-foot-line"><span>Kembali</span><span>${rupiah(tx.change)}</span></div>
        <div class="receipt-foot-line"><span>Referensi QRIS</span><span>${escapeHtml(tx.qrisRef || "—")}</span></div>`;
    } else if (tx.payment === "Poin") {
      paymentDetails = `<div class="receipt-foot-line"><span>Ditutup dengan poin</span><span>${pointsText(tx.member ? tx.member.redeemed : 0)}</span></div>`;
    }
    const memberPaymentLines = tx.member
      ? `<div class="receipt-foot-line"><span>Member</span><span>${escapeHtml(tx.member.name)}</span></div>
        <div class="receipt-foot-line"><span>Poin ditukar</span><span>${tx.member.redeemed ? `−${pointsText(tx.member.redeemed)}` : "—"}</span></div>
        <div class="receipt-foot-line"><span>Poin didapat</span><span>${tx.member.earned ? `+${pointsText(tx.member.earned)}` : "—"}</span></div>
        <div class="receipt-foot-line"><span>Saldo poin</span><span>${pointsText(tx.member.pointsAfter)}</span></div>`
      : "";
    return `<div class="receipt-paper">
      <div class="receipt-brand"><span class="logo-badge"><img src="assets/nuvora-logo.jpg" alt="Logo Nuvora"></span><div><b>${escapeHtml(settings.outletName || "Nuvora POS")}</b><span>${escapeHtml(settings.outletAddress || "Outlet Melati")}</span></div></div>
      <div class="receipt-meta">
        <div><span>No. order</span><b>${escapeHtml(tx.id)}</b></div>
        <div><span>Waktu</span><span>${escapeHtml(tx.date)} · ${escapeHtml(tx.time)}</span></div>
        <div><span>Kasir</span><span>${escapeHtml(tx.cashier)}</span></div>
        <div><span>Jenis</span><span>${escapeHtml(tx.type)}</span></div>
      </div>
      <table class="receipt-items"><thead><tr><th>Item</th><th>Total</th></tr></thead><tbody>${items}</tbody></table>
      ${tx.member && tx.member.discount ? `<div class="receipt-foot-line"><span>Subtotal</span><span>${rupiah(tx.subtotal || tx.total + tx.member.discount)}</span></div><div class="receipt-foot-line"><span>Poin member</span><span>−${rupiah(tx.member.discount)}</span></div>` : ""}
      <div class="receipt-total"><span>Total</span><b>${rupiah(tx.total)}</b></div>
      <div class="receipt-payment">
        <div class="receipt-foot-line"><span>Pembayaran</span><span>${escapeHtml(tx.payment)}</span></div>
        ${paymentDetails}
        ${memberPaymentLines}
        <div class="receipt-foot-line"><span>Status pesanan</span><span>${statusLabel(tx.status)}</span></div>
        <div class="receipt-foot-line"><span>Status data</span><span>${tx.sync ? "Tersinkron (demo)" : "Menunggu sync"}</span></div>
        ${tx.note ? `<div class="receipt-foot-line"><span>Catatan</span><span>${escapeHtml(tx.note)}</span></div>` : ""}
        ${tx.status === "void" ? `<div class="receipt-foot-line"><span>Alasan batal</span><span>${escapeHtml(tx.voidReason || "—")}</span></div><div class="receipt-foot-line"><span>Dibatalkan</span><span>${escapeHtml(tx.voidAt || "—")} · ${escapeHtml(tx.voidBy || "Kasir")}</span></div>${tx.voidNote ? `<div class="receipt-foot-line"><span>Catatan batal</span><span>${escapeHtml(tx.voidNote)}</span></div>` : ""}` : ""}
      </div>
      <div class="receipt-thanks">Terima kasih telah berkunjung.<br>Struk ini adalah simulasi prototype, bukan bukti pembayaran nyata.</div>
    </div>
    <div class="notice notice-warning receipt-demo-note">${icon("info")}<span>Struk demo. Tidak ada printer, pembayaran, atau sinkronisasi nyata yang dijalankan.</span></div>`;
  }

  function printReceipt() {
    const tx = ui.currentReceipt;
    if (!tx) return;
    const width = store.getSettings().receiptWidth === "80" ? "80mm" : "58mm";
    const base = window.location.href;
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.style.cssText = "position:fixed;width:0;height:0;border:0;visibility:hidden";
    document.body.appendChild(frame);
    const doc = frame.contentDocument;
    doc.open();
    doc.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><base href="${escapeHtml(base)}"><title>${escapeHtml(tx.id)}</title><link rel="stylesheet" href="assets/base.css"><link rel="stylesheet" href="assets/pos.css"><style>@page{size:${width} auto;margin:4mm}body{background:#fff;padding:0;margin:0}.receipt-panel .modal-body{padding:0}.receipt-demo-note{display:none!important}.receipt-paper{width:${width};max-width:100%;box-shadow:none;border:0;border-radius:0}</style></head><body>${receiptHtml(tx)}</body></html>`);
    doc.close();
    let closed = false;
    const finish = () => {
      if (closed) return;
      closed = true;
      frame.remove();
    };
    frame.contentWindow.addEventListener("afterprint", finish, { once: true });
    window.setTimeout(finish, 60000);
    frame.contentWindow.focus();
    frame.contentWindow.print();
    toast("Dialog cetak dibuka. Pilih printer atau Simpan sebagai PDF.", "info");
  }

  function showReceipt(tx, fromHistory) {
    ui.currentReceipt = tx;
    ui.receiptFromHistory = Boolean(fromHistory);
    qs("#receiptDialogTitle").textContent = fromHistory ? "Detail transaksi" : "Struk transaksi";
    qs("#receiptDialogSub").textContent = `${tx.id} · ${statusLabel(tx.status)} · ${tx.sync ? "Tersinkron (demo)" : "Menunggu sinkronisasi"}`;
    qs("#receiptBody").innerHTML = receiptHtml(tx);
    qs("#doneReceiptBtn").textContent = fromHistory ? "Tutup" : "Transaksi baru";
    const voidButton = qs("#voidReceiptBtn");
    const canVoid = tx.status === "lunas";
    voidButton.disabled = !canVoid;
    voidButton.textContent = tx.status === "void" ? "Sudah dibatalkan" : tx.status === "refund" ? "Sudah refund" : "Batalkan transaksi";
    voidButton.title = canVoid ? "Batalkan transaksi demo" : "Transaksi ini sudah tidak aktif";
    openDialog("receiptDialog");
  }

  function openVoidDialog() {
    const tx = ui.currentReceipt;
    if (!tx || tx.status !== "lunas") {
      toast("Transaksi ini sudah tidak dapat dibatalkan.", "warning");
      return;
    }
    qs("#voidDialogSub").textContent = `${tx.id} · ${rupiah(tx.total)} · ${tx.payment}`;
    qs("#voidSummary").innerHTML = `
      <div class="settings-row"><span>No. order</span><b>${escapeHtml(tx.id)}</b></div>
      <div class="settings-row"><span>Total dibayar</span><b>${rupiah(tx.total)}</b></div>
      <div class="settings-row"><span>Status saat ini</span><b>${statusLabel(tx.status)}</b></div>`;
    qs("#voidReason").value = "Pelanggan membatalkan";
    qs("#voidNote").value = "";
    openDialog("voidDialog");
  }

  function confirmVoid() {
    const tx = ui.currentReceipt;
    if (!tx || tx.status !== "lunas") {
      closeDialog("voidDialog");
      toast("Transaksi ini sudah tidak dapat dibatalkan.", "warning");
      return;
    }
    const reason = qs("#voidReason").value;
    const note = qs("#voidNote").value.trim();
    if (reason === "Lainnya" && !note) {
      qs("#voidNote").focus();
      toast("Catatan wajib diisi untuk alasan Lainnya.", "warning");
      return;
    }
    tx.status = "void";
    tx.sync = false;
    tx.voidReason = reason;
    tx.voidNote = note;
    tx.voidAt = `${dateShort(new Date())} · ${nowTime()}`;
    tx.voidBy = currentCashier().name;
    reverseMemberPoints(tx);
    restoreStockForTransaction(tx);
    store.saveTransactions();
    closeDialog("voidDialog");
    renderProducts();
    renderStock();
    renderHistory();
    renderSession();
    renderConnection();
    showReceipt(tx, ui.receiptFromHistory);
    toast(`${tx.id} dibatalkan pada demo. Stok demo dikembalikan dan transaksi masuk antrean sync.`, "success");
  }

  function resetDemo() {
    if (ui.syncTimer !== null) {
      window.clearInterval(ui.syncTimer);
      ui.syncTimer = null;
    }
    ui.syncRunning = false;
    ui.history.splice(0, ui.history.length, ...clone(seedHistory));
    store.saveTransactions();
    ui.nextOrderNumber = 87;
    ui.cart = [];
    ui.orderType = "Dine-in";
    ui.paymentMethod = null;
    ui.cashReceived = 0;
    ui.qrisVerified = false;
    ui.splitCash = 0;
    ui.splitQris = 0;
    ui.splitCashReceived = 0;
    ui.splitQrisVerified = false;
    ui.memberId = null;
    ui.redeemPoints = 0;
    ui.offline = false;
    store.getHeldOrders().splice(0);
    store.saveHeldOrders();
    qs("#posSearch").value = "";
    qs("#orderNote").value = "";
    qs("#historyFilter").value = "all";
    qs("#stockSearch").value = "";
    qs("#stockFilter").value = "all";
    ui.category = "all";
    qsa("[data-category]").forEach((button) => {
      const active = button.dataset.category === "all";
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    qsa("[data-order-type]").forEach((button) => {
      const active = button.dataset.orderType === "Dine-in";
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    renderProducts();
    renderCart();
    renderHeldOrders();
    renderHistory();
    renderStock();
    renderConnection();
    renderSession();
    setView("kasir");
    closeDialog("demoDialog");
    toast("Demo kasir dikembalikan ke kondisi awal Gate 1.", "info");
  }

  function wire() {
    qsa("button[data-pos-view]").forEach((button) => {
      button.addEventListener("click", () => setView(button.dataset.posView));
    });
    qs("#stockSearch").addEventListener("input", renderStock);
    qs("#stockFilter").addEventListener("change", renderStock);
    qsa("[data-category]").forEach((button) => {
      button.addEventListener("click", () => {
        ui.category = button.dataset.category;
        qsa("[data-category]").forEach((chip) => {
          const active = chip.dataset.category === ui.category;
          chip.classList.toggle("is-active", active);
          chip.setAttribute("aria-pressed", String(active));
        });
        renderProducts();
        if (ui.view !== "kasir") setView("kasir");
      });
    });
    qs("#posSearch").addEventListener("input", renderProducts);
    qs("#productGrid").addEventListener("click", (event) => {
      const product = event.target.closest("[data-product-id]");
      if (product) addToCart(product.dataset.productId);
    });
    qs("#cartItems").addEventListener("click", (event) => {
      const inc = event.target.closest("[data-cart-inc]");
      if (inc) return changeQuantity(inc.dataset.cartInc, 1);
      const dec = event.target.closest("[data-cart-dec]");
      if (dec) return changeQuantity(dec.dataset.cartDec, -1);
      const remove = event.target.closest("[data-cart-remove]");
      if (remove) return removeFromCart(remove.dataset.cartRemove);
    });
    qsa("[data-order-type]").forEach((button) => {
      button.addEventListener("click", () => {
        ui.orderType = button.dataset.orderType;
        qsa("[data-order-type]").forEach((item) => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });
      });
    });
    qs("#clearCartBtn").addEventListener("click", () => openDialog("clearCartDialog"));
    qs("#confirmClearCart").addEventListener("click", clearCart);
    qs("#holdOrderBtn").addEventListener("click", saveHeldOrder);
    qs("#openHoldBtn").addEventListener("click", openHoldDialog);
    qs("#payButton").addEventListener("click", openPayment);
    qs("#chooseMemberBtn").addEventListener("click", openMemberPicker);
    qs("#clearMemberBtn").addEventListener("click", clearMember);
    qs("#memberSearchPos").addEventListener("input", renderMemberPicker);
    qs("#memberList").addEventListener("click", (event) => {
      const pick = event.target.closest("[data-pick-member]");
      if (pick) selectMember(pick.dataset.pickMember);
    });
    qs("#redeemPoints").addEventListener("input", (event) => {
      ui.redeemPoints = Math.max(0, Math.floor(Number(event.target.value) || 0));
      updateMemberDisplays();
      updateCashChange();
      updateSplitChange();
      updateConfirmState();
    });
    qs("#redeemPoints").addEventListener("change", (event) => {
      ui.redeemPoints = effectiveRedeemPoints();
      event.target.value = ui.redeemPoints ? String(ui.redeemPoints) : "";
      renderPayment();
    });
    qs("#loadSampleFromEmpty").addEventListener("click", loadSampleOrder);
    qs("#loadSampleBtn").addEventListener("click", () => {
      loadSampleOrder();
      closeDialog("demoDialog");
    });
    qsa("[data-payment-method]").forEach((button) => {
      button.addEventListener("click", () => choosePaymentMethod(button.dataset.paymentMethod));
    });
    qs("#cashReceived").addEventListener("input", (event) => {
      ui.cashReceived = Number(event.target.value) || 0;
      updateCashChange();
      updateConfirmState();
    });
    qsa("[data-cash-amount]").forEach((button) => {
      button.addEventListener("click", () => {
        ui.cashReceived = button.dataset.cashAmount === "exact" ? payableTotal() : Number(button.dataset.cashAmount);
        qs("#cashReceived").value = String(ui.cashReceived);
        updateCashChange();
        updateConfirmState();
      });
    });
    qs("#qrisVerified").addEventListener("change", (event) => {
      ui.qrisVerified = event.target.checked;
      updateConfirmState();
    });
    qs("#splitCash").addEventListener("input", (event) => {
      ui.splitCash = Number(event.target.value) || 0;
      updateSplitChange();
      updateConfirmState();
    });
    qs("#splitQris").addEventListener("input", (event) => {
      ui.splitQris = Number(event.target.value) || 0;
      updateSplitChange();
      updateConfirmState();
    });
    qs("#splitCashReceived").addEventListener("input", (event) => {
      ui.splitCashReceived = Number(event.target.value) || 0;
      updateSplitChange();
      updateConfirmState();
    });
    qs("#splitQrisVerified").addEventListener("change", (event) => {
      ui.splitQrisVerified = event.target.checked;
      updateConfirmState();
    });
    qs("#confirmPayment").addEventListener("click", finalizePayment);
    qs("#historyFilter").addEventListener("change", renderHistory);
    qs("#historyBody").addEventListener("click", (event) => {
      const row = event.target.closest("[data-history-id]");
      if (!row) return;
      const tx = ui.history.find((item) => item.id === row.dataset.historyId);
      if (!tx) return;
      showReceipt(tx, true);
    });
    qs("#printReceiptBtn").addEventListener("click", printReceipt);
    qs("#voidReceiptBtn").addEventListener("click", openVoidDialog);
    qs("#confirmVoidBtn").addEventListener("click", confirmVoid);
    qs("#heldOrderList").addEventListener("click", (event) => {
      const resume = event.target.closest("[data-resume-hold]");
      if (resume) return resumeHeldOrder(resume.dataset.resumeHold);
      const remove = event.target.closest("[data-delete-hold]");
      if (remove) return deleteHeldOrder(remove.dataset.deleteHold);
    });
    qs("#doneReceiptBtn").addEventListener("click", () => {
      closeDialog("receiptDialog");
      if (ui.currentReceipt && !ui.cart.length && ui.view === "kasir") qs("#posSearch").focus();
    });
    qs("#cashierSelect").addEventListener("change", (event) => {
      if (!store.setCashier(event.target.value)) {
        renderCashier();
        return;
      }
      renderCashier();
      renderSession();
      toast(`Kasir aktif diganti ke ${currentCashier().name}. Transaksi berikutnya memakai nama kasir ini.`, "info");
    });
    qs("#connectionToggle").addEventListener("click", () => setOffline(!ui.offline));
    qs("#demoOfflineToggle").addEventListener("click", () => setOffline(!ui.offline));
    qs("#syncQueueBtn").addEventListener("click", syncQueue);
    qs("#demoSyncBtn").addEventListener("click", syncQueue);
    qs("#sessionSyncBtn").addEventListener("click", syncQueue);
    const syncDialog = qs("#syncDialog");
    syncDialog.addEventListener("close", resetSyncDialog);
    syncDialog.addEventListener("cancel", (event) => {
      if (ui.syncRunning) event.preventDefault();
    });
    syncDialog.addEventListener("click", (event) => {
      if (ui.syncRunning && event.target === syncDialog) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
    qs("#resetDemoBtn").addEventListener("click", () => {
      if (window.confirm("Reset seluruh riwayat, antrean, sesi, dan draft pesanan demo?")) resetDemo();
    });
    document.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setView("kasir");
        qs("#posSearch").focus();
        qs("#posSearch").select();
      }
      if (event.key === "F2" && !qs("#paymentDialog").open && ui.cart.length) {
        event.preventDefault();
        openPayment();
      }
    });
  }

  function updateClock() {
    const now = new Date();
    qs("#posDate").textContent = formatDateLong(now);
    qs("#posClock").textContent = nowTime();
  }

  function init() {
    updateClock();
    window.setInterval(updateClock, 15000);
    renderCashier();
    renderProducts();
    renderCart();
    renderHistory();
    renderStock();
    renderConnection();
    renderSession();
    setView("kasir");
    wire();
    store.subscribe(() => {
      renderProducts();
      renderStock();
      renderCashier();
      renderCart();
      if (qs("#paymentDialog").open) renderPayment();
      if (qs("#memberDialog").open) renderMemberPicker();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
