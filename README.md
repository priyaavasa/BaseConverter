# BaseConverter

A web-based application that converts numbers between Binary, Decimal, Octal, and Hexadecimal systems. Built using Angular for the frontend and Node.js with Express for the backend. It also includes a detailed step-by-step explanation and history logging feature.

---

## 📌 Features

- Convert numbers between Binary, Decimal, Octal, and Hexadecimal
- Shows **step-by-step explanation** of the conversion process
- Saves conversion history with timestamp
- Clean, animated UI built with Angular
- Fully responsive design
- Error handling for invalid inputs
- Backend built with Node.js and Express
- History stored locally in `history.json` file

---

## 🧠 How It Works (Flow)

1. User enters a number, selects "From Base" and "To Base"
2. Angular sends a POST request to the backend API `/convert`
3. Backend:
   - Validates and parses input using `parseInt(number, fromBase)`
   - Converts it to target base using `.toString(toBase)`
   - Saves conversion details with timestamp to `history.json`
4. Backend returns result to frontend
5. Frontend displays:
   - Final result
   - Animated **step-by-step breakdown**
6. History can be viewed through a separate API call to `/history`

---

## 🚀 Tech Stack

| Layer      | Technology                    |
| ---------- | ----------------------------- |
| Frontend   | Angular                       |
| Backend    | Node.js, Express              |
| Styling    | HTML, CSS, Angular Animations |
| Data Store | JSON file (`history.json`)    |

---

## 🛠️ Installation & Setup

### 🔧 Frontend Setup

```bash
Install dependencies:
cd Number_system
npm install
ng serve

```

### 📦 Backend Setup
install node.js
node backend/server.js


```bash
cd Number_system
npm install
node backend/server.js
```
