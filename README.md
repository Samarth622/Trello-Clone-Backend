# Mini Trello Clone – Backend (Node.js + Express + MongoDB)

A production-ready backend for a Trello-style task management application featuring collaborative boards, lists, cards, and a custom **Smart Recommendations Engine**.

This system is built using **Node.js, Express.js, and MongoDB** with **JWT authentication**. It supports detailed access control, member invitations, drag-and-drop logic (positional indexing), and an NLP-like rule-based recommendation system for due dates and list movements.

---

## 🚀 Features

### 1. Authentication (JWT)
* User Registration & Login.
* Password hashing using **bcrypt**.
* Token-based authentication (JWT).
* Secure protected routes.

### 2. Boards
* Create, update, and delete boards.
* **Access Control:** Owner vs. Member permissions.
* Invite members via email.
* Fetch all boards a user has access to.

### 3. Lists
* Create, update, and delete lists within a board.
* **Positional Indexing:** Handles ordered lists.
* Auto-incrementing list positions.

### 4. Cards
* Create, update, delete cards.
* **Move Logic:** Move cards across lists with automatic position shifting.
* Metadata: Priority, labels, assignees, and due dates.
* Strong validation and permission checks.

### 5. 🧠 Smart Recommendations Engine
A rule-based NLP module that provides:
* **Due Date Suggestions:** Based on weighted keyword scoring (e.g., "urgent", "asap").
* **List Movement Suggestions:** Based on status keywords (e.g., "done", "review").
* **Related Cards:** Grouped by textual similarity using cosine-like scoring.
* **Confidence Scoring:** Returns a confidence level for every suggestion.

### 6. Access Control
* **Owner:** Full update/delete permissions.
* **Member:** Read, add, and edit cards/lists.
* Middleware ensures no unauthorized access.

---

## 🛠 Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB + Mongoose
* **Auth:** JWT (JSON Web Token) & bcrypt.js
* **Logic:** Custom NLP-like keyword engine
* **Architecture:** Modular (Controllers, Routes, Services)

---

## 📂 Project Structure

```bash
src/
│── controllers/        # Request handlers
│   ├── auth.controller.js
│   ├── board.controller.js
│   ├── list.controller.js
│   ├── card.controller.js
│   └── recs.controller.js
│
│── middlewares/        # Auth & Permission checks
│   ├── auth.middleware.js
│   └── checkBoardAccess.js
│
│── models/             # Mongoose Schemas
│   ├── user.model.js
│   ├── board.model.js
│   ├── list.model.js
│   └── card.model.js
│
│── routes/             # API Route definitions
│   ├── auth.routes.js
│   ├── board.routes.js
│   ├── list.routes.js
│   ├── card.routes.js
│   └── recs.routes.js
│
│── utils/              # Helper functions
│   ├── generateJWT.js
│   ├── textUtils.js
│   └── recommendationsLogic.js
│
├── server.js           # Entry point
└── README.md
````

-----

## ⚙️ Installation & Setup

### 1\. Clone the repository

```bash
git clone <repo-url>
cd backend
```

### 2\. Install dependencies

```bash
npm install
```

### 3\. Configure Environment Variables

Create a `.env` file in the root directory and add the following:

```env
PORT=8080
MONGO_URI=mongodb://localhost:27017/trello-clone
JWT_SECRET=your_jwt_secret
EXPIRES_IN=7d
```

### 4\. Run the Server

**Development Mode:**

```bash
npm run dev
```

**Production Mode:**

```bash
npm start
```

Server runs on: `http://localhost:8080`

-----

## 📡 API Overview

All protected routes require the following header:
`Authorization: Bearer <token>`

### 🔐 Authentication

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/auth/register` | Register a new user |
| **POST** | `/auth/login` | Login and receive JWT |

### 📋 Boards

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/boards` | Create a board |
| **GET** | `/boards` | Get all boards (Owner/Member) |
| **GET** | `/boards/:id` | Get specific board details |
| **PUT** | `/boards/:id` | Update board (Owner only) |
| **DELETE** | `/boards/:id` | Delete board (Owner only) |
| **POST** | `/boards/:id/members` | Invite user by email |

### 📑 Lists

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/boards/:id/lists` | Create a new list |
| **GET** | `/boards/:id/lists` | Get ordered lists |
| **PUT** | `/boards/:id/lists/:listId` | Update list |
| **DELETE** | `/boards/:id/lists/:listId` | Delete list |

### 📝 Cards

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/card/:boardId/:listId/cards` | Create a card |
| **GET** | `/card/:boardId/cards` | Get all cards |
| **PUT** | `/card/:boardId/cards/:cardId` | Update card details |
| **POST** | `/card/:boardId/cards/:cardId/move` | Move card (List/Position) |
| **DELETE** | `/card/:boardId/cards/:cardId` | Delete card |

### 🧠 Smart Recommendations

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/boards/:boardId/recommendations` | Get AI suggestions |

**Response Example for Recommendations:**

```json
{
  "dueDateSuggestions": [
    {
      "cardTitle": "Fix login bug",
      "suggestedDue": "2025-02-24T09:00:00.123Z",
      "score": 7,
      "confidence": 0.85,
      "reason": "Weighted keywords sum = 7"
    }
  ],
  "moveSuggestions": [
    {
      "cardTitle": "Fix login bug",
      "suggestedListName": "In Progress",
      "confidence": 0.8,
      "reason": "Matched 2 keyword(s)"
    }
  ]
}
```

-----

## 💡 Recommendation Engine Logic

### 1\. Due Date Logic

Calculates a score based on keywords in the card description:

  * **+5:** `urgent`, `asap`
  * **+3:** `bug`, `fix`
  * **+2:** `review`
  * **+1:** `meeting`, `planning`

**Result:**

  * Score ≥ 8 → Due in **1 day**
  * Score ≥ 5 → Due in **2 days**
  * Score ≥ 3 → Due in **5 days**
  * Score \> 0 → Due in **7 days**

### 2\. Move Suggestion Logic

Suggests moving a card to a specific list based on keywords:

  * `start`, `doing` → **"In Progress"**
  * `done`, `completed` → **"Done"**
  * `blocked`, `hold` → **"Blocked"**
  * `review`, `pr` → **"Review"**

### 3\. Related Groups Logic

  * Tokenizes card titles and descriptions.
  * Generates term frequency vectors.
  * Computes **cosine-like similarity**.
  * Groups cards with a similarity threshold ≥ **0.25**.

-----

## 🛡 Security & Standards

  * **Sanitized Queries:** Prevents NoSQL injection.
  * **Password Encryption:** Uses `bcrypt` (no plaintext storage).
  * **Role-Based Access:** Strict Owner vs. Member separation.
  * **Environment Config:** Sensitive keys stored in `.env`.

-----

## 🔮 Future Enhancements

  * [ ] Real-time updates using **Socket.io**.
  * [ ] Activity Logs / Audit Trails.
  * [ ] Granular Roles (Admin, Editor, Viewer).
  * [ ] File Attachments (AWS S3 / Cloudinary).
  * [ ] Commenting system on cards.

-----

## 👤 Author

**Samarth Gupta**
*Backend built for the Mini Trello Clone assignment.*
