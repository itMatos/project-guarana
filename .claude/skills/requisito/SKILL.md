---
name: requisito
description: Conduz uma conversa curta para levantar um requisito (contexto, história de usuário, requisitos funcionais e não funcionais, critérios de aceite em Dado/Quando/Então) e, com a aprovação da pessoa, abre uma issue no repositório do GitHub usando o modelo .github/ISSUE_TEMPLATE/requisito.md. Use quando pedirem para escrever, levantar ou documentar um requisito, uma história de usuário ou uma nova funcionalidade, ou para abrir uma issue de requisito.
argument-hint: '[ideia da funcionalidade]'
---

Você vai ajudar a transformar uma ideia em um requisito bem escrito e, no final, abrir uma issue no GitHub. Converse em português. O fluxo é **interativo, mas enxuto**: proponha respostas a partir do que já sabe e peça só confirmação ou correção, em vez de fazer a pessoa escrever tudo do zero.

Ideia inicial da pessoa: $ARGUMENTS

Se a ideia estiver vazia, comece perguntando, em uma frase, qual funcionalidade ela quer descrever.

## 1. Entender antes de perguntar

- Leia o modelo em `.github/ISSUE_TEMPLATE/requisito.md`. A issue deve seguir exatamente as seções dele, na mesma ordem (ignore o frontmatter e os comentários `<!-- -->`).
- Dê uma olhada rápida no código relacionado à ideia (telas, modelos, serviços, mocks) para usar os nomes reais do sistema e propor critérios de aceite coerentes com o que já existe. Não gaste mais que alguns minutos nisso.

## 2. Perguntar só o que falta

Faça no máximo **3 rodadas** de perguntas, com até 4 perguntas por rodada. Use a ferramenta AskUserQuestion quando houver opções claras, sempre com a sua sugestão como primeira opção; a pessoa pode responder livremente com "Other". Pergunte apenas o que você não consegue deduzir com segurança:

- **Persona**: quem usa a funcionalidade.
- **Objetivo**: o benefício esperado, ou o problema que resolve.
- **Comportamento**: o que acontece no caminho feliz, e nos casos de erro ou vazio.
- **Regras e limites**: validações, permissões, valores máximos.
- **Fora de escopo**: o que fica para depois.
- **Prioridade**: se a pessoa quiser registrar.

Se uma resposta abrir uma dúvida que a pessoa não sabe responder agora, não insista: registre em **Dúvidas em aberto**.

## 3. Montar o rascunho

Escreva a issue completa com **todas** as seções do modelo, na mesma ordem. Remova os comentários `<!-- -->` e os marcadores vazios. Prefira uma issue enxuta: se ela crescer demais, provavelmente são duas issues, e vale sugerir dividir.

- **Título**: `[Requisito] <resumo curto no infinitivo>`, com até 70 caracteres contando o prefixo. Exemplo: `[Requisito] Filtrar produtos por faixa de preço`.
- **Contexto**: de 2 a 4 frases sobre o problema atual e quem é afetado.
- **História de usuário**: uma só, no formato Como / quero / para.
- **Requisitos funcionais**: numere como RF01, RF02… Cada um deve ser verificável ("o sistema deve…"), sem detalhe de implementação. Mire em até 8.
- **Requisitos não funcionais**: só os que importam para este caso. Se não houver nenhum, substitua a lista inteira por "Nenhum específico".
- **Critérios de aceite**: de 3 a 6 cenários, no formato Dado / Quando / Então, incluindo pelo menos um caso de erro ou de borda. Junte variações pequenas num mesmo cenário. Use uma linha **E** para uma condição ou um resultado adicional. Cada "Então" deve ser observável por quem testa e, quando possível, usar dados reais do sistema (nomes, valores).
- **Fora de escopo**: o que foi deixado de fora na conversa. Se nada foi, escreva "Nada definido".
- **Dúvidas em aberto**: decisões pendentes, com a suposição adotada entre parênteses. Se não houver nenhuma, escreva "Nenhuma".
- **Referências**: os arquivos que provavelmente vão mudar, testes incluídos, com o caminho a partir da raiz. Liste no máximo 10.

Mostre o rascunho inteiro na conversa, em Markdown, e pergunte se a pessoa quer ajustar algo. Repita até ela aprovar. Mudanças pequenas não precisam de nova rodada de perguntas.

## 4. Criar a issue (só com aprovação explícita)

A criação da issue é pública e visível para quem acompanha o repositório. **Só crie depois que a pessoa disser claramente que pode criar** a versão final mostrada. A aprovação de uma versão anterior não vale para uma versão alterada.

1. **Repositório**: o remoto usa um alias SSH que o `gh` não reconhece, então descubra `owner/repo` pelo remoto e passe sempre `--repo`:
   ```bash
   git remote get-url origin | sed -E 's#^.*[:/]([^/]+/[^/]+)$#\1#; s#\.git$##'
   ```
2. **Login**: rode `gh auth status`. Se não estiver logado, não tente contornar e não peça token. Diga para a pessoa rodar `gh auth login` e avisar quando terminar. O rascunho continua na conversa.
3. **Label**: confira se a label `requisito` existe, com `gh label list --repo <owner/repo> --search requisito`. Se não existir, crie a issue sem label e pergunte se a pessoa quer criar a label depois. Não crie a label sem perguntar.
4. **Criar**: salve o corpo num arquivo temporário e crie a issue:
   ```bash
   BODY=$(mktemp -t requisito) && cat > "$BODY" <<'EOF'
   <corpo da issue>
   EOF
   gh issue create --repo <owner/repo> --title "<título>" --body-file "$BODY" [--label requisito]
   ```
5. **Responder**: devolva o link da issue criada, com o número e o título. Se o comando falhar, mostre o erro e não tente de novo sem entender a causa.
