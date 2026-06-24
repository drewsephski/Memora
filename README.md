<p align="center">
  <img width="1000" alt="Memora" src="https://github.com/user-attachments/assets/76e2c674-d683-487c-bf02-ac8bccf19e69" />
</p>

# [Memora](https://memoralabs.dev) by Memora Labs — Build powerful RAG applications with any data source, at any scale.

> ⚡ RAG-as-a-Service by [Memora Labs](https://memoralabs.dev) — spin up vector search + chat API in <5 min  
> 📈 630▲ on Product Hunt  
> _Formerly Supavec_

[![](https://dcbadge.limes.pink/api/server/https://discord.gg/MS9CjPeXF4)](https://discord.gg/MS9CjPeXF4)
[![Analytics – Powered by PostHog](https://img.shields.io/badge/analytics-PostHog-f54d27)](https://posthog.com/)
[![Backend – Powered by Supabase](https://img.shields.io/badge/backend-Supabase-3ECF8E)](https://supabase.com/)

## Cloud version

https://memoralabs.dev

## Our simple API endpoints ✨

[docs.memoralabs.dev](https://docs.memoralabs.dev/).

## Related repositories

- [drewsephski/Memora Python API](https://github.com/drewsephski/memora-python-api)

## Built with

* [Next.js](https://nextjs.org/)
* [Supabase](https://supabase.com/)
* [Tailwind CSS](https://tailwindcss.com/)
* [Bun](https://bun.sh/)
* [Upstash](https://upstash.com/)

## API docs

https://github.com/drewsephski/Memora/blob/main/packages/api/README.md



---

## Architecture & Design Philosophy

### Scalable Multi-Tenant Design
- **Row-Level Security (RLS)** for team-level data isolation  
- **Usage‑based billing**: Free 100 → Basic 750 → Ent 5000 req/mo  
- **Batch embeddings**: OpenAI cost **-65 %**

### Vector Search Optimisation
- **Configurable chunk & overlap** (+12 pts recall)  
- **Hybrid filter** (file_id + cosine) P95 **210 ms**  

## Performance & Observability

### Real‑time Analytics
- **PostHog integration** product & API events tracked (11 schema)
- **Request‑level tracing** with unique IDs for rapid debugging
- **Async usage logging** non‑blocking main flow

### API Performance
- **Streaming or standard responses** selectable per request  
- **100‑doc batch embedding** reduces latency + cost  
- **Background processing** keeps critical path lean

```typescript
// Example: choose streaming or standard chat responses
const response = await fetch('/chat', {
  method: 'POST',
  body: JSON.stringify({
    query: 'What is this document about?',
    file_ids: ['uuid-here'],
    stream: true // set false for JSON
  })
});
```

## Developer Experience

- **Visual debugging**: live embedding preview in chat UI  
- **Progressive disclosure**: guided onboarding & contextual states  
- **API-first design**: REST endpoints + comprehensive errors  
- **Redis-backed rate limiting**: sliding-window strategy


---


## Getting Started

### Install dependencies

```bash
bun i
```

### Run the development server

```bash
bun dev
```

#### Run the web server

```bash
cd apps/web && bun run dev
```

#### Run the API server

```bash
cd packages/api && bun run dev
```
