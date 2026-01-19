# Quick Reference Guide

## Getting Started

### 1. Backend Setup
```bash
cd eventify-server
npm install
cp .env.example .env  # Configure as needed
npm run dev
# Server running at http://localhost:4000/graphql
```

### 2. Frontend Setup
```bash
cd eventify-client
npm install
cp .env.example .env.local  # Configure as needed
npm run dev
# App running at http://localhost:3000
```

---

## API Endpoints Summary

### Authentication
| Operation | Type | Status |
|-----------|------|--------|
| Register | Mutation | ✅ Integrated |
| Login | Mutation | ✅ Integrated |
| Verify OTP | Mutation | ✅ Integrated |
| Forgot Password | Mutation | ✅ Integrated |
| Reset Password | Mutation | ✅ Integrated |
| Resend OTP | Mutation | ✅ Integrated |
| Get Me | Query | ✅ Integrated |

### Events
| Operation | Type | Status |
|-----------|------|--------|
| Create Event | Mutation | ✅ Integrated |
| Update Event | Mutation | ✅ Integrated |
| Delete Event | Mutation | ✅ Integrated |
| Get My Events | Query | ✅ Integrated |
| Get Invited Events | Query | ✅ Integrated |
| Get Single Event | Query | ✅ Integrated |
| Invite Participants | Mutation | ✅ Integrated |
| Remove Participant | Mutation | ✅ Integrated |

---

## Key Files Modified

### Backend
```
src/configs/cors.ts (NEW)
src/server.ts (UPDATED)
```

### Frontend
```
src/contexts/AuthContext.tsx (UPDATED)
src/hooks/api/useAuth.ts (NEW)
src/hooks/api/useEvents.ts (NEW)
src/pages/Login.tsx (UPDATED)
src/pages/Register.tsx (UPDATED)
src/pages/Dashboard.tsx (UPDATED)
src/pages/Events.tsx (UPDATED)
src/pages/CreateEvent.tsx (UPDATED)
.env.example (NEW)
```

### Documentation
```
API_TESTING_GUIDE.md (NEW)
APPLICATION_IMPROVEMENTS.md (NEW)
INTEGRATION_SUMMARY.md (NEW)
QUICK_REFERENCE.md (THIS FILE)
```

---

## Code Examples

### Using Auth Hooks
```typescript
import { useLogin } from '@/hooks/api/useAuth';

const { login, loading, error } = useLogin();

const onSubmit = async (email, password) => {
  const result = await login({ email, password });
  if (result.success) {
    const { token, user } = result.data;
    // Handle successful login
  } else {
    console.error(result.error);
  }
};
```

### Using Event Hooks
```typescript
import { useGetMyEvents, useCreateEvent } from '@/hooks/api/useEvents';

// Fetch events
const { events, loading, error } = useGetMyEvents();

// Create event
const { createEvent, loading: creating } = useCreateEvent();
const result = await createEvent({
  title: "Team Meeting",
  startDate: "2025-01-20T10:00:00Z",
  endDate: "2025-01-20T11:00:00Z",
  emails: ["user@example.com"]
});
```

### Handling Errors
```typescript
import { getErrorMessage } from '@/hooks/api/useEvents';

const { events, error } = useGetMyEvents();

if (error) {
  const message = getErrorMessage(error);
  console.error(message);
}
```

---

## CORS Configuration

**Location**: `src/configs/cors.ts`

**Development**:
- Allows: `localhost:3000`, `127.0.0.1:3000`
- Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Credentials: Enabled

**Production**:
- Allows: Configured via `PRODUCTION_CLIENT_URL` env var
- Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Credentials: Enabled

To update CORS:
1. Modify `src/configs/cors.ts`
2. Update `allowedOrigins` array for dev
3. Update env vars for production
4. Restart server

---

## Testing Checklist

### Quick Manual Test
- [ ] Register new account
- [ ] Verify OTP (check server logs)
- [ ] Login
- [ ] Create event
- [ ] Add participants
- [ ] View events list
- [ ] Delete event
- [ ] Logout

### API Testing
- [ ] Use `API_TESTING_GUIDE.md` for detailed test cases
- [ ] Test all auth endpoints
- [ ] Test all event endpoints
- [ ] Test error scenarios
- [ ] Test edge cases

### Browser Console
- [ ] Check for JavaScript errors
- [ ] Check for GraphQL errors
- [ ] Verify API calls in Network tab
- [ ] Check for CORS errors

---

## Common Issues & Solutions

### CORS Error
**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
1. Verify backend is running on `http://localhost:4000`
2. Check `VITE_GRAPHQL_ENDPOINT` in `.env.local`
3. Verify CORS configuration in `src/configs/cors.ts`
4. Check browser console for exact error message

### API Not Found
**Error**: `404 graphql endpoint not found`

**Solution**:
1. Verify backend running: `http://localhost:4000/graphql`
2. Check backend has Apollo Server configured
3. Verify GraphQL schema is built
4. Check backend logs for errors

### Authentication Failing
**Error**: `Unauthorized - invalid token`

**Solution**:
1. Check token is being saved: `localStorage.getItem('eventify_token')`
2. Verify JWT_SECRET matches on backend
3. Check token expiration time
4. Try registering new account and verifying OTP

### Empty Events List
**Issue**: Dashboard shows no events

**Solution**:
1. Create event via `/events/create`
2. Check browser Network tab for API calls
3. Verify response data structure
4. Check GraphQL query in `src/lib/graphql/queries.ts`

---

## Performance Tips

1. **Check Network Tab**
   - Open DevTools > Network
   - Look for slow API calls
   - Check response sizes

2. **Monitor Memory**
   - Open DevTools > Memory
   - Take heap snapshots
   - Look for memory leaks

3. **Profile Performance**
   - Open DevTools > Performance
   - Record user interactions
   - Analyze timing breakdown

4. **GraphQL Caching**
   - Apollo Client automatically caches queries
   - Check DevTools > Network for cached responses
   - Monitor cache hits vs. misses

---

## Environment Variables

### Frontend (.env.local)
```env
# Required
VITE_GRAPHQL_ENDPOINT=http://localhost:4000/graphql

# Optional
VITE_API_BASE_URL=http://localhost:4000
VITE_ENVIRONMENT=development
```

### Backend (.env)
```env
# Required
PORT=4000
NODE_ENV=development
JWT_SECRET=your_secret_here

# Database (adjust as needed)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eventify
DB_USER=postgres
DB_PASSWORD=password

# Email (for OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

---

## Useful Commands

### Frontend
```bash
# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint

# Type check
npm run type-check
```

### Backend
```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Database migrations (if applicable)
npm run migrate
```

---

## Debugging Tips

### Debug GraphQL Queries
```typescript
// In browser console
import { apolloClient } from '@/lib/graphql/client';

// Check cache
apolloClient.cache.extract();

// Check recent queries
apolloClient.watchQuery({ query: GET_MY_EVENTS }).subscribe(
  result => console.log('Query result:', result)
);
```

### Debug Auth Token
```typescript
// In browser console
localStorage.getItem('eventify_token')
localStorage.removeItem('eventify_token')  // Clear token
```

### Debug Apollo Cache
```typescript
// In browser console
import { apolloClient } from '@/lib/graphql/client';
console.log(apolloClient.cache.extract());
```

---

## Resources

### Documentation Files
- `API_TESTING_GUIDE.md` - Comprehensive test scenarios
- `APPLICATION_IMPROVEMENTS.md` - Enhancement recommendations
- `INTEGRATION_SUMMARY.md` - Full integration details

### Apollo Documentation
- [Apollo Client Docs](https://www.apollographql.com/docs/react/)
- [GraphQL Basics](https://graphql.org/)
- [Apollo Error Handling](https://www.apollographql.com/docs/react/data/error-handling/)

### React Hooks
- [React Hooks Documentation](https://react.dev/reference/react)
- [React Context API](https://react.dev/reference/react/useContext)

### Testing Tools
- Apollo Studio: `http://localhost:4000/graphql`
- React DevTools: Browser extension
- Apollo DevTools: Browser extension

---

## Support

For detailed information:
1. Check `API_TESTING_GUIDE.md` for API documentation
2. Check `APPLICATION_IMPROVEMENTS.md` for architecture details
3. Review code comments in hook files
4. Check backend API documentation
5. Review GraphQL schema at Apollo Studio

---

**Last Updated**: January 14, 2026  
**Version**: 1.0.0
