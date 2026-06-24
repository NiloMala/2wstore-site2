# Supabase Studio na VPS (ligar/desligar para economizar RAM)

Os containers `supabase-studio`, `supabase-analytics`, `supabase-meta` e `supabase-vector`
servem apenas para o **painel de administração** (Studio, table editor, logs).
Eles **não são usados pela loja em produção** (REST API, Auth, Storage, Edge Functions e
Checkout continuam funcionando normalmente sem eles).

Para economizar RAM na VPS, mantenha esses 4 containers parados no dia a dia e ligue-os
só quando precisar acessar o Studio.

## Scripts

Crie os dois arquivos abaixo na VPS (ex: em `/root/scripts/`) e dê permissão de execução:

```bash
mkdir -p /root/scripts
chmod +x /root/scripts/studio-on.sh /root/scripts/studio-off.sh
```

### `studio-on.sh` — liga o Studio

```bash
#!/bin/bash
docker start supabase-vector supabase-analytics supabase-meta supabase-studio
```

### `studio-off.sh` — desliga o Studio

```bash
#!/bin/bash
docker stop supabase-studio supabase-analytics supabase-meta supabase-vector
```

## Uso

```bash
/root/scripts/studio-on.sh    # antes de usar o painel admin
/root/scripts/studio-off.sh   # depois de terminar
```

## Evitar que voltem sozinhos num reboot da VPS

Por padrão esses containers têm restart policy automática. Para que fiquem parados
mesmo após reiniciar a VPS (até você rodar `studio-on.sh` manualmente):

```bash
docker update --restart=no supabase-studio supabase-analytics supabase-meta supabase-vector
```

## Verificar memória liberada

```bash
free -h
docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep -i supabase
```
