# Quick Reference - New API Endpoints

## 🔐 Authentication

All endpoints require JWT authentication:

```text
Authorization: Bearer <your-jwt-token>
```

---

## 📝 Food Log Endpoints (Enhanced with Validation)

### Create Food Log

```http
POST /food-logs
Content-Type: application/json

{
  "foodName": "Chicken Breast",      // required, string
  "brand": "Organic",                 // optional, string
  "quantity": 150,                    // required, number >= 0
  "unit": "g",                        // required, string
  "mealType": "lunch",                // required, enum: breakfast/lunch/dinner/snack
  "calories": 165,                    // required, number >= 0
  "protein": 31,                      // required, number >= 0
  "carbs": 0,                         // required, number >= 0
  "fat": 3.6,                         // required, number >= 0
  "fiber": 0,                         // optional, number >= 0
  "sugar": 0,                         // optional, number >= 0
  "sodium": 74,                       // optional, number >= 0
  "date": "2025-10-09"                // optional, ISO date string
}
```

### Get Food Logs

```http
GET /food-logs?date=2025-10-09      // date is optional
```

### Update Food Log

```http
PUT /food-logs
Content-Type: application/json

{
  "id": "clx123abc",                  // required
  "quantity": 200,                    // optional
  "calories": 220,                    // optional
  "mealType": "dinner"                // optional
}
```

### Delete Food Log

```http
DELETE /food-logs?id=clx123abc
```

### Reorder Food Logs

```http
POST /food-logs/reorder
Content-Type: application/json

{
  "entryIds": ["id1", "id2", "id3"]
}
```

---

## 🔍 USDA Food Search Endpoints (NEW!)

### Search Foods

```http
GET /food-search?query=chicken&pageSize=10
```

**Response:**

```json
[
  {
    "id": 1234567,
    "name": "Chicken, broilers or fryers, breast, meat only, cooked, roasted",
    "brand": "USDA",
    "calories": 165,
    "protein": 31,
    "carbs": 0,
    "fat": 3.6,
    "fiber": 0,
    "sugar": 0,
    "sodium": 74,
    "servingSize": "100g"
  }
]
```

**Query Parameters:**

- `query` (required): Search term, min 2 characters
- `pageSize` (optional): Results per page, 1-50, default 10

### Get Food Details

```http
GET /food-search/1234567
```

**Response:** Same format as search results, single item

---

## ⚠️ Error Responses

### Validation Error (400)

```json
{
  "statusCode": 400,
  "message": [
    "quantity must be a positive number",
    "mealType must be one of: breakfast, lunch, dinner, snack"
  ],
  "error": "Bad Request"
}
```

### Unauthorized (401)

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Not Found (404)

```json
{
  "statusCode": 404,
  "message": "Food log not found",
  "error": "Not Found"
}
```

---

## 📊 What's New?

### ✅ Input Validation

- All food log endpoints validate input
- Clear error messages for invalid data
- Automatic type conversion
- Whitelist mode (strips unknown fields)

### ✅ USDA Integration

- Server-side API calls (secure)
- 1-hour intelligent caching
- Standardized nutrition data
- Protected API key

---

## 🧪 Test Commands

```bash
# Test food log creation (valid)
curl -X POST http://localhost:3001/food-logs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"foodName":"Apple","quantity":150,"unit":"g","mealType":"snack","calories":78,"protein":0.4,"carbs":21,"fat":0.3}'

# Test food search
curl -X GET "http://localhost:3001/food-search?query=apple&pageSize=5" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test validation (should fail)
curl -X POST http://localhost:3001/food-logs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"foodName":"","quantity":-5}'
```

---

## 🔧 Environment Variables

Backend `.env` file needs:

```bash
USDA_API_KEY=your-usda-api-key-here
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret
PORT=3001
```

---

## 📚 Full Documentation

See `quantro-backend/API_IMPROVEMENTS.md` for complete documentation.
