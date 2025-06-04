from bs4 import BeautifulSoup
import pandas as pd

years = list(range(2024, 2019, -1))  # 2024 down to 2020

for year in years:
    filename = f"P2P_{year}_Contributions.html"
    output_excel = f"P2P_{year}_Contributions.xlsx"
    try:
        with open(filename, "r", encoding="utf-8") as file:
            soup = BeautifulSoup(file, "html.parser")

        table = soup.find("table")
        if not table:
            print(f"⚠️ No table found in {filename}, skipping.")
            continue

        # Get all rows
        rows = table.find_all("tr")
        if not rows:
            print(f"⚠️ No rows found in {filename}, skipping.")
            continue

        # Extract header cells from first row, whether <th> or <td>
        header_cells = rows[0].find_all(["th", "td"])
        headers = [cell.get_text(strip=True) for cell in header_cells]

        # Extract data rows (skip first header row)
        data = []
        for row in rows[1:]:
            cells = row.find_all("td")
            if len(cells) == 0:
                continue
            row_data = [cell.get_text(strip=True) for cell in cells]
            data.append(row_data)

        # Check if all rows have same length as headers; if not, fix or skip rows
        filtered_data = [r for r in data if len(r) == len(headers)]

        # Build DataFrame
        df = pd.DataFrame(filtered_data, columns=headers)

        # Save to Excel file
        df.to_excel(output_excel, index=False)
        print(f"✅ Saved {output_excel}")

    except FileNotFoundError:
        print(f"❌ File {filename} not found, skipping.")
    except Exception as e:
        print(f"❌ Error processing {filename}: {e}")

print(" All files processed!")
