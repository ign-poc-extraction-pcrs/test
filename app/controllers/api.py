from flask import Blueprint, jsonify
import json
import os
import psycopg2
import psycopg2.extras
from datetime import date

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


@api.route('/get/dalles/<float:x_min>-<float:y_min>-<float:x_max>-<float:y_max>', methods=['GET', 'POST'])
def test(x_min=None, y_min=None, x_max=None, y_max=None):
    bdd = get_connexion_bdd()
    dalles = []
    # si il n'y a aucun probleme avec la connexion à la base
    if bdd :
        #  on recupere les dalles qui sont dans la bbox envoyer
        bdd.execute(f"SELECT nom FROM pcrs.dalle WHERE dalle.geom && ST_MakeEnvelope({x_min}, {y_min}, {x_max}, {y_max})")
        dalles = bdd.fetchall()
        dalles = get_coordonees(dalles)
        dalles = new_format_dalle(dalles)
        statut = "success"
        bdd.close()
        bdd.close() 
    else :
        statut = "erreur"
    return jsonify({"statut": statut, "result": dalles})


def get_connexion_bdd():
    """ Connexion à la base de données pour accéder aux dalles pcrs

    Returns:
        cursor: curseur pour executer des requetes à la base
    """
    try :
        conn = psycopg2.connect(database="geoportail", user="pzgp", host="kriek2.ign.fr", password="sonia999", port="5433")
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
        nom = dalle["nom"]
        # on recupere la partie du nom ou il y'a les coordonnées
        dalle = dalle["nom"].split("-")
        # si ce n'est pas une dalle
        if len(dalle) > 4:
            x_min = int(dalle[2]) * 1000
            y_max = int(dalle[3]) * 1000
            coordonnées.append({
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
