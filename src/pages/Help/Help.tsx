import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Mail, MessageSquare } from 'lucide-react';
import styles from '../pages.module.css';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

interface Faq {
  q: string;
  a: string;
}

export const Help: React.FC = () => {
  useDocumentTitle('Help & Support');
  const faqs: Faq[] = [
    {
      q: 'How do I invite new collaborators to my projects?',
      a: 'Navigate to the project in your Overview panel and click the invite icon. Enter their team email addresses and configure their access permissions (Admin, Editor, or Viewer).'
    },
    {
      q: 'Where can I manage API access tokens for integrations?',
      a: 'Developer tools and API credentials reside under Settings -> Security -> API Keys. Always store your client secret keys securely; they are only rendered once upon generation.'
    },
    {
      q: 'Does this dashboard support dark mode customization?',
      a: 'Yes, a global theme switch icon is located at the top-right header area. Your system theme preference syncs automatically to your local browser storage.'
    },
    {
      q: 'What is the limit for workspace asset attachments?',
      a: 'Files uploaded directly to project boards or task entries have a maximum size limit of 50MB. We support standard documents, spreadsheets, images, and JSON payloads.'
    }
  ];

  // Track expanded state for FAQ items
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Help & Support</h1>
        <p className={styles.pageSubtitle}>Browse through technical documentations or reach out to our service deck.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* FAQs Card Accordion */}
        <div className={styles.card}>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HelpCircle size={20} color="var(--primary)" /> Frequently Asked Questions
          </h2>
          
          <div style={{ marginTop: '16px' }}>
            {faqs.map((faq, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <div key={idx} className={styles.faqItem}>
                  <button
                    type="button"
                    className={styles.faqQuestion}
                    onClick={() => toggleFaq(idx)}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`${styles.faqChevron} ${isExpanded ? styles.faqChevronExpanded : ''}`}
                      size={18}
                    />
                  </button>
                  <div
                    className={`${styles.faqAnswerContainer} ${isExpanded ? styles.faqAnswerExpanded : ''}`}
                  >
                    <div className={styles.faqAnswer}>
                      {faq.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Support Card */}
        <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Still Need Help?</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Our customer success teams are available around the clock to help resolve operational bottlenecks.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
            {/* Email Support */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <Mail size={18} color="var(--primary)" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Email Ticket System</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>support@antigravityui.com</div>
              </div>
            </div>

            {/* Chat Support */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <MessageSquare size={18} color="var(--accent-success)" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Live Chat Messenger</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Typical response: &lt; 5 minutes</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Help;
