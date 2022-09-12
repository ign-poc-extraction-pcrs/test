// limite de selection de dalle
limit_select_dalle = 10

// taille dalle
pas = 200

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
}).setView([46.60, 2.045], 7);


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
    "base": {
        "fill_color": "white",
        "weight": 2,
        "opacity": 1,
        "color": "#000",
        "dash_array": "0",
        "fill_opacity": 0.2
    },
    "click": {
        "fill_color": "#f3ca20",
        "weight": 2,
        "opacity": 1,
        "color": '#000',
        "dash_array": "4",
        "fill_opacity": 0.7
    },
    "fly_over_whithout_click": {
        "fill_color": "white",
        "weight": 1,
        "opacity": 0,
        "color": '',
        "dash_array": "4",
        "fill_opacity": 0.7
    },
    "fly_over_click": {
        "fill_color": "white",
        "weight": 2,
        "opacity": 1,
        "color": "#000",
        "dash_array": "0",
        "fill_opacity": 0.4
    }
}

function popup(layer, type = "open") {
    "function qui affiche une popup, au survol d'une dalle son nom"
    nom_dalle = layer.feature["properties"].nom;
    template = `<h4>${nom_dalle}</h4>`

    if (type == "open") {
        layer.bindPopup(template).openPopup()
    } else {
        layer.bindPopup(template).closePopup()
    }

}

// reprojection en epsg2154
proj4.defs("EPSG:2154", "+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

function design_name_dalle_zoom() {
    if (map.getZoom() == 17) {
        labels_polygon.forEach(label => {
            label.style.fontSize = '30px';
            label.style.marginLeft = "-40px";
            label.style.marginTop = "-80px";
        })
    }else if(map.getZoom() == 18){
        labels_polygon.forEach(label => {
            label.style.fontSize = '40px';
            label.style.marginLeft = "-45px";
            label.style.marginTop = "-120px";
        })
    }
    else if(map.getZoom() == 16){
        labels_polygon.forEach(label => {
            label.style.fontSize = '20px';
            label.style.marginLeft = "-25px";
            label.style.marginTop = "-50px";
        })
    }
    else{
        labels_polygon.forEach(label => {
            label.style.fontSize = '10px';
            label.style.marginLeft = "-15px";
            label.style.marginTop = "-25px";
        })
    }
}


// // Make a request for a user with a given ID
// axios.get('http://127.0.0.1:5000/api/get/dalle')
//     .then(function (response) {
//         dalles_json = response.data.result.dalles
//         dalles = create_dalle(dalles_json)
//         // permet d'affiche le dallage au dessus des autres couches
//         map.createPane('dallage');
//         map.getPane('dallage').style.zIndex = 500;

//         // on la dalle à la carte
//         geojson = L.geoJson(dalles, {
//             style: style(param_base["color"], param_base["weight"], param_base["opacity"], param_base["fill_color"], param_base["dash_array"], param_base["fill_opacity"]),
//             onEachFeature: onEachFeature,
//             pane: 'dallage'
//         }).addTo(map);
//     })
//     .catch(function (error) {

//         console.log(error);
//     })
//     .then(function () {
//         // always executed
//     });

geojson = []
markers = null
function display_dalle() {
    const proj4_2154 = "+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
    proj4.defs("EPSG:2154", proj4_2154);
    const converter = proj4("EPSG:2154");


    var northEast = map.getBounds()._northEast
    var southWest = map.getBounds()._southWest

    northEast = converter.forward([northEast.lng, northEast.lat])
    southWest = converter.forward([southWest.lng, southWest.lat])
    northWest = [northEast[0],southWest[1]]
    southEast = [southWest[0],northEast[1]]

    
    // Make a request for a user with a given ID
    axios.get(`http://pcrs-dev.ign.fr/api/get/dalles/${northEast[0]}/${southWest[1]}/${southWest[0]}/${northEast[1]}`)
    .then(function (response) {
        if(response.data.statut == "erreur"){
            window.alert("Nous rencontrons un probléme, nous travaillons dessus")
        }else{
            dalles_json = response.data.result
            
            if (map.getZoom() >= 15){
                if (markers != null){
                    map.removeLayer(markers)
                }
                
                dalles = create_dalle(dalles_json)
                // permet d'affiche le dallage au dessus des autres couches
                map.createPane('dallage');
                map.getPane('dallage').style.zIndex = 500;

                display_none_dalle()

                // on la dalle à la carte
                geojson = L.geoJson(dalles, {
                    style: style(param_base["color"], param_base["weight"], param_base["opacity"], param_base["fill_color"], param_base["dash_array"], param_base["fill_opacity"]),
                    onEachFeature: onEachFeature,
                    pane: 'dallage'
                }).addTo(map);     
            

                display_level_zoom()

                labels_polygon = document.querySelectorAll(".label-nom")
                labels_polygon.forEach(label => {
                    // on modifie le style des labels
                    label.style.marginLeft = "-18px";
                    label.style.marginTop = "-30px";
                    label.style.color = "white";
                    label.style.fontWeight = '800';
                    label.style.fontSize = '10px';
                    // on cache les noms au chargement de la page, il ne doivent être affiché que si la checkbox est coché
                    input_display_nom_dalle = document.querySelector(".couche_optionnel_nom_dalle");
                    if(input_display_nom_dalle.checked){
                        label.style.display = "block"
                    }else{
                        label.style.display = "none"
                    }
                    
                });
                design_name_dalle_zoom()

                // recuperation des boutons de la liste des dalles pour pouvoir redesigner les dalles quand on bouge la carte
                document.querySelectorAll(".remove_design_dalle").forEach(button => {
                    id = button.className.split(' ')[1];
                    dalle = document.querySelector(`.${id}`); 

                    // param_click["color"], param_click["weight"], param_click["opacity"], param_click["fill_color"], param_click["dash_array"], param_click["fill_opacity"]
                    dalle.setAttribute("stroke", param_click["fill_color"]) 
                    dalle.setAttribute("fill", param_click["color"]) 
                    dalle.setAttribute("width", param_click["weight"]) 
                    dalle.setAttribute("fill-opacity", param_click["fill_opacity"]) 
                    dalle.setAttribute("stroke-opacity", param_click["opacity"]) 
                    dalle.setAttribute("stroke-dasharray", param_click["dash_array"]) 
                });
        }else{
            display_none_dalle()
            display_level_zoom()
            if (markers != null){
                map.removeLayer(markers)
            }

            markers = new L.MarkerClusterGroup();

            dalles_json.forEach(dalle => {
                coordonnee = converter.inverse([dalle["x_max"], dalle["y_max"]])
                marker = new L.Marker(new L.LatLng(coordonnee[1], coordonnee[0]));
                // marker.bindPopup("dalle");
                marker.on('click', function(e){
                    map.setView(e.latlng, 15);
                });
                
                markers.addLayer(marker);
                
            });
            map.addLayer(markers);
        }
    }
        
    })
    .catch(function (error) {

        console.log(error);
    })
    .then(function () {
        // always executed
    });
}

function create_dalle(dalles_json) {
    const proj4_2154 = "+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
    proj4.defs("EPSG:2154", proj4_2154);
    const converter = proj4("EPSG:2154");
    // on definit le dictionnaire avec la nomenclature leaflet et on ajoutera les différents polygons dans la clé attributs
    let dallage = {
        "type": "FeatureCollection",
        "features": [],
    }
    convertisseur = proj4("EPSG:2154")
    id = 0

    for (let dalle of dalles_json) {
        var x_min = dalle["x_min"]
        var y_max = dalle["y_max"]
        var x_max = dalle["x_max"]
        var y_min = dalle["y_min"]

        for (let x = x_min; x < x_max; x += pas) {
            for (let y = y_min; y < y_max; y += pas) {
                id += 1
                dallage["features"].push({
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [
                            [
                                // on change la projection les coordonnées
                                converter.inverse([x, y]),
                                converter.inverse([x + pas, y]),
                                converter.inverse([x + pas, y + pas]),
                                converter.inverse([x, y + pas]),
                                converter.inverse([x, y]),
                            ]
                        ]
                    },
                    "properties": {
                        "id": `id0${x / 100}_${y / 100 + 2}`,
                        "nom": `2020-0${x / 100}-${y / 100 + 2}-LA93-0M05-RVB`,
                        "extension": "tiff",
                        "x": `0${x / 100}`,
                        "y": y / 100 + 2
                    }
                });
            }
        }

        
    }

    return dallage
}

function display_none_dalle() {
    // suppresion des dalles et nomdes dalles à chaque fois qu'on se déplace
    map.removeLayer(geojson)
    document.querySelectorAll(".label-nom").forEach(span => {
        span.remove()
    });
}

function display_level_zoom() {
    // affiche le niveau de zoom dans le petit menu
    zoom_menu = document.querySelector(".text-alert-zoom")
    zoom_menu.innerHTML = `Zoom: ${map.getZoom()}</br>`
}




// on ajoute les dalles (carré) par rapport à aux coordonnées du dallage
// for (let x = x_min; x < x_max; x += pas) {
//     for (let y = y_min; y < y_max; y += pas) {
//         if(x != 238000 || y + pas > 6736400){
//             id += 1
//             dallage["features"].push({
//                 "type": "Feature",
//                 "geometry": {
//                     "type": "Polygon",
//                     "coordinates": [
//                         [
//                             // on change de projection les coordonnées
//                             convertisseur.inverse([x, y])
//                             ,
//                             convertisseur.inverse([x + pas, y])
//                             ,
//                             convertisseur.inverse([x + pas, y + pas])
//                             ,
//                             convertisseur.inverse([x, y + pas])
//                             ,
//                             convertisseur.inverse([x, y])
//                         ]
//                     ]
//                 }, 
//                 "properties": {
//                     "id" : id,
//                     "nom" : `2020-0${x/100}-${(y + pas)/100}-LA93-0M05-RVB`,
//                     "extension" : "tiff",
//                     "x": `0${x/100}`,
//                     "y":(y + pas)/100
//                 }
//             })
//         }
//     }

// }

function nomenclature_download(dalle) {
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
    return { "min": min, "max": max, "annee": annee, "proj": proj, "resolution": resolution, "canaux": canaux }
}

// on veut afficher les dalles au chargement de la page
display_dalle()
map.on('moveend', function() { 
    display_dalle()
});