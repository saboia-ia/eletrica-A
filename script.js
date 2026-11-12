/* =========================================================
   Eletrica A — interações da página
   - Header e menu mobile
   - Animações de entrada (IntersectionObserver)
   - Scrollspy das âncoras
   - Acordeão acessível do FAQ
   - Validação do formulário + envio para o WhatsApp
   ========================================================= */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Alternância de tema (claro/escuro) ---------- */
  const themeToggle = document.getElementById('theme-toggle');
  const themeMedia = window.matchMedia('(prefers-color-scheme: light)');

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function updateThemeButton(theme) {
    if (!themeToggle) return;
    const label = theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro';
    themeToggle.setAttribute('aria-label', label);
    themeToggle.setAttribute('title', label);
  }

  function applyTheme(theme, persist) {
    const next = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    updateThemeButton(next);

    // Cor da barra do navegador acompanha o tema
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', next === 'light' ? '#f7f4ec' : '#daa520');
    }

    if (persist) {
      try { localStorage.setItem('eletrica-theme', next); } catch (e) { /* armazenamento indisponível */ }
    }
  }

  if (themeToggle) {
    applyTheme(currentTheme(), false);

    themeToggle.addEventListener('click', function () {
      applyTheme(currentTheme() === 'light' ? 'dark' : 'light', true);
    });

    // Segue o sistema apenas enquanto o usuário não escolheu manualmente
    const onSystemThemeChange = function (event) {
      try {
        if (localStorage.getItem('eletrica-theme')) return;
      } catch (e) { /* segue o sistema */ }
      applyTheme(event.matches ? 'light' : 'dark', false);
    };

    if (typeof themeMedia.addEventListener === 'function') {
      themeMedia.addEventListener('change', onSystemThemeChange);
    } else if (typeof themeMedia.addListener === 'function') {
      themeMedia.addListener(onSystemThemeChange);
    }
  }

  /* ---------- Ano atual no rodapé ---------- */
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header ao rolar ---------- */
  const header = document.getElementById('site-header');
  let scrollTicking = false;

  function onScroll() {
    if (header) {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    }
    updateScrollSpy();

    scrollTicking = false;
  }

  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      window.requestAnimationFrame(onScroll);
      scrollTicking = true;
    }
  }, { passive: true });

  /* ---------- Menu mobile ---------- */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  function setMenu(open) {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    mobileMenu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      setMenu(!isOpen);
    });

    // Fecha ao clicar em um link do menu
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setMenu(false);
      });
    });

    // Fecha com Esc e devolve o foco ao botão
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuToggle.focus();
      }
    });

    // Fecha ao clicar fora do header
    document.addEventListener('click', function (event) {
      if (menuToggle.getAttribute('aria-expanded') !== 'true') return;
      if (!header.contains(event.target)) setMenu(false);
    });

    // Fecha se a tela passar para o layout desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024) setMenu(false);
    });
  }

  /* ---------- Scrollspy ---------- */
  const navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-nav]'));
  const spySections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));

  function updateScrollSpy() {
    if (!spySections.length || !navLinks.length) return;

    const marker = window.scrollY + 130;
    let currentId = '';

    spySections.forEach(function (section) {
      const top = section.offsetTop;
      if (top <= marker) currentId = section.id;
    });

    navLinks.forEach(function (link) {
      const target = link.getAttribute('href');
      if (currentId && target === '#' + currentId) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  /* ---------- Animações ao entrar na viewport ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -45px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Acordeão do FAQ ---------- */
  const faqButtons = Array.prototype.slice.call(document.querySelectorAll('.faq-trigger'));

  function setFaqState(button, open) {
    const panelId = button.getAttribute('aria-controls');
    const panel = document.getElementById(panelId);
    if (!panel) return;

    button.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('is-open', open);
    panel.setAttribute('aria-hidden', String(!open));
  }

  faqButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const isOpen = button.getAttribute('aria-expanded') === 'true';

      // Fecha os demais itens (acordeão)
      faqButtons.forEach(function (other) { setFaqState(other, false); });

      // Reabre apenas se o item clicado estava fechado
      if (!isOpen) setFaqState(button, true);
    });
  });

  /* ---------- Formulário de contato ---------- */
  const form = document.getElementById('contact-form');

  if (form) {
    const nome = document.getElementById('nome');
    const telefone = document.getElementById('telefone');
    const servico = document.getElementById('servico');
    const mensagem = document.getElementById('mensagem');
    const statusEl = document.getElementById('form-status');

    const fields = [nome, telefone, servico, mensagem].filter(Boolean);

    function digitsOnly(value) {
      return value.replace(/\D/g, '');
    }

    function errorElementFor(field) {
      const describedBy = field.getAttribute('aria-describedby');
      return describedBy ? document.getElementById(describedBy) : null;
    }

    function setError(field, message) {
      field.setAttribute('aria-invalid', 'true');
      const errorEl = errorElementFor(field);
      if (errorEl) errorEl.textContent = message;
    }

    function clearError(field) {
      field.removeAttribute('aria-invalid');
      const errorEl = errorElementFor(field);
      if (errorEl) errorEl.textContent = '';
    }

    function validateField(field) {
      if (!field) return true;
      const value = field.value.trim();

      if (field === nome) {
        if (value.length < 3) {
          setError(field, 'Informe seu nome completo (pelo menos 3 letras).');
          return false;
        }
      }

      if (field === telefone) {
        const digits = digitsOnly(value);
        if (digits.length < 10 || digits.length > 11) {
          setError(field, 'Informe um telefone com DDD, por exemplo (11) 98888-8888.');
          return false;
        }
      }

      if (field === servico && !value) {
        setError(field, 'Selecione o tipo de serviço.');
        return false;
      }

      if (field === mensagem && value.length < 5) {
        setError(field, 'Descreva brevemente o que você precisa.');
        return false;
      }

      clearError(field);
      return true;
    }

    // Máscara de telefone enquanto digita
    if (telefone) {
      telefone.addEventListener('input', function () {
        let digits = digitsOnly(telefone.value).slice(0, 11);

        if (digits.length > 10) {
          telefone.value = '(' + digits.slice(0, 2) + ') ' + digits.slice(2, 7) + '-' + digits.slice(7);
        } else if (digits.length > 6) {
          telefone.value = '(' + digits.slice(0, 2) + ') ' + digits.slice(2, 6) + '-' + digits.slice(6);
        } else if (digits.length > 2) {
          telefone.value = '(' + digits.slice(0, 2) + ') ' + digits.slice(2);
        } else if (digits.length > 0) {
          telefone.value = '(' + digits;
        }
      });
    }

    // Limpa o erro ao corrigir o campo
    fields.forEach(function (field) {
      const eventName = field.tagName === 'SELECT' ? 'change' : 'input';
      field.addEventListener(eventName, function () {
        if (field.getAttribute('aria-invalid') === 'true') clearError(field);
        if (statusEl) {
          statusEl.textContent = '';
          statusEl.className = 'form-status mt-4';
        }
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      let firstInvalid = null;

      fields.forEach(function (field) {
        const valid = validateField(field);
        if (!valid && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        if (statusEl) {
          statusEl.textContent = 'Revise os campos destacados para continuar.';
          statusEl.className = 'form-status is-error mt-4';
        }
        firstInvalid.focus();
        return;
      }

      const text = 'Olá, Eletrica A! Meu nome é ' + nome.value.trim() +
        '. Telefone/WhatsApp: ' + telefone.value.trim() +
        '. Serviço: ' + servico.value +
        '. Mensagem: ' + mensagem.value.trim();

      const url = 'https://wa.me/5511988840073?text=' + encodeURIComponent(text);

      // Abre em nova aba; se o navegador bloquear, usa a aba atual.
      const opened = window.open(url, '_blank');
      if (opened) {
        opened.opener = null;
      } else {
        window.location.href = url;
      }

      if (statusEl) {
        statusEl.textContent = 'Tudo certo! Abrimos o WhatsApp com a sua mensagem preenchida.';
        statusEl.className = 'form-status is-success mt-4';
      }

      form.reset();
      fields.forEach(clearError);
    });
  }

  /* ---------- Estado inicial ---------- */
  onScroll();
})();
