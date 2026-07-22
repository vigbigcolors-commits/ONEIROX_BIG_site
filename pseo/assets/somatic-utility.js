/**
 * Client gauges for somatic utilities — values seeded from data-* on body.
 */
(function () {
  const root = document.body;
  if (!root) return;

  function bind(name, dataKey) {
    const wrap = document.querySelector('[data-gauge="' + name + '"]');
    if (!wrap) return;
    const input = wrap.querySelector('input[type="range"]');
    const output = wrap.querySelector("output");
    if (!input || !output) return;
    const initial = root.getAttribute(dataKey);
    if (initial != null && initial !== "") {
      input.value = initial;
      output.textContent = initial;
    }
    input.addEventListener("input", function () {
      output.textContent = input.value;
    });
  }

  bind("atonia", "data-gauge-atonia");
  bind("arousal", "data-gauge-arousal");
  bind("coherence", "data-gauge-coherence");
})();
