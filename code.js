var firebaseConfig = {
    apiKey: "AIzaSyBk3-7opruOiHaYmcozSngRFhLF-SuxXJ0",
    authDomain: "rocks-lasalle.firebaseapp.com",
    databaseURL: "https://rocks-lasalle-default-rtdb.firebaseio.com",
    projectId: "rocks-lasalle",
    storageBucket: "rocks-lasalle.appspot.com",
    messagingSenderId: "651642976112",
    appId: "1:651642976112:web:2899e89412170614a6c1b5",
    measurementId: "G-CTRNK734BE"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

var user = undefined;
var profile = undefined;
var loginBtn = undefined;
var accessToken = undefined;
var picker = undefined;

function onApiLoad(){
    console.log("Google API loaded")
    gapi.load("auth2", function(){
        gapi.signin2.render("googleSignIn", {
            onsuccess: onSignIn,
            scope: 'email profile https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid https://www.googleapis.com/auth/drive.readonly'
        })
    })
    gapi.load("picker", function(){
        console.log("Picker API loaded")
    })
}

function onSignIn(googleUser){
    //Get Info
    user = googleUser
    profile = googleUser.getBasicProfile()
    accessToken = googleUser.getAuthResponse(true).access_token;

    //Create Logout
    if (loginBtn && loginBtn.parentNode){
        var newElement = document.createElement("img")
        newElement.setAttribute("src", profile.getImageUrl())
        newElement.setAttribute("style", "border-radius:50%; width:60px; height:60px; margin-left: 15px;")
        newElement.setAttribute("id", "loggedImage")
        loginBtn.parentNode.replaceChild(newElement, loginBtn)
        document.getElementById("logoutBtn").removeAttribute("hidden")
    }

    //Create Picker
    var view = new google.picker.DocsView(google.picker.ViewId.DOCS)
    view.setParent("1XT8sc_8BrFO4XsOTyrHoikj3a4CRIuGj")
    picker = new google.picker.PickerBuilder()
        .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
        .enableFeature(google.picker.Feature.NAV_HIDDEN)
        .setAppId(651642976112)
        .setOAuthToken(accessToken)
        .addView(view)
        .setDeveloperKey("AIzaSyBk3-7opruOiHaYmcozSngRFhLF-SuxXJ0")
        .setCallback(pickImage)
        .build();
}

function onSignOut(){
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.disconnect().then(function() {
        var img = document.getElementById("loggedImage")
        img.parentNode.replaceChild(loginBtn, img)
        document.getElementById("logoutBtn").setAttribute("hidden", "")
        profile = null
        user = null
    })
}

function writeEntry(rockName, rockType, desc, userEmail, imageID){
    var rockRef = firebase.database().ref('rocks/' + rockName)
    return rockRef.set({
        owner: userEmail,
        images: imageID,
        type: rockType,
        description: desc,
    })
}

function pickImage(imgData){
    if (imgData.action == "picked"){
        
        loginBtn.toggleAttribute("hidden", true)
    
        const data = Object.fromEntries(new FormData(form).entries())
        images = []
        imgData.docs.forEach(element => {
            images.push(element.id)
        });
        writeEntry(data.rock.toLowerCase(), data.type, data.message, profile.getEmail(), images).then(function(){
            window.location.reload()
        })
    }
}

window.onload = function(){
    loginBtn = document.getElementsByClassName("g-signin2")[0]
    var form = document.getElementById("form")
    form.addEventListener("submit", (e) => {
        e.preventDefault()
        const logIn = document.getElementById("logInError")
        if (!profile){
            logIn.removeAttribute("hidden")
            return
        }
    
        const email = profile.getEmail()
        if (email.split("@")[1] != "soulasalle.com.br"){
            logIn.toggleAttribute("hidden", true)
            return
        }
        picker.setVisible(true)
    }, false)
}