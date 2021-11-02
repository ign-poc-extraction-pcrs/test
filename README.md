# POC PCRS

Ce dépôt a pour but de faire un poc sur l'extraction d'une/des dalles(s) pcrs à l'aide d'une carte.

## Arborescence des fichiers

* app/ : dossier où se situent tous les fichiers de l'application web

    * controllers/ dossier contenant les scripts python pour les routes (toutes les actions pour une route)
        
        * pcrs.py fichier contenant toutes les routes en rapport avec l'extraction des dalles pcrs 
    
    * static/ : dossier contenant les fichiers appelés (css, js, img) dans les routes ou fichier html
        * css/ : dossier contenant les différents fichiers css (design)
        * js/ : dossier contenant les différents fichiers js (affichage dynamique)
        * img/ : dossier contenant les différentes dalles qui sont téléchargées (dalles temporaire peut être dans le futur)
    
    * template/ : dossier qui contient tous les fichiers html appelé par les routes
        * layout/ : dossier contenant la barre de navigation et le footer d'une page html (peut être vide)
        * pages/ : dossier contenant les différentes pages appelés par les routes (en l'occurrence version1 et version2)
        * base : fichier contenant tout le haut commun de toutes les pages html
    
    * __init__.py : fichier qui initialise l'app + configure les différents fichiers de routes

* plugin_pas_utilise/ : dossier où se situe des plugins js qui pourraient être utile dans le futur

* .gitignore : on ignore certains fichiers(venv, __pycache__, plugin_pas_utilise, img, run.py) aux commit

* requirements.txt : fichier contenant toutes les librairies python à installer (pip install -r requirements.txt)

* run.py : script qui appelle le dossier app et qui lance l'application web


## Run projet

Se mettre à la racine du projet
Création et activation de l'environnement virtuel (si besoin) :
```
py -3 -m venv venv
```

```
venv\Scripts\activate
```

Installation des librairies :
```
pip install -r requirements.txt
```

Création de run.py pour lancer le serveur\
Dans run.py (mettre votre "host", si c'est en local enlever "host") :
```
from app import app

if __name__ == "__main__":
    app.run(host="diffusion05-vm.ign.fr", debug=True)
```

Lancer le serveur :
```
python3 run.py
```