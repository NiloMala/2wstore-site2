# Supabase Studio na VPS

Diretório do Docker Compose: `/opt/supabase/docker`

## Ativar (subir todos os containers)

```bash
cd /opt/supabase/docker && docker compose up -d
```

## Desativar Studio (economizar recursos)

```bash
cd /opt/supabase/docker && docker compose stop supabase-studio
```

## Reativar só o Studio

```bash
cd /opt/supabase/docker && docker compose start supabase-studio
```

## Parar tudo (manutenção)

```bash
cd /opt/supabase/docker && docker compose down
```

## Verificar status dos containers

```bash
cd /opt/supabase/docker && docker compose ps
```

## Ver logs do Studio

```bash
cd /opt/supabase/docker && docker compose logs supabase-studio -f
```

---

> Studio disponível em: `supa.2wl...` (somente quando o container estiver rodando)
> Os demais containers (banco, auth, API, storage) continuam ativos mesmo com o Studio parado.
