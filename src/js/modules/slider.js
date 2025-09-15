export default function slider() {
  const root = document.querySelector('.what');
  if (!root) return;

  const pets = Array.from(root.querySelectorAll('.what__pets .what__pet'));
  const texts = Array.from(root.querySelectorAll('.text_wrapper .text'));
  const btnPrev = root.querySelector('.control_button-left');
  const btnNext = root.querySelector('.control_button-right');

  if (pets.length === 0 || texts.length === 0 || !btnPrev || !btnNext) return;

  let index = Math.max(
    0,
    pets.findIndex(el => el.classList.contains('active'))
  );
  if (index === -1) index = 0;

  const TEXT_ANIM_MS = 350;
  let locked = false;

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

  pets.forEach((p, i) => {
    p.style.cursor = 'pointer';
    p.addEventListener('click', () => go(i));
  });

  root.setAttribute('tabindex', '0');
  root.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') go(index - 1);
    if (e.key === 'ArrowRight') go(index + 1);
  });
}
