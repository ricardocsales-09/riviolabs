// Product pages: navigation between projects, reveal on scroll and the small animated modules.
(() => {
  document.documentElement.classList.add("js");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const projects = window.RIVIO_PROJECTS || [];
  const id = document.body.dataset.project;
  const i = projects.findIndex((p) => p.id === id);

  // Project index in the top bar and the "next project" link at the end.
  const index = document.querySelector(".p-index");
  if (index) {
    index.innerHTML = projects.map((p) =>
      `<li><a href="../${p.id}/"${p.id === id ? ' aria-current="page"' : ""}>${p.name}</a></li>`
    ).join("");
  }
  const next = document.querySelector("a.next");
  if (next && i >= 0) {
    const n = projects[(i + 1) % projects.length];
    next.href = `../${n.id}/`;
    next.innerHTML = `<span><small>Próximo projeto</small><strong>${n.name}</strong><em>${n.title}</em></span><span class="arrow" aria-hidden="true">→</span>`;
  }

  // Payer Model matrix: illustrative data, generated deterministically.
  const matrix = document.querySelector(".m-matrix tbody");
  if (matrix) {
    let seed = 9;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const rows = [
      ["Autorização", (m) => 0.35 + 0.25 * Math.sin(m * 0.9)],
      ["Documentação", (m) => 0.2 + m * 0.045],
      ["Tabela e preço", (m) => (m % 4 === 1 ? 0.8 : 0.25)],
      ["Cobertura", () => 0.15],
      ["Codificação", (m) => 0.5 - m * 0.025],
    ];
    matrix.innerHTML = rows.map(([name, fn]) => {
      let cells = "";
      for (let m = 0; m < 12; m++) {
        const v = Math.max(0.08, Math.min(1, fn(m) + (rnd() - 0.5) * 0.18));
        const d = (4 + v * 14).toFixed(1);
        cells += `<td><i style="width:${d}px;height:${d}px;opacity:${(0.25 + v * 0.7).toFixed(2)};transition-delay:${m * 40}ms"></i></td>`;
      }
      const f = Math.max(0.1, Math.min(1, fn(12)));
      const d = (4 + f * 14).toFixed(1);
      cells += `<td class="fc"><i style="width:${d}px;height:${d}px;transition-delay:560ms"></i></td>`;
      return `<tr><th scope="row">${name}</th>${cells}</tr>`;
    }).join("");
  }

  // Reveal sections and start modules when they come into view.
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add("in");
      io.unobserve(e.target);
      if (e.target.matches(".m-replay")) runReplay(e.target);
    }
  }, { threshold: 0.22 });
  document.querySelectorAll(".reveal, .module").forEach((el) => io.observe(el));

  // Automata module: the same recorded task replayed twice; on the second run the interface has changed.
  function runReplay(root) {
    const page = root.querySelector(".page");
    const cursor = root.querySelector(".cursor");
    const targets = [...root.querySelectorAll("[data-step]")];
    const rails = [...root.querySelectorAll(".rail")];
    const note = root.querySelector(".note");
    const at = (el) => {
      const a = page.getBoundingClientRect(), b = el.getBoundingClientRect();
      return `translate(${b.left - a.left + b.width / 2 - 7}px, ${b.top - a.top + b.height / 2 - 7}px)`;
    };
    const paint = (rail, n, fail) => rail.querySelectorAll(".steps i").forEach((s, k) => {
      s.className = k < n ? "done" : fail && k === n ? "fail" : "";
    });
    const wait = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
    const messages = [
      "Primeira execução: o fluxo gravado roda nos dois executores.",
      "A interface mudou: o botão de envio saiu do lugar.",
      "O replay determinístico não encontra o botão. O agente entende a intenção do passo e segue.",
    ];
    async function loop() {
      for (;;) {
        root.classList.remove("drift");
        rails.forEach((r) => paint(r, 0));
        note.textContent = messages[0];
        for (let k = 0; k < targets.length; k++) {
          cursor.style.transform = at(targets[k]);
          await wait(900);
          rails.forEach((r) => paint(r, k + 1));
        }
        await wait(1400);
        root.classList.add("drift");
        rails.forEach((r) => paint(r, 0));
        note.textContent = messages[1];
        await wait(1200);
        for (let k = 0; k < targets.length; k++) {
          cursor.style.transform = at(targets[k]);
          await wait(900);
          if (k === targets.length - 2) { paint(rails[0], k, true); note.textContent = messages[2]; }
          else if (k < targets.length - 2) paint(rails[0], k + 1);
          paint(rails[1], k + 1);
        }
        await wait(2600);
        if (reduce) return;
      }
    }
    loop();
  }
})();
