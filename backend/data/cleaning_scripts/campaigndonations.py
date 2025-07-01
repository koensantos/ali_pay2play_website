import pandas as pd
import matplotlib.pyplot as plt
import re
import os
from difflib import get_close_matches

# Paths
data_dir = os.path.join(os.path.dirname(__file__), "candidate_contributions")
p2p_file = os.path.join(data_dir, "Combined_P2P_Contributions.xlsx")

# Candidate files
candidate_files = {
    "Mussab Ali": os.path.join(data_dir, "MussabAliContributions.csv"),
    "Joyce Watterman": os.path.join(data_dir, "JoyceWattermanContributions.csv"),
    "Jim McGreevey": os.path.join(data_dir, "JimMcGreeveyContributions.csv"),
    "James Solomon": os.path.join(data_dir, "JamesSolomonContributions.csv"),
    "Bill O'Dea": os.path.join(data_dir, "WilliamODeaContributions.csv"),
}

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
    "NOT PROVIDED": "Unknown",
    "P2P_INDIVIDUAL": "P2P Individual",
    "P2P_CORPORATE": "P2P Corporate"
}

business_keywords = r"\b(LLC|INC|PC|CORP|CORPORATION|L\.L\.C\.|L\.P\.|LP|CO\.|COMPANY|INDUSTRIES|GROUP|ENTERPRISES|ASSOCIATES|SERVICES|PARTNERS|HOLDINGS)\b"

def get_individual_csv_data(file_path):
    df = pd.read_csv(file_path)

    df["ContributorGroup"] = df["ContributorType"].map(type_mapping).fillna("Other")

    def split_individual(row):
        if row["ContributorGroup"] == "Individual":
            amount = row["ContributionAmount"]
            if amount < 500:
                return "Individual - Small"
            elif 500 <= amount < 2000:
                return "Individual - Medium"
            else:
                return "Individual - Large"
        else:
            return row["ContributorGroup"]

    df["ContributorGroup"] = df.apply(split_individual, axis=1)

    return df[[
        "ContributorGroup", "ContributionAmount", "FirstName", "LastName", "NonIndName",
        "ContributionDate", "EmpName", "OccupationName", "City", "State"
    ]].rename(columns={
        "FirstName": "First_Name",
        "LastName": "Last_Name",
        "NonIndName": "Business_Name",
        "EmpName": "Employer",
        "OccupationName": "Occupation",
        "City": "Donor_City",
        "State": "Donor_State"
    })

def get_p2p_contributions(file_path, candidate_name):
    df = pd.read_excel(file_path)

    # Define accepted exact recipient name aliases per candidate
    candidate_recipient_names = {
        "Mussab Ali": ["Mussab Ali", "Ali for Mayor", "Friends of Mussab Ali", "Mussab Ali for Mayor"],
        "Joyce Watterman": ["Joyce Watterman", "Joyne E. Watterman", "Joyce E. Watterman", "Joyce Watterman for Mayor"],
        "Jim McGreevey": ["Jim McGreevey for Mayor", "Jim McGreevey for Mayor Inc, Jersey City", "Jim McGreevey", "Jim McGreevey for Mayor, Inc.", "Jim McGreevey for Mayor, Inc"],
        "James Solomon": ["James Solomon", "Solomon for Jersey City", "Solomon for Mayor", "Soloman for Jersey City", "Team Soloman", "Team Solomon"],
        "Bill O'Dea": ["Bill O'Dea", "Bill O'Dea Election Fund", "Bill O'Dea for Mayor", "O'Dea for Mayor"]
    }

    valid_names = [name.lower() for name in candidate_recipient_names.get(candidate_name, [])]
    df["Recipient_Name"] = df["Recipient_Name"].astype(str).str.lower()

    df = df[df["Recipient_Name"].isin(valid_names)].copy()

    df["Contributor_Name"] = df["Contributor_Name"].astype(str).str.strip().str.title()
    df["Business_Name"] = df["Business_Name"].astype(str).str.strip().str.title()
    df["Employer"] = df["Business_Name"]

    df["ContributorMatchesBusiness"] = df["Contributor_Name"] == df["Business_Name"]
    df["HasBusinessKeywords"] = df["Contributor_Name"].str.contains(business_keywords, case=False, na=False)

    df["ContributorGroup"] = df.apply(
        lambda row: "P2P Corporate" if row["ContributorMatchesBusiness"] and row["HasBusinessKeywords"]
        else "P2P Individual", axis=1
    )

    # Re-classify P2P Individuals into Individual - Small/Medium/Large
    def classify_p2p_individual(row):
        if row["ContributorGroup"] == "P2P Individual":
            amount = row["Contribution_Amount"]
            if amount < 500:
                return "Individual - Small"
            elif 500 <= amount < 2000:
                return "Individual - Medium"
            else:
                return "Individual - Large"
        return row["ContributorGroup"]

    df["ContributorGroup"] = df.apply(classify_p2p_individual, axis=1)

    df = df.rename(columns={
        "Contributor_Name": "Name",
        "Contribution_Amount": "ContributionAmount",
        "Contributor_City": "Donor_City",
        "Contributor_State": "Donor_State",
        "Contribution_Date": "ContributionDate"
    })

    df["Business_Name"] = df["Name"]
    df["ContributionAmount"] = df["ContributionAmount"].round(2)
    df["ContributionDate"] = pd.to_datetime(df["ContributionDate"], errors="coerce").dt.strftime('%m/%d/%Y')
    df["Donor_City"] = df["Donor_City"].astype(str).str.title()
    df["Employer"] = df["Employer"].astype(str).str.title()

    df["First_Name"] = None
    df["Last_Name"] = None
    df["Occupation"] = None

    return df[[
        "ContributorGroup", "ContributionAmount", "First_Name", "Last_Name",
        "Business_Name", "ContributionDate", "Employer", "Occupation", "Donor_City", "Donor_State"
    ]]

def plot_type_breakdown_pie(df, candidate):
    grouped = df.groupby("ContributorGroup")["ContributionAmount"].sum()
    labels = grouped.index.tolist()
    values = grouped.values
    total = values.sum()

    color_map = {
        "Individual - Small": "#66b3ff",
        "Individual - Medium": "#3399ff",
        "Individual - Large": "#004080",
        "Corporate": "#ff9999",
        "P2P Individual": "#33cc99",  # Not used anymore
        "P2P Corporate": "#ff6666",
        "Union": "#99ff99",
        "Political Committee": "#ffcc99",
        "Interest Group": "#c2c2f0",
        "Candidate": "#ffb3e6",
        "Other": "#d3d3d3",
        "Unknown": "#bbbbbb"
    }
    colors = [color_map.get(label, "#dddddd") for label in labels]

    plt.figure(figsize=(7,7))
    wedges, _, autotexts = plt.pie(
        values, labels=None, autopct='%1.1f%%', startangle=140,
        colors=colors, textprops={'fontsize': 12}
    )
    plt.title(f"{candidate}\nTotal Donations: ${total:,.2f}", fontsize=16)
    plt.legend(wedges, labels, title="Contributor Types", loc="center left", bbox_to_anchor=(1, 0, 0.5, 1), fontsize=12)
    plt.tight_layout()
    plt.savefig(f"visuals/{candidate.replace(' ', '_')}_contributions_pie.png")
    plt.close()

def get_top_contributors(df, candidate):
    top_donors = df.copy()
    top_donors["ContributorName"] = top_donors.apply(
        lambda row: f"{row['First_Name']} {row['Last_Name']}".strip()
        if row["First_Name"] or row["Last_Name"]
        else row["Business_Name"] or "Unknown", axis=1
    )

    top_contributors = top_donors.groupby("ContributorName")["ContributionAmount"].sum().nlargest(10).reset_index()
    top_employers = top_donors.groupby("Employer")["ContributionAmount"].sum().nlargest(10).reset_index()
    top_occupations = top_donors.groupby("Occupation")["ContributionAmount"].sum().nlargest(10).reset_index()

    top_contributors.to_csv(f"output/{candidate.replace(' ', '_')}_top_donors.csv", index=False)
    top_employers.to_csv(f"output/{candidate.replace(' ', '_')}_top_employers.csv", index=False)
    top_occupations.to_csv(f"output/{candidate.replace(' ', '_')}_top_occupations.csv", index=False)

def plot_contributions_over_time(df, candidate):
    df = df.copy()
    df = df.dropna(subset=["ContributionDate"])
    df["ContributionDate"] = pd.to_datetime(df["ContributionDate"], errors="coerce")
    df = df.dropna(subset=["ContributionDate"])

    time_series = df.groupby(df["ContributionDate"].dt.to_period("M"))["ContributionAmount"].sum()
    time_series.index = time_series.index.to_timestamp()

    plt.figure(figsize=(10, 6))
    plt.plot(time_series.index, time_series.values, marker="o", color="#27ae60")
    plt.title(f"{candidate} - Monthly Total Donations Over Time", fontsize=16)
    plt.xlabel("Date")
    plt.ylabel("Total Contributions ($)")
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(f"visuals/{candidate.replace(' ', '_')}_line_donations_over_time.png")
    plt.close()

def update_all_donations():
    os.makedirs("visuals", exist_ok=True)
    os.makedirs("output", exist_ok=True)

    for candidate, file_path in candidate_files.items():
        df_csv = get_individual_csv_data(file_path)
        df_p2p = get_p2p_contributions(p2p_file, candidate)

        combined_df = pd.concat([df_csv, df_p2p], ignore_index=True)
        combined_df.to_csv(f"output/{candidate.replace(' ', '_')}_combined_contributions.csv", index=False)

        print(f"\nContribution Type Breakdown for {candidate}:")
        print(combined_df.groupby("ContributorGroup")["ContributionAmount"].sum())

        plot_type_breakdown_pie(combined_df, candidate)
        plot_contributions_over_time(combined_df, candidate)
        get_top_contributors(combined_df, candidate)

if __name__ == "__main__":
    update_all_donations()
