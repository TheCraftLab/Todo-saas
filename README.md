# Todo SaaS Starter (React + API + Postgres)

Objectif: coder sur Mac, pousser sur Git, faire `git pull` sur le Pi, et voir les changements sans redeployer la stack.

## Stack dev Pi
- `todo-web`: React + Vite (port `5173`)
- `todo-api`: Node/Express (port `3001`)
- `todo-db`: Postgres (port `5432`)

Fichiers montes sur le Pi:
- `/home/kevin/Todo-saas/frontend:/app`
- `/home/kevin/Todo-saas/backend:/app`

## 1) Mettre le code sur le Pi
Depuis Mac:
```bash
cd "/Users/kevin/Documents/Todo saas"
git add .
git commit -m "update"
git push origin main
```

Sur le Pi:
```bash
cd /home/kevin/Todo-saas
git pull --ff-only
```

## 2) Deployer la stack dans Portainer
Deploie la stack avec `docker-compose.pi.dev.yml`.

Important: le dossier du repo sur le Pi doit etre exactement:
`/home/kevin/Todo-saas`

## 3) Tester l'API (etape backend)
Sur le Pi:
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/todos
curl -X POST http://localhost:3001/api/todos -H "Content-Type: application/json" -d '{"title":"Tester API"}'
curl -X PATCH http://localhost:3001/api/todos/1 -H "Content-Type: application/json" -d '{"done":true}'
curl -X DELETE http://localhost:3001/api/todos/1
```

## 4) Workflow sans redeployer
- Modifie le code sur Mac.
- `git push` puis `git pull` sur le Pi.
- `todo-web` (Vite) et `todo-api` (nodemon) detectent les changements de fichiers.

Si tu modifies les dependances (`package.json`), redemarre seulement le service concerne:
```bash
docker restart todo-web-dev
docker restart todo-api-dev
```

## 5) Frontend connecte a l'API
- Le frontend appelle `/api/todos`.
- Vite proxy automatiquement vers `todo-api:3001`.
- Depuis le telephone (5G), tu n'as besoin d'exposer que le port `5173`.
