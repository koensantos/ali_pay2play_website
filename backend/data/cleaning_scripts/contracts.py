import os
import pandas as pd
from rapidfuzz import fuzz

# === CONFIG ===
FUZZY_THRESHOLD = 93

# === Paths ===
base_dir = os.path.dirname(__file__)
mcgreevey_path = os.path.join(base_dir, "output", "Bill_O'Dea_combined_contributions.csv")
vendor_path = os.path.join(base_dir, "vendors", "vendors-directory.xlsx")
contract_path = os.path.join(base_dir, "vendors", "contractResults.xlsx")

# === Load Data ===
mcgreevey_df = pd.read_csv(mcgreevey_path)
vendors_df = pd.read_excel(vendor_path)
contracts_df = pd.read_excel(contract_path)

# === Normalize Names ===
def normalize(series):
    return series.str.upper().str.strip()

mcgreevey_df['Business_Name_Normalized'] = normalize(mcgreevey_df['Business_Name'])
vendors_df['Business_Name_Normalized'] = normalize(vendors_df['Business Name'])
contracts_df['Vendor_Normalized'] = normalize(contracts_df['Vendor'])

# Drop rows with missing names or negative donations
mcgreevey_df = mcgreevey_df.dropna(subset=['Business_Name_Normalized'])
mcgreevey_df = mcgreevey_df[mcgreevey_df['ContributionAmount'] >= 0]

# === Utility: Word Overlap Function ===
def word_overlap(a, b):
    return len(set(a.split()) & set(b.split()))

# === Match with Vendors Directory ===
print("\n=== MATCHES IN VENDORS DIRECTORY ===\n")
for _, mc_row in mcgreevey_df.iterrows():
    mc_name = mc_row['Business_Name_Normalized']
    mc_amount = mc_row['ContributionAmount']
    
    if len(mc_name) < 6:
        continue  # Skip very short names
    
    for _, vendor_row in vendors_df.iterrows():
        vendor_name = vendor_row['Business_Name_Normalized']
        if len(vendor_name) < 6:
            continue
        
        similarity = fuzz.token_sort_ratio(mc_name, vendor_name)
        shared_words = word_overlap(mc_name, vendor_name)

        if similarity >= FUZZY_THRESHOLD and shared_words >= 2:
            print(f"Business (Donor): {mc_row['Business_Name']}")
            print(f"  Donation Amount: ${mc_amount:,.2f}")
            print(f"  Matched Vendor: {vendor_row['Business Name']}")
            print(f"  Similarity Score: {similarity}")
            print(f"  Contract Revenue: {vendor_row['Gross Sale Revenue']}")
            print("-" * 60)

# === Match with Contract Vendors ===
print("\n=== MATCHES IN CONTRACTS FILE ===\n")
for _, mc_row in mcgreevey_df.iterrows():
    mc_name = mc_row['Business_Name_Normalized']
    mc_amount = mc_row['ContributionAmount']
    
    if len(mc_name) < 6:
        continue  # Skip very short names
    
    for _, contract_row in contracts_df.iterrows():
        vendor_name = contract_row['Vendor_Normalized']
        if len(vendor_name) < 6:
            continue
        
        similarity = fuzz.token_sort_ratio(mc_name, vendor_name)
        shared_words = word_overlap(mc_name, vendor_name)

        if similarity >= FUZZY_THRESHOLD and shared_words >= 2:
            print(f"Business (Donor): {mc_row['Business_Name']}")
            print(f"  Donation Amount: ${mc_amount:,.2f}")
            print(f"  Matched Contract Vendor: {contract_row['Vendor']}")
            print(f"  Similarity Score: {similarity}")
            print(f"  Contract Amount: {contract_row['Dollars Spent to Date']}")
            print("-" * 60)
