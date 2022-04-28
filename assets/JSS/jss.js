var repoList = document.querySelector('ul');
var fetchButton = document.getElementById('fetch-button');

// `getApi` function is called when the `fetchButton` is clicked

function getApi() {
  // TODO: Insert the API url to get a list of your repos
  var requestUrl = 'https://api.edamam.com/api/recipes/v2?type=public&beta=false&q=salad&app_id=9b1c86af&app_key=5a39153d8f956155caeb137ec78570fe&ingr=5&random=true&field=url';

  fetch(requestUrl)
    .then(function(response) {
      return response.json();
    })
    console.log(response);

}

fetchButton.addEventListener('click', getApi);