import pandas as pd


file_paths = ["MussabAliContributions.csv", "JoyceWattermanContributions.csv","JimMcGreeveyContributions.csv", "JamesSolomonContributions.csv"]

dfs = [pd.read_csv(file_path) for file_path in file_paths]

combined_df = pd.concat(dfs)

print(combined_df)

candidates = ["Mussab Ali", "Joyce Watterman", "Jim McGreevey", "James Solomon"]

data = [
    {"name": "Mussab Ali"},
    {"name": "Joyce Watterman"},
    {"name": "Jim McGreevey"},
    {"name": "James Solomon"}
]

def totalAmounts(combineddf):
    campaign_amounts = [0, 0, 0, 0]

    for _, row in combineddf.iterrows():
        name = row["EntityName"]
        amt = row["ContributionAmount"]
        
        if name == "ALI, MUSSAB":
            campaign_amounts[0] += amt
        elif name == "WATTERMAN, JOYCE E":
            campaign_amounts[1] += amt
        elif name == "MCGREEVEY, JIM":
            campaign_amounts[2] += amt
        elif name == "SOLOMON, JAMES":
            campaign_amounts[3] += amt

    return campaign_amounts

def individualToTotalRatio(camp_amts, combineddf):
    amts = [0, 0, 0, 0]
    
    for _, row in combineddf.iterrows():
        if row["ContributorType"] != "INDIVIDUAL":
            name = row["EntityName"]
            amt = row["ContributionAmount"]
            
            if name == "ALI, MUSSAB":
                amts[0] += amt
            elif name == "WATTERMAN, JOYCE E":
                amts[1] += amt
            elif name == "MCGREEVEY, JIM":
                amts[2] += amt
            elif name == "SOLOMON, JAMES":
                amts[3] += amt

    ratio = [amts[i] / camp_amts[i] if camp_amts[i] != 0 else 0 for i in range(4)]
    return ratio

# Compute values
campaign_amounts = totalAmounts(combined_df)
ratios = individualToTotalRatio(campaign_amounts, combined_df)

# Update the data list with new attributes
for i in range(len(data)):
    data[i]["totalAmount"] = campaign_amounts[i]
    data[i]["businessToTotalRatio"] = ratios[i]



def contributionSizeBreakdown(combineddf):
    # Result structure: [ [small, large], [small, large], ... ] for each candidate
    breakdown = [[0, 0] for _ in range(4)]

    for _, row in combineddf.iterrows():
        name = row["EntityName"]
        amt = row["ContributionAmount"]

        idx = None
        if name == "ALI, MUSSAB":
            idx = 0
        elif name == "WATTERMAN, JOYCE E":
            idx = 1
        elif name == "MCGREEVEY, JIM":
            idx = 2
        elif name == "SOLOMON, JAMES":
            idx = 3

        if idx is not None:
            if amt <= 2500:
                breakdown[idx][0] += amt  # small
            else:
                breakdown[idx][1] += amt  # large

    return breakdown

size_breakdowns = contributionSizeBreakdown(combined_df)

for i in range(len(data)):
    data[i]["smallDonations"] = size_breakdowns[i][0]
    data[i]["largeDonations"] = size_breakdowns[i][1]


# View updated data
for entry in data:
    total = entry["totalAmount"]
    small = entry["smallDonations"]
    large = entry["largeDonations"]

    if total > 0:
        entry["smallDonationRatio"] = small / total
        entry["largeDonationRatio"] = large / total
    else:
        entry["smallDonationRatio"] = 0
        entry["largeDonationRatio"] = 0


def jerseyCityRatio(combineddf):
    # Initialize [Jersey City amount, Total amount] per candidate
    jc_amounts = [0, 0, 0, 0]
    total_amounts = [0, 0, 0, 0]

    for _, row in combineddf.iterrows():
        name = row["EntityName"]
        city = str(row["City"]).strip().upper()
        amt = row["ContributionAmount"]

        idx = None
        if name == "ALI, MUSSAB":
            idx = 0
        elif name == "WATTERMAN, JOYCE E":
            idx = 1
        elif name == "MCGREEVEY, JIM":
            idx = 2
        elif name == "SOLOMON, JAMES":
            idx = 3

        if idx is not None:
            total_amounts[idx] += amt
            if city == "JERSEY CITY":
                jc_amounts[idx] += amt

    ratios = [
        jc_amounts[i] / total_amounts[i] if total_amounts[i] > 0 else 0
        for i in range(4)
    ]

    return ratios

jc_ratios = jerseyCityRatio(combined_df)

for i in range(len(data)):
    data[i]["jerseyCityDonationRatio"] = jc_ratios[i]


def contributionTypeBreakdown(combineddf):
    # Step 1: Map detailed types to simplified groups
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

    combineddf["ContributorGroup"] = combineddf["ContributorType"].map(type_mapping).fillna("Unknown")

    # Step 2: Get total contribution per candidate
    total_per_candidate = combineddf.groupby("EntityName")["ContributionAmount"].sum()

    # Step 3: Get contribution sums per contributor group and candidate
    grouped = combineddf.groupby(["EntityName", "ContributorGroup"])["ContributionAmount"].sum()

    # Step 4: Calculate % per contributor group
    percentage_breakdowns = {}

    for (candidate, group), amt in grouped.items():
        total = total_per_candidate.get(candidate, 1)  # Avoid division by 0
        percent = amt / total

        if candidate not in percentage_breakdowns:
            percentage_breakdowns[candidate] = {}

        percentage_breakdowns[candidate][group] = round(percent, 4)

    return percentage_breakdowns

percentages = contributionTypeBreakdown(combined_df)


name_map = {
    "ALI, MUSSAB": "Mussab Ali",
    "WATTERMAN, JOYCE E": "Joyce Watterman",
    "MCGREEVEY, JIM": "Jim McGreevey",
    "SOLOMON, JAMES": "James Solomon"
}

for entry in data:
    full_name = next((k for k, v in name_map.items() if v == entry["name"]), None)
    if full_name in percentages:
        entry["contributorTypeBreakdown"] = percentages[full_name]

for entry in data:
    print(entry)


            

    

