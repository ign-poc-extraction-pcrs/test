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