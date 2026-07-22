# Eventify — Full-Stack Event Management Platform — Interview Questions

**Stack**: Node.js, Express.js, TypeScript, React, PostgreSQL, GraphQL (Apollo), Sequelize ORM, Tailwind CSS, shadcn/ui, JWT, Nodemailer, Framer Motion

---

## Backend Tech Lead Lens

### Technical
1. You used GraphQL (Apollo Server 5 on Express 5) for the API layer. Walk me through your schema design — what were your core types and how did you handle N+1 queries? Did you use DataLoader?
2. You implemented rate limiting and CORS security. How did you differentiate rate limit states (per-IP, per-user, per-query complexity)? Did you use a library like express-rate-limit or a custom middleware?
3. Sequelize ORM with PostgreSQL — what was your migration strategy? Did you use Sequelize migrations or raw SQL? How did you handle schema changes in development vs production?
4. You used SHA-256 OTP with email verification. Why SHA-256 specifically? How did you store OTPs? What was the expiry strategy? How did you prevent OTP brute-forcing?

### System Design
5. Design the invitation system at scale — sending to 10k guests for a single event. What changes to your current architecture (in-request Nodemailer) would be needed? Where does BullMQ or a queue fit?
6. Your schema has events, users, invites. Design the query that returns "all events a user is invited to (past and future), sorted by date, with RSVP status." How would you optimize this for a user with 10k invites?

### Behavioral
7. You picked GraphQL over REST for this project. What was the specific query flexibility or over-fetching problem that drove that decision? Can you give me an example of a query that would have been painful with REST?

---

## Full Stack Engineer Lens

### Technical
8. Walk me through the authentication flow end-to-end: register → verify OTP → login → JWT issuance → protected GraphQL query. Where does each piece happen (frontend vs backend) and where could it break?
9. You wrote Jest tests for auth flows and REST API endpoints. How did you mock the database and external services? What was your coverage threshold and what's the one thing you didn't test but should have?

### Frontend
10. You used shadcn/ui with Tailwind CSS. Did you customize any component tokens (colors, spacing) or build custom components beyond what shadcn provides? How did you ensure visual consistency across all pages?
11. How did you manage form state for event creation (multi-field, date pickers, participant selection)? Did you use React Hook Form, Formik, or raw state? How did you handle validation on frontend vs backend?

### Behavioral
12. This is your most balanced full-stack project. If you had to add one feature that meaningfully stretches your skills, what would it be and why?

---

## Product Manager Lens

### Product
13. What's the one metric that tells you Eventify is delivering value? Number of events created? Invite acceptance rate? Repeat event creators? Walk me through the north star metric and why you chose it.
14. If a user reports "invites are slow" — how do you diagnose whether it's: (a) a backend query issue, (b) a GraphQL resolver issue, (c) a network issue, or (d) a frontend rendering issue?

---

## HR / Talent Acquisition Lens

### Behavioral
15. You built this alone. How did you prioritize what to build first when you had auth, events, invites, OTP, and the UI all competing for time? What did you cut and what did you ship first?
