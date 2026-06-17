// Bootstrap leve para paginas que registram inicializadores globais.
if (window.pageName === 'dashboard' && typeof window.initDashboardPage === 'function') {
  window.initDashboardPage();
}
