(() => {
  const systems = document.querySelectorAll("[data-rm-sys]");
  systems.forEach((el) => {
    const btn = el.querySelector(".rm-sys__btn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const open = el.classList.contains("is-open");
      systems.forEach((s) => {
        s.classList.remove("is-open", "is-active");
        const b = s.querySelector(".rm-sys__btn");
        if (b) b.setAttribute("aria-expanded", "false");
      });
      if (!open) {
        el.classList.add("is-open", "is-active");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  const scrub = document.getElementById("rm-night-scrub");
  const blocks = [...document.querySelectorAll("[data-rm-ep]")];
  const readout = document.getElementById("rm-night-readout");
  if (!scrub || !blocks.length || !readout) return;

  const episodes = [
    { min: 90, dur: 10, label: "First REM (~90 min after sleep onset)" },
    { min: 180, dur: 18, label: "Second REM — narrative densifies" },
    { min: 270, dur: 28, label: "Third REM — emotional consolidation window" },
    { min: 360, dur: 45, label: "Pre-dawn REM — longest hardware pass" },
  ];

  function paint(t) {
    const minutes = Number(t);
    let active = episodes[0];
    blocks.forEach((b, i) => {
      const ep = episodes[i];
      const start = ep.min;
      const end = ep.min + ep.dur;
      const lit = minutes >= start;
      b.classList.toggle("is-lit", lit);
      b.style.height = `${18 + ep.dur * 0.7}px`;
      b.style.width = `${Math.min(22, 6 + ep.dur * 0.28)}%`;
      b.style.left = `${(start / 480) * 100}%`;
      if (minutes >= start && minutes <= end + 20) active = ep;
      if (minutes >= start) active = ep;
    });
    readout.innerHTML = `<strong>${active.label}</strong> · episode length ~${active.dur} min · scrub at night-minute <strong>${minutes}</strong>`;
  }

  scrub.addEventListener("input", () => paint(scrub.value));
  paint(scrub.value);
})();
