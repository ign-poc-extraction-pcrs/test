//Appel et configuration carte
  
var map = L.map('map', {
    center: [48.11, -1.66],
    zoom: 18 });


// Ajout fonds de carte (tile et WMS)

var baselayers = {

// Services de tuiles clasiques

PlanIGNV2 : L.tileLayer('https://wxs.ign.fr/choisirgeoportail/geoportail/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=PM&tilematrix={z}&tilecol={x}&tilerow={y}&layer=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&format=image/png&style=normal'),
OrthoImage: L.tileLayer('https://wxs.ign.fr/choisirgeoportail/geoportail/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=PM&tilematrix={z}&tilecol={x}&tilerow={y}&layer=ORTHOIMAGERY.ORTHOPHOTOS&format=image/jpeg&style=normal'),

};baselayers.PlanIGNV2.addTo(map);

// Ajout du bati en wms comme couche 
var Parcelbati = L.tileLayer.wms('http://mapsref.brgm.fr/wxs/refcom-brgm/refign', 
             {layers: 'PARVEC_BATIMENT',format: 'image/png',transparent:true}).addTo(map); 

// Ajout du cadatre en wms comme couche 

var Cadastre = L.tileLayer.wms('http://geobretagne.fr/geoserver/cadastre/wms', 
{layers: 'CP.CadastralParcel',format: 'image/png',transparent: true}).addTo(map); 

// Ajout des amanegements cyclables en wms comme couche 

var Routes = L.tileLayer.wms('https://public.sig.rennesmetropole.fr/geoserver/ows?', 
             {layers: 'ref_rva:vgs_troncon_domanialite',format: 'image/png',transparent:true}); 

// Gestion des couches

var data = {"Parcelbati": Parcelbati, "Cadastre": Cadastre, "Routes": Routes};

// Selecteur fonds de carte

L.control.layers(baselayers, data, {collapsed : false}).addTo(map);	 

// Echelle cartographique

L.control.scale().addTo(map);

L.Control.geocoder().addTo(map);