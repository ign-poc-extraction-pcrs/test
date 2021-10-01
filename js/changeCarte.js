var checkBoxIgn = document.querySelectorAll("#checkbox_ign");
var checkBoxAutre = document.querySelectorAll("#checkbox_autre")

var carteIgn = document.getElementById("ign")
var carteAutre = document.getElementById("autre")

function change_fond_carte(event) {

    checkBoxIgn.forEach((element, key) => {

        if (event.target.id == "checkbox_autre" && checkBoxIgn[key].checked && checkBoxAutre[key].checked){
            checkBoxIgn.forEach((element, keys) => {
                checkBoxIgn[keys].checked = false
                checkBoxAutre[keys].checked = true
            })
            carteAutre.style.height = "100vh"
            carteIgn.style.height = "0px"

        } else if (event.target.id == "checkbox_ign" && checkBoxAutre[key].checked && checkBoxIgn[key].checked){
            checkBoxIgn.forEach((element, keys) => {
                checkBoxIgn[keys].checked = true
                checkBoxAutre[keys].checked = false
            })
            carteIgn.style.height = "100vh"
            carteAutre.style.height = "0px"
        }

        if (event.target.id == "checkbox_autre" && checkBoxIgn[key].checked == false && checkBoxAutre[key].checked == false){
            checkBoxAutre[key].checked = true
        }else if (event.target.id == "checkbox_ign" && checkBoxIgn[key].checked == false && checkBoxAutre[key].checked == false){
            checkBoxIgn[key].checked = true
        }
    })
}

checkBoxIgn.forEach(element => {
    element.addEventListener("click", change_fond_carte)
})

checkBoxAutre.forEach(element => {
    element.addEventListener("click", change_fond_carte)
})
