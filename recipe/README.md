# Tlak — Zerops Recipe

<!-- #ZEROPS_EXTRACT_START:intro# -->
Deploy [Tlak](https://github.com/jansaidl/tlak) — a self-hostable, multi-tenant
blood pressure tracker with passkey auth, PWA push reminders, PDF export and Czech + English
UI — on [Zerops](https://zerops.io).
<!-- #ZEROPS_EXTRACT_END:intro# -->

Two environment shapes are offered:

| Shape                                | Postgres                | Runtime scaling               | Best for                              |
|--------------------------------------|-------------------------|-------------------------------|----------------------------------------|
| [`development`](./development)       | `single@17` `oltp-hobby`| 1 container, 1–4 GB RAM       | personal / self-hosted use, low traffic|
| [`production`](./production)         | `ha@17` `oltp-production`| ≥2 containers, autoscaling   | public multi-user deployments          |

Pick the folder matching your target, open its `import.yaml`, and paste it into
Zerops dashboard → *Import project*. Then follow the post-import checklist in the root
[README.md](../README.md).

---

For more Zerops recipes see https://app.zerops.io/recipes.

Need help? Join the [Zerops Discord community](https://discord.gg/zeropsio).
