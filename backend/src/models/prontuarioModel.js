const prontuarios = [
  {
    id: 1,
    aluno: "Maria Silva",
    gravidade: "alta",
    registro: "Relato de sobrecarga emocional e pedido de escuta individual.",
    data: "2026-04-25"
  },
  {
    id: 2,
    aluno: "João Pereira",
    gravidade: "media",
    registro: "Baixa energia e faltas pontuais apos troca de trabalho.",
    data: "2026-04-22"
  },
  {
    id: 3,
    aluno: "Ana Costa",
    gravidade: "baixa",
    registro: "Registro de fechamento do acompanhamento com encaminhamento positivo.",
    data: "2026-04-18"
  }
];

function listProntuarios() {
  return prontuarios;
}

module.exports = {
  listProntuarios
};
