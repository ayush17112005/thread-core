# thread-core API

A backend API for a thread-core platform built with Node.js, Express, and MongoDB.

It includes authentication, communities, posts, comments (with replies), voting, profile updates, and image uploads via Cloudinary.

## Features

- JWT-based authentication (`register`, `login`, `get me`)
- Password hashing with `bcrypt`
- Community creation and membership management (`join` and `leave`)
- Admin handover when a community owner leaves (if members exist)
- Automatic community deletion (with related cleanup) when last admin/member leaves
- Community-specific post creation (only members can post)
- Optional image uploads for posts and user profile pictures via Cloudinary
- Global home feed and community feed
- Cursor-based pagination for feeds and comments
- Post upvote/downvote with toggle + switch behavior
- Single-vote-per-user-per-post enforcement
- Post deletion with cascading cleanup of comments and votes
- Nested comments (top-level comments + replies)
- Profile update endpoint (username, bio, profile image)

## Tech Stack

- Node.js
- Express 5
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Bcrypt
- Multer (memory storage)
- Cloudinary + Streamifier

## Project Structure

```text
10_Mini_Reddit_Clone/
  index.js
  package.json
  src/
    configs/
    controllers/
    middlewares/
    models/
    routes/
    services/
    tests/
```

## API Modules

- `/api/users`
  - `POST /register`
  - `POST /login`
  - `GET /me` (protected)
  - `PUT /profile` (protected, optional file upload)
- `/api/community`
  - `POST /` (protected)
  - `POST /:communityId/join` (protected)
  - `DELETE /:communityId/leave` (protected)
  - `POST /:communityId/posts` (protected, optional image upload)
  - `GET /:communityId/posts`
  - `POST /:communityId/posts/:postId/comments` (protected)
  - `GET /:communityId/posts/:postId/comments`
- `/api/posts`
  - `GET /`
  - `GET /:postId`
  - `POST /:postId/vote` (protected, body: `voteType` = `upvote` or `downvote`)
  - `DELETE /:postId` (protected, only post owner)

## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Create `.env`

Use the provided `.env.example` as a template and create your `.env` file in the project root.

Template:

```env
MONGO_URI=your_mongodb_connection_string
PORT=3000
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3) Run the server

```bash
npm run dev
```

Server starts on: `http://localhost:3000`

Health check route:

- `GET /` -> `Health check successful!`

## Pagination Pattern

Feeds and comments support cursor-based pagination:

- Query params: `cursor`, `limit`
- Response fields: `hasMore`, `nextCursor` (or `cursor` in one feed response)

## Data Models

- `User`: username, email, hashed password, profile, bio
- `Community`: name, admin, description, profile, membersCount
- `UserCommunity`: membership mapping (`user`, `community`) with unique pair index
- `Post`: author, community, title, content, image, upvotes, downvotes
- `Comment`: content, user, post, community, optional parent comment
- `Vote`: user, post, voteType with unique (`userId`, `postId`) index

## Notes

- Community names are normalized to lowercase with spaces converted to underscores.
- Community member counts are updated with atomic `$inc` operations.
- Route protection expects `Authorization: Bearer <token>`.

## Testing

There is a utility-style test script at `src/tests/testUser.js` that verifies password hashing behavior against MongoDB.

Available scripts:

- `npm start` -> Runs server with Node
- `npm run dev` -> Runs server in watch mode
- `npm test` -> Placeholder test command
- `npm run test:user` -> Runs `src/tests/testUser.js`

## Postman Collection

An import-ready Postman collection is included:

- `postman/Thread Core - thread-core API.postman_collection.json`

### Import steps

1. Open Postman.
2. Click **Import**.
3. Select `postman/Thread Core - thread-core API.postman_collection.json`.
4. After import, open collection variables and set:
  - `baseUrl` (default: `http://localhost:3000`)
  - `communityId` (after creating a community)
  - `postId` (after creating a post)
  - `commentId` (for reply testing)
5. Run `Login User` request once and token will auto-save to `token` variable.

## Security Reminder

Do not commit real secrets in `.env`.
If secrets were already committed, rotate MongoDB, JWT, and Cloudinary credentials immediately.
