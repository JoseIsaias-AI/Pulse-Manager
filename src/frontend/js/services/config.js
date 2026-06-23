// ============================================================
// config.js — arquivo de configuração white-label
// Edite apenas este arquivo para personalizar o menu lateral
// e o menu superior da aplicação
// ============================================================

const pulseConfig = {

  // Texto exibido em itálico abaixo do logo "PULSE MANAGER"
  role: 'Gestor',

  // Lista de itens do Menu Principal
  // id      → identificador da página (usado para marcar o item ativo ao clicar)
  // icon    → classe do ícone Tabler Icons (veja todos em tabler-icons.io)
  // label   → texto visível no menu
  menu: [
    { id: 'inicio',    icon: 'ti-home',       label: 'Início'    },
    { id: 'alunos',    icon: 'ti-users',      label: 'Alunos'    },
    { id: 'dashboard', icon: 'ti-chart-bar',  label: 'Dashboard' },
    { id: 'agenda',    icon: 'ti-calendar',   label: 'Agenda'    },
    { id: 'atualizacoes', icon: 'ti-bell-ringing', label: 'Atualizações' },
    { id: 'configuracoes', icon: 'ti-settings', label: 'Configurações' }
  ],

  // Cards exibidos na seção "Acesso Rápido"
  // label  → título pequeno do card (letras maiúsculas)
  // value  → valor principal exibido em destaque
  // accent → true adiciona borda azul à esquerda do card
  quickAccess: [
    { label: 'Turma Ativa',     value: 'Engenharia T4', accent: false },
    { label: 'Módulo atual',    value: 'Módulo 05',     accent: true  },
    { label: 'Total de Alunos', value: '48 alunos',     accent: false }
  ],

  // Dados do usuário exibidos no rodapé do menu lateral e no avatar do menu superior
  // name     → nome completo
  // role     → cargo exibido abaixo do nome
  // initials → até 2 letras exibidas nos avatares circulares
  user: {
    name:     'Vitória Brandão',
    role:     'Gestor',
    initials: 'VB'
  },

  // Configurações do Menu Superior (barra de topo)
  // breadcrumb  → nome da página inicial exibido na trilha de navegação
  //               (atualiza automaticamente ao clicar nos itens do menu lateral)
  // avatarColor → cor de fundo do círculo do avatar no canto superior direito
  topBar: {
    breadcrumb:  'Início',
    avatarColor: '#1A56DB'
  }

};
