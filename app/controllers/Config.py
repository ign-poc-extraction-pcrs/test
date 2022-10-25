import os
import json

class Config:

    @staticmethod
    def get_config_json(chemin_json, key_data):
        """ouvre un json, et recupere les datas choisis avec la clé

        Args:
            chemin_json (str): chemin du fichier json
            key_data (str): clé dont on veut recuperer la data

        Returns:
            bool/dict: retourne les datas de la clé / si c'est en erreur on retourne false
        """
        script_dir = os.path.dirname(__file__)
        file_path = os.path.join(script_dir, chemin_json)
        # list qui contiendra les dalles
        data = {}
        try:
            print("ouverture du json")
            with open(file_path) as json_file:
                data = json.load(json_file)
            return data[key_data]
        except:
            print("erreur dans la récuperation du json")
            return False