# Reverse Proxy (Nginx)

## Purpose

How Nginx routes traffic to the application — the piece sitting between Cloudflare and the Next.js app.

## Role

```
Cloudflare → Nginx → Next.js app (port 3000, internal)
```

Nginx handles:

- SSL termination (via Let's Encrypt certificates)
- Routing all traffic to the Next.js process
- Basic request buffering/timeouts before requests reach the application

## Why Not Expose Next.js Directly

Standard practice, and specifically called out in the original infrastructure conversation: Nginx provides a stable, well-understood layer for SSL and routing, decoupled from the application process itself — the app can restart/redeploy without the public-facing HTTPS layer being affected.

## Open Questions

- None blocking — standard, already-agreed configuration from the earlier conversation.