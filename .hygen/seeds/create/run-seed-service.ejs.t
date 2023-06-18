---
inject: true
to: src/seeds/run-seed.ts
before: close
---
  await app.get(<%= name %>SeedService).run();
