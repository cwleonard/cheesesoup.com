var mysql = require('mysql');
var q = require('q');
var async = require('async');

module.exports = function(dbconf) {
	
	var pool = mysql.createPool(dbconf);
	
	function makeUrl(str) {

		var n = str.toLowerCase();
		n = n.replace(/[^a-z]/g, '-');

		return n;

	}

	function list(cb) {

		var sql = 'select id, title from recipes where approved = 1 order by title';
		pool.query(sql, [], function(err, rows) {

			if (err) {
				cb(err);
			} else {
				var ret = [];
				for (var i = 0; i < rows.length; i++) {
					ret.push({
						recipeId: rows[i].id,
						recipeName: rows[i].title,
						linkUrl: makeUrl(rows[i].title)
					});
				}
				cb(null, ret);
			}

		});

	}

	function ingredients(recipeId, cb) {

		var sql = "select amount, units, ingredient, notes from ingredients where recipeId = ?";
		pool.query(sql, [recipeId], function(err, rows) {
			if (err) {
				cb(err);
			} else {
				var ing = [];
				for (var i = 0; i < rows.length; i++) {
					ing.push({
						amount: rows[i].amount,
						units: rows[i].units,
						ingredient: rows[i].ingredient,
						notes: rows[i].notes
					});
				}
				cb(null, ing);
			}
		});

	}

	function recipeByName(name, cb) {

		var n = name.replace(/\-/g, "_");

		var sql = "select id, title, recipe, notes, times_rated, total_rating, " +
			"submitted_by, yield, preptime, cooktime " +
			"from recipes where title like ? and approved = 1";
		pool.query(sql, [n], function(err, rows) {

			if (err) {
				cb(err);
			} else {
				if (rows.length > 0) {
					var recipe = rows[0];
					ingredients(recipe.id, function(err, ing) {
						if (err) {
							cb(err);
						} else {
							recipe.ingredients = ing;
							cb(null, recipe);
						}
					});
				} else {
					cb(null, null);
				}
			}

		});

	}

	function recipe(n, cb) {
		
		var sql = "select id, title, recipe, notes, times_rated, total_rating, " +
			"submitted_by, yield, preptime, cooktime " +
			"from recipes where id = ? and approved = 1";
		pool.query(sql, [n], function(err, rows) {
			
			if (err) {
				cb(err);
			} else {
				if (rows.length > 0) {
					var recipe = rows[0];
					ingredients(recipe.id, function(err, ing) {
						if (err) {
							cb(err);
						} else {
							recipe.ingredients = ing;
							cb(null, recipe);
						}
					});
				} else {
					cb(null, null);
				}
			}
			
		});
		
	}
	
	return {
		
		getAllRecipes: function (cb) {
			
			list(cb);
			
		},

		getRecipe: function (id, cb) {

			recipe(id, cb);
			
		},

		getRecipeByName: function(name, cb) {

			recipeByName(name, cb);

		}

	};
	
};