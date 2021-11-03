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


function highlightFeature(e) {
    "Changement de design des dalles quand on survole une dalle, design différents quand la dalle a déjà été cliquer ou non"
    var layer = e.target;
    // si la dalle n'est pas cliquer
    if (layer._path.getAttribute("stroke") == param_base["fill_color"]) {
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
    }
    popup(layer, "close")
}

liste_dalle = []
new_liste_dalle = []
statut = true

function remove_dalle_liste(liste_dalle, dalle) {
    "supprime un element d'une liste"
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
    dalle = layer.feature
    console.log(statut);
    if (!statut){
        liste_dalle = new_liste_dalle
    }
    statut = true
    
    if (!layer.options.color && layer.options.fillOpacity == param_click["fill_opacity"]) {
        // si la liste n'existe pas
        if(!liste_dalle) {
            liste_dalle = []
        }
        // si la liste n'a pas depasser la limite de dalle max
        if (liste_dalle.length <= limit_select_dalle - 1){
            design_click(layer)
            liste_dalle.push(dalle)
        }else{
            window.alert("La sélection ne peut excéder 10 dalles")
            geojson.resetStyle(layer);
        }
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
        
    } else if (layer.options.fillOpacity == param_fly_over_click["fill_opacity"]) {
        already_click(layer)
        liste_dalle = remove_dalle_liste(liste_dalle, dalle)
    }

    dalles_download.update(liste_dalle)
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
    style: style(param_base["color"], param_base["weight"], param_base["opacity"], param_base["fill_color"], param_base["dash_array"], param_base["fill_opacity"]),
    onEachFeature: onEachFeature
}).addTo(map);

dalles = document.querySelectorAll(".leaflet-interactive")
dalles.forEach((dalle, key) => {
    if (key != 0){
        dalle.classList.add(`id${key}`)
    }
});