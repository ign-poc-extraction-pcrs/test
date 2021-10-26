from flask import Blueprint, render_template, request, redirect, url_for, send_file
from owslib.wms import WebMapService
import requests
import os

pcrs = Blueprint('pcrs', __name__, url_prefix='/')

@pcrs.route('/')
def index():
    return redirect(url_for('pcrs.version1'))


@pcrs.route('/version1')
def version1():
    # creation du dossier img si il n'existe pas
    os.makedirs("app/static/img", exist_ok=True)
    # on stocke l'image dans un dossier en la recuperant avec une requete wms avec sa bbox, avant de lui faire ses traitements
    requete_wms((244000,6736400,244200,6736600))

    if os.path.isfile("app/static/img/test.tif"):
        return redirect(url_for('pcrs.download', name = "test"))
        
    return render_template('pages/version1.html')


@pcrs.route('/version2')
def version2():
    return render_template('pages/version2.html')

@pcrs.route('/download/<name>')
def download(name):
    file = os.path.abspath(f"app/static/img/{name}.tif")
    return send_file(file)


def log_wms_serveur():
    """ connexion au serveur wms"""
    os.environ['https_proxy'] = "http://proxy.ign.fr:3128"
    os.environ['http_proxy'] = "http://proxy.ign.fr:3128"
    os.environ['HTTPS_PROXY'] = "http://proxy.ign.fr:3128"
    os.environ['HTTP_PROXYS'] = "http://proxy.ign.fr:3128"
    wms = WebMapService('https://vectortiles.ign.fr/wms', version='1.3.0')
    return wms

def requete_wms(bbox):
    """ on recupere la dalle à l'aide de la bbox, et on execute le requete wms, et on save l'img dans le dossier temporairement
    
    bbox(tuple): bbox d'une dalle
    """
    wms = log_wms_serveur()
    dalle = wms.getmap(
        layers=['PCRS'],
        format='image/tiff',
        srs='EPSG:2154',
        bbox=bbox,
        style=[],
        size=(1000,1000)
        )
    x_min, y_min, x_max, y_max = bbox
    img = open(f'app/static/img/2020-{x_min}-{y_max}-LA93-0M05-RVB.tif', 'wb')
    img.write(dalle.read())
    img.close()