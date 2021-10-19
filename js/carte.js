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

var data = {};

// Selecteur fonds de carte

L.control.layers(baselayers, data, { collapsed: false }).addTo(map);


// Echelle cartographique
L.control.scale().addTo(map);
L.Control.geocoder().addTo(map);

// reprojection en epsg2154
proj4.defs("EPSG:2154", "+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

// on definit le dictionnaire avec la nomenclature leaflet et on ajoutera les différents polygons dans la clé attributs
let dallage = {
    "type": "FeatureCollection",
    "features": [],
}

convertisseur = proj4("EPSG:2154")
id = 0
// on ajoute les dalles (carré) par rapport à aux coordonnées du dallage
for (let x = x_min; x < x_max; x += pas) {
    for (let y = y_min; y < y_max; y += pas) {
        id += 1
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
            }, 
            "properties": {
                "id" : id,
                "nom" : `PCRS-D56-2020-${x/100}-${(y + pas)/100}-LA93-0M05-RVB-TIFF`,
                "extension" : "tiff"
            }
        })
    }

}

function highlightFeature(e) {
    "Changement de design des dalles quand on survole une dalle"
    var layer = e.target;
    highlight_whithout_click(layer)
    popup(layer)
}

function resetHighlight(e) {
    "remet le design normal, tout depend du design si la dalle a été clicker ou non"
    var layer = e.target
    geojson.resetStyle(layer);
    popup(layer, "close")
}

function click(e) {
    "changement de design et recuperation des données quand on clique sur une dalle"
    var layer = e.target;
    dalle = layer.feature
    console.log(dalle);
}


function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: click
    });
}



// on ajoute le dallage à la carte
geojson = L.geoJson({
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    // on change de projection les coordonnées
                    convertisseur.inverse([x_min, y_min])
                    ,
                    convertisseur.inverse([x_max, y_min])
                    ,
                    convertisseur.inverse([x_max, y_max])
                    ,
                    convertisseur.inverse([x_min, y_max])
                    ,
                    convertisseur.inverse([x_min, y_min])
                ]
            ]
        }
    }],
},
    {
        style: style("#fff", 5, 0.6, '#ad0000', '8', 0)
    }).addTo(map);

// on la dalle à la carte
geojson = L.geoJson(dallage, {
    style: style(param_base["color"], param_base["weight"], param_base["opacity"], param_base["fill_color"], param_base["dash_array"], param_base["fill_opacity"]),
    onEachFeature: onEachFeature
}).addTo(map);