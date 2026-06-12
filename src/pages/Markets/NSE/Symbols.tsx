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
  Activity
} from 'lucide-react';
import styles from '../../pages.module.css';
import {
  getSymbols,
  createSymbol,
  updateSymbol,
  deleteSymbol,
  getCategories,
  getSubcategories,
  type StockSymbolResponse,
  type CategoryResponse,
  type SubcategoryResponse
} from '../../../utils/api';

interface StockSymbol {
  name: string;
  company: string;
  price: string;
  change: string;
  volume: string;
  positive: boolean;
}

export const Symbols: React.FC = () => {
  // Static Sector Symbols state
  const [searchQuery, setSearchQuery] = useState('');

  // API Symbols Manager state
  const [symbolsList, setSymbolsList] = useState<StockSymbolResponse[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryResponse[]>([]);
  const [subcategoriesList, setSubcategoriesList] = useState<SubcategoryResponse[]>([]);
  const [dbSearchQuery, setDbSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Create sub-states
  const [newSymbolName, setNewSymbolName] = useState('');
  const [newSymbolCategoryName, setNewSymbolCategoryName] = useState('');
  const [newSymbolSubcategoryName, setNewSymbolSubcategoryName] = useState('');

  // Edit sub-states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingOldSymbolName, setEditingOldSymbolName] = useState('');
  const [editingSymbolName, setEditingSymbolName] = useState('');
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingSubcategoryName, setEditingSubcategoryName] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const staticSymbols: StockSymbol[] = [
    { name: 'RELIANCE', company: 'Reliance Industries Ltd.', price: '₹2,450.45', change: '+1.25%', volume: '4,821,304', positive: true },
    { name: 'TCS', company: 'Tata Consultancy Services Ltd.', price: '₹3,210.50', change: '-0.82%', volume: '1,241,892', positive: false },
    { name: 'INFY', company: 'Infosys Ltd.', price: '₹1,520.25', change: '+2.41%', volume: '2,891,450', positive: true },
    { name: 'HDFCBANK', company: 'HDFC Bank Ltd.', price: '₹1,600.10', change: '+0.48%', volume: '3,102,941', positive: true },
    { name: 'ICICIBANK', company: 'ICICI Bank Ltd.', price: '₹920.80', change: '-1.15%', volume: '2,492,083', positive: false },
    { name: 'SBIN', company: 'State Bank of India', price: '₹575.30', change: '+1.88%', volume: '5,920,381', positive: true },
    { name: 'BHARTIARTL', company: 'Bharti Airtel Ltd.', price: '₹842.15', change: '-0.34%', volume: '1,894,203', positive: false }
  ];

  // Fetch symbols, categories, and subcategories
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [syms, cats, subs] = await Promise.all([
        getSymbols(),
        getCategories(),
        getSubcategories()
      ]);
      setSymbolsList(syms || []);
      setCategoriesList(cats || []);
      setSubcategoriesList(subs || []);
      
      // Auto-populate creation dropdowns with first elements
      if (cats && cats.length > 0) {
        const firstCatName = cats[0].name;
        setNewSymbolCategoryName(firstCatName);
        
        const filteredSubs = subs.filter(s => s.categoryName === firstCatName || s.categoryId === cats[0].id);
        if (filteredSubs.length > 0) {
          setNewSymbolSubcategoryName(filteredSubs[0].name);
        } else {
          setNewSymbolSubcategoryName('');
        }
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

  // Creation category dropdown handler: update subcategory cascade
  const handleCategoryChange = (catName: string) => {
    setNewSymbolCategoryName(catName);
    const catObj = categoriesList.find(c => c.name === catName);
    const filteredSubs = subcategoriesList.filter(s => 
      s.categoryName === catName || 
      (catObj && s.categoryId === catObj.id)
    );
    if (filteredSubs.length > 0) {
      setNewSymbolSubcategoryName(filteredSubs[0].name);
    } else {
      setNewSymbolSubcategoryName('');
    }
  };

  // Editing category dropdown handler: update subcategory cascade
  const handleEditCategoryChange = (catName: string) => {
    setEditingCategoryName(catName);
    const catObj = categoriesList.find(c => c.name === catName);
    const filteredSubs = subcategoriesList.filter(s => 
      s.categoryName === catName || 
      (catObj && s.categoryId === catObj.id)
    );
    if (filteredSubs.length > 0) {
      setEditingSubcategoryName(filteredSubs[0].name);
    } else {
      setEditingSubcategoryName('');
    }
  };

  // Create Symbol Handler
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbolName.trim() || !newSymbolCategoryName || !newSymbolSubcategoryName) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await createSymbol({
        symbol: newSymbolName.trim().toUpperCase(),
        category: newSymbolCategoryName,
        subcategory: newSymbolSubcategoryName
      });
      setSymbolsList(prev => [...prev, created]);
      setNewSymbolName('');
      showSuccess(`Stock symbol "${created.symbol}" registered successfully!`);
    } catch (err: any) {
      setError(err.message || 'Failed to register stock symbol.');
    } finally {
      setSubmitting(false);
    }
  };

  // Update Symbol Handler
  const handleUpdate = async (id: number) => {
    if (!editingSymbolName.trim() || !editingCategoryName || !editingSubcategoryName) return;
    setSubmitting(true);
    setError(null);
    try {
      // API put requires target symbol name as path param (editingOldSymbolName)
      const updated = await updateSymbol(editingOldSymbolName, {
        symbol: editingSymbolName.trim().toUpperCase(),
        category: editingCategoryName,
        subcategory: editingSubcategoryName
      });
      setSymbolsList(prev => prev.map(s => s.id === id ? updated : s));
      setEditingId(null);
      setEditingOldSymbolName('');
      setEditingSymbolName('');
      setEditingCategoryName('');
      setEditingSubcategoryName('');
      showSuccess('Stock symbol updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update stock symbol.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Symbol Handler
  const handleDelete = async (symbolName: string) => {
    if (!window.confirm(`Are you sure you want to delete stock symbol "${symbolName}"? This will delete all historical bhav data.`)) return;
    setError(null);
    try {
      await deleteSymbol(symbolName);
      setSymbolsList(prev => prev.filter(s => s.symbol !== symbolName));
      showSuccess('Stock symbol deleted successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to delete stock symbol.');
    }
  };

  // Filter static symbols
  const filteredStaticSymbols = staticSymbols.filter(sym => 
    sym.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    sym.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter backend symbols
  const filteredDbSymbols = symbolsList.filter(sym =>
    sym.symbol.toLowerCase().includes(dbSearchQuery.toLowerCase()) ||
    sym.category.toLowerCase().includes(dbSearchQuery.toLowerCase()) ||
    sym.subcategory.toLowerCase().includes(dbSearchQuery.toLowerCase()) ||
    sym.id.toString().includes(dbSearchQuery)
  );

  // Filter subcategories for creation form
  const availableSubcategories = subcategoriesList.filter(sub => {
    const parentCat = categoriesList.find(c => c.name === newSymbolCategoryName);
    return sub.categoryName === newSymbolCategoryName || (parentCat && sub.categoryId === parentCat.id);
  });

  // Filter subcategories for inline edit form
  const availableEditSubcategories = subcategoriesList.filter(sub => {
    const parentCat = categoriesList.find(c => c.name === editingCategoryName);
    return sub.categoryName === editingCategoryName || (parentCat && sub.categoryId === parentCat.id);
  });

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
        <h1 className={styles.pageTitle}>NSE Symbols</h1>
        <p className={styles.pageSubtitle}>Monitor key stock symbols listed on the National Stock Exchange of India (NSE).</p>
      </div>

      {/* Main card */}
      <div className={styles.card}>
        <h3 className={styles.sectionTitle}>Symbol Performance Overview</h3>
        {/* Search input inside card */}
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative', marginBottom: '20px', maxWidth: '360px' }}>
          <Search style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', width: '16px', height: '16px', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search symbols or companies..."
            className={styles.input}
            style={{ paddingLeft: '36px', width: '100%' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Symbols Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Company Name</th>
                <th>Last Price</th>
                <th>Daily Change</th>
                <th>Volume</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaticSymbols.length > 0 ? (
                filteredStaticSymbols.map((sym, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      {sym.name}
                    </td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {sym.company}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {sym.price}
                    </td>
                    <td>
                      <span 
                        className={`${styles.badge} ${sym.positive ? styles.badgeSuccess : styles.badgeError}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        {sym.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {sym.change}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {sym.volume}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No stock symbols found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* API Symbols Manager Card */}
      <div className={styles.card} style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '8px' }}>
          <div>
            <h3 className={styles.sectionTitle} style={{ marginBottom: '4px' }}>Symbol Database Manager</h3>
            <p className={styles.pageSubtitle} style={{ marginBottom: '16px' }}>
              Register new NSE stock symbols and map them to their parent industry categories and subcategories.
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
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative', minWidth: '260px', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', width: '16px', height: '16px', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search symbol list..."
              className={styles.input}
              style={{ paddingLeft: '36px', width: '100%' }}
              value={dbSearchQuery}
              onChange={(e) => setDbSearchQuery(e.target.value)}
            />
          </div>

          {/* Add Symbol Form */}
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', flex: 3, justifyContent: 'flex-end' }}>
            <input
              type="text"
              placeholder="Symbol (e.g. INFIBEAM)..."
              className={styles.input}
              style={{ minWidth: '180px', flex: 1, textTransform: 'uppercase' }}
              value={newSymbolName}
              onChange={(e) => setNewSymbolName(e.target.value)}
              required
              disabled={submitting || loading}
            />

            {/* Category Select Dropdown */}
            <select
              className={styles.input}
              style={{ height: '42px', padding: '0 10px', minWidth: '160px' }}
              value={newSymbolCategoryName}
              onChange={(e) => handleCategoryChange(e.target.value)}
              required
              disabled={submitting || loading || categoriesList.length === 0}
            >
              {categoriesList.length === 0 ? (
                <option value="">No categories</option>
              ) : (
                categoriesList.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))
              )}
            </select>

            {/* Subcategory Select Dropdown */}
            <select
              className={styles.input}
              style={{ height: '42px', padding: '0 10px', minWidth: '180px' }}
              value={newSymbolSubcategoryName}
              onChange={(e) => setNewSymbolSubcategoryName(e.target.value)}
              required
              disabled={submitting || loading || availableSubcategories.length === 0}
            >
              {availableSubcategories.length === 0 ? (
                <option value="">No subcategories</option>
              ) : (
                availableSubcategories.map(sub => (
                  <option key={sub.id} value={sub.name}>{sub.name}</option>
                ))
              )}
            </select>

            <button
              type="submit"
              className={styles.btnPrimary}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '42px', padding: '0 16px' }}
              disabled={submitting || loading || !newSymbolName.trim() || availableSubcategories.length === 0}
            >
              <Plus size={16} />
              Add Symbol
            </button>
          </form>
        </div>

        {/* Warning if categories or subcategories are missing */}
        {!loading && !error && (
          <>
            {categoriesList.length === 0 && (
              <div style={{
                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid var(--accent-warning)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginBottom: '10px',
                color: 'var(--accent-warning)',
                fontSize: '13px',
                fontWeight: 500
              }}>
                ⚠️ No categories are registered. Please add a category on the Categories page first before registering symbols.
              </div>
            )}
            {categoriesList.length > 0 && subcategoriesList.length === 0 && (
              <div style={{
                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid var(--accent-warning)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginBottom: '10px',
                color: 'var(--accent-warning)',
                fontSize: '13px',
                fontWeight: 500
              }}>
                ⚠️ No subcategories are registered. Please add subcategories on the Subcategories page first before registering symbols.
              </div>
            )}
          </>
        )}

        {/* Table / List Container */}
        {loading && symbolsList.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', gap: '12px' }}>
            <RefreshCw size={32} className="spin-icon" style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Fetching symbols...</span>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>ID</th>
                  <th>Symbol Code</th>
                  <th>Parent Category</th>
                  <th>Subcategory</th>
                  <th style={{ width: '200px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDbSymbols.length > 0 ? (
                  filteredDbSymbols.map((sym) => {
                    const isEditing = editingId === sym.id;
                    return (
                      <tr key={sym.id}>
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
                            #{sym.id}
                          </code>
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              className={styles.input}
                              style={{ width: '100%', maxWidth: '240px', padding: '6px 12px', textTransform: 'uppercase' }}
                              value={editingSymbolName}
                              onChange={(e) => setEditingSymbolName(e.target.value)}
                              disabled={submitting}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdate(sym.id);
                                if (e.key === 'Escape') {
                                  setEditingId(null);
                                  setEditingSymbolName('');
                                  setEditingCategoryName('');
                                  setEditingSubcategoryName('');
                                  setEditingOldSymbolName('');
                                }
                              }}
                            />
                          ) : (
                            <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '15px' }}>
                              {sym.symbol}
                            </span>
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <select
                              className={styles.input}
                              style={{ width: '100%', maxWidth: '180px', padding: '6px 10px', height: '36px' }}
                              value={editingCategoryName}
                              onChange={(e) => handleEditCategoryChange(e.target.value)}
                              disabled={submitting}
                            >
                              {categoriesList.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                              ))}
                            </select>
                          ) : (
                            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                              {sym.category}
                            </span>
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <select
                              className={styles.input}
                              style={{ width: '100%', maxWidth: '200px', padding: '6px 10px', height: '36px' }}
                              value={editingSubcategoryName}
                              onChange={(e) => setEditingSubcategoryName(e.target.value)}
                              disabled={submitting || availableEditSubcategories.length === 0}
                            >
                              {availableEditSubcategories.length === 0 ? (
                                <option value="">No subcategories</option>
                              ) : (
                                availableEditSubcategories.map(sub => (
                                  <option key={sub.id} value={sub.name}>{sub.name}</option>
                                ))
                              )}
                            </select>
                          ) : (
                            <span className={styles.badge} style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600 }}>
                              {sym.subcategory}
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleUpdate(sym.id)}
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
                                    setEditingSymbolName('');
                                    setEditingCategoryName('');
                                    setEditingSubcategoryName('');
                                    setEditingOldSymbolName('');
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
                                    setEditingId(sym.id);
                                    setEditingOldSymbolName(sym.symbol);
                                    setEditingSymbolName(sym.symbol);
                                    setEditingCategoryName(sym.category);
                                    setEditingSubcategoryName(sym.subcategory);
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
                                  onClick={() => handleDelete(sym.symbol)}
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
                    <td colSpan={5} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
                      <Activity size={36} style={{ marginBottom: '12px', opacity: 0.4, color: 'var(--text-muted)' }} />
                      <p style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-secondary)' }}>No Database Symbols Registered</p>
                      <p style={{ fontSize: '13px', marginTop: '4px' }}>
                        {dbSearchQuery ? `No records match "${dbSearchQuery}"` : 'Register your first symbol using the form above.'}
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

export default Symbols;
