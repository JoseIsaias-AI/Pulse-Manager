function getResumo() {
  return {
    frequenciaMedia: 87,
    atividadesConcluidas: 142,
    eventosRealizados: 12,
    alertas: [
      "3 alunos sem check-in ha mais de 14 dias.",
      "2 atividades com presenca abaixo da meta."
    ]
  };
}

module.exports = {
  getResumo
};
