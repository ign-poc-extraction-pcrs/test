import requests
import xmltodict
import json
import os
from tqdm import tqdm

name_file_dalle_lidar = "file_path_dalle_lidar.json"
# chemin du fichier de config
script_dir = os.path.dirname(__file__)
file_path_config = os.path.join(script_dir, "../../config.json")
# dict qui contiendra les clé
file_config = {}
# list qui contiendra les dalles
paquets_lidar = []

# on recupere les différentes clé lidar
try:
    with open(file_path_config) as json_file:
        file_config = json.load(json_file)
except:
    print("erreur dans la récuperation du json config.json")
    exit(1)

# on recupere les paquets lidar 
try:
    for key in tqdm(file_config["key_lidar"]):
        r = requests.get(f"https://wxs.ign.fr/{key}/telechargement/prepackage?request=GetCapabilities")
        #  on convertit le xml en json
        obj = xmltodict.parse(r.content)
        json_lidar = json.dumps(obj)
        json_lidar = json.loads(json_lidar)
        for data in json_lidar["Download_Capabilities"]["Capability"]["Resources"]["Resource"]:
            # on ajoute la clé a la dalle lidar
            data["key"] = key
            # on recupere les differents paquets lidar [list]
            paquets_lidar.append(data)
except:
    print("erreur dans la récuperation du getCapibilities")
    exit(1)

#  on ecris les paquets lidar dans un json
try:
    file_path_dalle_lidar = os.path.join(script_dir, f"../static/json/{name_file_dalle_lidar}")
    with open(file_path_dalle_lidar, 'w') as outfile:
        json_string = json.dumps(paquets_lidar)
        outfile.write(json_string)
        print("ecriture des dalles lidar dans le json")
except:
    print("erreur dans l'ecriture des dalles lidar dans le json")



