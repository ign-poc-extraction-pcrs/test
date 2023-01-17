// Paramètres
const REGEX_X_Y = new RegExp('([0-9]{4})_([0-9]{4})');
// const REGEX_DEP = new RegExp('D[0-9AB]{3}'); // TODO : R93, R94, R01-06, FRA, FRX, FXX, GLP, MTQ, SBA, SMA, MYT, REU, SPM, GUF
const SIZE = 2000;
const DESIGN = {
    "base": {
        "fillColor": "white",
        "weight": 2,
        "opacity": 1,
        "color": "#000",
        "dashArray": "0",
        "fillOpacity": 0.2
    },
    "fly_over": {
        "fillColor": "white",
        "weight": 1,
        "opacity": 0,
        "color": '',
        "dashArray": "4",
        "fillOpacity": 0.7
    }
}
// Source : https://epsg.io/2154.proj4
const proj4_2154 = "+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
const bounds = L.bounds([-378305.81, 6093283.21], [1212610.74, 7186901.68]);
// Source : https://github.com/IGNF/geoportal-extensions/blob/c606b749e060c5efc1a30137a1ed1d6d4ef47bfe/src/Leaflet/CRS/EPSG2154.js
const resolutions = [104579.22454989408, 52277.53235379051, 26135.487078595408, 13066.891381800004, 6533.228604113456, 3266.5595244626675, 1633.2660045974187, 816.6295549860224, 408.31391467683596, 204.15674151090204, 102.07831678324082, 51.0391448966112, 25.519569074269395, 12.759783693647506, 6.379891635966491, 3.18994576530532, 1.5949728694977277, .7974864315474559, .398743214900604, .19937160727567999, .099685803696052, .049842901818919996];
const origin = [0, 12000000];
// Création du converter
proj4.defs("EPSG:2154", proj4_2154);
const converter = proj4("EPSG:2154");
// Param en dur
const DATA_TYPE = "lidarhd";
var map, key;


document.addEventListener("DOMContentLoaded", function () {
    // Création du crs_2154
    var crs_2154 = new L.Proj.CRS('EPSG:2154', proj4_2154, {
        resolutions: resolutions,
        origin: origin,
        bounds: bounds
    });

    // Création d'une carte en 2154
    map = L.map('map', {
        crs: crs_2154,
        continuousWorld: true,
        center: [46.503264422561784, 2.586937060953668],
        zoom: 8,
    });

    // Création et ajout des fonds de carte en 2154
    var orthoImage = L.tileLayer('https://wxs.ign.fr/lambert93/geoportail/wmts?layer={layer}&style=normal&tilematrixset=LAMB93&Service=WMTS&Request=GetTile&VERSION=1.0.0&format=image/jpeg&TileMatrix={z}&TileCol={x}&TileRow={y}', {
        layer: "ORTHOIMAGERY.ORTHOPHOTOS.BDORTHO.L93",
        continuousWorld: true,
    }).addTo(map);
    var planIgnV2 = L.tileLayer.wms('https://wxs.ign.fr/essentiels/geoportail/r/wms?', {
        layers: 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2',
        continuousWorld: true,
    }).addTo(map);

    // Ajout d'un control pour choisir le fond de carte
    var baseMaps = {
        "OrthoImage": orthoImage,
        "Plan IGN": planIgnV2,
    };
    L.control.layers(baseMaps).addTo(map);

    // Ajout échelle et géocodage
    L.control.scale().addTo(map);
    L.Control.geocoder().addTo(map);

    // Pour le debug
    map.on('click', function (e) {
        var coord = e.latlng;
        console.log("You clicked the map at: [" + coord.lat + ", " + coord.lng + "]");
    });

    document.getElementById('form_div').addEventListener('submit', function(e) {
        e.preventDefault();
        // Récupération de la clé et du type de données demandées
        key = document.getElementById('key_input').value;
        var dataType = document.getElementById('dataType').value.toLowerCase();
        // On lance la fonction
        listData(dataType);
    });

    document.getElementById("nb_dalles").textContent = 0
    

    listData(DATA_TYPE);

    
});

function get_serveur() {
    // requete ajax pour recuperer les differentes clé lidar
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "api/get/config/serveur", false);
    xhr.getResponseHeader("Content-type", "application/json");
    xhr.onload = function() {
        const obj = JSON.parse(this.responseText);
        serveur = obj.result
    } 
    xhr.send()
    return serveur
}

function listData(dataType) {
    // On affiche la div de chargement
    document.getElementById("loading_div").style.display = "block";
    // On masque les div d'erreur et de formulaire
    document.getElementById("form_div").style.display = "none";
    document.getElementById("key_error_div").style.display = "none";
    serveur = get_serveur(); 
    // getFeature info
    fetch(`${serveur}/api/version3/get/dalle`)
        .then(function (response) {
            if (response.ok) {
                return response.json();
                
            } else {
                throw Error(response.statusText);
            }
        })
        .then(function (data) {
            // Récupération des ressources LidarHD
            var lidarHdResources = get_resources(data["result"], dataType);
            console.log(lidarHdResources);
            // On affiche text
            document.getElementById("text_div").style.display = "block";
            nb_dalle = parseInt(document.getElementById("nb_dalles").textContent) + lidarHdResources.length;
            document.getElementById("nb_dalles").textContent = nb_dalle;

            // Création du dallage
            var dallage = create_dallage(lidarHdResources);

            // Ajout du dallage
            add_dallage(dallage);
        })
        .catch(function() {
            // On affiche les div de formulaire et d'erreur, on masque celle de dalle et de text
            document.getElementById("form_div").style.display = "block";
            document.getElementById("key_error_div").style.display = "block";
            document.getElementById("dalle_div").style.display = "none";
            document.getElementById("text_div").style.display = "none";

        }).finally(function () {
            // On masque loading
            document.getElementById("loading_div").style.display = "none";
        })
        ;
}


function get_resources(data, dataType) {
    // Récupération des ressources LidarHD
    var lidarHdResources = [];
    var resources = data
    for (let resource of resources) {

        if (resource.Name.toLowerCase().includes(dataType)) {
            lidarHdResources.push(resource);
        }
        
    }
    return lidarHdResources;
}

function get_files(data) {
    // Récupération des fichiers
    var files = [];
    var domFiles = data.getElementsByTagName("files")[0].getElementsByTagName("file");
    for (let domFile of domFiles) {
        var keyValue = {};
        for (let child of domFile.childNodes) {
            if (child.tagName) {
                keyValue[child.tagName] = child.textContent;
            }
        }
        files.push(keyValue);
    }
    return files;
}

function create_dallage(resources) {
    let dallage = {
        "type": "FeatureCollection",
        "features": [],
    }

    for (let resource of resources) {
        var match_x_y = REGEX_X_Y.exec(resource.Name);
        if (match_x_y) {
            var x_min = parseInt(match_x_y[1]) * 1000;
            var y_max = parseInt(match_x_y[2]) * 1000;
            var x_max = x_min + SIZE;
            var y_min = y_max - SIZE;

            dallage["features"].push({
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            // on change la projection les coordonnées
                            converter.inverse([x_min, y_min]),
                            converter.inverse([x_max, y_min]),
                            converter.inverse([x_max, y_max]),
                            converter.inverse([x_min, y_max]),
                            converter.inverse([x_min, y_min]),
                        ]
                    ]
                },
                "properties": resource,
            });
        } else {
            console.error(resource.Name);
        }
    }

    return dallage;
}

function add_dallage(dallage) {
    // Add layer
    var geojson = L.geoJson(dallage, {
        style: DESIGN.base,
        onEachFeature: function (feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlightFeature,
                click: clickFeature,
            });
        }
    }).addTo(map);
    // Set view
    // map.fitBounds(geojson.getBounds());
    return geojson;
}

function show_popup(layer, type = "open") {
    "Fonction qui affiche une popup, au survol d'une dalle son nom."
    var dalle_name = layer.feature["properties"].Name;
    var dalle_names = dalle_name.split("$");
    var title = dalle_names[0];
    var text = dalle_names[1];
    template = `<h6>${title}</h6><p>${text}</p>`

    if (type == "open") {
        layer.bindPopup(template).openPopup()
    } else {
        layer.closePopup()
    }
}

function highlightFeature(e) {
    "Changement de design des dalles quant on survole une dalle."
    var layer = e.target;
    layer.setStyle(DESIGN.fly_over);
    show_popup(layer);
}
function resetHighlightFeature(e) {
    "Remet le design normal."
    var layer = e.target;
    layer.setStyle(DESIGN.base);
    show_popup(layer, "close");
}
function clickFeature(e) {
    // On affiche la div de chargement
    document.getElementById("loading_div").style.display = "block";
    // On masque la div de dalle
    document.getElementById("dalle_div").style.display = "none";
    // On récupère l'élément cliqué
    var layer = e.target;
    var name = layer.feature["properties"].Name;
    key_lidar = layer.feature["properties"].key
    var match = REGEX_X_Y.exec(name);
    document.getElementById("name").textContent = match[0];
    // Url de la requête pour récupérer les détails de la ressource
    var url = `https://wxs.ign.fr/${key_lidar}/telechargement/prepackage/${name}`;
    // Requête
    fetch(url)
        .then(function (response) {
            if (response.ok) {
                return response.text();
            } else {
                throw Error(response.statusText);
            }
        })
        .then(function (xml) {
            // On parse le document XML
            var parser = new DOMParser();
            var data = parser.parseFromString(xml, "text/xml");

            // Récupération des fichiers
            var files = get_files(data);

            // Affichage des fichiers
            show_files(files, url);

            // On monte la div dalle
            document.getElementById("dalle_div").style.display = "block";
            // On masque la div de chargement
            document.getElementById("loading_div").style.display = "none";
        })
        .catch(function() {
            // On affiche les div de formulaire et d'erreur, on masque celle de dalle et de text
            document.getElementById("form_div").style.display = "block";
            document.getElementById("key_error_div").style.display = "block";
            document.getElementById("dalle_div").style.display = "none";
            document.getElementById("text_div").style.display = "none";
        }).finally(function () {
            // On masque la div de chargement
            document.getElementById("loading_div").style.display = "none";
        })
        ;
}

function show_files(files, base_url) {
    // Récupération de la liste de fichiers
    var ulFiles = document.getElementById('files');
    // Suppression des enfants
    for (let child of ulFiles.childNodes) {
        ulFiles.removeChild(child);
    }
    // Ajout des fichiers
    for (let file of files) {
        var fileName = file.fileName;
        var fileSize = bytesToSize(parseInt(file.fileSize));
        var url = `${base_url}/file/${fileName}`;
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.textContent = `${fileName}`;
        a.setAttribute('href', url);
        li.appendChild(a);
        var span = document.createElement('span');
        span.setAttribute('class', 'size');
        span.textContent = `${fileSize}`;
        li.appendChild(span);
        ulFiles.appendChild(li);
    }
}

function bytesToSize(bytes) {
    var sizes = ['o', 'ko', 'mo', 'go', 'to'];
    if (bytes == 0) return '0 o';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    var size = (bytes / Math.pow(1024, i)).toFixed(2).replace('.', ',');
    return `${size} ${sizes[i]}`;
};
