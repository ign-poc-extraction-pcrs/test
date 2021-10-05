// mot de passe git : Pocpcrs22!

dict_mainLayer = {"ign": L.tileLayer(
    'https://wxs.ign.fr/choisirgeoportail/geoportail/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=PM&tilematrix={z}&tilecol={x}&tilerow={y}&layer=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&format=image/png&style=normal',
    {
        minZoom: 0,
        maxZoom: 18,
        tileSize: 256,
        attribution: "IGN-F/Géoportail"
    }),
    "autre" : L.tileLayer(
        'https://wxs.ign.fr/choisirgeoportail/geoportail/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=PM&tilematrix={z}&tilecol={x}&tilerow={y}&layer=ORTHOIMAGERY.ORTHOPHOTOS&format=image/jpeg&style=normal',
        {
            minZoom: 0,
            maxZoom: 18,
            tileSize: 256,
            attribution: "IGN-F/Géoportail"
        })
}

for (let key in dict_mainLayer) {

const mainLayer = dict_mainLayer[key]

const map = L.map(key).setView([46.6, 3.88], 6);
mainLayer.addTo(map)

const info = L.control({position: 'topleft'});

// creation de la popup pour afficher les infos
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this._div.innerHTML = '<h4>Fond de carte</h4> Plan IGN V2 <input type="checkbox" id="checkbox_ign" checked> <br> ORTHOPHOTOS <input type="checkbox" id="checkbox_autre"></input>'
    return this._div;
    };

info.addTo(map)

L.Control.geocoder().addTo(map);
}