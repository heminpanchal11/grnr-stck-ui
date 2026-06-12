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
  GitBranch
} from 'lucide-react';
import styles from '../../pages.module.css';
import {
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getCategories,
  type SubcategoryResponse,
  type CategoryResponse
} from '../../../utils/api';

interface SubsectorCategory {
  name: string;
  parentSector: string;
  stockCount: number;
  marketCap: string;
  change: string;
  positive: boolean;
}

export const Subcategories: React.FC = () => {
  // Static Sector Subcategories state
  const [searchQuery, setSearchQuery] = useState('');

  // API Subcategory Manager state
  const [subcategoriesList, setSubcategoriesList] = useState<SubcategoryResponse[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryResponse[]>([]);
  const [dbSearchQuery, setDbSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Create / Edit sub-states
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [newSubcategoryCategoryId, setNewSubcategoryCategoryId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string>('');

  const staticSubcategories: SubsectorCategory[] = [
    { name: 'Private Sector Banks', parentSector: 'Financial Services', stockCount: 14, marketCap: '₹14.8 T', change: '+1.20%', positive: true },
    { name: 'Public Sector Banks', parentSector: 'Financial Services', stockCount: 12, marketCap: '₹6.2 T', change: '+0.85%', positive: true },
    { name: 'Software Development & IT', parentSector: 'Information Technology', stockCount: 48, marketCap: '₹12.4 T', change: '-0.90%', positive: false },
    { name: 'Refineries & Marketing', parentSector: 'Oil, Gas & Materials', stockCount: 8, marketCap: '₹9.8 T', change: '+1.60%', positive: true },
    { name: 'Passenger Cars & Utility Vehicles', parentSector: 'Automobile & Transportation', stockCount: 6, marketCap: '₹4.5 T', change: '+2.40%', positive: true },
    { name: 'Pharmaceutical Formulations', parentSector: 'Healthcare & Pharma', stockCount: 32, marketCap: '₹3.9 T', change: '-0.15%', positive: false },
    { name: 'Iron & Steel Products', parentSector: 'Metals & Mining', stockCount: 18, marketCap: '₹3.1 T', change: '+1.50%', positive: true }
  ];

  // Fetch subcategories and categories
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [subs, cats] = await Promise.all([
        getSubcategories(),
        getCategories()
      ]);
      setSubcategoriesList(subs || []);
      setCategoriesList(cats || []);
      
      // Pre-select the first category if list is not empty
      if (cats && cats.length > 0) {
        setNewSubcategoryCategoryId(cats[0].id.toString());
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the API. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Show auto-dismiss success toasts
  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  // Create Subcategory Handler
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubcategoryName.trim() || !newSubcategoryCategoryId) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await createSubcategory({
        name: newSubcategoryName.trim(),
        categoryId: parseInt(newSubcategoryCategoryId, 10)
      });
      
      // If the response doesn't include categoryName, we find it from categoriesList
      if (!created.categoryName) {
        const cat = categoriesList.find(c => c.id === created.categoryId);
        created.categoryName = cat ? cat.name : `Category #${created.categoryId}`;
      }
      
      setSubcategoriesList(prev => [...prev, created]);
      setNewSubcategoryName('');
      showSuccess(`Subcategory "${created.name}" created successfully!`);
    } catch (err: any) {
      setError(err.message || 'Failed to create subcategory.');
    } finally {
      setSubmitting(false);
    }
  };

  // Update Subcategory Handler
  const handleUpdate = async (id: number) => {
    if (!editingName.trim() || !editingCategoryId) return;
    setSubmitting(true);
    setError(null);
    try {
      const updated = await updateSubcategory(id, {
        name: editingName.trim(),
        categoryId: parseInt(editingCategoryId, 10)
      });
      
      if (!updated.categoryName) {
        const cat = categoriesList.find(c => c.id === updated.categoryId);
        updated.categoryName = cat ? cat.name : `Category #${updated.categoryId}`;
      }

      setSubcategoriesList(prev => prev.map(sub => sub.id === id ? updated : sub));
      setEditingId(null);
      setEditingName('');
      setEditingCategoryId('');
      showSuccess('Subcategory updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update subcategory.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Subcategory Handler
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this subcategory? This will delete all associated data.')) return;
    setError(null);
    try {
      await deleteSubcategory(id);
      setSubcategoriesList(prev => prev.filter(sub => sub.id !== id));
      showSuccess('Subcategory deleted successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to delete subcategory.');
    }
  };

  // Filter static subcategories
  const filteredStaticSubcategories = staticSubcategories.filter(sub =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.parentSector.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter backend subcategories
  const filteredDbSubcategories = subcategoriesList.filter(sub =>
    sub.name.toLowerCase().includes(dbSearchQuery.toLowerCase()) ||
    (sub.categoryName && sub.categoryName.toLowerCase().includes(dbSearchQuery.toLowerCase())) ||
    sub.id.toString().includes(dbSearchQuery)
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
        <h1 className={styles.pageTitle}>NSE Subcategories</h1>
        <p className={styles.pageSubtitle}>Drill down into specific industry segments, company counts, and capitalization scales.</p>
      </div>

      {/* Main card */}
      <div className={styles.card}>
        <h3 className={styles.sectionTitle}>Subsector Performance Overview</h3>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative', marginBottom: '20px', maxWidth: '360px' }}>
          <Search style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', width: '16px', height: '16px', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search subsectors..."
            className={styles.input}
            style={{ paddingLeft: '36px', width: '100%' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Subcategories Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Subcategory</th>
                <th>Parent Sector</th>
                <th>Listed Stocks</th>
                <th>Market Cap (Est)</th>
                <th>Daily Change</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaticSubcategories.length > 0 ? (
                filteredStaticSubcategories.map((sub, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {sub.name}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {sub.parentSector}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                      {sub.stockCount} companies
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {sub.marketCap}
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${sub.positive ? styles.badgeSuccess : styles.badgeError}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        {sub.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {sub.change}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No subcategories found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* API Subcategory Manager Card */}
      <div className={styles.card} style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '8px' }}>
          <div>
            <h3 className={styles.sectionTitle} style={{ marginBottom: '4px' }}>Subcategory Database Manager</h3>
            <p className={styles.pageSubtitle} style={{ marginBottom: '16px' }}>
              Add, update, or remove database industry subcategories and map them to their parent categories.
            </p>
          </div>
          <button
            onClick={fetchData}
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
                {error} Ensure that the Spring Boot server is running on <code style={{ fontWeight: 600 }}>http://localhost:8080</code>.
              </p>
              <button
                onClick={fetchData}
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
              placeholder="Search subcategory list..."
              className={styles.input}
              style={{ paddingLeft: '36px', width: '100%' }}
              value={dbSearchQuery}
              onChange={(e) => setDbSearchQuery(e.target.value)}
            />
          </div>

          {/* Add Subcategory Form */}
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', flex: 2, justifyContent: 'flex-end' }}>
            <input
              type="text"
              placeholder="New subcategory name..."
              className={styles.input}
              style={{ minWidth: '200px', flex: 1 }}
              value={newSubcategoryName}
              onChange={(e) => setNewSubcategoryName(e.target.value)}
              required
              disabled={submitting || loading}
            />
            
            {/* Category Select Dropdown */}
            <select
              className={styles.input}
              style={{ height: '42px', padding: '0 10px', minWidth: '180px' }}
              value={newSubcategoryCategoryId}
              onChange={(e) => setNewSubcategoryCategoryId(e.target.value)}
              required
              disabled={submitting || loading || categoriesList.length === 0}
            >
              {categoriesList.length === 0 ? (
                <option value="">No parent category</option>
              ) : (
                categoriesList.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))
              )}
            </select>

            <button
              type="submit"
              className={styles.btnPrimary}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '42px', padding: '0 16px' }}
              disabled={submitting || loading || !newSubcategoryName.trim() || categoriesList.length === 0}
            >
              <Plus size={16} />
              Add Subcategory
            </button>
          </form>
        </div>

        {/* Warning if categories list is empty */}
        {categoriesList.length === 0 && !loading && !error && (
          <div style={{
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid var(--accent-warning)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '20px',
            color: 'var(--accent-warning)',
            fontSize: '13px',
            fontWeight: 500
          }}>
            ⚠️ No parent categories are registered. Please add a category on the Categories page first before managing subcategories.
          </div>
        )}

        {/* Table / List Container */}
        {loading && subcategoriesList.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', gap: '12px' }}>
            <RefreshCw size={32} className="spin-icon" style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Fetching subcategories...</span>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>ID</th>
                  <th>Subcategory Name</th>
                  <th>Parent Category</th>
                  <th style={{ width: '200px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDbSubcategories.length > 0 ? (
                  filteredDbSubcategories.map((sub) => {
                    const isEditing = editingId === sub.id;
                    return (
                      <tr key={sub.id}>
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
                            #{sub.id}
                          </code>
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              className={styles.input}
                              style={{ width: '100%', maxWidth: '280px', padding: '6px 12px' }}
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              disabled={submitting}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdate(sub.id);
                                if (e.key === 'Escape') {
                                  setEditingId(null);
                                  setEditingName('');
                                  setEditingCategoryId('');
                                }
                              }}
                            />
                          ) : (
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '15px' }}>
                              {sub.name}
                            </span>
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <select
                              className={styles.input}
                              style={{ width: '100%', maxWidth: '220px', padding: '6px 10px', height: '36px' }}
                              value={editingCategoryId}
                              onChange={(e) => setEditingCategoryId(e.target.value)}
                              disabled={submitting}
                            >
                              {categoriesList.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={styles.badge} style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600 }}>
                              {sub.categoryName || `Category #${sub.categoryId}`}
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleUpdate(sub.id)}
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
                                    setEditingCategoryId('');
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
                                    setEditingId(sub.id);
                                    setEditingName(sub.name);
                                    setEditingCategoryId(sub.categoryId.toString());
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
                                  onClick={() => handleDelete(sub.id)}
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
                    <td colSpan={4} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
                      <GitBranch size={36} style={{ marginBottom: '12px', opacity: 0.4, color: 'var(--text-muted)' }} />
                      <p style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-secondary)' }}>No Database Subcategories Found</p>
                      <p style={{ fontSize: '13px', marginTop: '4px' }}>
                        {dbSearchQuery ? `No records match "${dbSearchQuery}"` : 'Create your first subcategory using the form above.'}
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

export default Subcategories;
