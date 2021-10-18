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
                "nom" : `PCRS-D56-2021-${x/100}-${(y + pas)/100}-LA93-0M05-RVB-TIFF`,
                "extension" : "tiff"
            }
        })
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

function highlightFeature(e) {
    "Changement de design des dalles quand on survole une dalle, design différents quand la dalle a déjà été cliquer ou non"
    var layer = e.target;
    // si la dalle n'est pas cliquer
    if (layer.options.color == param_base["fill_color"]) {
        highlight_whithout_click(layer)
    } else {
        highlight_click(layer)
    }
    popup(layer)
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
        console.log(1);
    }
    popup(layer, "close")
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
        
        if(!liste_dalle) {
            liste_dalle = []
        }
        if (liste_dalle.length <= limit_select_dalle - 1){
            design_click(layer)
            liste_dalle.push(dalle)
        }else{
            window.alert("tu ne peux séléctionner que 10 dalles maximum")
            geojson.resetStyle(layer);
        }
        
    } else if (layer.options.fillOpacity == param_fly_over_click["fill_opacity"]) {
        already_click(layer)
        liste_dalle = remove_dalle_liste(liste_dalle, dalle)
    }
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
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