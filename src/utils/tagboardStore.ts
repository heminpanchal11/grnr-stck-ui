import { getTagBoards, updateTagBoard, type TagBoardResponse, type StockSymbolResponse } from './api';

export const DEFAULT_MOCK_TAGBOARDS: TagBoardResponse[] = [
  {
    id: 101,
    name: 'Nifty IT Leaders',
    symbols: [
      { id: 2, symbol: 'TCS', category: 'IT', subcategory: 'Software Services' },
      { id: 3, symbol: 'INFY', category: 'IT', subcategory: 'Software Services' },
      { id: 4, symbol: 'WIPRO', category: 'IT', subcategory: 'Software Services' }
    ]
  },
  {
    id: 102,
    name: 'Energy & Metals',
    symbols: [
      { id: 1, symbol: 'RELIANCE', category: 'ENERGY', subcategory: 'OIL_REFINERY' },
      { id: 8, symbol: 'TATASTEEL', category: 'METALS', subcategory: 'Steel Products' }
    ]
  },
  {
    id: 103,
    name: 'Banking Giants',
    symbols: [
      { id: 5, symbol: 'HDFCBANK', category: 'FINANCE', subcategory: 'Private Banks' },
      { id: 6, symbol: 'ICICIBANK', category: 'FINANCE', subcategory: 'Private Banks' },
      { id: 7, symbol: 'SBIN', category: 'FINANCE', subcategory: 'Public Banks' }
    ]
  }
];

const LOCAL_STORAGE_KEY = 'grnr_tagboards_data';

/**
 * Fetch tagboards from API, with localStorage / default mock fallback
 */
export async function getTagBoardsWithFallback(): Promise<TagBoardResponse[]> {
  try {
    const boards = await getTagBoards();
    if (boards && boards.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(boards));
      return boards;
    }
  } catch (err) {
    console.warn('API getTagBoards failed, loading cached / mock tagboards.', err);
  }

  // Fallback to localStorage or DEFAULT_MOCK_TAGBOARDS
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // ignore parse error
    }
  }

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_MOCK_TAGBOARDS));
  return DEFAULT_MOCK_TAGBOARDS;
}

/**
 * Add a stock symbol to an existing tagboard by ID
 */
export async function addSymbolToExistingTagboard(
  boardId: number,
  symbolInfo: { symbol: string; category?: string; subcategory?: string }
): Promise<{ updatedBoards: TagBoardResponse[]; boardName: string; alreadyExisted: boolean }> {
  const currentBoards = await getTagBoardsWithFallback();
  const targetBoard = currentBoards.find(b => b.id === boardId);

  if (!targetBoard) {
    throw new Error('Tagboard not found');
  }

  const upperSymbol = symbolInfo.symbol.toUpperCase();
  const existingIndex = targetBoard.symbols.findIndex(s => s.symbol.toUpperCase() === upperSymbol);

  if (existingIndex !== -1) {
    return {
      updatedBoards: currentBoards,
      boardName: targetBoard.name,
      alreadyExisted: true
    };
  }

  // Create new symbol object
  const newSymbolObj: StockSymbolResponse = {
    id: Math.floor(Math.random() * 10000) + 1000,
    symbol: upperSymbol,
    category: symbolInfo.category || 'GENERAL',
    subcategory: symbolInfo.subcategory || 'GENERAL'
  };

  const updatedSymbols = [...targetBoard.symbols, newSymbolObj];
  const symbolNames = updatedSymbols.map(s => s.symbol);

  let updatedBoardFromServer: TagBoardResponse | null = null;
  try {
    updatedBoardFromServer = await updateTagBoard(boardId, {
      name: targetBoard.name,
      symbols: symbolNames
    });
  } catch (err) {
    console.warn('API updateTagBoard failed, performing mock update locally.', err);
  }

  const finalUpdatedBoard: TagBoardResponse = updatedBoardFromServer || {
    ...targetBoard,
    symbols: updatedSymbols
  };

  const updatedBoards = currentBoards.map(b => b.id === boardId ? finalUpdatedBoard : b);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedBoards));

  return {
    updatedBoards,
    boardName: targetBoard.name,
    alreadyExisted: false
  };
}
