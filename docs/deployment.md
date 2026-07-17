# Deployment Plan

## Frontend

The React app can be deployed to Vercel, Netlify, or any static hosting provider after running:

```bash
npm run build
```

## Backend

The Express API can be deployed to Render, Railway, Fly.io, or a VPS. Production deployment requires:

- MongoDB Atlas URI
- JWT secret
- client origin
- ML service URL

## ML Service

The Flask ML API can be deployed as a Python web service. Production deployment requires:

- trained model artifacts
- Python dependencies from `requirements.txt`
- persistent artifact storage

## Database

MongoDB Atlas is recommended for managed database hosting.

## Reports

PDF and CSV reports are generated on demand by the backend. Report metadata is stored in MongoDB, while generated files are streamed directly to the authenticated user.
