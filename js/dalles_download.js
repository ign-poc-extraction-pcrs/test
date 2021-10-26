// menu qui va afficher les dalles selectionnez qu'on peut télécharger
const dalles_download = L.control();

// creation de la popup pour afficher les dalles à telecharger
dalles_download.onAdd = function (map) {
    // creation de la div
    this._div = L.DomUtil.create('div', 'info');
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

// méthode que nous utiliserons pour mettre à jour la popup en fonctions des dalles ajouté ou retiré
dalles_download.update = function (liste_dalle) {
    // on ecris dans la popup
    this._div.innerHTML = "<h2>Liste des dalles sélectionnées</h2>"

    const div_liste_dalles = document.createElement("div")
    if (!liste_dalle || liste_dalle.length === 0) {
        div_liste_dalles.innerHTML = "<h4> Aucune dalle sélectionnées </h4>"
    }else{
        
        liste_dalle.forEach(element => {
            console.log(element);
            div_liste_dalles.innerHTML += `<h4> ${element.properties.nom} </h4>`
        });
        div_liste_dalles.innerHTML += `<h5> Nombre de dalles : ${liste_dalle.length} <span style="font-size: 10px;">(${limit_select_dalle} max)</span></h5>`
        div_liste_dalles.innerHTML += '<button type="submit">Télecharger</button>'
    }

    this._div.appendChild(div_liste_dalles)
}

dalles_download.addTo(map)