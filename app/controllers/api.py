from flask import Blueprint, jsonify
import json
import os
import psycopg2
import psycopg2.extras
from datetime import date
from app.controllers.Config import Config

api = Blueprint('api', __name__, url_prefix='/api')

@api.route('/get/config/key/lidar')
def get_config():
    # recupere les clé lidar
    statut = "failure"
    key = Config.get_key_lidar()
    if key :
        statut = "success"

    return jsonify({"statut": statut, "result": key})

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


@api.route('/get/dalles/<float(signed=True):x_min>/<float(signed=True):y_min>/<float(signed=True):x_max>/<float(signed=True):y_max>', methods=['GET', 'POST'])
def test(x_min=None, y_min=None, x_max=None, y_max=None):
    bdd = get_connexion_bdd()
    dalles = []
    # si il n'y a aucun probleme avec la connexion à la base
    if bdd :
        #  on recupere les dalles qui sont dans la bbox envoyer
        bdd.execute(f"SELECT id, nom  FROM dalle WHERE geom && ST_MakeEnvelope({x_min}, {y_min}, {x_max}, {y_max})")
        dalles = bdd.fetchall()
        dalles = get_coordonees(dalles)
        dalles = new_format_dalle(dalles)
        statut = "success"
        bdd.close()
        bdd.close() 
    else :
        statut = "erreur"
    return jsonify({"statut": statut, "result": dalles})


@api.route('/get/chantiers/<float(signed=True):x_min>/<float(signed=True):y_min>/<float(signed=True):x_max>/<float(signed=True):y_max>', methods=['GET', 'POST'])
def get_chantier(x_min=None, y_min=None, x_max=None, y_max=None):
    bdd = get_connexion_bdd()
    dalles = []
    # si il n'y a aucun probleme avec la connexion à la base
    if bdd :
        #  on recupere les dalles qui sont dans la bbox envoyer
        bdd.execute(f"SELECT bloc, ST_AsGeoJson(st_transform(st_setsrid(geom_chantier, 2154),4326)) as polygon FROM pcrs.chantier WHERE geom_chantier && ST_MakeEnvelope({x_min}, {y_min}, {x_max}, {y_max})")
        chantiers = bdd.fetchall()
        statut = "success"
        bdd.close()
        bdd.close() 
    else :
        statut = "erreur"
    return jsonify({"statut": statut, "result": chantiers})


def get_connexion_bdd():
    """ Connexion à la base de données pour accéder aux dalles pcrs

    Returns:
        cursor: curseur pour executer des requetes à la base
    """
    try :
        conn = psycopg2.connect(database="test", user="postgres", host="localhost", password="root")
        # conn = psycopg2.connect(database="geoportail", user="pzgp", host="kriek2.ign.fr", password="sonia999", port="5433")
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    except psycopg2.OperationalError as e:
        return False
    return cur


def get_coordonees(dalles):
    """recupere les coordonnées des dalles dans le bon format

    Args:
        dalles (List): Liste des dalles avec leurs différentes infos en récuperer en base

    Returns:
        List: Liste des coordonnées des dalles 
    """
    SIZE = 1000
    coordonnées = []
    nom_split = []
    for dalle in dalles:
        nom = dalle["nom"]
        # on recupere la partie du nom ou il y'a les coordonnées
        nom_split = dalle["nom"].split("-")
        # si ce n'est pas une nom_split
        if len(nom_split) > 4 and nom_split[2].isdigit():
            x_min = int(nom_split[2]) * 1000
            y_max = int(nom_split[3]) * 1000
            coordonnées.append({
                "id": dalle["id"],
                # "chantier": dalle["id_chantier"],
                "x_min": x_min, 
                "x_max": x_min + SIZE, 
                "y_min": y_max - SIZE, 
                "y_max": y_max,
                "nom": nom
            })
    return coordonnées

def new_format_dalle(dalles):
    # creation du dictionnaire qui sera envoyer par l'api
    new_format_dalles = {
                            "date": str(date.today()),
                            "len_dalles": len(dalles),
                            "dalles": []
                            }
    # on insere le format que l'on veut des dalles dans le dictionnaire
    for dalle in dalles:
        new_format_dalles["dalles"].append(dalle)
    return dalles
