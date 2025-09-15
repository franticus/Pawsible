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

/* ========================= MOBILE (свайп) ========================= */
function initMobile(root) {
  const scope = root.querySelector('.text_wrapper-mobile');
  if (!scope) return;

  const track = scope.querySelector('.what__pets');
  if (!track) return;

  const slides = Array.from(track.querySelectorAll('.what__pet'));
  if (slides.length === 0) return;

  // базовые стили для «слайдера» на мобильном без правки SCSS
  scope.style.overflow = 'hidden';
  track.style.display = 'flex';
  track.style.flexDirection = 'row';
  track.style.overflowX = 'auto';
  track.style.scrollSnapType = 'x mandatory';
  track.style.scrollBehavior = 'smooth';
  track.style.scrollbarWidth = 'none'; // Firefox (визуально)
  track.style.gap = '0'; // цельные слайды

  // чтобы iOS не «упруго» прыгал
  track.addEventListener('touchmove', () => {}, { passive: true });

  // размеры
  const applySlideStyles = () => {
    const w = scope.clientWidth;
    slides.forEach((s, i) => {
      s.style.flex = '0 0 100%';
      s.style.width = w + 'px';
      s.style.scrollSnapAlign = 'start';
      s.style.transition = 'opacity 200ms ease';
      s.style.opacity = i === current ? '1' : '0.5';
    });
  };

  // стартовый индекс по .active
  let current = Math.max(
    0,
    slides.findIndex(s => s.classList.contains('active'))
  );
  if (current === -1) current = 0;

  // выставить стартовую позицию
  const snapTo = i => {
    current = (i + slides.length) % slides.length;
    track.scrollTo({ left: current * scope.clientWidth, behavior: 'smooth' });
    slides.forEach((s, idx) => {
      s.classList.toggle('active', idx === current);
      s.style.opacity = idx === current ? '1' : '0.5';
      s.setAttribute('aria-current', idx === current ? 'true' : 'false');
    });
  };

  // при ресайзе пересчитать ширину и «приклеиться» к текущему
  const onResize = () => {
    applySlideStyles();
    track.scrollLeft = current * scope.clientWidth;
  };
  window.addEventListener('resize', onResize);

  // определить текущий по положению скролла (округляем)
  let scrollTimer;
  track.addEventListener(
    'scroll',
    () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const i = Math.round(track.scrollLeft / scope.clientWidth);
        if (i !== current) {
          current = i;
          slides.forEach((s, idx) => {
            s.classList.toggle('active', idx === current);
            s.style.opacity = idx === current ? '1' : '0.5';
          });
        }
      }, 80); // «дебаунс» окончания прокрутки
    },
    { passive: true }
  );

  // поддержка свайпа «броском» (Pointer события)
  let startX = 0;
  let startScroll = 0;
  let isPointerDown = false;

  track.addEventListener('pointerdown', e => {
    isPointerDown = true;
    startX = e.clientX;
    startScroll = track.scrollLeft;
    track.setPointerCapture(e.pointerId);
  });

  track.addEventListener('pointermove', e => {
    if (!isPointerDown) return;
    const dx = startX - e.clientX;
    track.scrollLeft = startScroll + dx;
  });

  track.addEventListener('pointerup', e => {
    if (!isPointerDown) return;
    isPointerDown = false;
    track.releasePointerCapture(e.pointerId);

    const dx = startX - e.clientX;
    const threshold = scope.clientWidth * 0.15; // 15% ширины для перелистывания
    if (dx > threshold) {
      snapTo(current + 1);
    } else if (dx < -threshold) {
      snapTo(current - 1);
    } else {
      snapTo(current); // вернуть на место
    }
  });

  // клик по слайду — тоже перейти (если захотите)
  slides.forEach((s, i) => {
    s.style.cursor = 'pointer';
    s.addEventListener('click', () => snapTo(i));
  });

  // первичная инициализация
  applySlideStyles();
  // если .active не первый — прокрутим к нему
  if (current !== 0) {
    track.scrollLeft = current * scope.clientWidth;
  }
}
