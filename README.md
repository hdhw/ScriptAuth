# ScriptAuth

super simple auth system for node.js apps. handles login/register with passwords without the headache.

## features

- **hmac password hashing** - your passwords are safe, no plaintext nonsense
- **jwt sessions** - stateless auth tokens that just work
- **db storage** - persistent user data (works with your existing db)
- **rate limiting** - stops brute force attacks automatically
- **ejs pages** - ready-to-use login/register forms

## folder structure

```
ScriptAuth/
│
├─ backend/
│   ├─ server.js
│   ├─ auth/
│   │   ├─ login.js
│   │   ├─ register.js
│   │   ├─ hash.js
│   │   └─ middleware.js
│   ├─ db/
│   │   ├─ connection.js
│   │   └─ users.js
│   └─ routes/
│       └─ authRoutes.js
│
├─ views/
│   ├─ login.ejs
│   ├─ register.ejs
│   ├─ dashboard.ejs
│   └─ partials/
│       ├─ header.ejs
│       └─ footer.ejs
│
├─ public/
│   ├─ css/
│   └─ js/
│
├─ utils/
│   ├─ rateLimiter.js
│   └─ validator.js
│
├─ README.md
└─ package.json
```

## how to use

1. **clone the repo**
   ```bash
   git clone https://github.com/yourusername/js-auth.git
   cd js-auth
   ```

2. **install dependencies**
   ```bash
   npm install
   ```

3. **configure your database**
   - edit `backend/db/connection.js` with your db details
   - make sure your users table exists (check `backend/db/users.js` for schema)

4. **start the server**
   ```bash
   npm start
   ```

5. **test the pages**
   - go to `http://localhost:3000/register` to create an account
   - go to `http://localhost:3000/login` to sign in
   - protected routes will redirect to login if not authenticated

## examples and notes

**basic usage in your routes:**
```javascript
const { requireAuth } = require('./backend/auth/middleware');

app.get('/protected', requireAuth, (req, res) => {
  res.render('dashboard', { user: req.user });
});
```

**rate limiting is on by default:**
- 5 login attempts per 15 minutes per ip
- 3 register attempts per hour per ip
- adjust in `utils/rateLimiter.js` if needed

**jwt tokens:**
- expire in 24 hours (change in `auth/login.js`)
- stored in httpOnly cookies for security
- automatically refreshed on valid requests

**password security:**
- uses hmac-sha256 with random salts
- salts are unique per user and stored in db
- no bcrypt dependency needed

**customizing views:**
- all ejs templates are in `views/`
- styling is in `public/css/`
- forms submit to `/auth/login` and `/auth/register`

**environment variables you might want:**
```
JWT_SECRET=your-super-secret-key
```

**customizing views:**
- all ejs templates are in `views/`
- styling is in `public/css/`
- forms submit to `/auth/login` and `/auth/register`

that's it. copy, paste, and you're good to go. <3
