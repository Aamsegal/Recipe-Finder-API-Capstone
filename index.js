const apiKey = '1d991e6283e9a6a365d439062706bb24';
const apiId = '92de8f02';
const searchURL = 'https://api.edamam.com/search';

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

  const params = {
    q: foodTerm,
    app_id: apiId,
    app_key: apiKey
  };

  const queryString = formatQueryParams(params);

  let url = searchURL + '?' + queryString + `&from=${fromVariable}&to=${toVariable}`;

  for (let alergyIndex = 0; alergyIndex <= 15; alergyIndex++) {
    if (alergyBooleanArray[alergyIndex]) {
        url =  url + $(`#alergy${alergyIndex}`).val();
    } 
  }
  //creates the api url using the search url, query string, and values from the alergy checkboxes and back and next buttons

  fetch(url)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => displayResults(responseJson,fromVariable))
    .catch(err => {
        $('.recipe-results').empty();
        $('#js-error-message').text(`Something went wrong: ${err.message}`);

    });
}
  //standard API call. If the responce is acceptable, we get the JSON file. If the call is bad, then it returns an error message



function preventDailyNutrientsError(path,ingredient,defaultValue = 0) {
  return R.path(path,ingredient) || defaultValue;
}



function getDailyNutrients(jsonIndex) {
  
  const nutrientArrayTags = ['FAT','FIBTG','PROCNT','CHLOE','NA','CA','FE','CHOCDF'];
  //Above is an array of the HTML tags to filter for different dietary restrictions in the API call
  
  //FIBTG = fiber, PROCNT = protein, CHLOE = cholesterol, CHOCFG = carbs
  const nutrientArray = [];

  const servingSize = jsonIndex.recipe.yield;
  nutrientArray.push(servingSize);

  let caloriesPerServing = jsonIndex.recipe.calories/servingSize;
  nutrientArray.push(Math.round(caloriesPerServing));

  for (let i = 0 ; i < nutrientArrayTags.length; i++) {
    let dailyNutrient = preventDailyNutrientsError([`${nutrientArrayTags[i]}`,'quantity'],jsonIndex.recipe.totalDaily)/servingSize;
    nutrientArray.push(Math.round(dailyNutrient));
    /*uses ramda function to check if a value is defined, and if it isnt, return 0. This prevents the program from crashing if the value is undefined
    which it can be if a recipe doesnt have any of the called nutrients*/
  }

  return nutrientArray;
}

function displayResults(responseJson, fromVariable) {
  $('.recipe-results').empty();
  //clears the recipe results in order to post new ones

  const noResults = !responseJson || (responseJson && !responseJson.hits.length);
  if (noResults) {
    $('#recipe-results').append('No reslts found');
    return;
  }

  if (fromVariable > 0) {
    document.getElementById('back-button').style.display = 'inline-block';
    document.getElementById('next-button').style.display = 'inline-block';
  } else {
    document.getElementById('back-button').style.display = 'none';
    document.getElementById('next-button').style.display = 'inline-block';
  }
  //shows the back and next buttons depending on the value of the from variable
  
  //if no results are found, return an error message saying no results were found.

  const jsonLength = responseJson.hits.length;
  for (let i = 0; i < jsonLength; i++) {

    const jsonIndex = responseJson.hits[i];

    let dailyNutrientsServing = getDailyNutrients(jsonIndex);
    
    $('#recipe-results').append(
      `<section class="recipe-group">
      
        <section class="recipe-name">
          <h2 class="header-Group">${jsonIndex.recipe.label}</h2>
          <h2 class="serving-Group">(${dailyNutrientsServing[0]} servings)</h2>
        </section>

        <section class="recipe-section ${i}">
          <img src="${jsonIndex.recipe.image}" class="food-image">
        </section>

        <section class="nutrient-section">
          <section class="recipe-header">
            <h2 class="header-Group">Nutrients</h2>
            <h2 class="serving-Group"> (per serving)</h2>
          </section>

          <ul class="nutrient-list">
          <li class="nutrient-group-one">${dailyNutrientsServing[1]} calories</li>
          <li class="nutrient-group-two">${dailyNutrientsServing[2]}% of your daily Fat</li>
          <li class="nutrient-group-one">${dailyNutrientsServing[3]}% of your daily Fiber</li>
          <li class="nutrient-group-two">${dailyNutrientsServing[4]}% of your daily Protein</li>
          <li class="nutrient-group-one">${dailyNutrientsServing[5]}% of your daily Cholesterol</li>
          <li class="nutrient-group-two">${dailyNutrientsServing[6]}% of your daily Sodium</li>
          <li class="nutrient-group-one">${dailyNutrientsServing[7]}% of your daily Calcium</li>
          <li class="nutrient-group-two">${dailyNutrientsServing[8]}% of your daily Iron</li>
          <li class="nutrient-group-one">${dailyNutrientsServing[9]}% of your daily Carbs</li></ul>
        </section>

        <section class="ingredient-section">
          <section class="recipe-header">
            <h2 class="recipe-info-header">Ingredients</h2>
          </section>
          
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
    getInitialRecipeList(foodTerm, alergyBooleanArray, fromVariable, toVariable);
    navigationButtons(foodTerm, alergyBooleanArray, fromVariable, toVariable);
    //shows the navigation buttons and runs the API call function      
  });
}

$(watchForm(0,9));