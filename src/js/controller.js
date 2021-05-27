import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js'

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

//if (module.hot) {
//    module.hot.accept();
//}

const controlRecipes = async function () {
    try {
        const id = window.location.hash.slice(1);

        if (!id) return;
        recipeView.renderSpinner();

        //updates results view to mark selected search result
        resultsView.update(model.getSearchResultsPage());

        //updating bookmarks view
        bookmarksView.update(model.state.bookmarks);

        //1 Loading recipe
        await model.loadRecipe(id);

        //2 Rendering recipe
        recipeView.render(model.state.recipe);

    } catch (err) {
        console.log(err);
        recipeView.renderError();
    }
};

const controlSearchResults = async function () {
    try {
        resultsView.renderSpinner();

        //1 Get search Query
        const query = searchView.getQuery();
        if (!query) return;

        //2 Load search result
        await model.loadSearchResults(query);

        //3 Render result
        //resultsView.render(model.state.search.results);
        resultsView.render(model.getSearchResultsPage());

        //4 Render initial pagination buttons
        paginationView.render(model.state.search);
    } catch (err) {
        console.log(err);
        //resultsView.renderError();
    }
};

const controlPagination = function (goToPage) {
    // 1 Render NEW result
    resultsView.render(model.getSearchResultsPage(goToPage));

    // 2 Render NEW pagination buttons
    paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
    // Update the recipe servings (in state)
    model.updateServings(newServings);

    // Update the view
    //recipeView.render(model.state.recipe);
    recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
    // Add or Remove bookmark
    if (!model.state.recipe.bookmarked)
        model.addBookmark(model.state.recipe);
    else
        model.deleteBookmark(model.state.recipe.id);

    // Update recipe view
    recipeView.update(model.state.recipe);

    // Render bookmarks
    bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
    bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
    try {
        // Show loading spinner
        addRecipeView.renderSpinner();

        // Upload the new recipe
        await model.uploadRecipe(newRecipe);
        console.log(model.state.recipe);

        // Render recipe
        recipeView.render(model.state.recipe);

        // Success message
        addRecipeView.renderMessage();

        // Change ID in url, do this before bookmarks render to highlight it
        window.history.pushState(null, '', `#${model.state.recipe.id}`);

        // Render bookmark
        bookmarksView.render(model.state.bookmarks);

        // Close form window
        setTimeout(function () {
            addRecipeView.toggleWindow();
        }, MODAL_CLOSE_SEC * 1000);
    } catch (err) {
        console.error('CONTROLLER ERROR: ', err);
        addRecipeView.renderError(err.message);
    }
};

const init = function () {
    bookmarksView.addHandlerRender(controlBookmarks);
    recipeView.addHandlerRender(controlRecipes);
    recipeView.addHandlerUpdateServings(controlServings);
    recipeView.addHandlerAddBookmark(controlAddBookmark);
    searchView.addHandlerSearch(controlSearchResults);
    paginationView.addHandlerClick(controlPagination);
    addRecipeView.addHanlderUpload(controlAddRecipe);
};

init();
