<div align="center">

# 🏭 InventFlow — Enterprise Inventory Management System

### A full-stack, production-grade inventory & supply chain management platform built with the MERN stack.

[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

<br/>

**60+ Users · 20 Suppliers · 5 Warehouses · 350 Products · 550+ Sales · Real-Time Analytics**

---

</div>

## 📌 Overview

**InventFlow** is a comprehensive, enterprise-grade inventory management system designed to handle the complete lifecycle of product management — from supplier procurement to warehouse storage, sales transactions, and financial analytics. Built as a single-page application with a RESTful API backend, it demonstrates proficiency in full-stack development, database design, authentication systems, and modern UI/UX principles.

> This is not a tutorial project. It is a **production-ready business tool** with role-based access control, automated alerting, PDF invoice generation, and real-time profit analytics.

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 📊 Real-Time Analytics Dashboard
- Revenue vs. Net Profit trend charts (30-day)
- Top-selling products visualization
- Low stock alert counter with clickable navigation
- Live activity feed tracking all system actions

### 🏢 Multi-Warehouse Management
- Manage inventory across 5+ warehouse locations
- Track capacity, managers, and stock per facility
- Assign products to specific warehouses

### 🚢 Purchase Order Workflow
- Full lifecycle: `Pending → Shipped → Received`
- Auto-updates product stock on "Received"
- Multi-item orders with cost tracking

### 📱 QR Code & Product Tracking
- Auto-generated QR codes for every product
- Complete activity timeline per product
- Audit trail: who changed what and when

</td>
<td width="50%">

### 🔐 Role-Based Access Control (RBAC)
- **Admin**: Full system access, employee management
- **Worker**: Record sales, manage inventory
- **Staff**: View-only access to dashboards
- JWT-based authentication with secure cookies

### 💰 Financial Intelligence
- Cost Price vs. Selling Price tracking
- Tax (GST/VAT) and Discount engine
- Per-product profit margin analysis
- "Days Until Out of Stock" forecasting

### 📄 Professional PDF Invoicing
- One-click branded invoice generation
- Itemized line items with tax breakdown
- Auto-calculated totals

### 📥 Bulk Operations
- CSV Import (upload hundreds of products)
- CSV Export (one-click inventory download)
- Automated low-stock email alerts via SMTP

</td>
</tr>
</table>

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │Dashboard │ │Inventory │ │  Sales   │ │  Purchase  │  │
│  │Analytics │ │  + QR    │ │+ Invoice │ │   Orders   │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │Suppliers │ │Warehouses│ │Employees │ │  Profile   │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │
├─────────────────────────────────────────────────────────┤
│                    REST API (Express.js)                  │
│  Auth · Products · Sales · Suppliers · Warehouses · POs  │
│  Activities · Users · CSV Import · Email Alerts          │
├─────────────────────────────────────────────────────────┤
│                    DATABASE (MongoDB)                     │
│  Users · Products · Sales · Suppliers · Warehouses       │
│  PurchaseOrders · Activities                             │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18, Vite, Tailwind CSS | SPA with responsive design |
| **Charts** | Recharts | Interactive analytics visualizations |
| **Icons** | Lucide React | Modern, consistent iconography |
| **QR Codes** | qrcode.react | Product identification system |
| **PDF** | jsPDF + jspdf-autotable | Invoice generation |
| **Notifications** | react-hot-toast | Real-time UI feedback |
| **Backend** | Node.js, Express.js | RESTful API server |
| **Database** | MongoDB, Mongoose | Document-based data storage |
| **Auth** | JWT, bcrypt | Secure authentication & hashing |
| **Email** | Nodemailer | Automated low-stock alerts |
| **File Upload** | Multer, csv-parser | Bulk CSV import support |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ 
- **MongoDB** (local instance or Atlas cloud)
- **npm** or **yarn**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/sujalkhamar/Inventory_Management.git
cd Inventory_Management

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install
```

### Environment Setup

Create a `backend/.env` file:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/inventory_db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d

# Email (for low-stock alerts)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=your_email
SMTP_PASSWORD=your_password
ADMIN_EMAIL=admin@yourcompany.com
```

### Seed the Database

```bash
cd backend
node seeder.js
```

This populates the system with **60 users, 20 suppliers, 5 warehouses, 350 products, and 550+ sales** for a complete demo experience.

### Run the Application

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 🔴 Admin | `admin@company.com` | `password123` |
| 🟡 Worker | `emma.johnson1@company.com` | `password123` |
| 🟢 Staff | `owen.perez35@company.com` | `password123` |

---

## 📂 Project Structure

```
Inventory_Management/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Business logic (8 controllers)
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── saleController.js
│   │   ├── supplierController.js
│   │   ├── warehouseController.js
│   │   ├── purchaseOrderController.js
│   │   └── ...
│   ├── middleware/       # Auth guards, error handling
│   ├── models/           # Mongoose schemas (7 models)
│   ├── routes/           # API endpoints
│   ├── utils/            # Logger, email, error helpers
│   ├── seeder.js         # Database population script
│   └── server.js         # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Sidebar, Header, Skeleton
│   │   ├── context/      # AuthContext (global state)
│   │   ├── pages/        # 10 full pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── Sales.jsx
│   │   │   ├── Suppliers.jsx
│   │   │   ├── Warehouses.jsx
│   │   │   ├── PurchaseOrders.jsx
│   │   │   ├── ProductAnalytics.jsx
│   │   │   ├── Employees.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Login.jsx
│   │   └── App.jsx
│   └── index.html
│
└── README.md
```

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/api/auth/register` | Register new user | Public |
| `POST` | `/api/auth/login` | Login & get JWT | Public |
| `GET` | `/api/auth/me` | Get current user | Private |

### Products
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/products?page=1&limit=10&search=laptop&filter=lowstock` | Get products (paginated, searchable) | Private |
| `POST` | `/api/products` | Create product | Admin/Worker |
| `POST` | `/api/products/import` | Bulk CSV import | Admin |
| `PUT` | `/api/products/:id` | Update product | Admin |
| `DELETE` | `/api/products/:id` | Delete product | Admin |

### Sales
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/sales` | Get all sales | Private |
| `POST` | `/api/sales` | Record sale (with tax/discount) | Admin/Worker |
| `GET` | `/api/sales/analytics` | Dashboard analytics | Private |

### Purchase Orders
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/purchase-orders` | Get all POs | Private |
| `POST` | `/api/purchase-orders` | Create PO | Admin |
| `PUT` | `/api/purchase-orders/:id/status` | Update PO status | Admin |

### Suppliers · Warehouses · Users · Activities
> Full CRUD endpoints available for all entities. See source code for details.

---

## 💡 Technical Highlights

- **Server-Side Pagination** — Efficient handling of 350+ products without loading all into memory
- **MongoDB Aggregation Pipelines** — Complex analytics (revenue trends, top products, profit margins) computed at the database level
- **Activity Audit Trail** — Every create, update, delete, and sale is logged with user attribution and timestamps
- **Automated Email Alerts** — When stock drops below threshold, the admin receives an instant email notification via Nodemailer
- **Inventory Forecasting** — "Days until out of stock" prediction based on 30-day moving average sales velocity
- **Tax & Discount Engine** — Server-side calculation of GST/VAT tax and percentage-based discounts with proper profit computation
- **Purchase Order Automation** — Marking a PO as "Received" automatically increments product stock quantities

---

## 🎨 UI/UX Design

- **Dark/Light Mode** — Persistent theme toggle with `localStorage`
- **Skeleton Loading** — Smooth loading states across all pages
- **Toast Notifications** — Non-intrusive feedback for every action
- **Responsive Design** — Mobile-first layout with collapsible sidebar
- **Interactive Charts** — Hover tooltips, gradient fills, dual-axis comparisons
- **Card-Based Layouts** — Supplier and warehouse management with hover-reveal actions

---

## 📈 Future Roadmap

- [ ] Cloud storage integration (AWS S3) for product images
- [ ] Progressive Web App (PWA) for offline mobile access
- [ ] Barcode scanner integration via device camera
- [ ] Employee performance leaderboard
- [ ] Multi-currency support
- [ ] Automated monthly PDF report generation
- [ ] Data science and machine learning upgrade for predictive inventory intelligence

### Planned Data Science Integration

The next major evolution of **InventFlow** is an intelligence layer that turns historical inventory and sales activity into forward-looking operational decisions. This upgrade is designed to move the platform beyond reporting and into prediction, recommendation, and proactive planning.

#### Target Capabilities

- **Demand Forecasting** — Predict future product demand from historical sales patterns, seasonality, and warehouse activity
- **Smart Stock Alerts** — Detect likely stockout risks before thresholds are crossed
- **Intelligent Restocking** — Recommend reorder quantities using consumption velocity, supplier lead time, and safety stock rules
- **Analytics Dashboard Upgrade** — Expose trend projections, forecast accuracy, and actionable business insights in the UI
- **Recommendation System** — Highlight high-demand and frequently co-purchased products for purchasing and sales teams

#### Why This Matters

- Improve inventory planning accuracy
- Reduce emergency stockouts and overstocking
- Support faster purchasing decisions with data-backed recommendations
- Give managers a clearer view of future sales and replenishment risk

#### Implementation Direction

This enhancement will be introduced incrementally so the existing MERN application remains stable while intelligence features are added in phases:

1. **Data Foundation** — Expand product, sales, supplier, and purchase-order data quality for model-ready time series inputs
2. **Prediction Services** — Add backend forecasting and replenishment services that operate on historical transaction data
3. **Operational Alerts** — Surface stock-risk signals and recommended actions through API endpoints and dashboard widgets
4. **Decision Support UI** — Add forecast charts, replenishment recommendations, and recommendation panels to the frontend
5. **Model Monitoring** — Track forecast accuracy and retraining cadence as live business data evolves

For the detailed rollout plan, see [DATA_SCIENCE_ROADMAP.md](./DATA_SCIENCE_ROADMAP.md).

---

## 👨‍💻 Author

**Sujal Khamar**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sujalkhamar)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/sujalkhamar)

---

<div align="center">

### ⭐ If you found this project impressive, please consider giving it a star!

*Built with ❤️ using the MERN Stack*

</div>
