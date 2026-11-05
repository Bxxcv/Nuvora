(function () {
  "use strict";

  const STORAGE_KEY = "nuvora-demo-attendance-v3";
  const TODAY = "2026-10-30";
  const SHIFT_START_MINUTES = 8 * 60;
  const MONTH_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const seedHistory = [
    { id: "h-29", date: "2026-10-29", dayLabel: "Kamis, 29 Okt 2026", checkIn: "07:58", checkOut: "16:05", status: "Hadir" },
    { id: "h-28", date: "2026-10-28", dayLabel: "Rabu, 28 Okt 2026", checkIn: "08:12", checkOut: "16:03", status: "Terlambat" },
    { id: "h-27", date: "2026-10-27", dayLabel: "Selasa, 27 Okt 2026", checkIn: "07:55", checkOut: "16:02", status: "Hadir" },
    { id: "h-26", date: "2026-10-26", dayLabel: "Senin, 26 Okt 2026", checkIn: "07:57", checkOut: "16:04", status: "Hadir" },
    { id: "h-0930", date: "2026-09-30", dayLabel: "Rabu, 30 Sep 2026", checkIn: "07:59", checkOut: "16:04", status: "Hadir" },
    { id: "h-0929", date: "2026-09-29", dayLabel: "Selasa, 29 Sep 2026", checkIn: "08:07", checkOut: "16:02", status: "Terlambat" },
    { id: "h-0928", date: "2026-09-28", dayLabel: "Senin, 28 Sep 2026", checkIn: "07:56", checkOut: "16:05", status: "Hadir" },
    { id: "h-0831", date: "2026-08-31", dayLabel: "Senin, 31 Agu 2026", checkIn: "07:54", checkOut: "16:03", status: "Hadir" },
    { id: "h-0828", date: "2026-08-28", dayLabel: "Jumat, 28 Agu 2026", checkIn: "08:09", checkOut: "16:01", status: "Terlambat" },
    { id: "h-0827", date: "2026-08-27", dayLabel: "Kamis, 27 Agu 2026", checkIn: "07:57", checkOut: "16:02", status: "Hadir" }
  ];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const elements = {
    splash: $("#splash"),
    toast: $("#toast"),
    toastText: $("#toastText"),
    appScroll: $("#appScroll"),
    statusText: $("#statusText"),
    statusDetail: $("#statusDetail"),
    primaryAttendanceBtn: $("#primaryAttendanceBtn"),
    primaryAttendanceLabel: $("#primaryAttendanceLabel"),
    homeHistory: $("#homeHistory"),
    statHadir: $("#statHadir"),
    statLate: $("#statLate"),
    statTotal: $("#statTotal"),
    todayBlock: $("#todayBlock"),
    todayHistory: $("#todayHistory"),
    fullHistory: $("#fullHistory"),
    historyMonth: $("#historyMonth"),
    historyStatusFilter: $("#historyStatusFilter"),
    historyFilterSummary: $("#historyFilterSummary"),
    sheetRoot: $("#sheetRoot"),
    sheetBackdrop: $("#sheetBackdrop"),
    attendanceSheetTitle: $("#attendanceSheetTitle"),
    attendanceSheetSubtitle: $("#attendanceSheetSubtitle"),
    cameraStatus: $("#cameraStatus"),
    captureButton: $("#captureButton"),
    capturedActions: $("#capturedActions"),
    confirmAttendance: $("#confirmAttendance")
  };

  let state = loadState();
  let attendanceMode = "in";
  let selfieCaptured = false;
  let confirmBusy = false;
  let toastTimer = 0;
  let lastFocusedElement = null;
  const historyFilter = { month: TODAY.slice(0, 7), status: "all" };

  function cloneSeed() {
    return seedHistory.map((row) => ({ ...row }));
  }

  function defaultState() {
    return { today: null, history: cloneSeed() };
  }

  function loadState() {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.history)) return defaultState();
      return {
        today: parsed.today || null,
        history: parsed.history.filter((row) => row && row.date && row.checkIn)
      };
    } catch (error) {
      return defaultState();
    }
  }

  function saveState() {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      showToast("Penyimpanan demo tidak tersedia di browser ini.");
    }
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function formatTime(date) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function currentTime() {
    return formatTime(new Date());
  }

  function timeToMinutes(time) {
    const parts = String(time || "00:00").split(":").map(Number);
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  }

  function allRows() {
    return state.today ? [state.today, ...state.history] : state.history.slice();
  }

  function monthLabel(month) {
    if (month === "all") return "Semua bulan";
    const parts = month.split("-");
    const monthIndex = Number(parts[1]) - 1;
    return `${MONTH_NAMES[monthIndex] || month} ${parts[0]}`;
  }

  function matchesHistoryFilter(row) {
    const monthMatch = historyFilter.month === "all" || row.date.startsWith(historyFilter.month);
    const statusMatch = historyFilter.status === "all" || row.status === historyFilter.status;
    return monthMatch && statusMatch;
  }

  function filteredRows() {
    return allRows().filter(matchesHistoryFilter);
  }

  function showToast(message) {
    if (!elements.toast || !elements.toastText) return;
    window.clearTimeout(toastTimer);
    elements.toastText.textContent = message;
    elements.toast.hidden = false;
    toastTimer = window.setTimeout(() => {
      elements.toast.hidden = true;
    }, 3200);
  }

  function setTab(tab, shouldScroll = true) {
    const target = $(`#view-${tab}`);
    if (!target) return;

    $$(".view").forEach((view) => view.classList.toggle("is-active", view === target));
    $$(".nav-item").forEach((button) => {
      const active = button.dataset.tab === tab;
      button.classList.toggle("is-active", active);
      if (active) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }
    });

    if (shouldScroll && elements.appScroll) elements.appScroll.scrollTop = 0;
  }

  function openSheet(name) {
    const sheet = $(`#sheet${name}`);
    if (!sheet || !elements.sheetRoot) return;

    lastFocusedElement = document.activeElement;
    $$(".sheet-content", elements.sheetRoot).forEach((content) => {
      content.classList.toggle("is-active", content === sheet);
    });
    elements.sheetRoot.hidden = false;
    const panel = $(".sheet-panel", elements.sheetRoot);
    if (panel) panel.scrollTop = 0;

    window.requestAnimationFrame(() => {
      const focusTarget = $(".sheet-close", sheet) || $("button", sheet);
      if (focusTarget) focusTarget.focus({ preventScroll: true });
    });
  }

  function closeSheet() {
    if (!elements.sheetRoot) return;
    elements.sheetRoot.hidden = true;
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus({ preventScroll: true });
    }
    lastFocusedElement = null;
  }

  function statusLabel() {
    if (!state.today || !state.today.checkIn) return "Belum Absen";
    if (state.today.checkOut) return "Sudah Pulang";
    return "Sudah Absen Masuk";
  }

  function statusDetail() {
    if (!state.today || !state.today.checkIn) return "";
    if (state.today.checkOut) {
      return `Masuk ${state.today.checkIn} \u2022 Pulang ${state.today.checkOut}`;
    }
    return `Masuk ${state.today.checkIn} \u2022 Shift Pagi s.d. 16.00`;
  }

  function primaryLabel() {
    if (!state.today || !state.today.checkIn) return "Absen Masuk";
    if (state.today.checkOut) return "Absensi Selesai";
    return "Absen Pulang";
  }

  function historyRowMarkup(row, withAvatar = false) {
    const isPresent = row.status === "Hadir";
    const isInProgress = !row.checkOut;
    const badgeText = isInProgress ? "Berlangsung" : row.status;
    const badgeClass = isInProgress ? "is-progress" : isPresent ? "is-present" : "is-late";
    const dotClass = isInProgress ? "is-progress" : isPresent ? "is-present" : "is-late";
    const iconId = isPresent ? "i-check" : "i-clock";
    const meta = row.checkOut
      ? `<span>Masuk ${row.checkIn}</span><span class="history-dot" aria-hidden="true"></span><span>Pulang ${row.checkOut}</span>`
      : `<span>Masuk ${row.checkIn}</span><span class="history-dot" aria-hidden="true"></span><span>Pulang --:--</span>`;
    const leading = withAvatar
      ? `<span class="history-avatar-wrap" aria-hidden="true">
          <img class="history-avatar" src="assets/dina-avatar.svg" alt="">
          <span class="history-avatar-dot ${dotClass}"></span>
        </span>`
      : `<span class="history-status-icon${isPresent ? "" : " is-late"}" aria-hidden="true">
          <svg class="icon"><use href="assets/icons.svg#${iconId}"></use></svg>
        </span>`;

    return `
      <div class="history-row">
        ${leading}
        <span class="history-copy">
          <span class="history-day">${row.dayLabel}</span>
          <span class="history-meta">${meta}</span>
        </span>
        <span class="history-badge ${badgeClass}">${badgeText}</span>
      </div>`;
  }

  function renderHome() {
    const label = statusLabel();
    const detail = statusDetail();

    elements.statusText.textContent = label;
    elements.statusText.classList.toggle("is-long", label.length > 12);

    if (detail) {
      elements.statusDetail.textContent = detail;
      elements.statusDetail.hidden = false;
    } else {
      elements.statusDetail.textContent = "";
      elements.statusDetail.hidden = true;
    }

    const labelText = primaryLabel();
    const done = Boolean(state.today && state.today.checkOut);
    elements.primaryAttendanceLabel.textContent = labelText;
    elements.primaryAttendanceBtn.classList.toggle("is-done", done);
    elements.primaryAttendanceBtn.setAttribute("aria-label", labelText);
    elements.primaryAttendanceBtn.disabled = done;

    const rows = state.history.slice(0, 2);
    elements.homeHistory.innerHTML = rows.length
      ? rows.map((row) => historyRowMarkup(row)).join("")
      : '<p class="empty-history">Belum ada riwayat absensi.</p>';
  }

  function renderHistory() {
    const rows = filteredRows();
    const previousRows = state.history.filter(matchesHistoryFilter);
    const todayRow = state.today && matchesHistoryFilter(state.today) ? state.today : null;
    const hadir = rows.filter((row) => row.status === "Hadir" && row.checkOut).length;
    const terlambat = rows.filter((row) => row.status === "Terlambat").length;

    elements.statHadir.textContent = String(hadir);
    elements.statLate.textContent = String(terlambat);
    elements.statTotal.textContent = String(rows.length);
    if (elements.historyFilterSummary) {
      elements.historyFilterSummary.textContent = `${rows.length} catatan \u2022 ${monthLabel(historyFilter.month)}`;
    }
    if (elements.historyMonth) elements.historyMonth.value = historyFilter.month;
    if (elements.historyStatusFilter) {
      $$(".history-chip", elements.historyStatusFilter).forEach((button) => {
        const active = button.dataset.status === historyFilter.status;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }

    if (todayRow) {
      elements.todayBlock.hidden = false;
      elements.todayHistory.innerHTML = historyRowMarkup(todayRow, true);
    } else {
      elements.todayBlock.hidden = true;
      elements.todayHistory.innerHTML = "";
    }

    elements.fullHistory.innerHTML = previousRows.length
      ? previousRows.map((row) => historyRowMarkup(row, true)).join("")
      : '<p class="empty-history">Tidak ada catatan pada filter ini.</p>';
  }

  function renderAll() {
    renderHome();
    renderHistory();
  }

  function resetSelfiePreview() {
    selfieCaptured = false;
    elements.cameraStatus.textContent = "Kamera tidak tersedia \u2014 memakai foto profil";
    elements.captureButton.hidden = false;
    elements.capturedActions.hidden = true;
  }

  function updateAttendanceSheet() {
    const isOut = attendanceMode === "out";
    elements.attendanceSheetTitle.textContent = isOut ? "Absen Pulang" : "Absen Masuk";
    elements.attendanceSheetSubtitle.textContent = "Ambil selfie dan pastikan lokasi Anda terdeteksi di area outlet.";
    setConfirmBusy(false);
    resetSelfiePreview();
  }

  function setConfirmBusy(busy) {
    confirmBusy = busy;
    const retakeButton = $("#retakeButton", elements.capturedActions);
    elements.confirmAttendance.disabled = busy;
    elements.captureButton.disabled = busy;
    if (retakeButton) retakeButton.disabled = busy;
    elements.confirmAttendance.setAttribute("aria-busy", busy ? "true" : "false");
    if (busy) {
      elements.confirmAttendance.textContent = "Menyimpan\u2026";
      return;
    }
    elements.confirmAttendance.textContent = attendanceMode === "out" ? "Konfirmasi Pulang" : "Konfirmasi Absen";
  }

  function openAttendanceSheet() {
    if (state.today && state.today.checkOut) {
      showToast("Absensi hari ini sudah selesai");
      return;
    }

    attendanceMode = state.today && state.today.checkIn ? "out" : "in";
    updateAttendanceSheet();
    openSheet("Attendance");
  }

  function captureSelfie() {
    selfieCaptured = true;
    elements.cameraStatus.textContent = "Selfie berhasil diambil";
    elements.captureButton.hidden = true;
    elements.capturedActions.hidden = false;
    $(".primary-button", elements.capturedActions).focus({ preventScroll: true });
  }

  function confirmAttendance() {
    if (confirmBusy) return;
    if (!selfieCaptured) {
      showToast("Ambil selfie terlebih dahulu.");
      return;
    }

    const mode = attendanceMode;
    setConfirmBusy(true);

    window.setTimeout(() => {
      const time = currentTime();

      if (mode === "in") {
        const status = timeToMinutes(time) <= SHIFT_START_MINUTES ? "Hadir" : "Terlambat";
        state.today = {
          id: "today",
          date: TODAY,
          dayLabel: "Jumat, 30 Okt 2026",
          checkIn: time,
          checkOut: null,
          status
        };
        saveState();
        renderAll();
        closeSheet();
        setConfirmBusy(false);
        showToast(`Absen masuk berhasil pukul ${time}`);
        return;
      }

      if (!state.today || !state.today.checkIn) {
        setConfirmBusy(false);
        showToast("Absen masuk belum tercatat.");
        return;
      }

      state.today.checkOut = time;
      saveState();
      renderAll();
      closeSheet();
      setConfirmBusy(false);
      showToast(`Absen pulang berhasil pukul ${time} \u2014 sampai jumpa besok!`);
    }, 700);
  }

  function handleDemoMenu(button) {
    const label = button.dataset.demoMenu || "Fitur ini";
    showToast(`${label} \u2014 fitur demo untuk Dina Pratama`);
  }

  function bindEvents() {
    $$(".nav-item").forEach((button) => {
      button.addEventListener("click", () => setTab(button.dataset.tab));
    });

    $("#goHistory").addEventListener("click", () => setTab("history"));
    $("#backHome").addEventListener("click", () => setTab("home"));
    $("#openNotif").addEventListener("click", () => openSheet("Notif"));
    $("#openLocation").addEventListener("click", () => openSheet("Location"));
    $("#openSchedule").addEventListener("click", () => openSheet("Schedule"));
    elements.primaryAttendanceBtn.addEventListener("click", openAttendanceSheet);
    elements.captureButton.addEventListener("click", captureSelfie);
    elements.capturedActions.addEventListener("click", (event) => {
      if (event.target.closest("#retakeButton")) resetSelfiePreview();
    });
    elements.confirmAttendance.addEventListener("click", confirmAttendance);
    elements.sheetBackdrop.addEventListener("click", closeSheet);
    $$("[data-close-sheet]").forEach((button) => button.addEventListener("click", closeSheet));
    $$("[data-demo-menu]").forEach((button) => button.addEventListener("click", () => handleDemoMenu(button)));

    if (elements.historyMonth) {
      elements.historyMonth.addEventListener("change", (event) => {
        historyFilter.month = event.target.value;
        renderHistory();
      });
    }

    if (elements.historyStatusFilter) {
      elements.historyStatusFilter.addEventListener("click", (event) => {
        const chip = event.target.closest("[data-status]");
        if (!chip) return;
        historyFilter.status = chip.dataset.status;
        renderHistory();
      });
    }

    $("#logoutButton").addEventListener("click", () => {
      showToast("Anda tetap masuk sebagai Dina Pratama (mode demo)");
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !elements.sheetRoot.hidden) closeSheet();
    });
  }

  function dismissSplash() {
    if (!elements.splash) return;
    window.setTimeout(() => {
      elements.splash.classList.add("is-hiding");
      window.setTimeout(() => {
        elements.splash.hidden = true;
      }, 700);
    }, 1150);
  }

  function init() {
    renderAll();
    bindEvents();
    dismissSplash();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
