# Rivio Labs

Site do Rivio Labs, a casa da pesquisa em IA da Rivio.

Publicado em https://ricardocsales-09.github.io/riviolabs/ (GitHub Pages, a partir da branch `main`).

Site estático, sem build e sem dependências além da fonte Funnel Display (Google Fonts).

## Rodar localmente

```bash
python3 -m http.server 8000
```

Depois abra http://localhost:8000.

## Estrutura

- `index.html`: a home, com o terreno de pontos e a lista de projetos.
- `<projeto>/index.html`: uma página por projeto (`mamba`, `automata`, `denial-intelligence`, `atlas`, `payer-model`, `hospital-twin`).
- `assets/projects.js`: nome, título e texto de cada projeto. A home e as páginas leem daqui.
- `assets/base.css`: cores, fonte e peças comuns a todas as páginas.
- `assets/product.css` e `assets/product.js`: layout, módulos e navegação das páginas de projeto.
- `assets/fields.js`: as animações de pontos da capa de cada projeto (uma variante por projeto, escolhida pelo `data-visual` do `<canvas>`).

Cada página de projeto define sua cor de destaque no `style` do `<body>` (`--accent` e `--accent-rgb`).

## Conteúdo

Os cenários da seção "Na prática" de cada projeto são ilustrativos: números, códigos e valores são fictícios. Os posts do blog ainda são exemplos; para editar, altere a lista `POSTS` no script no fim do `index.html`.
