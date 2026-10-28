# Como ligar o painel `/admin` (faça uma vez)

O portfólio guarda textos, projetos, serviços e contatos no **Firebase Firestore**.
O login do painel usa o **Firebase Authentication**. As imagens vão para o **Cloudinary**.
A senha do painel **não fica em nenhum arquivo do site** — ela existe só dentro do Firebase.

> ⚠️ **Crie um projeto novo no Firebase só para o portfólio.** Não reutilize o projeto do Edna Cakes,
> Gabriel Barber etc.: o passo 3 troca as regras do banco, e isso quebraria os outros sites.

## 1. Criar o projeto
1. Acesse https://console.firebase.google.com e clique em **Adicionar projeto**.
2. Nome: `meu-portfolio` (pode desativar o Google Analytics).

## 2. Criar o banco (Firestore)
1. Menu **Criação → Firestore Database → Criar banco de dados**.
2. Local: `southamerica-east1` (São Paulo). Modo: **produção**.

## 3. Colar as regras de segurança
1. Em Firestore, aba **Regras**.
2. Apague tudo e cole o conteúdo do arquivo `firestore.rules`.
3. Clique em **Publicar**.

## 4. Criar o seu usuário do painel
1. Menu **Criação → Authentication → Vamos começar**.
2. Em **Método de login**, ative **E-mail/senha**.
3. Aba **Usuários → Adicionar usuário**:
   - E-mail: `jvdev2026@jvdev.app`
   - Senha: escolha uma senha forte (de preferência sem nome ou data de aniversário).
4. (Recomendado) Em **Configurações → Ações do usuário**, desmarque **Ativar criação (cadastro)**.

No painel você digita só `jvdev2026` e a senha; o site completa o e-mail sozinho.

## 5. Copiar a configuração do Firebase
1. Engrenagem ⚙️ → **Configurações do projeto → Seus apps → ícone `</>` (Web)**.
2. Registre o app (qualquer nome) e copie o objeto `firebaseConfig`.
3. Cole os valores em `firebase-config.js` (no lugar de `COLE_AQUI`).

## 6. Cloudinary
O preset `meu-portfolio` precisa estar em **Signing Mode: Unsigned**.
Em Settings → Upload → Upload presets você também pode limitar formatos (jpg, png, webp, svg, mp4)
e tamanho máximo, para ninguém usar o preset para outra coisa.

## 7. Publicar
Copie **todos** os arquivos desta pasta para a pasta do repositório (substituindo `index.html`,
`servicos.html` e `vercel.json`) e envie:

```powershell
cd "C:\Users\jvcha\OneDrive\Meu portfólio"
git add .
git commit -m "Painel administrativo"
git push
```

## 8. Primeiro acesso
1. Abra `https://SEU-SITE.vercel.app/admin`.
2. Entre com `jvdev2026` e a senha criada no passo 4.
3. Clique em **Salvar e publicar** uma vez: isso grava no banco o conteúdo que já está no site.
4. A partir daí, tudo que você editar e salvar aparece no portfólio na hora (recarregue a página).

## Problemas comuns
| Mensagem | O que fazer |
|---|---|
| "Falta conectar o banco" | `firebase-config.js` ainda tem `COLE_AQUI`. |
| "Usuário ou senha incorretos" | Confira o usuário criado no passo 4 (`jvdev2026@jvdev.app`). |
| "login por e-mail e senha ainda não foi ativado" | Passo 4.2. |
| "Sem permissão para salvar" | Passo 3 (regras) ou você não entrou com o usuário do passo 4. |
| Imagem não envia | Preset `meu-portfolio` não está como *Unsigned*, ou o arquivo passa de 10 MB (imagem) / 100 MB (vídeo). |

## Arquivos
| Arquivo | Para quê |
|---|---|
| `index.html`, `servicos.html` | Páginas públicas (leem o conteúdo do banco) |
| `render.js`, `site.js`, `content-default.js` | Montagem das páginas e conteúdo padrão |
| `admin.html`, `admin.js`, `admin.css`, `editor.js` | O painel |
| `firebase-config.js` | Suas chaves (Firebase e Cloudinary) |
| `firestore.rules` | Regras de segurança do banco |
| `arautos-logo.png` | Logo usada no card dos Arautos |
