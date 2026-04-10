# grandt-frontend

Frontend en React + TypeScript + Vite usado en la charla **"No todo es Kubernetes"**, donde muestro cómo levantar un servicio en AWS con **Amplify** (frontend) y **ECS Fargate + CodePipeline** (backend) como alternativa a Kubernetes.

Repo del backend: [mkreder/grandt-backend](https://github.com/mkreder/grandt-backend)

## Stack

- **Framework**: React 18 + TypeScript + Vite
- **Deploy**: AWS Amplify Hosting (build y deploy automáticos desde GitHub)
- **API**: consume el backend FastAPI vía API Gateway bajo `/core/*`

## Correr local

```bash
npm install
npm run dev
```

El backend debe estar corriendo (ver instrucciones en [grandt-backend](https://github.com/mkreder/grandt-backend)).

## Arquitectura en AWS

```
GitHub ──▶ Amplify Hosting ──▶ CloudFront
                                    │
                                    ▼
                        API Gateway /core/* ──▶ ALB ──▶ ECS Fargate
```
