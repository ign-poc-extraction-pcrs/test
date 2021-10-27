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
        const form = document.createElement("form")

        liste_dalle.forEach(element => {
            console.log(element);
            const dalle = document.createElement("h4")
            dalle.innerHTML += `${element.properties.nom}`
            form.appendChild(dalle)
        });
        const nb_dalle_limite = document.createElement("h5")
        nb_dalle_limite.innerHTML += `Nombre de dalles : ${liste_dalle.length} <span style="font-size: 10px;">(${limit_select_dalle} max)</span>`
        form.appendChild(nb_dalle_limite)

        const button = document.createElement("button")
        button.innerHTML += 'Télecharger'
        form.appendChild(button)
        
        div_liste_dalles.appendChild(form)
    }

    this._div.appendChild(div_liste_dalles)
}

dalles_download.addTo(map)