# 🏛️ AI-Based Public Grievance Trend Analysis System

## 📌 Description

An AI-powered web application designed to automate public grievance management and analyze complaint trends. The system uses Artificial Intelligence, Machine Learning, and Natural Language Processing (NLP) to classify public complaints, predict their priority, identify duplicate complaints, and help authorities understand recurring civic issues.

The project focuses on improving transparency, reducing manual workload, and supporting faster decision-making in public grievance redressal.

---

## 🚀 Features

- 👤 **User Authentication** – Secure user authentication using JWT.
- 📝 **Complaint Registration** – Citizens can submit public grievances with relevant details.
- 🤖 **AI-Based Complaint Classification** – Automatically identifies complaint categories using NLP and BERT-based text processing.
- ⚡ **Priority Prediction** – Uses Machine Learning to estimate complaint priority.
- 🔍 **Duplicate Complaint Detection** – Identifies similar or repeated complaints to reduce redundancy.
- 🏢 **Department Assignment** – Helps identify the appropriate department for handling complaints.
- 📊 **Trend Analysis** – Analyzes recurring complaints and identifies common public issues.
- 📍 **Location-Based Analysis** – Analyzes grievances based on district, local body, and ward.
- 📈 **Analytics Dashboard** – Provides visual insights into complaint statistics, categories, and trends.
- 🛠️ **Admin Management** – Supports centralized complaint monitoring and management.

---

## 🛠️ Tech Stack

### Frontend
- React.js
- HTML5
- CSS3
- JavaScript
- Bootstrap

### Backend
- Python
- Flask
- Flask REST APIs

### Database
- MongoDB
- MongoDB Atlas
- Flask-PyMongo

### Artificial Intelligence & Machine Learning
- Python
- Natural Language Processing (NLP)
- BERT (Bidirectional Encoder Representations from Transformers)
- Scikit-learn
- TF-IDF
- Machine Learning Classification
- Priority Prediction

### Authentication & Integration
- Flask-JWT-Extended
- Flask-CORS
- REST API

### Development Tools
- Visual Studio Code
- Git
- GitHub
- Postman

---

## 🧠 AI & Machine Learning Workflow

1. **Data Collection:** Collects public grievance records containing complaint descriptions, locations, categories, and other relevant information.
2. **Data Preprocessing:** Cleans and prepares complaint text for machine learning processing.
3. **Text Representation:** Processes complaint text using NLP techniques and BERT-based contextual representations.
4. **Complaint Classification:** Predicts the appropriate complaint category.
5. **Priority Prediction:** Estimates the priority level of complaints using machine learning.
6. **Duplicate Detection:** Identifies similar complaints to recognize repeated civic issues.
7. **Trend Analysis:** Analyzes complaint patterns across different locations and time periods.
8. **Visualization:** Presents analytical results through the dashboard.

---

## 📂 Dataset

The project uses a synthetic Kerala-based public grievance dataset.

The dataset contains fields such as:

- District
- Local Body Type
- Local Body Name
- Ward
- Complaint Text
- Category
- Priority Score
- Duplicate Count
- Citizen ID
- Assigned Departments
- Status
- Created Date
- Updated Date

This dataset helps the system analyze public complaints across different geographical locations and identify recurring civic issues.

---

## 📁 Project Structure

```text
AI-Based-Public-Grievance-Trend-Analysis/
│
├── AI_Grievance_Backend/
│   ├── app.py
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── ml_models/
│   ├── requirements.txt
│   └── ...
│
├── AI_Grievance_Frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
└── .gitignore
```

*Note: The folder and file structure above is illustrative. Adjust it to match the actual repository.*

---

## ⚙️ How to Run

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Backend Setup

Navigate to the backend folder:

```bash
cd AI_Grievance_Backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment:

**Windows:**
```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure your environment variables in a `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_secret_key
```

Start the Flask backend:

```bash
python app.py
```

### 3. Frontend Setup

Open another terminal and navigate to the frontend folder:

```bash
cd AI_Grievance_Frontend
```

Install dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm start
```

*Use the frontend start command defined in your package.json if it differs from `npm start`.*

---

## 🔮 Future Enhancements

- 🌐 Multilingual complaint classification.
- 📱 Mobile application integration.
- 🔔 Automated notifications and alerts.
- 🗺️ Advanced geographical heatmap visualization.
- 📊 Predictive analysis of emerging public grievances.
- 🎙️ Voice-based complaint registration.

---

## 🎯 Project Objective

The primary objective is to develop an intelligent public grievance management platform that uses AI and Machine Learning to automate complaint analysis, identify recurring issues, predict complaint priority, and support authorities in making data-driven decisions.

---

## 👨‍💻 Author

**Vimal Varghese**

- GitHub: [VimalVarghese2001](https://github.com/VimalVarghese2001)

---

⭐ If you find this project interesting, consider giving the repository a star!
