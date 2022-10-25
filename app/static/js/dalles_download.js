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
    this._div.innerHTML = '<h2 class="titre__liste-dalle">Liste des dalles sélectionnées</h2>'

    const div_liste_dalles = document.createElement("div")
    if (!liste_dalle || liste_dalle.length === 0) {
        div_liste_dalles.innerHTML = "<h4> Aucune dalle sélectionnée </h4>"
    }else{
        const form = document.createElement("form")
        form.setAttribute('method', 'post');
        form.setAttribute('action', '/download');

        liste_dalle.forEach(element => {
            const dalle = document.createElement("h4")
            dalle.innerHTML += `<button class='remove_design_dalle id${element.properties.x}_${element.properties.y}' type='button'><span>X</span></button> <span class="nom_dalle">${element.properties.nom}</span>`
            
            const input_hidden = document.createElement("input")
            input_hidden.setAttribute('type', 'hidden');
            input_hidden.setAttribute('name', 'dalle[]');
            info_dalle = nomenclature_download(element["geometry"].coordinates[0])
            input_hidden.value = `${info_dalle.min[0]}-${info_dalle.min[1]}-${info_dalle.max[0]}-${info_dalle.max[1]}-${info_dalle.annee}-${info_dalle.proj}-${info_dalle.resolution}-${info_dalle.canaux}`
            
            form.appendChild(dalle)
            form.appendChild(input_hidden)
        });
        const nb_dalle_limite = document.createElement("h5")
        
        
        const button_remove_all_dalles = document.createElement("button")
        button_remove_all_dalles.setAttribute("type", "submit")
        button_remove_all_dalles.setAttribute("class", "button-remove-dalles")
        button_remove_all_dalles.innerHTML += '<i class="fa-solid fa-trash"></i>'
        
        nb_dalle_limite.appendChild(button_remove_all_dalles)
        nb_dalle_limite.innerHTML += `Nombre de dalles : ${liste_dalle.length} <span style="font-size: 10px;">(${limit_select_dalle} max)</span>`
        form.appendChild(nb_dalle_limite)
        

        const button = document.createElement("button")
        button.setAttribute("type", "submit")
        button.setAttribute("class", "button-download")
        button.innerHTML += 'Télecharger'
        form.appendChild(button)
        
        div_liste_dalles.appendChild(form)
    }

    this._div.appendChild(div_liste_dalles)

    button_remove_design = document.querySelectorAll(".remove_design_dalle");
    button_remove_design.forEach(button => {
        button.addEventListener('click', () => {
            id_dalle = remove_dalle_design(button)
            liste_dalle.forEach(element => {
                if(id_dalle == element.properties.id){
                    dalle_remove = element
                }
            });
            liste_dalle = remove_dalle_liste(liste_dalle, dalle_remove)
            dalles_download.update(liste_dalle)
            new_liste_dalle = liste_dalle
            statut = false
        })
    });

    button_remove_all_dalles = document.querySelector(".button-remove-dalles");
    if (button_remove_all_dalles !== null){
        button_remove_all_dalles.addEventListener('click', () => {
        button_remove_design.forEach(button => {
            id_dalle = remove_dalle_design(button)

            liste_dalle = []
            dalles_download.update(liste_dalle)
            new_liste_dalle = liste_dalle
            statut = false
            })
        })
    }
    
}

function remove_dalle_design(button_remove_design) {
    id_dalle = button_remove_design.className.split(' ')[1];
    dalle = document.querySelector(`.${id_dalle}`); 

    dalle.setAttribute("stroke", param_base["fill_color"]) 
    dalle.setAttribute("fill", param_base["color"]) 
    dalle.setAttribute("width", param_base["weight"]) 
    dalle.setAttribute("fill-opacity", param_base["fill_opacity"]) 
    dalle.setAttribute("stroke-opacity", param_base["opacity"]) 
    dalle.setAttribute("stroke-dasharray", param_base["dash_array"]) 
    return id_dalle
}

dalles_download.addTo(map)
