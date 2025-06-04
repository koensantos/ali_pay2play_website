from bs4 import BeautifulSoup
import pandas as pd

# Load the HTML file
with open("P2P_2024_Contributions.html", "r", encoding="utf-8") as file:
    soup = BeautifulSoup(file, "html.parser")

# Find all table rows (assuming donation info is in tables)
rows = soup.find_all("tr")

# Prepare list of extracted rows
data = []

for row in rows:
    cols = row.find_all(["td", "th"])  # td = data, th = headers
    cols = [col.get_text(strip=True) for col in cols]
    
    # Skip rows that are clearly too short or blank
    if len(cols) < 3:
        continue

    data.append(cols)

# Convert to DataFrame
df = pd.DataFrame(data)

# Preview the data to manually adjust column names if needed
print(df.head())

# Optionally assign column names
df.columns = ["Donor/Entity", "Candidate", "Amount", "Date", "Other Info"][:len(df.columns)]

# Export to CSV
df.to_csv("donations_cleaned.csv", index=False)
print("✅ Exported to donations_cleaned.csv")
