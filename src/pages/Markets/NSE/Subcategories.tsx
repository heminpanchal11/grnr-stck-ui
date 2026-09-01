import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  GitBranch,
  ChevronRight
} from 'lucide-react';
import styles from '../../pages.module.css';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import {
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getCategories,
  type SubcategoryResponse,
  type CategoryResponse
} from '../../../utils/api';

export const Subcategories: React.FC = () => {
  useDocumentTitle('NSE Subcategories');
  // API Subcategory Manager state
  const [subcategoriesList, setSubcategoriesList] = useState<SubcategoryResponse[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryResponse[]>([]);
  const [dbSearchQuery, setDbSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Tree Stateful Controls
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  // Create / Edit sub-states
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [newSubcategoryCategoryId, setNewSubcategoryCategoryId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string>('');

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

  // Group subcategories by Category ID
  const groupedSubcategories = useMemo(() => {
    const groups: { [catId: number]: SubcategoryResponse[] } = {};
    categoriesList.forEach(cat => {
      groups[cat.id] = [];
    });
    subcategoriesList.forEach(sub => {
      if (!groups[sub.categoryId]) {
        groups[sub.categoryId] = [];
      }
      groups[sub.categoryId].push(sub);
    });
    return groups;
  }, [categoriesList, subcategoriesList]);

  // Filter grouped categories and subcategories based on search query
  const filteredGroups = useMemo(() => {
    const filtered: { [catId: number]: SubcategoryResponse[] } = {};
    const searchLower = dbSearchQuery.toLowerCase().trim();
    
    if (!searchLower) {
      return { filtered: groupedSubcategories, hasResults: subcategoriesList.length > 0 };
    }
    
    let hasResults = false;
    Object.keys(groupedSubcategories).forEach(key => {
      const catId = parseInt(key, 10);
      const subs = groupedSubcategories[catId];
      const catObj = categoriesList.find(c => c.id === catId);
      const catName = catObj ? catObj.name : `Category #${catId}`;

      const matchedSubs = subs.filter(sub => 
        sub.name.toLowerCase().includes(searchLower) ||
        sub.id.toString().includes(searchLower)
      );

      const catMatches = catName.toLowerCase().includes(searchLower);
      const finalSubs = catMatches ? subs : matchedSubs;

      if (finalSubs.length > 0 || catMatches) {
        filtered[catId] = finalSubs;
        hasResults = true;
      }
    });

    return { filtered, hasResults };
  }, [groupedSubcategories, categoriesList, dbSearchQuery, subcategoriesList]);

  // Auto expand categories containing search matches
  useEffect(() => {
    if (dbSearchQuery.trim().length > 0) {
      const toExpand = new Set<number>();
      categoriesList.forEach(cat => {
        const catName = cat.name.toLowerCase();
        const searchLower = dbSearchQuery.toLowerCase();
        const hasMatchingSub = subcategoriesList.some(s => 
          s.categoryId === cat.id && 
          (s.name.toLowerCase().includes(searchLower) || s.id.toString().includes(searchLower))
        );
        if (catName.includes(searchLower) || hasMatchingSub) {
          toExpand.add(cat.id);
        }
      });
      setExpandedCategories(toExpand);
    }
  }, [dbSearchQuery, categoriesList, subcategoriesList]);

  // Toggle Category open/closed state
  const toggleCategory = (catId: number) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedCategories(new Set(categoriesList.map(c => c.id)));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

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
      
      // Auto expand the parent category so the new subcategory is visible
      setExpandedCategories(prev => {
        const next = new Set(prev);
        next.add(created.categoryId);
        return next;
      });

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
    const targetCategoryId = parseInt(editingCategoryId, 10);
    try {
      const updated = await updateSubcategory(id, {
        name: editingName.trim(),
        categoryId: targetCategoryId
      });
      
      if (!updated.categoryName) {
        const cat = categoriesList.find(c => c.id === updated.categoryId);
        updated.categoryName = cat ? cat.name : `Category #${updated.categoryId}`;
      }

      setSubcategoriesList(prev => prev.map(sub => sub.id === id ? updated : sub));
      setEditingId(null);
      setEditingName('');
      setEditingCategoryId('');
      
      // Expand the destination category in case it was modified
      setExpandedCategories(prev => {
        const next = new Set(prev);
        next.add(targetCategoryId);
        return next;
      });

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
      await deleteSubcategory(id); // mapped to DELETE /api/v1/subcategories/{id}
      setSubcategoriesList(prev => prev.filter(sub => sub.id !== id));
      showSuccess('Subcategory deleted successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to delete subcategory.');
    }
  };

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

      {/* API Subcategory Manager Card */}
      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '8px' }}>
          <div>
            <h3 className={styles.sectionTitle} style={{ marginBottom: '4px' }}>Subcategory Tree Manager</h3>
            <p className={styles.pageSubtitle} style={{ marginBottom: '16px' }}>
              Organize and modify stock subcategories nested hierarchically under their parent sector categories.
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '320px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative', flex: 1 }}>
              <Search style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', width: '16px', height: '16px', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search subcategory or sector..."
                className={styles.input}
                style={{ paddingLeft: '36px', width: '100%' }}
                value={dbSearchQuery}
                onChange={(e) => setDbSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Tree Navigation Actions */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={expandAll}
                className={styles.input}
                style={{
                  padding: '8px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}
                disabled={categoriesList.length === 0}
                type="button"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className={styles.input}
                style={{
                  padding: '8px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}
                disabled={categoriesList.length === 0}
                type="button"
              >
                Collapse All
              </button>
            </div>
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

        {/* Tree Table Container */}
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
                  <th style={{ width: '120px' }}>ID / Level</th>
                  <th>Hierarchy Node</th>
                  <th style={{ width: '200px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categoriesList.length > 0 && filteredGroups.hasResults ? (
                  categoriesList.map(cat => {
                    // Filter group check
                    if (dbSearchQuery && !filteredGroups.filtered[cat.id]) return null;
                    
                    const subs = filteredGroups.filtered[cat.id] || [];
                    const isExpanded = expandedCategories.has(cat.id);

                    return (
                      <React.Fragment key={cat.id}>
                        {/* Parent Category Row (Level 0) */}
                        <tr 
                          onClick={() => toggleCategory(cat.id)}
                          style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            cursor: 'pointer',
                            userSelect: 'none',
                            borderLeft: isExpanded ? '3px solid var(--primary)' : '3px solid transparent'
                          }}
                        >
                          <td colSpan={2} style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <ChevronRight 
                                size={16} 
                                style={{ 
                                  color: 'var(--text-muted)',
                                  transform: isExpanded ? 'rotate(90deg)' : 'none',
                                  transition: 'transform var(--transition-fast)'
                                }} 
                              />
                              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>
                                {cat.name}
                              </span>
                              <span 
                                className={styles.badge} 
                                style={{ 
                                  backgroundColor: 'var(--primary-light)', 
                                  color: 'var(--primary)', 
                                  textTransform: 'none', 
                                  letterSpacing: 0,
                                  fontWeight: 600,
                                  fontSize: '11px',
                                  padding: '2px 8px'
                                }}
                              >
                                {subs.length} {subs.length === 1 ? 'subcategory' : 'subcategories'}
                              </span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'right', padding: '12px 16px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                              {isExpanded ? 'Collapse Folder' : 'Expand Folder'}
                            </span>
                          </td>
                        </tr>

                        {/* Children Subcategories (Level 1) */}
                        {isExpanded && (
                          subs.length === 0 ? (
                            <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                              <td colSpan={3} style={{ padding: '12px 16px 12px 48px', color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>
                                No industry subcategories are registered under this sector.
                              </td>
                            </tr>
                          ) : (
                            subs.map(sub => {
                              const isEditing = editingId === sub.id;
                              return (
                                <tr key={sub.id} style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                  {/* ID / Spacing Column */}
                                  <td style={{ paddingLeft: '48px' }}>
                                    <code style={{
                                      backgroundColor: 'var(--bg-tertiary)',
                                      padding: '4px 8px',
                                      borderRadius: '4px',
                                      fontSize: '11px',
                                      fontFamily: 'monospace',
                                      color: 'var(--text-secondary)',
                                      fontWeight: 600
                                    }}>
                                      #{sub.id}
                                    </code>
                                  </td>
                                  
                                  {/* Subcategory Name / Editing Column */}
                                  <td>
                                    {isEditing ? (
                                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                                        <input
                                          type="text"
                                          className={styles.input}
                                          style={{ width: '100%', maxWidth: '260px', padding: '6px 12px' }}
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
                                        
                                        {/* Dropdown to change parent category during inline edit */}
                                        <select
                                          className={styles.input}
                                          style={{ height: '36px', padding: '0 8px', minWidth: '160px', fontSize: '13px' }}
                                          value={editingCategoryId}
                                          onChange={(e) => setEditingCategoryId(e.target.value)}
                                          disabled={submitting}
                                        >
                                          {categoriesList.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                          ))}
                                        </select>
                                      </div>
                                    ) : (
                                      <span style={{ fontWeight: 500, color: 'var(--text-secondary)', fontSize: '14px' }}>
                                        {sub.name}
                                      </span>
                                    )}
                                  </td>

                                  {/* Action Controls Column */}
                                  <td>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                      {isEditing ? (
                                        <>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleUpdate(sub.id);
                                            }}
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
                                            onClick={(e) => {
                                              e.stopPropagation();
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
                                            onClick={(e) => {
                                              e.stopPropagation();
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
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDelete(sub.id);
                                            }}
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
                          )
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
                      <GitBranch size={36} style={{ marginBottom: '12px', opacity: 0.4, color: 'var(--text-muted)' }} />
                      <p style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-secondary)' }}>
                        {categoriesList.length === 0 ? 'No database categories found.' : 'No records match search queries.'}
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
