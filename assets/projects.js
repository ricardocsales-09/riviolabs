// The six Rivio Labs projects. The home list and the product pages both read from here.
window.RIVIO_PROJECTS = [
  { id: "mamba", name: "MAMBA", title: "Multi-Agent Medical Billing Audit",
    text: "Um orquestrador de agentes audita cada conta contra prontuário, contrato e princípios de auditoria. Cada ajuste chega com evidência e impacto financeiro, antes do faturamento.", mode: { flow: 1.25, swirl: 1.1, glosa: 0.26, gate: 0.52 } },
  { id: "automata", name: "Automata", title: "Agentes que operam qualquer interface web",
    text: "Uma demonstração humana vira automação de portal: um replay determinístico e um agente que segue quando a tela muda. Cada tarefa roda em lote, com evidência de cada passo.", mode: { flow: 1.5, swirl: 0.6, glosa: 0.2, gate: 0.66 } },
  { id: "denial-intelligence", name: "Denial Intelligence", title: "Inteligência agêntica sobre glosas",
    text: "Analisa cada glosa com o contexto completo da jornada do paciente e acompanha o comportamento de cada operadora, que muda a cada ciclo. Previne a glosa antes do envio e, quando ela vem, decide e monta o recurso com evidência.", mode: { flow: 0.9, swirl: 0.9, glosa: 0.36, gate: 0.6 } },
  { id: "atlas", name: "Atlas", title: "A camada que lê o hospital",
    text: "Lê e classifica toda a documentação do hospital, digital ou em papel. Prontuários, laudos, guias e autorizações viram fatos com fonte, prontos para a auditoria.", mode: { flow: 0.8, swirl: 1.5, glosa: 0.18, gate: 0.58 } },
  { id: "payer-model", name: "Payer Model", title: "O comportamento de cada operadora, conta a conta",
    text: "Tece contratos, tabelas de preço e o histórico de cada demonstrativo em uma malha de comportamento por operadora. Mostra o que ela aceita, o que glosa e o que reverte, antes do envio.", mode: { flow: 0.7, swirl: 0.5, glosa: 0.3, gate: 0.62 } },
  { id: "hospital-twin", name: "Hospital Twin", title: "Um gêmeo digital de cada hospital",
    text: "Uma ontologia de cada instituição: contas, itens, setores e prontuários com o mesmo significado. Agentes raciocinam sobre qualquer hospital sem integração sob medida.", mode: { flow: 1.0, swirl: 0.7, glosa: 0.22, gate: 0.54 } },
];
