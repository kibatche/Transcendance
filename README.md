# Transcendence

Une application web d'un jeu pong multijoueur en ligne. Projet fait à 4 !

*Note pour les studs : c'est l'ancienne version du sujet.*

## Les technos

Nestjs pour le back, et sveltejs pour le front (donc essentiellement du typescript). Html, css, js pour certaines fonctionnalités. PostgresQL pour la base de données. Le tout est *dockerisé*, donc facilement déployable si tant est que vous ayez docker.

## Usage

`make up` . Cela va générer un environnement automatiquement.
`make destroy` pour détruire les conteneurs. ⚠️ Cela détruira tous vos conteneurs.

Vous devez rentrer le l'uid ainsi que la clé secrète liés à l'api 42. L'application n'est déployable que par les étudiant.e.s de 42. Si pour une raison ou une autre vous souhaitez voir le projet (vous êtes tombé sur ce projet via mon cv), veuillez me contacter.

## Fonctionnalités

### Utilisateur

- Création, modification, suppression d'un compte utilisateur. Mise à jour avatar etc.
- Création d'une partie. Matchmaking ou possibilité de jouer seul.
- Utilisation obligatoire de l'authentification à double facteur (2FA) via google authenticator.
- Ajout, suppression d'amis. Blocage de personne.
- Statut des utilisateurs (en ligne, hors ligne, en match)
- Statistiques : générales (leaderboard) et personnelles
- Historique de match.

### Chat 
- Chat : création, suppression, modification de channel.
- L'utilité suprême d'un chat : se parler en message privé !
- Possibilité de protéger par mot de passe, de ne laisser entrer que par invitation etc.
- Gestion des administrateurs des channels.
- Inviter d'autres joueurs via le chat.

### Le jeu

- Jouer à pong, à deux ou tout seul (contre l'ordinateur)
- Système de matchmaking
- Options de customisation (par exemple avoir des variantes avec plusieurs balles)
- Jeu "responsive"
- Possibilité de regarder le match de quelqu'un d'autre en direct.

### Questions de sécurité

- Protection contre les injections SQL (l'utilisation de typeORM aidant grandement)
- Désinfection des entrées utilisateurs, gestions de types attendus etc.

## Photos

![page de garde](<_git_img/Capture d’écran du 2024-02-07 10-57-29.png>)
![play](<_git_img/Capture d’écran du 2024-02-07 11-32-16.png>)
![spectate](<_git_img/Capture d’écran du 2024-02-07 11-34-33.png>)
![ranking](<_git_img/Capture d’écran du 2024-02-07 11-34-39.png>)
![profile](<_git_img/Capture d’écran du 2024-02-07 11-34-50.png>)
![friends](<_git_img/Capture d’écran du 2024-02-07 11-34-59.png>)
![chat](<_git_img/Capture d’écran du 2024-02-07 11-35-06.png>)

## Arborescence du projet

```
[4.0K]  .
├── [4.0K]  docs
│   ├── [ 11K]  transcendence_chat.drawio.html
│   ├── [1.3M]  transcendence_en.subject.pdf
│   └── [4.1K]  Vue_ensemble_transcendance.html
├── [5.9K]  make_env.sh
├── [ 977]  Makefile
├── [ 221]  README.md
└── [4.0K]  srcs
    ├── [3.2K]  docker-compose.yml
    └── [4.0K]  requirements
        ├── [4.0K]  game_server
        │   ├── [ 167]  Dockerfile
        │   └── [4.0K]  game_back
        │       ├── [ 218]  jsconfig.json
        │       ├── [ 232]  package.json
        │       ├── [4.1K]  package-lock.json
        │       ├── [4.0K]  src
        │       │   ├── [4.0K]  server
        │       │   │   ├── [4.0K]  class
        │       │   │   │   ├── [ 906]  Client.ts
        │       │   │   │   ├── [ 296]  GameComponentsServer.ts
        │       │   │   │   └── [8.5K]  GameSession.ts
        │       │   │   ├── [ 415]  constants.ts
        │       │   │   ├── [ 130]  utils.ts
        │       │   │   └── [ 14K]  wsServer.ts
        │       │   └── [4.0K]  shared_js
        │       │       ├── [4.0K]  class
        │       │       │   ├── [3.2K]  Event.ts
        │       │       │   ├── [1.8K]  GameComponents.ts
        │       │       │   ├── [ 384]  interface.ts
        │       │       │   ├── [4.3K]  Rectangle.ts
        │       │       │   └── [ 938]  Vector.ts
        │       │       ├── [1.1K]  constants.ts
        │       │       ├── [ 646]  enums.ts
        │       │       ├── [ 613]  utils.ts
        │       │       └── [ 687]  wallsMovement.ts
        │       └── [ 11K]  tsconfig.json
        ├── [4.0K]  nestjs
        │   ├── [4.0K]  api_back
        │   │   ├── [ 118]  nest-cli.json
        │   │   ├── [2.8K]  package.json
        │   │   ├── [652K]  package-lock.json
        │   │   ├── [3.3K]  README.md
        │   │   ├── [4.0K]  src
        │   │   │   ├── [ 617]  app.controller.spec.ts
        │   │   │   ├── [ 274]  app.controller.ts
        │   │   │   ├── [1.3K]  app.module.ts
        │   │   │   ├── [ 141]  app.service.ts
        │   │   │   ├── [4.0K]  auth
        │   │   │   │   └── [4.0K]  42
        │   │   │   │       ├── [ 548]  authentication.controller.spec.ts
        │   │   │   │       ├── [3.3K]  authentication.controller.ts
        │   │   │   │       ├── [1.2K]  authentication.module.ts
        │   │   │   │       ├── [ 516]  authentication.service.spec.ts
        │   │   │   │       ├── [2.1K]  authentication.service.ts
        │   │   │   │       ├── [4.0K]  dto
        │   │   │   │       │   └── [ 122]  2fa.dto.ts
        │   │   │   │       ├── [4.0K]  guards
        │   │   │   │       │   └── [1.3K]  42guards.ts
        │   │   │   │       ├── [4.0K]  strategy
        │   │   │   │       │   └── [1.2K]  42strategy.ts
        │   │   │   │       └── [4.0K]  utils
        │   │   │   │           └── [ 695]  serializer.ts
        │   │   │   ├── [4.0K]  chat
        │   │   │   │   ├── [ 25K]  chat.controller.ts
        │   │   │   │   ├── [3.4K]  chat.gateway.ts
        │   │   │   │   ├── [ 825]  chat.module.ts
        │   │   │   │   ├── [ 28K]  chat.service.ts
        │   │   │   │   ├── [4.0K]  dev
        │   │   │   │   │   └── [ 708]  dev_utils.ts
        │   │   │   │   ├── [4.0K]  dto
        │   │   │   │   │   ├── [ 177]  messages.dto.ts
        │   │   │   │   │   ├── [ 188]  mute.dto.ts
        │   │   │   │   │   ├── [1.1K]  room.dto.ts
        │   │   │   │   │   ├── [ 185]  setCurrentRoom.dto.ts
        │   │   │   │   │   └── [ 302]  socket.dto.ts
        │   │   │   │   └── [4.0K]  entities
        │   │   │   │       └── [1.4K]  chatroom.entity.ts
        │   │   │   ├── [4.0K]  common
        │   │   │   │   ├── [4.0K]  constants
        │   │   │   │   │   └── [ 850]  constants.ts
        │   │   │   │   ├── [4.0K]  dto
        │   │   │   │   │   └── [ 190]  pagination-query.dto.ts
        │   │   │   │   └── [4.0K]  validation
        │   │   │   │       └── [ 765]  validation.pipe.ts
        │   │   │   ├── [4.0K]  friendship
        │   │   │   │   ├── [4.0K]  dto
        │   │   │   │   │   ├── [ 295]  create-friendship.dto.ts
        │   │   │   │   │   └── [ 192]  update-friendship.dto.ts
        │   │   │   │   ├── [4.0K]  entities
        │   │   │   │   │   └── [ 758]  friendship.entity.ts
        │   │   │   │   ├── [ 520]  friendship.controller.spec.ts
        │   │   │   │   ├── [3.9K]  friendship.controller.ts
        │   │   │   │   ├── [ 488]  friendship.service.spec.ts
        │   │   │   │   ├── [ 13K]  friendship.service.ts
        │   │   │   │   ├── [ 534]  friendships.module.ts
        │   │   │   │   └── [ 469]  sendableFriendship.ts
        │   │   │   ├── [4.0K]  game
        │   │   │   │   ├── [4.0K]  dto
        │   │   │   │   │   ├── [ 410]  createGame.dto.ts
        │   │   │   │   │   ├── [ 340]  grantTicket.dto.ts
        │   │   │   │   │   ├── [ 306]  updateGame.dto.ts
        │   │   │   │   │   └── [ 356]  validateTicket.dto.ts
        │   │   │   │   ├── [4.0K]  entity
        │   │   │   │   │   ├── [ 604]  game.entity.ts
        │   │   │   │   │   └── [ 427]  tokenGame.entity.ts
        │   │   │   │   ├── [ 478]  game.controller.spec.ts
        │   │   │   │   ├── [3.6K]  game.controller.ts
        │   │   │   │   ├── [1.0K]  game.module.ts
        │   │   │   │   ├── [ 491]  game.service.spec.ts
        │   │   │   │   └── [ 15K]  game.service.ts
        │   │   │   ├── [1.7K]  main.ts
        │   │   │   ├── [4.0K]  uploads
        │   │   │   │   └── [4.0K]  avatars
        │   │   │   │       └── [1.2K]  default.png
        │   │   │   └── [4.0K]  users
        │   │   │       ├── [4.0K]  class
        │   │   │       │   └── [ 617]  matchHistory.class.ts
        │   │   │       ├── [4.0K]  dto
        │   │   │       │   ├── [ 486]  create-users.dto.ts
        │   │   │       │   ├── [ 214]  partial-users.dto.ts
        │   │   │       │   └── [ 435]  update-users.dto.ts
        │   │   │       ├── [4.0K]  entities
        │   │   │       │   ├── [ 512]  matchHistory.entity.ts
        │   │   │       │   ├── [1.6K]  user.entity.ts
        │   │   │       │   └── [ 341]  userStat.entities.ts
        │   │   │       ├── [ 377]  sendableUsers.ts
        │   │   │       ├── [ 485]  users.controller.spec.ts
        │   │   │       ├── [4.4K]  users.controller.ts
        │   │   │       ├── [ 895]  users.module.ts
        │   │   │       ├── [ 453]  users.service.spec.ts
        │   │   │       └── [6.3K]  users.service.ts
        │   │   ├── [4.0K]  test
        │   │   │   ├── [ 630]  app.e2e-spec.ts
        │   │   │   └── [ 183]  jest-e2e.json
        │   │   ├── [  97]  tsconfig.build.json
        │   │   └── [ 546]  tsconfig.json
        │   └── [ 202]  Dockerfile
        ├── [4.0K]  nginx
        │   └── [4.0K]  conf
        │       ├── [1.4K]  default.conf
        │       └── [ 729]  nginx.conf
        └── [4.0K]  svelte
            ├── [4.0K]  api_front
            │   ├── [ 984]  package.json
            │   ├── [ 63K]  package-lock.json
            │   ├── [4.0K]  public
            │   │   ├── [4.0K]  build
            │   │   │   ├── [ 25K]  bundle.css
            │   │   │   ├── [865K]  bundle.js
            │   │   │   └── [749K]  bundle.js.map
            │   │   ├── [ 15K]  favicon.ico
            │   │   ├── [4.0K]  fonts
            │   │   │   ├── [ 56K]  1968-Odyssey-3D.ttf.eot
            │   │   │   ├── [134K]  1968-Odyssey-3D.ttf.svg
            │   │   │   ├── [ 22K]  1968-Odyssey-3D.ttf.woff
            │   │   │   ├── [ 61K]  1968-Odyssey-Gradient.ttf.eot
            │   │   │   ├── [127K]  1968-Odyssey-Gradient.ttf.svg
            │   │   │   ├── [ 19K]  1968-Odyssey-Gradient.ttf.woff
            │   │   │   ├── [ 16K]  AddFatMan.ttf.eot
            │   │   │   ├── [ 16K]  AddFatMan.ttf.svg
            │   │   │   ├── [8.0K]  AddFatMan.ttf.woff
            │   │   │   ├── [ 62K]  Air-Conditioner.ttf.eot
            │   │   │   ├── [134K]  Air-Conditioner.ttf.svg
            │   │   │   ├── [ 27K]  Air-Conditioner.ttf.woff
            │   │   │   ├── [ 49K]  Barcade.otf
            │   │   │   ├── [3.1K]  Bit5x3.woff
            │   │   │   ├── [2.0K]  Bit5x3.woff2
            │   │   │   ├── [ 50K]  Bondi.ttf.eot
            │   │   │   ├── [107K]  Bondi.ttf.svg
            │   │   │   ├── [ 21K]  Bondi.ttf.woff
            │   │   │   ├── [ 12K]  Monocode-Regular-Demo.ttf.eot
            │   │   │   ├── [ 27K]  Monocode-Regular-Demo.ttf.svg
            │   │   │   ├── [6.4K]  Monocode-Regular-Demo.ttf.woff
            │   │   │   ├── [ 19K]  PressStart2P.woff
            │   │   │   └── [ 13K]  PressStart2P.woff2
            │   │   ├── [1.5K]  global.css
            │   │   ├── [4.0K]  img
            │   │   │   ├── [169K]  BACKGROUND.png
            │   │   │   ├── [109K]  cartoon_potato3.jpg
            │   │   │   ├── [1.2K]  default.png
            │   │   │   ├── [ 51K]  logo_potato.png
            │   │   │   ├── [124K]  potato_logo.png
            │   │   │   ├── [181K]  potato_only.png
            │   │   │   └── [407K]  SPLASH_PAGE_BACKGROUND.png
            │   │   ├── [ 397]  index.html
            │   │   └── [4.0K]  sound
            │   │       ├── [4.0K]  pong
            │   │       │   ├── [4.1K]  0.ogg
            │   │       │   ├── [4.1K]  10.ogg
            │   │       │   ├── [4.2K]  11.ogg
            │   │       │   ├── [4.3K]  12.ogg
            │   │       │   ├── [4.2K]  13.ogg
            │   │       │   ├── [4.3K]  14.ogg
            │   │       │   ├── [4.1K]  15.ogg
            │   │       │   ├── [4.3K]  16.ogg
            │   │       │   ├── [4.3K]  17.ogg
            │   │       │   ├── [4.2K]  18.ogg
            │   │       │   ├── [4.3K]  19.ogg
            │   │       │   ├── [4.2K]  1.ogg
            │   │       │   ├── [4.1K]  20.ogg
            │   │       │   ├── [4.2K]  21.ogg
            │   │       │   ├── [4.2K]  22.ogg
            │   │       │   ├── [4.1K]  23.ogg
            │   │       │   ├── [4.1K]  24.ogg
            │   │       │   ├── [4.2K]  25.ogg
            │   │       │   ├── [4.3K]  26.ogg
            │   │       │   ├── [4.1K]  27.ogg
            │   │       │   ├── [4.1K]  28.ogg
            │   │       │   ├── [4.1K]  29.ogg
            │   │       │   ├── [4.3K]  2.ogg
            │   │       │   ├── [4.2K]  30.ogg
            │   │       │   ├── [4.2K]  31.ogg
            │   │       │   ├── [4.3K]  32.ogg
            │   │       │   ├── [4.2K]  3.ogg
            │   │       │   ├── [4.4K]  4.ogg
            │   │       │   ├── [4.1K]  5.ogg
            │   │       │   ├── [4.1K]  6.ogg
            │   │       │   ├── [4.3K]  7.ogg
            │   │       │   ├── [4.2K]  8.ogg
            │   │       │   └── [4.2K]  9.ogg
            │   │       └── [6.2K]  roblox-oof.ogg
            │   ├── [2.3K]  rollup.config.js
            │   ├── [4.0K]  src
            │   │   ├── [ 639]  App.svelte
            │   │   ├── [  32]  global.d.ts
            │   │   ├── [ 225]  main.js
            │   │   ├── [ 258]  main.js.map
            │   │   ├── [ 136]  main.ts
            │   │   ├── [4.0K]  pages
            │   │   │   ├── [4.0K]  game
            │   │   │   │   ├── [4.0K]  client
            │   │   │   │   │   ├── [1.2K]  audio.ts
            │   │   │   │   │   ├── [4.0K]  class
            │   │   │   │   │   │   ├── [1.0K]  GameArea.ts
            │   │   │   │   │   │   ├── [4.0K]  GameComponentsClient.ts
            │   │   │   │   │   │   ├── [ 460]  InitOptions.ts
            │   │   │   │   │   │   ├── [ 351]  InputHistory.ts
            │   │   │   │   │   │   ├── [3.9K]  RectangleClient.ts
            │   │   │   │   │   │   └── [1.7K]  Text.ts
            │   │   │   │   │   ├── [ 692]  constants.ts
            │   │   │   │   │   ├── [ 720]  draw.ts
            │   │   │   │   │   ├── [2.1K]  gameLoop.ts
            │   │   │   │   │   ├── [ 644]  global.ts
            │   │   │   │   │   ├── [2.7K]  handleInput.ts
            │   │   │   │   │   ├── [1.5K]  init.ts
            │   │   │   │   │   ├── [1.7K]  message.ts
            │   │   │   │   │   ├── [1.1K]  pongSpectator.ts
            │   │   │   │   │   ├── [2.7K]  pong.ts
            │   │   │   │   │   ├── [ 547]  utils.ts
            │   │   │   │   │   └── [ 10K]  ws.ts
            │   │   │   │   ├── [6.1K]  GameSpectator.svelte
            │   │   │   │   ├── [ 12K]  Game.svelte
            │   │   │   │   ├── [2.1K]  Ranking.svelte
            │   │   │   │   └── [4.0K]  shared_js
            │   │   │   │       ├── [4.0K]  class
            │   │   │   │       │   ├── [3.2K]  Event.ts
            │   │   │   │       │   ├── [1.8K]  GameComponents.ts
            │   │   │   │       │   ├── [ 384]  interface.ts
            │   │   │   │       │   ├── [4.3K]  Rectangle.ts
            │   │   │   │       │   └── [ 938]  Vector.ts
            │   │   │   │       ├── [1.1K]  constants.ts
            │   │   │   │       ├── [ 646]  enums.ts
            │   │   │   │       ├── [ 613]  utils.ts
            │   │   │   │       └── [ 687]  wallsMovement.ts
            │   │   │   ├── [ 364]  NotFound.svelte
            │   │   │   ├── [4.0K]  profile
            │   │   │   │   ├── [ 957]  ProfileDisplayOneUser.svelte
            │   │   │   │   ├── [ 985]  ProfileDisplay.svelte
            │   │   │   │   ├── [ 206]  ProfilePage.svelte
            │   │   │   │   ├── [4.8K]  ProfileSettings.svelte
            │   │   │   │   └── [ 16K]  ProfileUsers.svelte
            │   │   │   ├── [2.0K]  SplashPage.svelte
            │   │   │   ├── [2.0K]  TwoFactorAuthentication.svelte
            │   │   │   └── [ 296]  UnauthorizedAccessPage.svelte
            │   │   ├── [4.0K]  pieces
            │   │   │   ├── [1.2K]  Button.svelte
            │   │   │   ├── [ 183]  Card.svelte
            │   │   │   ├── [4.0K]  chat
            │   │   │   │   ├── [2.2K]  Chat_box_css.svelte
            │   │   │   │   ├── [1.7K]  Chat_layouts.svelte
            │   │   │   │   ├── [3.5K]  Chat.svelte
            │   │   │   │   ├── [3.7K]  Element_button.svelte
            │   │   │   │   ├── [1.3K]  Element_msg.svelte
            │   │   │   │   ├── [ 214]  Element_warning.svelte
            │   │   │   │   ├── [2.0K]  Layout_close.svelte
            │   │   │   │   ├── [3.8K]  Layout_create.svelte
            │   │   │   │   ├── [2.2K]  Layout_home.svelte
            │   │   │   │   ├── [1.9K]  Layout_invite.svelte
            │   │   │   │   ├── [7.5K]  Layout_mute.svelte
            │   │   │   │   ├── [1.8K]  Layout_new.svelte
            │   │   │   │   ├── [3.1K]  Layout_password.svelte
            │   │   │   │   ├── [2.8K]  Layout_room_set.svelte
            │   │   │   │   ├── [2.7K]  Layout_room.svelte
            │   │   │   │   ├── [1.7K]  Layout_settings.svelte
            │   │   │   │   ├── [3.4K]  Layout_user.svelte
            │   │   │   │   ├── [7.1K]  Request_rooms.ts
            │   │   │   │   ├── [1.3K]  Request_utils.ts
            │   │   │   │   ├── [2.0K]  Socket_chat.ts
            │   │   │   │   ├── [ 961]  Store_chat.ts
            │   │   │   │   ├── [ 797]  Types_chat.ts
            │   │   │   │   └── [  63]  Utils_chat.ts
            │   │   │   ├── [ 321]  clickOutside.ts
            │   │   │   ├── [ 813]  DisplayAUser.svelte
            │   │   │   ├── [ 326]  Footer.svelte
            │   │   │   ├── [5.9K]  GenerateUserDisplay.svelte
            │   │   │   ├── [2.5K]  Header.svelte
            │   │   │   ├── [3.3K]  MatchHistory.svelte
            │   │   │   ├── [1.2K]  MatchOngoingElem.svelte
            │   │   │   ├── [ 453]  Match.ts
            │   │   │   ├── [  89]  store_invitation.ts
            │   │   │   ├── [  85]  store_showHeader.ts
            │   │   │   ├── [1.5K]  Tabs.svelte
            │   │   │   └── [1.4K]  utils.ts
            │   │   └── [4.0K]  routes
            │   │       ├── [1.2K]  primaryRoutes.ts
            │   │       └── [ 642]  profileRoutes.ts
            │   └── [ 171]  tsconfig.json
            └── [ 112]  Dockerfile

```

