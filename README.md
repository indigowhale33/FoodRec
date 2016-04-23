# FoodRec

Set up:

(1) Clone repo into a local folder. Make sure to have Node installed.

(2) Open up a terminal in that folder. Install project with:
```javascript
npm install
```

(3) Edit db_config.json with information to access your database:
```json
{
	"user": "example_user",
	"password": "example_password",
	"database": "group6_cook",
	"host": "localhost",
	"port": 8000
}
```
All values should the the same except for `user` and `password`. Use ssh to tunnel into the remote db machine. To remind yourself how to tunnel, look in the file `SSH_TUNNEL_DB_INSTRUCTIONS.txt` for more instructions.

(4) Run server with:
```javascript
node server.js or
node start or
nodemon server.js
```
I recommend using `nodemon` if you're doing a lot of editing.

(5) All points of access are specified in `%router.js` files in the /router directory. For instance, access points that manipulate the recipes table or do something related to recipes are located in the file `recipesRouter.js`.

### Routes
All requests into the backend come in the form of parameterized URL. 

`As of right now (4/18)`, I have changed it so that all url parameters match the attribute names in the database. Apparently, naming your url parameters the same as your db attribute is very bad practice, but oh well, this is a class project so it doesn't matter. I hope it makes things less confusing for you. So for instance, parameters in recipeRouters are: `id` and `recipe_name` and `user_name` which matches what we use in the database.

I return a JSON object with the same keys for **all** requests. It looks like this:

{
  "status": 200,
  "result": "Query successful!",
  "requestType": "Generate nutrition facts for recipe",
  "data": {
		... *data here* ...
  }
}

- The `status` key represents the state of the call. `200` means success. `400` means failure. 
- The `result` key contains a message about the result of the query. It'll say a variety of things like "Query successful" or "Insert into pantry successful" or "Cannot find ingredient with the specified id". 
- The `requestType` key contains the type of request you sent.
- The `data` key contains data returned to you if you did a GET request.

### Functionalities I have implemented
Here are the routes that I finished and I have tested with the remote database. So basically I am most confident about these. Please implement front-end functionalities with these finished ones only:

 `/ingredients/getAll` -- get all ingredients
 
`/ingredients/getIngredientBySubstring/params` -- get ingredient with a particular substring. Useful for when user types in search box and you need to query the db for ingredients that match what they type.

`/ingredients/getIngredient/params` -- get ingredient by name or id. Note: if you search with name parameter, the name you input has to match the name in the ingredients table EXACTLY. It's better to just query by ID.

`/recipes/generatePossibleRecipesFromPantry/params` -- generate possible recipes based on what the user has in the pantry. Retrieves all recipes which contains ALL ingredients currently in user's pantry. The user needs to have EVERY ingredient in the recipe for it to match. This works. Use it!

`/recipes/generateNutritionFacts/params` -- generates nutrition facts. I still need to finetune a little bit, but the return format should not change. Go ahead and implement the front-end stuff the way it is right now.
 
`/recipes/getRecipe/params` -- get recipe by ID. Works.

`/recipes/getPossibleRecipes/params`-- Generate ingredients that, when added to the pantry, will allow for more recipes. See comments in `recipeRouter.js`

`/pantry/getPantry/params` -- Get ingredients in the user's pantry.

`/pantry/addIngredientToPantry/params` -- Works! This call does multiple things:

 1. inserts a new ingredient to the user's pantry
 2. updates the amount for that ingredient if the user already has that ingredient, but in a different amount
 3. creates a new pantry with a unique pantry_id for new users if the user does not have a pantry already (this happens when the user first signs up and does not have any ingredients in the pantry, and thus no rows in the "pantries" table OR when the user deletes all ingredients in the pantry).

`pantry/deleteIngredient/params` -- removes ingredient from user's pantry.

`/auth/signup/params` -- sign up a new user. No password yet...

`/auth/insertNewFriend/params` -- add a new friend. Adding a new friend is not mutual.

`/auth/deleteFriend/params` -- delete a friend.

`/recipes/getPossibleRecipesCombinedWithFriendsPantry/params`-- merge 2 pantries together to get even more possible recipes. Useful if you want 2 users to put their ingredients together to see what they can make together.

`/ingredients/suggestIngredients/params` -- suggests an ingredient that will generate the most recipes if it were added. Works!

`/recipes/recommendRecipeCosineSimilarity/params` -- suggests a recipe from another recipe. Uses the cosine similarity method. Tested.

More info on these calls in the appropriate `%router.js` file in the \router folder.

