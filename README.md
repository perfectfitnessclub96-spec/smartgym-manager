# 🏋️ SmartGym Manager - Perfect Fitness Club

A comprehensive gym management system built with modern web technologies.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Phase 1 (Current)
- ✅ OTP-based authentication (mobile number)
- ✅ Role-based access control (Admin & Member)
- ✅ JWT authentication with HTTP-only cookies
- ✅ MongoDB database with Mongoose ODM
- ✅ Responsive UI with Tailwind CSS
- ✅ Light theme design
- ✅ Landing page with role selection
- ✅ Protected routes for members and admins

### Coming Soon (Phase 2)
- Member management CRUD operations
- Membership plan management
- Wellness services booking system
- Equipment tracking
- Payment integration
- Reports and analytics
- Real-time notifications
- Mobile app version

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT with HTTP-only cookies
- **OTP:** Simulated (ready for SMS integration)

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Routing:** React Router v6
- **HTTP Client:** Axios

## 📦 Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v18 or higher)
- **MongoDB** (v6 or higher) or MongoDB Atlas account
- **npm** or **yarn** package manager
- **Git** (for cloning)

## 🚀 Installation

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/smartgym-manager.git
cd smartgym-manager
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
\`\`\`

### 3. Frontend Setup
\`\`\`bash
cd ../frontend
npm install
cp .env.example .env  # Configure frontend environment
\`\`\`

## 🏃 Running the Application

### Start MongoDB
\`\`\`bash
# Windows (as Administrator)
net start MongoDB

# or run manually
mongod --dbpath C:\data\db

# macOS/Linux
sudo systemctl start mongod
\`\`\`

### Start Backend Server
\`\`\`bash
cd backend
npm run dev
# Server runs on http://localhost:5000
\`\`\`

### Start Frontend App
\`\`\`bash
cd frontend
npm run dev
# App runs on http://localhost:5173
\`\`\`

## 🔐 Authentication Flow

1. **Landing Page**: Choose login type (Member or Admin)
2. **Enter Mobile**: Provide 10-digit mobile number
3. **Receive OTP**: 6-digit code (logged in console for testing)
4. **Verify OTP**: Enter received code
5. **Redirect**: Automatically redirected to respective dashboard

### Test Credentials
- **Member**: Any 10-digit number (e.g., 9876543210)
- **Admin**: Any 10-digit number with role="ADMIN"

## 📁 Project Structure

\`\`\`
smartgym-manager/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth middleware
│   │   └── server.ts        # Entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── store/           # Zustand store
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── tailwind.config.js
└── README.md
\`\`\`

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/send-otp` | Send OTP to mobile |
| POST | `/api/auth/verify-otp` | Verify OTP and login |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |

### Member Routes (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/member/dashboard` | Member dashboard data |

### Admin Routes (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Admin dashboard data |

## 🎨 Screenshots

### Landing Page
![Landing Page](https://via.placeholder.com/800x400)

### Login Page
![Login Page](https://via.placeholder.com/800x400)

### Member Dashboard
![Member Dashboard](https://via.placeholder.com/800x400)

### Admin Dashboard
![Admin Dashboard](https://via.placeholder.com/800x400)

## 🧪 Testing

### Backend Testing
\`\`\`bash
cd backend
npm test  # Coming soon
\`\`\`

### Frontend Testing
\`\`\`bash
cd frontend
npm test  # Coming soon
\`\`\`

## 🚢 Deployment

### Backend Deployment (Render/Heroku)
1. Push code to GitHub
2. Connect repository to Render/Heroku
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel/Netlify)
\`\`\`bash
cd frontend
npm run build
# Deploy the 'dist' folder to Vercel/Netlify
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Perfect Fitness Club for the opportunity
- Open source community for amazing tools

## 📞 Support

For support, email your-email@example.com or create an issue in the GitHub repository.

## 🗺️ Roadmap

- [x] Phase 1: Basic setup with authentication
- [ ] Phase 2: Member management
- [ ] Phase 3: Booking system
- [ ] Phase 4: Payment integration
- [ ] Phase 5: Analytics & Reports
- [ ] Phase 6: Mobile app
\`\`\`

## Step 3: Push to GitHub

Run these commands in your root project directory:

```powershell
cd D:\Code\GitHub Demo\smartgym-manager

# Initialize git if not already done
git init

# Add all files
git add .

# Commit the files
git commit -m "Initial commit: SmartGym Manager with OTP authentication and role-based access"

# Add your GitHub repository as remote
# Replace 'yourusername' with your GitHub username
git remote add origin https://github.com/yourusername/smartgym-manager.git

# Push to GitHub
git branch -M main
git push -u origin main