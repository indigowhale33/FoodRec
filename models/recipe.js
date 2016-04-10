module.exports = function Recipe(recipeName, ingredients, prepTime, description, directions) {

	this.recipeName = recipeName;
	this.ingredients = ingredients;
	this.prepTime = prepTime;
	this.description = description;
	this.directions = directions;
}