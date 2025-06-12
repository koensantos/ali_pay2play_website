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
CHART_FOLDER = os.path.join(BASE_DIR, "cleaning_scripts", "charts")  # ✅ Corrected path

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

if __name__ == "__main__":
    app.run(debug=True)
