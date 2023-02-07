from flask import Blueprint, jsonify
import json
import os
import psycopg2
import psycopg2.extras
from pathlib import Path
from datetime import date
import urllib.request
import shapely.geometry
from app.controllers.Config import Config
from app.controllers.download_lidar import PATH_KEY, KEY_JSON_LIDAR


api = Blueprint('api', __name__, url_prefix='/api')

KEY_JSON_BDD = "bdd"
KEY_JSON_SERVEUR = "host_serveur"
PATH_KEY_SERVEUR = Path(__file__).parent / "../../config_serveur.json"
# bloc disponible sur https://lidar-publications.cegedim.cloud/, à modifier pour le rendre dynamique
BLOCS = ["GP", "HP", "IO", "IP", "LN", "KN", "KP", "LR", "MQ", "RP"]

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
        bdd.execute(f"SELECT id, bloc, ST_AsGeoJson(st_transform(st_setsrid(geom_chantier, 2154),4326)) as polygon FROM {info_bdd['schema_chantier']} WHERE geom_chantier && ST_MakeEnvelope({x_min}, {y_min}, {x_max}, {y_max}) AND mise_en_ligne = true")
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

@api.route('/get/number/dalle/<int:id_chantier>', methods=['GET', 'POST'])
def get_dalles_in_chantier(id_chantier):
    info_bdd = Config.get_config_json(PATH_KEY_SERVEUR, KEY_JSON_BDD)
    bdd = get_connexion_bdd(info_bdd)
    # si il n'y a aucun probleme avec la connexion à la base
    if bdd :
        #  on recupere les dalles qui sont dans la bbox envoyer
        bdd.execute(f"SELECT count(pcrs.dalle.id) FROM pcrs.dalle JOIN pcrs.chantier ON dalle.id_chantier = chantier.id WHERE dalle.id_chantier = {id_chantier}")
        dalles = bdd.fetchone()
        statut = "success"
        bdd.close()
        bdd.close() 
    else :
        statut = "erreur"
    return jsonify({"statut": statut, "result": dalles})
    
@api.route('/version3/get/dalle', methods=['GET', 'POST'])
def get_dalle_lidar():
    script_dir = os.path.dirname(__file__)
    file_path_config = os.path.join(script_dir, "../static/json/file_path_dalle_lidar_probleme.json")
    file_config = []
    try:
        with open(file_path_config) as json_file:
            file_config = json.load(json_file)
    except:
        print("erreur dans la récuperation du json config.json")

    return jsonify({"result": file_config})

@api.route('/version5/get/dalle/<float(signed=True):x_min>/<float(signed=True):y_min>/<float(signed=True):x_max>/<float(signed=True):y_max>', methods=['GET', 'POST'])
def get_dalle_lidar_classe(x_min=None, y_min=None, x_max=None, y_max=None):
    bbox_windows = (x_min, y_min, x_max, y_max)
    paquets = get_dalle_in_bloc(bbox_windows)

    return jsonify({"result": paquets["paquet_within_bloc"], "count_dalle": paquets["count_dalle"] })


@api.route('/version5/get/blocs', methods=['GET', 'POST'])
def get_blocs_lidar_classe():
    blocs = get_blocs_classe()

    return jsonify({"result": blocs, "count_bloc":len(BLOCS)})


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

def get_dalle_in_bloc(bbox_windows):
    """Recupere les dalles dans les blocs (on enleve ceux qui dépasse)

    Args:
        bbox_windows (tuple): bbox de la fenetre, va permettre de ne recuperer seulement que les dalles qui sont dans la fenetre

    Returns:
        dict: Dalles dans les blocs + nombre de dalle en tout
    """
    # on recupere tous les blocs et toutes les classes
    paquets = get_dalle_classe()
    blocs = get_blocs_classe()
    # taille des dalles
    size = 1000
    # dict qui contiendra les dalles qui sont dans le bloc
    paquet_within_bloc = {}
    count_dalle = 0
    # on balaye tous les paquets et blocs
    for paquet in paquets:
        for bloc in blocs:
            name_bloc = bloc["properties"]["Nom_bloc"]
            # si le paquet appartient au bloc
            if name_bloc == paquet:
                # on recupere toutes les dalles du bloc
                dalles = paquets[paquet]
                # on balaye les dalles
                for dalle in dalles:
                    # on recupere le x_min, y_min, x_max, y_max pour former une bbox
                    split_dalle = dalle.split("_")
                    x_min = int(split_dalle[2]) * 1000
                    y_max = int(split_dalle[3]) * 1000
                    x_max = x_min + size
                    y_min = y_max - size
                    # si la clé du bloc n'est pas le dictionnaire alors on le creer
                    if name_bloc not in paquet_within_bloc:
                        paquet_within_bloc[name_bloc] = []
                    # si la dalle est dans le bloc alors on la garde, on enleve les dalles qui dépassent du bloc
                    if get_bboxes_within_multipolygon((x_min, y_min, x_max, y_max), bloc["geometry"]) and get_bboxes_within_bboxes((x_min, y_min, x_max, y_max), bbox_windows):
                        paquet_within_bloc[name_bloc].append(dalle)
                    count_dalle += 1

    return {"paquet_within_bloc": paquet_within_bloc, "count_dalle": count_dalle}




def get_bboxes_within_multipolygon(bbox, multipolygon):
    """_summary_

    Args:
        bbox (tuple): bbox -> (x_min, y_min, x_max, y_max)
        multipolygon (geojson): peu aussi être un polygon

    Returns:
        bool: on retourne True si la bbbox est dans le polygon
    """
    # on transforme notre polygon en geometry
    multipolygon_shape = shapely.geometry.shape(multipolygon)
    # on transforme notre bbox en geometry
    bbox_polygon = shapely.geometry.box(*bbox)
    # on regarde si la bbox est dans le polygon
    if multipolygon_shape.contains(bbox_polygon):
        return True
    return False

def get_bboxes_within_bboxes(bbox, bbox_windows):
    """_summary_

    Args:
        bbox (tuple): bbox -> (x_min, y_min, x_max, y_max)
        bbox_windows (tuple): bbox fenetre

    Returns:
        bool: on retourne True si la bbbox est dans le polygon
    """
    # on transforme notre polygon en geometry
    bbox_windows = shapely.geometry.box(*bbox_windows)
    # on transforme notre bbox en geometry
    bbox_polygon = shapely.geometry.box(*bbox)
    # on regarde si la bbox est dans le polygon
    if bbox_windows.contains(bbox_polygon):
        return True
    return False
