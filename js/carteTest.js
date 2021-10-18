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
                "id" : id
            }
        })
    }

}

// affiche le style pour chaque dalle
function style(fillColor, weight, opacity, color, dashArray, fillOpacity) {
    return {
        fillColor: fillColor,
        weight: weight,
        opacity: opacity,
        color: color,
        dashArray: dashArray,
        fillOpacity: fillOpacity
    };
}

// parametre à changer pour le design des dalles
var params_design = {
    "base" : {
        "fill_color" : "white",
        "weight" : 2,
        "opacity" : 1,
        "color" : "#000",
        "dash_array" : "0",
        "fill_opacity" : 0.2
    },
    "click": {
        "weight" : 2,
        "color" : '#f0ff00',
        "dash_array" : "4",
        "fill_opacity" : 0.7
    },
    "fly_over_whithout_click" : {
        "opacity" : 0,
        "color" : ''
    },
    "fly_over_click" : {
        "fill_opacity" : 0.4
    }
}
// recupere les parametre de base au chargement de la base
var param_base = params_design["base"]
var param_click = params_design["click"]
var param_fly_over_whithout_click = params_design["fly_over_whithout_click"]
var param_fly_over_click = params_design["fly_over_click"]


function highlight_whithout_click(layer) {

    "design quand on survole une dalle non clicker"
    layer.setStyle(style(param_base["color"], param_base["opacity"], param_fly_over_whithout_click["opacity"], param_fly_over_whithout_click["color"], param_click["dash_array"], param_click["fill_opacity"]));
}
function highlight_click(layer) {
    "design quand on survole une dalle clicker"
    layer.setStyle(style(param_base["color"], param_base["weight"], param_base["opacity"], param_base["fill_color"], param_base["dash_array"], param_fly_over_click["fill_opacity"]));
}

function highlightFeature(e) {
    "Changement de design des dalles quand on survole une dalle, design différents quand la dalle a déjà été cliquer ou non"
    var layer = e.target;
    // si la dalle n'est pas cliquer
    if (layer.options.color == param_base["fill_color"]) {
        highlight_whithout_click(layer)
    } else {
        highlight_click(layer)
    }
    layer.bindPopup('<h1>hey</h1>').openPopup()
}

function design_click(layer){
    "design quand on click sur une dalle"
    layer.setStyle(style(param_base["color"], param_click["weight"], param_base["opacity"], param_click["color"], param_click["dash_array"], param_click["fill_opacity"]));
}

function resetHighlight(e) {
    "remet le design normal, tout depend du design si la dalle a été clicker ou non"
    var layer = e.target
    // si la dalle a été survolé mais pas clicker auparavant
    if (!layer.options.color) {
        geojson.resetStyle(layer);
    }
    //  si on survole on dalle clicker
    else if (layer.options.color == param_base["fill_color"] && layer.options.fillOpacity == param_fly_over_click["fill_opacity"]) {
        design_click(layer)
    }
    layer.bindPopup('<h1>hey</h1>').closePopup()
}

function already_click(layer) {
    "design quand on click sur une dalle déjà clicker"
    layer.setStyle(style(param_base["color"], param_base["weight"], param_base["opacity"], param_base["fill_color"], param_base["dash_array"], param_base["fill_opacity"]));
}

liste_dalle = []

function remove_dalle_liste(liste_dalle, dalle) {
    liste = []
    liste_dalle.forEach(element => {
        if (dalle != element){
            liste.push(element)
        }
    });
    return liste
}


function click(e) {
    "changement de design et recuperation des données quand on clique sur une dalle"
    var layer = e.target;
    dalle = layer.feature["geometry"]

    if (!layer.options.color && layer.options.fillOpacity == param_click["fill_opacity"]) {
        design_click(layer)
        if(!liste_dalle) {
            liste_dalle = []
        }
        liste_dalle.push(dalle)
    } else if (layer.options.fillOpacity == param_fly_over_click["fill_opacity"]) {
        already_click(layer)
        liste_dalle = remove_dalle_liste(liste_dalle, dalle)
    }
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    console.log(liste_dalle);
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
    style: style(param_base["color"], param_base["weight"], param_base["opacity"], params_design["base"]["fill_color"], param_base["dash_array"], param_base["fill_opacity"]),
    onEachFeature: onEachFeature
}).addTo(map);