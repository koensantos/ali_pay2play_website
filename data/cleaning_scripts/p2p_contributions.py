from bs4 import BeautifulSoup
import pandas as pd
import os
import re

def combine_html_p2p_data(folder):
    html_pattern = re.compile(r"P2P_(\d{4})_Contributions\.html$")
    all_data = []
    final_headers = []

    for filename in os.listdir(folder):
        match = html_pattern.match(filename)
        if match:
            year = int(match.group(1))
            if not (2006 <= year <= 2024):
                continue  # Skip years outside 2006–2024

            filepath = os.path.join(folder, filename)

            try:
                with open(filepath, "r", encoding="utf-8") as file:
                    soup = BeautifulSoup(file, "html.parser")

                rows = soup.find_all("tr")
                if len(rows) < 2:
                    print(f"⚠️ Not enough rows in {filename}, skipping.")
                    continue

                # Header row
                header_cells = [cell.get_text(strip=True) for cell in rows[0].find_all("td")]
                if not final_headers:
                    final_headers = header_cells + ["Year"]  # Save only once

                # Data rows
                for row in rows[1:]:
                    cells = [cell.get_text(strip=True) for cell in row.find_all("td")]
                    if len(cells) == len(header_cells):
                        cells.append(year)
                        all_data.append(cells)

                print(f"✅ Processed {filename}")

            except Exception as e:
                print(f"❌ Error in {filename}: {e}")

    # Create DataFrame
    if all_data:
        df = pd.DataFrame(all_data, columns=final_headers)
        output_path = "Combined_P2P_Contributions_2006_2024.xlsx"
        df.to_excel(output_path, index=False)
        print(f"🎯 Saved combined data to {output_path}")
    else:
        print("⚠️ No valid data found in HTML files.")


combine_html_p2p_data("OtherFiles")  # Change to your folder name if needed
