// slider.js
export default function slider() {
  const root = document.querySelector('.what');
  if (!root) return;

  initDesktop(root);
  initMobile(root);
}

/* ========================= DESKTOP ========================= */
function initDesktop(root) {
  const scope = root.querySelector('.text_wrapper-desktop');
  if (!scope) return;

  const pets = Array.from(scope.querySelectorAll('.what__pets .what__pet'));
  const texts = Array.from(
    scope.querySelectorAll('.text_wrapper .text, .text')
  ); // на случай вложенности
  const btnPrev = scope.querySelector('.control_button-left');
  const btnNext = scope.querySelector('.control_button-right');

  if (pets.length === 0 || texts.length === 0 || !btnPrev || !btnNext) return;

  let index = Math.max(
    0,
    pets.findIndex(el => el.classList.contains('active'))
  );
  if (index === -1) index = 0;

  const TEXT_ANIM_MS = 350;
  let locked = false;

  // плавность текста (если не вынесено в CSS)
  texts.forEach((t, i) => {
    t.style.transition = `opacity ${TEXT_ANIM_MS}ms ease, transform ${TEXT_ANIM_MS}ms ease`;
    t.style.willChange = 'opacity, transform';
    if (i === index) {
      t.style.opacity = '1';
      t.style.transform = 'translateY(0)';
      t.classList.add('active');
      t.setAttribute('aria-hidden', 'false');
    } else {
      t.style.opacity = '0';
      t.style.transform = 'translateY(6px)';
      t.classList.remove('active');
      t.setAttribute('aria-hidden', 'true');
    }
  });

  pets.forEach((p, i) => {
    p.classList.toggle('active', i === index);
    p.setAttribute('aria-current', i === index ? 'true' : 'false');
    p.style.cursor = 'pointer';
    p.addEventListener('click', () => go(i));
  });

  function go(to) {
    if (locked) return;
    const next = (to + pets.length) % pets.length;
    if (next === index) return;

    locked = true;

    pets[index].classList.remove('active');
    pets[next].classList.add('active');

    const prevText = texts[index];
    const nextText = texts[next];

    prevText.style.opacity = '0';
    prevText.style.transform = 'translateY(6px)';
    prevText.classList.remove('active');
    prevText.setAttribute('aria-hidden', 'true');

    requestAnimationFrame(() => {
      nextText.classList.add('active');
      nextText.setAttribute('aria-hidden', 'false');
      nextText.style.transform = 'translateY(6px)';
      nextText.style.opacity = '0';
      requestAnimationFrame(() => {
        nextText.style.transform = 'translateY(0)';
        nextText.style.opacity = '1';
      });
    });

    setTimeout(() => {
      index = next;
      locked = false;
    }, TEXT_ANIM_MS);
  }

  btnPrev.addEventListener('click', () => go(index - 1));
  btnNext.addEventListener('click', () => go(index + 1));

  scope.setAttribute('tabindex', '0');
  scope.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') go(index - 1);
    if (e.key === 'ArrowRight') go(index + 1);
  });
}

/* ========================= MOBILE (free scroll + динамическая opacity) ========================= */
function initMobile(root) {
  const scope = root.querySelector('.text_wrapper-mobile');
  if (!scope) return;

  const track = scope.querySelector('.what__pets');
  if (!track) return;

  const slides = Array.from(track.querySelectorAll('.what__pet'));
  if (slides.length === 0) return;

  const MAX_CARD_W = 267;
  const GAP = 10;

  // убираем snap
  track.style.scrollSnapType = 'none';
  track.style.overflowX = 'auto';
  track.style.display = 'flex';
  track.style.gap = GAP + 'px';
  track.style.scrollBehavior = 'auto'; // свободный скролл

  let cardW = MAX_CARD_W;

  const applyStyles = () => {
    cardW = Math.min(MAX_CARD_W, scope.clientWidth - 1);
    slides.forEach(s => {
      s.style.flex = `0 0 ${cardW}px`;
      s.style.width = `${cardW}px`;
      s.style.transition = 'opacity 0.15s linear';
    });
    updateOpacity();
  };

  const updateOpacity = () => {
    const leftEdge = track.scrollLeft;
    slides.forEach((s, i) => {
      const slideLeft = i * (cardW + GAP);
      const dist = Math.max(0, slideLeft - leftEdge);
      // 0px → 1.0, 200px → ~0.5, дальше → 0.3
      const op = Math.max(0.3, 1 - dist / (cardW * 1.2));
      s.style.opacity = op.toFixed(2);
    });
  };

  // дебаунс через rAF
  let ticking = false;
  track.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateOpacity();
        ticking = false;
      });
      ticking = true;
    }
  });

  // свайп мышью / пальцем (pointer events)
  let downId = null;
  let startX = 0;
  let startScroll = 0;
  track.addEventListener('pointerdown', e => {
    downId = e.pointerId;
    startX = e.clientX;
    startScroll = track.scrollLeft;
    track.setPointerCapture(downId);
  });

  track.addEventListener('pointermove', e => {
    if (downId == null) return;
    const dx = startX - e.clientX;
    track.scrollLeft = startScroll + dx;
  });

  track.addEventListener('pointerup', e => {
    if (downId == null) return;
    track.releasePointerCapture(downId);
    downId = null;
  });

  // при ресайзе пересчёт ширин
  window.addEventListener('resize', applyStyles);

  applyStyles();
  updateOpacity();
}
