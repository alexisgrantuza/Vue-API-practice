# Node.js Backend for Vue.js Application

This is a RESTful API backend service built with Node.js, Express, and MongoDB, designed to work with the Vue.js frontend application.

## 🚀 Features

- **Express.js** - Fast, unopinionated web framework for Node.js
- **MongoDB with Mongoose** - Database integration with schema validation
- **JWT Authentication** - Secure user authentication
- **RESTful API** - Clean and consistent API endpoints
- **CORS** - Cross-Origin Resource Sharing enabled
- **Environment Variables** - Secure configuration management
- **Error Handling** - Global error handling middleware
- **Request Validation** - Input validation using Joi
- **Logging** - Request logging with morgan

## 📁 Project Structure

```
backend/
├── config/         # Configuration files
│   └── db.js      # Database connection
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # MongoDB models
├── routes/         # API routes
├── utils/          # Utility functions
├── validations/    # Request validation schemas
├── .env            # Environment variables
├── app.js          # Express application
├── package.json    # Project dependencies
└── server.js       # Server entry point
```

## 🛠️ Prerequisites

- Node.js (v16.x or higher)
- npm (comes with Node.js)
- MongoDB (local or MongoDB Atlas)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
# Navigate to the backend directory
cd vue-backend

# Install dependencies
npm init -y
npm install express mongoose dotenv cors jsonwebtoken bcryptjs joi morgan

# Development dependencies
npm install --save-dev nodemon
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/vue_app
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### 3. Project Structure Setup

#### 3.1 Create the main application file (`app.js`):

```javascript
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/users', require('./routes/users'));
// Add more routes here

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;
```

#### 3.2 Create the server entry point (`server.js`):

```javascript
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
```

#### 3.3 Set up database configuration (`config/db.js`):

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB };
```

### 4. Create a Sample Model and Routes

#### 4.1 Create a user model (`models/User.js`):

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
  },
  { timestamps: true }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

#### 4.2 Create user routes (`routes/users.js`):

```javascript
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST api/users/register
// @desc    Register a user
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      user = new User({
        name,
        email,
        password,
      });

      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '5 days' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const isMatch = await user.matchPassword(password);

      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '5 days' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
```

### 5. Create Authentication Middleware

Create a middleware file (`middleware/auth.js`) to protect routes:

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.user.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ msg: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ msg: 'Not authorized, no token' });
  }
};
```

### 6. Update package.json Scripts

Add these scripts to your `package.json`:

```json
"scripts": {
  "start": "node server.js",
  "server": "nodemon server.js",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

### 7. Start the Development Server

```bash
# Start the server in development mode
npm run server
```

## 🔒 Environment Variables

The following environment variables need to be set in the `.env` file:

- `PORT` - The port the server will run on (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token generation
- `NODE_ENV` - Application environment (development/production)

## 📚 API Endpoints

### Authentication

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Authenticate a user and get token

### Protected Routes (require JWT token)

- `GET /api/users/me` - Get current user profile
- More endpoints can be added as needed

## 🧪 Testing the API

You can test the API using tools like Postman or cURL:

### Register a new user

```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

### Login

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

## 🚀 Deployment

### Production

1. Set `NODE_ENV=production` in your `.env` file
2. Make sure MongoDB is properly configured
3. Run `npm install --production` on your server
4. Start the server with `npm start`

### Using PM2 (recommended for production)

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start server.js --name "vue-app-backend"

# Save the process list and corresponding environments
pm2 save

# Generate startup script
pm2 startup

# Restart PM2 on server reboot
pm2 save
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
