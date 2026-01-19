# API Testing and Validation Guide

## Overview

This guide outlines comprehensive testing strategies for all Eventify API endpoints, including error handling, edge cases, and integration tests.

## Prerequisites

- Backend server running on `http://localhost:4000/graphql`
- Frontend development server running on `http://localhost:3000`
- GraphQL client tools installed (Apollo Studio, Postman, or GraphQL Playground)

## API Endpoints and Testing Scenarios

### 1. Authentication APIs

#### 1.1 Register Mutation
```graphql
mutation RegisterUser($input: RegisterInput!) {
  register(input: $input) {
    message
    email
  }
}
```

**Test Cases:**
| Scenario | Input | Expected Result | Status |
|----------|-------|-----------------|--------|
| Valid registration | { email: "test@example.com", password: "SecurePass123!", firstName: "John", lastName: "Doe" } | Success message, email returned | ✓ To Test |
| Duplicate email | { email: "existing@example.com", ... } | Error: Email already registered | ✓ To Test |
| Invalid email format | { email: "invalid-email", ... } | Error: Invalid email format | ✓ To Test |
| Weak password | { email: "test@example.com", password: "123", ... } | Error: Password too weak | ✓ To Test |
| Missing required field | { email: "test@example.com" } | Error: firstName is required | ✓ To Test |
| Special characters in name | { ..., firstName: "Jean-Paul", lastName: "O'Brien" } | Success | ✓ To Test |

---

#### 1.2 Login Mutation
```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      id
      email
      name
    }
  }
}
```

**Test Cases:**
| Scenario | Input | Expected Result | Status |
|----------|-------|-----------------|--------|
| Valid credentials | { email: "test@example.com", password: "SecurePass123!" } | Token + user object | ✓ To Test |
| Wrong password | { email: "test@example.com", password: "wrong" } | Error: Invalid credentials | ✓ To Test |
| Non-existent email | { email: "nonexistent@example.com", password: "Any" } | Error: User not found | ✓ To Test |
| Empty email | { email: "", password: "password" } | Error: Email required | ✓ To Test |
| SQL injection attempt | { email: "' OR '1'='1", password: "anything" } | Error: Invalid email | ✓ To Test |
| Case sensitivity | { email: "Test@Example.com" (different case) } | Should work (email normalized) | ✓ To Test |

---

#### 1.3 Verify OTP Mutation
```graphql
mutation VerifyOTP($input: VerifyOTPInput!) {
  verifyOTP(input: $input) {
    token
    user {
      id
      email
      name
    }
  }
}
```

**Test Cases:**
| Scenario | Input | Expected Result | Status |
|----------|-------|-----------------|--------|
| Valid OTP | { email: "test@example.com", otp: "123456" } | Token + user object | ✓ To Test |
| Invalid OTP | { email: "test@example.com", otp: "000000" } | Error: Invalid OTP | ✓ To Test |
| Expired OTP | { email: "test@example.com", otp: "old_otp" } | Error: OTP expired | ✓ To Test |
| Wrong email | { email: "wrong@example.com", otp: "123456" } | Error: OTP not found | ✓ To Test |
| Multiple attempts | Send wrong OTP 5 times | Account locked after 5 attempts | ✓ To Test |

---

### 2. Event APIs

#### 2.1 Create Event Mutation
```graphql
mutation CreateEvent($input: CreateEventInput!) {
  createEvent(input: $input) {
    id
    title
    description
    startDate
    endDate
    participants {
      id
      email
    }
  }
}
```

**Test Cases:**
| Scenario | Input | Expected Result | Status |
|----------|-------|-----------------|--------|
| Valid event | { title: "Standup", description: "Daily sync", startDate: "2025-01-20T10:00:00Z", endDate: "2025-01-20T10:30:00Z" } | Event created with ID | ✓ To Test |
| No title | { title: "", description: "...", startDate, endDate } | Error: Title required | ✓ To Test |
| End date before start | { title: "...", startDate: "2025-01-20T10:30:00Z", endDate: "2025-01-20T10:00:00Z" } | Error: End date must be after start | ✓ To Test |
| Past date | { title: "...", startDate: "2020-01-01", endDate: "2020-01-01T01:00:00Z" } | Error or Warning: Date in past | ✓ To Test |
| With participants | { ..., emails: ["user1@example.com", "user2@example.com"] } | Event created, participants invited | ✓ To Test |
| Invalid email | { ..., emails: ["invalid-email"] } | Error: Invalid email format | ✓ To Test |
| Unauthenticated | No auth token | Error: Unauthorized | ✓ To Test |
| Very long title | { title: "A".repeat(1000), ... } | Error: Title too long (max 100 chars) | ✓ To Test |
| XSS attempt in description | { ..., description: "<script>alert('xss')</script>" } | Sanitized or Error | ✓ To Test |

---

#### 2.2 Get My Events Query
```graphql
query GetMyEvents {
  myEvents {
    id
    title
    description
    startDate
    endDate
    createdBy {
      id
      name
      email
    }
    participants {
      id
      email
      name
    }
  }
}
```

**Test Cases:**
| Scenario | Expected Result | Status |
|----------|-----------------|--------|
| Multiple events | Array of all user's created events | ✓ To Test |
| No events | Empty array | ✓ To Test |
| Pagination (100+ events) | First page results | ✓ To Test |
| With participants | Each event includes participant details | ✓ To Test |
| Unauthenticated | Error: Unauthorized | ✓ To Test |
| Sort order | Events sorted by creation date (newest first) | ✓ To Test |

---

#### 2.3 Get Invited Events Query
```graphql
query GetInvitedEvents {
  invitedEvents {
    id
    title
    createdBy {
      id
      name
      email
    }
    participants {
      id
      email
      name
    }
  }
}
```

**Test Cases:**
| Scenario | Expected Result | Status |
|----------|-----------------|--------|
| Multiple invitations | Array of events user is invited to | ✓ To Test |
| No invitations | Empty array | ✓ To Test |
| Exclude own events | Only events by others | ✓ To Test |
| Unauthenticated | Error: Unauthorized | ✓ To Test |

---

#### 2.4 Update Event Mutation
```graphql
mutation UpdateEvent($id: ID!, $input: UpdateEventInput!) {
  updateEvent(id: $id, input: $input) {
    id
    title
    description
    startDate
    endDate
  }
}
```

**Test Cases:**
| Scenario | Input | Expected Result | Status |
|----------|-------|-----------------|--------|
| Valid update | { title: "New title" } | Event updated | ✓ To Test |
| Update non-existent event | { id: "nonexistent" } | Error: Event not found | ✓ To Test |
| Update as non-creator | User1 tries to update User2's event | Error: Unauthorized | ✓ To Test |
| Invalid date range | { startDate: "2025-02-01", endDate: "2025-01-01" } | Error: Invalid date range | ✓ To Test |
| Partial update | Only title provided | Title updated, others unchanged | ✓ To Test |

---

#### 2.5 Delete Event Mutation
```graphql
mutation DeleteEvent($id: ID!) {
  deleteEvent(id: $id) {
    message
  }
}
```

**Test Cases:**
| Scenario | Input | Expected Result | Status |
|----------|-------|-----------------|--------|
| Delete own event | { id: "valid_event_id" } | Success: Event deleted | ✓ To Test |
| Delete non-existent event | { id: "nonexistent" } | Error: Event not found | ✓ To Test |
| Delete as non-creator | User1 tries to delete User2's event | Error: Unauthorized | ✓ To Test |
| Verify deletion | Query myEvents after delete | Event no longer in list | ✓ To Test |

---

#### 2.6 Invite Participants Mutation
```graphql
mutation InviteParticipants($eventId: ID!, $emails: [String!]!) {
  inviteParticipants(eventId: $eventId, emails: $emails) {
    id
    participants {
      id
      email
      name
    }
  }
}
```

**Test Cases:**
| Scenario | Input | Expected Result | Status |
|----------|-------|-----------------|--------|
| Invite single user | { eventId: "event1", emails: ["user@example.com"] } | User added to participants | ✓ To Test |
| Invite multiple users | { eventId: "event1", emails: ["user1@example.com", "user2@example.com"] } | All users added | ✓ To Test |
| Invite non-existent user | { eventId: "event1", emails: ["nonexistent@example.com"] } | Error or user created/invited | ✓ To Test |
| Duplicate invite | Invite same user twice | Error: Already invited | ✓ To Test |
| Invite as non-creator | User1 tries to invite to User2's event | Error: Unauthorized | ✓ To Test |
| Invalid email | { eventId: "event1", emails: ["invalid"] } | Error: Invalid email format | ✓ To Test |
| Self-invite | Invite own email | Error or Ignored | ✓ To Test |

---

#### 2.7 Remove Participant Mutation
```graphql
mutation RemoveParticipant($eventId: ID!, $userId: ID!) {
  removeParticipant(eventId: $eventId, userId: $userId) {
    id
    participants {
      id
      email
    }
  }
}
```

**Test Cases:**
| Scenario | Input | Expected Result | Status |
|----------|-------|-----------------|--------|
| Remove existing participant | { eventId: "event1", userId: "user123" } | Participant removed | ✓ To Test |
| Remove non-existent participant | { eventId: "event1", userId: "nonexistent" } | Error: Participant not found | ✓ To Test |
| Remove as non-creator | User1 tries to remove from User2's event | Error: Unauthorized | ✓ To Test |
| Verify removal | Query event after removal | User not in participants | ✓ To Test |

---

### 3. User APIs

#### 3.1 Get Me Query
```graphql
query GetMe {
  me {
    id
    email
    name
    createdAt
  }
}
```

**Test Cases:**
| Scenario | Expected Result | Status |
|----------|-----------------|--------|
| Authenticated user | Returns current user data | ✓ To Test |
| Unauthenticated | Error: Unauthorized | ✓ To Test |
| Invalid token | Error: Invalid token | ✓ To Test |
| Expired token | Error: Token expired | ✓ To Test |

---

## Error Handling Tests

### Network Errors
- **Scenario**: Backend unreachable
- **Expected**: Graceful error message in UI
- **Status**: ✓ To Test

### Rate Limiting
- **Scenario**: 100 requests in 1 minute
- **Expected**: 429 Too Many Requests after limit
- **Status**: ✓ To Test

### Timeout
- **Scenario**: API takes > 30 seconds
- **Expected**: Timeout error, retry option
- **Status**: ✓ To Test

---

## CORS Validation

- [x] Origins properly configured
- [x] Credentials allowed
- [x] Methods restricted to GET, POST, PUT, DELETE, PATCH
- [x] Headers properly exposed
- [ ] Test preflight requests
- [ ] Test cross-origin file uploads

---

## Performance Testing

| Endpoint | Expected Time | Status |
|----------|---------------|--------|
| Login | < 500ms | ✓ To Test |
| Create Event | < 500ms | ✓ To Test |
| Get My Events (10 items) | < 500ms | ✓ To Test |
| Get My Events (1000 items) | < 2s | ✓ To Test |
| Invite 50 participants | < 2s | ✓ To Test |

---

## Security Tests

- [ ] XSS Protection (sanitize user input)
- [ ] SQL Injection Prevention (parameterized queries)
- [ ] CSRF Protection (tokens validated)
- [ ] Authentication (JWT validation)
- [ ] Authorization (role-based access control)
- [ ] Rate limiting enabled
- [ ] HTTPS enforced (production)

---

## Integration Test Checklist

### User Journey: Create and Manage Event

1. [ ] Register new user
2. [ ] Verify OTP
3. [ ] Login with credentials
4. [ ] Create new event with title, description, dates
5. [ ] Get list of own events
6. [ ] Invite participants via email
7. [ ] Update event title
8. [ ] Remove participant
9. [ ] Delete event
10. [ ] Verify event deleted

### User Journey: Accept Invitation

1. [ ] User A creates event
2. [ ] User A invites User B (user@example.com)
3. [ ] User B registers with same email
4. [ ] User B logs in
5. [ ] User B sees invited event in "Invited Events"
6. [ ] User B views event details

---

## Test Execution Instructions

### Using Apollo Studio
1. Go to `http://localhost:4000/graphql` (Apollo Sandbox)
2. Copy test queries/mutations from above
3. Execute with test data
4. Verify response structure and error messages

### Using Postman
1. Create new POST request to `http://localhost:4000/graphql`
2. Set Content-Type: `application/json`
3. Send GraphQL query in body:
```json
{
  "query": "query { myEvents { id title } }"
}
```

### Using Frontend App
1. Open http://localhost:3000
2. Execute user journeys
3. Check console for errors
4. Verify UI displays real data

---

## Regression Testing

After each deployment:
- [ ] All login/register flows work
- [ ] All CRUD operations work for events
- [ ] Participant management works
- [ ] CORS validation passes
- [ ] Error messages display properly
- [ ] Performance benchmarks met

---

## Notes for Development Team

- All timestamps should be in ISO 8601 format
- User input must be sanitized before database insertion
- Passwords must be hashed with bcrypt (salt rounds: 10)
- JWT tokens should expire after 12 hours
- OTP codes should expire after 10 minutes
- Failed login attempts should lock account after 5 attempts
- Email validation must be case-insensitive
- Events should support up to 1000 participants
- Description field should support markdown
