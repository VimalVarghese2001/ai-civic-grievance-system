import pandas as pd
import torch
import joblib
import numpy as np


from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, r2_score
from sklearn.ensemble import RandomForestRegressor

from transformers import BertTokenizer, BertForSequenceClassification, Trainer, TrainingArguments

# ---------------------------------
# STEP 1: Load Dataset
# ---------------------------------
df = pd.read_csv("complaints_realistic_final.csv")

print("Dataset Loaded Successfully")
print("Total Rows:", len(df))

# ---------------------------------
# STEP 2: Clean Data
# ---------------------------------
df = df.dropna(subset=["complaint_text", "categories", "priority_score"])
df = df.drop_duplicates()

# Convert categories string → list
df["categories"] = df["categories"].apply(lambda x: [c.strip() for c in x.split(",")])

X_text = df["complaint_text"]
y_categories = df["categories"]
y_priority = df["priority_score"]

# ---------------------------------
# STEP 3: Multi-label Encoding
# ---------------------------------
mlb = MultiLabelBinarizer()
y_multi = mlb.fit_transform(y_categories)

# 🔥 SAVE mlb for backend
joblib.dump(mlb, "models/label_binarizer.pkl")

# ---------------------------------
# STEP 4: Train-Test Split
# ---------------------------------
X_train, X_test, y_train, y_test = train_test_split(
    list(X_text), y_multi, test_size=0.2, random_state=42
)

# ---------------------------------
# STEP 5: Load BERT Tokenizer
# ---------------------------------
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")

train_encodings = tokenizer(X_train, truncation=True, padding=True, max_length=128)
test_encodings = tokenizer(X_test, truncation=True, padding=True, max_length=128)

# ---------------------------------
# STEP 6: Dataset Class
# ---------------------------------
class ComplaintDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item["labels"] = torch.tensor(self.labels[idx]).float()
        return item

    def __len__(self):
        return len(self.labels)

train_dataset = ComplaintDataset(train_encodings, y_train)
test_dataset = ComplaintDataset(test_encodings, y_test)

# ---------------------------------
# STEP 7: Load BERT Model
# ---------------------------------
model = BertForSequenceClassification.from_pretrained(
    "bert-base-uncased",
    num_labels=y_train.shape[1],
    problem_type="multi_label_classification"
)

# ---------------------------------
# STEP 8: Training Arguments
# ---------------------------------
training_args = TrainingArguments(
    output_dir="./results",
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    num_train_epochs=3,
    logging_dir="./logs",
    eval_strategy="epoch",
    save_strategy="no",
    learning_rate=2e-5
)

# ---------------------------------
# STEP 9: Trainer
# ---------------------------------
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=test_dataset
)

# ---------------------------------
# STEP 10: Train BERT Model
# ---------------------------------
print("\n🚀 Training BERT model...")
trainer.train()

# ---------------------------------
# STEP 11: Evaluate BERT
# ---------------------------------
predictions = trainer.predict(test_dataset)

probs = torch.sigmoid(torch.tensor(predictions.predictions))
y_pred = (probs > 0.5).int().numpy()

print("\nMulti-label Classification Report:")
print(classification_report(y_test, y_pred, zero_division=0))

# ---------------------------------
# STEP 12: PRIORITY MODEL (IMPORTANT)
# ---------------------------------

# 🔥 Convert text → embeddings using BERT
import numpy as np

def get_bert_embeddings(text_list, batch_size=32):
    all_embeddings = []

    for i in range(0, len(text_list), batch_size):
        batch = text_list[i:i+batch_size]

        inputs = tokenizer(
            batch,
            return_tensors="pt",
            truncation=True,
            padding=True,
            max_length=128
        )

        with torch.no_grad():
            outputs = model.bert(**inputs)

        embeddings = outputs.last_hidden_state[:, 0, :].numpy()
        all_embeddings.append(embeddings)

        print(f"Processed batch {i // batch_size + 1}")

    return np.vstack(all_embeddings)

print("\n🚀 Generating embeddings for priority model...")

X_embeddings = get_bert_embeddings(list(X_text))

# Train-test split for priority
X_train_p, X_test_p, y_train_p, y_test_p = train_test_split(
    X_embeddings, y_priority, test_size=0.2, random_state=42
)

# Train regressor
regressor = RandomForestRegressor(n_estimators=100, random_state=42)
regressor.fit(X_train_p, y_train_p)

# Predict
y_pred_p = regressor.predict(X_test_p)

print("\nPriority R2 Score:", r2_score(y_test_p, y_pred_p))

# ---------------------------------
# STEP 13: Save Models
# ---------------------------------
model.save_pretrained("models/bert_model")
tokenizer.save_pretrained("models/bert_tokenizer")
joblib.dump(regressor, "models/priority_model.pkl")

print("\n✅ All models trained and saved successfully!")