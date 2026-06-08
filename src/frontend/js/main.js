// Bootstrap leve para paginas que registram inicializadores globais.
const frontendWindow = window as Window & {
  pageName?: string;
  initDashboardPage?: () => void;
};

if (frontendWindow.pageName === 'dashboard' && typeof frontendWindow.initDashboardPage === 'function') {
  frontendWindow.initDashboardPage();
}
