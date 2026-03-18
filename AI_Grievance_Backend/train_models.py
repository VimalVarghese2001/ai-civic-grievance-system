import pandas as pd
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.multioutput import MultiOutputClassifier
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, r2_score

# ---------------------------------
# STEP 1: Load Your Real Dataset
# ---------------------------------

# Change filename if needed
df = pd.read_csv("complaints_realistic_final.csv")

print("Dataset Loaded Successfully")
print("Total Rows:", len(df))

# ---------------------------------
# STEP 2: Prepare Data
# ---------------------------------

# Clean null values
df = df.dropna(subset=["complaint_text", "categories", "priority_score"])

# Convert categories from comma-separated string to list
df["categories"] = df["categories"].apply(lambda x: x.split(","))

X_text = df["complaint_text"]
y_categories = df["categories"]
y_priority = df["priority_score"]

# ---------------------------------
# STEP 3: Text Vectorization
# ---------------------------------

vectorizer = TfidfVectorizer(max_features=5000)
X = vectorizer.fit_transform(X_text)

# ---------------------------------
# STEP 4: Multi-label Classification
# ---------------------------------

mlb = MultiLabelBinarizer()
y_multi = mlb.fit_transform(y_categories)

X_train, X_test, y_train, y_test = train_test_split(
    X, y_multi, test_size=0.2, random_state=42
)

clf = MultiOutputClassifier(LogisticRegression(max_iter=1000))
clf.fit(X_train, y_train)

y_pred = clf.predict(X_test)

print("\nMulti-label Classification Report:")
print(classification_report(y_test, y_pred))

# ---------------------------------
# STEP 5: Priority Prediction
# ---------------------------------

X_train_p, X_test_p, y_train_p, y_test_p = train_test_split(
    X, y_priority, test_size=0.2, random_state=42
)

regressor = RandomForestRegressor(n_estimators=100, random_state=42)
regressor.fit(X_train_p, y_train_p)

y_pred_p = regressor.predict(X_test_p)

print("\nPriority R2 Score:", r2_score(y_test_p, y_pred_p))

# ---------------------------------
# STEP 6: Save Models
# ---------------------------------

joblib.dump(clf, "models/multilabel_model.pkl")
joblib.dump(regressor, "models/priority_model.pkl")
joblib.dump(vectorizer, "models/vectorizer.pkl")
joblib.dump(mlb, "models/label_binarizer.pkl")

print("\n✅ All models trained and saved successfully!")