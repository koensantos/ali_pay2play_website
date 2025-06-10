import pandas as pd
import matplotlib.pyplot as plt
import re
import os

# Paths
data_dir = "candidate_contributions"
p2p_file = os.path.join(data_dir, "Combined_P2P_Contributions.xlsx")

# Candidate files inside 'candidate_contributions'
candidate_files = {
    "Mussab Ali": os.path.join(data_dir, "MussabAliContributions.csv"),
    "Joyce Watterman": os.path.join(data_dir, "JoyceWattermanContributions.csv"),
    "Jim McGreevey": os.path.join(data_dir, "JimMcGreeveyContributions.csv"),
    "James Solomon": os.path.join(data_dir, "JamesSolomonContributions.csv"),
    "Bill O'Dea": os.path.join(data_dir, "WilliamODeaContributions.csv")
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
    "P2P_INDIVIDUAL": "Individual",
    "P2P_CORPORATE": "Corporate"
}

business_keywords = r"\b(LLC|INC|PC|CORP|CORPORATION|L\.L\.C\.|L\.P\.|LP)\b"

def get_individual_csv_data(file_path):
    df = pd.read_csv(file_path)
    df["ContributorGroup"] = df["ContributorType"].map(type_mapping).fillna("Other")

    def split_individual(row):
        if row["ContributorGroup"] == "Individual":
            if row["ContributionAmount"] > 4000:
                return "Individual - Large"
            else:
                return "Individual - Small"
        else:
            return row["ContributorGroup"]

    df["ContributorGroup"] = df.apply(split_individual, axis=1)
    return df[[
        "ContributorGroup", "ContributionAmount", "FirstName", "LastName",
        "NonIndName", "ContributionDate", "EmpName", "OccupationName", "City", "State"
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
    df = df[df['Recipient_Name'].str.contains(candidate_name, case=False, na=False)].copy()
    df["IsBusiness"] = df["Contributor_Name"].str.contains(business_keywords, case=False, na=False)

    def classify(row):
        if row["IsBusiness"]:
            if row["Aggregate_Contribution_Amount"] > 4000:
                return "Corporate"
            else:
                return "Corporate"
        else:
            if row["Aggregate_Contribution_Amount"] > 4000:
                return "Individual - Large"
            else:
                return "Individual - Small"

    df["ContributorGroup"] = df.apply(classify, axis=1)
    df = df.rename(columns={
        "Contributor_Name": "Name",
        "Business_Name": "Employer",
        "Aggregate_Contribution_Amount": "ContributionAmount",
        "Contributor_City": "Donor_City",
        "Contributor_State": "Donor_State"
    })
    df["First_Name"] = None
    df["Last_Name"] = None
    df["Occupation"] = None
    df["ContributionDate"] = None
    df["Business_Name"] = df["Name"]

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
    wedges, _, autotexts = plt.pie(values, labels=None, autopct='%1.1f%%', startangle=140, colors=colors, textprops={'fontsize': 12})
    plt.title(f"{candidate}\nTotal Donations: ${total:,.2f}", fontsize=16)
    plt.legend(wedges, labels, title="Contributor Types", loc="center left", bbox_to_anchor=(1, 0, 0.5, 1), fontsize=12)
    plt.tight_layout()
    plt.savefig(f"charts/{candidate.replace(' ', '_')}_contributions_pie.png")
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

# Ensure output folders exist
os.makedirs("charts", exist_ok=True)
os.makedirs("output", exist_ok=True)

def plot_category_bar_chart(df, candidate):
    grouped = df.groupby("ContributorGroup")["ContributionAmount"].sum().sort_values(ascending=False)
    
    plt.figure(figsize=(10, 6))
    bars = plt.bar(grouped.index, grouped.values, color="#4a90e2")
    plt.title(f"{candidate} - Total Contributions by Category", fontsize=16)
    plt.ylabel("Total Contributions ($)")
    plt.xticks(rotation=45, ha="right")
    plt.tight_layout()
    
    for bar in bars:
        yval = bar.get_height()
        plt.text(bar.get_x() + bar.get_width() / 2, yval, f"${yval:,.0f}", va='bottom', ha='center', fontsize=9)

    filename = f"charts/{candidate.replace(' ', '_')}_bar_contributions.png"
    plt.savefig(filename)
    plt.close()


def plot_contributions_over_time(df, candidate):
    # Drop missing dates and convert to datetime
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

    filename = f"charts/{candidate.replace(' ', '_')}_line_donations_over_time.png"
    plt.savefig(filename)
    plt.close()


def update_all_donations():
    for candidate, file_path in candidate_files.items():
        df_csv = get_individual_csv_data(file_path)
        df_p2p = get_p2p_contributions(p2p_file, candidate)

        combined_df = pd.concat([df_csv, df_p2p], ignore_index=True)
        combined_df.to_csv(f"output/{candidate.replace(' ', '_')}_combined_contributions.csv", index=False)

        print(f"\nContribution Type Breakdown for {candidate}:")
        print(combined_df.groupby("ContributorGroup")["ContributionAmount"].sum())

        plot_type_breakdown_pie(combined_df, candidate)
        plot_category_bar_chart(combined_df, candidate)
        plot_contributions_over_time(combined_df, candidate)

        get_top_contributors(combined_df, candidate)
