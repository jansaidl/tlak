# Tlak — Production environment

<!-- #ZEROPS_EXTRACT_START:intro# -->
**Production** environment for Tlak: highly-available PostgreSQL cluster on `oltp-production`,
minimum 2 app containers with autoscaling up to 6, dedicated core package. Suitable for
public multi-user deployments.
<!-- #ZEROPS_EXTRACT_END:intro# -->

<!-- #ZEROPS_EXTRACT_START:maintenance-guide# -->
## Upgrading the app

`buildFromGit` clones the linked repository on every deploy. To ship a new version:

1. Merge the change to the branch referenced in `buildFromGit` (default: `main`).
2. Trigger a redeploy in the Zerops dashboard (or wire a `zcli push` webhook /
   GitHub Action for automatic redeploys).
3. `zsc execOnce ${appVersionId} -- node migrate.cjs` in `zerops.yaml` runs pending
   Drizzle migrations exactly once per deployed version, even across multiple containers.

## Database backups

Enable automated backups on the `db` service (dashboard → Backups). Recommended: daily
retention 14+ days for a production instance.

## Rotating passkeys / secrets

- `AUTH_SECRET` rotation invalidates all active sessions (users get logged out — safe).
- `WEBAUTHN_RP_ID` change invalidates all existing passkeys — users must re-register.
  Never change this on a live production without a migration plan.
- `VAPID_PRIVATE_KEY` rotation invalidates existing push subscriptions — users need to
  re-enable notifications in Settings.
<!-- #ZEROPS_EXTRACT_END:maintenance-guide# -->

## Post-import checklist

1. Attach a custom domain to the `tlak` service.
2. Set `WEBAUTHN_RP_ID`, `WEBAUTHN_ORIGIN`, `AUTH_URL` to that domain.
3. Generate VAPID keys and set the three `VAPID_*` variables.
4. Enable database backups on `db`.
5. Wire the reminder cron: `GET /api/cron/reminders?token=<CRON_SECRET>` on your schedule.
6. Restart `tlak`.
