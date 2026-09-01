import React, { useState, useEffect } from 'react';
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Layers
} from 'lucide-react';
import styles from '../../pages.module.css';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryResponse
} from '../../../utils/api';

interface SectorCategory {
  name: string;
  indexName: string;
  weightage: string;
  indexValue: string;
  change: string;
  positive: boolean;
}

export const Categories: React.FC = () => {
  useDocumentTitle('NSE Sector Categories');
  // Static Sector Categories state
  const [searchQuery, setSearchQuery] = useState('');
  
  // API Category Manager state
  const [categoriesList, setCategoriesList] = useState<CategoryResponse[]>([]);
  const [dbSearchQuery, setDbSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Create / Edit sub-states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const staticCategories: SectorCategory[] = [
    { name: 'Financial Services', indexName: 'NIFTY FINANCIAL SERVICES', weightage: '32.40%', indexValue: '21,385.10', change: '+1.05%', positive: true },
    { name: 'Information Technology', indexName: 'NIFTY IT', weightage: '14.20%', indexValue: '31,520.40', change: '-0.75%', positive: false },
    { name: 'Oil, Gas & Materials', indexName: 'NIFTY OIL & GAS', weightage: '11.80%', indexValue: '8,410.85', change: '+1.45%', positive: true },
    { name: 'Consumer Goods', indexName: 'NIFTY FMCG', weightage: '9.30%', indexValue: '51,980.20', change: '+0.22%', positive: true },
    { name: 'Automobile & Transportation', indexName: 'NIFTY AUTO', weightage: '6.40%', indexValue: '14,845.60', change: '+2.10%', positive: true },
    { name: 'Healthcare & Pharma', indexName: 'NIFTY PHARMA', weightage: '5.10%', indexValue: '13,290.75', change: '-0.30%', positive: false },
    { name: 'Metals & Mining', indexName: 'NIFTY METAL', weightage: '3.80%', indexValue: '6,105.15', change: '+1.80%', positive: true }
  ];

  // Load backend categories
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      setCategoriesList(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the API. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Show auto-dismiss success toasts
  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  // Create Category Handler
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await createCategory({ name: newCategoryName.trim() });
      setCategoriesList(prev => [...prev, created]);
      setNewCategoryName('');
      showSuccess(`Category "${created.name}" created successfully!`);
    } catch (err: any) {
      setError(err.message || 'Failed to create category.');
    } finally {
      setSubmitting(false);
    }
  };

  // Update Category Handler
  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const updated = await updateCategory(id, { name: editingName.trim() });
      setCategoriesList(prev => prev.map(cat => cat.id === id ? updated : cat));
      setEditingId(null);
      setEditingName('');
      showSuccess('Category updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update category.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Category Handler
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category? This will delete all associated data.')) return;
    setError(null);
    try {
      await deleteCategory(id);
      setCategoriesList(prev => prev.filter(cat => cat.id !== id));
      showSuccess('Category deleted successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to delete category.');
    }
  };

  // Filter static categories
  const filteredStaticCategories = staticCategories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.indexName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter backend categories
  const filteredDbCategories = categoriesList.filter(cat =>
    cat.name.toLowerCase().includes(dbSearchQuery.toLowerCase()) ||
    cat.id.toString().includes(dbSearchQuery)
  );

  return (
    <div>
      {/* Injecting dynamic spinner styling */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin-icon {
          animation: spin 1s linear infinite;
        }
      `}</style>

      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>NSE Sector Categories</h1>
        <p className={styles.pageSubtitle}>Monitor weights, valuations, and daily swings of different stock market sectors.</p>
      </div>

      {/* Main static card */}
      <div className={styles.card}>
        <h3 className={styles.sectionTitle}>Sector Performance Overview</h3>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative', marginBottom: '20px', maxWidth: '360px' }}>
          <Search style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', width: '16px', height: '16px', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search sectors..."
            className={styles.input}
            style={{ paddingLeft: '36px', width: '100%' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Sector Name</th>
                <th>Index Name</th>
                <th>Index Value</th>
                <th>Weightage</th>
                <th>Daily Change</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaticCategories.length > 0 ? (
                filteredStaticCategories.map((cat, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {cat.name}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {cat.indexName}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {cat.indexValue}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                      {cat.weightage}
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${cat.positive ? styles.badgeSuccess : styles.badgeError}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        {cat.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {cat.change}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No sectors found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* API Category Manager Card */}
      <div className={styles.card} style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '8px' }}>
          <div>
            <h3 className={styles.sectionTitle} style={{ marginBottom: '4px' }}>Category Database Manager</h3>
            <p className={styles.pageSubtitle} style={{ marginBottom: '16px' }}>
              Add, update, or remove database categories to classify listing stock symbols.
            </p>
          </div>
          <button
            onClick={fetchCategories}
            className={styles.input}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 14px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px'
            }}
            disabled={loading}
            title="Refresh database entries"
          >
            <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
            Refresh Sync
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid var(--accent-success)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'var(--accent-success)',
            fontSize: '13px',
            fontWeight: 600
          }}>
            <CheckCircle size={16} />
            {successMessage}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid var(--accent-error)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            color: 'var(--accent-error)'
          }}>
            <AlertCircle style={{ flexShrink: 0, marginTop: '2px' }} size={20} />
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '4px', fontSize: '14px' }}>API Connection Error</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {error} Ensure that the Spring Boot server is running on <code style={{ fontWeight: 600 }}>http://localhost:8080</code> and the databases are properly initialized.
              </p>
              <button
                onClick={fetchCategories}
                className={styles.btnPrimary}
                style={{
                  marginTop: '12px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  backgroundColor: 'var(--accent-error)',
                  boxShadow: 'none'
                }}
              >
                Retry Fetching
              </button>
            </div>
          </div>
        )}

        {/* Controls Toolbar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          {/* Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative', minWidth: '280px', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', width: '16px', height: '16px', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search category list..."
              className={styles.input}
              style={{ paddingLeft: '36px', width: '100%' }}
              value={dbSearchQuery}
              onChange={(e) => setDbSearchQuery(e.target.value)}
            />
          </div>

          {/* Add Category Form */}
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
            <input
              type="text"
              placeholder="New category name..."
              className={styles.input}
              style={{ minWidth: '220px' }}
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              required
              disabled={submitting || loading}
            />
            <button
              type="submit"
              className={styles.btnPrimary}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '42px', padding: '0 16px' }}
              disabled={submitting || loading || !newCategoryName.trim()}
            >
              <Plus size={16} />
              Add Category
            </button>
          </form>
        </div>

        {/* Table / List Container */}
        {loading && categoriesList.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', gap: '12px' }}>
            <RefreshCw size={32} className="spin-icon" style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Fetching categories...</span>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>ID</th>
                  <th>Category Name</th>
                  <th style={{ width: '200px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDbCategories.length > 0 ? (
                  filteredDbCategories.map((cat) => {
                    const isEditing = editingId === cat.id;
                    return (
                      <tr key={cat.id}>
                        <td>
                          <code style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontFamily: 'monospace',
                            color: 'var(--text-secondary)',
                            fontWeight: 600
                          }}>
                            #{cat.id}
                          </code>
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              className={styles.input}
                              style={{ width: '100%', maxWidth: '300px', padding: '6px 12px' }}
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              disabled={submitting}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdate(cat.id);
                                if (e.key === 'Escape') {
                                  setEditingId(null);
                                  setEditingName('');
                                }
                              }}
                            />
                          ) : (
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '15px' }}>
                              {cat.name}
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleUpdate(cat.id)}
                                  className={styles.input}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '6px 12px',
                                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                                    borderColor: 'var(--accent-success)',
                                    color: 'var(--accent-success)',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: 600
                                  }}
                                  disabled={submitting}
                                >
                                  <Check size={14} />
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditingName('');
                                  }}
                                  className={styles.input}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '6px 12px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                  }}
                                  disabled={submitting}
                                >
                                  <X size={14} />
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingId(cat.id);
                                    setEditingName(cat.name);
                                  }}
                                  className={styles.input}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '6px 12px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: 500
                                  }}
                                >
                                  <Edit2 size={12} />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(cat.id)}
                                  className={styles.input}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '6px 12px',
                                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                                    borderColor: 'rgba(239, 68, 68, 0.2)',
                                    color: 'var(--accent-error)',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: 500
                                  }}
                                >
                                  <Trash2 size={12} />
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
                      <Layers size={36} style={{ marginBottom: '12px', opacity: 0.4, color: 'var(--text-muted)' }} />
                      <p style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-secondary)' }}>No Database Categories Found</p>
                      <p style={{ fontSize: '13px', marginTop: '4px' }}>
                        {dbSearchQuery ? `No records match "${dbSearchQuery}"` : 'Create your first category using the input box above.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;

