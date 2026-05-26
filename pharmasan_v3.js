/* ============================================================
   PHARMASAN V3 · JavaScript
   Nav · Smooth scroll · Scroll reveal · Modales · Formularios
   Acordeón · PQRSDF · CV Upload · WCX align
   ============================================================ */

/* ── NAV ──────────────────────────────────────────────────── */
const nav       = document.getElementById('mainNav');
const hamburger = document.getElementById('navHamburger');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
});


/* ── SMOOTH SCROLL ────────────────────────────────────────── */
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothScrollTo(targetY, duration) {
  const startY = window.scrollY;
  const diff   = targetY - startY;
  if (Math.abs(diff) < 2) return;
  const startTime = performance.now();
  function step(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo({ top: startY + diff * easeInOutCubic(progress), behavior: 'instant' });
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const hash   = link.getAttribute('href');
    if (!hash || hash === '#') return;
    const target = document.querySelector(hash);
    if (!target) return;
    e.preventDefault();
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
    const navH    = nav.offsetHeight || 68;
    const targetY = target.getBoundingClientRect().top + window.scrollY - navH;
    smoothScrollTo(targetY, 1600);
    history.pushState(null, '', hash);
  });
});


/* ── SCROLL REVEAL ────────────────────────────────────────── */
if ('IntersectionObserver' in window) {
  document.body.classList.add('js-reveal');

  const cardEls = document.querySelectorAll(
    '.glass-card, .ben-card, .team-card, .cert-glass, .about-kpis, .accordion-item'
  );

  cardEls.forEach(el => {
    el.classList.add('reveal');
    const siblings = Array.from(el.parentNode.children).filter(c => c.classList.contains('reveal'));
    const idx = siblings.length - 1;
    if (idx > 0) el.dataset.revealDelay = idx;
  });

  document.querySelectorAll(
    '.section-head, .quality-text, .quality-visual, .about-text, ' +
    '.contact-info, .contact-glass-panel, .dom-glass, .sedes-map-box, .mv-grid, .about-imgs'
  ).forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      const delay = (target.dataset.revealDelay || 0) * 75;
      setTimeout(() => target.classList.add('is-visible'), delay);
      io.unobserve(target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -28px 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}


/* ── MODALES ──────────────────────────────────────────────── */
const modalMap = {
  usuarios:    'modalUsuarios',
  empresarial: 'modalEmpresarial',
  trabajo:     'modalTrabajo',
  pqrsdf:      'modalPqrsdf',
};

function openModal(type) {
  const id = modalMap[type] || 'modalUsuarios';
  const m  = document.getElementById(id);
  if (!m) return;
  m.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  document.body.style.overflow = '';
  resetTrabajo();
}

document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) closeModal(); });
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });


/* ── FORMULARIO GENÉRICO ──────────────────────────────────── */
function submitForm(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.modal-submit');
  btn.textContent      = '✓ Mensaje enviado';
  btn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
  btn.disabled = true;
  setTimeout(closeModal, 2000);
}


/* ── CV UPLOAD ────────────────────────────────────────────── */
(function initCvUpload() {
  const area = document.getElementById('cvUploadArea');
  if (!area) return;
  area.addEventListener('click', () => document.getElementById('cvFile').click());
  area.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') document.getElementById('cvFile').click();
  });
  area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('drag-over'); });
  area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
  area.addEventListener('drop', e => {
    e.preventDefault();
    area.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (!file) return;
    try {
      const dt = new DataTransfer();
      dt.items.add(file);
      document.getElementById('cvFile').files = dt.files;
    } catch (_) {}
    handleCvFile(file);
  });
})();

function handleCvFile(file) {
  const info = document.getElementById('cvFileInfo');
  const area = document.getElementById('cvUploadArea');
  if (!file) return;
  if (file.type !== 'application/pdf') {
    info.innerHTML = '<span style="color:#dc2626">⚠️ Solo se aceptan archivos PDF.</span>';
    area.classList.remove('has-file');
    document.getElementById('cvFile').value = '';
    return;
  }
  const MAX = 50 * 1024 * 1024;
  if (file.size > MAX) {
    info.innerHTML = '<span style="color:#dc2626">⚠️ El archivo supera el límite de 50 MB.</span>';
    area.classList.remove('has-file');
    document.getElementById('cvFile').value = '';
    return;
  }
  const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
  info.innerHTML = `<span style="color:var(--teal-dark)">✓ ${file.name} · ${sizeMB} MB</span>`;
  area.classList.add('has-file');
}

function resetTrabajo() {
  const form = document.getElementById('formTrabajo');
  if (form) {
    form.reset();
    const info = document.getElementById('cvFileInfo');
    const area = document.getElementById('cvUploadArea');
    const btn  = document.getElementById('btnSubmitEmpleo');
    if (info) info.innerHTML = '';
    if (area) area.classList.remove('has-file', 'drag-over');
    if (btn)  { btn.textContent = 'Enviar postulación'; btn.style.background = ''; btn.disabled = false; }
  }
}

async function submitEmpleo(e) {
  e.preventDefault();
  const form = e.target;
  const btn  = document.getElementById('btnSubmitEmpleo');
  const info = document.getElementById('cvFileInfo');
  const file = document.getElementById('cvFile').files[0];
  if (!file) {
    info.innerHTML = '<span style="color:#dc2626">⚠️ Debes adjuntar tu hoja de vida en PDF.</span>';
    return;
  }
  btn.textContent = 'Enviando…';
  btn.disabled    = true;
  try {
    const formData = new FormData(form);
    formData.set('_subject', `Postulación – ${form.nombres.value} ${form.apellidos.value} – ${form.cargo.value}`);
    formData.set('_replyto', form.email.value);
    const ENDPOINT = 'https://formspree.io/f/REEMPLAZA_CON_TU_ID';
    const res = await fetch(ENDPOINT, { method: 'POST', body: formData, headers: { Accept: 'application/json' } });
    if (res.ok) {
      btn.textContent      = '✓ Postulación enviada';
      btn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
      setTimeout(closeModal, 2200);
    } else throw new Error('server');
  } catch (_) {
    btn.textContent      = 'Error · inténtalo de nuevo';
    btn.style.background = 'linear-gradient(135deg,#ef4444,#dc2626)';
    setTimeout(() => {
      btn.textContent      = 'Enviar postulación';
      btn.style.background = '';
      btn.disabled         = false;
    }, 3000);
  }
}


/* ── ACORDEÓN DE SEDES ────────────────────────────────────── */
function toggleAccordion(id) {
  const item      = document.getElementById(id);
  if (!item) return;
  const accordion = item.closest('.sedes-accordion');
  if (!accordion) return;
  accordion.querySelectorAll('.accordion-item.open').forEach(open => {
    if (open.id !== id) open.classList.remove('open');
  });
  item.classList.toggle('open');
}

function generarSedesAccordion() {
  const accordion = document.querySelector('.sedes-accordion');
  if (!accordion || typeof SEDES_DATA === 'undefined') return;
  accordion.innerHTML = '';
  SEDES_DATA.forEach((dept) => {
    const deptId = `acc-${dept.departamento.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
    let html = `
      <div class="accordion-item" id="${deptId}">
        <button class="accordion-header" onclick="toggleAccordion('${deptId}')">
          <span>📌 ${dept.departamento}</span>
          <span class="acc-arrow">▾</span>
        </button>
        <div class="accordion-body">
          <div class="sedes-table-wrap">
            <table class="sedes-table">
              <thead><tr><th>Sede</th><th>Dirección</th><th>Teléfono</th><th>Lun – Vie</th><th>Sábado</th></tr></thead>
              <tbody>
    `;
    dept.ciudades.forEach(ciudad => {
      const nombreCelda = ciudad.mapsUrl
        ? `<a href="${ciudad.mapsUrl}" target="_blank" rel="noopener noreferrer" class="sede-map-link">📍 ${ciudad.nombre}</a>`
        : `<span class="sede-map-link" style="cursor:default">📍 ${ciudad.nombre}</span>`;
      html += `<tr>
        <td>${nombreCelda}</td>
        <td>${ciudad.direccion}</td>
        <td><a href="tel:${ciudad.telefonoLink}">${ciudad.telefono}</a></td>
        <td>${ciudad.lunVie || '—'}</td>
        <td>${ciudad.sabado || '—'}</td>
      </tr>`;
    });
    html += `</tbody></table></div></div></div>`;
    accordion.innerHTML += html;
  });
}

document.addEventListener('DOMContentLoaded', generarSedesAccordion);


/* ── PQRSDF ───────────────────────────────────────────────── */
function generarRadicado() {
  const now  = new Date();
  const yyyy = now.getFullYear();
  const mm   = String(now.getMonth() + 1).padStart(2, '0');
  const dd   = String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 9_000_000_000) + 1_000_000_000);
  return `${yyyy}${mm}${dd}${rand}`;
}

function resetPqrsdf() {
  const formWrap    = document.getElementById('pqrsdfFormWrap');
  const confirmWrap = document.getElementById('pqrsdfConfirmWrap');
  const form        = document.getElementById('formPqrsdf');
  const errTipo     = document.getElementById('pqrsdfTipoError');
  const btn         = document.getElementById('btnSubmitPqrsdf');
  if (!formWrap) return;
  if (form)    form.reset();
  if (errTipo) errTipo.textContent = '';
  if (btn)     { btn.textContent = 'Radicar solicitud'; btn.style.background = ''; btn.disabled = false; }
  formWrap.hidden    = false;
  confirmWrap.hidden = true;
  document.querySelectorAll('.pq-card').forEach(c => c.classList.remove('selected'));
}

const _origClose = closeModal;
closeModal = function () { _origClose(); resetPqrsdf(); };

document.querySelectorAll('.pq-opt input[type="radio"]').forEach(radio => {
  radio.addEventListener('change', () => {
    document.querySelectorAll('.pq-card').forEach(c => c.classList.remove('selected'));
    radio.closest('.pq-opt').querySelector('.pq-card').classList.add('selected');
    const err = document.getElementById('pqrsdfTipoError');
    if (err) err.textContent = '';
  });
});

async function submitPqrsdf(e) {
  e.preventDefault();
  const form    = e.target;
  const errTipo = document.getElementById('pqrsdfTipoError');
  const tipoRadio = form.querySelector('input[name="tipoPqrsdf"]:checked');
  if (!tipoRadio) { errTipo.textContent = '⚠️ Debes seleccionar el tipo de solicitud.'; return; }
  errTipo.textContent = '';
  const radicado = generarRadicado();
  document.getElementById('pqrsdfTipoConfirm').textContent  = tipoRadio.value;
  document.getElementById('pqrsdfNumRadicado').textContent   = radicado;
  document.getElementById('pqrsdfFormWrap').hidden    = true;
  document.getElementById('pqrsdfConfirmWrap').hidden = false;
  const ENDPOINT = 'https://formspree.io/f/REEMPLAZA_CON_TU_ID_PQRSDF';
  const payload  = new FormData(form);
  payload.set('_subject', `[${tipoRadio.value}] PQRSDF · ${form.nombres.value} ${form.apellidos.value} · ${radicado}`);
  payload.set('_replyto', form.email.value);
  payload.set('radicado', radicado);
  fetch(ENDPOINT, { method: 'POST', body: payload, headers: { Accept: 'application/json' } })
    .catch(() => {});
}


/* ── WIDGET WCX ALIGN ─────────────────────────────────────── */
(function alignWcx() {
  const RIGHT  = '32px';
  const BOTTOM = '32px';
  function tryAlign() {
    for (const el of document.querySelectorAll('body > div, body > iframe')) {
      const id  = (el.id  || '').toLowerCase();
      const cls = (el.className || '').toLowerCase();
      const src = (el.src || '').toLowerCase();
      if (id.includes('wcx') || cls.includes('wcx') || src.includes('wcx')) {
        const st = window.getComputedStyle(el);
        if (st.position === 'fixed') {
          el.style.setProperty('right',  RIGHT,  'important');
          el.style.setProperty('bottom', BOTTOM, 'important');
        }
      }
    }
  }
  let elapsed = 0;
  const timer = setInterval(() => {
    tryAlign();
    elapsed += 400;
    if (elapsed >= 8000) clearInterval(timer);
  }, 400);
})();
