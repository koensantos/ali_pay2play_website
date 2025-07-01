import pandas as pd
import os
import re
from difflib import SequenceMatcher

# Define the target names (first and last names)
target_names = [
    ("Jim", "McGreevey"),
    ("James", "Solomon"),
    ("Mussab", "Ali"),
    ("Bill", "O'Dea"),
    ("Joyce", "Wattermann"),
]

# Helper function to normalize names (lowercase, remove punctuation)
def normalize(name):
    return re.sub(r"[^\w\s]", "", name).lower().strip()

# Helper function to check similarity
def is_similar(name, first, last, threshold=0.8):
    name_norm = normalize(name)
    first_norm = normalize(first)
    last_norm = normalize(last)
    # Check if both first and last names are present
    if first_norm in name_norm and last_norm in name_norm:
        return True
    # Fuzzy match (optional)
    ratio = SequenceMatcher(None, f"{first_norm} {last_norm}", name_norm).ratio()
    return ratio >= threshold

# Load the Excel file
file_path = os.path.join(
    os.path.dirname(__file__),
    "candidate_contributions", "Combined_P2P_Contributions.xlsx"
)
df = pd.read_excel(file_path)

# Find similar recipient names
matches = set()
for name in df["Recipient_Name"].dropna():
    for first, last in target_names:
        if is_similar(name, first, last):
            matches.add(name)

# Output the results
print("Matching Recipient Names:")
for match in sorted(matches):
    print(match)