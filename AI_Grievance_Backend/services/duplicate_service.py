import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from transformers import BertTokenizer, BertModel
import torch

tokenizer = BertTokenizer.from_pretrained("models/bert_tokenizer")
bert_model = BertModel.from_pretrained("models/bert_model")

mongo = None

def get_embedding(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128)
    
    with torch.no_grad():
        outputs = bert_model(**inputs)
    
    return outputs.last_hidden_state[:, 0, :].numpy()


def check_duplicate_and_escalate(new_text, base_priority, threshold=0.8):

    existing_complaints = list(
        mongo.db.complaints.find({}, {"complaint_text": 1})
    )

    if not existing_complaints:
        return {
            "is_duplicate": False,
            "duplicate_count": 0,
            "final_priority": base_priority
        }

    texts = [c["complaint_text"] for c in existing_complaints]

    new_vec = get_embedding(new_text)
    existing_vecs = np.vstack([get_embedding(t) for t in texts])

    similarities = cosine_similarity(new_vec, existing_vecs)[0]

    duplicate_count = int(np.sum(similarities >= threshold))

    if duplicate_count > 0:
        escalated_priority = base_priority + (duplicate_count * 5)
        escalated_priority = min(escalated_priority, 100)

        return {
            "is_duplicate": True,
            "duplicate_count": duplicate_count,
            "final_priority": round(float(escalated_priority), 2)
        }
    else:
        return {
            "is_duplicate": False,
            "duplicate_count": 0,
            "final_priority": base_priority
        }