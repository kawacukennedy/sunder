# Maintenance & Cron Setup

CodeEngage 2.0 requires periodic tasks for system maintenance, cleanup, and cache invalidation.

## Required Cron Jobs

Add the following to your crontab (`crontab -e`):

```bash
# Cleanup expired collaboration sessions every hour
0 * * * * php /path/to/codeengage-backend/scripts/cron.php --task=cleanup-sessions

# Rotate audit logs and clear old cache files daily at 3am
0 3 * * * php /path/to/codeengage-backend/scripts/cron.php --task=rotate-logs

# Regenerate leaderboard stats every 6 hours
0 */6 * * * php /path/to/codeengage-backend/scripts/cron.php --task=update-leaderboards

# Backup database daily at midnight
0 0 * * * /path/to/codeengage-backend/scripts/backup.sh
```

## Manual Maintenance

You can run these tasks manually:

```bash
cd /path/to/codeengage-backend
php scripts/cron.php --task=cleanup-sessions
```
