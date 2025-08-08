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
CORS(app, resources={r"/*": {"origins": "https://ali-pay2play-website.vercel.app"}})

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
    total = df["ContributionAmount"].sum()
    total = float(round(total, 2))  
    return jsonify({
        "candidate": candidate,
        "total_donations": round(total, 2)
    })

@app.route('/download/p2p-2024')
def download_p2p_contributions():
    directory = os.path.join(os.getcwd(), 'backend/cleaning_scripts/raw')
    filename = 'P2P_2024_Contributions.html'
    return send_from_directory(directory, filename, as_attachment=True)


if __name__ == "__main__":
    app.run(debug=True, port=5000)