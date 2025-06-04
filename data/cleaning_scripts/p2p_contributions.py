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

        # Extract headers
        headers = [th.get_text(strip=True) for th in table.find_all("th")]

        # Extract rows (skip header)
        rows = [
            [td.get_text(strip=True) for td in tr.find_all("td")]
            for tr in table.find_all("tr")[1:]
        ]

        # Build DataFrame
        df = pd.DataFrame(rows, columns=headers)

        # Save to individual Excel file
        df.to_excel(output_excel, index=False)
        print(f"✅ Saved {output_excel}")

    except FileNotFoundError:
        print(f"❌ File {filename} not found, skipping.")
    except Exception as e:
        print(f"❌ Error processing {filename}: {e}")

print("🎉 All files processed!")
