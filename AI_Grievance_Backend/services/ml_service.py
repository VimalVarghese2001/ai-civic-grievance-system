import joblib
import os

# Load models once when server starts
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

multilabel_model = joblib.load(os.path.join(BASE_DIR, "models/multilabel_model.pkl"))
priority_model = joblib.load(os.path.join(BASE_DIR, "models/priority_model.pkl"))
vectorizer = joblib.load(os.path.join(BASE_DIR, "models/vectorizer.pkl"))
label_binarizer = joblib.load(os.path.join(BASE_DIR, "models/label_binarizer.pkl"))


def predict_complaint(text):
    # Convert text to vector
    X = vectorizer.transform([text])

    # Predict categories
    category_pred = multilabel_model.predict(X)
    categories = label_binarizer.inverse_transform(category_pred)

    # Predict priority
    priority = priority_model.predict(X)[0]

    return {
        "predicted_categories": list(categories[0]),
        "predicted_priority": round(float(priority), 2)
    }