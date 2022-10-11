from typing import List
import psycopg2
import psycopg2.extras
from datetime import date
import json
import os

class Generate_dalle_pcrs:
    """Classe dédiée à la generation des dalles pcrs dans un fichier json que l'on récupere dans une base de données

    Attributes :
        database (str) : nom de la database
        user (str): nom du user
        host (str) : nom du host
        password (str) : le password
        port (str): le port
        path_json (str): le chemin ou sera sotcker le json
    """

    def __init__(self, database, user, host, password, port) -> None:
        self.database = database
        self.user = user
        self.host = host
        self.password = password
        self.port = port
        self.path_json = 'app/static/json'
    
    def get_connexion(self) -> None:
        """Connexion à la base de données"""
        self.conn = psycopg2.connect(database=self.database, user=self.user, host=self.host, password=self.password, port=self.port)
        self.cur = self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    def close_connexion(self) -> None:
        """Fermeture de la connexion à la base de données"""
        self.cur.close()
        self.conn.close()    

    def get_dalles(self) -> List: 
        """Récupération des dalles an base de données

        Returns:
            List: list des dalles 
        """
        self.get_connexion()
        self.cur.execute("SELECT id, nom, a_mettre_en_ligne, ST_astext(geom) as geom, id_chantier, emplacement, emplacement_masque FROM pcrs.dalle;")
        dalles = self.cur.fetchall()
        return dalles
    
    def create_dir_json(self) -> None:
        """Creation du dossier json si il n'existe pas, c'est ici qu'on sotckera le json des dalles"""
        if not os.path.exists(self.path_json):
            os.makedirs(self.path_json)


    def write_dalle_in_json(self) -> None:
        """Ecriture des dalles dans le json"""
        dalles = self.get_dalles()
        # creation du dictionnaire qui sera écris dans le json
        new_format_dalles = {
                            "date": str(date.today()),
                            "len_dalles": len(dalles),
                            "dalles": []
                            }
        # on insere le format que l'on veut des dalles dans le dictionnaire
        for dalle in dalles:
            new_format_dalles["dalles"].append(dalle['nom'])
            
        self.create_dir_json()

        try:
            print("écriture du json..")
            # ecriture du dictionnaire dans le json
            with open(f"{self.path_json}/grille_dalle.json", "w") as outfile:
                json.dump(new_format_dalles, outfile)
            print("fin de l'écriture du json")
        except:
            print("impossible d'écrire dans le json")
        
        self.close_connexion()



if __name__ == '__main__':
    generate_dalle_pcrs = Generate_dalle_pcrs(database="geoportail", user="pzgp", host="kriek2.ign.fr", password="sonia999", port="5433")
    generate_dalle_pcrs.write_dalle_in_json()