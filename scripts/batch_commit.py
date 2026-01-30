import subprocess
import sys

commits = [
    (["codeengage-backend/scripts/migrate.php"], "fix(database): Patch migration runner for array-based definitions"),
    (["codeengage-backend/migrations/007_create_auth_security_tables.php"], "feat(database): Add user tokens authentication tables"),
    (["codeengage-backend/app/Services/OrganizationService.php", "codeengage-backend/app/Repositories/OrganizationRepository.php", "codeengage-backend/app/Controllers/Api/OrganizationController.php"], "feat(organizations): Implement Organization service and controller"),
    (["codeengage-backend/app/Services/AuthService.php"], "feat(auth): Update registration logic and token handling"),
    (["codeengage-backend/app/Middleware/AuthMiddleware.php"], "refactor(auth): Improve AuthMiddleware security checks"),
    (["codeengage-backend/scripts/backup.sh"], "feat(devops): Add database backup shell script"),
    (["codeengage-backend/scripts/rollback.sh"], "feat(devops): Add functionality to rollback application version"),
    (["codeengage-backend/public/cron.php"], "feat(devops): Add cron entry point for scheduled tasks"),
    (["codeengage-backend/app/Helpers/Logger.php", "codeengage-backend/app/Services/LoggerService.php"], "feat(logging): Add structured JSON logger"),
    (["codeengage-backend/app/Services/MalwareScannerService.php", "codeengage-backend/app/Helpers/SecurityHelper.php"], "feat(security): Add malware scanner and security helpers"),
    (["codeengage-backend/app/Controllers/Api/ApiKeyController.php", "codeengage-backend/app/Repositories/ApiKeyRepository.php", "codeengage-backend/app/Models/ApiKey.php", "codeengage-backend/migrations/021_create_api_keys_table.php"], "feat(api-keys): Implement API Key management"),
    (["codeengage-frontend/src/js/modules/api/client.js"], "fix(frontend): Add CSRF token header to requests"),
    (["codeengage-backend/migrations/008_create_chat_messages_table.php"], "feat(chat): Add chat messages database migration"),
    (["codeengage-backend/migrations/022_add_performance_indexes.php"], "perf(database): Add indexes for query optimization"),
    (["codeengage-backend/app/Services/LoggedPDO.php"], "feat(database): Add LoggedPDO for query monitoring"),
    (["codeengage-backend/app/Middleware/SecurityHeadersMiddleware.php"], "feat(security): Add security headers middleware"),
    (["codeengage-frontend/src/js/app.js"], "feat(frontend): Update main application logic"),
    (["codeengage-frontend/src/js/router.js"], "feat(frontend): Update client-side router configuration"),
    (["codeengage-frontend/src/js/modules/components/collaborative-editor.js"], "feat(editor): Update collaborative editor component"),
    (["codeengage-backend/app/Services/AnalysisService.php", "codeengage-backend/app/Helpers/CodeHelper.php"], "feat(analysis): Update code analysis service"),
    (["codeengage-frontend/index.html", "codeengage-frontend/src/css/main.css"], "style(frontend): Update main HTML and CSS")
]

success_count = 0

for files, message in commits:
    # Check if files exist/modified
    found_files = []
    for f in files:
        if subprocess.run(f"ls {f}", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0:
            found_files.append(f)
    
    if not found_files:
        print(f"Skipping commit '{message}': No files found.")
        continue

    # Git Add
    cmd_add = ["git", "add"] + found_files
    result_add = subprocess.run(cmd_add)
    
    if result_add.returncode != 0:
        print(f"Failed to add files for '{message}'")
        continue

    # Git Commit
    cmd_commit = ["git", "commit", "-m", message]
    result_commit = subprocess.run(cmd_commit, capture_output=True, text=True)
    
    if result_commit.returncode == 0:
        print(f"✅ Committed: {message}")
        success_count += 1
    else:
        if "nothing to commit" in result_commit.stdout:
            print(f"⚠️  Skipping '{message}': Nothing to commit")
        else:
            print(f"❌ Failed to commit '{message}': {result_commit.stderr}")

print(f"\nTotal Commits Created: {success_count}")
