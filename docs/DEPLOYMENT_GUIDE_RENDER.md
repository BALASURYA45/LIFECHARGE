# 🚀 LifeCharge - Render & GitHub Deployment Guide

This repository includes a multi-service architecture ready for 1-click deployment on **Render** using Blueprint (`render.yaml`).

---

## 🛠️ Architecture Summary
- **Frontend**: React + Vite SPA (Static Site)
- **Backend**: Node.js Express API + WebSockets (`ws://`)
- **ML Service**: Python 3.11 Flask + PyTorch PINN + ONNX Runtime (`gunicorn`)
- **Database**: MongoDB Atlas (`mongodb+srv://...`)

---

## 📋 Step 1: Push Code to GitHub (Done ✅)
Your latest code, including `render.yaml` and `.gitignore`, is already committed and pushed to:
👉 **[https://github.com/BALASURYA45/LIFECHARGE](https://github.com/BALASURYA45/LIFECHARGE)**

---

## 🌐 Step 2: Deploy on Render via Blueprint (Recommended)

1. Go to **[Render Dashboard](https://dashboard.render.com/)** and log in with GitHub.
2. Click **New +** -> Select **Blueprint**.
3. Connect your GitHub Repository: `BALASURYA45/LIFECHARGE`.
4. Render will automatically read `render.yaml` and discover **3 services**:
   - `lifecharge-ml-service` (Python Web Service)
   - `lifecharge-backend` (Node Web Service)
   - `lifecharge-frontend` (Static Site)

5. **Set Required Environment Variables in Render UI**:

   ### A. `lifecharge-backend` Environment Variables:
   | Key | Recommended Value |
   |---|---|
   | `MONGODB_URI` | `mongodb+srv://balasuryad13062006_db_user:LIFECHARGE30385758@cluster0.epgcfze.mongodb.net/lifecharge?retryWrites=true&w=majority` |
   | `CLIENT_ORIGIN` | `https://lifecharge-frontend.onrender.com` (Your deployed frontend URL) |
   | `JWT_SECRET` | *(Render auto-generates a strong secret)* |
   | `ML_SERVICE_URL` | *(Render auto-links to `http://lifecharge-ml-service:8000`)* |

   ### B. `lifecharge-frontend` Environment Variables:
   | Key | Recommended Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://lifecharge-backend.onrender.com/api` |
   | `VITE_WS_URL` | `wss://lifecharge-backend.onrender.com/ws/telematics` |

6. Click **Apply / Deploy**.

---

## 🔒 Step 3: MongoDB Atlas IP Access List
Ensure your MongoDB Atlas cluster allows incoming connections from Render:
1. Log in to **[MongoDB Atlas](https://cloud.mongodb.com/)**.
2. Go to **Network Access** under Security.
3. Click **Add IP Address** -> Add **`0.0.0.0/0`** (Allows access from all IPs / Render servers).
4. Save changes.

---

## ✅ Step 4: Verification
Once deployment completes on Render:
- **ML Service**: `https://lifecharge-ml-service.onrender.com/health`
- **Backend API**: `https://lifecharge-backend.onrender.com/api/health`
- **Frontend Web App**: `https://lifecharge-frontend.onrender.com`
