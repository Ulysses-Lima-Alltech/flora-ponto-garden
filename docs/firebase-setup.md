# Configurar o Firebase para o cadastro de acesso

Isso e opcional: o app funciona 100% offline sem isso. So afeta a tela "Meu Acesso" -- especificamente, permite que um cliente que se cadastrou em um totem seja reconhecido em outro. Sem essa configuracao, o cadastro continua funcionando normalmente, mas fica salvo apenas no aparelho onde foi feito.

## 1. Criar o projeto

1. Acesse https://console.firebase.google.com e entre com uma conta Google.
2. "Adicionar projeto" -> de um nome (ex: `flora-ponto-garden`) -> pode desativar o Google Analytics (nao e necessario) -> criar.

## 2. Criar o banco Firestore

1. No menu lateral do projeto, abra "Firestore Database".
2. "Criar banco de dados".
3. Escolha "Iniciar no modo de producao".
4. Selecione uma regiao proxima (ex: `southamerica-east1` - Sao Paulo).

## 3. Publicar as regras de seguranca

Na aba "Regras" do Firestore, substitua o conteudo por:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /customers/{phone} {
      allow get: if true;
      allow create: if request.resource.data.keys().hasOnly(['firstName', 'fullName', 'email', 'createdAt'])
        && request.resource.data.fullName is string
        && request.resource.data.fullName.size() > 0;
      allow update, delete: if false;
      allow list: if false;
    }
  }
}
```

Isso permite que o app leia uma conta pelo telefone (usado como identificador do documento) e crie novas contas, mas nunca liste, altere ou apague contas -- nem sequer o proprio app faz isso depois de criado.

Clique em "Publicar".

## 4. Registrar o app web

1. Em "Configuracoes do projeto" (icone de engrenagem) -> aba "Geral".
2. Em "Seus aplicativos", clique no icone `</>` (Web).
3. De um apelido (ex: `flora-totem`) -> nao precisa marcar Firebase Hosting -> "Registrar app".
4. Copie o objeto `firebaseConfig` mostrado na tela. Ele se parece com isto:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "flora-ponto-garden.firebaseapp.com",
  projectId: "flora-ponto-garden",
  storageBucket: "flora-ponto-garden.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
};
```

Esses valores nao sao senhas -- sao identificadores publicos do projeto, protegidos pelas regras do passo 3, e ficam embutidos no APK normalmente (e assim que todo app com Firebase funciona).

## 5. Preencher o `.env.local`

Na raiz do projeto (`projeto/`), copie `.env.example` para `.env.local` e preencha com os valores copiados:

```bash
cp .env.example .env.local
```

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=flora-ponto-garden.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=flora-ponto-garden
VITE_FIREBASE_STORAGE_BUCKET=flora-ponto-garden.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

`.env.local` nunca e versionado (esta no `.gitignore`). Depois de preenchido, rode `npm run build` novamente (ou peca para eu gerar um novo APK) para os valores entrarem no aplicativo.
