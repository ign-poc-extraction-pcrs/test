from flask import Blueprint, render_template, request, redirect, url_for, send_file, jsonify, send_from_directory
from owslib.wms import WebMapService
import requests
import os
import uuid
from io import BytesIO
import subprocess
from zipfile import ZipFile

pcrs = Blueprint('pcrs', __name__, url_prefix='/')

@pcrs.route('/')
def index():
    return redirect(url_for('pcrs.version2'))


@pcrs.route('/version1')
def version1():  
    return render_template('pages/version1.html')


@pcrs.route('/version2', methods=['GET', 'POST'])
def version2():
    return render_template('pages/version2.html')

@pcrs.route('/version3', methods=['GET'])
def version3():
    return render_template('pages/version3.html')

@pcrs.route('/download/<int:x_min>-<int:y_min>-<int:x_max>-<int:y_max>-<annee>-<proj>-<resolution>-<canaux>')
@pcrs.route('/download', methods=['GET', 'POST'])
def download(x_min=None, y_min=None, x_max=None, y_max=None, annee=None, proj=None, resolution=None, canaux=None):
    """ Route permettant de telecharger une dalle ou plusieurs dalles dans un zip"""
    directory_dalles = "app/static/img/"
    # creation du dossier img si il n'existe pas
    os.makedirs(directory_dalles, exist_ok=True)
    # si on download une seule dalle (version1)
    if x_min :
        name_dalle = f"{annee}-0{x_min//100}-{y_max//100}-{proj}-{resolution}-{canaux}.tif"
        
        # si la dalle est déjà dans le dossier img, alors on ne refait pas le requete wms et le géoreferencement, on la télécharge directement
        if not os.path.isfile(f"{directory_dalles}{name_dalle}"):
            # on stocke l'image dans un dossier en la recuperant avec une requete wms avec sa bbox, avant de lui faire ses traitements
            requete_wms_and_georeferecement((x_min,y_min,x_max,y_max), directory_dalles, name_dalle)

        # on recupere le chemin absolu de l'image
        file = os.path.abspath(f"{directory_dalles}{name_dalle}")
        return send_file(file)

    # quand on clique sur le bouton telecharger on recupere sous forme de liste toutes les dalles séléctionner (version2)
    if request.method == 'POST':
        dalles = request.form.getlist('dalle[]')
        memory_file = BytesIO()
        zip_folder =  ZipFile(memory_file, 'w')
        # on boucle sur chaques dalles
        for dalle in dalles :
            # on split les infos avec un "-" pour recuperer chaque parametre de la dalle (voir js pour le format de l'envoie)
            dalle = dalle.split("-")
            # on format dans un dictionnaire les parametres d'une dalle
            dalle = {"x_min": int(dalle[0]), "y_min": int(dalle[1]), "x_max": int(dalle[2]), "y_max": int(dalle[3]), "annee": dalle[4], "proj": dalle[5], "resolution": dalle[6], "canaux": dalle[7]}
            # nom de la dalle
            name_dalle = f"{dalle['annee']}-0{dalle['x_min']//100}-{dalle['y_max']//100}-{dalle['proj']}-{dalle['resolution']}-{dalle['canaux']}"

            # si la dalle est déjà dans le dossier img, alors on ne refait pas le requete wms et le géoreferencement, on la télécharge directement
            if not os.path.isfile(f"{directory_dalles}{name_dalle}.jp2"):
                # on stocke l'image dans un dossier en la recuperant avec une requete wms avec sa bbox, avant de lui faire ses traitements
                requete_wms_and_georeferecement((dalle['x_min'],dalle['y_min'],dalle['x_max'],dalle['y_max']), directory_dalles, name_dalle)
            
            # on recupere le chemin absolu de l'image
            file = os.path.abspath(f"{directory_dalles}{name_dalle}.jp2")
            # on ajoute le fichier dans le zip qui sera envoyé
            zip_folder.write(file, os.path.basename(file))

        zip_folder.close()
        memory_file.seek(0)
        return send_file(memory_file, attachment_filename=f'telechargement_PCRS.zip', as_attachment=True)


def log_wms_serveur():
    """ connexion au serveur wms"""
    os.environ['https_proxy'] = "http://proxy.ign.fr:3128"
    os.environ['http_proxy'] = "http://proxy.ign.fr:3128"
    os.environ['HTTPS_PROXY'] = "http://proxy.ign.fr:3128"
    os.environ['HTTP_PROXYS'] = "http://proxy.ign.fr:3128"
    wms = WebMapService('https://wxs.ign.fr/ortho/geoportail/r/wms', version='1.3.0')
    return wms

def requete_wms_and_georeferecement(bbox, directory_dalles, name_dalle):
    """ on recupere la dalle à l'aide de la bbox, et on execute le requete wms, et on save l'img dans le dossier temporairement
    on attribue à la dalle un georeferencement
    
    bbox(tuple): bbox d'une dalle
    directory_dalles(str): dossier ou il y'a toutes les dalles
    name_dalle(str): nom de la dalle qui sera mise dans le dossier
    """
    srs = 'EPSG:2154'
    wms = log_wms_serveur()
    dalle = wms.getmap(
        layers=['PCRS'],
        format='image/tiff',
        srs=srs,
        bbox=bbox,
        style=[],
        size=(4000,4000)
        )
    img = open(f'{directory_dalles}{name_dalle}.tif', 'wb')
    img.write(dalle.read())
    img.close()

    x_min,y_min,x_max,y_max = bbox
    # ajout du georeferencement
    status = subprocess.run(f"gdal_edit.py -a_ullr {x_min} {y_max} {x_max} {y_min} -a_srs {srs} {directory_dalles}{name_dalle}.tif", shell=True)
    print(f"gdal_edit.py -a_ullr {x_min} {y_min} {x_max} {y_max} -a_srs {srs} {directory_dalles}{name_dalle}.tif")
    # cmd qui convertit du tif en jp2
    conversion = "kdu_compress -i " + directory_dalles + name_dalle + ".tif" + " -o " + directory_dalles + name_dalle + ".jp2" " -rate 1.2 Sprofile=PROFILE1 Clayers=12 Clevels=8 Cblk='{64,64}' ORGgen_plt=yes Cprecincts='{256,256},{256,256},{128,128}' Corder=RPCL ORGtparts=R"
    tif_to_jp2 = subprocess.run(conversion, shell=True)
    print(conversion)
    # on supprime le tif qui nous servait à telecharger la dalle, mais c'est le jp2 qui est envoyer dans le zip
    os.remove(f"{directory_dalles}{name_dalle}.tif") 
