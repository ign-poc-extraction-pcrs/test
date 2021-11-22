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


## Clone projet (serveur prod)
Ajouter les proxy !
```
git config --global http.proxy $http_proxy
git config --global https.proxy $https_proxy
```
```
vi .bashrc
export http_proxy=http://proxy.fwcloud.ign.fr:3128
export https_proxy=http://proxy.fwcloud.ign.fr:3128

export HTTP_PROXY=$http_proxy
export HTTPS_PROXY=$https_proxy
```
```
sudo apt-get install -y proj-bin gdal-bin
pip3 install --upgrade pip
sudo apt install python-gdal
```
```
git clone https://github.com/ign-poc-extraction-pcrs/test.git
```


## Run projet

Se mettre à la racine du projet
Création et activation de l'environnement virtuel (si besoin) :

Windows :
```
py -3 -m venv venv
```

```
venv\Scripts\activate
```
Linux:
```
python3 -m venv venv
```

```
. venv/bin/activate
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

Creation du cron :
```
sudo apt-get install cron
crontab - e
00 02 * * * rm chemin/absolu/test/app/static/img/*
```