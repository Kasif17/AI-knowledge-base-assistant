# Debug Notes

## 1. Multer "Field name missing"

**Cause**

The multipart form-data key in Postman did not match the field configured in `upload.single("file")`.

**Fix**

Updated the Postman request to use the correct field name: `file`.

---

## 2. Gemini API Request Failure

**Cause**

Initial requests failed due to an invalid API key and incorrect request payload.

**Fix**

Generated a valid Gemini API key, verified environment variables, and corrected the prompt structure before retrying.

---

## 3. PDF Parsing Failure

**Cause**

A scanned PDF contained images instead of selectable text, so `pdf-parse` could not extract content.

**Fix**

Tested with a text-based PDF and added validation to handle unreadable or empty PDFs gracefully.

---

## 4. JWT Authentication Error

**Cause**

Protected endpoints returned **"Access token is missing"** because the Authorization header was not included.

**Fix**

Sent the JWT as a Bearer Token in Postman and verified middleware token extraction.

---

## 5. Document Search Issue

**Cause**

The API expected the query parameter `q`, but the request used `query`.

**Fix**

Updated the request to `GET /documents/search?q=keyword` (or aligned the controller and API parameter names).
