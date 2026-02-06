# Test Failure Diagnosis Patterns

## Diagnosis Workflow

```
Test Failed
    │
    ▼
┌─────────────────┐
│ 1. Reproduce    │ ← MCP: navigate + interact
└────────┬────────┘
         │
    ▼
┌─────────────────┐
│ 2. Check Console│ ← MCP: list_console_messages
└────────┬────────┘
         │
    ▼
┌─────────────────┐
│ 3. Check Network│ ← MCP: list_network_requests
└────────┬────────┘
         │
    ▼
┌─────────────────┐
│ 4. Screenshot   │ ← MCP: take_screenshot
└────────┬────────┘
         │
    ▼
┌─────────────────┐
│ 5. Root Cause   │ ← AI analysis
└─────────────────┘
```

## Common Failure Patterns

### Pattern 1: Element Not Found

**Symptom:**
```
Error: locator.click: Target closed
Locator: locator('.old-selector')
```

**Diagnosis:**
```javascript
// Get current DOM structure
mcp_io_github_chr_take_snapshot({ verbose: true })

// Search for similar elements
mcp_io_github_chr_evaluate_script({
  function: `() => {
    return Array.from(document.querySelectorAll('button'))
      .map(b => ({ text: b.innerText, class: b.className }));
  }`
})
```

**Common Causes:**
- Selector changed (class renamed)
- Element moved to different position
- Conditional rendering (element not visible)

**Fix:**
- Update selector in Page Object
- Add wait condition before interaction
- Use more stable selector (data-testid)

---

### Pattern 2: Timeout Waiting for Element

**Symptom:**
```
Error: Timeout 30000ms exceeded
waiting for locator('.loading-complete')
```

**Diagnosis:**
```javascript
// Check network for slow/failed requests
mcp_io_github_chr_list_network_requests({ resourceTypes: ["xhr", "fetch"] })

// Check for JS errors blocking render
mcp_io_github_chr_list_console_messages({ types: ["error"] })
```

**Common Causes:**
- API response slow
- API returned error
- JavaScript error prevented render
- Wrong wait condition

**Fix:**
- Increase timeout for slow operations
- Mock slow APIs in tests
- Fix backend/API issues
- Update wait condition

---

### Pattern 3: Wrong Value/Text

**Symptom:**
```
Error: expect(locator).toContainText('¥100.00')
Received: '¥0.00'
```

**Diagnosis:**
```javascript
// Check what value is actually displayed
mcp_io_github_chr_evaluate_script({
  function: `() => document.querySelector('.price').innerText`
})

// Check if calculation API failed
mcp_io_github_chr_list_network_requests({ resourceTypes: ["fetch"] })
```

**Common Causes:**
- Calculation logic error
- Data not loaded yet
- API returned wrong data
- Currency/locale formatting

**Fix:**
- Add wait for data load
- Fix backend calculation
- Update expected value format

---

### Pattern 4: API Error (500/400)

**Symptom:**
```
Console: POST /api/checkout - 500 Internal Server Error
```

**Diagnosis:**
```javascript
// Get detailed request/response
mcp_io_github_chr_get_network_request({ reqid: 15 })

// Check request payload
mcp_io_github_chr_list_console_messages({ types: ["error"] })
```

**Common Causes:**
- Database connection failed
- Missing required field
- Authentication expired
- Server bug

**Fix CI:**
```yaml
# Add database service
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_DB: testdb
```

**Fix with Mock:**
```typescript
await page.route('/api/checkout', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ success: true })
  });
});
```

---

### Pattern 5: Visual Regression

**Symptom:**
```
Screenshot comparison failed
Diff: 15% pixels different
```

**Diagnosis:**
```javascript
// Take current screenshot
mcp_io_github_chr_take_screenshot({ fullPage: true })

// Check for CSS loading issues
mcp_io_github_chr_list_network_requests({ resourceTypes: ["stylesheet"] })
```

**Common Causes:**
- CSS changed intentionally
- CSS failed to load
- Font rendering difference
- Animation timing

**Fix:**
- Update baseline screenshots
- Add CSS load wait
- Disable animations in tests

---

## MCP Diagnosis Commands

### Quick Console Check
```javascript
mcp_io_github_chr_list_console_messages({ 
  types: ["error", "warn"] 
})
```

### Quick Network Check
```javascript
// List all API calls
mcp_io_github_chr_list_network_requests({ 
  resourceTypes: ["xhr", "fetch"] 
})

// Get specific request details
mcp_io_github_chr_get_network_request({ reqid: 15 })
```

### State Inspection
```javascript
mcp_io_github_chr_evaluate_script({
  function: `() => ({
    url: location.href,
    localStorage: {...localStorage},
    cookies: document.cookie
  })`
})
```

### Full Page Capture
```javascript
mcp_io_github_chr_take_screenshot({ fullPage: true })
mcp_io_github_chr_take_snapshot({ verbose: true })
```

## Diagnosis Report Template

```markdown
## Test Failure Report

**Test:** {test_name}
**Error:** {error_message}

### Root Cause Analysis

| Level | Finding |
|-------|---------|
| Direct | {what_failed} |
| Root | {why_it_failed} |
| Evidence | {supporting_data} |

### Fix Recommendation

**Option 1:** {fix_description}
```code
{fix_code}
```

**Option 2:** {alternative}

### Verification Steps
1. {step_1}
2. {step_2}
3. {step_3}
```
