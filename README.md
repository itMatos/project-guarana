# Guaraná — loja virtual em Angular

A **Loja Guaraná** é um e-commerce de eletrônicos feito em **Angular**, com o backend simulado por **MSW** e coberto por testes unitários e **testes end-to-end (e2e)** com **Playwright**. O projeto também é desenvolvido com apoio de **inteligência artificial**: o repositório traz **skills** e **agentes de IA** do Claude Code que automatizam tarefas do dia a dia, como levantar requisitos, rodar os testes e revisar o padrão do código.

## Funcionalidades

- **Login** com sessão por usuário e rotas da loja protegidas.
- **Catálogo em abas** por categoria (Celulares, Notebooks e Tablets), com a contagem de produtos em cada aba e a aba ativa na URL (`?categoria=notebooks`).
- **Carrinho de compras** salvo por usuário:
  - adicionar produtos de categorias diferentes, com aviso de confirmação;
  - ícone no cabeçalho com a quantidade de itens;
  - página do carrinho com quantidade (de 1 a 10 por produto), subtotal, total e remoção de itens;
  - o carrinho continua igual depois de recarregar a página ou sair e entrar de novo.

## Tecnologias

| Tecnologia | Uso no projeto |
|---|---|
| [Angular 22](https://angular.dev) | Aplicação, com componentes standalone, signals e o controle de fluxo `@if` / `@for` |
| [Angular Material](https://material.angular.dev) | Componentes de interface e tema (Material 3) |
| [TypeScript](https://www.typescriptlang.org) | Linguagem de todo o código, inclusive testes |
| [MSW (Mock Service Worker)](https://mswjs.io) | API simulada no navegador: login, produtos e carrinho, sem backend real |
| [Vitest](https://vitest.dev) | Testes unitários, pelo builder de testes do Angular |
| [Playwright](https://playwright.dev) | Testes e2e no navegador, com page objects e API falsa por teste |
| [Prettier](https://prettier.io) | Formatação do código |

## Como rodar

Requisitos: Node.js 22 ou mais recente e npm.

```bash
npm install
npm start
```

Abra `http://localhost:4200` e entre com um dos usuários do mock:

| Usuário | Senha | Resultado |
|---|---|---|
| `standard_user` | `secret_sauce` | Acesso normal |
| `locked_out_user` | `secret_sauce` | Usuário bloqueado |

No ambiente de desenvolvimento, o **MSW** intercepta as chamadas para `/api` e responde no próprio navegador. Os carrinhos do mock ficam no `localStorage`, separados por usuário.

## API simulada

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/api/auth/login` | Login; devolve o token da sessão |
| `GET` | `/api/products` | Lista os produtos com a categoria de cada um |
| `GET` | `/api/cart` | Carrinho do usuário logado |
| `POST` | `/api/cart/items` | Adiciona 1 unidade de um produto |
| `PUT` | `/api/cart/items/:productId` | Altera a quantidade (de 1 a 10) |
| `DELETE` | `/api/cart/items/:productId` | Remove o produto do carrinho |

As rotas de produtos e de carrinho exigem o cabeçalho `Authorization: Bearer <token>`. Os handlers ficam em [`src/mocks/handlers`](src/mocks/handlers).

## Testes

### Unitários (Vitest)

```bash
npm test
```

Para rodar uma vez só, sem modo watch: `npm test -- --watch=false`.

### End-to-end (Playwright)

Os testes e2e abrem a loja num navegador de verdade e cobrem login, logout, as abas de categoria e o carrinho. Cada teste controla as respostas da API pela fixture `api` ([`e2e/api/api-state.ts`](e2e/api/api-state.ts)), então eles não dependem do MSW nem de um backend.

Na primeira vez, instale o navegador:

```bash
npx playwright install chromium
```

Depois:

```bash
npm run e2e
```

O Playwright sobe sozinho o app na porta 4300, com a configuração `e2e`, que desliga o MSW. Outros comandos:

| Comando | O que faz |
|---|---|
| `npm run e2e:ui` | Abre a interface do Playwright para rodar e depurar os testes |
| `npm run e2e:headed` | Roda com o navegador visível |
| `npm run e2e:report` | Abre o relatório da última execução |

As credenciais usadas no login do e2e podem ser trocadas num arquivo `.env`, a partir de [`.env.example`](.env.example). Sem ele, o e2e usa `standard_user` / `secret_sauce`.

## Estrutura

```
src/
  app/
    core/api/        chamadas HTTP, uma classe por domínio
    core/services/   estado e regras (sessão, carrinho)
    pages/           telas: login, lista de produtos, carrinho
    shared/models/   tipos compartilhados
  environments/      endpoints e chave para ligar o MSW
  mocks/             API simulada com MSW (handlers e dados)
  testing/builders/  builders de dados para os testes
e2e/
  api/               API falsa dos testes e2e
  pages/             page objects
  tests/             cenários por funcionalidade
.claude/
  agents/            agentes de IA do projeto
  skills/            skills do projeto
```

## Desenvolvimento com IA: skills e agentes

O projeto usa o [Claude Code](https://claude.com/claude-code) como assistente de desenvolvimento com IA. Além do código, o repositório guarda **skills** e **agentes** próprios em [`.claude/`](.claude), versionados junto com o projeto. Assim, qualquer pessoa que abrir o repositório no Claude Code tem as mesmas automações.

- Uma **skill** é um roteiro que roda dentro da conversa. Ela pode fazer perguntas e pedir aprovação, e é chamada com `/nome`.
- Um **agente** (subagent) roda num contexto separado e devolve só um relatório. Isso é útil para tarefas com muita saída, como rodar testes. Para usar, peça a tarefa em linguagem natural ou chame com `@nome`.

### Skill `/requisito`

Transforma uma ideia num requisito bem escrito e abre uma **issue no GitHub**. Exemplo: `/requisito filtrar produtos por faixa de preço`.

1. Lê o código relacionado, para usar os nomes reais do sistema.
2. Faz poucas perguntas, sempre com uma sugestão pronta para confirmar.
3. Monta o rascunho: contexto, **história de usuário**, requisitos funcionais e não funcionais e **critérios de aceite** no formato Dado / Quando / Então.
4. Cria a issue com a label `requisito`, só depois da sua aprovação.

A issue segue o modelo [`.github/ISSUE_TEMPLATE/requisito.md`](.github/ISSUE_TEMPLATE/requisito.md), que também aparece no botão "New issue" do GitHub. A skill precisa do [GitHub CLI](https://cli.github.com) logado (`gh auth login`).

### Agente `test-runner`

Roda os testes e reporta o resultado: checagem de tipos, unitários e e2e. Também aceita um escopo, como `unit`, `e2e` ou um arquivo. Devolve um resumo em tabela e, para cada falha, o arquivo e a linha, a causa provável e o comando para reproduzir só aquela falha. Não altera código. Exemplo: "rode os testes" ou "@test-runner rode só os e2e".

### Agente `code-linter`

Verifica se o código segue o padrão do projeto e funciona como um **lint** sem ESLint:
- roda Prettier, checagem de tipos e o build do Angular;
- procura desvios comuns, como teste focado, `any`, `console.log`, URL de API ou cor fixa;
- revisa as convenções de estrutura, estilo e testes.

Por padrão, analisa só o que ainda não foi enviado ao remoto. Aponta cada problema com arquivo, linha e correção, sem editar nada. Exemplo: "verifique o padrão do código" ou "@code-linter verifique `src/app/pages/store`".

---

**Palavras-chave:** Angular, TypeScript, e-commerce, carrinho de compras, Angular Material, MSW, Mock Service Worker, API mock, Vitest, Playwright, testes e2e, testes end-to-end, inteligência artificial, IA, IA generativa, Claude Code, agentes de IA, subagents, skills, automação de testes, revisão de código com IA, requisitos com IA.
