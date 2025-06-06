from bs4 import BeautifulSoup
import pandas as pd

years = list(range(2024, 2019, -1))  # 2024 to 2020
all_data = []

for year in years:
    filename = f"P2P_{year}_Contributions.html"
    try:
        with open(filename, "r", encoding="utf-8") as file:
            soup = BeautifulSoup(file, "html.parser")

        table = soup.find("table")
        if not table:
            print(f"⚠️ No table found in {filename}, skipping.")
            continue

        rows = table.find_all("tr")
        if not rows:
            print(f"⚠️ No rows found in {filename}, skipping.")
            continue

        header_cells = rows[0].find_all(["th", "td"])
        headers = [cell.get_text(strip=True) for cell in header_cells]

        data = []
        for row in rows[1:]:
            cells = row.find_all("td")
            if len(cells) == 0:
                continue
            row_data = [cell.get_text(strip=True) for cell in cells]
            if len(row_data) == len(headers):
                row_data.append(str(year))  # Add year to row
                data.append(row_data)

        headers.append("Year")  # Add Year column
        df = pd.DataFrame(data, columns=headers)
        all_data.append(df)

        print(f"✅ Processed {filename}")

    except FileNotFoundError:
        print(f"❌ File {filename} not found, skipping.")
    except Exception as e:
        print(f"❌ Error processing {filename}: {e}")

# Combine all years into one DataFrame
if all_data:
    combined_df = pd.concat(all_data, ignore_index=True)
    combined_df.to_excel("Combined_P2P_Contributions.xlsx", index=False)
    print("🎯 All data saved to Combined_P2P_Contributions.xlsx")
else:
    print("⚠️ No data to save.")

