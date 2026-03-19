import os
import joblib
import torch
from transformers import BertTokenizer, BertForSequenceClassification

# -------------------------
# Load Models
# -------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

tokenizer = BertTokenizer.from_pretrained(os.path.join(BASE_DIR, "models/bert_tokenizer"))
model = BertForSequenceClassification.from_pretrained(os.path.join(BASE_DIR, "models/bert_model"))

label_binarizer = joblib.load(os.path.join(BASE_DIR, "models/label_binarizer.pkl"))
priority_model = joblib.load(os.path.join(BASE_DIR, "models/priority_model.pkl"))

model.eval()

# -------------------------
# Prediction Function
# -------------------------
def predict_complaint(text):

    # -------- 1. TOKENIZE --------
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=128
    )

    # -------- 2. CATEGORY (BERT) --------
    with torch.no_grad():
        outputs = model(**inputs)

    probs = torch.sigmoid(outputs.logits)
    preds = (probs > 0.5).int().numpy()

    categories = label_binarizer.inverse_transform(preds)

    # -------- 3. EMBEDDING --------
    with torch.no_grad():
        bert_outputs = model.bert(**inputs)

    embedding = bert_outputs.last_hidden_state[:, 0, :].numpy()

    # -------- 4. PRIORITY --------
    priority = priority_model.predict(embedding)[0]

    return {
        "predicted_categories": list(categories[0]),
        "predicted_priority": round(float(priority), 2)
    }