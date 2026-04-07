#!/bin/bash
# Deploy script para produção
# Uso: ./deploy.sh [server_user@server_host]

set -e

REMOTE="${1:-}"
BRANCH="main"
REMOTE_DIR="/opt/iwr-moda"

if [ -z "${REMOTE}" ]; then
    echo "=== IWR Moda - Deploy Manual ==="
    echo ""
    echo "Este script faz deploy em um servidor remoto via SSH."
    echo ""
    echo "Uso: ./deploy.sh <user@host>"
    echo ""
    echo "Pré-requisitos no servidor:"
    echo "  - Docker e Docker Compose instalados"
    echo "  - SSH configurado"
    echo "  - Arquivo .env.production criado em ${REMOTE_DIR}"
    echo ""
    echo "Exemplo:"
    echo "  ./deploy.sh deploy@192.168.1.100"
    exit 1
fi

echo "=== IWR Moda - Deploy ==="
echo "Branch: ${BRANCH}"
echo "Remote: ${REMOTE}"
echo "Remote dir: ${REMOTE_DIR}"
echo ""

# Verificar se há alterações não commitadas
if [ -n "$(git status --porcelain)" ]; then
    echo "WARNING: Há alterações não commitadas!"
    read -p "Continuar mesmo assim? (yes/no): " confirm
    if [ "${confirm}" != "yes" ]; then
        echo "Deploy cancelado"
        exit 1
    fi
fi

# Garantir que estamos na branch correta
git checkout ${BRANCH}
git pull origin ${BRANCH}

echo ""
echo "Enviando arquivos para o servidor..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'backups' \
    -e ssh ./ ${REMOTE}:${REMOTE_DIR}/

echo ""
echo "Executando deploy remoto..."
ssh ${REMOTE} << 'ENDSSH'
cd /opt/iwr-moda
echo "Subindo containers..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
echo ""
echo "Limpando imagens antigas..."
docker image prune -f
echo ""
echo "Verificando status..."
docker compose -f docker-compose.prod.yml ps
ENDSSH

echo ""
echo "=== Deploy concluído ==="
echo "Aguarde ~60s para os health checks passarem."
echo "Verifique em: http://${REMOTE}/api/health"
