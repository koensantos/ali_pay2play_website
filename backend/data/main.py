from flask import Flask, send_file, jsonify, request, send_from_directory, json
from flask_cors import CORS
import os
import logging
import pandas as pd

# Import your data update function
from cleaning_scripts import campaigndonations

app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.INFO)

# Folder paths
BASE_DIR = os.path.dirname(__file__)
DATA_FOLDER = os.path.join(BASE_DIR, "cleaning_scripts", "candidate_contributions")
CHART_FOLDER = os.path.join(BASE_DIR, "cleaning_scripts", "charts")
OUTPUT_FOLDER = os.path.join(BASE_DIR, "cleaning_scripts", "output")

# Route: Download candidate CSV
@app.route("/api/download/<candidate>", methods=["GET"])
def download_candidate_csv(candidate):
    filename = f"{candidate}Contributions.csv"
    filepath = os.path.join(DATA_FOLDER, filename)

    if os.path.exists(filepath):
        logging.info(f"Sending file: {filepath}")
        return send_file(filepath, as_attachment=True)
    else:
        logging.warning(f"File not found: {filepath}")
        return jsonify({"error": "File not found"}), 404

# Route: Update all donation data
@app.route("/api/update", methods=["POST"])
def trigger_update():
    try:
        logging.info("Running update_all_donations()")
        campaigndonations.update_all_donations()
        return jsonify({"message": "Donations updated successfully"})
    except Exception as e:
        logging.error(f"Update failed: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Route: Serve pie chart image for Mussab Ali
@app.route("/api/chart/mussab", methods=["GET"])
def get_mussab_chart():
    filename = "Mussab_Ali_contributions_pie.png"
    filepath = os.path.join(CHART_FOLDER, filename)

    if os.path.exists(filepath):
        return send_file(filepath, mimetype='image/png')
    else:
        return jsonify({"error": "Chart not found"}), 404

# Route: Serve Jim McGreevey combined contributions CSV
@app.route("/api/contributions/jim", methods=["GET"])
def get_jim_data():
    csv_path = os.path.join(OUTPUT_FOLDER, "Jim_McGreevey_combined_contributions.csv")
    if os.path.exists(csv_path):
        return send_file(csv_path, mimetype="text/csv")
    else:
        return jsonify({"error": "File not found"}), 404

# Route: Serve charts by filename
@app.route("/api/charts/<filename>")
def get_chart(filename):
    chart_folder = os.path.join(os.path.dirname(__file__), "cleaning_scripts", "charts")
    filepath = os.path.join(chart_folder, filename)

    if os.path.exists(filepath):
        return send_file(filepath, mimetype="image/png")
    else:
        return jsonify({"error": "File not found"}), 404


# Route: Get contribution sums grouped by ContributorGroup for candidate
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

# NEW ROUTES: Serve top donors, employers, and occupations CSVs as JSON

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

@app.route("/api/top_donors/<candidate>", methods=["GET"])
def get_top_donors(candidate):
    filename = f"{candidate}_top_donors.csv"
    return csv_to_json_response(filename)

@app.route("/api/top_employers/<candidate>", methods=["GET"])
def get_top_employers(candidate):
    filename = f"{candidate}_top_employers.csv"
    return csv_to_json_response(filename)

@app.route("/api/top_occupations/<candidate>", methods=["GET"])
def get_top_occupations(candidate):
    filename = f"{candidate}_top_occupations.csv"
    return csv_to_json_response(filename)


if __name__ == "__main__":
    app.run(debug=True)
