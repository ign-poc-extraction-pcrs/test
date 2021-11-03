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
            dalle.innerHTML += `<button class='remove_design_dalle id${element.properties.id}' type='button'>X</button> ${element.properties.nom}`
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

    button_remove_design = document.querySelectorAll(".remove_design_dalle");
    button_remove_design.forEach(button => {
        button.addEventListener('click', () => {
            id = button.className.split(' ')[1];
            dalle = document.querySelector(`.leaflet-interactive.${id}`); 

            dalle.setAttribute("stroke", param_base["fill_color"]) 
            dalle.setAttribute("fill", param_base["color"]) 
            dalle.setAttribute("width", param_base["weight"]) 
            dalle.setAttribute("fill-opacity", param_base["fill_opacity"]) 
            dalle.setAttribute("stroke-opacity", param_base["opacity"]) 
            dalle.setAttribute("stroke-dasharray", param_base["dash_array"]) 
            // liste_dalle = remove_dalle_liste(liste_dalle, dalle)
        })

        
    });
    
}

dalles_download.addTo(map)

      