var app = angular.module('app', ['textFilters']);

app

app.controller('mainCtrl', function ($scope, $rootScope, $document)
{
	$scope.addMode = true;
	$scope.autoSetFirstValues = true;
	$scope.val = new Array();
	$scope.items = new Array();

	$scope.$watch('val', function ()
	{
		console.log("Update items !");
		$scope.lookupValues();
	}, true);

	//#region init
	var init = function ()
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
		if ($scope.autoSetFirstValues)
			$scope.setFirst2Values(1, 1, 2, 2, 3, 2);
		$scope.lookupValues();
		$document.bind("keydown", $scope.keyMove);
	}

	//#endregion

	//#region setFirst2Values 
	$scope.setFirst2Values = function (x1, y1, v1, x2, y2, v2)
	{
		$scope.val[x1][y1] = v1;
		$scope.val[x2][y2] = v2;
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
		// lookup Values, generates the items array for the multiple array
		$scope.lookupValues();

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

			// Empty val Array
			for (var i = 0; i < 4; i++)
			{
				for (var j = 0; j < 4; j++)
				{
					$scope.val[i][j] = 0;
					if (!somethingHappened) emptySquaresIndex.push({ x: i, y: j });
				}
			}

			// remap $scope.items to val
			for (var i = 0; i < $scope.items.length; i++)
			{
				var item = $scope.items[i];
				$scope.val[item.x][item.y] = $scope.val[item.x][item.y] != 0 ? 2 * item.v : item.v;
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
	}
	//#endregion

	//#region addValue 
	$scope.addValue = function (x, y, val)
	{
		$scope.val[x][y] = val;
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
		return item;
	};
	//#endregion

	//#region canMove 

	$scope.canMove = function (item, direction)
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
		return canMove;
	}
	//#endregion

	//#region lookupValues

	$scope.lookupValues = function ()
	{
		$scope.items = new Array();
		for (var i = 0; i < 4; i++)
		{
			for (var j = 0; j < 4; j++)
			{
				if ($scope.val[i][j] != 0)
				{
					$scope.items.push(
						{
							x: i,
							y: j,
							v: $scope.val[i][j]
						});
				}
			}
		}
		return $scope.items;
	}
	//#endregion


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