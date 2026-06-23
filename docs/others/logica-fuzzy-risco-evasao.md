# Lógica fuzzy de risco de evasão

## 1. Objetivo

Esta implementação calcula automaticamente um indicador quantitativo de risco de evasão para cada aluno da Pulse Mais. O resultado possui duas formas:

- `probabilidadeEvasao`: número entre 0 e 100, com duas casas decimais;
- `riscoEvasao`: classificação compatível com o sistema atual: `baixo`, `medio` ou `alto`.

O valor percentual é um **índice fuzzy de priorização**, construído a partir dos dados disponíveis no sistema. Ele ajuda a identificar alunos que merecem acompanhamento, mas não deve ser interpretado como uma probabilidade estatística comprovada ou como certeza de que o aluno deixará o programa.

## 2. Estado atual da integração
O cálculo está conectado às tabelas, ao modelo de aluno e às APIs existentes.

O fluxo implementado é:

1. o backend consulta alunos, participações e atividades no banco;
2. os dados quantitativos são agregados por aluno;
3. o motor fuzzy calcula o percentual e a classificação;
4. os campos `probabilidade_evasao` e `risco_evasao` são atualizados na tabela `aluno`;
5. as APIs de alunos passam a devolver `probabilidadeEvasao` junto com `riscoEvasao`;
6. o frontend continua utilizando `riscoEvasao` sem precisar ser alterado.

O recálculo é automático e acontece:

- depois de criar uma frequência;
- depois de corrigir uma frequência existente;
- depois de registrar uma participação em outra atividade;
- depois de alterar o engajamento de um aluno;
- durante a inicialização do servidor, para sincronizar dados antigos.

O usuário final não precisa executar comandos, clicar em um botão específico ou configurar o frontend. O comando `npm run risco:recalcular` permanece disponível somente como ferramenta administrativa opcional.

## 3. Origem dos dados

Os dados são obtidos das seguintes tabelas:

| Variável | Origem | Regra de obtenção |
|---|---|---|
| `idAluno` | `aluno.id_aluno` | Identificador do aluno |
| `engajamento` | `aluno.engajamento` | Valor de 0 a 100 |
| `totalAulas` | `participacao` + `atividade` | Quantidade de participações cuja atividade tem `tipo = 'aula'` |
| `faltasAulas` | `participacao` + `atividade` | Aulas com `status_part = false` |
| `totalAtividades` | `participacao` + `atividade` | Participações em atividades cujo tipo é diferente de `aula` |
| `ausenciasAtividades` | `participacao` + `atividade` | Atividades não-aula com `status_part = false` |
| `quantidadeNotas` | `participacao.nota` | Quantidade de registros com nota não nula |
| `mediaNotas` | `participacao.nota` | Média das notas disponíveis |

Um registro inexistente não é considerado falta. Uma falta só é contabilizada quando existe uma participação com `status_part = false`. Isso evita penalizar alunos novos ou históricos incompletos.

## 4. Variáveis fuzzy

### 4.1 Taxa de faltas em aula

```text
taxaFaltas = (faltasAulas / totalAulas) × 100
```

Pertinência ao conjunto de risco:

- até 10% de faltas: grau de risco `0`;
- entre 10% e 40%: crescimento linear entre `0` e `1`;
- a partir de 40%: grau de risco `1`.

Peso: **45%**.

### 4.2 Taxa de ausência em outras atividades

```text
taxaAusencias = (ausenciasAtividades / totalAtividades) × 100
```

Pertinência ao conjunto de risco:

- até 15% de ausências: grau de risco `0`;
- entre 15% e 60%: crescimento linear entre `0` e `1`;
- a partir de 60%: grau de risco `1`.

Peso: **20%**.

### 4.3 Desempenho acadêmico

O desempenho utiliza a média das notas, na escala de 0 a 10.

Pertinência ao conjunto de risco:

- nota média igual ou superior a 8: grau de risco `0`;
- nota média entre 5 e 8: redução linear do risco;
- nota média igual ou inferior a 5: grau de risco `1`.

Peso: **20%**.

### 4.4 Desengajamento

O sistema recebe `engajamento` na escala de 0 a 100. Para a explicação do resultado também é calculado:

```text
desengajamento = 100 - engajamento
```

Pertinência ao conjunto de risco:

- engajamento igual ou superior a 80: grau de risco `0`;
- engajamento entre 30 e 80: redução linear do risco;
- engajamento igual ou inferior a 30: grau de risco `1`.

Peso: **15%**.

## 5. Funções de pertinência

Para indicadores em que valores maiores representam maior risco, é usada a função crescente:

```text
pertinenciaCrescente(x, inicio, fim) = limitar((x - inicio) / (fim - inicio), 0, 1)
```

Para indicadores em que valores menores representam maior risco, é usada a função decrescente:

```text
pertinenciaDecrescente(x, ruim, bom) = limitar((bom - x) / (bom - ruim), 0, 1)
```

A função `limitar` garante que o resultado permaneça entre 0 e 1.

## 6. Agregação dos fatores

Os graus fuzzy disponíveis são combinados por média ponderada:

```text
riscoFuzzy = soma(grauDeRisco × peso) / soma(pesosDisponiveis)
```

Os pesos completos são:

| Fator | Peso |
|---|---:|
| Faltas em aula | 0,45 |
| Ausências em atividades | 0,20 |
| Média de notas | 0,20 |
| Desengajamento | 0,15 |

Se um fator não tiver dados, ele não participa do cálculo. Os pesos restantes são renormalizados automaticamente pela divisão pela soma dos pesos disponíveis.

## 7. Confiabilidade e poucos registros

Para evitar conclusões fortes com poucos registros, o cálculo utiliza uma medida de confiabilidade:

```text
quantidadeRegistros = totalAulas + totalAtividades
confiabilidade = limitar((quantidadeRegistros + quantidadeNotas) / 5, 0, 1)
```

A confiabilidade chega a 100% quando a soma considerada atinge cinco registros. Enquanto houver poucos dados, o resultado é aproximado de uma referência conservadora de 25%:

```text
probabilidade = 25 + ((riscoFuzzy × 100) - 25) × confiabilidade
```

O resultado final é arredondado para duas casas decimais.

Exemplo: uma única falta não produz imediatamente 100% de risco, pois a confiabilidade ainda é baixa.

## 8. Classificação final

| Percentual calculado | Classificação persistida |
|---|---|
| Menor que 40% | `baixo` |
| De 40% até 69,99% | `medio` |
| Igual ou maior que 70% | `alto` |

## 9. Tratamento de dados ausentes

Quando o aluno não possui aulas, atividades, notas nem engajamento informado:

- `probabilidade` retorna `null` no motor;
- `classificacao` retorna `null` no motor;
- `confiabilidade` retorna `0`;
- o script não atualiza esse aluno;
- o valor anterior de `risco_evasao` é preservado;
- `probabilidade_evasao` permanece nula.

Essa regra impede que ausência de informação seja confundida com baixo ou alto risco.

## 10. Exemplo de cálculo

Considere um aluno com:

- 10 aulas e 4 faltas: taxa de faltas de 40%;
- 5 outras atividades e 2 ausências: taxa de ausências de 40%;
- média de notas 6;
- engajamento 40;
- quantidade de registros suficiente para confiabilidade de 100%.

Graus fuzzy aproximados:

```text
faltasEmAula       = 1,00
ausenciasAtividade = (40 - 15) / (60 - 15) = 0,5556
desempenho         = (8 - 6) / (8 - 5) = 0,6667
desengajamento     = (80 - 40) / (80 - 30) = 0,80
```

Agregação:

```text
riscoFuzzy =
  (1,00 × 0,45) +
  (0,5556 × 0,20) +
  (0,6667 × 0,20) +
  (0,80 × 0,15)

riscoFuzzy ≈ 0,8144
probabilidade ≈ 81,44%
classificacao = alto
```

## 11. Persistência e contrato da API

A migração adiciona à tabela `aluno`:

```sql
probabilidade_evasao DECIMAL(5,2)
```

O banco aceita somente valores nulos ou entre 0 e 100.

O repositório de alunos converte o campo para o contrato JavaScript/TypeScript:

```json
{
  "riscoEvasao": "alto",
  "probabilidadeEvasao": 81.44
}
```

O frontend existente pode ignorar o novo campo e continuar usando `riscoEvasao`. Nenhuma configuração manual na interface é necessária.

## 12. Como executar

### 12.1 Aplicar a alteração do banco

```bash
npm run migrate
```

### 12.2 Uso normal do sistema

Nenhum comando adicional é necessário. Ao iniciar o backend, os dados históricos são sincronizados. Depois disso, os endpoints de frequência, participação e atualização de engajamento recalculam o aluno afetado em tempo real.

### 12.3 Recálculo administrativo opcional

Caso a equipe altere dados diretamente no banco, sem passar pela API, ainda é possível forçar uma sincronização:

```bash
npm run risco:recalcular
```

Saída esperada:

```text
Risco de evasao recalculado: X/Y alunos atualizados; Z mantidos sem alteracao por falta de dados.
```

O comando utiliza as mesmas variáveis de ambiente e conexão do restante do backend. Ele não faz parte do fluxo normal do usuário.

## 13. Arquivos envolvidos

| Arquivo | Responsabilidade |
|---|---|
| `src/backend/services/riscoEvasaoService.ts` | Funções de pertinência, pesos, confiança, classificação e recálculo |
| `src/backend/repositories/riscoEvasaoRepository.ts` | Consulta agregada e atualização do banco |
| `src/scripts/recalcular-risco-evasao.ts` | Ponto de entrada executado pelo npm |
| `src/backend/database/migration.sql` | Criação de `probabilidade_evasao` e validação de 0 a 100 |
| `src/backend/models/alunoModel.ts` | Mapeamento TypeORM do novo campo |
| `src/backend/repositories/alunoRepository.ts` | Exposição de `probabilidadeEvasao` nas APIs de alunos |
| `src/tests/unit/services/risco-evasao.service.test.ts` | Testes da fórmula e das regras de classificação |
| `src/tests/integration/risco-evasao.integration.test.ts` | Testes da consulta e persistência real |

## 14. Limitações e interpretação responsável

- O percentual é um índice fuzzy explicável, não um modelo estatístico treinado com histórico real de evasões.
- Os limites e pesos são regras iniciais de negócio e podem ser calibrados quando a Pulse Mais tiver uma base histórica maior.
- O campo `engajamento` possui valor padrão zero no banco. O motor só realiza uma atualização quando existe ao menos algum sinal quantitativo; mesmo assim, é importante que a equipe preencha esse indicador de forma consistente.
- Uma atividade só entra no cálculo se existir um registro em `participacao`.
- O cálculo atual considera todos os registros históricos disponíveis, sem janela temporal.
- Alterações feitas diretamente no banco, fora da API, são sincronizadas na próxima inicialização do servidor ou pelo comando administrativo opcional.
- O indicador deve apoiar a decisão humana, não substituir acompanhamento pedagógico ou psicológico.