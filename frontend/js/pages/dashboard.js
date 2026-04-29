const STUDENTS = [
  {
    nome: "Maria Silva",
    mentor: "Juliana Rocha",
    risco: "alto",
    frequencia: 54,
    engajamento: 38,
    sinal: "Queda brusca de frequência e relato emocional",
    acao: "Agendar escuta individual e revisar plano de permanência",
    nota: "Apresenta sinais claros de evasão se a rede de apoio não for ativada nesta semana."
  },
  {
    nome: "João Pereira",
    mentor: "Lucas Mendonça",
    risco: "medio",
    frequencia: 67,
    engajamento: 58,
    sinal: "Faltas pontuais após troca de trabalho",
    acao: "Reorganizar agenda e reforçar contato com mentor",
    nota: "Ainda responde bem ao acompanhamento, mas a rotina nova pode escalar para evasão."
  },
  {
    nome: "Ana Costa",
    mentor: "Renata Farias",
    risco: "baixo",
    frequencia: 88,
    engajamento: 82,
    sinal: "Jornada estabilizada e boa resposta",
    acao: "Manter acompanhamento leve e registrar avanços",
    nota: "Caso com sinal positivo de permanência e fechamento de ciclo bem-sucedido."
  },
  {
    nome: "Luana Santos",
    mentor: "Juliana Rocha",
    risco: "alto",
    frequencia: 49,
    engajamento: 44,
    sinal: "Baixa conexão com atividades e pressão financeira",
    acao: "Acionar apoio social e priorizar trilha de permanência",
    nota: "Perfil com vulnerabilidade alta e baixa previsibilidade de permanência no curto prazo."
  },
  {
    nome: "Carlos Henrique",
    mentor: "Lucas Mendonça",
    risco: "medio",
    frequencia: 73,
    engajamento: 69,
    sinal: "Oscilação em entregas e motivação instável",
    acao: "Fazer check-in semanal e vincular meta prática",
    nota: "Pode permanecer bem se o acompanhamento continuar próximo e orientado à meta."
  }
];

const RISK_LABELS = {
  alto: "Risco alto",
  medio: "Risco médio",
  baixo: "Risco baixo"
};

const MONTHLY_ATTENDANCE = [
  { mes: "Jan", valor: 82 },
  { mes: "Fev", valor: 79 },
  { mes: "Mar", valor: 76 },
  { mes: "Abr", valor: 72 },
  { mes: "Mai", valor: 74 },
  { mes: "Jun", valor: 66 }
];

const ATTENTION_FACTORS = [
  { label: "Queda de frequência", value: 80, tone: "yellow" },
  { label: "Pressão financeira", value: 68, tone: "blue" },
  { label: "Sobrecarga emocional", value: 72, tone: "yellow" },
  { label: "Baixo engajamento", value: 61, tone: "green" }
];

const JOURNEY_SUMMARY = [
  { label: "Retenção projetada", value: 74, tone: "green" },
  { label: "Base em observação", value: 46, tone: "yellow" },
  { label: "Necessitam ação imediata", value: 28, tone: "blue" }
];

function getRiskChipClass(risk) {
  if (risk === "alto") {
    return "risk-chip risk-chip--high";
  }

  if (risk === "medio") {
    return "risk-chip risk-chip--medium";
  }

  return "risk-chip risk-chip--low";
}

function average(values) {
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function countByRisk(risk) {
  return STUDENTS.filter((student) => student.risco === risk).length;
}

function renderKpis() {
  const total = STUDENTS.length;
  const highRisk = countByRisk("alto");
  const attendance = average(STUDENTS.map((student) => student.frequencia));
  const engagement = average(STUDENTS.map((student) => student.engajamento));

  document.getElementById("kpi-total").textContent = String(total);
  document.getElementById("kpi-high-risk").textContent = String(highRisk);
  document.getElementById("kpi-attendance").textContent = `${attendance}%`;
  document.getElementById("kpi-engagement").textContent = `${engagement}%`;
}

function renderRiskDistribution() {
  const container = document.getElementById("risk-distribution");

  if (!container) {
    return;
  }

  const distribution = [
    { label: "Risco alto", count: countByRisk("alto"), tone: "yellow" },
    { label: "Risco médio", count: countByRisk("medio"), tone: "blue" },
    { label: "Risco baixo", count: countByRisk("baixo"), tone: "green" }
  ];

  container.innerHTML = distribution
    .map((item) => {
      const width = (item.count / STUDENTS.length) * 100;

      return `
        <div class="bar-row">
          <div class="bar-row__top">
            <span>${item.label}</span>
            <strong>${item.count} aluno(s)</strong>
          </div>
          <div class="bar-track">
            <div class="bar-fill bar-fill--${item.tone}" style="width: ${width}%;"></div>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderFactors() {
  const container = document.getElementById("factor-distribution");

  if (!container) {
    return;
  }

  container.innerHTML = ATTENTION_FACTORS
    .map(
      (item) => `
        <div class="bar-row">
          <div class="bar-row__top">
            <span>${item.label}</span>
            <strong>${item.value}%</strong>
          </div>
          <div class="bar-track">
            <div class="bar-fill bar-fill--${item.tone}" style="width: ${item.value}%;"></div>
          </div>
        </div>
      `
    )
    .join("");
}

function renderAttendanceChart() {
  const container = document.getElementById("attendance-chart");

  if (!container) {
    return;
  }

  container.innerHTML = MONTHLY_ATTENDANCE
    .map(
      (item) => `
        <div class="month-bar">
          <span class="month-bar__value">${item.valor}%</span>
          <div class="month-bar__track">
            <div class="month-bar__fill" style="height: ${item.valor}%;"></div>
          </div>
          <span class="month-bar__label">${item.mes}</span>
        </div>
      `
    )
    .join("");
}

function renderAttendanceLine() {
  const container = document.getElementById("attendance-line");

  if (!container) {
    return;
  }

  const width = 640;
  const height = 240;
  const paddingX = 42;
  const top = 26;
  const bottom = 42;
  const maxValue = 100;
  const minValue = 55;
  const range = maxValue - minValue;

  const points = MONTHLY_ATTENDANCE.map((item, index) => {
    const x = paddingX + (index * (width - paddingX * 2)) / (MONTHLY_ATTENDANCE.length - 1);
    const normalized = (item.valor - minValue) / range;
    const y = height - bottom - normalized * (height - top - bottom);
    return { ...item, x, y };
  });

  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - bottom} L ${points[0].x} ${height - bottom} Z`;

  const gridLines = [60, 70, 80, 90].map((value) => {
    const y = height - bottom - ((value - minValue) / range) * (height - top - bottom);
    return `<line x1="${paddingX}" y1="${y}" x2="${width - paddingX}" y2="${y}"></line>`;
  });

  const labels = points
    .map(
      (point) => `
        <text class="line-chart__label" x="${point.x}" y="${height - 16}" text-anchor="middle">${point.mes}</text>
        <text class="line-chart__label" x="${point.x}" y="${point.y - 12}" text-anchor="middle">${point.valor}%</text>
      `
    )
    .join("");

  const dots = points
    .map((point) => `<circle class="line-chart__point" cx="${point.x}" cy="${point.y}" r="4"></circle>`)
    .join("");

  container.innerHTML = `
    <svg class="line-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Evolução da permanência projetada">
      <g class="line-chart__grid">${gridLines.join("")}</g>
      <path class="line-chart__area" d="${areaPath}"></path>
      <path class="line-chart__path" d="${linePath}"></path>
      ${dots}
      ${labels}
    </svg>
  `;
}

function renderJourneySummary() {
  const container = document.getElementById("journey-summary");

  if (!container) {
    return;
  }

  container.innerHTML = JOURNEY_SUMMARY
    .map(
      (item) => `
        <div class="progress-item">
          <div class="progress-item__top">
            <span>${item.label}</span>
            <strong>${item.value}%</strong>
          </div>
          <div class="bar-track">
            <div class="bar-fill bar-fill--${item.tone}" style="width: ${item.value}%;"></div>
          </div>
        </div>
      `
    )
    .join("");
}

function renderChartVariants() {
  const container = document.getElementById("chart-variants");

  if (!container) {
    return;
  }

  const total = STUDENTS.length;
  const variants = [
    {
      label: "Risco alto",
      value: Math.round((countByRisk("alto") / total) * 100),
      tone: "var(--color-yellow)"
    },
    {
      label: "Risco médio",
      value: Math.round((countByRisk("medio") / total) * 100),
      tone: "var(--color-blue)"
    },
    {
      label: "Risco baixo",
      value: Math.round((countByRisk("baixo") / total) * 100),
      tone: "var(--color-green)"
    }
  ];

  container.innerHTML = variants
    .map(
      (item) => `
        <article class="variant-card">
          <div class="variant-donut" style="--value: ${item.value}; --tone: ${item.tone};"></div>
          <strong class="variant-value">${item.value}%</strong>
          <span class="variant-label">${item.label}</span>
        </article>
      `
    )
    .join("");
}

function renderStudentTable() {
  const tbody = document.getElementById("student-table-body");

  if (!tbody) {
    return;
  }

  tbody.innerHTML = STUDENTS
    .map(
      (student) => `
        <tr>
          <td>
            <strong class="student-name">${student.nome}</strong>
            <span class="student-meta">Mentor: ${student.mentor}</span>
          </td>
          <td>
            <span class="${getRiskChipClass(student.risco)}">${RISK_LABELS[student.risco]}</span>
          </td>
          <td>${student.frequencia}%</td>
          <td>${student.engajamento}%</td>
          <td class="attention-text">${student.sinal}</td>
          <td class="action-text">${student.acao}</td>
        </tr>
      `
    )
    .join("");
}

function renderPriorityNotes() {
  const container = document.getElementById("priority-notes");

  if (!container) {
    return;
  }

  const priority = [...STUDENTS]
    .sort((left, right) => {
      const order = { alto: 0, medio: 1, baixo: 2 };
      return order[left.risco] - order[right.risco];
    })
    .slice(0, 3);

  container.innerHTML = priority
    .map(
      (student) => `
        <article class="note-item">
          <div class="note-item__top">
            <strong>${student.nome}</strong>
            <span class="${getRiskChipClass(student.risco)}">${RISK_LABELS[student.risco]}</span>
          </div>
          <p>${student.nota}</p>
        </article>
      `
    )
    .join("");
}

function refreshDashboard() {
  renderKpis();
  renderRiskDistribution();
  renderFactors();
  renderAttendanceChart();
  renderAttendanceLine();
  renderJourneySummary();
  renderChartVariants();
  renderStudentTable();
  renderPriorityNotes();
}

export function initDashboardPage() {
  const reloadButton = document.getElementById("reload-dashboard");

  if (reloadButton) {
    reloadButton.addEventListener("click", refreshDashboard);
  }

  refreshDashboard();
}
