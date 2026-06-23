(function () {
  'use strict';

  const routes = {
    'inicioGestor.html': ['gestorApp.html', 'inicio'],
    'listaAlunos.html': ['gestorApp.html', 'alunos'],
    'dashboardGestor.html': ['gestorApp.html', 'dashboard'],
    'agendaGestor.html': ['gestorApp.html', 'agenda'],
    'inicioPsicologo.html': ['psicologoApp.html', 'inicio'],
    'portal-psicologo.html': ['psicologoApp.html', 'inicio'],
    'dashboardPsicologo.html': ['psicologoApp.html', 'dashboard'],
    'inicioAluno.html': ['alunoApp.html', 'inicio'],
    'portal-aluno.html': ['alunoApp.html', 'inicio'],
    'dashboardAluno.html': ['alunoApp.html', 'dashboard'],
    'agendaAluno.html': ['alunoApp.html', 'agenda']
  };

  const page = window.location.pathname.split('/').pop();
  const route = routes[page];
  if (!route) return;

  const target = new URL(route[0], window.location.href);
  target.searchParams.set('view', route[1]);
  window.location.replace(target.href);
})();
