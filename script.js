(function () {
  document.documentElement.classList.add("has-js");

  const header = document.querySelector("[data-header]");
  const revealItems = document.querySelectorAll(".reveal");
  const quickForm = document.querySelector("[data-quick-form]");
  const quickStatus = document.querySelector("[data-quick-status]");
  const leadForm = document.querySelector("[data-lead-form]");
  const formStatus = document.querySelector("[data-form-status]");
  const feedbackForm = document.querySelector("[data-feedback-form]");
  const feedbackStatus = document.querySelector("[data-feedback-status]");
  const scrollTopButton = document.querySelector("[data-scroll-top]");
  const canvas = document.getElementById("continuityScene");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TELEGRAM_ENDPOINT = window.TELEGRAM_ENDPOINT || "/api/telegram";

  async function sendLeadToTelegram(payload) {
    const response = await fetch(TELEGRAM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...payload,
        page: window.location.href
      })
    });

    let result = {};

    try {
      result = await response.json();
    } catch (error) {
      result = {};
    }

    if (!response.ok || result.ok !== true) {
      throw new Error(result.error || "Telegram endpoint error");
    }

    return result;
  }

  function handleHeader() {
    if (!header) {
      return;
    }

    header.classList.toggle("is-scrolled", window.scrollY > 12);
  }

  function setupBlockAnimations() {
    const animatedBlocks = document.querySelectorAll(".hero, main > section, .site-footer");
    const staggerGroups = [
      ".proof-strip p",
      ".section-head",
      ".definition-card",
      ".risk-card",
      ".compare-column",
      ".split-layout > *",
      ".service-list li",
      ".criteria-card",
      ".timeline-step",
      ".delivery-card",
      ".tabs",
      ".impact-band",
      ".lead-content > *",
      ".feedback-content > *",
      ".faq-item",
      ".footer-brand > *",
      ".footer-contact"
    ];

    animatedBlocks.forEach((block) => block.classList.add("animate-block"));

    staggerGroups.forEach((selector) => {
      document.querySelectorAll(selector).forEach((item, index) => {
        item.classList.add("motion-item");
        item.style.setProperty("--motion-delay", `${Math.min(index * 70, 420)}ms`);
      });
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
      animatedBlocks.forEach((block) => block.classList.add("is-visible"));
      document.querySelectorAll(".motion-item").forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const blockObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            blockObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );

    animatedBlocks.forEach((block) => blockObserver.observe(block));
  }

  function setupReveal() {
    if (!("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    revealItems.forEach((item) => observer.observe(item));
  }

  function setupTabs() {
    const tabRoot = document.querySelector("[data-tabs]");
    if (!tabRoot) {
      return;
    }

    const buttons = tabRoot.querySelectorAll("[data-tab]");
    const panels = tabRoot.querySelectorAll("[data-panel]");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.tab;

        buttons.forEach((item) => {
          const isActive = item === button;
          item.classList.toggle("is-active", isActive);
          item.setAttribute("aria-selected", String(isActive));
        });

        panels.forEach((panel) => {
          const isActive = panel.dataset.panel === target;
          panel.classList.toggle("is-active", isActive);
          panel.hidden = !isActive;
        });
      });
    });
  }

  function setupScrollTopButton() {
    if (!scrollTopButton) {
      return;
    }

    scrollTopButton.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    });
  }

  function setupQuickForm() {
    if (!quickForm || !quickStatus) {
      return;
    }

    const nameInput = quickForm.querySelector("#quickName");
    const phoneInput = quickForm.querySelector("#quickPhone");
    const controls = quickForm.querySelectorAll("input");

    function clearQuickState(control) {
      control.classList.remove("is-invalid");
      quickStatus.textContent = "";
      quickStatus.className = "quick-form-status";
    }

    controls.forEach((control) => {
      control.addEventListener("input", () => clearQuickState(control));
    });

    quickForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const phoneDigits = phone.replace(/\D/g, "");
      const isNameValid = name.length >= 2;
      const isPhoneValid = phoneDigits.length >= 9;

      nameInput.classList.toggle("is-invalid", !isNameValid);
      phoneInput.classList.toggle("is-invalid", !isPhoneValid);

      if (!isNameValid || !isPhoneValid) {
        quickStatus.textContent = "Вкажіть ім'я та коректний номер телефону.";
        quickStatus.className = "quick-form-status is-error";
        return;
      }

      const submitButton = quickForm.querySelector("button[type='submit']");
      const leadData = {
        name,
        phone,
        createdAt: new Date().toISOString()
      };

      try {
        localStorage.setItem(
          "critical-status-quick-lead",
          JSON.stringify(leadData)
        );
      } catch (error) {
        // Storage can be unavailable in private mode; the form result still matters.
      }

      submitButton.disabled = true;
      quickStatus.textContent = "Відправляємо контакт у Telegram...";
      quickStatus.className = "quick-form-status";

      try {
        await sendLeadToTelegram({
          type: "quick_callback",
          title: "Швидкий дзвінок з першого екрану",
          fields: {
            "Ім'я": name,
            "Телефон": phone
          }
        });

        quickStatus.textContent = "Дякуємо. Контакт відправлено в Telegram.";
        quickStatus.className = "quick-form-status is-success";
        quickForm.reset();
      } catch (error) {
        quickStatus.textContent = "Не вдалося відправити в Telegram. Перевірте налаштування /api/telegram.";
        quickStatus.className = "quick-form-status is-error";
      } finally {
        submitButton.disabled = false;
      }
    });
  }

  function setupLeadForm() {
    if (!leadForm || !formStatus) {
      return;
    }

    const edrpouInput = leadForm.querySelector("#edrpou");
    const contactInput = leadForm.querySelector("#contact");
    const companyInput = leadForm.querySelector("#company");
    const scenarioInput = leadForm.querySelector("#scenario");
    const industryInput = leadForm.querySelector("#industry");
    const employeesInput = leadForm.querySelector("#employees");
    const taxDebtInput = leadForm.querySelector("#taxDebt");
    const situationInput = leadForm.querySelector("#situation");
    const formControls = leadForm.querySelectorAll("input, select, textarea");

    edrpouInput.addEventListener("input", () => {
      edrpouInput.value = edrpouInput.value.replace(/\D/g, "").slice(0, 8);
    });

    function clearControlState(control) {
      control.classList.remove("is-invalid");
      formStatus.textContent = "";
      formStatus.className = "form-status";
    }

    formControls.forEach((control) => {
      control.addEventListener("input", () => clearControlState(control));
      control.addEventListener("change", () => clearControlState(control));
    });

    leadForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const company = companyInput.value.trim();
      const edrpou = edrpouInput.value.trim();
      const scenario = scenarioInput.value;
      const industry = industryInput.value.trim();
      const employees = employeesInput.value.trim();
      const taxDebt = taxDebtInput.value;
      const contact = contactInput.value.trim();
      const situation = situationInput.value.trim();
      const isCodeValid = /^\d{8}$/.test(edrpou);
      const isContactValid = contact.length >= 5;

      edrpouInput.classList.toggle("is-invalid", !isCodeValid);
      contactInput.classList.toggle("is-invalid", !isContactValid);

      if (!isCodeValid || !isContactValid) {
        formStatus.textContent = "Перевірте ЄДРПОУ: потрібно 8 цифр, а також залиште контакт для відповіді.";
        formStatus.className = "form-status is-error";
        return;
      }

      const submitButton = leadForm.querySelector("button[type='submit']");
      const leadData = {
        company,
        edrpou,
        scenario,
        industry,
        employees,
        taxDebt,
        contact,
        situation,
        createdAt: new Date().toISOString()
      };

      try {
        localStorage.setItem(
          "critical-status-lead",
          JSON.stringify(leadData)
        );
      } catch (error) {
        // Private browsing can block storage; the user-facing result should still be calm.
      }

      submitButton.disabled = true;
      formStatus.textContent = "Відправляємо заявку в Telegram...";
      formStatus.className = "form-status";

      try {
        await sendLeadToTelegram({
          type: "full_assessment",
          title: "Заявка на первинну оцінку",
          fields: {
            "Назва компанії": company,
            "ЄДРПОУ": edrpou,
            "Сценарій": scenarioInput.options[scenarioInput.selectedIndex].text,
            "Сфера діяльності": industry,
            "Кількість працівників": employees,
            "Податкова заборгованість": taxDebtInput.options[taxDebtInput.selectedIndex].text,
            "Телефон або email": contact,
            "Ситуація": situation
          }
        });

        formStatus.textContent = "Дякуємо. Заявку відправлено в Telegram.";
        formStatus.className = "form-status is-success";
        leadForm.reset();
      } catch (error) {
        formStatus.textContent = "Не вдалося відправити в Telegram. Перевірте налаштування /api/telegram.";
        formStatus.className = "form-status is-error";
      } finally {
        submitButton.disabled = false;
      }
    });
  }

  function setupFeedbackForm() {
    if (!feedbackForm || !feedbackStatus) {
      return;
    }

    const nameInput = feedbackForm.querySelector("#feedbackName");
    const contactInput = feedbackForm.querySelector("#feedbackContact");
    const messageInput = feedbackForm.querySelector("#feedbackMessage");
    const formControls = feedbackForm.querySelectorAll("input, textarea");

    function clearFeedbackState(control) {
      control.classList.remove("is-invalid");
      feedbackStatus.textContent = "";
      feedbackStatus.className = "form-status";
    }

    formControls.forEach((control) => {
      control.addEventListener("input", () => clearFeedbackState(control));
    });

    feedbackForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = nameInput.value.trim();
      const contact = contactInput.value.trim();
      const message = messageInput.value.trim();
      const isNameValid = name.length >= 2;
      const isContactValid = contact.length >= 5;
      const isMessageValid = message.length >= 4;

      nameInput.classList.toggle("is-invalid", !isNameValid);
      contactInput.classList.toggle("is-invalid", !isContactValid);
      messageInput.classList.toggle("is-invalid", !isMessageValid);

      if (!isNameValid || !isContactValid || !isMessageValid) {
        feedbackStatus.textContent = "Вкажіть ім'я, контакт і коротке повідомлення.";
        feedbackStatus.className = "form-status is-error";
        return;
      }

      const submitButton = feedbackForm.querySelector("button[type='submit']");
      const feedbackData = {
        name,
        contact,
        message,
        createdAt: new Date().toISOString()
      };

      try {
        localStorage.setItem(
          "critical-status-feedback",
          JSON.stringify(feedbackData)
        );
      } catch (error) {
        // Private browsing can block storage; Telegram delivery is independent.
      }

      submitButton.disabled = true;
      feedbackStatus.textContent = "Відправляємо повідомлення в Telegram...";
      feedbackStatus.className = "form-status";

      try {
        await sendLeadToTelegram({
          type: "feedback",
          title: "Зворотний зв'язок перед футером",
          fields: {
            "Ім'я": name,
            "Телефон або email": contact,
            "Повідомлення": message
          }
        });

        feedbackStatus.textContent = "Дякуємо. Повідомлення відправлено в Telegram.";
        feedbackStatus.className = "form-status is-success";
        feedbackForm.reset();
      } catch (error) {
        feedbackStatus.textContent = "Не вдалося відправити в Telegram. Перевірте налаштування /api/telegram.";
        feedbackStatus.className = "form-status is-error";
      } finally {
        submitButton.disabled = false;
      }
    });
  }

  function setupCanvasScene() {
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    const palette = ["#0b72ff", "#ffbf1f", "#ff5d4d", "#11b6a8", "#ffffff"];
    let width = 0;
    let height = 0;
    let ratio = 1;
    let nodes = [];
    let docs = [];
    let rafId = null;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      nodes = Array.from({ length: Math.max(18, Math.floor(width / 62)) }, (_, index) => ({
        x: (index * 97) % width,
        y: 48 + ((index * 71) % Math.max(240, height - 120)),
        vx: ((index % 3) - 1) * 0.12,
        vy: ((index % 4) - 1.5) * 0.08,
        color: palette[index % palette.length],
        size: 3 + (index % 4)
      }));

      docs = Array.from({ length: 9 }, (_, index) => ({
        x: width * (0.42 + (index % 3) * 0.15),
        y: 78 + Math.floor(index / 3) * 142,
        w: 76 + (index % 2) * 18,
        h: 96 + (index % 3) * 12,
        color: palette[(index + 1) % palette.length],
        phase: index * 0.7
      }));
    }

    function drawFactory(baseY) {
      ctx.save();
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = "#061a3c";
      ctx.beginPath();
      ctx.moveTo(width * 0.58, baseY);
      ctx.lineTo(width * 0.58, baseY - 82);
      ctx.lineTo(width * 0.64, baseY - 116);
      ctx.lineTo(width * 0.64, baseY - 82);
      ctx.lineTo(width * 0.72, baseY - 128);
      ctx.lineTo(width * 0.72, baseY - 82);
      ctx.lineTo(width * 0.88, baseY - 82);
      ctx.lineTo(width * 0.88, baseY);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.36)";
      for (let i = 0; i < 6; i += 1) {
        ctx.fillRect(width * 0.61 + i * 38, baseY - 58, 18, 18);
      }
      ctx.restore();
    }

    function drawDocument(doc, time) {
      const floatY = Math.sin(time * 0.0015 + doc.phase) * 10;

      ctx.save();
      ctx.translate(doc.x, doc.y + floatY);
      ctx.rotate(Math.sin(time * 0.001 + doc.phase) * 0.035);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.strokeStyle = "rgba(255,255,255,0.34)";
      ctx.lineWidth = 2;
      roundedRect(-doc.w / 2, -doc.h / 2, doc.w, doc.h, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = doc.color;
      ctx.globalAlpha = 0.82;
      roundedRect(-doc.w / 2 + 14, -doc.h / 2 + 20, doc.w * 0.56, 8, 3);
      ctx.fill();
      ctx.globalAlpha = 0.34;
      roundedRect(-doc.w / 2 + 14, -doc.h / 2 + 42, doc.w * 0.68, 7, 3);
      ctx.fill();
      roundedRect(-doc.w / 2 + 14, -doc.h / 2 + 62, doc.w * 0.46, 7, 3);
      ctx.fill();
      ctx.restore();
    }

    function roundedRect(x, y, w, h, radius) {
      const r = Math.min(radius, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    function drawRoutes(time) {
      ctx.save();
      ctx.lineWidth = 2;
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < -20) node.x = width + 20;
        if (node.x > width + 20) node.x = -20;
        if (node.y < 20 || node.y > height - 40) node.vy *= -1;

        const next = nodes[(i + 4) % nodes.length];
        const pulse = 0.18 + Math.sin(time * 0.002 + i) * 0.08;
        ctx.strokeStyle = `rgba(255,255,255,${pulse})`;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(next.x, next.y);
        ctx.stroke();

        ctx.fillStyle = node.color;
        ctx.globalAlpha = 0.82;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawShield(time) {
      const x = width * 0.78;
      const y = height * 0.35;
      const size = Math.min(150, width * 0.13);

      ctx.save();
      ctx.translate(x, y + Math.sin(time * 0.0012) * 8);
      ctx.fillStyle = "rgba(255,191,31,0.82)";
      ctx.strokeStyle = "rgba(255,255,255,0.52)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.62);
      ctx.lineTo(size * 0.54, -size * 0.34);
      ctx.lineTo(size * 0.42, size * 0.42);
      ctx.lineTo(0, size * 0.72);
      ctx.lineTo(-size * 0.42, size * 0.42);
      ctx.lineTo(-size * 0.54, -size * 0.34);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = "#061a3c";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(-size * 0.22, 0);
      ctx.lineTo(-size * 0.04, size * 0.2);
      ctx.lineTo(size * 0.26, -size * 0.18);
      ctx.stroke();
      ctx.restore();
    }

    function render(time) {
      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, "#061a3c");
      bg.addColorStop(0.48, "#0b4fa2");
      bg.addColorStop(1, "#09a995");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.globalAlpha = 0.42;
      ctx.fillStyle = "#ffbf1f";
      ctx.fillRect(width * 0.68, 0, 18, height);
      ctx.fillStyle = "#ff5d4d";
      ctx.fillRect(width * 0.72, 0, 12, height);
      ctx.restore();

      drawFactory(height - 36);
      drawRoutes(time);
      docs.forEach((doc) => drawDocument(doc, time));
      drawShield(time);

      if (!reduceMotion) {
        rafId = requestAnimationFrame(render);
      }
    }

    resize();
    render(0);
    window.addEventListener("resize", () => {
      resize();
      if (reduceMotion) {
        render(0);
      }
    });

    window.addEventListener("beforeunload", () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    });
  }

  window.addEventListener("scroll", handleHeader, { passive: true });
  handleHeader();
  setupBlockAnimations();
  setupReveal();
  setupTabs();
  setupScrollTopButton();
  setupQuickForm();
  setupLeadForm();
  setupFeedbackForm();
  setupCanvasScene();
})();
