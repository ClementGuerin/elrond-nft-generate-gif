const elrondAddressInput = document.querySelector('#egld-address');
const elrondBtnSubmit = document.querySelector('#submit');
const elrondDelayInput = document.querySelector('#delay');
const elrondBtnGenerate = document.querySelector('#generate');

var resultElrondAPI;

elrondBtnSubmit.addEventListener("click", function(){
    console.log("test");

    getElrondNFT(elrondAddressInput.value);


});

// Address -> return API Datas
async function getElrondNFT(address) {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
           if (xmlhttp.status == 200) {
                resultElrondAPI = JSON.parse(xmlhttp.responseText);
                displayUserNFT();
           }
           else if (xmlhttp.status == 400) {
              alert('There was an error 400');
           }
           else {
               alert('something else other than 200 was returned');
           }
        }
    };

    xmlhttp.open("GET", "https://api.elrond.com/accounts/" + address + "/nfts?size=10000", true);
    xmlhttp.send();
};

function displayUserNFT() {
    resultElrondAPI.forEach(item => {
        //console.log(item);
        if(item.media[0]) {
            if(item.media[0].fileType.includes("image")) {
                console.log(item);
                var newItem = document.createElement("li");
                newItem.setAttribute("data-full", item.media[0].url);
                newItem.setAttribute("title", item.name);
                newItem.classList.add("images-list-item");

                var newImage = document.createElement("img");
                newImage.setAttribute("src", item.media[0].thumbnailUrl);                
                newItem.appendChild(newImage);
            
                var currentDiv = document.getElementById('images-list-item-before');
                document.querySelector(".images-list").insertBefore(newItem, currentDiv);
            }
        }
    });

    let allItems = document.querySelectorAll(".images-list-item");

    for(var i = 0; i < allItems.length; i++) {
        allItems[i].addEventListener("click", function(){
            console.log(this);
            if(this.getAttribute('data-selected') != "true") {
                this.setAttribute("data-selected", "true");
                this.classList.add("selected");
            } else {
                this.setAttribute("data-selected", "false");
                this.classList.remove("selected");
            }
            
        });
    }

    document.querySelector(".images-section").style.display = "block";
};

elrondBtnGenerate.addEventListener("click", function(){
    const allImagesSelected = document.querySelectorAll(".images-list-item[data-selected=true]");
    var datas = [];

    for(var i = 0; i < allImagesSelected.length; i++) {
        datas.push(allImagesSelected[i].getAttribute("data-full"));
    }

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
           if (xmlhttp.status == 200) {
                gifURI = "https://tools.bunnyverse.io/generate-gif" + xmlhttp.responseText;

                document.querySelector(".gif-container img").setAttribute("src", gifURI);
                document.querySelector(".gif-container").style.display = "block";
           }
           else if (xmlhttp.status == 400) {
              alert('There was an error 400');
           }
           else {
               alert('something else other than 200 was returned');
           }
        }
    };

    xmlhttp.open("POST", "https://tools.bunnyverse.io/generate-gif", true);
    xmlhttp.send(JSON.stringify({images: datas,delay: elrondDelayInput.value}));
});