import json
import os
from flask import Flask
from shapely.geometry import shape

from app.controllers import pcrs, api, download_lidar


app = Flask(__name__)

# Chargement des JSON (1 fois pour toutes)

# Ouverture liste dalles par bloc
script_dir = os.path.dirname(__file__)
file_path_json_s3 = os.path.join(script_dir, "static/json/dalle_lidar_classe_s3_2.geojson")
with open(file_path_json_s3) as file:
    dalles_s3 = json.load(file)
app.dalles_s3 = dalles_s3["paquet_within_bloc"]

# Ouverture de l'index des blocs
file_path_index = os.path.join(script_dir, "static/json/lidar_classe_index.geojson")
with open(file_path_index) as file:
    bloc_index = json.load(file)['features']
app.bloc_index = bloc_index

# Récupération de l'emprise instanciée en Polygon de chaque bloc
bloc_emprise = {}
for feature in bloc_index:
    bloc_emprise[feature['properties']['Nom_bloc']] = shape(feature['geometry'])
app.bloc_emprise = bloc_emprise

app.register_blueprint(pcrs.pcrs)
app.register_blueprint(api.api)
app.register_blueprint(download_lidar.download_lidar)
