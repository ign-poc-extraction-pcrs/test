from flask import Blueprint, jsonify
import json
import os
import psycopg2
import psycopg2.extras
from pathlib import Path
from datetime import date
import urllib.request
from app.controllers.Config import Config
from app.controllers.download_lidar import PATH_KEY, KEY_JSON_LIDAR

api = Blueprint('api', __name__, url_prefix='/api')

KEY_JSON_BDD = "bdd"
KEY_JSON_SERVEUR = "host_serveur"
PATH_KEY_SERVEUR = Path(__file__).parent / "../../config_serveur.json"
# bloc disponible sur https://lidar-publications.cegedim.cloud/, à modifier pour le rendre dynamique
BLOCS = ["GP", "HP", "IO", "IP", "LN", "KN", "KP", "LR"]

@api.route('/get/config/key/lidar')
def get_config_lidar():
    # recupere les clé lidar
    statut = "failure"
    key = Config.get_config_json(PATH_KEY, KEY_JSON_LIDAR)
    if key :
        statut = "success"

    return jsonify({"statut": statut, "result": key})

@api.route('/get/config/serveur')
def get_config_serveur():
    # recupere le serveur
    statut = "failure"
    key = Config.get_config_json(PATH_KEY_SERVEUR, KEY_JSON_SERVEUR)
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

@api.route('/get/chantiers/<float(signed=True):x_min>/<float(signed=True):y_min>/<float(signed=True):x_max>/<float(signed=True):y_max>', methods=['GET', 'POST'])
def get_chantier(x_min=None, y_min=None, x_max=None, y_max=None):
    info_bdd = Config.get_config_json(PATH_KEY_SERVEUR, KEY_JSON_BDD)
    bdd = get_connexion_bdd(info_bdd)
    # si il n'y a aucun probleme avec la connexion à la base
    if bdd :
        #  on recupere les dalles qui sont dans la bbox envoyer
        bdd.execute(f"SELECT bloc, ST_AsGeoJson(st_transform(st_setsrid(geom_chantier, 2154),4326)) as polygon FROM {info_bdd['schema_chantier']} WHERE geom_chantier && ST_MakeEnvelope({x_min}, {y_min}, {x_max}, {y_max}) AND mise_en_ligne = true")
        chantiers = bdd.fetchall()
        statut = "success"
        bdd.close()
        bdd.close() 
    else :
        statut = "erreur"
    return jsonify({"statut": statut, "result": chantiers})

@api.route('/get/dalles/<float(signed=True):x_min>/<float(signed=True):y_min>/<float(signed=True):x_max>/<float(signed=True):y_max>', methods=['GET', 'POST'])
def get_dalles(x_min=None, y_min=None, x_max=None, y_max=None):
    info_bdd = Config.get_config_json(PATH_KEY_SERVEUR, KEY_JSON_BDD)
    bdd = get_connexion_bdd(info_bdd)
    # si il n'y a aucun probleme avec la connexion à la base
    if bdd :
        #  on recupere les dalles qui sont dans la bbox envoyer
        bdd.execute(f"SELECT id, nom, ST_AsGeoJson(st_setsrid(geom, 2154)) as polygon FROM {info_bdd['schema_dalle']} WHERE geom && ST_MakeEnvelope({x_min}, {y_min}, {x_max}, {y_max})")
        dalles = bdd.fetchall()
        dalles = get_coordonees(dalles)
        dalles = new_format_dalle(dalles)
        statut = "success"
        bdd.close()
        bdd.close() 
    else :
        statut = "erreur"
    return jsonify({"statut": statut, "result": dalles})

@api.route('/version3/get/dalle', methods=['GET', 'POST'])
def get_dalle_lidar():
    script_dir = os.path.dirname(__file__)
    file_path_config = os.path.join(script_dir, "../static/json/file_path_dalle_lidar.json")
    file_config = []
    try:
        with open(file_path_config) as json_file:
            file_config = json.load(json_file)
    except:
        print("erreur dans la récuperation du json config.json")

    return jsonify({"result": file_config})

@api.route('/version5/get/dalle', methods=['GET', 'POST'])
def get_dalle_lidar_classe():
    paquets = get_dalle_classe()

    return jsonify({"result": paquets})


@api.route('/version5/get/blocs', methods=['GET', 'POST'])
def get_blocs_lidar_classe():
    blocs = get_blocs_classe()

    return jsonify({"result": blocs})


def get_connexion_bdd(info_bdd):
    """ Connexion à la base de données pour accéder aux dalles pcrs

    Returns:
        cursor: curseur pour executer des requetes à la base
    """
    try :
        # conn = psycopg2.connect(database="test", user="postgres", host="localhost", password="root")
        conn = psycopg2.connect(database=info_bdd["database"], user=info_bdd["user"], host=info_bdd["host"], password=info_bdd["password"], port=info_bdd["port"])
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
    for dalle in dalles:
        # on recupere le x et le y
        polygon = json.loads(dalle["polygon"])["coordinates"][0][0]

        x = int(polygon[0])
        y = int(polygon[1])

        coordonnées.append({
            "id": dalle["id"],
            "x_min": x, 
            "x_max": x + SIZE, 
            "y_min": y - SIZE, 
            "y_max": y,
            "nom": dalle["nom"]
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

def get_dalle_classe():
    """recupere les dalles classées

    Returns:
        dict: retourne tous les paquets lidar classé avec leur code
    """
    # on recupere le chemin du geojson
    script_dir = os.path.dirname(__file__)
    file_path_config = os.path.join(script_dir, "../static/json/lidar_classe.geojson")
    # variable dans laquel sera stocker le geojson
    data = []
    try:
        with open(file_path_config) as json_file:
            data = json.load(json_file)
    except:
        print("erreur dans la récuperation du geojson lidar_classe.geojson")
    # les paquets qui seront envoyés par l'api
    paquets = {}
    for bloc in data["features"]:
        # print(bloc["properties"]["Avancement"])
        nom_bloc = bloc["properties"]["Nom_bloc"]
        # si le nom du bloc n'est pas en key dans le dict alors qu'on creer la key qui contiendra tous les paquets du code actuel -> list
        if nom_bloc not in paquets:
            paquets[nom_bloc] = []
        
        # if bloc["properties"]["Avancement"] == "Donnée brute diffusée":
        if nom_bloc in BLOCS:
            # on recupere les paquets par code
            data = urllib.request.urlopen(f"https://lidar-publications.cegedim.cloud/{nom_bloc}.txt")
            # on parcours chaque ligne pour inserer chaque paquets dans le code concerné
            for line in data:
                # on decode les lignne : bytes -> string
                paquets[nom_bloc].append(line.decode("utf-8").split("\n")[0])
    
    return paquets


def get_blocs_classe():
    """ Recupere les blocs disponible dans le geojson -> lidar_classe.geojson

    Returns:
        List: Listes des blocs disponible
    """
    # on recupere le chemin du geojson
    script_dir = os.path.dirname(__file__)
    file_path_config = os.path.join(script_dir, "../static/json/lidar_classe2.geojson")
    # list dans lesquels seront stocker les blocs disponibles
    blocs_available = []

    try :
        with open(file_path_config) as json_file:
            blocs = json.load(json_file)
            # on parcours la liste des blocs 
            for bloc in blocs["features"] :
                # si le bloc est dans la liste on l'ajoute à notre liste 
                if bloc["properties"]["Nom_bloc"] in BLOCS :
                    blocs_available.append(bloc)
    except:
        print("erreur dans la récuperation du json config.json")

    return blocs_available