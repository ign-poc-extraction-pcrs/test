//Appel et configuration carte
var map = L.map('map', {
    center: [47.57, -3.065],
    zoom: 15
});


// Ajout fonds de carte (WMS)
var baselayers = {


    PlanIGNV2: L.tileLayer('https://wxs.ign.fr/choisirgeoportail/geoportail/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=PM&tilematrix={z}&tilecol={x}&tilerow={y}&layer=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&format=image/png&style=normal'),
    OrthoImage: L.tileLayer('https://wxs.ign.fr/choisirgeoportail/geoportail/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=PM&tilematrix={z}&tilecol={x}&tilerow={y}&layer=ORTHOIMAGERY.ORTHOPHOTOS&format=image/jpeg&style=normal'),

}; baselayers.PlanIGNV2.addTo(map);

// // Ajout du bati en wms comme couche 
// var Parcelbati = L.tileLayer.wms('http://mapsref.brgm.fr/wxs/refcom-brgm/refign',
//     { layers: 'PARVEC_BATIMENT', format: 'image/png', transparent: true }).addTo(map);

// // Ajout du cadatre en wms comme couche 

// var Cadastre = L.tileLayer.wms('http://geobretagne.fr/geoserver/cadastre/wms',
//     { layers: 'CP.CadastralParcel', format: 'image/png', transparent: true }).addTo(map);

// // Ajout des amanegements cyclables en wms comme couche 

// var Routes = L.tileLayer.wms('https://public.sig.rennesmetropole.fr/geoserver/ows?',
//     { layers: 'ref_rva:vgs_troncon_domanialite', format: 'image/png', transparent: true });

// var pcrs = L.tileLayer.wms('https://vectortiles.ign.fr/wms?',
//     { crs: "CRS:84", format: "image/png", layers: "PCRS", version: "1.3.0" });

// Gestion des couches

var data = {};

// Selecteur fonds de carte

L.control.layers(baselayers, data, { collapsed: false }).addTo(map);


// Echelle cartographique
L.control.scale().addTo(map);
L.Control.geocoder().addTo(map);


// 4 coordonnées pour creer le dallages
x_min = 244000.000
x_max = 245000.000

y_min = 6736000.000
y_max = 6737000.000

// taille dalle
pas = 200

// reprojection en epsg2154
proj4.defs("EPSG:2154", "+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

// on definit le dictionnaire avec la nomenclature leaflet et on ajoutera les différents polygons dans la clé attributs
let dallage = {
    "type": "FeatureCollection",
    "features": [],
}

convertisseur = proj4("EPSG:2154")
// on ajoute les dalles (carré) par rapport à aux coordonnées du dallage
for (let x = x_min; x < x_max; x += pas) {
    for (let y = y_min; y < y_max; y += pas) {
        dallage["features"].push({
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                    // on change de projection les coordonnées
                    convertisseur.inverse([x, y])
                        ,
                    convertisseur.inverse([x + pas, y])
                        ,
                    convertisseur.inverse([x + pas, y + pas])
                        ,
                    convertisseur.inverse([x, y + pas])
                        ,
                    convertisseur.inverse([x, y])
                ]
                ]
            }
        })
    }

}


// affiche le style pour chaque dalle
function style(feature) {
    return {
        fillColor: "#000",
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '4',
        fillOpacity: 0.7
    };
}



// on la dalle à la carte
geojson = L.geoJson(dallage, {
    style: style
}).addTo(map);