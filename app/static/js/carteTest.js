var data = {};

// Selecteur fonds de carte

L.control.layers(baselayers, data, { collapsed: false }).addTo(map);


// Echelle cartographique
L.control.scale().addTo(map);
L.Control.geocoder({position : 'topleft'}).addTo(map);


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
        if (dalle.properties.id != element.properties.id){
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
    // Ajout écouteur d'événement sur l'élément
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: click
    });
    layer.setStyle({className: `id${feature.properties["x"]}_${feature.properties["y"]}`})
    // Ajout d'un label
    var label = L.marker(layer.getBounds().getCenter(), {
        icon: L.divIcon({
          className: 'label-nom',
          html: `<p class="coor_dalle"><span>${feature.properties["x"]}</span> <span>${feature.properties["y"]}</span></p>`,
          iconSize: [0, 0],
        })
    }).addTo(map);
    // Ajout écouteur d'événement sur le label qui lance l'événement de l'élément
    label.on({
        mouseover: function(){layer.fire('mouseover')},
        mouseout: function(){layer.fire('mouseout')},
        click: function(){layer.fire('click')},
    });
}

function onEachFeatureDallage(feature, layer) {
    // Ajout écouteur d'événement sur l'élément
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: click
    });
}





labels_polygon = document.querySelectorAll(".label-nom")





// menu qui va afficher les couches optionnels
const couche_optionnel = L.control();

// creation de la popup pour afficher les couches optionnels
couche_optionnel.onAdd = function (map) {
    // creation de la div
    this._div = L.DomUtil.create('div', 'optionnel');
    if (!L.Browser.touch) {
        L.DomEvent
            .disableClickPropagation(this._div)
            .disableScrollPropagation(this._div);
    } else {
        L.DomEvent.on(this._div, 'click', L.DomEvent.stopPropagation);
    }
    this.update();
    return this._div;
};

// méthode que nous utiliserons pour mettre à jour la popup en fonctions des couches selectionnez
couche_optionnel.update = function () {
    // creation des différents element html pour avoir la popup avec la/les checkbox
    this._div.classList.add("leaflet-control-layers")
    this._div.classList.add("leaflet-control-layers-expanded")

    var section = document.createElement("section")
    section.classList.add("leaflet-control-layers-list")
    this._div.appendChild(section)

    var div_leflet_control = document.createElement("div")
    div_leflet_control.classList.add("leaflet-control-layers-base")
    section.appendChild(div_leflet_control)

    var label_nom_dalle = document.createElement("label")
    div_leflet_control.appendChild(label_nom_dalle)

    var div_nom_dalle = document.createElement("div")
    label_nom_dalle.appendChild(div_nom_dalle)

    var input_nom_dalle = document.createElement("input")
    input_nom_dalle.classList.add("leaflet-control-layers-selector")
    input_nom_dalle.classList.add("couche_optionnel_nom_dalle")
    input_nom_dalle.type = "checkbox"
    input_nom_dalle.name = 'leaflet-base-layers_68'

    var input_limit_commune = document.createElement("input")
    input_limit_commune.classList.add("leaflet-control-layers-selector")
    input_limit_commune.classList.add("limite_commune")
    input_limit_commune.type = "checkbox"
    input_limit_commune.name = 'leaflet-base-layers_68'

    var zoom = document.createElement("span")
    zoom.classList.add("text-alert-zoom")
    zoom.innerHTML = `Zoom: ${map.getZoom()}</br>`
    zoom.style.opacity = "0.6"
    div_nom_dalle.appendChild(zoom)

    var textAlert = document.createElement("span")
    textAlert.classList.add("text-alert-checkbox-nom-dalle")
    textAlert.innerHTML = "Affichage nom au zoom 15 ou plus</br>"
    textAlert.style.opacity = "0.6"
    div_nom_dalle.appendChild(textAlert)
    // si le zoom est en dessous de 15 on ne donne pas la possibilité de checker la checkbox et donc d'afficher les nom des dalles
    if (map.getZoom() < 15) {
        input_nom_dalle.disabled = true
    }else{
        textAlert.style.display = "none"
    }
    div_nom_dalle.appendChild(input_nom_dalle)

    

    var span_nom_dalle = document.createElement("span")
    span_nom_dalle.classList.add("span-nom-dalle")
    span_nom_dalle.innerHTML = 'Nom dalle'

    var span_limit_commune = document.createElement("span")
    span_limit_commune.classList.add("span-limit-commune")
    span_limit_commune.innerHTML = 'Limite commune'
    if (map.getZoom() < 15) {
        span_nom_dalle.style.opacity = "0.6"
    } 
    div_nom_dalle.appendChild(span_nom_dalle)
    div_nom_dalle.appendChild(document.createElement("hr"))
    div_nom_dalle.appendChild(input_limit_commune)
    div_nom_dalle.appendChild(span_limit_commune)
}

couche_optionnel.addTo(map)

// Pour le debug
map.on('click', function (e) {
    var coord = e.latlng;
    console.log("You clicked the map at: [" + coord.lat + ", " + coord.lng + "]");
});


// recupération de la checkbox_nom_dalle pour voir si elle est coché ou non, si elle est coché on affiche les noms de dalles dans les polygons
var checkBox_nom_dalle = document.querySelector(".couche_optionnel_nom_dalle");
checkBox_nom_dalle.addEventListener('change', function() {
    labels_polygon.forEach(label => {
        // si la checkbox est checker on affiche tout les noms, sinon on les cachent
        if (this.checked) {
            label.style.display = "block"
        } else {
            label.style.display = "none"
        }
    })
    
  });


  function affichage_nom_dalle_menu(zoom) {
    texteAlert_nom_dalle = document.querySelector(".text-alert-checkbox-nom-dalle")
    zoom_menu = document.querySelector(".text-alert-zoom")
    span_nom_dalle = document.querySelector(".span-nom-dalle")
    if (zoom >= 15) {
        texteAlert_nom_dalle.style.display = "none"
        span_nom_dalle.style.opacity = "1"
    }else{
        texteAlert_nom_dalle.style.display = "block"
        span_nom_dalle.style.opacity = "0.6"
    }
  }


map.on('zoomend', function() {
    // quand on change le zoom de la carte les actions suivante se déroule
    // l'objectif est de masquer les noms de dalle à un certain niveau de zoom car sinon elles sont trop petite
    var currentZoom = map.getZoom();
    input_nom_dalle = document.querySelector(".couche_optionnel_nom_dalle")
    affichage_nom_dalle_menu(currentZoom)

    // si le zoom est plus grand ou égal à 15 alors on donne la possibilité de cocher la checkbox pour afficher ou non les nom de dalle
    if (currentZoom >= 15){
        input_nom_dalle.disabled = false
        labels_polygon.forEach(label => {
            label.style.display = "block"
        })
    }else{
        // sinon a un zomm inferieur à 15 on enleve les nom de dalle, on décoche la checkbox et on ne donne pas la possibilité de 
        // re checker la checkbox
        labels_polygon.forEach(label => {
            label.style.display = "none"
        })
        
    }
    design_name_dalle_zoom()
});


limit_commune = L.tileLayer.wms('https://wxs.ign.fr/essentiels/geoportail/r/wms?', {
    layers: 'LIMITES_ADMINISTRATIVES_EXPRESS.LATEST', format: 'image/png',
    pane: 'limit_commune'
})

input_limit_commune = document.querySelector(".limite_commune")
input_limit_commune.addEventListener('change', function() {
    // creer un pane permet de mettre un z-index a la couche, on met donc un grand z-index car on veut que cette couche passe au dessus
    map.createPane('limit_commune');
    map.getPane('limit_commune').style.zIndex = 499;
    map.getPane('limit_commune').style.pointerEvents = 'none';

    if (this.checked) {
        map.addLayer(limit_commune)
        console.log(map.hasLayer(limit_commune));
         
    } else {
        console.log(map.hasLayer(limit_commune));
        map.removeLayer(limit_commune)
    }
})


// on positionne le bouton pour activer ou desactiver l'infobox en haut à gauche
var info_box = L.control({position: "topleft"});

// on creer le bouton
info_box.onAdd = function (map) {

    this._div = L.DomUtil.create('div', 'infobox');
    if (!L.Browser.touch) {
        L.DomEvent
            .disableClickPropagation(this._div)
            .disableScrollPropagation(this._div);
    } else {
        L.DomEvent.on(this._div, 'click', L.DomEvent.stopPropagation);
    }
    // creation de l'element bouton
    var button_infobox = document.createElement("button")
    // on ajoute le type et la classe pour le design
    button_infobox.setAttribute("type", "submit")
    button_infobox.setAttribute("class", "button-infobox f-info")
    // on ajoute une icon via font awesome
    button_infobox.innerHTML = '<i class="fa-solid fa-info"></i>'
    this._div.appendChild(button_infobox)

    return this._div;
};
// ajout button infobox al a map
info_box.addTo(map)


// on positionne l'infobox en haut à gauche
var content_info_box = L.control({position: "topleft"});

// on ecris l'info box
content_info_box.onAdd = function (map) {

    this._div = L.DomUtil.create('div', 'info content-infobox');
    if (!L.Browser.touch) {
        L.DomEvent
            .disableClickPropagation(this._div)
            .disableScrollPropagation(this._div);
    } else {
        L.DomEvent.on(this._div, 'click', L.DomEvent.stopPropagation);
    }
    // contenue de l'infobox
    var p = document.createElement("p")
    p.innerHTML = "En construction"
    this._div.appendChild(p)

    return this._div;
};
// ajout div infobox al a map
content_info_box.addTo(map)
// on assigne a la div infobox un display none pour l'afficher seulement quand on clique sur le bouton
div_content_infobox = document.querySelector(".content-infobox")
div_content_infobox.style.display = "none"
div_content_infobox.style.marginTop = "2px"
// Quand on clique sur le bouton infobox
document.querySelector(".button-infobox").addEventListener("click",  function() {
    button_infobox = document.querySelector(".button-infobox")
    // si le bouton contient l'icone info alors quand on click dessus on change l'icone en croix et on affiche la div infobox
    if (button_infobox.classList.contains("f-info")){
        button_infobox.innerHTML = '<i style="color: red;" class="fa-solid fa-xmark"></i>'
        button_infobox.setAttribute("class", "button-infobox f-xmark")
        div_content_infobox.style.display = "block"
    // sinon si le bouton contient l'icone croix alors quand on click dessus on change l'icone en info et on cache la div infobox    
    }else if(button_infobox.classList.contains("f-xmark")){
        button_infobox.innerHTML = '<i style="color: black;" class="fa-solid fa-info"></i>'
        button_infobox.setAttribute("class", "button-infobox f-info")
        div_content_infobox.style.display = "none"
    }
    
})