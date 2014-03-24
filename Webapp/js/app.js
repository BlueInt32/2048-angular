var app = angular.module('app', ['textFilters', 'ngAnimate']);

app.controller('mainCtrl', function ($scope, $rootScope, $document)
{
	$scope.addMode = true;
	$scope.autoInit = true;
	$scope.items = new Array();
	$scope.availableSquares = new Array();

	//#region init
	var init = function() 
	{
		for (var i = 0; i < 4; i++)
		{
			for (var j = 0; j < 4; j++)
			{
				$scope.setSquareState(i, j, true);
			}
		}
		$scope.setFirst2Values(3, 0, 2, 3, 1, 2);
		$document.bind("keydown", $scope.keyMove);
	};

	//#endregion

	$scope.setSquareState = function(x, y, isAvailable)
	{
		var key = x + 4 * y;
		var nbItemsInSquare = typeof $scope.availableSquares[key] == 'undefined' ? 0 : $scope.availableSquares[key].nbItemsInSquare;
		nbItemsInSquare = isAvailable ? 0 : nbItemsInSquare + 1;
		$scope.availableSquares[key] = { x: x, y: y, nbItemsInSquare: nbItemsInSquare };
	};
	$scope.pickAFreeSquare = function()
	{
		var picker = new Array();
		for (var i = 0; i < $scope.availableSquares.length; i++)
		{
			if ($scope.availableSquares[i].nbItemsInSquare == 0) { picker.push(i); }
		}
		var pick = Math.floor(Math.random() * picker.length);
		return $scope.availableSquares[picker[pick]];
	};

	$scope.setFirst2Values = function(x1, y1, v1, x2, y2, v2)
	{
		$scope.items.push({ x: x1, y: y1, v: v1, fusion: false, destroy: false });
		$scope.setSquareState(x1, y1, false);
		$scope.items.push({ x: x2, y: y2, v: v2, fusion: false, destroy: false });
		$scope.setSquareState(x2, y2, false);
	};
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
	};
	//#endregion

	//#region globalMove 

	$scope.globalMove = function(direction)
	{
		var someMoveOccured = true;

		var emptySquaresIndex = new Array();
		var moves = 0;
		while (someMoveOccured)
		{
			someMoveOccured = false;
			// process items
			for (var i = 0; i < $scope.items.length; i++)
			{
				var item = $scope.items[i];

				if ($scope.canMove(item, direction))
				{
					console.log("item[" + item.x + "-" + item.y + "] can move " + direction);
					$scope.oneMove(item, direction);
					someMoveOccured = true;
				} else
				{
					console.log("item[" + item.x + "-" + item.y + "] can NOT move " + direction);
				}
				console.log(item);
			}

			for (var i = 0; i < $scope.items.length; i++)
			{
				var item = $scope.items[i];

				if (item.destroy)
				{
					$scope.items.splice(i, 1);
				}
			}

			moves++;
		}
		console.dir($scope.items);

		if (moves > 1 && $scope.addMode)
		{
			// add a value somewhere
			var availableSquare = $scope.pickAFreeSquare();
			$scope.addItem(availableSquare.x, availableSquare.y, 2);
		}
	};
	//#endregion

	//#region addItem 
	$scope.addItem = function(x, y, val)
	{
		//$scope.val[x][y] = val;
		$scope.items.push({ x: x, y: y, v: val, fusion: false, destroy: false });
		//$scope.lookupValues();
	};
	//#endregion

	//#region oneMove 

	$scope.oneMove = function (item, direction)
	{
		$scope.setSquareState(item.x, item.y, true);
		switch (direction)
		{
			case "left": item.x = item.x - 1;  break;
			case "right": item.x = item.x + 1; break;
			case "up": item.y = item.y - 1; break;
			case "down": item.y = item.y + 1; break;
		}
		$scope.setSquareState(item.x, item.y, false);
		if (item.fusion)
		{
			item.v = 2 * item.v;
			item.fusion = false;
		}
			
		return item;
	};
	//#endregion

	//#region canMove 

	$scope.canMove = function(item, direction)
	{
		
		switch (direction)
		{
			case "left":if (item.x == 0) return false;break;
			case "right":if (item.x == 3) return false;break;
			case "up":if (item.y == 0) return false;break;
			case "down":if (item.y == 3) return false;break;
		}
		var adjacentItem = $scope.getAdjacent(item, direction);
		if (typeof adjacentItem == 'undefined')
			return true;
		if (adjacentItem.v != item.v)
		{
			return false;
		} else {
			item.fusion = true;
			console.log($scope.logItem(item) + " marked for fusion");
			adjacentItem.destroy = true;
			console.log($scope.logItem(adjacentItem) + " marked for deletion");
		}
		return true;
	};
	//#endregion
	$scope.logItem = function(item)
	{
		return "item[" + item.x + "-" + item.y + "]";
	};
	$scope.getAdjacent = function(item, direction)
	{
		for (var i = 0; i < $scope.items.length; i++)
		{
			var testItem = $scope.items[i];
			if (testItem.x == item.x && testItem.y == item.y)
				continue;
			switch (direction)
			{
				case "left": if (testItem.x == item.x - 1 && testItem.y == item.y) return testItem;
					break;
				case "right": if (testItem.x == item.x + 1 && testItem.y == item.y) return testItem;
					break;
				case "up": if (testItem.y == item.y - 1 && testItem.x == item.x) return testItem;
					break;
				case "down": if (testItem.y == item.y + 1 && testItem.x == item.x) return testItem;
					break;
				default:
					return null;
			}
		}
	};
	if ($scope.autoInit)
		init();
});

angular.module('textFilters', []).filter('zeroEmpty', function ()
{
	return function(text)
	{
		if (text == "0") return "";
		return text;
	};
});