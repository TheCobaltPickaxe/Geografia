window.onload = function(){    
    var form = document.getElementById("form")
    form.addEventListener("submit", (e) => {
        e.preventDefault()
        const data = Object.fromEntries(new FormData(form).entries())
        var desc = "Grupo: " + data.name + "\nPedra: " + data.rock + "\n\n" + data.message
        var file = new Blob([desc], {type: "text/plaintext"})

        const a = document.createElement('a');
        a.href = URL.createObjectURL(file), "_blank"
        a.download = data.rock + ".txt"
        a.click()
        a.remove()
    }, false)

    var whatsappBtn = document.getElementById("whatsapp")
    whatsappBtn.addEventListener("click", (e) =>{
        const data = Object.fromEntries(new FormData(form).entries())
        var desc = "Grupo: " + data.name + "\nPedra: " + data.rock + "\n\n" + data.message
        var file = new Blob([desc], {type: "text/plaintext"})

        const a = document.createElement('a')
        a.href = "https://api.whatsapp.com/send?phone=554598611989&text=" + encodeURIComponent(desc) +""
        a.click()
        a.remove()
    })
}