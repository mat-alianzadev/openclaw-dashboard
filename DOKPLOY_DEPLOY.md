# OpenClaw Dashboard - Dokploy Deployment Script

## Paso 1: Acceder a Dokploy
URL: http://192.168.1.75:3000

## Paso 2: Crear nueva aplicación
1. Ve a "Applications" → "Create Application"
2. Selecciona "Git"
3. Configuración:
   - **Name**: openclaw-dashboard
   - **Repository**: https://github.com/mat-alianzadev/openclaw-dashboard
   - **Branch**: main
   - **Build Path**: /
   - **Dockerfile**: Dockerfile (enable "Use Dockerfile")

## Paso 3: Configurar variables de entorno

Añade estas variables en la sección "Environment Variables":

```
JWT_SECRET=openclaw-dashboard-secret-$(openssl rand -hex 32)
OPENCLAW_GATEWAY_URL=ws://host.docker.internal:18789
OPENCLAW_REST_URL=http://host.docker.internal:18789
OPENCLAW_GATEWAY_TOKEN=22c61a9971efc1aabea751b99198022c4f2a240ec8152a3c
NEXT_PUBLIC_APP_URL=https://openclaw-dashboard.yourdomain.com
```

## Paso 4: Configurar dominio

En "Domains":
- **Domain**: openclaw-dashboard.local o tu dominio
- **Port**: 3000
- **HTTPS**: Enable (si tienes certificado)

## Paso 5: Deploy

Haz clic en "Deploy"

## O usar docker-compose directamente

Si prefieres usar el archivo docker-compose.yml ya creado:

```bash
# En tu servidor
cd /opt/dokploy/compose/openclaw-dashboard
curl -o docker-compose.yml https://raw.githubusercontent.com/mat-alianzadev/openclaw-dashboard/main/docker-compose.yml

# Ejecutar
docker-compose up -d
```

## Acceso por defecto

- **Usuario**: admin
- **Contraseña**: admin123

## Verificación post-deploy

1. Abre la URL de la aplicación
2. Deberías ver la página de login
3. Ingresa con admin/admin123
4. Verifica que el "Connection Status" en la esquina superior derecha esté "Connected"
