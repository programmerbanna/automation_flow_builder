# 🚀 Automation Flow Builder

A powerful visual automation platform that allows you to create, manage, and execute email automation workflows with a drag-and-drop interface. Built with modern web technologies including Next.js, React Flow, Express, and MongoDB.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Features

- 🎨 **Visual Flow Editor** - Drag-and-drop interface powered by React Flow
- 📧 **Email Automation** - Send automated emails based on workflow logic
- ⏱️ **Delay Nodes** - Schedule delays (relative or absolute time)
- 🔀 **Conditional Branching** - Create complex logic with TRUE/FALSE paths
- 🔄 **Undo/Redo** - Full history management with Ctrl+Z/Ctrl+Y
- 🔗 **Auto-Healing Flows** - Automatically reconnect edges when nodes are deleted
- ✅ **Flow Validation** - Comprehensive validation before execution
- 🧪 **Test Runs** - Execute automations with test emails
- 📊 **Execution Logs** - Track every step of automation execution

### Advanced Features

- **Multi-Rule Conditions** - Complex AND/OR logic for email routing
- **Real-time Execution** - Background processing with live status updates
- **Execution Safeguards** - Prevent infinite loops and resource abuse
- **Execution Summary** - Detailed reports of automation runs
- **Custom Modals & Toasts** - Premium UI/UX for notifications
- **Email Preview** - View sent emails via Ethereal Email service

---

## 🛠️ Tech Stack

### Frontend

- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Flow Editor:** React Flow (@xyflow/react)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **State Management:** React Hooks

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose
- **Email Service:** Nodemailer (with Ethereal for testing)
- **Validation:** Custom flow validator
- **Process Management:** Background execution with async/await

### Development Tools

- **Build Tool:** TypeScript Compiler (tsc)
- **Dev Server:** tsx (backend), Next.js dev (frontend)
- **Code Quality:** ESLint, TypeScript strict mode
- **Version Control:** Git

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Flow Editor  │  │ Automation   │  │  Test Run    │      │
│  │   (React     │  │   Dashboard  │  │   Monitor    │      │
│  │    Flow)     │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │ HTTP/REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend (Express)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Automation   │  │ Test Run     │  │ Flow         │      │
│  │ Controller   │  │ Controller   │  │ Validator    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                            │                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Automation   │  │ Condition    │  │ Email        │      │
│  │ Runner       │  │ Evaluator    │  │ Service      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      MongoDB Database                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Automations  │  │ Test Runs    │  │ Execution    │      │
│  │              │  │              │  │ Logs         │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User creates automation** → Frontend sends flow data to backend
2. **Backend validates** → Checks structure, connectivity, and rules
3. **User triggers test** → Backend starts background execution
4. **Automation runs** → Processes nodes sequentially (Action, Delay, Condition)
5. **Emails sent** → Nodemailer sends emails via SMTP
6. **Logs created** → Each step logged to database
7. **Summary generated** → Execution summary saved to test run

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **npm** (v7.0.0 or higher)
- **MongoDB** (v4.4 or higher)
  - Local installation OR
  - MongoDB Atlas account (cloud)
- **Git** (for cloning the repository)

### Optional

- **MongoDB Compass** (GUI for database inspection)
- **Postman** (for API testing)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/automation-flow-builder.git
cd automation-flow-builder
```

### 2. Install Dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd ../frontend
npm install
```

### 3. Set Up MongoDB

**Option A: Local MongoDB**

```bash
# Start MongoDB service
mongod

# Or on Windows (if installed as service)
net start MongoDB
```

**Option B: MongoDB Atlas**

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Use it in the `.env` file (next step)

---

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
touch .env  # or create manually on Windows
```

Add the following configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/automation-flow-builder
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/automation-flow-builder

# CORS
CORS_ORIGIN=http://localhost:3000

# Email Configuration (Optional - uses Ethereal if not provided)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
# SMTP_FROM="Automation Flow <your-email@gmail.com>"
```

### Frontend Environment Variables (Optional)

Create a `.env.local` file in the `frontend` directory if you need custom configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Email Configuration Notes

**Using Ethereal (Default - Recommended for Testing)**

- No configuration needed
- Automatically creates test accounts
- Preview URLs appear in backend console
- Perfect for development and testing

**Using Gmail**

1. Enable 2-Factor Authentication
2. Generate an App Password
3. Use the app password in `SMTP_PASS`

**Using Other SMTP Providers**

- Update `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` accordingly

---

## 🎬 Running the Application

### Option 1: Run Both Servers Simultaneously (Recommended)

From the project root:

```bash
npm run dev
```

This starts:

- **Backend** on `http://localhost:5000`
- **Frontend** on `http://localhost:3000`

### Option 2: Run Servers Separately

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

### Option 3: Production Build

**Backend:**

```bash
cd backend
npm run build
npm start
```

**Frontend:**

```bash
cd frontend
npm run build
npm start
```

### Verify Installation

1. **Backend Health Check:**
   - Open: `http://localhost:5000/api/health`
   - Expected: `{"status":"ok","message":"Automation Flow Builder API","timestamp":"..."}`

2. **Frontend:**
   - Open: `http://localhost:3000/automations`
   - Expected: Automation Dashboard (empty initially)

---

## 📁 Project Structure

```
automation-flow-builder/
├── backend/                      # Backend Express application
│   ├── src/
│   │   ├── controllers/          # Request handlers
│   │   │   ├── automationController.ts
│   │   │   └── testRunController.ts
│   │   ├── models/               # Mongoose schemas
│   │   │   ├── Automation.ts
│   │   │   ├── AutomationTestRun.ts
│   │   │   └── AutomationExecutionLog.ts
│   │   ├── routes/               # API routes
│   │   │   ├── automationRoutes.ts
│   │   │   └── testRunRoutes.ts
│   │   ├── services/             # Business logic
│   │   │   └── automationRunner.ts
│   │   ├── utils/                # Utility functions
│   │   │   ├── conditionEvaluator.ts
│   │   │   ├── flowValidator.ts
│   │   │   ├── mailer.ts
│   │   │   └── sleep.ts
│   │   ├── types/                # TypeScript types
│   │   │   └── index.ts
│   │   ├── app.ts                # Express app setup
│   │   └── server.ts             # Server entry point
│   ├── .env                      # Environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                     # Frontend Next.js application
│   ├── src/
│   │   ├── app/                  # Next.js app router
│   │   │   ├── automations/      # Automation pages
│   │   │   │   ├── [id]/         # Edit automation page
│   │   │   │   ├── new/          # Create automation page
│   │   │   │   └── page.tsx      # Automation list page
│   │   │   ├── globals.css       # Global styles
│   │   │   ├── layout.tsx        # Root layout
│   │   │   └── page.tsx          # Home page
│   │   ├── components/           # React components
│   │   │   ├── flow/             # Flow editor components
│   │   │   │   ├── nodes/        # Custom node types
│   │   │   │   │   ├── StartNode.tsx
│   │   │   │   │   ├── EndNode.tsx
│   │   │   │   │   ├── ActionNode.tsx
│   │   │   │   │   ├── DelayNode.tsx
│   │   │   │   │   └── ConditionNode.tsx
│   │   │   │   ├── AddNodeEdge.tsx
│   │   │   │   └── FlowEditor.tsx
│   │   │   ├── AutomationTable.tsx
│   │   │   ├── ConfirmModal.tsx
│   │   │   ├── PromptModal.tsx
│   │   │   └── Toast.tsx
│   │   ├── context/              # React context providers
│   │   │   ├── ModalContext.tsx
│   │   │   └── ToastContext.tsx
│   │   ├── lib/                  # Utilities and API
│   │   │   └── api.ts
│   │   └── types/                # TypeScript types
│   │       └── flow.ts
│   ├── public/                   # Static assets
│   ├── .env.local                # Environment variables
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── package.json                  # Root package.json (scripts)
├── TESTING_GUIDE.md              # Comprehensive testing guide
└── README.md                     # This file
```

---

## 📡 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Endpoints

#### Automations

**Create Automation**

```http
POST /automations
Content-Type: application/json

{
  "name": "Welcome Email Flow",
  "nodes": [...],
  "edges": [...]
}
```

**Get All Automations**

```http
GET /automations
```

**Get Automation by ID**

```http
GET /automations/:id
```

**Update Automation**

```http
PUT /automations/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "nodes": [...],
  "edges": [...]
}
```

**Delete Automation**

```http
DELETE /automations/:id
```

#### Test Runs

**Start Test Run**

```http
POST /automations-test/:id/test
Content-Type: application/json

{
  "email": "test@example.com"
}
```

**Get Test Run Status**

```http
GET /test-runs/:id
```

**Get Execution Summary**

```http
GET /automations-test/:id/summary
```

**Get Execution Logs**

```http
GET /automations-test/:id/logs
```

**Get All Test Runs for Automation**

```http
GET /automations/:id/test-runs
```

### Response Format

**Success Response:**

```json
{
  "success": true,
  "data": { ... },
  "count": 10  // Optional, for list endpoints
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

---

## 🧪 Testing

### Quick Test

Follow the comprehensive [TESTING_GUIDE.md](./TESTING_GUIDE.md) for detailed testing scenarios.

### Manual Testing Steps

1. **Start the application**

   ```bash
   npm run dev
   ```

2. **Create a simple automation**
   - Navigate to `http://localhost:3000/automations`
   - Click "Create New Automation"
   - Add Action and Delay nodes
   - Save

3. **Run a test**
   - Click "Test" on your automation
   - Enter a test email
   - Monitor backend console for execution logs

4. **View email preview**
   - Check backend console for Ethereal preview URL
   - Click the URL to view the sent email

### Unit Testing (Future Enhancement)

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

---

## 🚢 Deployment

### Backend Deployment (Example: Heroku)

1. **Prepare for production**

   ```bash
   cd backend
   npm run build
   ```

2. **Set environment variables**
   - Set `NODE_ENV=production`
   - Set `MONGODB_URI` to production database
   - Configure real SMTP credentials

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Frontend Deployment (Example: Vercel)

1. **Build the application**

   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel**

   ```bash
   vercel --prod
   ```

3. **Set environment variables**
   - `NEXT_PUBLIC_API_URL` to your backend URL

### Docker Deployment (Optional)

Create `docker-compose.yml`:

```yaml
version: "3.8"
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/automation-flow-builder
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:5000
    depends_on:
      - backend

volumes:
  mongo-data:
```

Run with:

```bash
docker-compose up
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Coding Standards

- Use TypeScript for all new code
- Follow existing code style
- Add comments for complex logic
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **React Flow** - For the amazing flow editor library
- **Next.js Team** - For the incredible React framework
- **MongoDB** - For the flexible database solution
- **Nodemailer** - For email sending capabilities
- **Ethereal Email** - For testing email functionality

---

## 📞 Support

For questions, issues, or feature requests:

- **Issues:** [GitHub Issues](https://github.com/yourusername/automation-flow-builder/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/automation-flow-builder/discussions)
- **Email:** support@example.com

---

## 🗺️ Roadmap

### Planned Features

- [ ] User authentication and authorization
- [ ] Webhook triggers
- [ ] Scheduled automations (cron-like)
- [ ] More node types (SMS, Slack, etc.)
- [ ] Template library
- [ ] Analytics dashboard
- [ ] Export/Import automations
- [ ] Version control for flows
- [ ] Collaboration features
- [ ] API rate limiting
- [ ] Advanced email templates with HTML

---

## 📊 Performance

- **Concurrent Executions:** Supports multiple test runs simultaneously
- **Database:** Indexed queries for fast retrieval
- **Background Processing:** Non-blocking automation execution
- **Safeguards:** Prevents infinite loops and resource abuse

---

## 🔒 Security

- **Input Validation:** All inputs validated on backend
- **CORS Protection:** Configured for specific origins
- **Environment Variables:** Sensitive data in `.env` files
- **Error Handling:** Detailed errors only in development mode

---

**Built with ❤️ by the Automation Team**

_Last Updated: January 2026_
