📱 SellPhone – End-to-End Phone Resale Platform

SellPhone is a full-stack production-ready phone resale system where:

👤 Users submit sell requests

🛠 Admin approves and assigns riders

🏍 Rider verifies device and completes pickup

📦 Inventory is automatically created after completion

The system follows a strict workflow lifecycle to prevent status inconsistencies and broken business logic.

🚀 Tech Stack
Backend

Node.js

Express.js

MongoDB (Mongoose)

Multer (file uploads)

JWT / Session-based auth

Transaction support (MongoDB sessions)

Frontend (Admin + User)

React

TailwindCSS

React Router

Fetch API

Rider Panel

React-based rider dashboard

OTP authentication

Pickup verification flow

📂 Project Folder Structure
SellPhone/
│
├── server/
│   ├── controllers/
│   │   ├── sellRequest.controller.js
│   │   ├── riderAuth.controller.js
│   │   └── adminController.js
│   │
│   ├── middleware/
│   │   ├── adminAuth.js
│   │   ├── userAuth.js
│   │   └── riderAuth.js
│   │
│   ├── models/
│   │   ├── SellRequest.js
│   │   ├── Rider.js
│   │   └── InventoryItem.js
│   │
│   ├── routes/
│   │   ├── sellRequest.routes.js
│   │   ├── adminSellRequest.routes.js
│   │   ├── rider.routes.js
│   │   └── admin.routes.js
│   │
│   ├── utils/
│   │   ├── priceRules.js
│   │   └── adminAlert.js
│   │
│   ├── uploads/
│   │   ├── sell/
│   │   └── pickups/
│   │
│   └── server.js
│
├── client/        (User + Admin React App)
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── config/
│   │   └── redux/
│   └── vite.config.js
│
├── rider-client/  (Rider App)
│   └── src/
│
├── .env
├── package.json
└── README.md

🔄 Workflow Lifecycle (Core Logic)

The system uses a strict workflowStatus state machine:

CREATED
   ↓
ADMIN_APPROVED
   ↓
ASSIGNED_TO_RIDER
   ↓
UNDER_VERIFICATION
   ↓
USER_ACCEPTED
   ↓
COMPLETED


Additional branches:

REJECTED_BY_RIDER

ESCALATED

CANCELLED

All transitions are controlled using:

request.transitionStatus(newStatus, changedBy, note)


This prevents illegal status changes in production.

👤 User Flow

User submits sell request (min 3 images required)

Admin approves

Rider assigned

Rider verifies device

User accepts final price

Rider completes pickup

Inventory item is created

🛠 Admin Features

View all sell requests

Approve / Reject requests

Assign / Reassign rider (before verification)

View rejection reasons

Strict lifecycle enforcement

Status history tracking

🏍 Rider Features

OTP login

View assigned pickups

Upload verification images

Generate final price

Reject pickup (with reason)

Complete pickup

Track earnings

📦 Inventory Logic

When pickup is completed:

InventoryItem is created (or upserted)

Purchase price = final verified price

Condition is normalized

Rider payout calculated

All done inside MongoDB transaction.

🔐 Security Design

Role-based middleware:

adminAuth

userAuth

riderAuth

Status lifecycle prevents illegal manipulation

Server-side validation enforced

Rider cannot access unassigned pickup

Admin cannot change status after verification

🗄 Database Schema Highlights
SellRequest

workflowStatus (strict enum)

admin status

assignedRider

pickup details

verification details

rider payout

statusHistory audit log

Rider

name

phone

status (active/inactive)

InventoryItem

phone details

purchase price

stock status

🧪 Local Development Setup
1️⃣ Clone Project
git clone https://github.com/AltamashRaza3/SellPhone.git
cd SellPhone

2️⃣ Install Dependencies

Backend:

cd server
npm install


Frontend:

cd client
npm install

3️⃣ Environment Variables (.env)

Backend:

PORT=5000
MONGO_URI=your_mongo_connection
JWT_SECRET=your_secret


Frontend:

VITE_API_BASE_URL=http://localhost:5000

4️⃣ Start Development

Backend:

npm run dev


Frontend:

npm run dev

🚀 Production Deployment Checklist

 Enable MongoDB indexes

 Configure environment variables

 Secure CORS settings

 Use HTTPS

 Enable file upload size limits

 Enable logging & monitoring

 Backup strategy enabled

 Ensure lifecycle validation active

📊 Business Rules

Rider can be reassigned before verification starts

User cannot cancel after approval

Admin cannot approve twice

Verification requires images

Final price required before completion

Completion auto-creates inventory

🧠 Architecture Philosophy

This project follows:

Strict state machine workflow

Backend-first validation

Immutable audit history

Production-safe transitions

Clear role separation

👨‍💻 Author

Altamash Raza
Full Stack Developer
