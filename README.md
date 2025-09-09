# scriptauth

a simple and secure authentication system for node.js applications. handle user registration, login, and session management with ease.

## ✨ features

- **jwt authentication** - secure token-based authentication
- **sqlite database** - lightweight and file-based storage
- **rate limiting** - prevent brute force attacks
- **security** - helmet.js, csrf protection, and secure headers
- **simple api** - easy to integrate with any frontend
- **lightweight** - minimal dependencies
- **admin panel** - admin stuff

## 🚀 getting started

### prerequisites

- node.js 18+ (lts recommended)
- npm 9+ or yarn 1.22+
- sqlite (file-based, no separate installation needed)

### installation

1. clone the repository:
   ```bash
   git clone https://github.com/hdhw/scriptauth.git
   cd scriptauth
   ```

2. install dependencies:
   ```bash
   npm install
   ```

3. set up environment variables:
   ```bash
   cp .env.example .env
   # edit .env with your configuration
   ```

4. start the development server:
   ```bash
   npm run dev
   ```

5. open your browser to [http://localhost:3000](http://localhost:3000)

## 🏗 project structure

```
.
├── backend/           # server-side code
│   ├── auth/         # authentication logic
│   ├── db/           # database connection and models
│   └── routes/       # api routes
├── public/           # static files (css, js, images)
├── views/            # ejs templates
├── .env.example      # example environment variables
└── package.json
```

## ⚙️ configuration

copy `.env.example` to `.env` and update the values:

```env
# server
node_env=development
port=3000

# jwt
jwt_secret=your_jwt_secret_key_here
jwt_expires_in=24h

# database
database_url=sqlite:./data/auth.db

# security
cors_origin=http://localhost:3000
rate_limit_window_ms=900000
rate_limit_max=100
trust_proxy=1

# logging
log_level=info
```

## 🛡 security features

- **helmet.js** - sets various http headers for security
- **rate limiting** - prevents brute force attacks
- **jwt** - stateless authentication with secure tokens
- **csrf protection** - built-in csrf protection
- **secure cookies** - http-only and secure cookie options
- **password hashing** - uses hmac-sha256 with random salts

## 📚 api documentation

### authentication

#### register a new user
```http
post /auth/register
content-type: application/json

{
  "username": "user123",
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### login
```http
post /auth/login
content-type: application/json

{
  "username": "user123",
  "password": "securepassword123"
}
```

#### get current user
```http
get /auth/me
authorization: bearer <token>
```

#### logout
```http
post /auth/logout
```

## 🧪 testing

run the test suite:

```bash
npm test
```

## 🛠 development

### linting
```bash
npm run lint
```

### formatting
```bash
npm run format
```

### production build
```bash
npm start
```

## 🤝 contributing

1. fork the repository
2. create your feature branch (`git checkout -b feature/amazingfeature`)
3. commit your changes (`git commit -m 'add some amazingfeature'`)
4. push to the branch (`git push origin feature/amazingfeature`)
5. open a pull request

## 📄 license

mit - see the [license](license) file for details.

## 🙏 acknowledgments

- [express.js](https://expressjs.com/)
- [json web tokens](https://jwt.io/)
- [sqlite](https://www.sqlite.org/)
- [helmet.js](https://helmetjs.github.io/)
