(function () {
  "use strict";

  const RUPIAH = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });

  const DATE_LONG = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const DATE_SHORT = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  function rupiah(value) {
    return RUPIAH.format(Number(value) || 0);
  }

  function number(value) {
    return new Intl.NumberFormat("id-ID").format(Number(value) || 0);
  }

  function dateLong(date) {
    return DATE_LONG.format(date || new Date());
  }

  function dateShort(date) {
    return DATE_SHORT.format(date || new Date());
  }

  function icon(name, cls) {
    return `<svg class="icon ${cls || ""}" aria-hidden="true"><use href="assets/icons.svg#i-${name}"></use></svg>`;
  }

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function openDialog(id) {
    const el = typeof id === "string" ? document.getElementById(id) : id;
    if (!el) return null;
    if (typeof el.showModal === "function") {
      if (!el.open) el.showModal();
    } else {
      el.setAttribute("open", "");
    }
    return el;
  }

  function closeDialog(id) {
    const el = typeof id === "string" ? document.getElementById(id) : id;
    if (!el) return;
    if (typeof el.close === "function" && el.open) el.close();
    else el.removeAttribute("open");
  }

  function wireDialogDismiss() {
    qsa("dialog.modal").forEach((dialog) => {
      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) closeDialog(dialog);
      });
      qsa("[data-close-dialog]", dialog).forEach((btn) => {
        btn.addEventListener("click", () => closeDialog(dialog));
      });
    });
  }

  function toast(message, kind, timeout) {
    let region = qs(".toast-region");
    if (!region) {
      region = document.createElement("div");
      region.className = "toast-region";
      region.setAttribute("role", "status");
      region.setAttribute("aria-live", "polite");
      document.body.appendChild(region);
    }
    const el = document.createElement("div");
    el.className = "toast" + (kind ? ` toast-${kind}` : "");
    const iconName = kind === "danger" ? "alert" : kind === "warning" ? "alert" : "check-circle";
    el.innerHTML = `${icon(iconName, "icon-sm")}<span>${escapeHtml(message)}</span>`;
    region.appendChild(el);
    window.setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateY(4px)";
      el.style.transition = "all 160ms ease";
      window.setTimeout(() => el.remove(), 180);
    }, timeout || 3300);
  }

  function setDemoDate() {
    qsa("[data-demo-date]").forEach((el) => {
      el.textContent = dateLong(new Date(2026, 9, 30));
    });
    qsa("[data-demo-date-short]").forEach((el) => {
      el.textContent = dateShort(new Date(2026, 9, 30));
    });
  }

  function initCommon() {
    wireDialogDismiss();
    setDemoDate();
    qsa("[data-open-dialog]").forEach((btn) => {
      btn.addEventListener("click", () => openDialog(btn.dataset.openDialog));
    });
    qsa("[data-toast]").forEach((btn) => {
      btn.addEventListener("click", () => toast(btn.dataset.toast || "Aksi demo.", "info"));
    });
    qsa("[data-demo-only]").forEach((el) => {
      el.addEventListener("click", (event) => {
        if (el.dataset.demoOnly === "disabled") {
          event.preventDefault();
          toast(el.dataset.demoMessage || "Belum aktif pada prototype ini.", "warning");
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", initCommon);

  window.Nuvora = {
    rupiah,
    number,
    dateLong,
    dateShort,
    icon,
    qs,
    qsa,
    escapeHtml,
    openDialog,
    closeDialog,
    toast,
    initCommon,
  };
})();
