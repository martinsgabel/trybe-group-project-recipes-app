import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { fetchDrinks, fetchFoods } from '../helpers/fetchRecipesAPI';
import '../style/RecipesDetail.css';
import RecommendationCard from '../components/RecommendationCard';
import whiteHeartIcon from '../images/whiteHeartIcon.svg';
import blackHeartIcon from '../images/blackHeartIcon.svg';
import shareIcon from '../images/shareIcon.svg';
import
removeRecipeFromLocalStorage
from '../helpers/reusable_functions/removeRecipeFromLocalStorage';
import {
  foodsInLocalStorage,
  favoriteRecipes, foodToFavorite, doneRecipes } from '../helpers/storageFuncs';
import filterOfIngredients from '../helpers/reusable_functions/filterOfIngredients';

const FoodDetail = () => {
  // const storage = JSON.parse(localStorage.getItem('favoriteRecipes'));
  const history = useHistory();
  const [recipe, setRecipe] = useState({ ingredientsAndMeasures: [] });
  const [recommendations, setRecommendations] = useState([]);
  const [copy, setCopy] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [done, setDone] = useState(false);
  const [startedFood, setStartedFood] = useState(false);
  const id = history.location.pathname.split('/')[2];
  // const [foodsInStorage, setFoodsInStorage] = useState(storage || []);

  // const date = Date.now();
  const loadsRecommendations = async () => {
    const numberOfRecommendations = 5;
    const recommendationsData = await fetchDrinks('https://www.thecocktaildb.com/api/json/v1/1/search.php?s=');
    const usableRecommendations = recommendationsData
      .filter((r, index) => index <= numberOfRecommendations);
    setRecommendations(usableRecommendations);
  };

  useEffect(() => {
    favoriteRecipes(history, setFavorite);
    const fetchRecipe = async () => {
      const recipeData = await fetchFoods(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      console.log(recipeData);
      loadsRecommendations();
      const entries = Object.entries(recipeData[0]);
      const ingredientsAndMeasures = filterOfIngredients(entries);
      setRecipe({ ...recipeData[0], ingredientsAndMeasures });
    };
    fetchRecipe();
  }, [history, id]);

  const copyRecipeToClipboard = async () => {
    await navigator.clipboard.writeText(`http://localhost:3000/foods/${id}`);
    setCopy(true);
  };

  useEffect(() => {
    doneRecipes(history, setDone);
    const storageStarted = JSON.parse(localStorage.getItem('inProgressRecipes'));
    if (storageStarted && storageStarted.meals[id]) return setStartedFood(true);
  },
  [history, id]);

  const startedRecipe = () => {
    foodsInLocalStorage(id);
  };

  // useEffect(() => {
  //   localStorage.setItem('favoriteRecipes', JSON.stringify(foodsInStorage));
  // }, [foodsInStorage]);

  return (
    <section>
      <img
        src={ recipe.strMealThumb }
        alt={ recipe.strMeal }
        data-testid="recipe-photo"
        className="detail_img_recipe"
      />
      <div className="detail_recipe">
        <h1 data-testid="recipe-title">{ recipe.strMeal }</h1>
        <h3 data-testid="recipe-category">{ recipe.strCategory }</h3>
        {favorite ? (
          <input
            type="image"
            src={ blackHeartIcon }
            alt="favorite"
            data-testid="favorite-btn"
            style={ { display: 'block' } }
            onClick={ () => removeRecipeFromLocalStorage(history, setFavorite) }
          />
        ) : (
          <input
            type="image"
            src={ whiteHeartIcon }
            alt="non-favorite"
            data-testid="favorite-btn"
            style={ { display: 'block' } }
            onClick={ () => foodToFavorite(recipe, setFavorite) }
          />
        )}
        <input
          type="image"
          src={ shareIcon }
          alt="share"
          data-testid="share-btn"
          onClick={ copyRecipeToClipboard }
        />

        {copy && <p style={ { color: 'green' } }>Link copied!</p>}

        <h3>Ingredients</h3>
        <ul>
          {recipe.ingredientsAndMeasures
            .map((i, index) => (
              <li
                key={ index }
                data-testid={ `${index}-ingredient-name-and-measure` }
              >
                { i }
              </li>
            ))}
        </ul>
        <h3>Instructions</h3>
        <p data-testid="instructions">{ recipe.strInstructions }</p>
        <iframe
          data-testid="video"
          src={ recipe.strYoutube && `https://www.youtube.com/embed/${recipe.strYoutube.split('=')[1]}` }
          title={ recipe.strMeal }
          allow="accelerometer;
          autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
        <h3>Recommended</h3>
        <div className="container_recommendations">
          {recommendations
            .map(({ idDrink, strDrink, strDrinkThumb, strAlcoholic }, index) => (
              <RecommendationCard
                key={ idDrink }
                id={ idDrink }
                index={ index }
                recommendationType={ strAlcoholic }
                recommendationName={ strDrink }
                recommendationImage={ strDrinkThumb }
                endPoint="drinks"
              />
            ))}
        </div>
        {!done && (
          <button
            className="startRecipeButton"
            type="button"
            data-testid="start-recipe-btn"
            onClick={ () => {
              startedRecipe();
              history.push(`/foods/${id}/in-progress`);
            } }
          >
            {startedFood ? 'Continue Recipe' : 'Start Recipe'}
          </button>
        )}
      </div>
    </section>
  );
};
export default FoodDetail;
