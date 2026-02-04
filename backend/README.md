# eStore Backend API

A complete e-commerce backend API built with Node.js, Express, MongoDB, and Stripe payments.

## Features

- User authentication and authorization (JWT)
- Product management
- Order processing with Stripe payments
- Email notifications
- Admin panel functionality
- Input validation and error handling
- CORS support
- Environment-based configuration

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Stripe** - Payment processing
- **Nodemailer** - Email notifications
- **bcryptjs** - Password hashing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Stripe account (for payments)

### Installation

1. Clone the repository and navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:

   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration:

   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/estore
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password_here
   ADMIN_EMAIL=admin@estore.com
   CLIENT_URL=http://localhost:3000
   ```

5. Start MongoDB service (if running locally)

6. Seed the database with sample data:

   ```bash
   npm run seed
   ```

7. Start the development server:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile

### Products

- `GET /api/products` - Get all products (with pagination, search, filter)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Orders

- `POST /api/orders/create-payment-intent` - Create Stripe payment intent
- `POST /api/orders/confirm-payment` - Confirm payment and create order
- `GET /api/orders/myorders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `GET /api/orders` - Get all orders (Admin only)
- `PUT /api/orders/:id` - Update order status (Admin only)

## Sample Data

The seed script creates:

- 3 sample products (Resistor, Capacitor, Arduino Board)
- 1 admin user (admin@estore.com / admin123)

## Environment Variables

| Variable            | Description                   | Required                            |
| ------------------- | ----------------------------- | ----------------------------------- |
| `NODE_ENV`          | Environment mode              | No                                  |
| `PORT`              | Server port                   | No (default: 5000)                  |
| `MONGO_URI`         | MongoDB connection string     | Yes                                 |
| `JWT_SECRET`        | JWT signing secret            | Yes                                 |
| `JWT_EXPIRE`        | JWT expiration time           | No (default: 30d)                   |
| `STRIPE_SECRET_KEY` | Stripe secret key (test mode) | Yes                                 |
| `EMAIL_USER`        | Email service username        | Yes                                 |
| `EMAIL_PASS`        | Email service password        | Yes                                 |
| `ADMIN_EMAIL`       | Admin email for notifications | Yes                                 |
| `CLIENT_URL`        | Frontend URL for CORS         | No (default: http://localhost:3000) |
| `ADMIN_URL`         | Admin Panel URL for CORS      | No                                  |

### CORS Configuration

The API uses a dynamic whitelist approach for Cross-Origin Resource Sharing (CORS).
Allowed origins include:
1. `http://localhost:3000` (Local Frontend)
2. `http://localhost:5000` (Local Backend)
3. `CLIENT_URL` (Environmental variable)
4. `ADMIN_URL` (Environmental variable)

Requests from unauthorized origins will be blocked with a 500 error. whitelist configuration can be found in `server.js`.

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data
- `node scripts/seed.js -d` - Destroy all data

## Project Structure

```
backend/
├── middleware/
│   └── auth.js              # Authentication middleware
├── models/
│   ├── User.js              # User model
│   ├── Product.js           # Product model
│   └── Order.js             # Order model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── products.js          # Product routes
│   └── orders.js            # Order routes
├── scripts/
│   └── seed.js              # Database seeding script
├── .env.example             # Environment variables template
├── package.json             # Dependencies and scripts
├── server.js                # Main server file
└── README.md                # This file
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- CORS configuration
- Error handling without sensitive data exposure
- Rate limiting considerations (can be added)

## Production Deployment

For detailed step-by-step instructions on deploying to Railway, Heroku, or other platforms, please refer to the [DEPLOYMENT.md](./DEPLOYMENT.md) guide.

### Quick Checklist
1. Set `NODE_ENV=production`
2. Use a production MongoDB instance (Atlas)
3. Set up proper environment variables
4. Whitelist Frontend URL in `CLIENT_URL`

## License

This project is licensed under the ISC License.
