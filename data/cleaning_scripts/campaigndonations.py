import pandas as pd
import matplotlib.pyplot as plt
import re

candidate_files = {
    "Mussab Ali": "MussabAliContributions.csv",
    "Joyce Watterman": "JoyceWattermanContributions.csv",
    "Jim McGreevey": "JimMcGreeveyContributions.csv",
    "James Solomon": "JamesSolomonContributions.csv",
    "Bill O'Dea": "WilliamODeaContributions.csv"
}
p2p_file = "Combined_P2P_Contributions.xlsx"

type_mapping = {
    "INDIVIDUAL": "Individual",
    "BUSINESS/CORP": "Corporate",
    "BUSINESS/ CORP ASSOC/ PAC": "Corporate",
    "UNION": "Union",
    "UNION PAC": "Union",
    "POLITICAL CMTE": "Political Committee",
    "POLITICAL PARTY CMTE": "Political Committee",
    "POLITICAL CLUB": "Political Committee",
    "TRADE ASSOCIATION PAC": "Corporate",
    "IDEOLOGICAL ASSOC/ PAC": "Interest Group",
    "INTEREST": "Interest Group",
    "CANDIDATE COMMITTEE": "Candidate",
    "MISC/ OTHER": "Other",
    "NOT PROVIDED": "Unknown"
}

business_keywords = r"\b(LLC|INC|PC|CORP|CORPORATION|L\.L\.C\.|L\.P\.|LP)\b"

def get_individual_csv_data(file_path):
    df = pd.read_csv(file_path)
    df["ContributorGroup"] = df["ContributorType"].map(type_mapping).fillna("Other")

    # Split individual donations into small/large
    def split_individual(row):
        if row["ContributorGroup"] == "Individual":
            if row["ContributionAmount"] > 4000:
                return "Individual - Large"
            else:
                return "Individual - Small"
        else:
            return row["ContributorGroup"]

    df["ContributorGroup"] = df.apply(split_individual, axis=1)
    return df[["ContributorGroup", "ContributionAmount"]]

def get_p2p_contributions(file_path, candidate_name):
    df = pd.read_excel(file_path)
    df = df[df['Recipient_Name'].str.contains(candidate_name, case=False, na=False)].copy()
    df["IsBusiness"] = df["Contributor_Name"].str.contains(business_keywords, case=False, na=False)

    # For P2P, classify business vs individual, then split individuals by donation size
    def classify(row):
        if row["IsBusiness"]:
            return "Corporate"
        else:
            if row["Aggregate_Contribution_Amount"] > 4000:
                return "Individual - Large"
            else:
                return "Individual - Small"

    df["ContributorGroup"] = df.apply(classify, axis=1)
    df = df.rename(columns={"Aggregate_Contribution_Amount": "ContributionAmount"})
    return df[["ContributorGroup", "ContributionAmount"]]

def plot_type_breakdown_pie(df, candidate):
    grouped = df.groupby("ContributorGroup")["ContributionAmount"].sum()
    labels = grouped.index.tolist()
    values = grouped.values
    total = values.sum()

    color_map = {
        "Individual - Small": "#66b3ff",
        "Individual - Large": "#004080",
        "Corporate": "#ff9999",
        "Union": "#99ff99",
        "Political Committee": "#ffcc99",
        "Interest Group": "#c2c2f0",
        "Candidate": "#ffb3e6",
        "Other": "#d3d3d3",
        "Unknown": "#bbbbbb"
    }
    colors = [color_map.get(label, "#dddddd") for label in labels]

    plt.figure(figsize=(7,7))
    wedges, texts, autotexts = plt.pie(values, labels=None, autopct='%1.1f%%', startangle=140, colors=colors, textprops={'fontsize': 12})

    plt.title(f"{candidate}\nTotal Donations: ${total:,.2f}", fontsize=16)

    plt.legend(wedges, labels, title="Contributor Types", loc="center left", bbox_to_anchor=(1, 0, 0.5, 1), fontsize=12)

    plt.tight_layout()
    plt.show()

# --- Main Loop ---
for candidate, file_path in candidate_files.items():
    df_csv = get_individual_csv_data(file_path)
    df_p2p = get_p2p_contributions(p2p_file, candidate)

    combined_df = pd.concat([df_csv, df_p2p], ignore_index=True)

    print(f"\nContribution Type Breakdown for {candidate}:")
    print(combined_df.groupby("ContributorGroup")["ContributionAmount"].sum())

    plot_type_breakdown_pie(combined_df, candidate)
