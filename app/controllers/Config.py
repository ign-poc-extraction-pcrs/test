import os
import json

class Config:

    @staticmethod
    def get_key_lidar():
        # récuparation chemin du json
        script_dir = os.path.dirname(__file__)
        file_path = os.path.join(script_dir, "../../config.json")
        # list qui contiendra les dalles
        data = {}
        try:
            print("ouverture du json")
            with open(file_path) as json_file:
                data = json.load(json_file)
            return data["key_lidar"]
        except:
            print("erreur dans la récuperation du json")
            return False
