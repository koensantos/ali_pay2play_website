from bs4 import BeautifulSoup
import pandas as pd

# Load the HTML file
with open("P2P_2024_Contributions.html", "r", encoding="utf-8") as file:
    soup = BeautifulSoup(file, "html.parser")

# Find all table rows
rows = soup.find_all("tr")

data = []
headers = []

for i, row in enumerate(rows):
    cols = row.find_all(["td", "th"])  # headers or data cells
    cols = [col.get_text(strip=True) for col in cols]

    if len(cols) < 3:
        continue

    if i == 0:
        # First row assumed to be headers
        headers = cols
    else:
        data.append(cols)

# Create DataFrame with exact headers from HTML
df = pd.DataFrame(data, columns=headers)

# Preview
print(df.head())

# Export to CSV
df.to_csv("donations_cleaned.csv", index=False)
print("✅ Exported to donations_cleaned.csv")
