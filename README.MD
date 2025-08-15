# 📄 D-Drive Backend

**D-Drive** is a secure cloud file storage backend built with:
- **Node.js + Express** – Server framework
- **MongoDB + Mongoose** – User & file metadata storage
- **Supabase Storage** – File upload/download backend
- **JWT + HTTP-only Cookies** – Authentication
- **bcrypt** – Password hashing
- **express-validator** – Input validation

### 🔐 Features
- ✅ User Registration & Login
- ✅ Secure JWT-based authentication (via cookies)
- ✅ Upload, Download, Rename, Delete files
- ✅ Per-user file isolation
- ✅ Signed URLs for secure downloads
- ✅ Input validation & error handling

---

## 📁 Project Structure

```
d-drive-backend/
├── app.js                  # Main server file
├── package.json            # Dependencies
├── config/
│   ├── db.js               # MongoDB connection
│   └── supabase-client.js  # Supabase client
├── middleware/
│   └── auth.js             # Authentication middleware
├── models/
│   ├── user.model.js       # User schema
│   └── files.model.js      # File metadata schema
├── routes/
│   ├── user.routes.js      # Auth routes
│   └── file.routes.js      # File management routes
```

---

## ⚙️ Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/dothp-harshu/d-drive-backend.git
cd d-drive-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create `.env` File
Create a `.env` file in the root directory:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/d-drive?retryWrites=true&w=majority
SUPABASE_URL=https://yjijawbttohrgrmcjjpd.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here
SECRET_KEY=your_jwt_secret_key_here
NODE_ENV=development
```


### 4. Set Up Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Create a storage bucket named `d-drive`
3. Copy the **Project URL** and **anon (public) key** into `.env`

### 5. Start the Server
```bash
node app.js
```
Server runs on `http://localhost:3000`

---

## 🔐 Authentication & Security

### How It Works
- Users register/login via email/password
- On login, a **JWT token** is sent in an **HTTP-only cookie**
- All file routes are protected by `authMiddleware`
- Files are stored in user-specific folders: `/userId/filename.ext`

### Cookie Security
```js
res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
});
```

---

## 🌐 API Endpoints

### 🔹 User Routes (`/user`)

| Method | Endpoint | Description |
|-------|---------|-------------|
| `POST` | `/user/register` | Register a new user |
| `POST` | `/user/login` | Login and get cookie |
| `GET` | `/user/me` | Get current user info |
| `GET` | `/user/logout` | Clear auth cookie |

#### ✅ Register Request
```json
POST /user/register
{
  "username": "harsh",
  "email": "harsh@example.com",
  "password": "password123"
}
```

#### ✅ Login Request
```json
POST /user/login
{
  "email": "harsh@example.com",
  "password": "password123"
}
```

---

### 🔹 File Routes (`/file`) [Protected]

| Method | Endpoint | Description |
|-------|---------|-------------|
| `POST` | `/file/upload` | Upload a file |
| `GET` | `/file/all` | List all user files |
| `GET` | `/file/download/:id` | Get signed download URL |
| `POST` | `/file/rename/:id` | Rename a file |
| `DELETE` | `/file/delete/:id` | Delete a file |

#### ✅ Upload File
Use `multipart/form-data`:
- Field name: `file`
- Requires auth cookie

#### ✅ Rename File
```json
POST /file/rename/:id
{
  "newName": "new-filename"
}
```

> 📝 `:id` is the `storageId` from the file metadata.

#### ✅ Download File
```json
GET /file/download/:id
→ Returns signed URL valid for 60 seconds
```

---

### 🔒 Recommended Improvements
1. **Rate Limiting** – Prevent brute-force login
2. **HTTPS in Production** – Use Vercel, Render, or SSL
3. **Refresh Tokens** – For long-term sessions
4. **File Type Validation** – Block `.exe`, `.sh`, etc.

---


## 🐞 Troubleshooting

| Issue | Solution |
|------|----------|
| `CORS error` | Ensure frontend origin is allowed in `cors()` |
| `Token not sent` | Check `withCredentials: true` in frontend |
| `File not found` | Verify `storageId` and user ownership |
| `Supabase upload failed` | Check bucket name and permissions |
| `MongoDB connection failed` | Verify `MONGO_URI` format |

---

## FrontEnd 

[d-drive-ui](https://github.com/dotHP-harshu/d-drive-ui)

---

Made with ❤️ by **DotHP**  
`D-Drive – Secure. Simple. Your files, anywhere.`