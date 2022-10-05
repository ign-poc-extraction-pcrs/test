from typing import List
import psycopg2
import psycopg2.extras
from datetime import date
from pathlib import Path
import json
import os

class Write_bdd_local_dalle:
    """Classe dédiée à l'ecriture des dalles pcrs dans une base de données local

    Attributes :
        database (str) : nom de la database
        user (str): nom du user
        host (str) : nom du host
        password (str) : le password
        port (str): le port
        path_json (str): le chemin ou sera sotcker le json
    """

    def __init__(self, database, user, host, password, table) -> None:
        self.database = database
        self.user = user
        self.host = host
        self.password = password
        self.table = table
        self.path_json = f'app/static/json/copy_grille_{table}_version2.json'

    def get_dalle_json(self):
        """Recupere les dalles du json

        Returns:
            dict: recupere les dalles 
        """
        path = Path(__file__).parent / self.path_json
        with path.open() as json_file:
            data = json.load(json_file)
            return data

    def get_connexion(self) -> None:
        """Connexion à la base de données"""
        self.conn = psycopg2.connect(database=self.database, user=self.user, host=self.host, password=self.password)
        self.cur = self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    
    def close_connexion(self) -> None:
        """Fermeture de la connexion à la base de données"""
        self.cur.close()
        self.conn.close()   
    
    def insert_dalle(self) -> None: 
        try:
            self.get_connexion()
            for dalle in self.get_dalle_json()["dalles"]:
                postgres_insert_query = f""" INSERT INTO {self.table} (bloc, geom_chantier) VALUES (%s,%s)"""
                record_to_insert = (dalle["bloc"], dalle["geom_chantier"])
                self.cur.execute(postgres_insert_query, record_to_insert)

            self.conn.commit()
            count = self.cur.rowcount
            print(count, "ligne inserées")
            
        except (Exception, psycopg2.Error) as error:
            print("erreur lors de l'insertion des dalles en base", error)

        finally:
            self.close_connexion()

a = Write_bdd_local_dalle(database="test", user="postgres", host="localhost", password="root", table="chantier")
a.insert_dalle()
