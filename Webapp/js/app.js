var app = angular.module('app', ['textFilters']);

app.controller('mainCtrl', function ($scope, $rootScope, $document)
{
	$scope.addMode = true;
	var init = function (addMode)
	{
		$scope.val = new Array();
		for (var i = 0; i < 4; i++)
		{
			$scope.val[i] = new Array();
			for (var j = 0; j < 4; j++)
			{
				$scope.val[i][j] = 0;
			}
		}
		$scope.val[1][1] = 2;
		$scope.val[2][3] = 2;

		$document.bind("keydown", $scope.keyMove);
	}

	$scope.getValue = function (x, y)
	{
		return $scope.val[x-1][y-1];
	}
	$scope.keyMove = function (event)
	{
		switch (event.which)
		{
			case 37: $scope.globalMove("left"); break;
			case 38: $scope.globalMove("up"); break;
			case 39: $scope.globalMove("right"); break;
			case 40: $scope.globalMove("down"); break;
			default: break;
		}
		$scope.$digest();
	} 
	$scope.globalMove = function(direction)
	{ 
		// lookup Values
		var items = $scope.lookupValues();

		var somethingHappened = true;

		var emptySquaresIndex = new Array();
		var occurences = 0;
		while (somethingHappened)
		{
			somethingHappened = false;
			// process items
			for (var i = 0; i < items.length; i++)
			{
				var item = items[i];

				if ($scope.canMove(item, direction))
				{
					item = $scope.oneMove(item, direction);
					somethingHappened = true;
				}
			}

			// Empty val Array
			for (var i = 0; i < 4; i++)
			{
				for (var j = 0; j < 4; j++)
				{
					$scope.val[i][j] = 0;
					if(!somethingHappened) emptySquaresIndex.push({ x: i, y: j });
				}
			}

			// remap items to val
			for (var i = 0; i < items.length; i++)
			{
				var item = items[i];
				$scope.val[item.x][item.y] = $scope.val[item.x][item.y] != 0 ? 2 * item.v : item.v;
				emptySquaresIndex.pop(item.y + 4 * item.x);
			}
			occurences++;
		}
		console.log("occ = " + occurences);
		if (occurences > 1 && $scope.addMode)
		{
			console.log("dispo: " + emptySquaresIndex.length);
			// add a value somewhere
			var rand = Math.floor((Math.random() * emptySquaresIndex.length));
			console.log("rand=" + rand);
			$scope.val[Math.floor(rand / 4)][rand % 4] = 2;
			console.log("Math.floor(rand / 4)=" + Math.floor(rand / 4));
			console.log("rand % 4=" + rand % 4);
		}
	}

	$scope.oneMove = function (item, direction)
	{
		switch (direction)
		{
			case "left": item.x = item.x - 1; break;
			case "right": item.x = item.x + 1; break;
			case "up": item.y = item.y - 1; break;
			case "down": item.y = item.y + 1; break;
		}
		return item;
	};

	$scope.canMove = function(item, direction)
	{
		var vals = $scope.val;
		var adjacentItem;
		switch (direction)
		{
			case "left": if (item.x == 0) return false;
				adjacentItem = vals[item.x - 1][item.y];
				break;
			case "right": if (item.x == 3) return false;
				adjacentItem = vals[item.x + 1][item.y];
				break;
			case "up": if (item.y == 0) return false;
				adjacentItem = vals[item.x][item.y - 1];
				break;
			case "down": if (item.y == 3) return false;
				adjacentItem = vals[item.x][item.y + 1];
				break;
		}
		var canMove = adjacentItem != 0 ? adjacentItem == item.v : true;
		console.log("[" + item.x + "," + item.y + "] canMove ? " + canMove);
		return canMove;
	}

	$scope.lookupValues = function ()
	{
		var items = new Array();
		for (var i = 0; i < 4; i++)
		{
			for (var j = 0; j < 4; j++)
			{
				if ($scope.val[i][j] != 0)
				{
					items.push(
						{
							x: i,
							y: j,
							v: $scope.val[i][j]
						});
				}
			}
		}
		return items;
	}
	init();
});

angular.module('textFilters', []).filter('zeroEmpty', function ()
{
	return function (text)
	{
		if (text == "0") return "";
		return text;
	}
});