// limite de selection de dalle
limit_select_dalle = 10

// taille dalle
pas = 200

// 4 coordonnées pour creer le dallages et dalles
x_min = 244000.000
x_max = 245000.000

y_min = 6736000.000
y_max = 6737000.000

// parametre à changer pour le design des dalles
var params_design = {
    "base" : {
        "fill_color" : "white",
        "weight" : 2,
        "opacity" : 1,
        "color" : "#000",
        "dash_array" : "0",
        "fill_opacity" : 0.2
    },
    "click": {
        "fill_color" : "#f3ca20",
        "weight" : 2,
        "opacity" : 1,
        "color" : '#000',
        "dash_array" : "4",
        "fill_opacity" : 0.7
    },
    "fly_over_whithout_click" : {
        "fill_color" : "white",
        "weight" : 1,
        "opacity" : 0,
        "color" : '',
        "dash_array" : "4",
        "fill_opacity" : 0.7
    },
    "fly_over_click" : {
        "fill_color" : "white",
        "weight" : 2,
        "opacity" : 1,
        "color" : "#000",
        "dash_array" : "0",
        "fill_opacity" : 0.4
    }
}

function popup(layer, type="open"){
    "function qui affiche une popup, au survol d'une dalle son nom"
    nom_dalle = layer.feature["properties"].nom;
    template = `<h4>${nom_dalle}</h4>`

    if (type == "open"){
        layer.bindPopup(template).openPopup()
    }else{
        layer.bindPopup(template).closePopup()
    }
    
}