# Yappers

A college-specific anonymous social media app where students can share posts, hot takes, and engage with their campus community.

![Yappers](https://img.shields.io/badge/React%20Native-Expo-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)

## Features

- **College-Specific Communities**: Users are auto-grouped by their school email domain
- **Anonymous Posting**: Choose to post anonymously or with your display name
- **Hot Takes Feed**: Mark your spicy opinions as "hot takes" for a dedicated feed
- **Voting System**: Upvote/downvote posts (Reddit-style)
- **Comments**: Engage with posts through comments (also with anonymous option)
- **OTP Verification**: Secure email verification with 6-digit OTP

## DEMO

https://github.com/user-attachments/assets/2a1d2928-c321-4d52-97ef-f96d458a3079

## Tech Stack

### Mobile App (`/mobile`)
- React Native with Expo
- TypeScript
- NativeWind (TailwindCSS)
- Redux Toolkit
- Expo Router

### Backend (`/server`)
- Express.js with TypeScript
- Sequelize ORM
- PostgreSQL
- JWT Authentication
- Nodemailer for OTP

## UI Design

The app uses a **subtle Neobrutalism** design language:
- Bold 2-3px borders
- Offset box shadows
- Warm cream background (#FFFEF5)
- Energetic orange primary (#FF6B35)
- Space Grotesk typography

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Expo CLI (`npm install -g expo-cli`)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ReactNativeAssignment
```

### 2. Setup Environment Variables

```bash
cp .env.example server/.env
```

Edit `server/.env` with your configurations:
- Database credentials
- JWT secret
- Gmail SMTP credentials (for OTP)

### 3. Setup Database

```bash
# Create PostgreSQL database
createdb yappers

# Or using psql
psql -U postgres -c "CREATE DATABASE yappers;"
```

### 4. Start Backend Server

```bash
cd server
npm install
npm run dev
```

Server will run on `http://localhost:3001`

### 5. Start Mobile App

```bash
cd mobile
npm install
npx expo start
```

Scan QR code with Expo Go app or run on simulator.

## API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@university.edu",
  "password": "securepassword",
  "displayName": "John Doe"
}
```

#### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@university.edu",
  "otp": "123456"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@university.edu",
  "password": "securepassword"
}
```

### Posts

#### Get Feed
```http
GET /api/posts?type=normal&page=1&limit=10
Authorization: Bearer <token>
```

#### Get Hot Takes
```http
GET /api/posts?type=hottake&page=1&limit=10
Authorization: Bearer <token>
```

#### Create Post
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "This is my post!",
  "isAnonymous": false,
  "isHotTake": true
}
```

#### Vote on Post
```http
POST /api/posts/:id/vote
Authorization: Bearer <token>
Content-Type: application/json

{
  "value": 1  // 1 for upvote, -1 for downvote
}
```

### Comments

#### Get Comments
```http
GET /api/posts/:postId/comments
Authorization: Bearer <token>
```

#### Create Comment
```http
POST /api/posts/:postId/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Great post!",
  "isAnonymous": false
}
```

## Project Structure

```
/ReactNativeAssignment
├── mobile/                 # React Native Expo app
│   ├── app/               # Expo Router screens
│   │   ├── (auth)/        # Auth screens
│   │   └── (main)/        # Main app screens
│   ├── components/        # Reusable components
│   ├── store/             # Redux store
│   ├── types/             # TypeScript types
│   └── utils/             # Utilities
│
├── server/                 # Express.js backend
│   └── src/
│       ├── config/        # Database config
│       ├── models/        # Sequelize models
│       ├── routes/        # API routes
│       ├── middleware/    # Auth middleware
│       ├── services/      # Email service
│       └── utils/         # Helper functions
│
├── .env.example           # Environment template
└── README.md
```

## Gmail SMTP Setup

To enable OTP emails:

1. Go to Google Account > Security
2. Enable 2-Factor Authentication
3. Generate App Password (Mail > Other)
4. Use this password in `EMAIL_PASS`

## Development Notes

- OTP is logged to console in development mode if email fails
- Database syncs automatically on server start
- Use `npm run db:sync` to manually sync database

## License

MIT

