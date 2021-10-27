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

    document.location.href=`/download/${min[0]}-${min[1]}-${max[0]}-${max[1]}-${annee}-${proj}-${resolution}-${canaux}`;

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