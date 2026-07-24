# DHive — Backend API

RESTful API for **DHive**, a full-stack MERN blogging and publishing platform. Built with **Node.js, Express, and MongoDB**, it powers the two front-end apps in the [Dhive-Frontend](https://github.com/dulana-wanigathunga/Dhive-Frontend) repo.

> **Live API:** `https://dhive-backend.vercel.app/api`

---

## ✨ Features

- **Authentication** — email/password signup with **OTP email verification**, Google sign-in, and login, secured with **JWT**.
- **Password security** — hashing with `bcryptjs`.
- **Posts** — create, update, delete, list (with pagination, category & writer filters), popular posts, and single-post fetch.
- **Engagement** — nested comments, likes, and a writer follow/unfollow system.
- **Writer analytics** — endpoints for post stats, followers, and content management.
- **Email** — OTP verification emails via **Nodemailer** + **Mailgen**.
- **Security middleware** — Helmet, CORS, and JWT auth middleware.

---

## 🛠 Tech Stack

**Node.js · Express · MongoDB (Mongoose) · JWT · bcryptjs · Nodemailer · Mailgen · Helmet · CORS**

**Hosting:** Vercel (serverless) · MongoDB Atlas

---

## 📁 Structure

```
Dhive-Backend/
├── controllers/     # auth, posts, and user logic
├── dbConfig/        # MongoDB connection
├── middleware/      # JWT auth & error handling
├── models/          # Mongoose schemas (user, post, comments, followers, views, verification)
├── routes/          # /api/auth, /api/users, /api/posts
├── util/            # JWT, hashing, OTP, mailer helpers
└── index.js         # app entry point
```

---

## 🔌 API Overview

Base path: `/api`

### Auth — `/api/auth`
| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/register` | Register with email/password (sends OTP) |
| `POST` | `/google-signup` | Create account via Google |
| `POST` | `/login` | Log in (email/password or Google) |

### Users — `/api/users`
| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/verify/:userId/:otp` | Verify email with OTP |
| `POST` | `/resend-link/:userId` | Resend OTP |
| `GET` | `/get-user/:id` | Get a user's profile |
| `PUT` | `/update-user` | Update profile *(auth)* |
| `PUT` | `/reset-password` | Reset password |
| `POST` / `DELETE` | `/follower/:id` | Follow / unfollow a writer *(auth)* |

### Posts — `/api/posts`
| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | List posts (pagination, `?cat=`, `?writerId=`) |
| `GET` | `/popular` | Popular posts |
| `GET` | `/:postId` | Single post |
| `GET` | `/comments/:postId` | Comments for a post |
| `POST` | `/create-post` | Create a post *(auth)* |
| `PATCH` | `/update-post/:postId` | Update a post *(auth)* |
| `POST` | `/comment/:id` | Add a comment *(auth)* |
| `DELETE` | `/:postId` | Delete a post *(auth)* |
| `POST` | `/admin-analytics`, `/admin-followers`, `/admin-content` | Dashboard data *(auth)* |

*(auth)* = requires `Authorization: Bearer <token>` header.

---

## 🚀 Getting Started

```bash
git clone https://github.com/dulana-wanigathunga/Dhive-Backend
cd Dhive-Backend
npm install
cp .env.example .env    # fill in the values
npm run dev             # nodemon, http://localhost:5000
```

`npm start` runs the production server (`node index.js`).

---

## 🔑 Environment Variables

Create a `.env` file (see `.env.example`):

| Variable | Description |
| --- | --- |
| `MONGODB_URL` | MongoDB Atlas connection string (database `blogApp`) |
| `JWT_SECRET_KEY` | Secret for signing JWTs |
| `PORT` | Server port for local dev (default `5000`) |
| `AUTH_EMAIL` | Gmail address used to send OTP emails |
| `AUTH_PASSWORD` | Gmail **app password** (not your login password) |

---

## ☁️ Deployment (Vercel)

The Express app is deployed as a serverless function on Vercel.

1. Import the repo into Vercel.
2. Add the environment variables above (do **not** set `PORT` — Vercel provides it).
3. In MongoDB Atlas → **Network Access**, allow `0.0.0.0/0` (Vercel IPs are dynamic).
4. Deploy. Each push to `master` auto-deploys.

---

## 📬 Contact

**Dulana Wanigathunga** — dulana.m.waniga@gmail.com

Frontend repo: https://github.com/dulana-wanigathunga/Dhive-Frontend
