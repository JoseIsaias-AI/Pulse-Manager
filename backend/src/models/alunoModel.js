const alunos = [
  {
    id: 1,
    nome: "Maria Silva",
    cpf: "12345678901",
    email: "maria.silva@pulsemais.org",
    telefone: "11987654321",
    programa: "Mentoria de permanência",
    status: "atenção",
    mentor: "Juliana Rocha",
    ultimaAtualização: "2026-04-26",
    histórico: [
      "Participou do encontro de mentoria em 20/04.",
      "Sinalizou dificuldade financeira no check-in mensal.",
      "Aceitou acompanhamento para recolocação acadêmica."
    ]
  },
  {
    id: 2,
    nome: "João Pereira",
    cpf: "98765432100",
    email: "joao.pereira@pulsemais.org",
    telefone: "11999887766",
    programa: "Jornada de empregabilidade",
    status: "ativo",
    mentor: "Lucas Mendonça",
    ultimaAtualização: "2026-04-24",
    histórico: [
      "Concluiu oficina de currículo.",
      "Presença consistente nas últimas 4 atividades."
    ]
  },
  {
    id: 3,
    nome: "Ana Costa",
    cpf: "45612378901",
    email: "ana.costa@pulsemais.org",
    telefone: "21992345678",
    programa: "Portal de acompanhamento",
    status: "egresso",
    mentor: "Renata Farias",
    ultimaAtualização: "2026-04-18",
    histórico: [
      "Ingressou no ensino superior em 2026.",
      "Seguimento movido para trilha de egresso."
    ]
  },
  {
    id: 4,
    nome: "Luana Santos",
    cpf: "32165498700",
    email: "luana.santos@pulsemais.org",
    telefone: "11994443322",
    programa: "Mentoria de permanência",
    status: "ativo",
    mentor: "Juliana Rocha",
    ultimaAtualização: "2026-04-25",
    histórico: [
      "Finalizou a trilha de organização de estudos.",
      "Manteve frequência estável nas últimas atividades."
    ]
  },
  {
    id: 5,
    nome: "Carlos Henrique",
    cpf: "65498732100",
    email: "carlos.henrique@pulsemais.org",
    telefone: "21995557788",
    programa: "Jornada de empregabilidade",
    status: "ativo",
    mentor: "Lucas Mendonça",
    ultimaAtualização: "2026-04-23",
    histórico: [
      "Atualizou o currículo com apoio da mentoria.",
      "Confirmou participação em processo seletivo parceiro."
    ]
  }
];

function listAlunos() {
  return alunos;
}

function findAlunoById(id) {
  return alunos.find((aluno) => aluno.id === id) || null;
}

function createAluno(payload) {
  const novoAluno = {
    id: alunos.length + 1,
    nome: payload.nome,
    cpf: payload.cpf,
    email: payload.email,
    telefone: payload.telefone,
    programa: payload.programa,
    status: payload.status,
    mentor: payload.mentor || "A definir",
    ultimaAtualização: new Date().toISOString().slice(0, 10),
    histórico: ["Cadastro inicial realizado pela equipe Pulse Mais."]
  };

  alunos.push(novoAluno);
  return novoAluno;
}

module.exports = {
  listAlunos,
  findAlunoById,
  createAluno
};
