import React, { useState } from 'react';
import styles from '../pages.module.css';

export const Profile: React.FC = () => {
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@company.com');
  const [bio, setBio] = useState('Creating elegant UI architectures and scalable design systems for enterprise teams.');
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Profile Settings</h1>
        <p className={styles.pageSubtitle}>Update your avatar, public biography details, and login email address.</p>
      </div>

      <div className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit}>
          
          {/* Avatar Upload Mock */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '8px' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #d946ef)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 700,
                boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
              }}
            >
              JD
            </div>
            <div>
              <button
                type="button"
                className={styles.btnPrimary}
                style={{ padding: '8px 16px', fontSize: '13px', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', boxShadow: 'none' }}
              >
                Upload Photo
              </button>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>PNG, JPG or GIF. Max 2MB.</div>
            </div>
          </div>

          {/* Full Name */}
          <div className={styles.inputGroup}>
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Role (Read only) */}
          <div className={styles.inputGroup}>
            <label htmlFor="role">Workspace Role</label>
            <input
              id="role"
              type="text"
              className={styles.input}
              value="Lead UI/UX Architect"
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
          </div>

          {/* Bio */}
          <div className={styles.inputGroup}>
            <label htmlFor="bio">Biography</label>
            <textarea
              id="bio"
              className={styles.textarea}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Button and Success Banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
            <button type="submit" className={styles.btnPrimary}>
              Save Profile Changes
            </button>
            {saved && (
              <span
                style={{
                  color: 'var(--accent-success)',
                  fontSize: '14px',
                  fontWeight: 600,
                  animation: 'fadeIn 0.2s'
                }}
              >
                ✓ Changes saved successfully!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
export default Profile;
