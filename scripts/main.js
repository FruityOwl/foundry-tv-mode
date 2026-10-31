// TV Mode
// Hides the whole Foundry interface for one chosen account, so a screen can
// show the scene and nothing else. A floating eye button brings it back.

const MODULE_ID = "foundry-tv-mode";
const TV_USER_SETTING = "tvUser";
const NO_TV_USER = "none";
const HIDDEN_KEY = `${MODULE_ID}.uiHidden`;
const POSITION_KEY = `${MODULE_ID}.buttonPosition`;
const HIDDEN_CLASS = "tvmode-ui-hidden";
const BUTTON_ID = "tvmode-toggle";
const BUTTON_SIZE = 48;
const EDGE_MARGIN = 8;
const DEFAULT_RIGHT = 72;
const DEFAULT_TOP = 16;
const DRAG_THRESHOLD = 5;

const t = (key) => game.i18n.localize(`TVMODE.${key}`);

class TvMode {
  static button = null;
  static drag = null;
  static suppressClick = false;

  static get isTvUser() {
    return game.settings.get(MODULE_ID, TV_USER_SETTING) === game.userId;
  }

  static get isHidden() {
    return document.body.classList.contains(HIDDEN_CLASS);
  }

  // The interface starts hidden on the TV account; the choice is remembered per browser.
  static wantsHidden() {
    return localStorage.getItem(HIDDEN_KEY) !== "0";
  }

  static sync() {
    const tvUser = this.isTvUser;
    const hidden = tvUser && this.wantsHidden();
    const changed = hidden !== this.isHidden;
    document.body.classList.toggle(HIDDEN_CLASS, hidden);
    if (changed) this.syncCanvas();
    if (tvUser) this.mount();
    else this.unmount();
    this.syncButton();
    // Cast & Scene fits its stage around the interface it can see, so it has to measure again.
    if (changed) window.dispatchEvent(new Event("resize"));
  }

  // Other users' cursors, pings and rulers are drawn on the canvas, not in the page.
  static syncCanvas() {
    const controls = globalThis.canvas?.controls;
    if (controls) controls.visible = !this.isHidden;
  }

  static toggle() {
    localStorage.setItem(HIDDEN_KEY, this.isHidden ? "0" : "1");
    this.sync();
  }

  static mount() {
    if (this.button) return;
    const button = document.createElement("button");
    button.type = "button";
    button.id = BUTTON_ID;
    button.innerHTML = `<i class="fa-solid" aria-hidden="true"></i>`;
    button.addEventListener("click", () => this.onClick());
    button.addEventListener("pointerdown", (event) => this.startDrag(event));
    button.addEventListener("pointermove", (event) => this.onDragMove(event));
    button.addEventListener("pointerup", (event) => this.endDrag(event));
    button.addEventListener("pointercancel", (event) => this.endDrag(event));
    document.body.appendChild(button);
    this.button = button;
    this.place();
  }

  static unmount() {
    this.button?.remove();
    this.button = null;
    this.drag = null;
  }

  // The icon shows the state of the interface: an open eye while it is on screen.
  static syncButton() {
    if (!this.button) return;
    const hidden = this.isHidden;
    const label = t(hidden ? "ShowInterface" : "HideInterface");
    this.button.title = label;
    this.button.setAttribute("aria-label", label);
    this.button.setAttribute("aria-pressed", String(hidden));
    this.button.querySelector("i").className = `fa-solid ${hidden ? "fa-eye-slash" : "fa-eye"}`;
  }

  static onClick() {
    if (this.suppressClick) {
      this.suppressClick = false;
      return;
    }
    this.toggle();
  }

  static savedPosition() {
    try {
      const position = JSON.parse(localStorage.getItem(POSITION_KEY) || "null");
      return Number.isFinite(position?.left) && Number.isFinite(position?.top) ? position : null;
    } catch (_error) {
      return null;
    }
  }

  static clamped({ left, top }) {
    const maxLeft = Math.max(EDGE_MARGIN, window.innerWidth - BUTTON_SIZE - EDGE_MARGIN);
    const maxTop = Math.max(EDGE_MARGIN, window.innerHeight - BUTTON_SIZE - EDGE_MARGIN);
    return {
      left: Math.min(maxLeft, Math.max(EDGE_MARGIN, left)),
      top: Math.min(maxTop, Math.max(EDGE_MARGIN, top))
    };
  }

  static place(position = this.savedPosition()) {
    if (!this.button) return;
    const { left, top } = this.clamped(position ?? {
      left: window.innerWidth - BUTTON_SIZE - DEFAULT_RIGHT,
      top: DEFAULT_TOP
    });
    this.button.style.left = `${left}px`;
    this.button.style.top = `${top}px`;
  }

  static startDrag(event) {
    if (event.button !== 0) return;
    this.suppressClick = false;
    const { left, top } = this.button.getBoundingClientRect();
    this.drag = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, left, top, moved: false };
    this.button.setPointerCapture?.(event.pointerId);
  }

  static onDragMove(event) {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    drag.moved = true;
    this.button.classList.add("is-dragging");
    this.place({ left: drag.left + dx, top: drag.top + dy });
  }

  static endDrag(event) {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    this.drag = null;
    this.button.classList.remove("is-dragging");
    if (!drag.moved) return;
    this.suppressClick = true;
    const { left, top } = this.button.getBoundingClientRect();
    localStorage.setItem(POSITION_KEY, JSON.stringify({ left: Math.round(left), top: Math.round(top) }));
  }
}

// i18nInit runs before Foundry draws anything, so the interface never flashes on the TV.
// game.users does not exist yet at this point; game.data.users does.
Hooks.once("i18nInit", () => {
  const users = Object.fromEntries(game.data.users.map((user) => [user._id, user.name]));
  game.settings.register(MODULE_ID, TV_USER_SETTING, {
    name: t("TvUser"),
    hint: t("TvUserHint"),
    scope: "world",
    config: true,
    type: String,
    choices: { [NO_TV_USER]: t("NoTvUser"), ...users },
    default: NO_TV_USER,
    onChange: () => TvMode.sync()
  });
  window.addEventListener("resize", () => TvMode.place());
  TvMode.sync();
});

Hooks.on("canvasReady", () => {
  if (TvMode.isHidden) TvMode.syncCanvas();
});
