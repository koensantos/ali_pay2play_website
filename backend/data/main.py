from flask import Flask, send_file, jsonify, request, json
from flask_cors import CORS
import os
import logging
import pandas as pd

from cleaning_scripts import campaigndonations

app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.INFO)

# Folder paths
BASE_DIR = os.path.dirname(__file__)
DATA_FOLDER = os.path.join(BASE_DIR, "cleaning_scripts", "candidate_contributions")
CHART_FOLDER = os.path.join(BASE_DIR, "charts")
OUTPUT_FOLDER = os.path.join(BASE_DIR, "cleaning_scripts", "output")


@app.route("/api/download/<candidate>", methods=["GET"])
def download_candidate_csv(candidate):
    filename = f"{candidate}Contributions.csv"
    filepath = os.path.join(DATA_FOLDER, filename)

    if os.path.exists(filepath):
        logging.info(f"Sending file: {filepath}")
        return send_file(filepath, as_attachment=True)
    else:
        return jsonify({"error": "File not found"}), 404


@app.route("/api/update", methods=["POST"])
def trigger_update():
    try:
        logging.info("Running update_all_donations()")
        campaigndonations.update_all_donations()
        return jsonify({"message": "Donations updated successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/chart/mussab", methods=["GET"])
def get_mussab_chart():
    filename = "Mussab_Ali_contributions_pie.png"
    filepath = os.path.join(CHART_FOLDER, filename)

    if os.path.exists(filepath):
        return send_file(filepath, mimetype='image/png')
    else:
        return jsonify({"error": "Chart not found"}), 404


@app.route("/api/charts/<filename>")
def get_chart(filename):
    filepath = os.path.join(CHART_FOLDER, filename)

    if os.path.exists(filepath):
        return send_file(filepath, mimetype="image/png")
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

# ✅ Route: Top Employers
@app.route("/api/top_employers/<candidate>", methods=["GET"])
def get_top_employers(candidate):
    filename = f"{candidate}_top_employers.csv"
    return csv_to_json_response(filename)

# ✅ Route: Top Occupations
@app.route("/api/top_occupations/<candidate>", methods=["GET"])
def get_top_occupations(candidate):
    filename = f"{candidate}_top_occupations.csv"
    return csv_to_json_response(filename)



if __name__ == "__main__":
    app.run(debug=True)
