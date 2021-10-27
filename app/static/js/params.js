// limite de selection de dalle
limit_select_dalle = 10

// taille dalle
pas = 200

// 4 coordonnées pour creer le dallages et dalles
x_min = 244000.000
x_max = 245000.000

y_min = 6736000.000
y_max = 6737000.000

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
                "nom" : `2020-${x/100}-${(y + pas)/100}-LA93-0M05-RVB`,
                "extension" : "tiff"
            }
        })
    }

}