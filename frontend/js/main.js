import { initDashboardPage } from "./pages/dashboard.js";

const pageName = document.body.dataset.page;

if (pageName === "dashboard") {
  initDashboardPage();
}
