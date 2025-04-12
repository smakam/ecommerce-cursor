# Ecommerce Platform

A full-stack ecommerce platform with web and mobile applications.

## Features

- User Authentication (Login/Register)
- Product Management
- Shopping Cart
- Order Processing
- Payment Integration (Razorpay)
- Admin Dashboard
- Seller Dashboard
- Real-time Updates

## Tech Stack

### Frontend

- React.js
- Redux for State Management
- Material-UI
- Axios for API Calls

### Backend

- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Socket.io for Real-time Updates

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB
- Razorpay Account (for payment processing)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/smakam/ecommerce-cursor.git
cd ecommerce-cursor
```

2. Install dependencies:

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables:
   Create `.env` files in both frontend and backend directories with the required variables.

4. Start the development servers:

```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd frontend
npm start
```

## Project Structure

```
ecommerce/
├── frontend/            # React frontend application
│   ├── public/         # Static files
│   ├── src/            # Source code
│   │   ├── components/ # Reusable components
│   │   ├── pages/     # Page components
│   │   ├── redux/     # Redux store and actions
│   │   └── utils/     # Utility functions
│   └── ...
├── backend/            # Node.js backend application
│   ├── config/        # Configuration files
│   ├── controllers/   # Route controllers
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   └── ...
└── ...
```

## Environment Variables

### Frontend (.env)

```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key
```

### Backend (.env)

```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## API Documentation

The API documentation is available at `/api-docs` when running the backend server.

## Related Projects

- [Mobile Application](https://github.com/smakam/ecommerce-cursor-mobile) - The mobile version of this ecommerce platform

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Sreenivas Makam - [@smakam](https://github.com/smakam)
