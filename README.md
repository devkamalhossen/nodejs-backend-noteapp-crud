```markdown
# Secure Note-Taking Application (Full-Stack SPA & REST API)

A secure full-stack note-taking and user management application built with Node.js, Express, MongoDB (Mongoose), and a lightweight vanilla JavaScript Single Page Application (SPA) frontend. 

This project implements robust authentication, role-based access control (RBAC), database indexing, and advanced MongoDB aggregation pipelines.

---

## Live Demo & Links
* **Live Backend & Frontend URL:** [https://nodejs-backend-noteapp-crud.vercel.app](https://nodejs-backend-noteapp-crud.vercel.app)
* **Backend Repository:** [GitHub Repository](https://github.com/devkamalhossen/nodejs-backend-noteapp-crud)

---

## Tech Stack
* **Backend:** Node.js, Express.js
* **Database:** MongoDB, Mongoose (with Schema Indexing & Aggregation Pipelines)
* **Authentication:** JSON Web Tokens (JWT), Secure Password Hashing (bcrypt)
* **Frontend:** Vanilla HTML5, CSS3, JavaScript (Fetch API, SPA architecture)
* **Deployment:** Vercel

---

## Features & Implementation Details

### 1. Roles & Permissions
* **User:** 
  * Can securely register, log in, and manage (Create, Read, Update, Delete) their own personal notes.
  * Can create posts visible to everyone.
* **Admin:** 
  * Inherits all User capabilities.
  * Can manage users (add, remove, update, and list all users).
  * Can view everyone's notes and perform advanced administrative queries.

### 2. Database Indexing & Optimization
* **Schema Indexing:** Implemented `schema.index()` explicitly in Mongoose models to optimize query performance for list operations and GET requests without making unnecessary indexes.
* **Aggregation Task 1 (Group by Interests):** Utilizes a single `Collection.aggregate()` pipeline to group users based on their specific interests.
* **Aggregation Task 2 (User Posts `$lookup`):** Utilizes a single aggregation pipeline with a `$lookup` stage to retrieve all posts belonging to a specific user.

### 3. Lightweight Frontend SPA
* Built directly into a `public/` directory and served statically via Express (`express.static('public')`).
* Features clean API integration using standard JavaScript `fetch()`, `localStorage`-based JWT token management, and dynamic DOM manipulation for notes, posts, and admin user/post lookups.

---

## ⚙️ Local Installation & Setup Guide

Follow these steps to run the project locally on your machine:

### Step 1: Clone the Repository
Open your terminal and run:
```bash
git clone [https://github.com/devkamalhossen/nodejs-backend-noteapp-crud.git](https://github.com/devkamalhossen/nodejs-backend-noteapp-crud.git)
cd nodejs-backend-noteapp-crud

```

### Step 2: Install Dependencies

Run the following command to install all required backend packages:

```bash
npm install

```

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory of your project and add the following configuration variables:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_key_here

```

### Step 4: Run the Application

* For development mode (with auto-restart):
```bash
npm run dev

```


* For production mode:
```bash
npm start

```



### Step 5: Access in Browser

Open your preferred web browser and navigate to:

```text
http://localhost:3000

```

---

## Project Structure

```text
nodejs-backend-noteapp-crud/
├── controllers/     # Request handlers and business logic
├── models/          # Mongoose schemas with index definitions
├── routes/          # Express API route handlers
├── middleware/      # Authentication and role-based authorization guards
├── public/          # Frontend SPA (index.html, vanilla JS)
├── server.js        # Entry point and static file serving configuration
├── package.json     # Project metadata and dependencies
└── .env             # Environment configuration (ignored in git)

```

---

## 👨‍💻 Author

**Md. Kamal Hossen**

Full-Stack Software Engineer & Backend Specialist

```

```