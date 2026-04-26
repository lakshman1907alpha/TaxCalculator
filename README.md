# TaxCalculator & Filing Assistant

A comprehensive MERN stack application designed to help users calculate their Indian income tax for FY 2024-25, compare regimes (Old vs. New), and get AI-powered tax advice.

## Features

- **Dual-Regime Calculation**: Accurate calculations for both Old and New Tax Regimes (FY 2024-25).
- **Regime Comparison**: Side-by-side comparison to help you choose the most beneficial regime.
- **AI Tax Assistant**: Personalized tax guidance and optimization tips using Google Gemini AI.
- **Document Extraction**: Upload Form 16 or salary slips to automatically extract income and deduction details.
- **Detailed Reports**: View a breakdown of your taxable income, deductions, and tax liability.
- **Export to PDF**: Download your tax reports for future reference.

## Tech Stack

- **Frontend**: React, Vite, Chart.js, Vanilla CSS.
- **Backend**: Node.js, Express.
- **Database**: MongoDB (via Mongoose).
- **AI Integration**: Google Gemini API.
- **PDF Generation**: jsPDF, html2canvas.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (Running locally or a MongoDB Atlas URI)
- [npm](https://www.npmjs.com/) (Comes with Node.js)

## Setup & Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd TaxCalculator
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory and add your API keys:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/tax-calculator
   GEMINI_API_KEY1=your_gemini_api_key_here
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Execution Instructions

### Running the Backend
In the `backend/` directory, start the server:
```bash
node server.js
```
The backend will run on `http://localhost:5000`.

### Running the Frontend
In the `frontend/` directory, start the development server:
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`.

## Project Structure

- `backend/`: Express server, API routes, models, and controllers.
- `frontend/`: React application with Vite, components, and pages.
- `frontend/src/pages/`: Main views (Dashboard, Calculate, Report, Compare).
- `backend/routes/`: API endpoints for AI, auth, calculations, and uploading.

## License
This project is for educational purposes.
