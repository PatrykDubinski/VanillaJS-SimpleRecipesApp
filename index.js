// DOM Elements

const recipesEl = document.getElementById("recipes");
const recipesBtn = document.getElementById("recipesBtn");
const favBtn = document.getElementById("favBtn");
const search = document.getElementById("search");
const form = document.getElementById("form");
const mealInfoEl = document.getElementById("meal-info");
const popup = document.getElementById("meal-popup");
const popupBtn = document.getElementById("close-popup");

// API calls

async function getRandomRecipe() {
  recipesEl.innerHTML = "";
  const response = await fetch(
    "https://www.themealdb.com/api/json/v1/1/random.php"
  );
  const responseData = await response.json();

  addMealToPage(responseData.meals[0]);
}

async function getSearchedRecipes(searchTerm) {
  recipesEl.innerHTML = "";

  const response = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`
  );
  const responseData = await response.json();

  responseData.meals.forEach((meal) => {
    addMealToPage(meal);
  });

  search.value = "";
}

async function getMealById(mealId) {
  const response = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
  );
  const responseData = await response.json();

  return responseData;
}

// Functions

async function showMealInfo(mealId) {
  mealInfoEl.innerHTML = "";

  const meal = await getMealById(mealId);
  const ingredients = [];

  const mealEl = document.createElement("div");
  mealEl.classList.add("meal-info-wrapper");

  for (let i = 1; i <= 20; i++) {
    if (meal.meals[0][`strIngredient${i}`]) {
      ingredients.push(
        `${meal.meals[0][`strIngredient${i}`]}/${
          meal.meals[0][`strMeasure${i}`]
        }`
      );
    } else {
      break;
    }
  }

  mealEl.innerHTML = `
    <h2 class="popup__title">${meal.meals[0].strMeal}</h2>
    <img src="${meal.meals[0].strMealThumb}" alt="${meal.meals[0].strMeal}" />
    <p class="popup__instructions">${meal.meals[0].strInstructions}</p>
    <ul class="popup__ingredients">
      ${ingredients.map((ing) => `<li>${ing}</li>`).join("")}
    </ul>
  `;

  popup.classList.remove("hidden");

  mealInfoEl.appendChild(mealEl);
}

async function getFavouriteMeals(isFav = false) {
  recipesEl.innerHTML = "";
  const mealIds = getMealsFromLocalStorage();
  if (mealIds.length === 0) {
    recipesEl.innerHTML =
      "<h1 class='no-fav'>You don't have any favourite recipes yet...</h1>";
  } else {
    for (let i = 0; i < mealIds.length; i++) {
      const meal = await getMealById(mealIds[i]);
      addMealToPage(meal.meals[0], isFav);
    }
  }
}

function addMealToPage(mealData, isFav = false) {
  const meal = document.createElement("article");
  meal.classList.add("recipes__recipe");

  meal.innerHTML = `
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}" />
    <div class="recipes__recipe-info">
        <p class="meal__title">${mealData.strMeal}</p>
        <p class="meal__desc">Easy, quick and yet so delicious!</p>
        <div class="recipes__recipe-info__stats">
        <div class="likes ${isFav && "active"}">
            <i class="fas fa-heart"></i>
        </div>
        <div class="time">
            <i class="far fa-clock"></i>
            <p>${Math.floor(Math.random() * 30) + 10}'</p>
        </div>
        <div class="portions">
            <p>${Math.floor(Math.random() * 4) + 1} portion</p>
        </div>
        </div>
    </div>
  `;

  const likeBtn = meal.querySelector(".likes");

  meal.addEventListener("click", () => {
    showMealInfo(mealData.idMeal);
  });

  likeBtn.addEventListener("click", (e) => {
    if (likeBtn.classList.contains("active")) {
      e.stopPropagation();
      removeMealFromLocalStorage(mealData.idMeal);
      likeBtn.classList.remove("active");
    } else {
      e.stopPropagation();
      saveMealToLocalStorage(mealData.idMeal);
      likeBtn.classList.add("active");
    }
  });

  recipesEl.appendChild(meal);
}

// Local Storage Handling

function getMealsFromLocalStorage() {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));

  return mealIds === null ? [] : mealIds;
}

function saveMealToLocalStorage(mealId) {
  const mealIds = getMealsFromLocalStorage();

  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function removeMealFromLocalStorage(mealId) {
  const mealIds = getMealsFromLocalStorage();
  localStorage.setItem(
    "mealIds",
    JSON.stringify(mealIds.filter((id) => id !== mealId))
  );
}

// Event listeners

form.addEventListener("submit", (e) => {
  e.preventDefault();
  getSearchedRecipes(search.value);
  if (favBtn.classList.contains("active")) {
    favBtn.classList.remove("active");
    recipesBtn.classList.add("active");
  }
});

favBtn.addEventListener("click", () => {
  if (!favBtn.classList.contains("active")) {
    favBtn.classList.add("active");
    recipesBtn.classList.remove("active");
    getFavouriteMeals(true);
  }
});

recipesBtn.addEventListener("click", () => {
  if (!recipesBtn.classList.contains("active")) {
    recipesBtn.classList.add("active");
    favBtn.classList.remove("active");
    getRandomRecipe();
  }
});

popupBtn.addEventListener("click", () => {
  popup.classList.add("hidden");
});

// Init

getRandomRecipe();
