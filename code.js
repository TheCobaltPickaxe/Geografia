window.onload = function(){    
    var form = document.getElementById("form")
    form.addEventListener("submit", (e) => {
        e.preventDefault()
        const data = Object.fromEntries(new FormData(form).entries())
        console.log(data)
        var desc = "Grupo: " + data.name + "\nPedra:" + data.rock + "\n\n" + data.message
        var file = new Blob([desc], {type: "text/plaintext"})
        const a = document.createElement('a');
        a.href = URL.createObjectURL(file), "_blank"
        a.download = data.rock + ".txt"
        a.click()
        a.remove()
    }, false)
}