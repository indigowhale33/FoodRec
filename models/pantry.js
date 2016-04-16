module.exports = function Pantry(pantry_id, pantry_name, owner_name, ingred_id, amount) 
{
	this.id = pantry_id;
	this.name = pantry_name;
	this.owner = owner_name;
	this.ingred_id = ingred_id;
	this.amount = amount;
}