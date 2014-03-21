var app = angular.module('app', ['textFilters']);

app.controller('mainCtrl', function ($scope, $rootScope, $document)
{
	$scope.addMode = true;
	$scope.autoSetFirstValues = true;
	$scope.items = new Array();

	//#region init
	var init = function ()
	{
		if ($scope.autoSetFirstValues)
			$scope.setFirst2Values(1, 1, 2, 2, 3, 2);
		$document.bind("keydown", $scope.keyMove);
	}

	//#endregion

	$scope.setFirst2Values = function (x1, y1, v1, x2, y2, v2)
	{
		$scope.items.push({ x: x1, y: y1, v: v1, fusion:false, destroy:false });
		$scope.items.push({ x: x2, y: y2, v: v2, fusion: false, destroy: false });

	}
	//#endregion

	//#region keyMove 

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
	//#endregion

	//#region globalMove 

	$scope.globalMove = function (direction)
	{
		var somethingHappened = true;

		var emptySquaresIndex = new Array();
		var occurences = 0;
		while (somethingHappened)
		{
			somethingHappened = false;
			// process items
			for (var i = 0; i < $scope.items.length; i++)
			{
				var item = $scope.items[i];

				if ($scope.canMove(item, direction))
				{
					item = $scope.oneMove(item, direction);
					somethingHappened = true;
				}
			}

			//// Empty val Array
			for (var i = 0; i < 4; i++)
			{
				for (var j = 0; j < 4; j++)
				{
					if (!somethingHappened) emptySquaresIndex.push({ x: i, y: j });
				}
			}
			for (var i = 0; i < $scope.items.length; i++)
			{
				var item = $scope.items[i];
				emptySquaresIndex.pop(item.y + 4 * item.x);
				
			}
			occurences++;
		}
		if (occurences > 1 && $scope.addMode)
		{
			// add a value somewhere
			var rand = Math.floor((Math.random() * emptySquaresIndex.length));
			var coord = { x: Math.floor(rand / 4), y: rand % 4 };
			$scope.addValue(coord.x, coord.y, 2);
			//$scope.val[Math.floor(rand / 4)][rand % 4] = 2;
		}
		console.log($scope.items);
	}
	//#endregion

	//#region addValue 
	$scope.addValue = function (x, y, val)
	{
		//$scope.val[x][y] = val;
		$scope.items.push({x: x, y:y, v:val, fusion:false, destroy:false});
		//$scope.lookupValues();
	}
	//#endregion

	//#region oneMove 

	$scope.oneMove = function (item, direction)
	{
		switch (direction)
		{
			case "left": item.x = item.x - 1; break;
			case "right": item.x = item.x + 1; break;
			case "up": item.y = item.y - 1; break;
			case "down": item.y = item.y + 1; break;
		}
		if (item.fusion)
			item.v = 2 * item.v;

		return item;
	};
	//#endregion

	//#region canMove 

	$scope.canMove = function (item, direction)
	{
		var adjacentItem = $scope.getAdjacent(item, direction);
		switch (direction)
		{
			case "left": if (item.x == 0) return false;
				break;
			case "right": if (item.x == 3) return false;
				break;
			case "up": if (item.y == 0) return false;
				break;
			case "down": if (item.y == 3) return false;
				break;
		}
		if (typeof adjacentItem == 'undefined')
			return true;
		if (adjacentItem.v != item.v)
		{
			return false;
		}
		else
		{
			item.fusion = true;
			adjacentItem.destroy = true;
		}
		return true;
	}
	//#endregion

	$scope.getAdjacent = function(item, direction)
	{
		for (var i = 0; i < $scope.items; i++)
		{
			switch (direction)
			{
				case "left": if ($scope.items[i].x == item.x - 1) return $scope.items[i];
					break;
				case "right": if ($scope.items[i].x == item.x + 1) return $scope.items[i];
					break;
				case "up": if ($scope.items[i].x == item.y - 1) return $scope.items[i];
					break;
				case "down": if ($scope.items[i].x == item.y + 1) return $scope.items[i];
					break;
			}
		}
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