import React, { useState } from 'react';
import styles from '../pages.module.css';

export const Security: React.FC = () => {
  // Toggle states
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [timeoutEnabled, setTimeoutEnabled] = useState(false);
  const [logActivities, setLogActivities] = useState(true);

  // Password fields
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwStatus, setPwStatus] = useState<{ type: 'success' | 'error' | '', text: string }>({ type: '', text: '' });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setPwStatus({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPw.length < 8) {
      setPwStatus({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }
    
    // Mock success
    setPwStatus({ type: 'success', text: 'Password updated successfully!' });
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setTimeout(() => {
      setPwStatus({ type: '', text: '' });
    }, 4000);
  };

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Security Settings</h1>
        <p className={styles.pageSubtitle}>Maintain credentials, authorize 2FA keys, and govern login permissions.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Toggle switches card */}
        <div className={styles.card}>
          <h2 className={styles.sectionTitle} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>General Access Controls</h2>
          
          {/* MFA */}
          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleTitle}>Two-Factor Authentication (2FA)</span>
              <span className={styles.toggleDesc}>Secure your administrator profile with an OTP token generated from an authenticator app.</span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={mfaEnabled}
                onChange={() => setMfaEnabled(!mfaEnabled)}
              />
              <span className={styles.slider} />
            </label>
          </div>

          {/* Session Timeout */}
          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleTitle}>Auto Session Inactivity Logout</span>
              <span className={styles.toggleDesc}>Terminate your workspace session automatically if you are inactive for more than 15 minutes.</span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={timeoutEnabled}
                onChange={() => setTimeoutEnabled(!timeoutEnabled)}
              />
              <span className={styles.slider} />
            </label>
          </div>

          {/* Device Logins */}
          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleTitle}>Record Log Activity Audit</span>
              <span className={styles.toggleDesc}>Log details about your login locations, IP addresses, and browsers for security auditing.</span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={logActivities}
                onChange={() => setLogActivities(!logActivities)}
              />
              <span className={styles.slider} />
            </label>
          </div>
        </div>

        {/* Change password card */}
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Change Access Password</h2>
          <form className={styles.form} onSubmit={handlePasswordSubmit}>
            
            {/* Current Password */}
            <div className={styles.inputGroup}>
              <label htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                className={styles.input}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                required
              />
            </div>

            {/* New Password */}
            <div className={styles.inputGroup}>
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                className={styles.input}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Min 8 characters"
                required
              />
            </div>

            {/* Confirm New Password */}
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                className={styles.input}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                required
              />
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
              <button type="submit" className={styles.btnPrimary} style={{ width: '100%', alignSelf: 'stretch' }}>
                Update Security Password
              </button>
              
              {pwStatus.text && (
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    textAlign: 'center',
                    color: pwStatus.type === 'success' ? 'var(--accent-success)' : 'var(--accent-error)',
                    animation: 'fadeIn 0.2s'
                  }}
                >
                  {pwStatus.type === 'success' ? '✓ ' : '✗ '}
                  {pwStatus.text}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Security;
