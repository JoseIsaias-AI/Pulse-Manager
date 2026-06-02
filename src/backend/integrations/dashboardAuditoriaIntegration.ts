import { DashboardFiltroQuery } from '../models/dashboardModel';

interface DashboardAuditoriaPayload {
  fluxo: 'UC-14';
  endpoint: string;
  filtros: DashboardFiltroQuery;
  total: number;
}

export async function registrarConsultaDashboard(
  payload: DashboardAuditoriaPayload
): Promise<void> {
  if (!process.env.AUDITORIA_URL_DASHBOARD) {
    return;
  }

  await fetch(process.env.AUDITORIA_URL_DASHBOARD, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}
