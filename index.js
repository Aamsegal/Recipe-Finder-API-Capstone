'use strict';

// put your own value below!
const apiKey = '1d991e6283e9a6a365d439062706bb24';
const apiId = '92de8f02';
const searchURL = 'https://api.edamam.com/search';
const exampleCall = 'https://api.edamam.com/search?q=chicken&app_id=92de8f02&app_key=1d991e6283e9a6a365d439062706bb24&from=0&to=3&calories=591-722&health=alcohol-free';
const dietaryRestrictionList ="dairy-free   egg-free   gluten-free   keto-free   khosher   low-sugar   paleo   red-meat-free   seasame-free   shellfish-free   soy-free   vegan vegitarian"


function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}


function getInitialRecipeList(foodTerm, cuisineTerm, alergyBooleanArray, callNumber) {
  const params = {
    q: foodTerm,
    app_id: apiId,
    app_key: apiKey,
    from: 0,
    to: 10
    };

    /*const fromBase = 0;
    const toBase = 9;
    const from = fromBase + callNumber*10;
    const to = toBase + callNumber*10;*/
    // the code above is trying to set the ground work to scroll for more recipies
  const queryString = formatQueryParams(params);
  let url = searchURL + '?' + queryString /*+ `&from=${from}&to=${to}`*/;
  for (let alergyIndex = 0; alergyIndex <= 15; alergyIndex++) {
    if (alergyBooleanArray[alergyIndex]) {
        url =  url + '&health='+ $(`#alergy${alergyIndex}`).val();
    } 
  } 


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
      $('.recipe-results').empty();
      $('#js-error-message').text(`Something went wrong: ${err.message}`);

});
}


function displayResults(responseJson, url) {
  // if there are previous results, remove them
  console.log(responseJson);
  $('.recipe-results').empty();
  // iterate through the items array
  const noResults = !responseJson || (responseJson && !responseJson.hits.length);

  if (noResults) {
    $('#recipe-results').append('No reslts found');
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

    
    $('#recipe-results').append(
      `<section class="recipe-section ${i}">
      <h2>${jsonIndex.recipe.label} (${jsonIndex.recipe.yield} servings)</h2>
      <img src="${jsonIndex.recipe.image}" class="food-image">
      <ul id="recipe-${i}"></ul>
      <a href=${jsonIndex.recipe.url} target="_blank">Find the cooking instructions here</a><br>
      </section>
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
    const alergyBooleanArray = [];
    let alergyBoolean = true;
    for (let a = 0; a <= 15; a++) {
        alergyBoolean = $(`#alergy${a}`).is(':checked');
        alergyBooleanArray.push(alergyBoolean);
    }
    const initialCall = 0;
    console.log(alergyBooleanArray);
    getInitialRecipeList(foodTerm, cuisineTerm, alergyBooleanArray, initialCall);
  });
}

$(watchForm);