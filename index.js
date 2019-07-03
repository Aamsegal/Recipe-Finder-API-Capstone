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
//goes through the keys in the params object which are requited values for this API call, and creates the text for the url

function navigationButtons(foodTerm, alergyBooleanArray, fromVariable, toVariable) {

    document.getElementById('back-button').onclick = function() {
      event.preventDefault();
      fromVariable = fromVariable - 10;
      toVariable = toVariable - 10;
      getInitialRecipeList(foodTerm, alergyBooleanArray, fromVariable, toVariable);
      window.location = '#Home';
    };

    //when the back button is clicked, run the recipe api call with a lower from and to value (only shows if the from value is greater than 0)

    document.getElementById('next-button').onclick = function() {
      event.preventDefault();
      fromVariable = fromVariable + 10;
      toVariable = toVariable + 10;
      getInitialRecipeList(foodTerm, alergyBooleanArray, fromVariable, toVariable);
      window.location = '#Home';
    }

    //when the next button is clicked, run the recipe api call with a higher from and to value
};

function getInitialRecipeList(foodTerm, alergyBooleanArray, fromVariable, toVariable) {
  if (fromVariable > 0) {
    document.getElementById('back-button').style.display = 'inline-block';
    document.getElementById('next-button').style.display = 'inline-block';
  } else {
    document.getElementById('back-button').style.display = 'none';
    document.getElementById('next-button').style.display = 'inline-block';
  }

  //shows the back and next buttons depending on the value of the from variable

  const params = {
    q: foodTerm,
    app_id: apiId,
    app_key: apiKey
    };

  const queryString = formatQueryParams(params);
  let url = searchURL + '?' + queryString + `&from=${fromVariable}&to=${toVariable}`;
  for (let alergyIndex = 0; alergyIndex <= 15; alergyIndex++) {
    if (alergyBooleanArray[alergyIndex]) {
        url =  url + '&health='+ $(`#alergy${alergyIndex}`).val();
    } 
  }
  //creates the api url using the search url, query string, and values from the alergy checkboxes and back and next buttons

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
  //standard API call. If the responce is acceptable, we get the JSON file. If the call is bad, then it returns an error message

function getDailyNutrients(path,ingredient,defaultValue = 0) {
  return R.path(path,ingredient) || defaultValue;
}
/*uses ramda function to check if a value is defined, and if it isnt, return 0. This prevents the program from crashing if the value is undefined
which it can be if a recipe doesnt have any of the called nutrients*/

function displayResults(responseJson, url) {
  console.log(responseJson);
  $('.recipe-results').empty();
  //clears the recipe results in order to post new ones

  const noResults = !responseJson || (responseJson && !responseJson.hits.length);
  if (noResults) {
    $('#recipe-results').append('No reslts found');
    return;
  }
  //if no results are found, return an error message saying no results were found.

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

    /*uses the ramda function to prevent crashing error
    devines the values for each of the nutrients and calories and devides them by the serving size*/
    
    $('#recipe-results').append(
      `<section class="recipe-group">
      
      <section class="recipe-section ${i}">
      <h2 class="header-Group">${jsonIndex.recipe.label}</h2>
      <h2 class="serving-Group">(${servingSize} servings)</h2>
      <img src="${jsonIndex.recipe.image}" class="food-image">
        </section>

      <section class="nutrient-section">
      <h2 class="header-Group">Nutrients</h2>
      <h2 class="serving-Group"> (per serving)</h2>
      <ul class="nutrient-list">
      <li class="nutrient-group-one">${caloriesPerServing} calories</li>
      <li class="nutrient-group-two">${dailyFat}% of your daily Fat</li>
      <li class="nutrient-group-one">${dailyFiber}% of your daily Fiber</li>
      <li class="nutrient-group-two">${dailyProtein}% of your daily Protein</li>
      <li class="nutrient-group-one">${dailyCholesterol}% of your daily Cholesterol</li>
      <li class="nutrient-group-two">${dailySodium}% of your daily Sodium</li>
      <li class="nutrient-group-one">${dailyCalcium}% of your daily Calcium</li>
      <li class="nutrient-group-two">${dailyIron}% of your daily Iron</li>
      <li class="nutrient-group-one">${dailyCarbs}% of your daily Carbs</li></ul>
        </section>

      <section class="ingredient-section">
      <h2 class="recipe-info-header">Ingredients</h2>
      <ul id="recipe-${i}"></ul>
        </section>

      <section class="link-section">
      <a href=${jsonIndex.recipe.url} target="_blank">Find the cooking instructions here</a>
      </section>
      </section>`
      //generates the html for the nutrients section
    )
    getIngredients(responseJson,i);
  }
  }

function getIngredients(responseJson,i) {
    const ingredientLength = responseJson.hits[i].recipe.ingredientLines.length;
    for (let x = 0; x < ingredientLength; x++) {
      const ingredientIndex = responseJson.hits[i].recipe.ingredientLines[x];
      //calls the ingredient with index I from the current recipy

      let ingredientGroup = x%2;
      if (ingredientGroup === 0) {
        ingredientGroup = 'one';
      } else {
        ingredientGroup = 'two';
      }

      $(`#recipe-${i}`).append(
          `<li class="ingredient-group-${ingredientGroup}">${ingredientIndex}</li>`
          )
          //generates html for the ingredient list
    }
}

function watchForm(fromVariable, toVariable) {
  $('#food-form').submit(event => {
    event.preventDefault();
    const foodTerm = $('#js-food-term').val();
    const alergyBooleanArray = [];
    //creates an empty array to store the values of alergy checkboxes
    let alergyBoolean = true;
    for (let a = 0; a <= 15; a++) {
        alergyBoolean = $(`#alergy${a}`).is(':checked');
        alergyBooleanArray.push(alergyBoolean);
    }
    //goes through all the check boxes and if they are checked, append true, else false
    document.getElementById('next-button').style.display = 'block';
    getInitialRecipeList(foodTerm, alergyBooleanArray, fromVariable, toVariable);
    navigationButtons(foodTerm, alergyBooleanArray, fromVariable, toVariable);
    //shows the navigation buttons and runs the API call function

    
    
  });
}

$(watchForm(0,9));