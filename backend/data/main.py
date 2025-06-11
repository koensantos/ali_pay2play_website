from flask import Flask, send_file, jsonify, request
from flask_cors import CORS
import os
import logging

# Import your data update function
from cleaning_scripts import campaigndonations

app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.INFO)

# Path to the candidate data folder
DATA_FOLDER = os.path.join(os.path.dirname(__file__), "candidate_contributions")

@app.route("/api/download/<candidate>", methods=["GET"])
def download_candidate_data(candidate):
    """
    Download a CSV file for a specific candidate.
    """
    safe_filename = f"{candidate}.csv"
    file_path = os.path.join(DATA_FOLDER, safe_filename)

    if os.path.exists(file_path):
        logging.info(f"Sending file: {file_path}")
        return send_file(file_path, as_attachment=True)
    else:
        logging.warning(f"File not found: {file_path}")
        return jsonify({"error": "File not found"}), 404

@app.route("/api/update", methods=["POST"])
def trigger_update():
    """
    Run the data update script.
    """
    try:
        logging.info("Running update_all_donations()")
        campaigndonations.update_all_donations()
        return jsonify({"message": "Donations updated successfully"})
    except Exception as e:
        logging.error(f"Update failed: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
