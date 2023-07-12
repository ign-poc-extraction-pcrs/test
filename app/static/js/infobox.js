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

modal = document.querySelector("#modal_infobox")
// Quand on clique sur le bouton infobox
document.querySelector(".button-infobox").addEventListener("click",  function() {
    modal.style.display = "block"
})

// quand on clique sur la croix pour fermer le modal
document.querySelector(".close").addEventListener("click",  function() {
    modal.style.display = "none"
})

window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }