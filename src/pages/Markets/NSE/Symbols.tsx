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
  Activity,
  ChevronRight
} from 'lucide-react';
import styles from '../../pages.module.css';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import {
  getSymbols,
  createSymbol,
  updateSymbol,
  deleteSymbol,
  getCategories,
  getSubcategories,
  getLatestBhav,
  getLatestBhavForSymbol,
  type StockSymbolResponse,
  type CategoryResponse,
  type SubcategoryResponse
} from '../../../utils/api';

interface SymbolRowProps {
  sym: StockSymbolResponse;
  bhavData: any | null;
  loading: boolean;
  isEditing: boolean;
  editingSymbolName: string;
  setEditingSymbolName: (val: string) => void;
  editingCategoryName: string;
  setEditingCategoryName: (val: string) => void;
  editingSubcategoryName: string;
  setEditingSubcategoryName: (val: string) => void;
  categoriesList: CategoryResponse[];
  availableEditSubcategories: SubcategoryResponse[];
  submitting: boolean;
  handleUpdate: (id: number) => void;
  handleDelete: (symbolName: string) => void;
  setEditingId: (id: number | null) => void;
  setEditingOldSymbolName: (val: string) => void;
  handleEditCategoryChange: (catName: string) => void;
}

const SymbolRow: React.FC<SymbolRowProps> = ({
  sym,
  bhavData,
  loading,
  isEditing,
  editingSymbolName,
  setEditingSymbolName,
  editingCategoryName,
  setEditingCategoryName,
  editingSubcategoryName,
  setEditingSubcategoryName,
  categoriesList,
  availableEditSubcategories,
  submitting,
  handleUpdate,
  handleDelete,
  setEditingId,
  setEditingOldSymbolName,
  handleEditCategoryChange
}) => {

  const renderBhavCells = () => {
    if (loading) {
      return (
        <>
          <td><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Loading...</span></td>
          <td><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Loading...</span></td>
          <td><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Loading...</span></td>
        </>
      );
    }
    if (!bhavData) {
      return (
        <>
          <td><span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>N/A</span></td>
          <td><span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>N/A</span></td>
          <td><span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>N/A</span></td>
        </>
      );
    }

    const price = bhavData.closingPrice || bhavData.lastTradedPrice || 0;
    const prevPrice = bhavData.previousClsPrice || 0;
    const change = price - prevPrice;
    const pctChange = prevPrice > 0 ? (change / prevPrice) * 100 : 0;
    const isPositive = change >= 0;

    return (
      <>
        <td style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
          ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
        <td>
          <span style={{
            color: isPositive ? 'var(--accent-success)' : 'var(--accent-error)',
            fontWeight: 700,
            backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '11px'
          }}>
            {isPositive ? '+' : ''}{pctChange.toFixed(2)}%
          </span>
        </td>
        <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {bhavData.totTradedQty >= 1000000 
            ? `${(bhavData.totTradedQty / 1000000).toFixed(2)}M` 
            : bhavData.totTradedQty >= 1000 
              ? `${(bhavData.totTradedQty / 1000).toFixed(1)}K` 
              : bhavData.totTradedQty.toLocaleString()}
        </td>
      </>
    );
  };

  return (
    <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* ID Column */}
      <td style={{ paddingLeft: '72px' }}>
        <code style={{
          backgroundColor: 'var(--bg-tertiary)',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontFamily: 'monospace',
          color: 'var(--text-secondary)',
          fontWeight: 600
        }}>
          #{sym.id}
        </code>
      </td>

      {/* Symbol Name / Editing Input Column */}
      <td style={{ paddingLeft: '12px' }}>
        {isEditing ? (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              className={styles.input}
              style={{ width: '100%', maxWidth: '180px', padding: '6px 12px', textTransform: 'uppercase' }}
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
            
            {/* Edit Category Selector */}
            <select
              className={styles.input}
              style={{ height: '34px', padding: '0 8px', minWidth: '130px', fontSize: '12px' }}
              value={editingCategoryName}
              onChange={(e) => handleEditCategoryChange(e.target.value)}
              disabled={submitting}
            >
              {categoriesList.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            {/* Edit Subcategory Selector */}
            <select
              className={styles.input}
              style={{ height: '34px', padding: '0 8px', minWidth: '140px', fontSize: '12px' }}
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
          </div>
        ) : (
          <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '14px' }}>
            {sym.symbol}
          </span>
        )}
      </td>

      {/* Bhav details cells (3 columns: Price, Change, Volume) */}
      {renderBhavCells()}

      {/* Actions Column */}
      <td style={{ textAlign: 'right', padding: '8px 16px' }}>
        <div style={{ display: 'inline-flex', gap: '8px' }}>
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => handleUpdate(sym.id)}
                className={styles.btnPrimary}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 600
                }}
                disabled={submitting}
              >
                <Check size={12} />
                Save
              </button>
              <button
                type="button"
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
                  fontSize: '11px'
                }}
                disabled={submitting}
              >
                <X size={12} />
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
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
                  padding: '5px 10px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 500
                }}
              >
                <Edit2 size={11} />
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(sym.symbol)}
                className={styles.input}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  backgroundColor: 'rgba(239, 68, 68, 0.05)',
                  borderColor: 'rgba(239, 68, 68, 0.2)',
                  color: 'var(--accent-error)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 500
                }}
              >
                <Trash2 size={11} />
                Delete
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export const Symbols: React.FC = () => {
  useDocumentTitle('NSE Symbols');
  // API Symbols Manager state
  const [symbolsList, setSymbolsList] = useState<StockSymbolResponse[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryResponse[]>([]);
  const [subcategoriesList, setSubcategoriesList] = useState<SubcategoryResponse[]>([]);
  const [dbSearchQuery, setDbSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Tree Stateful Controls
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());

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

  // Batch Bhav Data state
  const [bhavDataMap, setBhavDataMap] = useState<Record<string, any>>({});
  const [bhavLoading, setBhavLoading] = useState<boolean>(false);

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

  const fetchBhavDataForSymbols = async (symbols: StockSymbolResponse[]) => {
    if (!symbols || symbols.length === 0) return;
    setBhavLoading(true);
    try {
      const symbolNames = symbols.map(s => s.symbol).join(',');
      const data = await getLatestBhavForSymbol(symbolNames);
      const map: Record<string, any> = {};
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (item && item.symbol) {
            map[item.symbol.toUpperCase()] = item;
          }
        });
      } else if (data && typeof data === 'object') {
        if (data.symbol) {
          map[data.symbol.toUpperCase()] = data;
        }
      }
      setBhavDataMap(map);
    } catch (err) {
      console.warn('Failed to fetch batch bhav data', err);
    } finally {
      setBhavLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (symbolsList.length > 0) {
      fetchBhavDataForSymbols(symbolsList);
    } else {
      setBhavDataMap({});
    }
  }, [symbolsList]);

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

  // Trigger Scraper for latest bhav values
  const handleScrape = async () => {
    setScraping(true);
    setError(null);
    try {
      await getLatestBhav();
      showSuccess('Latest bhav values fetched successfully!');
      if (symbolsList.length > 0) {
        await fetchBhavDataForSymbols(symbolsList);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to trigger latest bhav scrapper.');
    } finally {
      setScraping(false);
    }
  };

  // Expand All / Collapse All handlers
  const expandAll = () => {
    const allCats = new Set<string>();
    const allSubs = new Set<string>();
    
    categoriesList.forEach(cat => {
      allCats.add(cat.name);
      const subs = subcategoriesList.filter(s => s.categoryId === cat.id || s.categoryName === cat.name);
      subs.forEach(sub => {
        allSubs.add(`${cat.name} > ${sub.name}`);
      });
    });
    
    // Also include any fallback categories / subcategories present in symbolsList
    symbolsList.forEach(sym => {
      allCats.add(sym.category);
      allSubs.add(`${sym.category} > ${sym.subcategory}`);
    });

    setExpandedCategories(allCats);
    setExpandedSubcategories(allSubs);
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
    setExpandedSubcategories(new Set());
  };

  // Toggle helpers
  const toggleCategory = (catName: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catName)) {
        next.delete(catName);
      } else {
        next.add(catName);
      }
      return next;
    });
  };

  const toggleSubcategory = (catName: string, subName: string) => {
    const key = `${catName} > ${subName}`;
    setExpandedSubcategories(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Group symbols hierarchically: Category > Subcategory > Symbol
  const groupedData = useMemo(() => {
    const groups: {
      [catName: string]: {
        id: number;
        subcategories: {
          [subName: string]: {
            id: number;
            symbols: StockSymbolResponse[];
          }
        }
      }
    } = {};

    // Initialize categories
    categoriesList.forEach(cat => {
      groups[cat.name] = {
        id: cat.id,
        subcategories: {}
      };
    });

    // Initialize subcategories
    subcategoriesList.forEach(sub => {
      const catName = sub.categoryName;
      if (groups[catName]) {
        groups[catName].subcategories[sub.name] = {
          id: sub.id,
          symbols: []
        };
      }
    });

    // Group symbols
    symbolsList.forEach(sym => {
      const catName = sym.category;
      const subName = sym.subcategory;
      if (!groups[catName]) {
        groups[catName] = {
          id: -1,
          subcategories: {}
        };
      }
      if (!groups[catName].subcategories[subName]) {
        groups[catName].subcategories[subName] = {
          id: -2,
          symbols: []
        };
      }
      groups[catName].subcategories[subName].symbols.push(sym);
    });

    return groups;
  }, [categoriesList, subcategoriesList, symbolsList]);

  // Filter grouped data and track overall result presence
  const filteredGroups = useMemo(() => {
    const searchLower = dbSearchQuery.toLowerCase().trim();
    if (!searchLower) {
      return { filtered: groupedData, hasResults: symbolsList.length > 0 };
    }

    const filtered: typeof groupedData = {};
    let hasResults = false;

    Object.keys(groupedData).forEach(catName => {
      const catInfo = groupedData[catName];
      const catNameMatches = catName.toLowerCase().includes(searchLower);

      const filteredSubcategories: typeof catInfo.subcategories = {};
      let catHasMatchingSub = false;

      Object.keys(catInfo.subcategories).forEach(subName => {
        const subInfo = catInfo.subcategories[subName];
        const subNameMatches = subName.toLowerCase().includes(searchLower);

        const matchedSymbols = subInfo.symbols.filter(sym => 
          sym.symbol.toLowerCase().includes(searchLower) ||
          sym.id.toString().includes(searchLower)
        );

        const finalSymbols = (catNameMatches || subNameMatches) ? subInfo.symbols : matchedSymbols;

        if (finalSymbols.length > 0 || subNameMatches) {
          filteredSubcategories[subName] = {
            ...subInfo,
            symbols: finalSymbols
          };
          catHasMatchingSub = true;
        }
      });

      if (catNameMatches || catHasMatchingSub) {
        filtered[catName] = {
          ...catInfo,
          subcategories: filteredSubcategories
        };
        hasResults = true;
      }
    });

    return { filtered, hasResults };
  }, [groupedData, dbSearchQuery, symbolsList]);

  // Auto expand categories & subcategories containing search matches
  useEffect(() => {
    const searchLower = dbSearchQuery.toLowerCase().trim();
    if (searchLower.length > 0) {
      const catsToExpand = new Set<string>();
      const subsToExpand = new Set<string>();

      Object.keys(groupedData).forEach(catName => {
        const catInfo = groupedData[catName];
        const catNameMatches = catName.toLowerCase().includes(searchLower);
        let catShouldExpand = catNameMatches;

        Object.keys(catInfo.subcategories).forEach(subName => {
          const subInfo = catInfo.subcategories[subName];
          const subNameMatches = subName.toLowerCase().includes(searchLower);
          const hasMatchingSymbol = subInfo.symbols.some(s =>
            s.symbol.toLowerCase().includes(searchLower) || s.id.toString().includes(searchLower)
          );

          if (subNameMatches || hasMatchingSymbol) {
            catsToExpand.add(catName);
            subsToExpand.add(`${catName} > ${subName}`);
            catShouldExpand = true;
          }
        });

        if (catShouldExpand) {
          catsToExpand.add(catName);
        }
      });

      setExpandedCategories(catsToExpand);
      setExpandedSubcategories(subsToExpand);
    }
  }, [dbSearchQuery, groupedData]);

  // Get unique union list of categories to render
  const categoriesToRender = useMemo(() => {
    const list = [...categoriesList];
    symbolsList.forEach(sym => {
      if (sym.category && !list.some(c => c.name === sym.category)) {
        list.push({
          id: -Math.abs(sym.category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)),
          name: sym.category
        });
      }
    });
    return list;
  }, [categoriesList, symbolsList]);

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

      {/* API Symbols Manager Card */}
      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '8px' }}>
          <div>
            <h3 className={styles.sectionTitle} style={{ marginBottom: '4px' }}>Symbol Database Manager</h3>
            <p className={styles.pageSubtitle} style={{ marginBottom: '16px' }}>
              Register new NSE stock symbols and map them to their parent industry categories and subcategories.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleScrape}
              className={styles.btnPrimary}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 14px',
                fontSize: '13px',
                alignSelf: 'auto',
                cursor: 'pointer'
              }}
              disabled={scraping || loading}
              title="Trigger latest bhav values scrape"
            >
              <Activity size={14} className={scraping ? 'spin-icon' : ''} />
              {scraping ? 'Scraping...' : 'Scrape Latest Values'}
            </button>

            <button
              type="button"
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
              disabled={loading || scraping}
              title="Refresh database entries"
            >
              <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
              Refresh Sync
            </button>
          </div>
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
          {/* Search Box & Tree Toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 2, minWidth: '260px' }}>
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', width: '16px', height: '16px', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search symbols, subcategories, categories..."
                className={styles.input}
                style={{ paddingLeft: '36px', width: '100%' }}
                value={dbSearchQuery}
                onChange={(e) => setDbSearchQuery(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={expandAll}
                className={styles.input}
                style={{ padding: '8px 12px', cursor: 'pointer', fontWeight: 600, fontSize: '12px', height: '42px' }}
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className={styles.input}
                style={{ padding: '8px 12px', cursor: 'pointer', fontWeight: 600, fontSize: '12px', height: '42px' }}
              >
                Collapse All
              </button>
            </div>
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
                  <th style={{ width: '80px' }}>ID</th>
                  <th>Symbol / Hierarchy</th>
                  <th style={{ width: '120px' }}>Latest Price</th>
                  <th style={{ width: '110px' }}>Daily Change</th>
                  <th style={{ width: '130px' }}>Traded Volume</th>
                  <th style={{ width: '180px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categoriesToRender.length > 0 && filteredGroups.hasResults ? (
                  categoriesToRender.map(cat => {
                    const catName = cat.name;
                    if (dbSearchQuery && !filteredGroups.filtered[catName]) return null;

                    const catInfo = filteredGroups.filtered[catName] || { id: cat.id, subcategories: {} };
                    const subcategoryNames = Object.keys(catInfo.subcategories);
                    const isCatExpanded = expandedCategories.has(catName);

                    return (
                      <React.Fragment key={cat.id}>
                        {/* Parent Category Row (Level 0) */}
                        <tr
                          onClick={() => toggleCategory(catName)}
                          style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            cursor: 'pointer',
                            userSelect: 'none',
                            borderLeft: isCatExpanded ? '3px solid var(--primary)' : '3px solid transparent'
                          }}
                        >
                          <td>
                            <code style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              #{cat.id < 0 ? 'N/A' : cat.id}
                            </code>
                          </td>
                          <td colSpan={4} style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <ChevronRight 
                                size={16} 
                                style={{ 
                                  color: 'var(--text-muted)',
                                  transform: isCatExpanded ? 'rotate(90deg)' : 'none',
                                  transition: 'transform var(--transition-fast)'
                                }} 
                              />
                              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>
                                {catName}
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
                                {subcategoryNames.length} {subcategoryNames.length === 1 ? 'subcategory' : 'subcategories'}
                              </span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'right', padding: '12px 16px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                              {isCatExpanded ? 'Collapse' : 'Expand'}
                            </span>
                          </td>
                        </tr>

                        {/* Children Subcategories (Level 1) */}
                        {isCatExpanded && (
                          subcategoryNames.length === 0 ? (
                            <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                              <td></td>
                              <td colSpan={5} style={{ padding: '12px 16px 12px 48px', color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>
                                No industry subcategories are registered under this sector category.
                              </td>
                            </tr>
                          ) : (
                            subcategoryNames.map(subName => {
                              const subInfo = catInfo.subcategories[subName];
                              const subKey = `${catName} > ${subName}`;
                              const isSubExpanded = expandedSubcategories.has(subKey);
                              const symbols = subInfo.symbols;

                              return (
                                <React.Fragment key={subKey}>
                                  {/* Subcategory Row (Level 1) */}
                                  <tr
                                    onClick={() => toggleSubcategory(catName, subName)}
                                    style={{
                                      backgroundColor: 'var(--bg-secondary)',
                                      cursor: 'pointer',
                                      userSelect: 'none',
                                      borderLeft: isSubExpanded ? '3px solid var(--accent-info)' : '3px solid transparent'
                                    }}
                                  >
                                    <td>
                                      <code style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                        #{subInfo.id < 0 ? 'N/A' : subInfo.id}
                                      </code>
                                    </td>
                                    <td colSpan={4} style={{ padding: '10px 16px 10px 40px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <ChevronRight 
                                          size={14} 
                                          style={{ 
                                            color: 'var(--text-muted)',
                                            transform: isSubExpanded ? 'rotate(90deg)' : 'none',
                                            transition: 'transform var(--transition-fast)'
                                          }} 
                                        />
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                                          {subName}
                                        </span>
                                        <span 
                                          className={styles.badge} 
                                          style={{ 
                                            backgroundColor: 'rgba(14, 165, 233, 0.1)', 
                                            color: 'var(--accent-info)', 
                                            textTransform: 'none', 
                                            letterSpacing: 0,
                                            fontWeight: 600,
                                            fontSize: '10px',
                                            padding: '1px 6px'
                                          }}
                                        >
                                          {symbols.length} {symbols.length === 1 ? 'symbol' : 'symbols'}
                                        </span>
                                      </div>
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '10px 16px' }}>
                                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                                        {isSubExpanded ? 'Collapse' : 'Expand'}
                                      </span>
                                    </td>
                                  </tr>

                                  {/* Symbols (Level 2) */}
                                  {isSubExpanded && (
                                    symbols.length === 0 ? (
                                      <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                        <td></td>
                                        <td colSpan={5} style={{ padding: '10px 16px 10px 72px', color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>
                                          No symbols are registered under this subcategory.
                                        </td>
                                      </tr>
                                    ) : (
                                      symbols.map(sym => (
                                        <SymbolRow
                                          key={sym.id}
                                          sym={sym}
                                          bhavData={bhavDataMap[sym.symbol.toUpperCase()] || null}
                                          loading={bhavLoading}
                                          isEditing={editingId === sym.id}
                                          editingSymbolName={editingSymbolName}
                                          setEditingSymbolName={setEditingSymbolName}
                                          editingCategoryName={editingCategoryName}
                                          setEditingCategoryName={setEditingCategoryName}
                                          editingSubcategoryName={editingSubcategoryName}
                                          setEditingSubcategoryName={setEditingSubcategoryName}
                                          categoriesList={categoriesList}
                                          availableEditSubcategories={availableEditSubcategories}
                                          submitting={submitting}
                                          handleUpdate={handleUpdate}
                                          handleDelete={handleDelete}
                                          setEditingId={setEditingId}
                                          setEditingOldSymbolName={setEditingOldSymbolName}
                                          handleEditCategoryChange={handleEditCategoryChange}
                                        />
                                      ))
                                    )
                                  )}
                                </React.Fragment>
                              );
                            })
                          )
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
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
