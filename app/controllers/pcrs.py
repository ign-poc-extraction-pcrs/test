from flask import Blueprint, render_template, request, redirect, url_for, send_file, jsonify
from owslib.wms import WebMapService
import requests
import os
import subprocess

pcrs = Blueprint('pcrs', __name__, url_prefix='/')

@pcrs.route('/')
def index():
    return redirect(url_for('pcrs.version1'))


@pcrs.route('/version1')
def version1():
    

    # if os.path.isfile("app/static/img/2020-244000-6736600-LA93-0M05-RVB.tif"):
    #     return redirect(url_for('pcrs.download', name = "2020-244000-6736600-LA93-0M05-RVB"))
        
    return render_template('pages/version1.html')


@pcrs.route('/version2')
def version2():
    return render_template('pages/version2.html')

@pcrs.route('/download/<int:x_min>-<int:y_min>-<int:x_max>-<int:y_max>-<annee>-<proj>-<resolution>-<canaux>')
def download(x_min, y_min, x_max, y_max, annee, proj, resolution, canaux):
    directory_dalles = "app/static/img/"
    name_dalle = f"{annee}-0{x_min//100}-{y_max//100}-{proj}-{resolution}-{canaux}.tif"

    # creation du dossier img si il n'existe pas
    os.makedirs(directory_dalles, exist_ok=True)

    # si la dalle est déjà dans le dossier img, alors on ne refait pas le requete wms et le géoreferencement, on la télécharge directement
    if not os.path.isfile(f"{directory_dalles}{name_dalle}"):
        # on stocke l'image dans un dossier en la recuperant avec une requete wms avec sa bbox, avant de lui faire ses traitements
        requete_wms_and_georeferecement((x_min,y_min,x_max,y_max), directory_dalles, name_dalle)

    # on recupere le chemin absolu de l'image
    file = os.path.abspath(f"{directory_dalles}{name_dalle}")
    return send_file(file)


def log_wms_serveur():
    """ connexion au serveur wms"""
    os.environ['https_proxy'] = "http://proxy.ign.fr:3128"
    os.environ['http_proxy'] = "http://proxy.ign.fr:3128"
    os.environ['HTTPS_PROXY'] = "http://proxy.ign.fr:3128"
    os.environ['HTTP_PROXYS'] = "http://proxy.ign.fr:3128"
    wms = WebMapService('https://vectortiles.ign.fr/wms', version='1.3.0')
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
        size=(1000,1000)
        )
    img = open(f'{directory_dalles}{name_dalle}', 'wb')
    img.write(dalle.read())
    img.close()

    x_min,y_min,x_max,y_max = bbox
    status = subprocess.run(f"gdal_edit.py -a_ullr {x_min} {y_min} {x_max} {y_max} -a_srs {srs} {directory_dalles}{name_dalle}", shell=True)
    print(f"gdal_edit.py -a_ullr {x_min} {y_min} {x_max} {y_max} -a_srs {srs} {directory_dalles}{name_dalle}")
