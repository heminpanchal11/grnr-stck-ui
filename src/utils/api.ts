export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.PROD ? 'https://grnr-stck-api.onrender.com' : '')
).replace(/\/+$/, '');

export interface CategoryRequest {
  name: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
}

// Helper to handle fetch responses and parse errors
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `API error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Response was not JSON or parsing failed
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null as any;
  }

  return response.json();
}

/**
 * Fetch all categories from the backend.
 * GET /api/v1/categories
 */
export async function getCategories(): Promise<CategoryResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/categories`);
  return handleResponse<CategoryResponse[]>(response);
}

/**
 * Create a new category in the backend.
 * POST /api/v1/categories
 */
export async function createCategory(request: CategoryRequest): Promise<CategoryResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  return handleResponse<CategoryResponse>(response);
}

/**
 * Update an existing category by ID.
 * PUT /api/v1/categories/{id}
 */
export async function updateCategory(id: number, request: CategoryRequest): Promise<CategoryResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  return handleResponse<CategoryResponse>(response);
}

/**
 * Delete a category by ID.
 * DELETE /api/v1/categories/{id}
 */
export async function deleteCategory(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/categories/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<void>(response);
}

export interface SubcategoryRequest {
  name: string;
  categoryId: number;
}

export interface SubcategoryResponse {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
}

/**
 * Fetch all subcategories from the backend.
 * GET /api/v1/subcategories
 */
export async function getSubcategories(): Promise<SubcategoryResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/subcategories`);
  return handleResponse<SubcategoryResponse[]>(response);
}

/**
 * Create a new subcategory in the backend.
 * POST /api/v1/subcategories
 */
export async function createSubcategory(request: SubcategoryRequest): Promise<SubcategoryResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/subcategories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  return handleResponse<SubcategoryResponse>(response);
}

/**
 * Update an existing subcategory by ID.
 * PUT /api/v1/subcategories/{id}
 */
export async function updateSubcategory(id: number, request: SubcategoryRequest): Promise<SubcategoryResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/subcategories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  return handleResponse<SubcategoryResponse>(response);
}

/**
 * Delete a subcategory by ID.
 * DELETE /api/v1/subcategories/{id}
 */
export async function deleteSubcategory(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/subcategories/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<void>(response);
}

export interface StockSymbolRequest {
  symbol: string;
  category: string;
  subcategory: string;
}

export interface StockSymbolResponse {
  id: number;
  symbol: string;
  category: string;
  subcategory: string;
}

/**
 * Fetch all registered stock symbols.
 * GET /api/v1/symbols
 */
export async function getSymbols(): Promise<StockSymbolResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/symbols`);
  return handleResponse<StockSymbolResponse[]>(response);
}

/**
 * Create a new stock symbol in the backend.
 * POST /api/v1/symbols
 */
export async function createSymbol(request: StockSymbolRequest): Promise<StockSymbolResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/symbols`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  return handleResponse<StockSymbolResponse>(response);
}

/**
 * Update details of an existing stock symbol.
 * PUT /api/v1/symbols/{symbolName}
 */
export async function updateSymbol(symbolName: string, request: StockSymbolRequest): Promise<StockSymbolResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/symbols/${encodeURIComponent(symbolName)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  return handleResponse<StockSymbolResponse>(response);
}

/**
 * Delete a stock symbol by name.
 * DELETE /api/v1/symbols/{symbolName}
 */
export async function deleteSymbol(symbolName: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/symbols/${encodeURIComponent(symbolName)}`, {
    method: 'DELETE',
  });
  return handleResponse<void>(response);
}

export interface VolumeAlertResponse {
  id: number;
  stockSymbol: {
    id: number;
    symbol: string;
    subcategory: {
      id: number;
      name: string;
      category: {
        id: number;
        name: string;
      };
    };
  };
  alertDate: string;
  latestVolume: number;
  averageVolume: number;
  multiplier: number;
  thresholdUsed: number;
  percentageChange?: number;
  tradedQty?: number;
  deliveryQty?: number;
  deliveryPercentage?: number;
}

/**
 * Fetch all volume alerts from the backend.
 * GET /api/v1/alerts
 */
export async function getAlerts(): Promise<VolumeAlertResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/alerts`);
  return handleResponse<VolumeAlertResponse[]>(response);
}

export interface PageableObject {
  unpaged: boolean;
  paged: boolean;
  pageNumber: number;
  pageSize: number;
  offset: number;
}

export interface PageVolumeAlert {
  totalPages: number;
  totalElements: number;
  pageable: PageableObject;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  size: number;
  content: VolumeAlertResponse[];
  number: number;
  empty: boolean;
}

export interface SearchAlertsParams {
  symbol?: string;
  category?: string;
  subcategory?: string;
  startDate?: string;
  endDate?: string;
  minMultiplier?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

/**
 * Search and filter volume alerts.
 * GET /api/v1/alerts/search
 */
export async function searchAlerts(params: SearchAlertsParams): Promise<PageVolumeAlert> {
  const queryParams = new URLSearchParams();
  if (params.symbol) queryParams.append('symbol', params.symbol);
  if (params.category) queryParams.append('category', params.category);
  if (params.subcategory) queryParams.append('subcategory', params.subcategory);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.minMultiplier !== undefined) queryParams.append('minMultiplier', params.minMultiplier.toString());
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.size !== undefined) queryParams.append('size', params.size.toString());
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortDir) queryParams.append('sortDir', params.sortDir);

  const response = await fetch(`${API_BASE_URL}/api/v1/alerts/search?${queryParams.toString()}`);
  return handleResponse<PageVolumeAlert>(response);
}

/**
 * Fetch latest bhav records for all symbols.
 * GET /api/v1/scrapper/bhav/latest
 */
export async function getLatestBhav(symbol?: string): Promise<any> {
  const url = symbol 
    ? `${API_BASE_URL}/api/v1/scrapper/bhav/latest?symbol=${encodeURIComponent(symbol)}`
    : `${API_BASE_URL}/api/v1/scrapper/bhav/latest`;
  const response = await fetch(url);
  return handleResponse<any>(response);
}

/**
 * Fetch latest stored bhav record for a specific symbol.
 * GET /api/v1/bhav/{symbol}/latest
 */
export async function getLatestBhavForSymbol(symbol: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/v1/bhav/${encodeURIComponent(symbol)}/latest`);
  return handleResponse<any>(response);
}

export interface VolumeAlertDailySummaryCategory {
  alertDate: string;
  categoryName: string;
  alertCount: number;
}

export interface VolumeAlertDailySummarySubcategory {
  alertDate: string;
  subcategoryName: string;
  alertCount: number;
}

/**
 * Fetch total alerts generated daily grouped by category.
 * GET /api/v1/alerts/daily-summary
 */
export async function getDailyAlertsSummary(): Promise<VolumeAlertDailySummaryCategory[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/alerts/daily-summary`);
  return handleResponse<VolumeAlertDailySummaryCategory[]>(response);
}

/**
 * Fetch total alerts generated daily grouped by subcategory.
 * GET /api/v1/alerts/daily-subcategory-summary
 */
export async function getDailyAlertsSubcategorySummary(): Promise<VolumeAlertDailySummarySubcategory[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/alerts/daily-subcategory-summary`);
  return handleResponse<VolumeAlertDailySummarySubcategory[]>(response);
}

export interface TagBoardRequest {
  name: string;
  symbols: string[];
}

export interface TagBoardResponse {
  id: number;
  name: string;
  symbols: StockSymbolResponse[];
}

export interface DailyBhav {
  id: number;
  stockSymbol: StockSymbolResponse;
  series: string;
  tradeDate: string;
  previousClsPrice: number;
  openingPrice: number;
  tradeHighPrice: number;
  tradeLowPrice: number;
  lastTradedPrice: number;
  closingPrice: number;
  totTradedQty: number;
  totTradedVal: number;
}

/**
 * Fetch all tag boards from the backend.
 * GET /api/v1/tag-boards
 */
export async function getTagBoards(): Promise<TagBoardResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/tag-boards`);
  return handleResponse<TagBoardResponse[]>(response);
}

/**
 * Create a new tag board.
 * POST /api/v1/tag-boards
 */
export async function createTagBoard(request: TagBoardRequest): Promise<TagBoardResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/tag-boards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  return handleResponse<TagBoardResponse>(response);
}

/**
 * Update an existing tag board by ID.
 * PUT /api/v1/tag-boards/{id}
 */
export async function updateTagBoard(id: number, request: TagBoardRequest): Promise<TagBoardResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/tag-boards/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  return handleResponse<TagBoardResponse>(response);
}

/**
 * Delete a tag board by ID.
 * DELETE /api/v1/tag-boards/{id}
 */
export async function deleteTagBoard(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/tag-boards/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<void>(response);
}

/**
 * Fetch historic bhav data for a specific stock symbol.
 * GET /api/v1/bhav/{symbol}/historic
 */
export async function getHistoricBhav(symbol: string, startDate?: string, endDate?: string): Promise<DailyBhav[]> {
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  
  const url = queryParams.toString() 
    ? `${API_BASE_URL}/api/v1/bhav/${encodeURIComponent(symbol)}/historic?${queryParams.toString()}`
    : `${API_BASE_URL}/api/v1/bhav/${encodeURIComponent(symbol)}/historic`;
    
  const response = await fetch(url);
  return handleResponse<DailyBhav[]>(response);
}

export interface DeliveryAlertResponse {
  id: number;
  stockSymbol: StockSymbolResponse;
  alertDate: string;
  latestDeliveryPercentage: number;
  averageDeliveryPercentage: number;
  multiplier: number;
  thresholdUsed: number;
  percentageChange?: number;
  tradedQty?: number;
  deliveryQty?: number;
}

export interface PageDeliveryAlert {
  totalPages: number;
  totalElements: number;
  pageable: PageableObject;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  size: number;
  content: DeliveryAlertResponse[];
  number: number;
  empty: boolean;
}

/**
 * Search and filter delivery alerts.
 * GET /api/v1/delivery-alerts/search
 */
export async function searchDeliveryAlerts(params: SearchAlertsParams): Promise<PageDeliveryAlert> {
  const queryParams = new URLSearchParams();
  if (params.symbol) queryParams.append('symbol', params.symbol);
  if (params.category) queryParams.append('category', params.category);
  if (params.subcategory) queryParams.append('subcategory', params.subcategory);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.minMultiplier !== undefined) queryParams.append('minMultiplier', params.minMultiplier.toString());
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.size !== undefined) queryParams.append('size', params.size.toString());
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortDir) queryParams.append('sortDir', params.sortDir);

  const response = await fetch(`${API_BASE_URL}/api/v1/delivery-alerts/search?${queryParams.toString()}`);
  return handleResponse<PageDeliveryAlert>(response);
}






