module.exports = function Pantry(pantry_id, pantry_name, owner_name, contents) 
{
	this.id = pantry_id;
	this.name = pantry_name;
	this.owner = owner_name;
	this.contents = contents;
}