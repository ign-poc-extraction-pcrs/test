var data = {};

// Selecteur fonds de carte

L.control.layers(baselayers, data, { collapsed: false }).addTo(map);


// Echelle cartographique
L.control.scale().addTo(map);
L.Control.geocoder().addTo(map);

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
    
    // on recupere les coordonnées de la dalle
    dalle = layer.feature.geometry.coordinates[0]
    info_dalle = nomenclature_download(dalle)
    document.location.href=`/download/${info_dalle.min[0]}-${info_dalle.min[1]}-${info_dalle.max[0]}-${info_dalle.max[1]}-${info_dalle.annee}-${info_dalle.proj}-${info_dalle.resolution}-${info_dalle.canaux}`;
    // on telecharge l'image select
    // url = `https://vectortiles.ign.fr/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=PCRS&FORMAT=image/tiff&BBOX=${min[0]},${min[1]},${max[0]},${max[1]}&CRS=EPSG:2154&STYLES=&WIDTH=1000&HEIGHT=1000&`
    // window.open(url, '_blank');
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

// menu qui va afficher une info : "Cliquer sur une dalle pour la télécharger dans la version"
const info_menu = L.control();

// creation de la popup pour afficher l'info_menu
info_menu.onAdd = function (map) {
    // creation de la div
    this._div = L.DomUtil.create('div', 'info');
    if (!L.Browser.touch) {
        L.DomEvent
            .disableClickPropagation(this._div)
            .disableScrollPropagation(this._div);
    } else {
        L.DomEvent.on(this._div, 'click', L.DomEvent.stopPropagation);
    }
    this._div.innerHTML = "Cliquer sur une dalle pour la télécharger"
    return this._div;
};

info_menu.addTo(map)