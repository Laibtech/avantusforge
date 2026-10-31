# AVANTUSFORGE DEFENSIVE INCIDENT RESPONSE PLAYBOOKS

This document establishes operational, step-by-step procedures for the AvantusForge technical administration team in the event of suspected security incidents, unauthorized access, file anomalies, database threats, or service disruption.

---

## PLAYBOOK 1: Administrator Account Compromise

### Incident Triggers
- Suspicious login alert recorded in `security_events` table from an unrecognized IP address or geographic location.
- Unauthorized modifications observed in CRM leads, Team CMS, or Site Settings.
- Multiple failed login notifications followed by a successful login.

### Phase 1: Immediate Containment (T0 – T15 Minutes)
1. **Terminate All Active Sessions for the Affected Account:**
   Execute immediate revocation in the database:
   ```sql
   DELETE FROM admin_sessions WHERE user_id = (SELECT id FROM admin_users WHERE username = '<compromised_username>');
   ```
2. **Lock the Compromised Account:**
   Prevent further logins immediately:
   ```sql
   UPDATE admin_users SET locked_until = DATE_ADD(NOW(), INTERVAL 7 DAY), failed_attempts = 99 WHERE username = '<compromised_username>';
   ```
3. **Log the Containment Event:**
   In the Security Center or via `lib/security.ts`:
   ```sql
   INSERT INTO security_events (event_type, severity, actor, source_ip, detection_reason, action_taken)
   VALUES ('ACCOUNT_LOCKOUT_ENFORCED', 'CRITICAL', 'Incident_Responder', '127.0.0.1', 'Suspected compromise of administrator account', 'Revoked all active sessions and locked account for 7 days');
   ```

### Phase 2: Forensic Eradication & Recovery
1. Inspect `security_events` table for all actions performed by the session token during the window of compromise:
   ```sql
   SELECT * FROM security_events WHERE actor = '<compromised_username>' ORDER BY id DESC LIMIT 50;
   ```
2. Inspect `contact_inquiries`, `cms_team_members`, and `cms_settings` to verify no unauthorized modifications or data leaks occurred.
3. Reset credentials securely with high entropy (minimum 16 characters, PBKDF2 with 100,000 rounds of SHA-512):
   ```bash
   node scripts/init-security-db.js
   ```
4. Unlock the account only after verified identity confirmation with executive leadership.

---

## PLAYBOOK 2: Malicious File Upload & Shell Detection

### Incident Triggers
- Alert triggered by `validateUploadedFile()` in `lib/security.ts`: `PATH_TRAVERSAL_DETECTED`, `EXECUTABLE_EXTENSION_REJECTED`, or `MAGIC_BYTE_MISMATCH`.
- Detection of unexpected `.php`, `.sh`, `.exe`, or double-extension files (e.g., `avatar.php.png`) in `public/uploads/`.

### Phase 1: Immediate Quarantine & Eradication
1. **Audit Files in the Uploads Directory:**
   ```bash
   node -e "const fs = require('fs'); console.log(fs.readdirSync('public/uploads'));"
   ```
2. **Remove Unverified or Malicious Files:**
   Delete suspicious files immediately. The Next.js upload handler automatically generates cryptographically random 24-character hex filenames (`crypto.randomBytes(12).toString('hex')`) with strict extensions (`.jpg`, `.png`, `.webp`, `.pdf`, `.svg`). Any file not conforming to this pattern must be quarantined immediately.
3. **Verify Magic-Byte Enforcement:**
   Ensure `verifyMagicBytes()` in `lib/security.ts` remains active and that no uploads bypass server-side validation.

---

## PLAYBOOK 3: Database Unauthorized Access or Data Exposure Suspicion

### Incident Triggers
- Unrecognized queries logged in MySQL general query log or anomalies in contact inquiries data.
- Accidental exposure of `.env` or database credentials.

### Phase 1: Access Isolation
1. **Verify MySQL Network Binding:**
   Ensure MySQL is strictly bound to `127.0.0.1` or `localhost` (port 3307), never `0.0.0.0` or open to the public internet:
   ```bash
   netstat -ano | findstr 3307
   ```
2. **Credential Rotation:**
   - Update database password in MySQL:
     ```sql
     ALTER USER 'root'@'127.0.0.1' IDENTIFIED BY '<NEW_STRONG_PASSWORD>';
     FLUSH PRIVILEGES;
     ```
   - Update `DB_PASSWORD` in `.env.local`.
   - Restart the application process to reload environment variables.

### Phase 2: Integrity & Snapshot Verification
1. **Trigger Immediate Cryptographic Snapshot:**
   ```bash
   node scripts/backup-db.js
   ```
2. **Verify Backup Checksum:**
   Inspect the newly generated `.sha256` checksum file in the `backups/` directory to ensure table structure and records match expected baseline.

---

## PLAYBOOK 4: Service Disruption, DDoS & Brute-Force Throttling

### Incident Triggers
- Flood of rapid requests to `/api/contact` or `/api/admin/auth/login`.
- Elevated CPU or memory usage.
- High volume of `RATE_LIMIT_TRIGGERED` alerts in `security_events`.

### Phase 1: Defensive Throttling
1. **Verify Rate Limiting Active:**
   The sliding-window defensive rate limiter automatically enforces:
   - `/api/admin/auth/login`: Maximum 5 attempts per 60-second window. Progressive 15-minute lockout on repeated failures.
   - `/api/contact`: Maximum 10 inquiries per 15 minutes per IP.
2. **Edge Throttling:**
   If sustained traffic overwhelms application memory, enforce Cloudflare or upstream reverse proxy WAF rules to drop traffic from flagged ASN/IP ranges before reaching Next.js server.
3. **Review Incident Log:**
   Access `/admin/security` to inspect live blocked IP addresses and detection details.

---

## Verification & Compliance Checklist
- [x] All admin routes guarded by Next.js edge middleware.
- [x] Passwords hashed with PBKDF2 (100,000 iterations, SHA-512).
- [x] Database queries parameterized with prepared statements (`?` bindings).
- [x] Automated disaster recovery backups with SHA-256 verification.
- [x] Executive portraits segregated and verified (`laiba-baig-ceo.jpg` vs `maira.jpg`).
