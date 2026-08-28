# Avatar 3D animado da Flora

**Atualizacao importante**: a Ready Player Me foi comprada pela Netflix e encerrou o acesso publico em 31/01/2026. O guia original deste arquivo (criar um avatar no site deles) nao funciona mais -- o dominio nem resolve.

## Estado atual

Para validar que a tecnologia funciona no hardware real, o app usa por padrao um avatar de demonstracao generico (`brunette.glb`), baixado do proprio repositorio publico da biblioteca TalkingHead.js e empacotado localmente em `public/avatars/brunette.glb` (funciona 100% offline, sem precisar de internet no totem).

**Isso e um placeholder tecnico, nao uma solucao final:**
- O visual e um personagem 3D generico, nao a ilustracao da Flora.
- O arquivo foi originalmente gerado usando a Ready Player Me (antes dela sair do ar), sob os termos de uso *dela* -- nao esta claramente liberado para redistribuicao comercial. **Nao publique a Play Store com este avatar sem substituir por um proprio ou confirmar o licenciamento.**

## Como trocar por um avatar proprio

Defina `VITE_FLORA_AVATAR_URL` no `.env.local` (mesmo arquivo do Firebase, veja [docs/firebase-setup.md](firebase-setup.md)) apontando para um arquivo `.glb` compativel com o rig da Ready Player Me (blend shapes tipo `jawOpen`, `eyeBlinkLeft`, etc.). Sem a Ready Player Me, as alternativas conhecidas hoje sao mais trabalhosas:

- **VRoid Studio** (gratis, https://vroid.com/studio) -- cria avatares estilo anime, exporta `.vrm`. Precisa converter para o rig compativel usando Blender + addon (nao e um clique so).
- **Avaturn** ou **Avatar SDK** -- outros geradores de avatar 3D, com seus proprios termos de uso e processo de exportacao; nao testei a compatibilidade completa com o TalkingHead.
- **Modelagem propria** -- um modelador 3D pode criar um avatar customizado com os blend shapes certos, para bater com a ilustracao oficial da Flora.

Qualquer uma dessas opcoes exige uma etapa manual fora deste projeto (site externo ou Blender) que eu nao consigo fazer sozinho neste ambiente -- me avise qual caminho quer seguir quando tiver o arquivo `.glb` pronto.

## Limitacoes que continuam valendo

- Sem sincronia labial precisa por fonema em portugues (a biblioteca so tem regras prontas para ingles, finlandes, alemao, frances e lituano). A boca se move de forma aproximada enquanto ela fala, nao palavra por palavra.
- Gestos de braco/mao e piscar de olhos funcionam normalmente com qualquer avatar compativel com o rig.
