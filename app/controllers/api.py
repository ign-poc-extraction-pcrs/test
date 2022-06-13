from flask import Blueprint, jsonify
import json
import os

api = Blueprint('api', __name__, url_prefix='/api')

@api.route('/get/dalle')
def get_dalle():
    # récuparation chemin du json
    script_dir = os.path.dirname(__file__)
    file_path = os.path.join(script_dir, "../static/json/grille_dalle.json")
    # list qui contiendra les dalles
    data = []
    try:
        print("ouverture du json")
        with open(file_path) as json_file:
            data = json.load(json_file)
        statut = "success"
    except:
        print("erreur dans la récuperation du json")
        statut = "failure"

    return jsonify({"statut": statut, "result": data})