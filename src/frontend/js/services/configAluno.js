// ============================================================
// configAluno.js — configuração white-label para o Aluno
// ============================================================

const pulseConfig = {

  role: 'Aluno',

  menu: [
    { id: 'inicio',    icon: 'ti-home',      label: 'Início'    },
    { id: 'dashboard', icon: 'ti-chart-bar', label: 'Dashboard' },
    { id: 'agenda',    icon: 'ti-calendar',  label: 'Agenda'    }
  ],

  quickAccess: [],

  user: {
    name:     'Marianne Oliveira',
    role:     'Aluno',
    initials: 'MO'
  },

  topBar: {
    breadcrumb:  'Início',
    avatarColor: '#33B458'
  }

};
