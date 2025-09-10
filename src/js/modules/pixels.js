export default function Pixels() {
  const buttons = Array.from(document.querySelectorAll('.main__button'));
  if (!buttons.length) return;

  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = arr => arr[(Math.random() * arr.length) | 0];

  const state = new WeakMap();

  function setup(btn) {
    let left = btn.querySelector('.px-emitter.left');
    let right = btn.querySelector('.px-emitter.right');
    if (!left) {
      left = document.createElement('span');
      left.className = 'px-emitter left';
      btn.appendChild(left);
    }
    if (!right) {
      right = document.createElement('span');
      right.className = 'px-emitter right';
      btn.appendChild(right);
    }

    const s = { timers: [], hovered: false, left, right };
    state.set(btn, s);

    function spawnPixel(emitterEl, side) {
      const px = document.createElement('span');
      px.className = 'px';

      const h = btn.clientHeight - 5;
      const w = emitterEl.clientWidth || 14;

      const y = rand(2, h - 8);
      const x = rand(-w + 1, 1);

      const dur = rand(350, 700);
      const delay = rand(0, 120);
      const dy = pick([-10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10]);
      const scale = pick([1, 1, 1, 2]);

      px.style.top = `${y}px`;
      px.style.left = `${x}px`;
      px.style.transform = `scale(${scale})`;
      px.style.setProperty('--dy', `${dy}px`);
      px.style.animation = `${
        side === 'left' ? 'px-fly-left' : 'px-fly-right'
      } ${dur}ms linear ${delay}ms forwards`;

      if (Math.random() < 0.25)
        px.style.boxShadow = '0 0 0 1px rgba(255,255,255,.1) inset';

      emitterEl.appendChild(px);
      px.addEventListener('animationend', () => px.remove(), { once: true });
    }

    function start() {
      const st = state.get(btn);
      if (!st || st.hovered) return;
      st.hovered = true;

      // Частоты спауна — можно переопределить data-атрибутами
      const leftInt = Number(btn.dataset.pxIntervalLeft || 60);
      const rightInt = Number(btn.dataset.pxIntervalRight || 60);

      st.timers.push(setInterval(() => spawnPixel(st.left, 'left'), leftInt));
      st.timers.push(
        setInterval(() => spawnPixel(st.right, 'right'), rightInt)
      );

      // Всплески
      st.timers.push(
        setInterval(() => {
          if (!st.hovered) return;
          const burst = (em, side) => {
            const n = Number(btn.dataset.pxBurstMax || 5) - 0;
            const min = Number(btn.dataset.pxBurstMin || 2);
            const count = min + ((Math.random() * (n - min + 1)) | 0);
            for (let i = 0; i < count; i++)
              setTimeout(() => spawnPixel(em, side), i * 28);
          };
          Math.random() < 0.5
            ? burst(st.left, 'left')
            : burst(st.right, 'right');
        }, 1200)
      );
    }

    function stop() {
      const st = state.get(btn);
      if (!st) return;
      st.hovered = false;
      st.timers.forEach(clearInterval);
      st.timers = [];
      // текущие пиксели удалятся сами по окончании анимации
    }

    btn.addEventListener('mouseenter', start);
    btn.addEventListener('mouseleave', stop);
    btn.addEventListener('focus', start);
    btn.addEventListener('blur', stop);
  }

  buttons.forEach(setup);
}
