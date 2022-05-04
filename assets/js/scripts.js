function handleSubmit() {
    var reviewText = document.getElementById('review');
    var actualText = reviewText.value;
    console.log(actualText);
}

/*MAP Global Variables*/
var locationListEl = document.querySelector('#locatons-list');
var submitButton = document.querySelector('#search-nearby');
var zipInput = document.querySelector('#zipCode');
var infoWindow;
var currentInfoWindow;
var service;
var infoPane;
var latitude = '30.2672';
var longitude = '-97.7431';
var mapProp;
var map;
var pos = {
    lat: latitude,
    lng: longitude
}

/*Tasty Recipe Variables*/
var recipeNumber;
var requestUrl;
var divNumber = document.getElementById('recipe');
var title = document.querySelector('#title');       //grabs p container
var servingSize = document.querySelector('#serving');
var ingredientList = document.querySelector('#ingredient-list');
var instructionsEl = document.querySelector('#instructions');
var pTitle = document.createElement("p");
//this is to choose the first recipe in this section
var itemNum = 0;
const options = {
 	method: 'GET',
 	headers: {
 		'X-RapidAPI-Host': 'tasty.p.rapidapi.com',
 		'X-RapidAPI-Key': '4e55798e4amshb2bd5f7a45adbd1p1e06e7jsna7426a55f7cd'
 	}
 };

//SECTION TO GENERATE RECIPES USING TASTY's API//
function getTastyAPI(){
    recipeNumber = divNumber.getAttribute('data-number');
    if(recipeNumber == 2){
        requestUrl = 'https://tasty.p.rapidapi.com/recipes/list?from=0&size=20&q=soup';
    }else if(recipeNumber == 3){
        requestUrl = 'https://tasty.p.rapidapi.com/recipes/list?from=0&size=40&q=tacos';
    }else if(recipeNumber == 4){
        requestUrl = 'https://tasty.p.rapidapi.com/recipes/list?from=0&size=20&q=brownies';
    }
 
    fetch(requestUrl, options)
        .then(response => response.json())
            .then(function(data){
                //extract title information
                pTitle.textContent = data.results[itemNum].name;
                title.appendChild(pTitle);
                console.log(data);
                //extract information for serving size
                var servings = data.results[itemNum].yields.slice(-2);
                console.log(data.results[itemNum].yields);
                if(servings > 1){
                    servingSize.textContent = "Serves "+  servings + " people";
                }else if (servings ===1){
                    servingSize.textContent = "Serves 1 person";
                }else
                    servingSize.textContent = data.results[itemNum].yields;

                console.log(data);
                for(var i=0; i< data.results.length; i++){
                    console.log(data.results[i].slug.toString());
                }

                //extract ingredient list
                //data can have 2 for loops if ingredients in recipe are broken into sections
                if(data.results[itemNum].sections.length>1){
                    for(var i=0; i< data.results[itemNum].sections.length; i++){
                        for(var j=0; j<data.results[itemNum].sections[i].components.length; j++){
                            var ingredientListItem = document.createElement('li');
                            ingredientListItem.textContent = data.results[itemNum].sections[i].components[j].raw_text;
                            ingredientList.appendChild(ingredientListItem);
                        }
                    }
                }
                else{
                    for(var i=0; i< data.results[itemNum].sections.length; i++){
                        for(var j=0; j<data.results[itemNum].sections[i].components.length; j++){
                            var ingredientListItem = document.createElement('li');
                            ingredientListItem.textContent = data.results[itemNum].sections[i].components[j].raw_text;
                            ingredientList.appendChild(ingredientListItem);
                        }
                    }
                }

                //extract instruction information
                for( var i=0; i<data.results[itemNum].instructions.length;i++){
                    var instructionlistItem = document.createElement('li');
                    instructionlistItem.textContent = data.results[itemNum].instructions[i].display_text;
                    instructionsEl.appendChild(instructionlistItem);
                }
            });
}

//call function getTastyAPI
getTastyAPI();

//END of SECTION FOR TASTY API//

//START of SECTION FOR MAP//
//initializes the map
function myMap(){
    //initialize the information window that appears over
    //a selected location//
    infoWindow = new google.maps.InfoWindow;
    currentInfoWindow = infoWindow;

    //contanier to store the places that get found nearby.
    infoPane = document.getElementById('locations-list');
    //mapProp defines map properties to set up the parameters
    mapProp = {
        //using variables to have lat and lng be where user enters address
        center: new google.maps.LatLng(latitude,longitude),
        //zoom level of map, can be changed.
        zoom:14
    };

    //creates a new map inside the div elment with the same ID in the html
    map = new google.maps.Map(document.getElementById("googleMap"),mapProp);

    //event listener - runs a function to get the coordinates of the address entered.
    submitButton.addEventListener('submit', geoLocation);

    //if an input was made, then the position of the center of the map changes.
    if(submitButton){
        pos = {
            lat: latitude,
            lng: longitude
        }
        //Infowindow location also changes to new center.
        infoWindow.setPosition(new google.maps.LatLng(latitude,longitude));
        infoWindow.setContent('Location found.');
        infoWindow.open(map);
    }
}

/*this function takes the input and uses Google Maps Geocoding API to get the given
address and convert them into latitude and longitude coordinates. This way we
can dynamically change where the maps is centered at*/
function geoLocation (){
    event.preventDefault();

    //store the users input into a variable
     var input = zipInput.value;

     //access the geocoding api to get coordinates
     var geocoder = new google.maps.Geocoder();
     geocoder.geocode({'address': 'zipcode' + input}, function(results,status){
         if (status == google.maps.GeocoderStatus.OK){
            latitude = results[0].geometry.location.lat();
            longitude = results[0].geometry.location.lng();

            //this sets the new center of the map at the given address
            map.setCenter(new google.maps.LatLng(latitude, longitude));
            pos = {
                lat: latitude,
                lng: longitude
            }

            //this function is called to look for places nearby the given address
            getNearbyPlaces(pos);
            //catch an error
         }else{
             alert("request failed.")
         }
     });
     return;
}


//function to look for grocery stores nearby
function getNearbyPlaces(position){
    //create an object to set up the parameters to find
    //grocery stores nearby within a radius of 3000 meters.
    var request = {
        location: position,
        rankBy: google.maps.places.RankBy.Distance,
        keyword: 'grocery store',
        radius: 3000
    };

    //using the method under the google maps API to pull information of the location
    service = new google.maps.places.PlacesService(map);
    //a function is initiated to call places with the earlier object parameters.
    service.nearbySearch(request,nearbyCallback);
}

//creates markers for places nearby that meets the keyword and radius request
function nearbyCallback(results, status){
    if (status === google.maps.places.PlacesServiceStatus.OK){
        createMarkers(results);
    }
}

//set markers at the location of each place result
function createMarkers(places){
    // for each place in the places array, create a marker
    places.forEach(place =>{
        var marker = new google.maps.Marker({
            position : place.geometry.location,
            map:map,
            title:place.name
        });

        //Add event listeners to each marker to show details
        //when clicked.
        google.maps.event.addListener(marker, 'click', () => {
            var request = {
                placeId: place.place_id,
                fields: ['name', 'formatted_address', 'geometry',
                'website','photos']
            };

            ////only show details when marker is clicked
            service.getDetails(request,(placeResult, status) => {
                showDetails(placeResult, marker, status)
            });
        });
    });
}

//function to display details of the marker. 
function showDetails(placeResult, marker, status){
    //if the array is not empty, then show a window if not already being shown.
    if(status == google.maps.places.PlacesServiceStatus.OK){
        var placeInfoWindow = new google.maps.InfoWindow();
        placeInfoWindow.setContent('<div><strong>' + placeResult.name + '</strong><br>'
        + '</div>;');
        placeInfoWindow.open(marker.map, marker);
        currentInfoWindow.close();
        currentInfoWindow = placeInfoWindow;
        showPanel(placeResult);
    }else{
        console.log('showDetails failed: ' + status);
    }
}

//appends the information of a selected marker into the container besides the map
//and below the form.
function showPanel(placeResult){
    if(infoPane.classList.contains("open"))
        infoPane.classList.remove("open");

    while(infoPane.lastChild){
        infoPane.removeChild(infoPane.lastChild);
    }
    //if the location has a photo, display it above its information.
    if(placeResult.photos){
        var firstPhoto = placeResult.photos[0];
        var photo = document.createElement('img');
        photo.classList.add('hero');
        photo.src = firstPhoto.getUrl();
        infoPane.appendChild(photo);
    }

    //append and create the inside of the list div with the place information.
    var name = document.createElement('h3');
    name.classList.add('place');
    name.textContent = placeResult.name;
    infoPane.appendChild(name);
    var address = document.createElement('p');
    address.classList.add('details');
    address.textContent = placeResult.formatted_address;
    infoPane.appendChild(address);

    //if there is a website included with the information
    //of the location, create the text with links to that website.
    if (placeResult.website) {
        let websitePara = document.createElement('p');
        let websiteLink = document.createElement('a');
        let websiteUrl = document.createTextNode(placeResult.website);
        websiteLink.appendChild(websiteUrl);
        websiteLink.title = placeResult.website;
        websiteLink.href = placeResult.website;
        websitePara.appendChild(websiteLink);
        infoPane.appendChild(websitePara);
    }

      infoPane.classList.add("open");
}