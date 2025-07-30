from flask import Flask, send_file, jsonify, request, json, send_from_directory
from flask_cors import CORS
import os
import logging
import pandas as pd
import difflib  
import urllib.parse
from rapidfuzz import fuzz

from cleaning_scripts import campaigndonations

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Set up logging
logging.basicConfig(level=logging.INFO)

# Folder paths
BASE_DIR = os.path.dirname(__file__)
DATA_FOLDER = os.path.join(BASE_DIR, "cleaning_scripts", "candidate_contributions")
CHART_FOLDER = os.path.join(BASE_DIR, "charts")
OUTPUT_FOLDER = os.path.join(BASE_DIR, "cleaning_scripts", "output")
VENDOR_FOLDER = os.path.join(BASE_DIR, "cleaning_scripts", "vendors")


@app.route("/api/download/<candidate>", methods=["GET"])
def download_candidate_csv(candidate):
    filename = f"{candidate}Contributions.csv"
    filepath = os.path.join(DATA_FOLDER, filename)

    if os.path.exists(filepath):
        logging.info(f"Sending file: {filepath}")
        return send_file(filepath, as_attachment=True)
    else:
        return jsonify({"error": "File not found"}), 404



@app.route("/api/contributions/<candidate>", methods=["GET"])
def get_contributions(candidate):
    filename = f"{candidate}_combined_contributions.csv"
    path = os.path.join(OUTPUT_FOLDER, filename)

    if not os.path.exists(path):
        return jsonify({"error": "File not found"}), 404

    df = pd.read_csv(path)
    grouped = df.groupby("ContributorGroup")["ContributionAmount"].sum().reset_index()
    result = grouped.to_dict(orient="records")
    return jsonify(result)


@app.route("/api/top_donors_csv/<candidate>", methods=["GET"])
def get_top_donors_csv(candidate):
    filename = f"{candidate}_combined_contributions.csv"
    path = os.path.join(OUTPUT_FOLDER, filename)

    if not os.path.exists(path):
        return jsonify({"error": "File not found"}), 404

    try:
        df = pd.read_csv(path)

        # Construct ContributorName
        df["First_Name"] = df["First_Name"].fillna("")
        df["Last_Name"] = df["Last_Name"].fillna("")
        df["Business_Name"] = df["Business_Name"].fillna("")

        df["ContributorName"] = df["First_Name"].str.strip() + " " + df["Last_Name"].str.strip()
        df["ContributorName"] = df.apply(
            lambda row: row["Business_Name"] if row["ContributorName"].strip() == "" else row["ContributorName"],
            axis=1
        )

        grouped = (
            df.groupby("ContributorName", as_index=False)["ContributionAmount"]
            .sum()
            .sort_values("ContributionAmount", ascending=False)
            .head(10)
        )

        grouped = grouped.merge(
            df[["ContributorName", "Employer", "Donor_City"]].drop_duplicates("ContributorName"),
            on="ContributorName",
            how="left"
        )

        return jsonify(grouped.to_dict(orient="records"))

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# Utility to serve CSV files as JSON
def csv_to_json_response(filename):
    path = os.path.join(OUTPUT_FOLDER, filename)
    if not os.path.exists(path):
        return jsonify({"error": "File not found"}), 404
    try:
        df = pd.read_csv(path)
        return jsonify(df.to_dict(orient="records"))
    except Exception as e:
        logging.error(f"Failed to parse CSV {filename}: {e}")
        return jsonify({"error": "Failed to parse CSV"}), 500

@app.route("/api/repeat_donors/<candidate>", methods=["GET"])
def get_repeat_donor_frequency(candidate):
    filename = f"{candidate}_combined_contributions.csv"
    filepath = os.path.join(OUTPUT_FOLDER, filename)

    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404

    try:
        df = pd.read_csv(filepath)
        df["ContributionDate"] = pd.to_datetime(df["ContributionDate"], errors="coerce")
        df = df.dropna(subset=["ContributionDate", "First_Name", "Last_Name"])
        df["DonorName"] = df["First_Name"].fillna('') + " " + df["Last_Name"].fillna('')
        df["DonorName"] = df["DonorName"].str.strip()
        df["Month"] = df["ContributionDate"].dt.to_period("M").astype(str)

        monthly_counts = df.groupby(["DonorName", "Month"]).size().reset_index(name="DonationCount")
        top_donors = (
            monthly_counts.groupby("DonorName")["DonationCount"]
            .count()
            .sort_values(ascending=False)
            .head(5)
            .index
        )

        filtered = monthly_counts[monthly_counts["DonorName"].isin(top_donors)]
        donor_data = {}
        for donor in top_donors:
            donor_df = filtered[filtered["DonorName"] == donor]
            monthly_data = {row["Month"]: row["DonationCount"] for _, row in donor_df.iterrows()}
            donor_data[donor] = monthly_data

        return jsonify(donor_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/search_donor/<candidate>", methods=["GET"])
def search_donor(candidate):
    name_query = request.args.get("q", "").strip().lower()
    if not name_query:
        return jsonify({"error": "Missing query"}), 400

    filename = f"{candidate}_combined_contributions.csv"
    filepath = os.path.join(OUTPUT_FOLDER, filename)

    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404

    df = pd.read_csv(filepath)

    # Construct ContributorName
    df["ContributorName"] = df.apply(
        lambda row: f"{row['First_Name']} {row['Last_Name']}".strip()
        if pd.notna(row["First_Name"]) or pd.notna(row["Last_Name"])
        else row["Business_Name"] if pd.notna(row["Business_Name"]) else "Unknown",
        axis=1
    )
    df["ContributorName_lower"] = df["ContributorName"].str.lower().fillna("")

    # Exact matches first
    exact_matches = df[df["ContributorName_lower"] == name_query]

    if not exact_matches.empty:
        history = exact_matches[[
            "ContributorName",
            "ContributionAmount",
            "ContributionDate",
            "Donor_City",
            "ContributorGroup"
        ]].copy()

        history["ContributionDate"] = history["ContributionDate"].where(pd.notnull(history["ContributionDate"]), None)
        history["Donor_City"] = history["Donor_City"].where(pd.notnull(history["Donor_City"]), None)
        history["ContributorGroup"] = history["ContributorGroup"].where(pd.notnull(history["ContributorGroup"]), "Unknown")

        return jsonify({
            "status": "found",
            "donor": name_query,
            "records": history.to_dict(orient="records")
        })

    # Substring match (no fuzzy, just contains)
    substring_matches = df[df["ContributorName_lower"].str.contains(name_query)]

    if not substring_matches.empty:
        suggestions = (
            substring_matches["ContributorName"]
            .dropna()
            .unique()
            .tolist()
        )
        return jsonify({
            "status": "not_found",
            "query": name_query,
            "suggestions": suggestions
        })

    return jsonify({
        "status": "not_found",
        "query": name_query,
        "suggestions": []
    })


@app.route("/api/repeated_donors/<candidate>", methods=["GET"])
def get_repeated_donors(candidate):
    filename = f"{candidate}_combined_contributions.csv"
    path = os.path.join(OUTPUT_FOLDER, filename)

    if not os.path.exists(path):
        return jsonify({"error": "File not found"}), 404

    df = pd.read_csv(path)

    df["ContributorName"] = df.apply(
        lambda row: f"{row['First_Name']} {row['Last_Name']}".strip()
        if pd.notna(row["First_Name"]) or pd.notna(row["Last_Name"])
        else row["Business_Name"] if pd.notna(row["Business_Name"]) else "Unknown",
        axis=1
    )

    counts = df.groupby("ContributorName").size()
    multiple_donors = counts[counts > 1].index.tolist()

    repeated_df = df[df["ContributorName"].isin(multiple_donors)]

    summary = repeated_df.groupby("ContributorName")["ContributionAmount"].sum().reset_index()
    summary = summary.rename(columns={"ContributionAmount": "TotalAmount"})
    summary = summary.sort_values(by="TotalAmount", ascending=False).head(10)

    return jsonify(summary.to_dict(orient="records"))


@app.route("/api/top_donors/<candidate>", methods=["GET"])
def get_top_donors(candidate):
    filename = f"{candidate}_combined_contributions.csv"
    path = os.path.join(OUTPUT_FOLDER, filename)

    if not os.path.exists(path):
        return jsonify({"error": "File not found"}), 404

    df = pd.read_csv(path)

    df["ContributorName"] = df.apply(
        lambda row: f"{row['First_Name']} {row['Last_Name']}".strip()
        if pd.notna(row["First_Name"]) or pd.notna(row["Last_Name"])
        else row["Business_Name"] if pd.notna(row["Business_Name"]) else "Unknown",
        axis=1
    )

    summary = df.groupby("ContributorName")["ContributionAmount"].sum().reset_index()
    summary = summary.sort_values(by="ContributionAmount", ascending=False).head(10)

    return jsonify(summary.to_dict(orient="records"))


# --- New: Top Donors Bar Chart data endpoint ---
@app.route("/api/top_donors_bar/<candidate>", methods=["GET"])
def top_donors_bar(candidate):
    filename = f"{candidate}_combined_contributions.csv"
    path = os.path.join(OUTPUT_FOLDER, filename)
    if not os.path.exists(path):
        return jsonify({"error": "File not found"}), 404

    df = pd.read_csv(path)
    df["ContributorName"] = df.apply(
        lambda row: f"{row['First_Name']} {row['Last_Name']}".strip()
        if pd.notna(row["First_Name"]) or pd.notna(row["Last_Name"])
        else row["Business_Name"] if pd.notna(row["Business_Name"]) else "Unknown",
        axis=1
    )

    top_donors = df.groupby("ContributorName")["ContributionAmount"].sum().sort_values(ascending=False).head(10)
    labels = top_donors.index.tolist()
    data = top_donors.values.tolist()

    # Generate distinct colors for bars
    backgroundColor = [
        "#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f",
        "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab"
    ]

    chart_data = {
        "labels": labels,
        "datasets": [{
            "label": "Donation Amount",
            "data": data,
            "backgroundColor": backgroundColor[:len(labels)]
        }]
    }
    return jsonify(chart_data)

@app.route("/api/top_employers_bar/<candidate>", methods=["GET"])
def top_employers_bar(candidate):
    filename = f"{candidate}_combined_contributions.csv"
    path = os.path.join(OUTPUT_FOLDER, filename)
    if not os.path.exists(path):
        return jsonify({"error": "File not found"}), 404

    df = pd.read_csv(path)
    
    # Filter for records with valid Employer values
    df = df[df["Employer"].notna()]
    
    # Group by Employer and sum contributions
    top_employers = (
        df.groupby("Employer")["ContributionAmount"]
        .sum()
        .sort_values(ascending=False)
        .head(10)
    )
    
    labels = top_employers.index.tolist()
    data = top_employers.values.tolist()

    # Generate distinct colors for bars
    backgroundColor = [
        "#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f",
        "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab"
    ]

    chart_data = {
        "labels": labels,
        "datasets": [{
            "label": "Donation Amount by Employer",
            "data": data,
            "backgroundColor": backgroundColor[:len(labels)]
        }]
    }
    return jsonify(chart_data)

# --- New: Repeated Donors Bar Chart data endpoint ---
@app.route("/api/repeat_donors_bar/<candidate>", methods=["GET"])
def repeat_donors_bar(candidate):
    filename = f"{candidate}_combined_contributions.csv"
    path = os.path.join(OUTPUT_FOLDER, filename)
    if not os.path.exists(path):
        return jsonify({"error": "File not found"}), 404

    df = pd.read_csv(path)
    df["ContributorName"] = df.apply(
        lambda row: f"{row['First_Name']} {row['Last_Name']}".strip()
        if pd.notna(row["First_Name"]) or pd.notna(row["Last_Name"])
        else row["Business_Name"] if pd.notna(row["Business_Name"]) else "Unknown",
        axis=1
    )

    counts = df.groupby("ContributorName").size()
    multiple_donors = counts[counts > 1].index.tolist()

    repeated_df = df[df["ContributorName"].isin(multiple_donors)]

    summary = repeated_df.groupby("ContributorName")["ContributionAmount"].sum().reset_index()
    summary = summary.rename(columns={"ContributionAmount": "TotalAmount"})
    summary = summary.sort_values(by="TotalAmount", ascending=False).head(10)

    labels = summary["ContributorName"].tolist()
    data = summary["TotalAmount"].tolist()

    backgroundColor = [
        "#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f",
        "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab"
    ]

    chart_data = {
        "labels": labels,
        "datasets": [{
            "label": "Total Donations",
            "data": data,
            "backgroundColor": backgroundColor[:len(labels)]
        }]
    }
    return jsonify(chart_data)


@app.route("/api/donations_over_time/<candidate>", methods=["GET"])
def donations_over_time(candidate):
    filepath = os.path.join(OUTPUT_FOLDER, f"{candidate}_combined_contributions.csv")
    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404

    df = pd.read_csv(filepath)
    df["ContributionDate"] = pd.to_datetime(df["ContributionDate"], format="%m/%d/%Y", errors="coerce")

    today = pd.Timestamp.today()
    # Filter out future-dated donations
    df = df[df["ContributionDate"] <= today]

    # Group donations by month or day for the line chart
    # For example, group by month
    df_grouped = df.groupby(df["ContributionDate"].dt.to_period("M")).sum(numeric_only=True)
    df_grouped = df_grouped.reset_index()
    df_grouped["ContributionDate"] = df_grouped["ContributionDate"].dt.to_timestamp()

    # Prepare data for frontend
    labels = df_grouped["ContributionDate"].dt.strftime("%Y-%m").tolist()
    values = df_grouped["ContributionAmount"].tolist()

    return jsonify({
        "labels": labels,
        "datasets": [{
            "label": "Donations Over Time",
            "data": values,
            "fill": False,
            "borderColor": "rgba(75,192,192,1)",
            "tension": 0.1,
        }]
    })

@app.route("/download/<filename>")
def download_file(filename):
    filepath = os.path.join(OUTPUT_FOLDER, filename)
    if os.path.exists(filepath):
        return send_from_directory(OUTPUT_FOLDER, filename, as_attachment=True)
    else:
        return "File not found", 404
    
@app.route("/api/total_donations/<candidate>", methods=["GET"])
def get_total_donations(candidate):
    filename = f"{candidate}_combined_contributions.csv"
    filepath = os.path.join(OUTPUT_FOLDER, filename)

    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404

    df = pd.read_csv(filepath)
    df.drop_duplicates(inplace=True)
# Or if you want to consider specific columns for uniqueness:
# df.drop_duplicates(subset=['ContributorGroup', 'ContributionAmount', 'First_Name', 'Last_Name', 'ContributionDate'], inplace=True)
    total = df["ContributionAmount"].sum()
    total = float(round(total, 2))  # Convert to Python float

    return jsonify({
        "candidate": candidate,
        "total_donations": round(total, 2)
    })

import re

def normalize_name(name):
    if pd.isna(name):
        return ""
    return name.strip().lower().replace(",", "").replace(".", "")

@app.route("/api/vendors/<candidate>", methods=["GET"])
def get_vendors(candidate):
    try:
        candidate = urllib.parse.unquote(candidate)
        filename = f"{candidate}_combined_contributions.csv"
        filepath = os.path.join(OUTPUT_FOLDER, filename)

        if not os.path.exists(filepath):
            return jsonify({"error": "Candidate file not found"}), 404

        # Load contribution data
        contrib_df = pd.read_csv(filepath, on_bad_lines='skip')
        
        # Load vendor directory (XLSX file)
        vendor_file = os.path.join(VENDOR_FOLDER, "vendors-directory.xlsx")
        try:
            vendors_df = pd.read_excel(vendor_file)
        except:
            vendors_df = pd.DataFrame(columns=["Business Name"])

        # Normalize names for matching
        contrib_df["normalized_biz"] = contrib_df["Business_Name"].apply(normalize_name)
        vendors_df["normalized_vendor"] = vendors_df["Business Name"].apply(normalize_name)

        # Find vendor matches
        vendor_matches = contrib_df[
            contrib_df["normalized_biz"].isin(vendors_df["normalized_vendor"])
        ].copy()

        # Prepare vendor results
        vendor_results = []
        if not vendor_matches.empty:
            vendor_summary = (
                vendor_matches.groupby("Business_Name")["ContributionAmount"]
                .sum()
                .reset_index()
                .sort_values("ContributionAmount", ascending=False)
                .head(10)
            )
            vendor_results = vendor_summary.to_dict(orient="records")

        return jsonify({
            "vendor_matches": vendor_results
        })

    except Exception as e:
        logging.error(f"Error in get_vendors: {str(e)}")
        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500




# Utility functions
def normalize_name(name):
    if pd.isna(name):
        return ""
    return str(name).upper().strip()

def word_overlap(a, b):
    return len(set(a.split()) & set(b.split()))

@app.route("/api/contracts/<candidate>", methods=["GET"])
def get_contract_matches(candidate):
    try:
        candidate = urllib.parse.unquote(candidate)
        contrib_path = os.path.join(OUTPUT_FOLDER, f"{candidate}_combined_contributions.csv")
        contract_path1 = os.path.join(VENDOR_FOLDER, "contractResults.csv")
        contract_path2 = os.path.join(VENDOR_FOLDER, "Hudson County Contracts.xlsx")

        if not os.path.exists(contrib_path):
            return jsonify({"error": "Candidate contributions file not found"}), 404
        if not os.path.exists(contract_path1) and not os.path.exists(contract_path2):
            return jsonify({"error": "Neither contract file found"}), 404

        # Load contribution data
        contrib_df = pd.read_csv(contrib_path, on_bad_lines="skip")
        contrib_df = contrib_df[
            (contrib_df["ContributorGroup"].isin(["Corporate", "P2P Corporate"])) &
            (contrib_df["Business_Name"].notna()) &
            (contrib_df["ContributionAmount"] >= 0)
        ]
        contrib_df["normalized_biz"] = contrib_df["Business_Name"].apply(normalize_name)

        # Load both contract files
        contract_frames = []

        if os.path.exists(contract_path1):
            df1 = pd.read_csv(contract_path1)
            if "Vendor" in df1.columns:
                contract_frames.append(df1.rename(columns={"Vendor": "VendorName"}))

        if os.path.exists(contract_path2):
            df2 = pd.read_excel(contract_path2)
            if "Vendor" in df2.columns:
                contract_frames.append(df2.rename(columns={"Vendor": "VendorName"}))

        if not contract_frames:
            return jsonify({"error": "No valid contract data loaded"}), 500

        contracts_df = pd.concat(contract_frames, ignore_index=True)

        # Expand multi-vendor contract entries
        expanded_contracts = []
        for _, row in contracts_df.iterrows():
            vendors = re.split(r'[;,]', str(row["VendorName"]))
            for vendor in vendors:
                vendor_clean = normalize_name(vendor)
                if vendor_clean:
                    new_row = row.copy()
                    new_row["VendorName"] = vendor.strip()
                    new_row["normalized_vendor"] = vendor_clean
                    expanded_contracts.append(new_row)

        contracts_expanded_df = pd.DataFrame(expanded_contracts)

        # Perform donor–contract matching
        matches = []

        for _, contrib_row in contrib_df.iterrows():
            biz_name = contrib_row["normalized_biz"]
            contrib_amount = contrib_row["ContributionAmount"]
            if len(biz_name) < 6:
                continue

            for _, contract_row in contracts_expanded_df.iterrows():
                vendor_name = contract_row["normalized_vendor"]
                if len(vendor_name) < 6:
                    continue

                similarity = fuzz.token_sort_ratio(biz_name, vendor_name)
                shared_words = word_overlap(biz_name, vendor_name)

                if similarity >= 93 and shared_words >= 2:
                    # Contract amount extraction logic
                    contract_amount = contract_row.get("Dollars Spent to Date")
                    if pd.isna(contract_amount) or contract_amount in [None, ""]:
                        contract_amount = contract_row.get("Amount")
                    if pd.isna(contract_amount) or contract_amount in [None, ""]:
                        contract_amount = "Unknown"
                    elif isinstance(contract_amount, (int, float)):
                        contract_amount = f"${contract_amount:,.2f}"

                    contract_status = contract_row.get("Status") or "Unknown"

                    match_data = {
                        "Donor Business": contrib_row["Business_Name"],
                        "Matched Vendor": contract_row["VendorName"],
                        "Contract Value": contract_amount,
                        "Status": contract_status,
                        "Donated": contrib_amount
                    }
                    matches.append(match_data)

        return jsonify({"contract_matches": matches})

    except Exception as e:
        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500




if __name__ == "__main__":
    print("🚀 Starting Flask server...")
    print("📊 Contract analysis will be displayed in terminal when API endpoints are called")
    print("🔗 Available endpoints:")
    print("   - /api/contracts/<candidate> - Get contract matches")
    print("   - /api/vendors/<candidate> - Get vendor matches")
    print("-" * 80)
    app.run(debug=True, port=5000)