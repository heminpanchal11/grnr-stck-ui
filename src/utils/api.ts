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
  const response = await fetch('/api/v1/categories');
  return handleResponse<CategoryResponse[]>(response);
}

/**
 * Create a new category in the backend.
 * POST /api/v1/categories
 */
export async function createCategory(request: CategoryRequest): Promise<CategoryResponse> {
  const response = await fetch('/api/v1/categories', {
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
  const response = await fetch(`/api/v1/categories/${id}`, {
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
  const response = await fetch(`/api/v1/categories/${id}`, {
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
  const response = await fetch('/api/v1/subcategories');
  return handleResponse<SubcategoryResponse[]>(response);
}

/**
 * Create a new subcategory in the backend.
 * POST /api/v1/subcategories
 */
export async function createSubcategory(request: SubcategoryRequest): Promise<SubcategoryResponse> {
  const response = await fetch('/api/v1/subcategories', {
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
  const response = await fetch(`/api/v1/subcategories/${id}`, {
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
  const response = await fetch(`/api/v1/subcategories/${id}`, {
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
  const response = await fetch('/api/v1/symbols');
  return handleResponse<StockSymbolResponse[]>(response);
}

/**
 * Create a new stock symbol in the backend.
 * POST /api/v1/symbols
 */
export async function createSymbol(request: StockSymbolRequest): Promise<StockSymbolResponse> {
  const response = await fetch('/api/v1/symbols', {
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
  const response = await fetch(`/api/v1/symbols/${encodeURIComponent(symbolName)}`, {
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
  const response = await fetch(`/api/v1/symbols/${encodeURIComponent(symbolName)}`, {
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
}

/**
 * Fetch all volume alerts from the backend.
 * GET /api/v1/alerts
 */
export async function getAlerts(): Promise<VolumeAlertResponse[]> {
  const response = await fetch('/api/v1/alerts');
  return handleResponse<VolumeAlertResponse[]>(response);
}


