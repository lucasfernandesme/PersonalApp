# 🚀 Guia de Publicação - PersonalFlow (Google Play Store)

Este guia contém o passo a passo para gerar a versão final do **PersonalFlow** e publicá-lo na Play Store.

---

## 📋 Checklist Pré-Publicação

### 1. Configuração de Versão
Toda vez que você enviar uma nova versão, precisa aumentar esses números em `android/app/build.gradle`:
- `versionCode`: Um número inteiro (ex: 1, 2, 3). **O Google não aceita dois envios com o mesmo número.**
- `versionName`: A versão visível (ex: "1.0.0").
> **Nota**: Se esta é a sua **primeira vez** subindo o app, os números `1` e `"1.0"` que estão lá são válidos.

### 2. Assinatura do App (Signing)
Você precisará de um arquivo `.jks` para assinar o app. Se ainda não tiver, podemos criar um.

### 3. Gerar o App Bundle (.aab)
A Google não aceita mais arquivos `.apk`. Precisamos gerar o `.aab`.

---

## 🛠️ Passo a Passo para Gerar o .AAB

### Passo 1: Preparar o código Web
Antes de qualquer build nativo, sempre rode:
```bash
npm run build
npx cap copy android
```

### Passo 2: Gerar o Bundle no Android Studio
1. Abra a pasta `android` no **Android Studio**.
2. Vá no menu: **Build** > **Generate Signed Bundle / APK...**
3. Selecione **Android App Bundle** e clique em Next.
4. Escolha sua Key Store e insira as senhas.
5. Selecione **release** e clique em Finish.

*O arquivo será gerado em: `android/app/release/app-release.aab`*

---

## 🌐 Configuração no Google Play Console

### 1. Configuração Inicial
1. **Acesse**: [play.google.com/console](https://play.google.com/console).
2. **Criar App**: Clique em "Criar aplicativo":
   - **Nome**: PersonalFlow
   - **Idioma padrão**: Português (Brasil)
   - **Tipo**: Aplicativo
   - **Grátis ou Pago**: Grátis
3. **Termine de configurar seu app**: Complete o checklist obrigatório (Política de Privacidade, Acesso de apps, etc).

---

## 🧪 Fases de Teste

### 1. Teste Interno
Ideal para testar você mesmo ou com poucas pessoas. **Não precisa de revisão do Google**.

### 2. Teste Fechado (Obrigatório)
Necessário antes de solicitar acesso à produção para novas contas pessoais.
- **Regra de Ouro**: Você precisa de pelo menos **20 testadores** que aceitem participar por no mínimo **14 dias** seguidos após baixarem o app.
- **Passos**:
  1. Vá em **Teste Fechado**.
  2. Escolha ou crie uma trilha (geralmente "Trilha fechada").
  3. Em **Países/regiões**, selecione "Brasil".
  4. Na aba **Testadores**, crie uma lista com os 20 e-mails.
  5. Vá em **Versões** e crie um novo lançamento com o arquivo `.aab`.
  6. Envie para revisão do Google.
  7. **Crucial**: Quando aprovado, os 20 testadores devem baixar o app.

---

## 🚀 Produção
Após os 14 dias de teste fechado com 20 pessoas, você poderá clicar no botão "Solicitar acesso à produção".

---

## ✅ Sugestão de Nome da Versão
Como é para o **PersonalFlow**, você pode usar:
- `1.0.0`
- `PF-1.0.0`
- `Versão Inicial PersonalFlow`
- `Primeiro Teste Fechado`
