// limite de selection de dalle
limit_select_dalle = 10

// taille dalle
pas = 200

// 4 coordonnées pour creer le dallages et dalles
x_min = 238000.000
x_max = 252000.000

y_min = 6736000.000
y_max = 6743000.000

// Source : https://epsg.io/2154.proj4
var proj4_2154 = "+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
var bounds = L.bounds([-378305.81, 6093283.21], [1212610.74, 7186901.68]);
// Source : https://github.com/IGNF/geoportal-extensions/blob/c606b749e060c5efc1a30137a1ed1d6d4ef47bfe/src/Leaflet/CRS/EPSG2154.js
var resolutions = [104579.22454989408, 52277.53235379051, 26135.487078595408, 13066.891381800004, 6533.228604113456, 3266.5595244626675, 1633.2660045974187, 816.6295549860224, 408.31391467683596, 204.15674151090204, 102.07831678324082, 51.0391448966112, 25.519569074269395, 12.759783693647506, 6.379891635966491, 3.18994576530532, 1.5949728694977277, .7974864315474559, .398743214900604, .19937160727567999, .099685803696052, .049842901818919996];
var origin = [0, 12000000];

// Création du crs_2154
var crs_2154 = new L.Proj.CRS('EPSG:2154', proj4_2154, {
    resolutions: resolutions,
    origin: origin,
    bounds: bounds
});

// Création d'une carte en 2154
var map = L.map('map', {
    crs: crs_2154,
    continuousWorld: true,
}).setView([47.60, -3.045], 13);


// Ajout fonds de carte (WMS)
var baselayers = {


    PlanIGNV2: L.tileLayer.wms('https://wxs.ign.fr/essentiels/geoportail/r/wms?', {
        layers: 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2',
    }),
    OrthoImage: L.tileLayer.wms('https://wxs.ign.fr/essentiels/geoportail/r/wms?', {
        layers: 'ORTHOIMAGERY.ORTHOPHOTOS',
    }),
    Pcrs: L.tileLayer.wms('https://wxs.ign.fr/ortho/geoportail/r/wms?', {
        layers: 'PCRS.LAMB93',
    })
   
                             
    
}; baselayers.PlanIGNV2.addTo(map);

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
        "fill_color" : "#f3ca20",
        "weight" : 2,
        "opacity" : 1,
        "color" : '#000',
        "dash_array" : "4",
        "fill_opacity" : 0.7
    },
    "fly_over_whithout_click" : {
        "fill_color" : "white",
        "weight" : 1,
        "opacity" : 0,
        "color" : '',
        "dash_array" : "4",
        "fill_opacity" : 0.7
    },
    "fly_over_click" : {
        "fill_color" : "white",
        "weight" : 2,
        "opacity" : 1,
        "color" : "#000",
        "dash_array" : "0",
        "fill_opacity" : 0.4
    }
}

function popup(layer, type="open"){
    "function qui affiche une popup, au survol d'une dalle son nom"
    nom_dalle = layer.feature["properties"].nom;
    template = `<h4>${nom_dalle}</h4>`

    if (type == "open"){
        layer.bindPopup(template).openPopup()
    }else{
        layer.bindPopup(template).closePopup()
    }
    
}

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
        if(x != 238000 || y + pas > 6736400){
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
                    "nom" : `2020-0${x/100}-${(y + pas)/100}-LA93-0M05-RVB`,
                    "extension" : "tiff",
                    "x": `0${x/100}`,
                    "y":(y + pas)/100
                }
            })
        }
    }

}

function nomenclature_download(dalle){
    dalle_reprojection = []
    // on change de projection, pour la remettre en L93
    dalle.forEach(element => {
        dalle_reprojection.push(convertisseur.forward(element)); 
    });
    // on arrondi les coordinates
    dalle_reprojection.forEach(element => {
        element[0] = Math.round(element[0])
        element[1] = Math.round(element[1])
    });
    // on recupere les x_min et m_max
    min = dalle_reprojection[0]
    max = dalle_reprojection[2]

    annee = 2020
    proj = "LA93"
    resolution = "0M05"
    canaux = "RVB"
    return {"min": min, "max": max, "annee": annee, "proj": proj, "resolution": resolution, "canaux": canaux}
}