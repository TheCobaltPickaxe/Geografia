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
var picker = undefined;
var selectedImageIds = []

function onApiLoad(){
    console.log("Google API loaded")
    gapi.load("auth2", function(){
        console.log("Loaded auth2")
    })
    gapi.load("signin2", function(){
        console.log("Loaded signin2")
        gapi.signin2.render("googleSignIn", {
            onsuccess: onSignIn,
            scope: 'email profile https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid https://www.googleapis.com/auth/drive'
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
        .setOAuthToken(user.getAuthResponse(true).access_token)
        .addView(view)
        .setDeveloperKey("AIzaSyBk3-7opruOiHaYmcozSngRFhLF-SuxXJ0")
        .setCallback(pickImageDrive);

    document.getElementById("logInError").toggleAttribute("hidden", true)
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

function notLoggedInError(){
    const logIn = document.getElementById("logInError")
    logIn.removeAttribute("hidden")
}

function pickImageDrive(imgData){
    if (imgData.action == "picked"){
        loginBtn.toggleAttribute("hidden", true)
        imgData.docs.forEach(element => {
            selectedImageIds.push(element.id)
            var imgEl = document.createElement("img")
            imgEl.setAttribute("src", "https://drive.google.com/thumbnail?id=" + element.id)
            imgEl.setAttribute("class", "selected-image")
            imgEl.addEventListener("click", function(e){
                imgEl.classList.add("removed-image")
                for (let i = 0; i < selectedImageIds.length; i++) {
                    const id = selectedImageIds[i];
                    if (id == element.id){
                        selectedImageIds.splice(i)
                    }
                }
            })
            imgEl.addEventListener("transitionend", function(e){
                if (e.propertyName == "max-width"){
                    imgEl.remove()
                }
            })
            $(".image-box").append(imgEl)
        });
    }
}

function pickImagePC(files){
    for (let i = 0; i < files.length; i++) {
        const image = files[i];
        $.ajax({
            url: "https://content.googleapis.com/drive/v3/files?q=name%3D'" + image.name.split('.').slice(0, -1).join('.')  + "' and '1XT8sc_8BrFO4XsOTyrHoikj3a4CRIuGj' in parents and not trashed&key=AIzaSyBk3-7opruOiHaYmcozSngRFhLF-SuxXJ0",
            type: "GET",
            headers:{
                "Authorization": "Bearer " + user.getAuthResponse(true).access_token
            },
            success: function(result){
                if (result.files.length > 0){
                    pickImageDrive({action: "picked", docs: [result.files[0]]})
                }
                else{
                    $.ajax({
                        url:"https://www.googleapis.com/upload/drive/v3/files?uploadType=media&key=AIzaSyBk3-7opruOiHaYmcozSngRFhLF-SuxXJ0",
                        headers: {
                            "Authorization": "Bearer " + user.getAuthResponse(true).access_token,
                            "Content-Type": image.type,
                            "Content-Length": image.size
                        },
                        type: "POST",
                        processData: false,
                        data: image,
                        success: function(result){
                            var id = result.id
                            $.ajax({
                                url: "https://content.googleapis.com/drive/v3/files/" + id + "?addParents=1XT8sc_8BrFO4XsOTyrHoikj3a4CRIuGj",
                                data: JSON.stringify({
                                    name: image.name.split('.').slice(0, -1).join('.'),
                                    description: "Gerado automaticamente pelo site!"
                                }),
                                type: "PATCH",
                                headers:{
                                    "Authorization": "Bearer " + user.getAuthResponse(true).access_token,
                                    "Content-Type": "application/json"
                                },
                                success: function(result){
                                    pickImageDrive({action: "picked", docs: [result]})
                                    console.log(result)
                                }
                            })
                        }
                    })
                }
            }
        })
    }
    
}

function selectImage(isDrive){
	function loginChecked() {
        if (isDrive){
            if (picker.build){
                picker.setOAuthToken(user.getAuthResponse(true).access_token)
                picker = picker.build()
            }
            picker.setVisible(true)
        }
        else{
            document.getElementById("fileInput").click()
        }
    }

    if (!user){
        notLoggedInError()
        return
    }

	//Request Drive Perm
	if (!user.getGrantedScopes().includes("https://www.googleapis.com/auth/drive")){
        canProceed = false
		const option = new gapi.auth2.SigninOptionsBuilder();
		option.setScope('https://www.googleapis.com/auth/drive');

		user.grant(option).then(function(success){
            loginChecked()
		}, function(fail){

		})
	}

    else{
        loginChecked()
    }
    
}

window.onload = function(){
    loginBtn = $(".g-signin2")[0]
    $("#form").submit((e) =>{
        e.preventDefault()
		try{
			if (!profile){
                notLoggedInError()
                return
			}

			const data = Object.fromEntries(new FormData($("form")[0]).entries())

			writeEntry(data.rock.toLowerCase(), data.type, data.message, profile.getEmail(), selectedImageIds).then(function(){
				window.location.reload()
			})
		} catch(e){
			genError = document.getElementById("genericError")
            genError.textContent = e
            genError.toggleAttribute("hidden", false)
            
		}
    })
}

//TODO: REMOVE IMG THINGY