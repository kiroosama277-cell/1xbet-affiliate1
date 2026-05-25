const header = document.querySelector("[data-header]");
const progress = document.querySelector("[data-progress]");
const form = document.querySelector("[data-form]");
const formNote = document.querySelector("[data-form-note]");
const faqButtons = document.querySelectorAll(".faq-item");
const counters = document.querySelectorAll("[data-counter]");
const revealItems = document.querySelectorAll(".reveal, .reveal-group");
const codeInput = document.querySelector("[data-code-input]");
const liveCode = document.querySelector("[data-live-code]");
const promoCode = document.querySelector("[data-promo-code]");
const codeTicket = document.querySelector(".code-ticket");
const promoPreview = document.querySelector(".promo-preview");
const hamburger = document.querySelector("[data-hamburger]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const typingText = document.querySelector("[data-typing-text]");
const toast = document.querySelector("[data-toast]");
const cursor = document.querySelector("[data-cursor]");
const submitBtn = document.querySelector(".submit-btn");
const submitText = document.querySelector("[data-submit-text]");
const preloaderFill = document.querySelector("[data-preloader-fill]");
const preloaderPct = document.querySelector("[data-preloader-pct]");
const horizontalSections = document.querySelectorAll("[data-horizontal]");
const langToggle = document.querySelector("[data-lang-toggle]");
const langLabel = document.querySelector("[data-lang-label]");

const defaultPromoCode = "YOURCODE";
let currentLang = "ar";

const translations = {
  ar: {
    navPromo: "البروموكود",
    navSteps: "الخطوات",
    navProgram: "البرنامج",
    navWithdraw: "السحب",
    navRegister: "التسجيل",
    headerCta: "كن شريكًا",
    heroEyebrow: "1XBET Affiliate Program",
    heroTitleLead: "سجّل كشريك تسويق واحصل على",
    heroCopy: "واجهة تسجيل مصممة لجمع بيانات الشريك، مصدر الزيارات، والكود المقترح في نموذج واحد سريع وواضح، مع تجربة استخدام احترافية تناسب حملات التسويق.",
    heroPrimary: "ابدأ التسجيل",
    heroSecondary: "عرض التفاصيل",
    noticeTitle: "طلب واحد منظم",
    noticeCopy: "أرسل بيانات الشريك ومصدر الزيارات والكود المقترح. بعد المراجعة، يمكن ربط الطلب بمسؤول المبيعات أو لوحة متابعة خاصة.",
    noticeCta: "تقديم الطلب",
    promoKicker: "عن البروموكود",
    promoTitle: "واحصل على بروموكود مخصص لحملاتك",
    promoCopy: "البروموكود هو كود تسويقي مخصص يساعد على تمييز طلبات الشريك وربطها بمصدر الزيارات. املأ بياناتك، اختر كودًا واضحًا، وابدأ مسار المراجعة.",
    phrases: ["بروموكود مخصص", "رابط شريك واضح", "طلب قابل للمتابعة"],
  },
  en: {
    navPromo: "Promo Code",
    navSteps: "Steps",
    navProgram: "Program",
    navWithdraw: "Payout",
    navRegister: "Register",
    headerCta: "Become Partner",
    heroEyebrow: "1XBET Affiliate Program",
    heroTitleLead: "Register as a partner and get a",
    heroCopy: "A premium registration flow for partner details, traffic source, and proposed promo code in one clear form built for campaign teams.",
    heroPrimary: "Start Registration",
    heroSecondary: "View Details",
    noticeTitle: "One Organized Request",
    noticeCopy: "Submit partner details, traffic source, and proposed promo code. After review, the request can be assigned to a sales owner or tracking dashboard.",
    noticeCta: "Submit Request",
    promoKicker: "About Promo Codes",
    promoTitle: "Get a dedicated promo code for your campaigns",
    promoCopy: "A promo code is a dedicated marketing code used to identify partner requests and connect them with a traffic source. Fill in your details, choose a clean code, and start the review flow.",
    phrases: ["Dedicated Promo Code", "Clear Partner Link", "Trackable Request"],
  },
};

/* ── Preloader with progress ── */
let loadProgress = 0;
const preloaderInterval = setInterval(() => {
  loadProgress += Math.random() * 12 + 4;
  if (loadProgress > 90) loadProgress = 90;
  preloaderFill.style.width = `${loadProgress}%`;
  preloaderPct.textContent = `${Math.round(loadProgress)}%`;
}, 200);

window.addEventListener("load", () => {
  clearInterval(preloaderInterval);
  let pct = 90;
  const finalize = setInterval(() => {
    pct += 3;
    preloaderFill.style.width = `${pct}%`;
    preloaderPct.textContent = `${Math.round(pct)}%`;
    if (pct >= 100) {
      clearInterval(finalize);
      setTimeout(() => document.documentElement.classList.add("is-loaded"), 180);
    }
  }, 30);
});

/* ── Cursor Glow ── */
document.addEventListener("mousemove", (e) => {
  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;
});

document.addEventListener("mouseleave", () => {
  cursor.style.opacity = "0";
});

document.addEventListener("mouseenter", () => {
  cursor.style.opacity = "1";
});

/* ── Header scroll shadow ── */
window.addEventListener("scroll", () => {
  header.style.boxShadow = window.scrollY > 12
    ? "0 10px 28px rgba(6, 20, 47, 0.12)"
    : "none";

  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progressWidth = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progress.style.width = `${progressWidth}%`;

  updateHorizontalScroll();
});

function updateHorizontalScroll() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  horizontalSections.forEach((section) => {
    const track = section.querySelector("[data-horizontal-track]");
    const pin = section.querySelector(".horizontal-pin");
    if (!track || !pin) return;

    const maxTranslate = Math.max(0, track.scrollWidth - pin.clientWidth);
    const rect = section.querySelector(".horizontal-scroll").getBoundingClientRect();
    const scrollRange = rect.height - window.innerHeight;
    const progressValue = scrollRange > 0
      ? Math.min(Math.max(-rect.top / scrollRange, 0), 1)
      : 0;

    track.style.transform = `translate3d(${-maxTranslate * progressValue}px, 0, 0)`;
  });
}

window.addEventListener("resize", updateHorizontalScroll);
window.addEventListener("load", updateHorizontalScroll);

/* ── Typing Effect ── */
const phrases = [
  "بروموكود مخصص",
  "رابط شريك واضح",
  "طلب قابل للمتابعة",
];
let phraseIdx = 0;
let charIdx = 0;
let isDeleting = false;
let typingTimeout;

function typeEffect() {
  if (!typingText) return;
  const current = phrases[phraseIdx];

  if (!isDeleting) {
    charIdx++;
    typingText.textContent = current.slice(0, charIdx);
    if (charIdx === current.length) {
      isDeleting = true;
      typingTimeout = setTimeout(typeEffect, 2200);
      return;
    }
    typingTimeout = setTimeout(typeEffect, 60 + Math.random() * 40);
  } else {
    charIdx--;
    typingText.textContent = current.slice(0, charIdx);
    if (charIdx === 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      typingTimeout = setTimeout(typeEffect, 400);
      return;
    }
    typingTimeout = setTimeout(typeEffect, 30 + Math.random() * 20);
  }
}

const heroObserver = new MutationObserver(() => {
  if (document.querySelector(".hero-content.is-visible")) {
    setTimeout(typeEffect, 600);
    heroObserver.disconnect();
  }
});
heroObserver.observe(document.querySelector(".hero-content"), {
  attributes: true,
  attributeFilter: ["class"],
});

function applyLanguage(lang) {
  const dict = translations[lang];
  if (!dict) return;

  currentLang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  langLabel.textContent = lang.toUpperCase();

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (dict[key]) element.textContent = dict[key];
  });

  phrases.splice(0, phrases.length, ...dict.phrases);
  phraseIdx = 0;
  charIdx = 0;
  isDeleting = false;
  clearTimeout(typingTimeout);
  if (typingText) {
    typingText.textContent = phrases[0];
    setTimeout(typeEffect, 500);
  }
}

langToggle?.addEventListener("click", () => {
  applyLanguage(currentLang === "ar" ? "en" : "ar");
});

applyLanguage(currentLang);

/* ── Animate Counter ── */
const animateCounter = (element) => {
  if (element.dataset.done) return;
  element.dataset.done = "true";

  const target = Number(element.dataset.counter || 0);
  const start = performance.now();
  const duration = 820;

  const tick = (now) => {
    const pr = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - pr, 3);
    element.textContent = Math.round(target * eased);
    if (pr < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

/* ── Reveal Observer ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    entry.target.classList.add("is-visible");
    entry.target.querySelectorAll("[data-counter]").forEach(animateCounter);
    if (entry.target.hasAttribute("data-counter")) animateCounter(entry.target);
  });
}, { threshold: 0.18 });

revealItems.forEach((item) => revealObserver.observe(item));
counters.forEach((counter) => revealObserver.observe(counter));

/* ── Hamburger Menu ── */
hamburger?.addEventListener("click", () => {
  const isOpen = hamburger.classList.toggle("active");
  mobileNav.classList.toggle("open", isOpen);
  hamburger.setAttribute("aria-label", isOpen ? "إغلاق القائمة" : "فتح القائمة");
  mobileNav.setAttribute("aria-hidden", String(!isOpen));
  document.body.style.overflow = isOpen ? "hidden" : "";
});

mobileNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("active");
    mobileNav.classList.remove("open");
    mobileNav.setAttribute("aria-hidden", "true");
    hamburger.setAttribute("aria-label", "فتح القائمة");
    document.body.style.overflow = "";
  });
});

/* ── Promo Code Input ── */
codeInput?.addEventListener("input", () => {
  const normalized = codeInput.value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 14);

  codeInput.value = normalized;
  liveCode.textContent = normalized || defaultPromoCode;
  promoCode.textContent = normalized || defaultPromoCode;

  [codeTicket, promoPreview].forEach((element) => {
    if (!element) return;
    element.classList.remove("is-updating");
    void element.offsetWidth;
    element.classList.add("is-updating");
  });
});

/* ── FAQ Accordion ── */
faqButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const answer = button.nextElementSibling;
    const isOpen = button.getAttribute("aria-expanded") === "true";

    faqButtons.forEach((otherButton) => {
      if (otherButton === button) return;
      otherButton.setAttribute("aria-expanded", "false");
      otherButton.querySelector("b").textContent = "+";
      otherButton.nextElementSibling.classList.remove("open");
    });

    button.setAttribute("aria-expanded", String(!isOpen));
    button.querySelector("b").textContent = isOpen ? "+" : "\u2212";
    answer.classList.toggle("open", !isOpen);
  });
});

/* ── Toast ── */
function showToast(message, type = "success") {
  toast.textContent = message;
  toast.className = `toast ${type}`;
  void toast.offsetWidth;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
}

/* ── Form Validation ── */
const fieldLabels = {
  name: "الاسم والعائلة",
  email: "البريد الإلكتروني",
  phone: "رقم الهاتف",
  country: "الدولة",
  code: "البروموكود",
  channel: "مصدر الزيارات",
};

function validateField(input) {
  const name = input.name;
  const error = document.querySelector(`[data-field-error="${name}"]`);
  const val = input.value.trim();

  input.classList.remove("error");
  if (error) error.textContent = "";

  if (input.hasAttribute("required") && !val) {
    input.classList.add("error");
    if (error) error.textContent = `حقل ${fieldLabels[name] || name} مطلوب`;
    return false;
  }

  if (name === "email" && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
    input.classList.add("error");
    if (error) error.textContent = "البريد الإلكتروني غير صحيح";
    return false;
  }

  if (name === "phone" && val && !/^[\d\s\+\-]{7,20}$/.test(val)) {
    input.classList.add("error");
    if (error) error.textContent = "رقم الهاتف غير صحيح";
    return false;
  }

  return true;
}

form?.querySelectorAll("input, select, textarea").forEach((input) => {
  input.addEventListener("blur", () => validateField(input));
  input.addEventListener("input", () => {
    if (input.classList.contains("error")) validateField(input);
  });
});

/* ── Form Submit ── */
form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const inputs = form.querySelectorAll("input, select, textarea");
  let valid = true;

  inputs.forEach((input) => {
    if (!validateField(input)) valid = false;
  });

  if (!valid) {
    const firstError = form.querySelector(".error");
    firstError?.focus();
    firstError?.closest("label")?.scrollIntoView({ behavior: "smooth", block: "center" });
    form.classList.add("shake");
    setTimeout(() => form.classList.remove("shake"), 500);
    return;
  }

  const data = new FormData(form);
  const code = String(data.get("code") || "").trim().toUpperCase() || defaultPromoCode;

  submitBtn.classList.add("loading");
  submitBtn.disabled = true;
  submitText.textContent = "جاري إرسال الطلب...";

  await new Promise((r) => setTimeout(r, 1400));

  submitBtn.classList.remove("loading");
  submitBtn.disabled = false;
  submitText.textContent = "إرسال طلب التسجيل";

  formNote.textContent = `تم تجهيز طلب البروموكود ${code}. سيتم ربط الطلب لاحقًا بنظام المبيعات أو البريد.`;
  formNote.classList.add("success");
  form.classList.add("submitted");

  showToast(`تم إرسال طلب البروموكود ${code} بنجاح`);

  form.reset();
  liveCode.textContent = defaultPromoCode;
  promoCode.textContent = defaultPromoCode;

  form.querySelectorAll(".error").forEach((el) => el.classList.remove("error"));
  form.querySelectorAll("[data-field-error]").forEach((el) => el.textContent = "");

  setTimeout(() => {
    formNote.classList.remove("success");
    form.classList.remove("submitted");
  }, 4000);
});

/* ── 3D Tilt Effect ── */
document.querySelectorAll("[data-tilt]").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-7px)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});

/* ── Magnetic Buttons ── */
document.querySelectorAll("[data-magnetic]").forEach((btn) => {
  const text = btn.querySelector("[data-magnetic-text]");

  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    text.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  });

  btn.addEventListener("mouseleave", () => {
    text.style.transform = "";
  });
});

/* ── Ripple Effect on Buttons ── */
document.querySelectorAll(".header-cta, .primary-btn, .secondary-btn, .submit-btn, .notice a").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    const rect = this.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      border-radius: 50%;
      background: rgba(255,255,255,0.3);
      pointer-events: none;
      transform: scale(0);
      animation: rippleAnim 0.6s ease-out forwards;
    `;
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
});

/* inject ripple keyframe if not exists */
if (!document.getElementById("ripple-style")) {
  const style = document.createElement("style");
  style.id = "ripple-style";
  style.textContent = `@keyframes rippleAnim { to { transform: scale(2.5); opacity: 0; } }`;
  document.head.appendChild(style);
}
