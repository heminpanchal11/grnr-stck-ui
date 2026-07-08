{
    "openapi": "3.0.1",
    "info": {
        "title": "GrnrStck API",
        "description": "REST API for GrnrStck (Green Stock) - a Stock Scraping and Analysis Platform using Spring Boot and PostgreSQL.",
        "contact": {
            "name": "GrnrStck Team",
            "email": "girnarstocks@gmail.com"
        },
        "version": "v0.0.1"
    },
    "servers": [
        {
            "url": "http://localhost:8080",
            "description": "Generated server url"
        }
    ],
    "tags": [
        {
            "name": "Category",
            "description": "Endpoints for managing stock categories"
        },
        {
            "name": "Market Holiday",
            "description": "Endpoints for managing market holidays"
        },
        {
            "name": "Stock Symbol",
            "description": "Endpoints for managing stock symbols"
        },
        {
            "name": "Volume Alerts",
            "description": "Endpoints for volume spike tracking and alerts"
        },
        {
            "name": "Subcategory",
            "description": "Endpoints for managing stock subcategories"
        },
        {
            "name": "Health",
            "description": "Endpoints for application health check"
        },
        {
            "name": "Stock Scrapper",
            "description": "Endpoints for scraping and retrieving stock daily bhav (price) data"
        },
        {
            "name": "Stock Bhav Data",
            "description": "Endpoints for serving latest and historic bhav data of stock symbols"
        },
        {
            "name": "TagBoard",
            "description": "Endpoints for managing tag boards"
        }
    ],
    "paths": {
        "/api/v1/tag-boards/{id}": {
            "get": {
                "tags": [
                    "TagBoard"
                ],
                "summary": "Get a tag board by ID",
                "description": "Retrieves details of a specific tag board using its ID.",
                "operationId": "getTagBoard",
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "required": true,
                        "schema": {
                            "type": "integer",
                            "format": "int64"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Successfully retrieved tag board details",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/TagBoardResponse"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Tag board not found",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/TagBoardResponse"
                                }
                            }
                        }
                    }
                }
            },
            "put": {
                "tags": [
                    "TagBoard"
                ],
                "summary": "Update a tag board by ID",
                "description": "Updates the name or associated symbols of an existing tag board.",
                "operationId": "updateTagBoard",
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "required": true,
                        "schema": {
                            "type": "integer",
                            "format": "int64"
                        }
                    }
                ],
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/TagBoardRequest"
                            }
                        }
                    },
                    "required": true
                },
                "responses": {
                    "404": {
                        "description": "Tag board not found",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/TagBoardResponse"
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Invalid input data",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/TagBoardResponse"
                                }
                            }
                        }
                    },
                    "200": {
                        "description": "Tag board updated successfully",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/TagBoardResponse"
                                }
                            }
                        }
                    }
                }
            },
            "delete": {
                "tags": [
                    "TagBoard"
                ],
                "summary": "Delete a tag board by ID",
                "description": "Deletes a tag board using its ID.",
                "operationId": "deleteTagBoard",
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "required": true,
                        "schema": {
                            "type": "integer",
                            "format": "int64"
                        }
                    }
                ],
                "responses": {
                    "204": {
                        "description": "Tag board deleted successfully"
                    },
                    "404": {
                        "description": "Tag board not found"
                    }
                }
            }
        },
        "/api/v1/symbols/{symbol}": {
            "get": {
                "tags": [
                    "Stock Symbol"
                ],
                "summary": "Get a stock symbol by name",
                "description": "Retrieves details of a specific stock symbol by its name (e.g. RELIANCE).",
                "operationId": "getSymbol",
                "parameters": [
                    {
                        "name": "symbol",
                        "in": "path",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    }
                ],
                "responses": {
                    "404": {
                        "description": "Stock symbol not found",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/StockSymbolResponse"
                                }
                            }
                        }
                    },
                    "200": {
                        "description": "Successfully retrieved stock symbol details",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/StockSymbolResponse"
                                }
                            }
                        }
                    }
                }
            },
            "put": {
                "tags": [
                    "Stock Symbol"
                ],
                "summary": "Update a stock symbol by name",
                "description": "Updates details (such as category/subcategory) of an existing stock symbol.",
                "operationId": "updateSymbol",
                "parameters": [
                    {
                        "name": "symbol",
                        "in": "path",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    }
                ],
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/StockSymbolRequest"
                            }
                        }
                    },
                    "required": true
                },
                "responses": {
                    "404": {
                        "description": "Stock symbol not found",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/StockSymbolResponse"
                                }
                            }
                        }
                    },
                    "200": {
                        "description": "Stock symbol updated successfully",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/StockSymbolResponse"
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Invalid input data",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/StockSymbolResponse"
                                }
                            }
                        }
                    }
                }
            },
            "delete": {
                "tags": [
                    "Stock Symbol"
                ],
                "summary": "Delete a stock symbol by name",
                "description": "Deletes a stock symbol from the system.",
                "operationId": "deleteSymbol",
                "parameters": [
                    {
                        "name": "symbol",
                        "in": "path",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    }
                ],
                "responses": {
                    "204": {
                        "description": "Stock symbol deleted successfully"
                    },
                    "404": {
                        "description": "Stock symbol not found"
                    }
                }
            }
        },
        "/api/v1/subcategories/{id}": {
            "get": {
                "tags": [
                    "Subcategory"
                ],
                "summary": "Get a subcategory by ID",
                "description": "Retrieves details of a specific subcategory using its ID.",
                "operationId": "getSubcategory",
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "required": true,
                        "schema": {
                            "type": "integer",
                            "format": "int64"
                        }
                    }
                ],
                "responses": {
                    "404": {
                        "description": "Subcategory not found",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/SubcategoryResponse"
                                }
                            }
                        }
                    },
                    "200": {
                        "description": "Successfully retrieved subcategory details",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/SubcategoryResponse"
                                }
                            }
                        }
                    }
                }
            },
            "put": {
                "tags": [
                    "Subcategory"
                ],
                "summary": "Update a subcategory by ID",
                "description": "Updates details of an existing subcategory using its ID.",
                "operationId": "updateSubcategory",
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "required": true,
                        "schema": {
                            "type": "integer",
                            "format": "int64"
                        }
                    }
                ],
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/SubcategoryRequest"
                            }
                        }
                    },
                    "required": true
                },
                "responses": {
                    "200": {
                        "description": "Subcategory updated successfully",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/SubcategoryResponse"
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Invalid input data",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/SubcategoryResponse"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Subcategory not found",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/SubcategoryResponse"
                                }
                            }
                        }
                    }
                }
            },
            "delete": {
                "tags": [
                    "Subcategory"
                ],
                "summary": "Delete a subcategory by ID",
                "description": "Deletes a subcategory using its ID.",
                "operationId": "deleteSubcategory",
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "required": true,
                        "schema": {
                            "type": "integer",
                            "format": "int64"
                        }
                    }
                ],
                "responses": {
                    "404": {
                        "description": "Subcategory not found"
                    },
                    "204": {
                        "description": "Subcategory deleted successfully"
                    }
                }
            }
        },
        "/api/v1/holidays/{id}": {
            "get": {
                "tags": [
                    "Market Holiday"
                ],
                "summary": "Get a market holiday by ID",
                "description": "Retrieves details of a specific market holiday using its ID.",
                "operationId": "getHoliday",
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "required": true,
                        "schema": {
                            "type": "integer",
                            "format": "int64"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Successfully retrieved market holiday details",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/MarketHolidayResponse"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Market holiday not found",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/MarketHolidayResponse"
                                }
                            }
                        }
                    }
                }
            },
            "put": {
                "tags": [
                    "Market Holiday"
                ],
                "summary": "Update a market holiday by ID",
                "description": "Updates details of an existing market holiday.",
                "operationId": "updateHoliday",
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "required": true,
                        "schema": {
                            "type": "integer",
                            "format": "int64"
                        }
                    }
                ],
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/MarketHolidayRequest"
                            }
                        }
                    },
                    "required": true
                },
                "responses": {
                    "404": {
                        "description": "Market holiday not found",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/MarketHolidayResponse"
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Invalid input data",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/MarketHolidayResponse"
                                }
                            }
                        }
                    },
                    "200": {
                        "description": "Market holiday updated successfully",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/MarketHolidayResponse"
                                }
                            }
                        }
                    }
                }
            },
            "delete": {
                "tags": [
                    "Market Holiday"
                ],
                "summary": "Delete a market holiday by ID",
                "description": "Deletes a market holiday using its ID.",
                "operationId": "deleteHoliday",
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "required": true,
                        "schema": {
                            "type": "integer",
                            "format": "int64"
                        }
                    }
                ],
                "responses": {
                    "404": {
                        "description": "Market holiday not found"
                    },
                    "204": {
                        "description": "Market holiday deleted successfully"
                    }
                }
            }
        },
        "/api/v1/categories/{id}": {
            "get": {
                "tags": [
                    "Category"
                ],
                "summary": "Get a category by ID",
                "description": "Retrieves details of a specific category using its ID.",
                "operationId": "getCategory",
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "required": true,
                        "schema": {
                            "type": "integer",
                            "format": "int64"
                        }
                    }
                ],
                "responses": {
                    "404": {
                        "description": "Category not found",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/CategoryResponse"
                                }
                            }
                        }
                    },
                    "200": {
                        "description": "Successfully retrieved category details",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/CategoryResponse"
                                }
                            }
                        }
                    }
                }
            },
            "put": {
                "tags": [
                    "Category"
                ],
                "summary": "Update a category by ID",
                "description": "Updates the name or attributes of an existing category.",
                "operationId": "updateCategory",
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "required": true,
                        "schema": {
                            "type": "integer",
                            "format": "int64"
                        }
                    }
                ],
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/CategoryRequest"
                            }
                        }
                    },
                    "required": true
                },
                "responses": {
                    "200": {
                        "description": "Category updated successfully",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/CategoryResponse"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Category not found",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/CategoryResponse"
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Invalid input data",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/CategoryResponse"
                                }
                            }
                        }
                    }
                }
            },
            "delete": {
                "tags": [
                    "Category"
                ],
                "summary": "Delete a category by ID",
                "description": "Deletes a category and its associated data using its ID.",
                "operationId": "deleteCategory",
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "required": true,
                        "schema": {
                            "type": "integer",
                            "format": "int64"
                        }
                    }
                ],
                "responses": {
                    "404": {
                        "description": "Category not found"
                    },
                    "204": {
                        "description": "Category deleted successfully"
                    }
                }
            }
        },
        "/api/v1/tag-boards": {
            "get": {
                "tags": [
                    "TagBoard"
                ],
                "summary": "Get all tag boards",
                "description": "Retrieves a list of all tag boards.",
                "operationId": "getAllTagBoards",
                "responses": {
                    "200": {
                        "description": "Successfully retrieved list of tag boards",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "$ref": "#/components/schemas/TagBoardResponse"
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "post": {
                "tags": [
                    "TagBoard"
                ],
                "summary": "Create a new tag board",
                "description": "Creates a new tag board with the specified name and associated symbols.",
                "operationId": "createTagBoard",
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/TagBoardRequest"
                            }
                        }
                    },
                    "required": true
                },
                "responses": {
                    "400": {
                        "description": "Invalid input data or duplicate name",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/TagBoardResponse"
                                }
                            }
                        }
                    },
                    "201": {
                        "description": "Tag board created successfully",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/TagBoardResponse"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/symbols": {
            "get": {
                "tags": [
                    "Stock Symbol"
                ],
                "summary": "Get all stock symbols",
                "description": "Retrieves a list of all registered stock symbols.",
                "operationId": "getAllSymbols",
                "responses": {
                    "200": {
                        "description": "Successfully retrieved list of stock symbols",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "$ref": "#/components/schemas/StockSymbolResponse"
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "post": {
                "tags": [
                    "Stock Symbol"
                ],
                "summary": "Create a stock symbol",
                "description": "Registers a new stock symbol in the system.",
                "operationId": "createSymbol",
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/StockSymbolRequest"
                            }
                        }
                    },
                    "required": true
                },
                "responses": {
                    "400": {
                        "description": "Invalid input data",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/StockSymbolResponse"
                                }
                            }
                        }
                    },
                    "201": {
                        "description": "Stock symbol created successfully",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/StockSymbolResponse"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/subcategories": {
            "get": {
                "tags": [
                    "Subcategory"
                ],
                "summary": "Get all subcategories",
                "description": "Retrieves a list of all stock subcategories.",
                "operationId": "getAllSubcategories",
                "responses": {
                    "200": {
                        "description": "Successfully retrieved list of subcategories",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "$ref": "#/components/schemas/SubcategoryResponse"
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "post": {
                "tags": [
                    "Subcategory"
                ],
                "summary": "Create a new subcategory",
                "description": "Creates a new stock subcategory under a category.",
                "operationId": "createSubcategory",
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/SubcategoryRequest"
                            }
                        }
                    },
                    "required": true
                },
                "responses": {
                    "400": {
                        "description": "Invalid input data",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/SubcategoryResponse"
                                }
                            }
                        }
                    },
                    "201": {
                        "description": "Subcategory created successfully",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/SubcategoryResponse"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/scrapper/scrape": {
            "post": {
                "tags": [
                    "Stock Scrapper"
                ],
                "summary": "Scrape stock data",
                "description": "Scrapes daily bhav (price) data from the NSE website for a given symbol or symbol ID within a date range and saves it.",
                "operationId": "scrapeStock",
                "parameters": [
                    {
                        "name": "symbol",
                        "in": "query",
                        "description": "Stock symbol (e.g. RELIANCE)",
                        "required": false,
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "name": "symbol_id",
                        "in": "query",
                        "description": "Database ID of the stock symbol",
                        "required": false,
                        "schema": {
                            "type": "integer",
                            "format": "int64"
                        }
                    },
                    {
                        "name": "from",
                        "in": "query",
                        "description": "Start date in format dd-MM-yyyy",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "name": "to",
                        "in": "query",
                        "description": "End date in format dd-MM-yyyy",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "name": "allowOverwrite",
                        "in": "query",
                        "description": "Whether to overwrite existing records in the date range",
                        "required": false,
                        "schema": {
                            "type": "boolean",
                            "default": false
                        }
                    },
                    {
                        "name": "Cookie",
                        "in": "header",
                        "description": "Standard Cookie header containing NSE active cookies",
                        "required": false,
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "name": "nse-cookie",
                        "in": "header",
                        "description": "Custom header containing NSE active cookies",
                        "required": false,
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "name": "cookie",
                        "in": "query",
                        "description": "Cookie query parameter containing NSE active cookies",
                        "required": false,
                        "schema": {
                            "type": "string"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Stock data scraped and saved successfully",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "$ref": "#/components/schemas/DailyBhav"
                                    }
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Invalid date format or missing required fields",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "$ref": "#/components/schemas/DailyBhav"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/holidays": {
            "get": {
                "tags": [
                    "Market Holiday"
                ],
                "summary": "Get all market holidays",
                "description": "Retrieves a list of all registered market holidays.",
                "operationId": "getAllHolidays",
                "responses": {
                    "200": {
                        "description": "Successfully retrieved list of market holidays",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "$ref": "#/components/schemas/MarketHolidayResponse"
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "post": {
                "tags": [
                    "Market Holiday"
                ],
                "summary": "Create a new market holiday",
                "description": "Registers a new market holiday in the system.",
                "operationId": "createHoliday",
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/MarketHolidayRequest"
                            }
                        }
                    },
                    "required": true
                },
                "responses": {
                    "201": {
                        "description": "Market holiday created successfully",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/MarketHolidayResponse"
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Invalid input data",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/MarketHolidayResponse"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/categories": {
            "get": {
                "tags": [
                    "Category"
                ],
                "summary": "Get all categories",
                "description": "Retrieves a list of all stock categories.",
                "operationId": "getAllCategories",
                "responses": {
                    "200": {
                        "description": "Successfully retrieved list of categories",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "$ref": "#/components/schemas/CategoryResponse"
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "post": {
                "tags": [
                    "Category"
                ],
                "summary": "Create a new category",
                "description": "Creates a new stock category with the specified name.",
                "operationId": "createCategory",
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/CategoryRequest"
                            }
                        }
                    },
                    "required": true
                },
                "responses": {
                    "400": {
                        "description": "Invalid input data",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/CategoryResponse"
                                }
                            }
                        }
                    },
                    "201": {
                        "description": "Category created successfully",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/CategoryResponse"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/alerts/check/{symbolId}": {
            "post": {
                "tags": [
                    "Volume Alerts"
                ],
                "summary": "Check volume spike for a symbol",
                "description": "Runs the volume spike check for a given symbol ID against the last 7-day average. Creates an alert if the threshold is met.",
                "operationId": "checkVolumeSpike",
                "parameters": [
                    {
                        "name": "symbolId",
                        "in": "path",
                        "required": true,
                        "schema": {
                            "type": "integer",
                            "format": "int64"
                        }
                    },
                    {
                        "name": "threshold",
                        "in": "query",
                        "description": "Custom volume threshold multiplier (defaults to 1.5)",
                        "required": false,
                        "schema": {
                            "type": "number",
                            "format": "double"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Check completed successfully"
                    }
                }
            }
        },
        "/api/v1/scrapper/bhav": {
            "get": {
                "tags": [
                    "Stock Scrapper"
                ],
                "summary": "Get stored bhav data",
                "description": "Retrieves all saved daily bhav records for a given stock symbol.",
                "operationId": "getBhavData",
                "parameters": [
                    {
                        "name": "symbol",
                        "in": "query",
                        "description": "Stock symbol (e.g. RELIANCE)",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Successfully retrieved stored bhav data",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "$ref": "#/components/schemas/DailyBhav"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/scrapper/bhav/symbol/{symbolId}": {
            "get": {
                "tags": [
                    "Stock Scrapper"
                ],
                "summary": "Get stored bhav data by symbol ID and date range",
                "description": "Retrieves stored daily bhav records for a given stock symbol ID, optionally filtered by a start and end date range.",
                "operationId": "getBhavDataBySymbolId",
                "parameters": [
                    {
                        "name": "symbolId",
                        "in": "path",
                        "description": "Database ID of the stock symbol",
                        "required": true,
                        "schema": {
                            "type": "integer",
                            "format": "int64"
                        }
                    },
                    {
                        "name": "startDate",
                        "in": "query",
                        "description": "Start date (yyyy-MM-dd)",
                        "required": false,
                        "schema": {
                            "type": "string",
                            "format": "date"
                        }
                    },
                    {
                        "name": "endDate",
                        "in": "query",
                        "description": "End date (yyyy-MM-dd)",
                        "required": false,
                        "schema": {
                            "type": "string",
                            "format": "date"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Successfully retrieved bhav data",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "$ref": "#/components/schemas/DailyBhav"
                                    }
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Stock symbol ID not found",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "$ref": "#/components/schemas/DailyBhav"
                                    }
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Invalid date format or request parameters",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "$ref": "#/components/schemas/DailyBhav"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/scrapper/bhav/symbol/{symbolId}/latest": {
            "get": {
                "tags": [
                    "Stock Scrapper"
                ],
                "summary": "Get the latest stored bhav data for a symbol ID",
                "description": "Retrieves the single most recent daily bhav record (by trade date) stored for a given stock symbol ID.",
                "operationId": "getLatestBhavDataBySymbolId",
                "parameters": [
                    {
                        "name": "symbolId",
                        "in": "path",
                        "description": "Database ID of the stock symbol",
                        "required": true,
                        "schema": {
                            "type": "integer",
                            "format": "int64"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Successfully retrieved the latest bhav data",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/DailyBhav"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Stock symbol ID not found or no bhav data exists for this symbol",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/DailyBhav"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/scrapper/bhav/search": {
            "get": {
                "tags": [
                    "Stock Scrapper"
                ],
                "summary": "Search/filter bhav data",
                "description": "Search and filter stock bhav data by symbol, category, subcategory, date range, and price range, with pagination and sorting support.",
                "operationId": "searchBhavData",
                "parameters": [
                    {
                        "name": "symbol",
                        "in": "query",
                        "description": "Stock symbol",
                        "required": false,
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "name": "category",
                        "in": "query",
                        "description": "Category name",
                        "required": false,
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "name": "subcategory",
                        "in": "query",
                        "description": "Subcategory name",
                        "required": false,
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "name": "startDate",
                        "in": "query",
                        "description": "Start date (yyyy-MM-dd)",
                        "required": false,
                        "schema": {
                            "type": "string",
                            "format": "date"
                        }
                    },
                    {
                        "name": "endDate",
                        "in": "query",
                        "description": "End date (yyyy-MM-dd)",
                        "required": false,
                        "schema": {
                            "type": "string",
                            "format": "date"
                        }
                    },
                    {
                        "name": "minPrice",
                        "in": "query",
                        "description": "Minimum close price",
                        "required": false,
                        "schema": {
                            "type": "number",
                            "format": "double"
                        }
                    },
                    {
                        "name": "maxPrice",
                        "in": "query",
                        "description": "Maximum close price",
                        "required": false,
                        "schema": {
                            "type": "number",
                            "format": "double"
                        }
                    },
                    {
                        "name": "page",
                        "in": "query",
                        "description": "Page number (0-indexed)",
                        "required": false,
                        "schema": {
                            "type": "integer",
                            "format": "int32",
                            "default": 0
                        }
                    },
                    {
                        "name": "size",
                        "in": "query",
                        "description": "Page size",
                        "required": false,
                        "schema": {
                            "type": "integer",
                            "format": "int32",
                            "default": 20
                        }
                    },
                    {
                        "name": "sortBy",
                        "in": "query",
                        "description": "Field name to sort by",
                        "required": false,
                        "schema": {
                            "type": "string",
                            "default": "tradeDate"
                        }
                    },
                    {
                        "name": "sortDir",
                        "in": "query",
                        "description": "Sort direction (asc or desc)",
                        "required": false,
                        "schema": {
                            "type": "string",
                            "default": "desc"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Successfully filtered and retrieved bhav data page",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/PageDailyBhav"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/scrapper/bhav/latest": {
            "get": {
                "tags": [
                    "Stock Scrapper"
                ],
                "summary": "Get the latest bhav record for all symbols or a specific symbol",
                "description": "Retrieves the single latest stored bhav record from the latest_bhav table for all symbols or a specific symbol.",
                "operationId": "getLatestBhav",
                "parameters": [
                    {
                        "name": "symbol",
                        "in": "query",
                        "description": "Stock symbol (e.g. RELIANCE)",
                        "required": false,
                        "schema": {
                            "type": "string"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Successfully retrieved latest bhav records",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "type": "object"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/health": {
            "get": {
                "tags": [
                    "Health"
                ],
                "summary": "Get application health status",
                "description": "Checks whether the API service is up and running.",
                "operationId": "getHealth",
                "responses": {
                    "200": {
                        "description": "Application is healthy",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "type": "object",
                                    "additionalProperties": {
                                        "type": "string"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/bhav/{symbol}/latest": {
            "get": {
                "tags": [
                    "Stock Bhav Data"
                ],
                "summary": "Get latest bhav data of a symbol or multiple comma-separated symbols",
                "description": "Retrieves the single latest stored price record (from latest_bhav table) for a given stock symbol or multiple comma-separated symbols.",
                "operationId": "getLatestBhav_1",
                "parameters": [
                    {
                        "name": "symbol",
                        "in": "path",
                        "description": "Stock symbol or comma-separated symbols (e.g. RELIANCE or THYROCARE,RELIANCE)",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    }
                ],
                "responses": {
                    "404": {
                        "description": "Latest bhav data not found for symbol",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "type": "object"
                                }
                            }
                        }
                    },
                    "200": {
                        "description": "Successfully retrieved latest bhav data",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "type": "object"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/bhav/{symbol}/historic": {
            "get": {
                "tags": [
                    "Stock Bhav Data"
                ],
                "summary": "Get historic bhav data of a symbol",
                "description": "Retrieves all saved daily price records for a given stock symbol, optionally filtered by a date range.",
                "operationId": "getHistoricBhav",
                "parameters": [
                    {
                        "name": "symbol",
                        "in": "path",
                        "description": "Stock symbol (e.g. RELIANCE)",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "name": "startDate",
                        "in": "query",
                        "description": "Start date (yyyy-MM-dd)",
                        "required": false,
                        "schema": {
                            "type": "string",
                            "format": "date"
                        }
                    },
                    {
                        "name": "endDate",
                        "in": "query",
                        "description": "End date (yyyy-MM-dd)",
                        "required": false,
                        "schema": {
                            "type": "string",
                            "format": "date"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Successfully retrieved historic bhav data",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "$ref": "#/components/schemas/DailyBhav"
                                    }
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Invalid date range parameters or symbol name",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "$ref": "#/components/schemas/DailyBhav"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/alerts": {
            "get": {
                "tags": [
                    "Volume Alerts"
                ],
                "summary": "Get all volume alerts",
                "description": "Retrieves all volume alerts generated in the system.",
                "operationId": "getAllAlerts",
                "responses": {
                    "200": {
                        "description": "OK",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "$ref": "#/components/schemas/VolumeAlert"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/alerts/symbol/{symbolId}": {
            "get": {
                "tags": [
                    "Volume Alerts"
                ],
                "summary": "Get alerts by symbol ID",
                "description": "Retrieves volume alerts generated for a specific stock symbol ID.",
                "operationId": "getAlertsBySymbolId",
                "parameters": [
                    {
                        "name": "symbolId",
                        "in": "path",
                        "required": true,
                        "schema": {
                            "type": "integer",
                            "format": "int64"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "$ref": "#/components/schemas/VolumeAlert"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/alerts/search": {
            "get": {
                "tags": [
                    "Volume Alerts"
                ],
                "summary": "Search and filter volume alerts",
                "description": "Retrieves a paginated list of volume alerts filtered by symbol, category, subcategory, date range, and minimum multiplier, with custom sorting.",
                "operationId": "searchAlerts",
                "parameters": [
                    {
                        "name": "symbol",
                        "in": "query",
                        "description": "Stock symbol (e.g. RELIANCE)",
                        "required": false,
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "name": "category",
                        "in": "query",
                        "description": "Category name (e.g. TECHNOLOGY)",
                        "required": false,
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "name": "subcategory",
                        "in": "query",
                        "description": "Subcategory name (e.g. OIL REFINERY)",
                        "required": false,
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "name": "startDate",
                        "in": "query",
                        "description": "Start date (yyyy-MM-dd)",
                        "required": false,
                        "schema": {
                            "type": "string",
                            "format": "date"
                        }
                    },
                    {
                        "name": "endDate",
                        "in": "query",
                        "description": "End date (yyyy-MM-dd)",
                        "required": false,
                        "schema": {
                            "type": "string",
                            "format": "date"
                        }
                    },
                    {
                        "name": "minMultiplier",
                        "in": "query",
                        "description": "Minimum multiplier (e.g. 1.5)",
                        "required": false,
                        "schema": {
                            "type": "number",
                            "format": "double"
                        }
                    },
                    {
                        "name": "page",
                        "in": "query",
                        "description": "Zero-based page index",
                        "required": false,
                        "schema": {
                            "type": "integer",
                            "format": "int32",
                            "default": 0
                        }
                    },
                    {
                        "name": "size",
                        "in": "query",
                        "description": "Page size",
                        "required": false,
                        "schema": {
                            "type": "integer",
                            "format": "int32",
                            "default": 10
                        }
                    },
                    {
                        "name": "sortBy",
                        "in": "query",
                        "description": "Property to sort by",
                        "required": false,
                        "schema": {
                            "type": "string",
                            "default": "alertDate"
                        }
                    },
                    {
                        "name": "sortDir",
                        "in": "query",
                        "description": "Sort direction (asc or desc)",
                        "required": false,
                        "schema": {
                            "type": "string",
                            "default": "desc"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Successfully retrieved filtered volume alerts",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "$ref": "#/components/schemas/PageVolumeAlert"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/alerts/daily-summary": {
            "get": {
                "tags": [
                    "Volume Alerts"
                ],
                "summary": "Get total alerts generated daily grouped by category",
                "description": "Retrieves a summary of volume alerts count grouped by date and category.",
                "operationId": "getDailyAlertsSummary",
                "responses": {
                    "200": {
                        "description": "OK",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "$ref": "#/components/schemas/VolumeAlertDailySummaryCategory"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/alerts/daily-subcategory-summary": {
            "get": {
                "tags": [
                    "Volume Alerts"
                ],
                "summary": "Get total alerts generated daily grouped by subcategory",
                "description": "Retrieves a summary of volume alerts count grouped by date and subcategory.",
                "operationId": "getDailyAlertsSubcategorySummary",
                "responses": {
                    "200": {
                        "description": "OK",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "$ref": "#/components/schemas/VolumeAlertDailySummarySubcategory"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/alerts/daily-stacked-summary": {
            "get": {
                "tags": [
                    "Volume Alerts"
                ],
                "summary": "Get daily alert counts in a format optimized for stacked bar charts",
                "description": "Returns a list of day-wise records, where each day contains counts for each category (e.g. {date: '2026-06-22', ENERGY: 5, FINANCE: 2})",
                "operationId": "getDailyStackedSummary",
                "responses": {
                    "200": {
                        "description": "OK",
                        "content": {
                            "*/*": {
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "additionalProperties": {
                                            "type": "object"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    "components": {
        "schemas": {
            "TagBoardRequest": {
                "required": [
                    "name"
                ],
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string"
                    },
                    "symbols": {
                        "uniqueItems": true,
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
                }
            },
            "StockSymbolResponse": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "integer",
                        "format": "int64"
                    },
                    "symbol": {
                        "type": "string"
                    },
                    "category": {
                        "type": "string"
                    },
                    "subcategory": {
                        "type": "string"
                    }
                }
            },
            "TagBoardResponse": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "integer",
                        "format": "int64"
                    },
                    "name": {
                        "type": "string"
                    },
                    "symbols": {
                        "uniqueItems": true,
                        "type": "array",
                        "items": {
                            "$ref": "#/components/schemas/StockSymbolResponse"
                        }
                    }
                }
            },
            "StockSymbolRequest": {
                "required": [
                    "category",
                    "subcategory",
                    "symbol"
                ],
                "type": "object",
                "properties": {
                    "symbol": {
                        "type": "string"
                    },
                    "category": {
                        "type": "string"
                    },
                    "subcategory": {
                        "type": "string"
                    }
                }
            },
            "SubcategoryRequest": {
                "required": [
                    "categoryId",
                    "name"
                ],
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string"
                    },
                    "categoryId": {
                        "type": "integer",
                        "format": "int64"
                    }
                }
            },
            "SubcategoryResponse": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "integer",
                        "format": "int64"
                    },
                    "name": {
                        "type": "string"
                    },
                    "categoryId": {
                        "type": "integer",
                        "format": "int64"
                    },
                    "categoryName": {
                        "type": "string"
                    }
                }
            },
            "MarketHolidayRequest": {
                "required": [
                    "date",
                    "holidayName"
                ],
                "type": "object",
                "properties": {
                    "date": {
                        "type": "string",
                        "format": "date"
                    },
                    "holidayName": {
                        "type": "string"
                    }
                }
            },
            "MarketHolidayResponse": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "integer",
                        "format": "int64"
                    },
                    "date": {
                        "type": "string",
                        "format": "date"
                    },
                    "holidayName": {
                        "type": "string"
                    }
                }
            },
            "CategoryRequest": {
                "required": [
                    "name"
                ],
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string"
                    }
                }
            },
            "CategoryResponse": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "integer",
                        "format": "int64"
                    },
                    "name": {
                        "type": "string"
                    }
                }
            },
            "Category": {
                "required": [
                    "name"
                ],
                "type": "object",
                "properties": {
                    "id": {
                        "type": "integer",
                        "format": "int64"
                    },
                    "name": {
                        "type": "string"
                    }
                }
            },
            "DailyBhav": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "integer",
                        "format": "int64"
                    },
                    "stockSymbol": {
                        "$ref": "#/components/schemas/StockSymbol"
                    },
                    "series": {
                        "type": "string"
                    },
                    "tradeDate": {
                        "type": "string",
                        "format": "date"
                    },
                    "previousClsPrice": {
                        "type": "number",
                        "format": "double"
                    },
                    "openingPrice": {
                        "type": "number",
                        "format": "double"
                    },
                    "tradeHighPrice": {
                        "type": "number",
                        "format": "double"
                    },
                    "tradeLowPrice": {
                        "type": "number",
                        "format": "double"
                    },
                    "lastTradedPrice": {
                        "type": "number",
                        "format": "double"
                    },
                    "closingPrice": {
                        "type": "number",
                        "format": "double"
                    },
                    "vwap": {
                        "type": "number",
                        "format": "double"
                    },
                    "totTradedQty": {
                        "type": "integer",
                        "format": "int64"
                    },
                    "totTradedVal": {
                        "type": "number",
                        "format": "double"
                    },
                    "totalTrades": {
                        "type": "integer",
                        "format": "int64"
                    },
                    "timestamp": {
                        "type": "string",
                        "format": "date-time"
                    },
                    "copDelivQty": {
                        "type": "integer",
                        "format": "int64"
                    },
                    "copDelivPerc": {
                        "type": "number",
                        "format": "double"
                    },
                    "symbol": {
                        "type": "string"
                    },
                    "symbol_id": {
                        "type": "integer",
                        "format": "int64"
                    }
                }
            },
            "StockSymbol": {
                "required": [
                    "subcategory",
                    "symbol"
                ],
                "type": "object",
                "properties": {
                    "id": {
                        "type": "integer",
                        "format": "int64"
                    },
                    "symbol": {
                        "type": "string"
                    },
                    "subcategory": {
                        "$ref": "#/components/schemas/Subcategory"
                    }
                }
            },
            "Subcategory": {
                "required": [
                    "category",
                    "name"
                ],
                "type": "object",
                "properties": {
                    "id": {
                        "type": "integer",
                        "format": "int64"
                    },
                    "name": {
                        "type": "string"
                    },
                    "category": {
                        "$ref": "#/components/schemas/Category"
                    }
                }
            },
            "PageDailyBhav": {
                "type": "object",
                "properties": {
                    "totalPages": {
                        "type": "integer",
                        "format": "int32"
                    },
                    "totalElements": {
                        "type": "integer",
                        "format": "int64"
                    },
                    "first": {
                        "type": "boolean"
                    },
                    "last": {
                        "type": "boolean"
                    },
                    "size": {
                        "type": "integer",
                        "format": "int32"
                    },
                    "content": {
                        "type": "array",
                        "items": {
                            "$ref": "#/components/schemas/DailyBhav"
                        }
                    },
                    "number": {
                        "type": "integer",
                        "format": "int32"
                    },
                    "sort": {
                        "type": "array",
                        "items": {
                            "$ref": "#/components/schemas/SortObject"
                        }
                    },
                    "numberOfElements": {
                        "type": "integer",
                        "format": "int32"
                    },
                    "pageable": {
                        "$ref": "#/components/schemas/PageableObject"
                    },
                    "empty": {
                        "type": "boolean"
                    }
                }
            },
            "PageableObject": {
                "type": "object",
                "properties": {
                    "offset": {
                        "type": "integer",
                        "format": "int64"
                    },
                    "sort": {
                        "type": "array",
                        "items": {
                            "$ref": "#/components/schemas/SortObject"
                        }
                    },
                    "pageNumber": {
                        "type": "integer",
                        "format": "int32"
                    },
                    "pageSize": {
                        "type": "integer",
                        "format": "int32"
                    },
                    "paged": {
                        "type": "boolean"
                    },
                    "unpaged": {
                        "type": "boolean"
                    }
                }
            },
            "SortObject": {
                "type": "object",
                "properties": {
                    "direction": {
                        "type": "string"
                    },
                    "nullHandling": {
                        "type": "string"
                    },
                    "ascending": {
                        "type": "boolean"
                    },
                    "property": {
                        "type": "string"
                    },
                    "ignoreCase": {
                        "type": "boolean"
                    }
                }
            },
            "VolumeAlert": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "integer",
                        "format": "int64"
                    },
                    "stockSymbol": {
                        "$ref": "#/components/schemas/StockSymbol"
                    },
                    "alertDate": {
                        "type": "string",
                        "format": "date"
                    },
                    "latestVolume": {
                        "type": "integer",
                        "format": "int64"
                    },
                    "averageVolume": {
                        "type": "number",
                        "format": "double"
                    },
                    "multiplier": {
                        "type": "number",
                        "format": "double"
                    },
                    "thresholdUsed": {
                        "type": "number",
                        "format": "double"
                    },
                    "percentageChange": {
                        "type": "number",
                        "format": "double"
                    },
                    "tradedQty": {
                        "type": "integer",
                        "format": "int64"
                    },
                    "deliveryQty": {
                        "type": "integer",
                        "format": "int64"
                    },
                    "deliveryPercentage": {
                        "type": "number",
                        "format": "double"
                    }
                }
            },
            "PageVolumeAlert": {
                "type": "object",
                "properties": {
                    "totalPages": {
                        "type": "integer",
                        "format": "int32"
                    },
                    "totalElements": {
                        "type": "integer",
                        "format": "int64"
                    },
                    "first": {
                        "type": "boolean"
                    },
                    "last": {
                        "type": "boolean"
                    },
                    "size": {
                        "type": "integer",
                        "format": "int32"
                    },
                    "content": {
                        "type": "array",
                        "items": {
                            "$ref": "#/components/schemas/VolumeAlert"
                        }
                    },
                    "number": {
                        "type": "integer",
                        "format": "int32"
                    },
                    "sort": {
                        "type": "array",
                        "items": {
                            "$ref": "#/components/schemas/SortObject"
                        }
                    },
                    "numberOfElements": {
                        "type": "integer",
                        "format": "int32"
                    },
                    "pageable": {
                        "$ref": "#/components/schemas/PageableObject"
                    },
                    "empty": {
                        "type": "boolean"
                    }
                }
            },
            "VolumeAlertDailySummaryCategory": {
                "type": "object",
                "properties": {
                    "alertDate": {
                        "type": "string",
                        "format": "date"
                    },
                    "categoryName": {
                        "type": "string"
                    },
                    "alertCount": {
                        "type": "integer",
                        "format": "int64"
                    }
                }
            },
            "VolumeAlertDailySummarySubcategory": {
                "type": "object",
                "properties": {
                    "alertDate": {
                        "type": "string",
                        "format": "date"
                    },
                    "subcategoryName": {
                        "type": "string"
                    },
                    "alertCount": {
                        "type": "integer",
                        "format": "int64"
                    }
                }
            }
        }
    }
}