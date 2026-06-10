# Definição dos testes unitários de service

## Objetivo

Definir os testes unitários que serão implementados para a camada de service do backend. Esses testes devem validar as regras de negócio de forma isolada, utilizando dados mockados e sem acessar banco de dados real, Supabase, PostgreSQL, rotas ou controllers.

## Padrão dos testes

- Os testes devem ser criados em `src/tests/unit/services`.
- Os arquivos devem seguir o padrão `*.service.test.ts`.
- As dependências dos services devem ser mockadas com `jest.fn()`.
- Os repositories devem ser simulados por mocks.
- Integrações de auditoria também devem ser mockadas quando existirem.
- Os testes devem ser independentes entre si.
- Os mocks devem ser limpos entre os testes.
- Todos os testes devem executar com sucesso via `npm run test`.

## Quantidade total

Serão definidos **110 testes unitários de service**, distribuídos entre os principais services ligados aos endpoints ativos do backend.

| Service | Quantidade de testes |
| --- | ---: |
| `AlunoService` | 13 |
| `SegmentacaoService` | 9 |
| `DashboardService` | 14 |
| `JornadaService` | 23 |
| `SaudeMentalService` | 11 |
| `AgendaService` | 12 |
| `NotificacaoService` | 15 |
| `PortalAlunoService` | 13 |
| **Total** | **110** |

## AlunoService

1. Listar alunos com filtros.
2. Cadastrar aluno com payload válido.
3. Normalizar email para letras minúsculas.
4. Rejeitar cadastro com nome inválido.
5. Rejeitar cadastro com email inválido.
6. Rejeitar cadastro com idade fora do intervalo permitido.
7. Rejeitar cadastro com data de ingresso inválida.
8. Rejeitar cadastro com email já existente.
9. Obter perfil de aluno existente.
10. Rejeitar busca de aluno inexistente.
11. Atualizar aluno existente.
12. Rejeitar atualização com dados inválidos.
13. Inativar aluno existente.

## SegmentacaoService

1. Segmentar alunos com critério válido.
2. Retornar total, filtros aplicados e lista de alunos.
3. Rejeitar segmentação sem critérios.
4. Rejeitar limite menor que 1 ou não inteiro.
5. Rejeitar limite maior que 100.
6. Rejeitar status inválido.
7. Rejeitar risco de evasão inválido.
8. Rejeitar busca com menos de 3 caracteres.
9. Registrar auditoria da consulta de segmentação.

## DashboardService

1. Calcular resumo de impacto.
2. Calcular percentuais com duas casas decimais.
3. Retornar percentual zero quando não houver alunos.
4. Agrupar impacto por programa.
5. Calcular resumo de jornada.
6. Identificar alunos evadidos.
7. Retornar indicador de alunos empregados.
8. Retornar indicador de conclusão de programas.
9. Retornar indicador de acesso ao ensino superior.
10. Retornar resumo de evasão e risco sem `porPrograma`.
11. Rejeitar programa ou categoria com menos de 3 caracteres.
12. Rejeitar datas fora do formato `YYYY-MM-DD`.
13. Rejeitar data final anterior a data inicial.
14. Registrar auditoria da consulta de dashboard.

## JornadaService

1. Rejeitar id de aluno inválido.
2. Rejeitar aluno inexistente.
3. Consolidar dados gerais da jornada do aluno.
4. Separar frequências de atividades do tipo aula.
5. Separar participacões de atividades do tipo evento.
6. Mapear anotações qualitativas.
7. Criar registro de frequência.
8. Atualizar registro de frequência existente.
9. Rejeitar frequência para atividade que não sejá aula.
10. Rejeitar nota fora do intervalo de 0 a 10.
11. Rejeitar data de participação inválida.
12. Registrar participação em evento.
13. Rejeitar participação duplicada em evento.
14. Rejeitar participação quando a atividade não for evento.
15. Atualizar dados de empregabilidade.
16. Rejeitar ocupação inválida.
17. Rejeitar renda mensal inválida.
18. Atualizar dados de ensino superior.
19. Rejeitar escolaridade inválida.
20. Rejeitar data de ingresso no ensino superior inválida.
21. Registrar anotação qualitativa.
22. Rejeitar anotação qualitativa com campos inválidos.
23. Rejeitar data de registro da anotação inválida.

## SaudeMentalService

1. Listar prontuários para perfil psicólogo.
2. Rejeitar listagem de prontuários para perfil não autorizado.
3. Criar prontuario com payload válido.
4. Rejeitar prontuario para aluno inexistente.
5. Rejeitar titulo inválido.
6. Rejeitar observacao inválida.
7. Listar labels para perfil psicólogo.
8. Criar label com payload válido.
9. Rejeitar tipo de label inválido.
10. Rejeitar label para aluno inexistente.
11. Rejeitar descrição de label inválida.

## AgendaService

1. Listar agenda com filtros válidos.
2. Rejeitar datas inválidas.
3. Rejeitar data final anterior a data inicial.
4. Criar item de agenda para perfil gestor.
5. Rejeitar criação para perfil não autorizado.
6. Rejeitar tipo de usuário inválido.
7. Rejeitar registro com menos de 3 caracteres.
8. Aplicar status padrão quando não informado.
9. Atualizar item de agenda existente.
10. Rejeitar atualização de item inexistente.
11. Cancelar item de agenda existente.
12. Rejeitar cancelamento de item inexistente.

## NotificacaoService

1. Listar todas as notificações.
2. Listar notificações por aluno.
3. Criar notificação com payload válido.
4. Rejeitar notificação para aluno inexistente.
5. Rejeitar tipo de notificação inválido.
6. Rejeitar tipo de remetente inválido.
7. Rejeitar remetente psicólogo quando o perfil não for psicólogo.
8. Rejeitar data de envio inválida.
9. Rejeitar titulo inválido.
10. Rejeitar mensagem inválida.
11. Rejeitar nome do remetente inválido.
12. Listar oportunidades.
13. Criar oportunidade com payload válido.
14. Rejeitar tipo de oportunidade inválido.
15. Tratar titulo e descrição antes de criar oportunidade.

## PortalAlunoService

1. Visualizar perfil resumido do aluno.
2. Rejeitar visualizacao de aluno inexistente.
3. Atualizar contato com email válido.
4. Atualizar contato com telefone informado.
5. Normalizar email antes da atualização.
6. Tratar telefone antes da atualização.
7. Rejeitar email inválido.
8. Rejeitar atualização sem email e sem telefone.
9. Listar notificações do proprio aluno.
10. Listar notificações quando usuário não for informado.
11. Rejeitar acesso a notificações de outro aluno.
12. Rejeitar listagem de notificações para aluno inexistente.
13. Listar oportunidades disponíveis no portal.

## Definição final

Os testes unitários de service devem ser implementados com dados mockados, simulando repositories e integrações externas. O objetivo e validar as regras de negócio dos services de forma isolada, sem acessar banco de dados real. Ao todo, serío implementados 110 testes unitários de service para cobrir os principais comportamentos esperados do backend.
