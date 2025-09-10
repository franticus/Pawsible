export default function initReviewsSlider() {
  const wrap = document.querySelector('.numbers__content');
  if (!wrap) return;

  function onEnter(e) {
    const card = e.target.closest('.numbers__content__card');
    if (!card) return;
    wrap.classList.add('is-hover');
    wrap
      .querySelectorAll('.numbers__content__card.is-active')
      .forEach(n => n.classList.remove('is-active'));
    card.classList.add('is-active');
  }

  function onLeave() {
    wrap.classList.remove('is-hover');
    wrap
      .querySelectorAll('.numbers__content__card.is-active')
      .forEach(n => n.classList.remove('is-active'));
  }

  function enable() {
    wrap.addEventListener('mouseenter', onEnter, true);
    wrap.addEventListener('mouseleave', onLeave);
  }

  function disable() {
    wrap.removeEventListener('mouseenter', onEnter, true);
    wrap.removeEventListener('mouseleave', onLeave);
    wrap.classList.remove('is-hover');
    wrap
      .querySelectorAll('.numbers__content__card.is-active')
      .forEach(n => n.classList.remove('is-active'));
  }

  const sync = () => (window.innerWidth >= 900 ? enable() : disable());

  sync();
  window.addEventListener('resize', sync);
}
