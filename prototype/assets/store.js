(function () {
  "use strict";

  const KEY = "nuvora-demo-store-v1";
  const VERSION = 1;

  const SEED = {
    version: VERSION,
    settings: {
      outletName: "Outlet Melati",
      outletPhone: "0274 000 000",
      outletAddress: "Jl. Melati No. 12, Yogyakarta (alamat demo)",
      cashierId: "e01",
      receiptWidth: "58",
      openingCash: 300000,
      expenses: 45000,
      loyalty: {
        active: true,
        earnPerPoint: 1000,
        pointValue: 100,
        minRedeem: 100,
      },
    },
    employees: [
      { id: "e01", name: "Dina Pratama", role: "Kasir", outlet: "Outlet Melati", joined: "12 Mar 2025", active: true },
      { id: "e02", name: "Raka Saputra", role: "Kasir", outlet: "Outlet Melati", joined: "4 Jun 2025", active: true },
      { id: "e03", name: "Nadia Aulia", role: "Dapur", outlet: "Outlet Melati", joined: "18 Agu 2024", active: true },
      { id: "e04", name: "Bima Kurnia", role: "Dapur", outlet: "Outlet Melati", joined: "2 Feb 2026", active: true },
      { id: "e05", name: "Sari Wulandari", role: "Pemimpin tim", outlet: "Outlet Melati", joined: "9 Jan 2024", active: true },
      { id: "e06", name: "Yoga Pratama", role: "Kasir", outlet: "Outlet Melati", joined: "14 Sep 2025", active: false },
    ],
    products: [
      { id: "p01", name: "Paket Nuvora", category: "Paket", price: 18000, hpp: 12000, recipe: true, active: true, stock: 8, icon: "layers" },
      { id: "p02", name: "Beef Burger", category: "Makanan", price: 25000, hpp: 15000, recipe: true, active: true, stock: 2, icon: "utensils" },
      { id: "p03", name: "Chicken Burger", category: "Makanan", price: 22000, hpp: 13000, recipe: true, active: true, stock: 6, icon: "utensils" },
      { id: "p04", name: "Es Teh", category: "Minuman", price: 6000, hpp: 2000, recipe: true, active: true, stock: 20, icon: "cup" },
      { id: "p05", name: "Es Jeruk", category: "Minuman", price: 8000, hpp: 3000, recipe: false, active: true, stock: 10, icon: "cup" },
      { id: "p06", name: "Kopi Susu", category: "Minuman", price: 15000, hpp: 6000, recipe: false, active: true, stock: 7, icon: "coffee" },
      { id: "p07", name: "Kentang Goreng", category: "Tambahan", price: 12000, hpp: 5000, recipe: true, active: true, stock: 3, icon: "fries" },
      { id: "p08", name: "Nugget", category: "Tambahan", price: 10000, hpp: 4500, recipe: false, active: true, stock: 0, icon: "fries" },
      { id: "p09", name: "Nasi Ayam", category: "Makanan", price: 20000, hpp: 11000, recipe: true, active: true, stock: 9, icon: "utensils" },
      { id: "p10", name: "Nasi Telur", category: "Makanan", price: 15000, hpp: 7000, recipe: true, active: true, stock: 12, icon: "utensils" },
      { id: "p11", name: "Mie Goreng", category: "Makanan", price: 18000, hpp: 9000, recipe: false, active: true, stock: 0, icon: "utensils" },
      { id: "p12", name: "Air Mineral", category: "Minuman", price: 5000, hpp: 2500, recipe: false, active: true, stock: 24, icon: "cup" },
      { id: "p13", name: "Teh Hangat", category: "Minuman", price: 5000, hpp: 1500, recipe: false, active: true, stock: 15, icon: "cup" },
      { id: "p14", name: "Paket Hemat", category: "Paket", price: 25000, hpp: 17000, recipe: true, active: true, stock: 5, icon: "layers" },
      { id: "p15", name: "Roti Bakar", category: "Makanan", price: 14000, hpp: 6000, recipe: false, active: false, stock: 0, icon: "utensils" },
      { id: "p16", name: "Jus Alpukat", category: "Minuman", price: 16000, hpp: 8000, recipe: false, active: false, stock: 0, icon: "cup" },
      { id: "p17", name: "Pisang Goreng", category: "Tambahan", price: 11000, hpp: 4000, recipe: false, active: false, stock: 0, icon: "fries" },
      { id: "p18", name: "Extra Telur", category: "Tambahan", price: 5000, hpp: 2500, recipe: true, active: true, stock: 11, icon: "fries" },
    ],
    ingredients: [
      { id: "b01", name: "Ayam fillet", unit: "kg", stock: 2, min: 5, conversion: true },
      { id: "b02", name: "Beras", unit: "kg", stock: 12.4, min: 5, conversion: true },
      { id: "b03", name: "Telur", unit: "kg", stock: 8, min: 3, conversion: true },
      { id: "b04", name: "Minyak goreng", unit: "liter", stock: 4.2, min: 3, conversion: true },
      { id: "b05", name: "Tepung terigu", unit: "kg", stock: 1.5, min: 2, conversion: true },
      { id: "b06", name: "Gula pasir", unit: "kg", stock: 3, min: 2, conversion: true },
      { id: "b07", name: "Garam", unit: "kg", stock: 1, min: 0.5, conversion: true },
      { id: "b08", name: "Saus sambal", unit: "botol", stock: 2, min: 1, conversion: false },
      { id: "b09", name: "Daging sapi", unit: "kg", stock: 0, min: 2, conversion: true },
      { id: "b10", name: "Susu cair", unit: "liter", stock: -0.3, min: 2, conversion: true },
    ],
    recipes: {
      p01: [{ ingredientId: "b01", qty: 0.15 }, { ingredientId: "b02", qty: 0.12 }, { ingredientId: "b03", qty: 0.06 }, { ingredientId: "b04", qty: 0.015 }, { ingredientId: "b08", qty: 0.03 }],
      p02: [{ ingredientId: "b09", qty: 0.1 }, { ingredientId: "b08", qty: 0.02 }],
      p04: [{ ingredientId: "b06", qty: 0.02 }],
      p07: [{ ingredientId: "b05", qty: 0.1 }, { ingredientId: "b04", qty: 0.05 }],
      p09: [{ ingredientId: "b01", qty: 0.12 }, { ingredientId: "b02", qty: 0.12 }],
      p10: [{ ingredientId: "b02", qty: 0.12 }, { ingredientId: "b03", qty: 0.06 }],
      p14: [{ ingredientId: "b01", qty: 0.15 }, { ingredientId: "b02", qty: 0.12 }, { ingredientId: "b03", qty: 0.06 }, { ingredientId: "b06", qty: 0.02 }],
      p18: [{ ingredientId: "b03", qty: 0.06 }],
    },
    stockMovements: [
      { id: "m01", time: "30 Okt · 10.42", ingredient: "Ayam fillet", type: "Keluar", qty: 0.25, unit: "kg", source: "Penjualan TRX-0086", actor: "Sari", note: "Resep Paket Nuvora" },
      { id: "m02", time: "30 Okt · 10.07", ingredient: "Ayam fillet", type: "Keluar", qty: 0.2, unit: "kg", source: "Penjualan TRX-0083", actor: "Dina", note: "Resep Paket Hemat" },
      { id: "m03", time: "30 Okt · 09.15", ingredient: "Beras", type: "Masuk", qty: 10, unit: "kg", source: "Pembelian", actor: "Admin Demo", note: "Nota pembelian demo" },
      { id: "m04", time: "30 Okt · 08.30", ingredient: "Telur", type: "Keluar", qty: 1.2, unit: "kg", source: "Penjualan TRX-0080", actor: "Raka", note: "Transaksi kemudian direfund" },
      { id: "m05", time: "29 Okt · 22.10", ingredient: "Ayam fillet", type: "Penyesuaian", qty: -0.2, unit: "kg", source: "Opname", actor: "Admin Demo", note: "Menunggu review" },
      { id: "m06", time: "29 Okt · 21.45", ingredient: "Beras", type: "Penyesuaian", qty: 0.4, unit: "kg", source: "Opname", actor: "Admin Demo", note: "Disetujui (demo)" },
      { id: "m07", time: "29 Okt · 18.05", ingredient: "Minyak goreng", type: "Masuk", qty: 5, unit: "liter", source: "Pembelian", actor: "Sari", note: "Nota demo" },
      { id: "m08", time: "29 Okt · 16.40", ingredient: "Susu cair", type: "Keluar", qty: 1.5, unit: "liter", source: "Penjualan TRX-0074", actor: "Dina", note: "Stok sistem menjadi negatif" },
    ],
    members: [
      { id: "mem01", name: "Ayu Lestari", phone: "0812 1111 2233", points: 120, joined: "10 Sep 2026", active: true, history: [] },
      { id: "mem02", name: "Bagas Prakoso", phone: "0857 4444 5566", points: 60, joined: "22 Sep 2026", active: true, history: [] },
      { id: "mem03", name: "Citra Maharani", phone: "0813 7777 8899", points: 240, joined: "1 Okt 2026", active: true, history: [] },
    ],
    transactions: [],
    heldOrders: [],
    audit: [],
  };

  const listeners = new Set();

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function productIcon(category) {
    return { Paket: "layers", Makanan: "utensils", Minuman: "cup", Tambahan: "fries" }[category] || "utensils";
  }

  function normalizeProduct(product) {
    const stock = Number(product.stock);
    return {
      id: String(product.id || ""),
      name: String(product.name || "Produk"),
      category: String(product.category || "Makanan"),
      price: Number(product.price) || 0,
      hpp: Number(product.hpp) || 0,
      recipe: Boolean(product.recipe),
      active: product.active !== false,
      soldOut: product.soldOut === true,
      stock: Number.isFinite(stock) ? stock : 0,
      icon: String(product.icon || productIcon(product.category)),
      ...(product.photo ? { photo: String(product.photo) } : {}),
    };
  }

  function normalizeMember(member) {
    return {
      id: String(member.id || ""),
      name: String(member.name || "Member"),
      phone: String(member.phone || ""),
      points: Math.max(0, Number(member.points) || 0),
      joined: String(member.joined || "—"),
      active: member.active !== false,
      history: Array.isArray(member.history) ? member.history : [],
    };
  }

  function normalizeEmployee(employee) {
    return {
      id: String(employee.id || ""),
      name: String(employee.name || "Karyawan"),
      role: String(employee.role || "Kasir"),
      outlet: String(employee.outlet || "Outlet Melati"),
      joined: String(employee.joined || "—"),
      active: employee.active !== false,
    };
  }

  function normalizeSettings(settings) {
    const source = settings && typeof settings === "object" ? settings : {};
    return {
      ...SEED.settings,
      ...source,
      loyalty: { ...SEED.settings.loyalty, ...(source.loyalty || {}) },
    };
  }

  function normalizeState(value) {
    const source = value && typeof value === "object" ? value : {};
    return {
      version: VERSION,
      settings: normalizeSettings(source.settings),
      employees: Array.isArray(source.employees) ? source.employees.map(normalizeEmployee) : clone(SEED.employees),
      products: Array.isArray(source.products) ? source.products.map(normalizeProduct) : clone(SEED.products),
      ingredients: Array.isArray(source.ingredients) ? source.ingredients : clone(SEED.ingredients),
      recipes: source.recipes && typeof source.recipes === "object" ? source.recipes : clone(SEED.recipes),
      stockMovements: Array.isArray(source.stockMovements) ? source.stockMovements : clone(SEED.stockMovements),
      members: Array.isArray(source.members) ? source.members.map(normalizeMember) : clone(SEED.members).map(normalizeMember),
      transactions: Array.isArray(source.transactions) ? source.transactions : [],
      heldOrders: Array.isArray(source.heldOrders) ? source.heldOrders : [],
      audit: Array.isArray(source.audit) ? source.audit : [],
    };
  }

  function load() {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return normalizeState(clone(SEED));
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== VERSION) return normalizeState(clone(SEED));
      return normalizeState(parsed);
    } catch (error) {
      return normalizeState(clone(SEED));
    }
  }

  let state = load();

  function replaceArray(target, source) {
    target.splice(0, target.length, ...clone(source));
  }

  function persist() {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch (error) {
      let saved = false;
      try {
        replaceArray(state.products, state.products.map(({ photo, ...product }) => product));
        window.localStorage.setItem(KEY, JSON.stringify(state));
        saved = true;
      } catch (innerError) {
        saved = false;
      }
      if (!saved) return false;
    }
    listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        window.setTimeout(() => { throw error; }, 0);
      }
    });
    return true;
  }

  function hydrate() {
    const next = load();
    replaceArray(state.employees, next.employees);
    replaceArray(state.products, next.products);
    replaceArray(state.ingredients, next.ingredients);
    state.recipes = next.recipes;
    replaceArray(state.stockMovements, next.stockMovements);
    replaceArray(state.members, next.members);
    replaceArray(state.transactions, next.transactions);
    replaceArray(state.heldOrders, next.heldOrders);
    replaceArray(state.audit, next.audit);
    state.settings = next.settings;
    listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        window.setTimeout(() => { throw error; }, 0);
      }
    });
  }

  function activeEmployees() {
    return state.employees.filter((employee) => employee.active);
  }

  function cashiers() {
    const eligible = activeEmployees().filter((employee) => employee.role === "Kasir");
    return eligible.length ? eligible : activeEmployees();
  }

  function cashier() {
    const eligible = cashiers();
    const selected = eligible.find((employee) => employee.id === state.settings.cashierId);
    if (selected) return selected;
    const fallback = eligible[0] || state.employees[0] || { id: "", name: "Kasir", role: "Kasir" };
    state.settings.cashierId = fallback.id;
    return fallback;
  }

  function nextId(prefix, list) {
    const max = list.reduce((value, item) => {
      const match = String(item.id || "").match(new RegExp(`^${prefix}(\\d+)$`));
      return match ? Math.max(value, Number(match[1])) : value;
    }, 0);
    return `${prefix}${String(max + 1).padStart(2, "0")}`;
  }

  function setCashier(id) {
    const employee = cashiers().find((item) => item.id === id);
    if (!employee) return false;
    state.settings.cashierId = employee.id;
    persist();
    return true;
  }

  function saveSettings() {
    persist();
  }

  function saveProducts() {
    replaceArray(state.products, state.products.map(normalizeProduct));
    persist();
  }

  function saveEmployees() {
    replaceArray(state.employees, state.employees.map(normalizeEmployee));
    persist();
  }

  function saveIngredients() {
    persist();
  }

  function saveRecipes() {
    persist();
  }

  function saveStockMovements() {
    persist();
  }

  function saveMembers() {
    replaceArray(state.members, state.members.map(normalizeMember));
    persist();
  }

  function saveTransactions() {
    persist();
  }

  function saveHeldOrders() {
    persist();
  }

  function saveAudit() {
    persist();
  }

  function resetMaster() {
    replaceArray(state.products, SEED.products);
    replaceArray(state.employees, SEED.employees);
    replaceArray(state.ingredients, SEED.ingredients);
    state.recipes = clone(SEED.recipes);
    replaceArray(state.stockMovements, SEED.stockMovements);
    replaceArray(state.members, SEED.members);
    state.settings = clone(SEED.settings);
    persist();
  }

  function resetAll() {
    replaceArray(state.products, SEED.products);
    replaceArray(state.employees, SEED.employees);
    replaceArray(state.ingredients, SEED.ingredients);
    state.recipes = clone(SEED.recipes);
    replaceArray(state.stockMovements, SEED.stockMovements);
    replaceArray(state.members, SEED.members);
    replaceArray(state.transactions, SEED.transactions);
    replaceArray(state.heldOrders, SEED.heldOrders);
    replaceArray(state.audit, SEED.audit);
    state.settings = clone(SEED.settings);
    persist();
  }

  function subscribe(listener) {
    if (typeof listener !== "function") return () => {};
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  if (typeof window.addEventListener === "function") {
    window.addEventListener("storage", (event) => {
      if (event.key === KEY) hydrate();
    });
  }

  window.NuvoraStore = {
    key: KEY,
    version: VERSION,
    getSettings: () => state.settings,
    saveSettings,
    getEmployees: () => state.employees,
    saveEmployees,
    getActiveEmployees: activeEmployees,
    getCashiers: cashiers,
    getCashier: cashier,
    setCashier,
    getProducts: () => state.products,
    saveProducts,
    getIngredients: () => state.ingredients,
    saveIngredients,
    getRecipes: () => state.recipes,
    saveRecipes,
    getStockMovements: () => state.stockMovements,
    saveStockMovements,
    getMembers: () => state.members,
    saveMembers,
    getTransactions: () => state.transactions,
    saveTransactions,
    getHeldOrders: () => state.heldOrders,
    saveHeldOrders,
    getAudit: () => state.audit,
    saveAudit,
    nextId,
    resetMaster,
    resetAll,
    subscribe,
  };
})();
