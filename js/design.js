// affiche le style pour chaque dalle
function style(fillColor, weight, opacity, color, dashArray, fillOpacity) {
    return {
        fillColor: fillColor,
        weight: weight,
        opacity: opacity,
        color: color,
        dashArray: dashArray,
        fillOpacity: fillOpacity
    };
}

// recupere les parametre de base au chargement de la base
var param_base = params_design["base"]
var param_click = params_design["click"]
var param_fly_over_whithout_click = params_design["fly_over_whithout_click"]
var param_fly_over_click = params_design["fly_over_click"]

function highlight_whithout_click(layer) {
    "design quand on survole une dalle non clicker"
    layer.setStyle(style(param_fly_over_whithout_click["color"], param_fly_over_whithout_click["weight"], param_fly_over_whithout_click["opacity"], param_fly_over_whithout_click["color"], param_fly_over_whithout_click["dash_array"], param_fly_over_whithout_click["fill_opacity"]));
}

function highlight_click(layer) {
    "design quand on survole une dalle clicker"
    layer.setStyle(style(param_fly_over_click["color"], param_fly_over_click["weight"], param_fly_over_click["opacity"], param_fly_over_click["fill_color"], param_fly_over_click["dash_array"], param_fly_over_click["fill_opacity"]));
}

function design_click(layer){
    "design quand on click sur une dalle"
    layer.setStyle(style(param_click["color"], param_click["weight"], param_click["opacity"], param_click["fill_color"], param_click["dash_array"], param_click["fill_opacity"]));
}

function already_click(layer) {
    "design quand on click sur une dalle déjà clicker"
    layer.setStyle(style(param_base["color"], param_base["weight"], param_base["opacity"], param_base["fill_color"], param_base["dash_array"], param_base["fill_opacity"]));
}
