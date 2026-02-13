# Todo SaaS Starter (React + Docker dev)

Objectif: modifier un fichier sans redeployer la stack.

## Pourquoi ca marche
- Le code est monte dans le conteneur avec un bind mount (`/home/kevin/todo-saas/frontend:/app`).
- Vite tourne en mode dev (`npm run dev`) et fait le hot reload.
- Chaque sauvegarde de fichier est prise en compte sans redeploiement.

## 1) Mettre les fichiers sur le Pi4B (recommande: Git)
Depuis ta machine de dev:
```bash
cd "/Users/kevin/Documents/Todo saas"
git init
git add .
git commit -m "Init todo saas react dev stack"
git branch -M main
git remote add origin <URL_DE_TON_REPO_GIT>
git push -u origin main
```

Puis sur le Pi4B:
```bash
mkdir -p /home/kevin
cd /home/kevin
git clone <URL_DE_TON_REPO_GIT> todo-saas
```

## 2) Stack Portainer (fichiers physiquement sur le Pi)
Utilise `docker-compose.pi.dev.yml` dans Portainer (Web editor ou Repository).

Le volume principal est:
`/home/kevin/todo-saas/frontend:/app`

Donc Portainer et Docker lisent le code qui est sur le disque du Pi.

## 3) Workflow VS Code sans redeployer
- Connecte VS Code en Remote SSH sur le Pi.
- Ouvre `/home/kevin/todo-saas`.
- Modifie les fichiers dans `frontend/src`.
- Le navigateur sur `http://<IP_DU_PI>:5173` se met a jour en direct.

## Notes utiles
- Premier demarrage plus long (installation npm).
- Si besoin de mise a jour code depuis Git sur le Pi: `cd /home/kevin/todo-saas && git pull`.
- Pour la prod, cree une stack separee sans bind mount.
