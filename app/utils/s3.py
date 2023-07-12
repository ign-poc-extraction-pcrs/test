from pathlib import Path
import logging
import boto3
from botocore.exceptions import ClientError
import logging
import json
from typing import List, Dict
import os
from tqdm import tqdm
from dotenv import load_dotenv
from shapely.geometry import box, MultiPolygon, Polygon
from shapely.ops import unary_union
from shapely import area, to_geojson

# Charger les variables d'environnement à partir du fichier .env


class BucketAdpater:
    def __init__(self) -> None:
        """

        Args:
            access (str): Specifie les droit d'accées
            config (dict): configuration du bucket et droit d'accées
        """
        load_dotenv()
        session = boto3.session.Session()

        self.s3_client = session.client(
            service_name="s3",
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            endpoint_url=os.getenv('ENDPOINT_URL'),
            region_name=os.getenv('REGION_NAME'),
        )
        self.bucket_name = os.getenv('BUCKET_NAME')
        self.link_download = "https://storage.sbg.cloud.ovh.net/v1/AUTH_63234f509d6048bca3c9fd7928720ca1/ppk-lidar"
        
    def read_file(self, name_file) -> None:
        """lecture d'un fichier sur ovh

        Args:
            name_file (str): nom du fichier à lire

        Returns:
            json/bool: retourne le contenu du fichier / false si aucun fichier trouvé
        """
        try:
            response = self.s3_client.get_object(Bucket=self.bucket_name, Key=name_file)
            data = json.loads(response['Body'].read().decode('utf-8'))
            return data
        except ClientError as e:
            logging.error(e)
            return False
    
    def get_all_index_json_files(self, name_file, delimiter) -> List[Dict]:
        """Récupère tous les fichiers nommés "index.json" dans tous les répertoires du bucket S3.

        Returns:
            list: une liste de dictionnaires contenant le contenu de chaque fichier index.json
        """
        # on recupere les blocs
        objects = self.s3_client.list_objects_v2(Bucket=self.bucket_name, Prefix='', Delimiter=delimiter)
        # dict qui sera transformer en json pour stocker les dalles
        index_json_files = {"paquet_within_bloc": {}}
        # list qui stockera les dalles
        dalles = []
        # permet de compter le nombre de dalle
        count_dalle = 0
        # on boucle sur les blocs
        for obj in objects["CommonPrefixes"]:
            dalles = []
            if obj['Prefix'] != "test/":
                # on recupere le nom du bloc
                name_bloc = obj['Prefix'].split("/")[0]
                print(f"{name_bloc}...")
                # on recupere les dalles du bloc sur le s3
                file_content = self.read_file(f"{name_bloc}/{name_file}")
                if file_content:
                    for bloc in tqdm(file_content["features"]):
                        # on recupere la dalle reformater
                        dalle = self.reformat_dalle(bloc["properties"]["file"], name_bloc)
                        if dalle :
                            dalles.append(dalle)
                            count_dalle += 1
                    index_json_files["paquet_within_bloc"][name_bloc] = dalles
                    print(f"{name_bloc} ajouté")
                else:
                    print(f"{name_bloc} pas encore prêt")

        index_json_files["count_dalle"] = count_dalle


        script_dir = os.path.dirname(__file__)
        file_path_json = os.path.join(script_dir, "../static/json/dalle_lidar_classe_s3_2.geojson")
        with open(file_path_json, 'w') as f:
            json.dump(index_json_files, f)
    
    def reformat_dalle(self, dalle, name_bloc):
        """on reformate les dalles

        Args:
            dalle (_type_): nom de la dalle
            name_bloc (_type_): nom du bloc

        Returns:
            dict: le nom de la dalle et la bbox
        """
        size = 1000
        # on recupere le x_min, y_min, x_max, y_max pour former une bbox
        split_dalle = dalle.split("_")
        x_min = int(split_dalle[2]) * 1000
        y_max = int(split_dalle[3]) * 1000
        x_max = x_min + size
        y_min = y_max - size

        bbox = (x_min, y_min, x_max, y_max)

        return {"name": f"{self.link_download}/{name_bloc}/{dalle}", "bbox": bbox}


    def export_bloc_extent(self):
        script_dir = os.path.dirname(__file__)
        file_path_json = os.path.join(script_dir, "../static/json/dalle_lidar_classe_s3_2.geojson")
        with open(file_path_json, 'r') as f:
            index_json_files = json.load(f)
        # Initialisation du geojson
        data = {
            "type": "FeatureCollection",
            "name": "bloc index",
            "crs": {
                "type": "name",
                "properties": {
                    "name": "urn:ogc:def:crs:EPSG::2154"
                }
            },
            "features": []
        }
        # pour chaque bloc
        for bloc, dalles in index_json_files['paquet_within_bloc'].items():
            polygon = unary_union([box(*dalle['bbox']) for dalle in dalles])
            new_polygon = Polygon(polygon.exterior.coords).normalize()
            multi_polygon = MultiPolygon([new_polygon])
            # Pour chaque dalle
            data['features'].append({
                "type": "Feature",
                "properties": {
                    "Nom_bloc": bloc,
                    "Superficie": int(area(multi_polygon) / 1000000),
                },
                "geometry": json.loads(to_geojson(multi_polygon))
            })
        file_path_json = os.path.join(script_dir, "../static/json/lidar_classe_index.geojson")
        with open(file_path_json, 'w') as f:
            json.dump(data, f, indent=4)


if __name__ == "__main__":
    bucketAdpater =BucketAdpater()
    bucketAdpater.get_all_index_json_files("index.json", "/")
    bucketAdpater.export_bloc_extent()
