// ============================================================
// configPsicologo.js — configuração white-label para o Psicólogo
// ============================================================

const pulseConfig = {

  role: 'Psicólogo',

  menu: [
    { id: 'inicio',    icon: 'ti-home',      label: 'Início'    },
    { id: 'alunos',    icon: 'ti-users',     label: 'Alunos'    },
    { id: 'dashboard', icon: 'ti-chart-bar', label: 'Dashboard' },
    { id: 'atualizacoes', icon: 'ti-bell-ringing', label: 'Atualizações' },
    { id: 'configuracoes', icon: 'ti-settings', label: 'Configurações' }
  ],

  quickAccess: [
    { label: 'Turma',        value: 'Engenharia T4', accent: true },
    { label: 'Sessões Hoje', value: '3 sessões' }
  ],

  user: {
    name:     'João Mário',
    role:     'Psicólogo',
    initials: 'JM'
  },

  topBar: {
    breadcrumb:  'Início',
    avatarColor: '#33B458'
  }

};
