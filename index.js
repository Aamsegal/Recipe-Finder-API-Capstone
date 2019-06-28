'use strict';

// put your own value below!
const apiKey = '1d991e6283e9a6a365d439062706bb24';
const apiId = '92de8f02';
const searchURL = 'https://api.edamam.com/search';
const exampleCall = 'https://api.edamam.com/search?q=chicken&app_id=92de8f02&app_key=1d991e6283e9a6a365d439062706bb24&from=0&to=3&calories=591-722&health=alcohol-free';


function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}


function getRecipyList(foodTerm, cuisineTerm, alergy1, alergy2, recipyNumber) {
    if (alergy1) {
        alergy1 =  '&health=peanut-free';
    } else {
        alergy1 = '';
    }
    
    if (alergy2) {
        alergy2 = '&health=tree-nut-free'
    } else {
        alergy2 ='';
    }

    if (cuisineTerm) {
        cuisineTerm = `&cuisineType=${cuisineTerm}`;
    } else {
        cuisineTerm ='';
    }
  const params = {
    q: foodTerm,
    app_id: apiId,
    app_key: apiKey,
    from: 0,
    to: recipyNumber    
    };

  const queryString = formatQueryParams(params)
  const url = searchURL + '?' + queryString + cuisineTerm + alergy1 + alergy2;
  console.log(url);

fetch(url)
  .then(response => {
      if (response.ok) {
          return response.json();
      }
      throw new Error(response.statusText);
  })
  .then(responseJson => displayResults(responseJson))
  .catch(err => {
      $('.recipy-results').empty();
      $('#js-error-message').text(`Something went wrong: ${err.message}`);

});
}


function displayResults(responseJson) {
  // if there are previous results, remove them
  console.log(responseJson);
  $('.recipy-results').empty();
  // iterate through the items array
  const noResults = !responseJson || (responseJson && !responseJson.hits.length);

  if (noResults) {
    $('#recipy-results').append('No reslts found');
    return;
  }

  /*const resultList = responseJson.data.map(({snippet = {}}) => 
  `<li><h3>${snippet.name}</h3>
  <p>${snippet.description}</p>
  <p> Park Website: <a href="${snippet.thumbnails.default.url}" target="_blank">${snippet.thumbnails.default.url}</p>
  </li>`
  ).join('');*/
  const jsonLength = responseJson.hits.length;
  for (let i = 0; i < jsonLength; i++) {
    const jsonIndex = responseJson.hits[i];

    
    $('#recipy-results').append(
      `<img src="${jsonIndex.recipe.image}">
      <p>${jsonIndex.recipe.label}</p>
      <ul id="recipe-${i}"></ul>
      <a href=${jsonIndex.recipe.url} target="_blank">${jsonIndex.recipe.url}</a><br>
      `
    )
    getIngredients(responseJson,i);
  }
}

function getIngredients(responseJson,i) {
    const ingredientLength = responseJson.hits[i].recipe.ingredientLines.length;
    for (let x = 0; x < ingredientLength; x++) {
    const ingredientIndex = responseJson.hits[i].recipe.ingredientLines[x];
    $(`#recipe-${i}`).append(
        `<li>${ingredientIndex}</li>`
        )
    }
}

function watchForm() {
  $('#food-form').submit(event => {
    event.preventDefault();
    const foodTerm = $('#js-food-term').val();
    const cuisineTerm = $('#js-cuisine-term').val();
    const alergy1 = $('#alergy1').is(':checked');
    const alergy2 = $('#alergy2').is(':checked');
    const recipyNumber = $('#js-recipy-number').val();
    getRecipyList(foodTerm, cuisineTerm, alergy1, alergy2, recipyNumber);
  });
}

$(watchForm);