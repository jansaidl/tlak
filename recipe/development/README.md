# Tlak — Development / self-hosted environment

<!-- #ZEROPS_EXTRACT_START:intro# -->
**Development** environment for Tlak: single-node PostgreSQL on `oltp-hobby`, single app
container with 1–4 GB RAM autoscaling. Suitable for personal / self-hosted use with a small
number of users. For public multi-user deployments use the `production` environment.
<!-- #ZEROPS_EXTRACT_END:intro# -->

## Post-import steps

1. Enable a public subdomain (or attach a custom domain) on the `tlak` service.
2. Set `WEBAUTHN_RP_ID`, `WEBAUTHN_ORIGIN`, `AUTH_URL` to that domain.
3. Generate VAPID keys locally and set `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`.
4. Restart `tlak` (env changes trigger this automatically).
5. Open the URL, register your passkey.

Full checklist and env var reference: [root README.md](../../README.md).
