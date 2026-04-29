const comunicacoes = [
  {
    id: 1,
    segmento: "Alunos com baixa frequência",
    assunto: "Check-in de acompanhamento",
    mensagem: "Convite para conversa breve com a equipe.",
    data: "2026-04-21"
  },
  {
    id: 2,
    segmento: "Egressos",
    assunto: "Pesquisa de impacto",
    mensagem: "Questionario de acompanhamento trimestral.",
    data: "2026-04-19"
  }
];

function listComunicacoes() {
  return comunicacoes;
}

function createComunicacao(payload) {
  const item = {
    id: comunicacoes.length + 1,
    segmento: payload.segmento,
    assunto: payload.assunto,
    mensagem: payload.mensagem,
    data: new Date().toISOString().slice(0, 10)
  };

  comunicacoes.unshift(item);
  return item;
}

module.exports = {
  listComunicacoes,
  createComunicacao
};
