# n8n Webhook Configuration Guide for Truxel

## Webhook Endpoint

**URL**: `https://n8n.byinfant.com/webhook/truxel-webhook`
**Method**: POST
**Content-Type**: application/json

## Expected Request Payload

```json
{
  "search_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "keywords": "logistics warehouse distribution",
  "address": "Bucharest, Romania",
  "latitude": 44.4268,
  "longitude": 26.1025,
  "radius_km": 5
}
```

## n8n Workflow Steps

### 1. Webhook Trigger Node
- **Type**: Webhook
- **Path**: `/truxel-webhook`
- **Method**: POST
- **Response Mode**: Immediately respond

### 2. Extract Parameters
Extract from `$json`:
- `search_id`
- `user_id`
- `keywords`
- `latitude`
- `longitude`
- `radius_km`

### 3. Google Maps Search
Use Google Maps API or scraping to find companies:

**Search Query**: `{{ $json.keywords }} near {{ $json.latitude }},{{ $json.longitude }} within {{ $json.radius_km }}km`

For each company found, extract:
- Company name
- Contact person (if available)
- Email address
- Phone number
- WhatsApp number (often same as phone)
- LinkedIn profile URL
- Facebook page URL
- Instagram profile URL
- Website URL
- Industry/category
- Full address
- City
- Country
- Latitude
- Longitude
- Description

### 4. Insert Leads into Supabase

For each company found, insert into `leads` table:

```javascript
// Supabase Node Configuration
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY'; // Use service role key, not anon key

// For each company
{
  "user_id": "{{ $json.user_id }}",
  "source_search_id": "{{ $json.search_id }}",
  "company_name": "Extracted Company Name",
  "contact_person_name": "John Doe",
  "email": "contact@company.com",
  "phone": "+40123456789",
  "whatsapp": "+40123456789",
  "linkedin": "https://linkedin.com/company/example",
  "facebook": "https://facebook.com/example",
  "instagram": "https://instagram.com/example",
  "website": "https://company.com",
  "industry": "Logistics",
  "address": "Str. Example 123, Sector 1",
  "city": "Bucharest",
  "country": "Romania",
  "latitude": 44.4268,
  "longitude": 26.1025,
  "description": "Company description",
  "status": "new"
}
```

### 5. Count Results
Keep track of how many leads were inserted.

### 6. Update Search Status

Update the `searches` table:

```javascript
// Supabase Update Node
{
  "table": "searches",
  "operation": "update",
  "where": {
    "id": "{{ $json.search_id }}"
  },
  "data": {
    "status": "completed",
    "completed_at": "{{ new Date().toISOString() }}",
    "results_count": numberOfLeadsFound
  }
}
```

### 7. Error Handling

If search fails:

```javascript
{
  "table": "searches",
  "operation": "update",
  "where": {
    "id": "{{ $json.search_id }}"
  },
  "data": {
    "status": "failed",
    "error_message": "Error description here",
    "completed_at": "{{ new Date().toISOString() }}",
    "results_count": 0
  }
}
```

## Example n8n Workflow Structure

```
1. Webhook Trigger
   ↓
2. Extract & Validate Parameters
   ↓
3. Google Maps Places API Search
   ↓
4. Loop Through Results
   ↓
5. For Each Company:
   - Extract Details
   - Clean Phone Numbers
   - Format URLs
   ↓
6. Batch Insert into Supabase leads table
   ↓
7. Count Successful Inserts
   ↓
8. Update searches table with status "completed"
```

## Testing the Webhook

### Using curl:

```bash
curl -X POST https://n8n.byinfant.com/webhook/truxel-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "search_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "keywords": "logistics warehouse",
    "address": "Bucharest, Romania",
    "latitude": 44.4268,
    "longitude": 26.1025,
    "radius_km": 5
  }'
```

### Expected Response:

```json
{
  "success": true,
  "message": "Search initiated"
}
```

## Supabase Configuration in n8n

### Connection Details:
- **URL**: Your Supabase project URL
- **API Key**: Use SERVICE ROLE key (not anon key) for server-side operations
- **Headers**:
  ```
  Authorization: Bearer YOUR_SERVICE_ROLE_KEY
  apikey: YOUR_SERVICE_ROLE_KEY
  Content-Type: application/json
  ```

### Service Role Key Location:
1. Go to Supabase Dashboard
2. Project Settings > API
3. Copy "service_role" key (keep secret!)

## Data Quality Guidelines

### Phone Numbers:
- Format: International format with country code
- Example: +40123456789
- Remove spaces and special characters

### URLs:
- Always include https://
- Validate URLs before inserting
- Use null if not available

### Coordinates:
- Store as decimal degrees
- Example: 44.4268 (latitude), 26.1025 (longitude)
- Precision: 4-6 decimal places

### Industry/Category:
Use standardized categories:
- "Logistics"
- "Warehousing"
- "Distribution"
- "Transportation"
- "Freight"
- "Supply Chain"

## Performance Optimization

1. **Batch Inserts**: Insert multiple leads in a single request
2. **Caching**: Cache Google Maps results for 24 hours
3. **Rate Limiting**: Respect Google Maps API rate limits
4. **Parallel Processing**: Process multiple companies simultaneously
5. **Timeout**: Set 2-minute timeout for entire workflow

## Error Scenarios

### Handle these errors:

1. **Google Maps API Error**:
   - Update search status to "failed"
   - Set error_message: "Google Maps API error"

2. **No Results Found**:
   - Update search status to "completed"
   - Set results_count: 0
   - Don't mark as failed

3. **Supabase Insert Error**:
   - Log failed inserts
   - Continue with other leads
   - Update results_count with successful inserts only

4. **Invalid Coordinates**:
   - Update search status to "failed"
   - Set error_message: "Invalid coordinates"

## Monitoring & Logs

Track these metrics:
- Total searches processed
- Average search duration
- Success rate
- Average leads per search
- Failed searches with reasons
- API usage (Google Maps)

## Security Checklist

- [ ] Use HTTPS for webhook endpoint
- [ ] Validate incoming request payload
- [ ] Use Supabase service role key (not anon key)
- [ ] Store API keys as n8n credentials (not hardcoded)
- [ ] Implement rate limiting
- [ ] Log errors without exposing sensitive data
- [ ] Validate user_id exists in database before processing

## Sample Workflow JSON

See the n8n workflow export file for a complete example configuration.

## Support

If you encounter issues:
1. Check n8n execution logs
2. Verify Supabase credentials are correct
3. Test Google Maps API separately
4. Check search record exists in database
5. Verify RLS policies allow service role operations
