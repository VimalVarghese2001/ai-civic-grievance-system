from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from services.ml_service import vectorizer

mongo = None  # will be assigned from app.py


def check_duplicate_and_escalate(new_text, base_priority, threshold=0.75):
    """
    Detect duplicates and escalate priority.
    """

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

    new_vector = vectorizer.transform([new_text])
    existing_vectors = vectorizer.transform(texts)

    similarities = cosine_similarity(new_vector, existing_vectors)[0]

    # Count how many are above threshold
    duplicate_count = int(np.sum(similarities >= threshold))

    if duplicate_count > 0:
        escalated_priority = base_priority + (duplicate_count * 5)
        escalated_priority = min(escalated_priority, 100)  # cap at 100

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