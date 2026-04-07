# IWR Moda - Infrastructure Scripts

## Backup Automático

### Windows (Task Scheduler)
1. Open Task Scheduler
2. Create Basic Task → "IWR Moda Backup"
3. Trigger: Daily at 02:00
4. Action: Start a program
   - Program: `powershell.exe`
   - Arguments: `-ExecutionPolicy Bypass -File "C:\Users\Carlos\Desktop\projetos\Ismael-Loja\infra\backup.ps1"`
5. Save

### Linux/Mac (cron)
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/iwr-moda/infra/backup.sh /path/to/backups >> /path/to/backups/cron.log 2>&1
```

## Backup Manual

### Windows
```cmd
REM CMD
infra\backup.bat

REM PowerShell
.\infra\backup.ps1

REM Custom directory
.\infra\backup.ps1 D:\meus-backups
```

### Linux/Mac
```bash
# Create backup
./infra/backup.sh

# Create backup in custom directory
./infra/backup.sh /path/to/my/backups
```

### Listar Backups
```cmd
# Windows
dir backups\*.sql.gz

# PowerShell
Get-ChildItem backups\*.sql.gz | Format-Table Name, Length, LastWriteTime
```

## Restore

### Windows
```cmd
# CMD - listar e restaurar
infra\restore.bat

# PowerShell
.\infra\restore.ps1

# Restaurar específico
.\infra\restore.ps1 backups\iwr_moda_backup_20260407_020000.sql.gz
```

### Linux/Mac
```bash
# Listar e restaurar
./infra/restore.sh

# Restaurar específico
./infra/restore.sh backups/iwr_moda_backup_20260407_020000.sql.gz
```

## Job Automático - Títulos Vencidos (OVERDUE)

O sistema marca automaticamente títulos pendentes vencidos como OVERDUE.

### Via API (recomendado)
```bash
# Chamar endpoint (requer token ADMIN)
curl -X POST http://localhost:3001/api/promissory-notes/mark-overdue \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

### Via Script
```bash
# Backend
cd backend
npm run overdue:check
```

### Agendamento Automático

#### Windows (Task Scheduler)
1. Open Task Scheduler
2. Create Basic Task → "IWR Moda Overdue Check"
3. Trigger: Daily at 00:00
4. Action: Start a program
   - Program: `powershell.exe`
   - Arguments: `-ExecutionPolicy Bypass -Command "cd C:\Users\Carlos\Desktop\projetos\Ismael-Loja\backend && npm run overdue:check"`

#### Linux/Mac (cron)
```bash
crontab -e
# Rodar diariamente à meia-noite
0 0 * * * cd /path/to/backend && npm run overdue:check >> /var/log/iwr-overdue.log 2>&1
```

#### Docker (docker-compose)
Adicione ao backend no docker-compose:
```yaml
backend:
  # ...existing config...
  command: >
    sh -c "
      npx prisma migrate deploy &&
      node dist/server.js &
      while true; do
        npm run overdue:check;
        sleep 86400;
      done
    "
```

```bash
# Connect to database shell
docker exec -it iwr-db psql -U postgres -d iwr_moda

# View tables
\dt

# Query example
SELECT * FROM users;
```
