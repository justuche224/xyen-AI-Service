# XYEN AI Service

A service that provides AI-powered document summarization and quiz generation.

## Features

- PDF text extraction
- Document summarization
- Quiz generation (Multiple Choice and Yes/No questions)
- Bearer token authentication

## Prerequisites

- Bun runtime
- Environment variables:
  - `SECRET_KEY`: For API authentication
  - `GEMINI_API_KEY`: For Gemini AI API access
  - `PDF_SERVICE_URL`: URL of the PDF extraction service
  - `PORT`: Server port (defaults to 3002)

## Setup

1. Clone the repository

```bash
git clone https://github.com/justuche224/xyen-AI-Service.git
cd xyen-AI-Service
```

2. Install dependencies:

```bash
bun install
```

3. Create a `.env` file with required environment variables:

```env
SECRET_KEY=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
PDF_SERVICE_URL=pdf_service_url
PORT=3002
```

4. Start the server:

```bash
# Production
bun start

# Development with hot reload
bun dev
```

## API Endpoints

### 1. Generate Quiz

```http
POST /api/v1/generate-quiz
Authorization: Bearer your_secret_key
Content-Type: application/json

{
  "url": "pdf_url",
  "type": "MULTICHOICE" | "YESANDNO"
}
```

Response:

```json
{
  "quiz": [
    {
      "id": "q1",
      "text": "Question text",
      "type": "multiple-choice",
      "choices": [
        { "id": "a", "text": "Choice text", "isCorrect": true/false }
      ]
    }
  ]
}
```

### 2. Summarize Document

```http
POST /api/v1/summarize
Authorization: Bearer your_secret_key
Content-Type: application/json

{
  "url": "pdf_url"
}
```

Response:

```json
{
  "summary": "Document summary text"
}
```

## Error Responses

- 401 Unauthorized: Invalid or missing Bearer token
- 400 Bad Request: Missing required parameters
- 500 Internal Server Error: Server-side processing error

## Example Usage

```bash
# Generate Quiz
curl -X POST \
  http://localhost:3002/api/v1/generate-quiz \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer your_secret_key' \
  -d '{
    "url": "https://example.com/document.pdf",
    "type": "MULTICHOICE"
  }'

# Summarize Document
curl -X POST \
  http://localhost:3002/api/v1/summarize \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer your_secret_key' \
  -d '{
    "url": "https://example.com/document.pdf"
  }'
```
