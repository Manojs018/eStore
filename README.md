# eStore - Electrical Components E-Commerce Platform

<div align="center">

[![CI/CD Pipeline](https://github.com/chethanac15/eStore/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/chethanac15/eStore/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.2.0-blue)](https://react.dev/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)

A modern, scalable full-stack e-commerce platform for selling electrical components. Built with React, Node.js, MongoDB, and Stripe, following open-source best practices and production-ready architecture.

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing) • [License](#-license)

</div>

---

## 🌟 Features

## 🚀 Features

- **User Authentication**: JWT-based registration and login
- **Product Catalog**: Browse electrical components (Resistor, Capacitor, Arduino Board)
- **Shopping Cart**: Add to cart, quantity selection
- **Secure Checkout**: Stripe payment integration (test mode)
- **Order Tracking**: Real-time order status updates
- **Admin Panel**: View orders, customer details, email notifications
- **Responsive Design**: Mobile-first, modern UI with animations
- **Scalable Architecture**: Docker, Kubernetes, CI/CD ready

## 🛠 Tech Stack

- **Frontend**: React.js, HTML, CSS, JavaScript, Framer Motion
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Payments**: Stripe (test mode)
- **Email**: Nodemailer
- **DevOps**: Docker, Kubernetes, GitHub Actions

## 📁 Project Structure

```
eStore/
├── frontend/          # React application
├── backend/           # Node.js Express API
├── k8s/              # Kubernetes manifests
├── .github/workflows/ # CI/CD pipelines
├── docker-compose.yml # Local development setup
└── README.md
```

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 18+
- MongoDB
- Docker & Docker Compose
- Stripe account (for test payments)

### Local Development

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd eStore
   ```

2. **Start with Docker Compose**

   ```bash
   docker-compose up --build
   ```

3. **Or run manually**

   **Backend:**

   ```bash
   cd backend
   npm install
   npm run seed
   npm run dev
   ```

   **Frontend:**

   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Environment Setup

Create `.env` files in backend/ and frontend/ directories.

**Backend .env:**

```
MONGO_URI=mongodb://localhost:27017/estore
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=sk_test_your_stripe_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
ADMIN_EMAIL=admin@estore.com
```

## 🚀 Deployment

### Docker

```bash
docker-compose -f docker-compose.yml up -d
```

### Kubernetes

```bash
kubectl apply -f k8s/
```

### Free Hosting Options

- **Frontend**: Vercel, Netlify
- **Backend**: Render, Railway, Fly.io
- **Database**: MongoDB Atlas (free tier)

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID

### Orders

- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/admin` - Get all orders (admin)


## 📧 Email Notifications

Admin receives email notifications for new orders containing:

- Customer details
- Order information
- Payment status

## 🔒 Security

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- CORS configuration
- Rate limiting

## 📈 Scalability

- Modular architecture
- Database indexing
- Docker containerization
- Kubernetes orchestration
- CI/CD pipeline

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request



## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For questions or support, please open an issue in the repository.
