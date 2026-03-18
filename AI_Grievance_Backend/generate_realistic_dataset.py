import pandas as pd
import random

df = pd.read_csv("complaints11_multi.csv")

df["categories"] = df["categories"].apply(lambda x: [c.strip().lower() for c in x.split(",")])

# ---------------------------------
# Detailed real-life complaint parts
# ---------------------------------

problem_descriptions = {
    "road": [
        "the roads in our area have become extremely damaged with deep potholes",
        "many parts of the street are broken and causing trouble for vehicles",
        "people are finding it difficult to travel due to poor road condition",
        "the situation has become worse especially during rainy days"
    ],
    "water": [
        "we are not getting proper water supply for the past few days",
        "water availability has reduced significantly in our locality",
        "sometimes there is no water at all during important hours",
        "residents are struggling to manage daily household activities"
    ],
    "electricity": [
        "there are frequent power cuts happening throughout the day",
        "voltage fluctuations are damaging our home appliances",
        "electricity supply is very unreliable in this area",
        "we are facing continuous outages without any notice"
    ],
    "waste": [
        "garbage has not been collected for many days",
        "waste is piling up near houses and roadsides",
        "the area has become very unhygienic and smells bad",
        "sanitation services are not working properly"
    ],
    "drain": [
        "drainage system is completely blocked in our area",
        "dirty water is overflowing onto the streets",
        "there is water stagnation after even small rainfall",
        "this is creating a serious mosquito problem"
    ]
}

# ---------------------------------
# Human-like context additions
# ---------------------------------

openings = [
    "I am writing to bring attention to an issue in our locality.",
    "This complaint is regarding a serious problem we are facing.",
    "I would like to report a problem that has been ongoing for some time.",
    "We are facing difficulties in our area and need help.",
]

middle_connectors = [
    "Because of this,",
    "Due to this issue,",
    "As a result,",
    "This has led to a situation where",
]

impacts = [
    "people are facing a lot of inconvenience in daily life",
    "it is becoming difficult for residents to manage routine activities",
    "this is affecting health and safety of the people",
    "many families are struggling because of this situation",
]

endings = [
    "I kindly request the concerned authorities to take necessary action as soon as possible.",
    "Please look into this matter urgently and resolve it.",
    "We hope this issue will be addressed at the earliest.",
    "Immediate action would be highly appreciated.",
]

# ---------------------------------
# Generate realistic complaint
# ---------------------------------

def generate_text(categories):
    text_parts = []

    # Opening
    text_parts.append(random.choice(openings))

    # Add 1–2 problem descriptions per category
    for cat in categories:
        if cat in problem_descriptions:
            desc = random.sample(problem_descriptions[cat], k=2)
            text_parts.extend(desc)

    # Add connector + impact
    text_parts.append(random.choice(middle_connectors))
    text_parts.append(random.choice(impacts))

    # Ending
    text_parts.append(random.choice(endings))

    return " ".join(text_parts)

# Apply
df["complaint_text"] = df["categories"].apply(generate_text)

# Convert back to string
df["categories"] = df["categories"].apply(lambda x: ",".join(x))

# Save
df.to_csv("complaints_realistic_final.csv", index=False)

print("✅ Realistic long complaint dataset generated!")