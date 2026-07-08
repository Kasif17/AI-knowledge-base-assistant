# Architecture

## Authentication Flow

1. User registers.
2. Password is hashed using bcrypt.
3. User logs in.
4. Server generates Access Token and Refresh Token.
5. Access Token protects secured APIs.
6. Refresh Token generates new Access Tokens when expired.

---

## Database Design

### User

* name
* email
* password
* refreshToken

### Document

* title
* originalFileName
* filePath
* textContent
* uploadedBy
* pageCount
* createdAt

---

## Folder Structure

```text
server/
│
├── config/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── services/
├── uploads/
├── utils/
```

---

## Request Flow

```text
Client

↓

Express Routes

↓

Authentication Middleware

↓

Controller

↓

Service Layer

↓

MongoDB / Gemini API

↓

Response
```

---

## AI Flow

```text
User Question

↓

Search Relevant Document

↓

Extract Context

↓

Generate Prompt

↓

Gemini API

↓

AI Response
```

---

## Scalability

* Modular architecture
* Service layer separation
* JWT authentication
* Environment-based configuration
* Ready for Redis caching
* Easily deployable using Docker and cloud platforms
