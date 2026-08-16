/**
 * Client gauges + micro-PF for somatic utilities.
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

  /* Marker stepper */
  const stepper = document.querySelector("[data-module='stepper']");
  if (stepper) {
    const out = document.getElementById("sx-step-out");
    const boxes = stepper.querySelectorAll('input[type="checkbox"]');
    function sync() {
      let n = 0;
      boxes.forEach(function (b) {
        if (b.checked) n++;
      });
      if (out) {
        out.hidden = n === 0;
        if (n > 0) {
          out.textContent =
            n +
            " marker" +
            (n > 1 ? "s" : "") +
            " matched — open Lab Search with this somatic context.";
        }
      }
    }
    boxes.forEach(function (b) {
      b.addEventListener("change", sync);
    });
  }

  /* Useful vote — local only */
  const vote = document.querySelector("[data-module='useful_vote']");
  if (vote) {
    const key = "onx_sx_vote:" + location.pathname;
    const msg = vote.querySelector(".sx-vote__msg");
    try {
      if (localStorage.getItem(key) && msg) {
        msg.hidden = false;
        msg.textContent = "Already recorded on this device.";
      }
    } catch (e) {}
    vote.querySelectorAll("[data-vote]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        try {
          localStorage.setItem(
            key,
            JSON.stringify({ v: btn.getAttribute("data-vote"), ts: Date.now() })
          );
        } catch (e) {}
        if (msg) {
          msg.hidden = false;
          msg.textContent = "Saved on this device only.";
        }
      });
    });
  }
})();
