function app() {
  // Helpers de inicialização
  const alimentosBase = [
    { nome: 'Arroz cozido', unidade: 'g', kcal: 130, prot: 2.5, carb: 28, gord: 0.3 },
    { nome: 'Feijão carioca cozido', unidade: 'g', kcal: 76, prot: 4.8, carb: 14, gord: 0.5 },
    { nome: 'Peito de frango grelhado', unidade: 'g', kcal: 165, prot: 31, carb: 0, gord: 3.6 },
    { nome: 'Ovo cozido', unidade: 'un', kcal: 68, prot: 6, carb: 0.6, gord: 4.8 },
    { nome: 'Aveia em flocos', unidade: 'g', kcal: 389, prot: 17, carb: 66, gord: 7 },
    { nome: 'Banana prata', unidade: 'un', kcal: 89, prot: 1.1, carb: 23, gord: 0.3 }
  ];

  const refeicoesDefault = () => [
    { nome: 'Café da manhã', itens: [], tot: { kcal: 0, prot: 0, carb: 0, gord: 0 } },
    { nome: 'Lanche da manhã', itens: [], tot: { kcal: 0, prot: 0, carb: 0, gord: 0 } },
    { nome: 'Almoço', itens: [], tot: { kcal: 0, prot: 0, carb: 0, gord: 0 } },
    { nome: 'Lanche da tarde', itens: [], tot: { kcal: 0, prot: 0, carb: 0, gord: 0 } },
    { nome: 'Jantar', itens: [], tot: { kcal: 0, prot: 0, carb: 0, gord: 0 } },
    { nome: 'Ceia', itens: [], tot: { kcal: 0, prot: 0, carb: 0, gord: 0 } }
  ];

  const sessoesDefault = (div = 'ABC') => {
    if (div === 'ABC') return ['A', 'B', 'C'];
    if (div === 'AB') return ['A', 'B'];
    if (div === 'Full body') return ['Full 1', 'Full 2', 'Full 3'];
    return ['Superior', 'Inferior'];
  };

  const sessoesDadosDefault = lista => lista.map(n => ({ nome: n, exercicios: [], volume: 0 }));

  return {
    // === UI ===
    theme: 'light',
    toasts: [], // substitui `toast: ''`
    modo: 'solo', // 'solo' | 'acompanhar'

    // === Atendimento ===
    atendimentoId: 124,
    status: 'Em andamento',
    paciente: { nome: 'Carla Lima', objetivo: 'Perda de peso', avatar: 'https://i.pravatar.cc/100?img=36' },

    // === Steps ===
    steps: ['Anamnese', 'Avaliação', 'Plano de Dieta', 'Plano de Treino', 'Feedback & Ajustes', 'Finalização'],
    step: 0,
    treinoTab: 0, // índice da aba ativa
    
    // === Dados ===
    alimentosBase,
    filteredAlimentos: [], // lista de sugestões
    dados: {
      anamnese: { historico: '', alergias: '', restricoes: '' },
      avaliacao: { peso: null, altura: null, imc: '', bf: null },
      dieta: { kcal: 2000, proteina: 120, carbo: 200, gordura: 60, obs: '', refeicoes: refeicoesDefault() },
      treino: { divisao: 'ABC', sessoes: 4, obs: '', sessoesLista: sessoesDefault(), sessoesDados: sessoesDadosDefault(sessoesDefault()) },
      feedback: { paciente: '', ajustes: '' },
      finalizacao: { confirmado: false }
    },

    // === Formulários auxiliares ===
    alimentoForm: { refeicao: 'Café da manhã', nome: '', qtd: 100, unidade: 'g', kcal: 0, prot: 0, carb: 0, gord: 0 },
    exForm: { sessao: 'A', nome: '', series: 3, reps: 10, carga: 0 },

    // === Totais computados ===
    totaisDieta: { kcal: 0, prot: 0, carb: 0, gord: 0 },
    totaisTreino: { exercicios: 0, volume: 0 },

    // === Métodos utilitários ===
    fmt(n) { return (n || 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 }); },
    notify(msg, tempo = 1600) {
      const id = Date.now(); // id único
      this.toasts.push({ id, msg });
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id);
      }, tempo);
    },
    notas: '',

    // === Navegação ===
    setStep(i) { if (this.modo === 'solo') this.step = i; },
    next() { if (this.modo === 'solo' && this.step < this.steps.length - 1) this.step++; },
    prev() { if (this.modo === 'solo' && this.step > 0) this.step--; },
    saveStep() { this.notify(this.modo === 'solo' ? `Etapa "${this.steps[this.step]}" salva` : 'Modo acompanhamento: somente leitura'); },
    finalizar() { if (this.dados.finalizacao.confirmado) { this.status = 'Concluído'; this.notify('Atendimento finalizado'); } },

    // === Avaliação ===
    calcularIMC() {
      const p = parseFloat(this.dados.avaliacao.peso);
      const a = parseFloat(this.dados.avaliacao.altura);
      if (!p || !a) return this.dados.avaliacao.imc = '';
      const imc = p / ((a / 100) ** 2);
      this.dados.avaliacao.imc = imc ? imc.toFixed(1) : '';
    },

    // quando muda o alimento selecionado
    updateAlimentoForm() {
      const base = this.alimentosBase.find(a => a.nome === this.alimentoForm.nome);
      if (!base) return;

      // Sempre aplica a qtd padrão conforme a unidade
      this.alimentoForm.qtd = base.unidade === "un" ? 1 : 100;

      const fator = this.alimentoForm.qtd / 100;
      this.alimentoForm.unidade = base.unidade;
      this.alimentoForm.kcal = +(base.kcal * fator).toFixed(1);
      this.alimentoForm.prot = +(base.prot * fator).toFixed(1);
      this.alimentoForm.carb = +(base.carb * fator).toFixed(1);
      this.alimentoForm.gord = +(base.gord * fator).toFixed(1);
    },

    // quando muda a qtd
    updateQtd() {
      this.updateAlimentoForm();
    },

    // === Dieta ===
    addAlimento() {
      if (!this.alimentoForm.nome) return;
      const ref = this.dados.dieta.refeicoes.find(r => r.nome === this.alimentoForm.refeicao);
      if (!ref) return;

      ref.itens.push({ ...this.alimentoForm });
      this.alimentoForm = { refeicao: 'Café da manhã', nome: '', qtd: 100, unidade: 'g', kcal: 0, prot: 0, carb: 0, gord: 0 };

      this.recalcDieta();
      this.notify('Alimento adicionado', 1200);
    },
    rmAlimento(rIdx, idx) { this.dados.dieta.refeicoes[rIdx].itens.splice(idx, 1); this.recalcDieta(); },
    recalcDieta() {
      this.totaisDieta = { kcal: 0, prot: 0, carb: 0, gord: 0 };
      this.dados.dieta.refeicoes.forEach(ref => {
        ref.tot = ref.itens.reduce((tot, it) => ({
          kcal: tot.kcal + (+it.kcal || 0),
          prot: tot.prot + (+it.prot || 0),
          carb: tot.carb + (+it.carb || 0),
          gord: tot.gord + (+it.gord || 0)
        }), { kcal: 0, prot: 0, carb: 0, gord: 0 });

        Object.keys(this.totaisDieta).forEach(k => this.totaisDieta[k] += ref.tot[k]);
      });
    },

    // === Treino ===
    montarSessoes() {
      this.dados.treino.sessoesLista = sessoesDefault(this.dados.treino.divisao);
      this.dados.treino.sessoesDados = sessoesDadosDefault(this.dados.treino.sessoesLista);
      this.exForm.sessao = this.dados.treino.sessoesLista[0];
      this.recalcTreino();
    },
    addExercicio() {
      if (!this.exForm.nome) return;
      const sess = this.dados.treino.sessoesDados.find(s => s.nome === this.exForm.sessao);
      if (!sess) return;

      sess.exercicios.push({ ...this.exForm });
      this.exForm = { sessao: this.dados.treino.sessoesLista[0], nome: '', series: 3, reps: 10, carga: 0 };

      this.recalcTreino();
      this.notify('Exercício adicionado', 1200);
    },
    rmExercicio(sIdx, idx) { this.dados.treino.sessoesDados[sIdx].exercicios.splice(idx, 1); this.recalcTreino(); },
    recalcTreino() {
      this.totaisTreino = { exercicios: 0, volume: 0 };
      this.dados.treino.sessoesDados.forEach(s => {
        s.volume = s.exercicios.reduce((vol, e) => vol + (e.series * e.reps * e.carga || 0), 0);
        this.totaisTreino.exercicios += s.exercicios.length;
        this.totaisTreino.volume += s.volume;
      });
    },

    // === Gerais ===
    resetar() {
      this.step = 0; this.status = 'Em andamento';
      this.dados.anamnese = { historico: '', alergias: '', restricoes: '' };
      this.dados.avaliacao = { peso: null, altura: null, imc: '', bf: null };
      this.dados.dieta = { kcal: 2000, proteina: 120, carbo: 200, gordura: 60, obs: '', refeicoes: refeicoesDefault() };
      this.alimentoForm = { refeicao: 'Café da manhã', nome: '', qtd: 100, unidade: 'g', kcal: 0, prot: 0, carb: 0, gord: 0 };
      this.totaisDieta = { kcal: 0, prot: 0, carb: 0, gord: 0 };

      this.dados.treino = { divisao: 'ABC', sessoes: 4, obs: '', sessoesLista: sessoesDefault(), sessoesDados: sessoesDadosDefault(sessoesDefault()) };
      this.exForm = { sessao: 'A', nome: '', series: 3, reps: 10, carga: 0 };
      this.totaisTreino = { exercicios: 0, volume: 0 };

      this.notify('Workflow reiniciado');
    },
    cancelar() { this.status = 'Concluído'; this.notify('Atendimento cancelado'); }
  };
}
