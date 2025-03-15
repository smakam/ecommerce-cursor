# E-commerce Backend

This is the backend server for the e-commerce application.

## Prerequisites

- Node.js >= 14.0.0
- MongoDB
- Razorpay account for payments

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
FRONTEND_URL=your_frontend_url
PORT=5001
```

## Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. For production:
   ```bash
   npm start
   ```

## Deployment on Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the following:
   - Name: your-service-name
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Add all environment variables
   - Select the Free plan

## API Endpoints

### Authentication

- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/logout` - Logout user
- GET `/api/auth/current-user` - Get current user

### Products

- GET `/api/products` - Get all products
- GET `/api/products/:id` - Get single product
- POST `/api/products` - Create product (admin only)
- PUT `/api/products/:id` - Update product (admin only)
- DELETE `/api/products/:id` - Delete product (admin only)

### Cart

- GET `/api/cart` - Get user's cart
- POST `/api/cart/add` - Add item to cart
- PUT `/api/cart/update/:productId` - Update cart item quantity
- DELETE `/api/cart/remove/:productId` - Remove item from cart
- DELETE `/api/cart/clear` - Clear cart

### Orders

- GET `/api/orders` - Get user's orders
- GET `/api/orders/:id` - Get single order
- POST `/api/orders` - Create order
- POST `/api/orders/:id/verify-payment` - Verify payment
