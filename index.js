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

function navigationButtons(foodTerm, alergyBooleanArray, fromVariable, toVariable) {
  /*$('#navigation-buttons').submit(event => {
    event.preventDefault();
    fromVariable = fromVariable + 10;
    toVariable = toVariable + 10;
    getInitialRecipeList(foodTerm, alergyBooleanArray, fromVariable, toVariable);*/

    document.getElementById('back-button').onclick = function() {
      event.preventDefault();
      fromVariable = fromVariable - 10;
      toVariable = toVariable - 10;
      getInitialRecipeList(foodTerm, alergyBooleanArray, fromVariable, toVariable);
      window.location = '#Home';
    };

    document.getElementById('next-button').onclick = function() {
      event.preventDefault();
      fromVariable = fromVariable + 10;
      toVariable = toVariable + 10;
      getInitialRecipeList(foodTerm, alergyBooleanArray, fromVariable, toVariable);
      window.location = '#Home';
    }
};

/*function nextButtonPressed (foodTerm, alergyBooleanArray, fromVariable, toVariable) {
  fromVariable = fromVariable - 10;
  toVariable = toVariable - 10;
  getInitialRecipeList(foodTerm, alergyBooleanArray, fromVariable, toVariable);
}

function backButtonPressed (foodTerm, alergyBooleanArray, fromVariable, toVariable) {
  fromVariable = fromVariable - 10;
  toVariable = toVariable - 10;
  getInitialRecipeList(foodTerm, alergyBooleanArray, fromVariable, toVariable);
}*/

function getInitialRecipeList(foodTerm, alergyBooleanArray, fromVariable, toVariable) {
  if (fromVariable > 0) {
    document.getElementById('back-button').style.display = 'block';
    document.getElementById('next-button').style.display = 'inline-block';
  } else {
    document.getElementById('back-button').style.display = 'none';
    document.getElementById('next-button').style.display = 'inline-block';
  }
  const params = {
    q: foodTerm,
    app_id: apiId,
    app_key: apiKey
    };

    /*const fromBase = 0;
    const toBase = 9;
    const from = fromBase + callNumber*10;
    const to = toBase + callNumber*10;*/
    // the code above is trying to set the ground work to scroll for more recipies
  const queryString = formatQueryParams(params);
  let url = searchURL + '?' + queryString + `&from=${fromVariable}&to=${toVariable}`;
  for (let alergyIndex = 0; alergyIndex <= 15; alergyIndex++) {
    if (alergyBooleanArray[alergyIndex]) {
        url =  url + '&health='+ $(`#alergy${alergyIndex}`).val();
    } 
  }

  /*fromToUrl = nextBack();*/


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

function getDailyNutrients(path,ingredient,defaultValue = 0) {
  return R.path(path,ingredient) || defaultValue;
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
    const servingSize = jsonIndex.recipe.yield;

    let caloriesPerServing = jsonIndex.recipe.calories/servingSize;
    caloriesPerServing = Math.round(caloriesPerServing);

    let dailyFat = getDailyNutrients(['FAT','quantity'],jsonIndex.recipe.totalDaily)/servingSize;
    dailyFat = Math.round(dailyFat);

    let dailyFiber = getDailyNutrients(['FIBTG','quantity'],jsonIndex.recipe.totalDaily)/servingSize;
    dailyFiber = Math.round(dailyFiber)

    let dailyProtein = getDailyNutrients(['PROCNT','quantity'],jsonIndex.recipe.totalDaily)/servingSize;
    dailyProtein = Math.round(dailyProtein);

    let dailyCholesterol = getDailyNutrients(['CHLOE','quantity'],jsonIndex.recipe.totalDaily)/servingSize;
    dailyCholesterol = Math.round(dailyCholesterol);

    let dailySodium = getDailyNutrients(['NA','quantity'],jsonIndex.recipe.totalDaily)/servingSize;
    dailySodium = Math.round(dailySodium);

    let dailyCalcium = getDailyNutrients(['CA','quantity'],jsonIndex.recipe.totalDaily)/servingSize;
    dailyCalcium = Math.round(dailyCalcium);

    let dailyIron = getDailyNutrients(['FE','quantity'],jsonIndex.recipe.totalDaily)/servingSize;
    dailyIron = Math.round(dailyIron);

    let dailyCarbs = getDailyNutrients(['CHOCDF','quantity'],jsonIndex.recipe.totalDaily)/servingSize;
    dailyCarbs = Math.round(dailyCarbs);




    
    $('#recipe-results').append(
      `<section class="recipe-section ${i}">
      <h2>${jsonIndex.recipe.label} (${servingSize} servings)</h2>
      <img src="${jsonIndex.recipe.image}" class="food-image">
      <ul id="recipe-${i}"></ul>
      
      <h2>Nutrients</h2>
      <ul class="nutrient-list">
      <li>${caloriesPerServing} calories per serving</li>
      <li>${dailyFat}% of your daily Fat</li>
      <li>${dailyFiber}% of your daily Fiber</li>
      <li>${dailyProtein}% of your daily Protein</li>
      <li>${dailyCholesterol}% of your daily Cholesterol</li>
      <li>${dailySodium}% of your daily Sodium</li>
      <li>${dailyCalcium}% of your daily Calcium</li>
      <li>${dailyIron}% of your daily Iron</li>
      <li>${dailyCarbs}% of your daily Carbs</li></ul>
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



/*function getNutrients(keys,recipt) {
  for (let i = 0; i < keys.length; i++) {
    if (!recipt[keys[i]]) {
      return;
    }
  }
}*/

function watchForm(fromVariable, toVariable) {
  $('#food-form').submit(event => {
    event.preventDefault();
    const foodTerm = $('#js-food-term').val();
    const alergyBooleanArray = [];
    let alergyBoolean = true;
    for (let a = 0; a <= 15; a++) {
        alergyBoolean = $(`#alergy${a}`).is(':checked');
        alergyBooleanArray.push(alergyBoolean);
    }
    console.log(alergyBooleanArray);
    document.getElementById('next-button').style.display = 'block';
    getInitialRecipeList(foodTerm, alergyBooleanArray, fromVariable, toVariable);
    navigationButtons(foodTerm, alergyBooleanArray, fromVariable, toVariable);

    
    
  });
}

$(watchForm(0,9));