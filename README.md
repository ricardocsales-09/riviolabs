# Rivio Labs

Site do Rivio Labs, a frente de pesquisa em IA da Rivio. Publicado em https://ricardocsales-09.github.io/riviolabs/ (GitHub Pages, a partir da branch `main`).

Este README tem duas partes: o memo que explica o que é o Rivio Labs e por que ele existe, e as notas técnicas para quem mexe no site.

---

## Memo · Rivio Labs

**Para:** time da Rivio, liderança e quem for contribuir com o site
**De:** Bruno Brasil (Produto) e Ricardo Sales (People)
**Data:** setembro de 2026
**Status:** rascunho para discussão

### 1. A tese em uma frase

O Rivio Labs faz pesquisa em IA dentro de uma operação hospitalar real, e esse é o motivo pelo qual uma engenheira ou um pesquisador sério deveria escolher trabalhar aqui.

### 2. O que é o Rivio Labs

A Rivio opera o ciclo de receita de hospitais: auditoria de contas, faturamento, conciliação e recurso de glosa. Absorvemos a operação inteira e somos remunerados sobre o que o hospital efetivamente recebe. Software, IA e especialistas rodam o serviço de ponta a ponta.

O Rivio Labs é a frente que constrói os agentes e as camadas de contexto por trás dessa operação. Ele vive dentro do produto: é o nome do trabalho de pesquisa aplicada que acontece ali, e o lugar público onde mostramos esse trabalho.

O site existe para uma coisa acima de todas: atrair talento técnico. Da technical staff sênior a programas de estágio e fellowship para estudantes do ITA, da Poli-USP, da Unicamp e de universidades de fora. Hospitais, operadoras e investidores também vão chegar ao site. Eles precisam sair com a impressão de rigor, mas a copy é escrita primeiro para quem constrói.

### 3. Por que isso é diferente

Em IA aplicada, o gargalo saiu do modelo e foi para a avaliação. A pergunta difícil deixou de ser se o modelo lê um prontuário e passou a ser como saber se a decisão que ele tomou sobre aquele prontuário estava certa.

Na saúde, a resposta chega em camadas, cada uma com sua latência e seu ruído: o ajuste do auditor em horas, o consenso com a operadora em dias, o demonstrativo em semanas, o desfecho do recurso em meses, e às vezes um estorno escondido como item negativo em outra conta.

Quem vende software para hospital vê o ERP e raramente vê o desfecho. A operadora vê o desfecho sem o prontuário completo. Uma consultoria vê uma amostra por alguns meses. A Rivio vê o ciclo inteiro, porque responde pelo resultado. Cada conta auditada, cada glosa revertida ou aceita e cada demonstrativo que volta vira um rótulo amarrado à decisão que o originou.

Esse é o moat do Labs, e é o argumento que o site precisa carregar. Um lab de big tech não tem esse dado. Uma healthtech de software puro também não.

Há ainda uma questão de incentivo. Quem ganha sobre o valor recebido aprende rápido que cobrar a mais sai caro: vira glosa, recurso e desgaste com a operadora. O objetivo de todo agente que construímos é a conta correta, e isso também é uma função objetivo bem definida.

### 4. A arquitetura

O trabalho se organiza em duas camadas sobre uma ontologia.

**A ontologia** é o modelo formal do ciclo de receita: conta, item, atendimento, remessa, operadora, contrato, glosa, recurso, e como eles se relacionam e mudam de estado. O objeto mais importante dela é o registro de decisão. Toda vez que uma pessoa ou um agente inclui um item, exclui um item, aceita uma glosa ou decide recorrer, a decisão fica gravada com a evidência consultada e a regra aplicada. É esse registro que transforma trabalho operacional em dado de treino e de avaliação.

**A camada de contexto** converte o mundo do hospital em objetos confiáveis:

- **Atlas** lê e classifica toda a documentação do hospital, digital ou em papel, e devolve fatos com a página de onde vieram.
- **Hospital Twin** é a ontologia de cada instituição. Traduz a codificação própria de cada hospital para uma língua comum, para que agentes raciocinem sobre qualquer hospital sem integração sob medida.
- **Payer Model** tece contratos, tabelas de preço e o histórico de cada demonstrativo em uma malha de comportamento por operadora: o que ela aceita, o que glosa e o que reverte em recurso.

**A camada de agentes** raciocina e age sobre esses objetos:

- **MAMBA** (Multi-Agent Medical Billing Audit) audita cada conta antes do faturamento. Um agente orquestrador decide como dividir cada conta: um agente para a conta inteira, agentes por grupo de receita, por tarefa ou criados sob demanda. Cada ajuste cita o prontuário, o contrato e o princípio de auditoria que o sustenta.
- **Denial Intelligence** analisa cada glosa com o contexto completo da jornada do paciente e acompanha o comportamento de cada operadora, que muda a cada ciclo. Previne a glosa antes do envio e, quando ela vem, decide e monta o recurso com evidência.
- **Automata** executa operações em qualquer interface web de forma autônoma. Uma demonstração humana vira um replay determinístico e um executor agêntico que segue funcionando quando a interface muda.

O que fecha o sistema é o retorno: toda ação de agente volta para a ontologia como um novo registro de decisão, o desfecho da operadora é amarrado a ela meses depois, e o próximo agente começa sabendo um pouco mais. A operação melhora os modelos sem um esforço separado de rotulagem.

### 5. Como trabalhamos

- **Evidência em toda decisão.** Nenhum ajuste sem a fonte que o sustenta. Sem evidência suficiente, o resultado vira pendência e diz o que falta.
- **Humanos onde o julgamento muda o resultado.** Casos de alto impacto ou de baixa confiança vão para um especialista. O resto segue automatizado.
- **Medir antes de afirmar.** Cada composição de agentes é comparada à auditoria humana e a uma execução de modelo único. A arquitetura que fica é a que acerta mais pelo menor custo, mesmo que não se pareça com a forma como humanos organizam o trabalho.
- **Cada erro tem um endereço.** Toda divergência é diagnosticada até a camada que falhou: dado, ferramenta, princípio, agente, o próprio auditor, ou ambiguidade real.
- **Confiança calibrada.** A confiança que um agente declara precisa corresponder à taxa real de acerto. É isso que decide o que vai para revisão humana.

### 6. O que ainda não sabemos

Os problemas em aberto são a melhor parte do pitch para quem queremos atrair, e o site vai mostrá-los assim que estiverem revisados:

- Aprender com sinal atrasado e enviesado: o desfecho de um recurso chega meses depois e só existe para o que foi contestado.
- Medir acerto sem gabarito, quando a referência humana também erra.
- Descobrir a divisão de trabalho que um modelo precisa, em vez de copiar a do auditor.
- Manter a ontologia fiel ao hospital real, com sistemas que mudam sem avisar.
- Fazer o conhecimento e a calibração transferirem de um hospital para o próximo.

### 7. O site hoje

- **Home** no estilo do Ramp Labs: um campo de pontos animado, o título e a lista dos seis produtos. Passar o mouse mostra o que cada um faz; clicar abre a página do produto.
- **Seis páginas de produto** com tese, o que muda, um cenário ilustrativo, antes e depois, e o convite para as oportunidades. A seção de problemas em aberto já está escrita e fica oculta até ser revisada.
- **Blog** com dois ensaios em rascunho: "O rótulo mais caro da saúde" e "Quando o auditor discorda do modelo".
- **Carreiras** aponta para https://rivio-kvsite-v2.pages.dev/carreiras.

A copy segue um guia de voz próprio: ambição alta e tom baixo, concretude antes de abstração, resultado no fim da frase e honestidade sobre o que não funciona. Não usamos vocabulário de hype nem construções que qualquer concorrente poderia assinar.

### 8. O que o site não pode publicar

O site é público. Nenhuma página cita clientes, operadoras, fornecedores de tecnologia, modelos usados, nomes de sistemas internos, pessoas, volumes internos ou valores reais. Os números dos cenários são fictícios e marcados como ilustrativos. Os números dos posts do blog ainda são exemplos, marcados no código com `MOCKUP` e `VALIDAR`, e precisam ser trocados por dados com fonte antes da divulgação.

### 9. Próximos passos

1. Ativar o GitHub Pages em `main` para o site ter um link público.
2. Trocar os dados de exemplo dos dois ensaios por números reais, com fonte, e definir autoria.
3. Revisar e publicar a seção de problemas em aberto das páginas de produto.
4. Validar com o time técnico os nomes públicos dos produtos e a direção do MAMBA com agente orquestrador.
5. Decidir o domínio próprio do Labs e a versão em inglês, que é essencial para o público internacional.

---

## Notas técnicas

Site estático, sem build e sem dependências além da fonte Funnel Display (Google Fonts).

### Rodar localmente

```bash
python3 -m http.server 8000
```

Depois abra http://localhost:8000.

### Estrutura

- `index.html`: a home, com o terreno de pontos, a lista de projetos e o painel do blog.
- `<projeto>/index.html`: uma página por projeto (`mamba`, `automata`, `denial-intelligence`, `atlas`, `payer-model`, `hospital-twin`).
- `blog/<post>/index.html`: uma página por post do blog.
- `assets/projects.js`: nome, título e texto de cada projeto. A home e as páginas leem daqui.
- `assets/base.css`: cores, fonte e peças comuns a todas as páginas.
- `assets/product.css` e `assets/product.js`: layout, módulos e navegação das páginas de projeto.
- `assets/fields.js`: as animações de pontos da capa de cada projeto (uma variante por projeto, escolhida pelo `data-visual` do `<canvas>`).

Cada página de projeto define sua cor de destaque no `style` do `<body>` (`--accent` e `--accent-rgb`).

### Conteúdo

- A seção "Problemas em aberto" de cada página de projeto está no HTML, mas oculta com o atributo `hidden`. Para exibi-la, remova o atributo da `<section>`.
- Os cenários da seção "Na prática" são ilustrativos: números, códigos e valores são fictícios.
- O painel do blog lista só os posts da lista `POSTS` (no script do `index.html`) que têm `href`. Os demais ficam ocultos até ganharem uma página.
- Nos posts, dados ainda não confirmados estão marcados com `<!-- MOCKUP [DADO: ...] -->` e aparecem destacados em laranja. Pontos a validar estão em `<!-- VALIDAR: ... -->`.
