var app = angular.module('app', ['textFilters', 'ngAnimate']);

app.controller('mainCtrl', function ($scope, $rootScope, $document, $timeout)
{
	$scope.addMode = true;
	$scope.autoInit = true;
	$scope.items = new Array();
	$scope.availableSquares = new Array();
	$scope.score = 0;

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
		$scope.initValues([{ x: 3, y: 0, v: 2 }, { x: 3, y: 1, v: 2 }, { x: 3, y: 2, v: 2 }]);
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

	$scope.initValues = function (inputArray)
	{
		for (var i = 0; i < inputArray.length; i++)
		{
			$scope.items.push({ x: inputArray[i].x, y: inputArray[i].y, v: inputArray[i].v, fusion: false, destroy: false, justFusionned: false });
			$scope.setSquareState(inputArray[i].x, inputArray[i].y, false);
		}
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
					$scope.oneMove(item, direction);
					someMoveOccured = true;
				}
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
		for (var i = 0; i < $scope.items.length; i++)
		{
			$scope.items[i].justFusionned = false;
		}
		if (moves > 1 && $scope.addMode)
		{
			// add a value somewhere
			var availableSquare = $scope.pickAFreeSquare();
			$timeout(function ()
			{
				$scope.addItem(availableSquare.x, availableSquare.y, 2);
			}, 200);
		}
	};
	//#endregion

	//#region addItem 
	$scope.addItem = function(x, y, val)
	{
		$scope.items.push({ x: x, y: y, v: val, fusion: false, destroy: false, justFusionned: false });
		$scope.setSquareState(x, y, false);
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
			$scope.score = $scope.score + item.v;
			item.fusion = false;
			item.justFusionned = true;
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
		if (adjacentItem.v != item.v || adjacentItem.justFusionned || item.justFusionned || item.destroy)
		{
			return false;
		} else {
			item.fusion = true;
			adjacentItem.destroy = true;
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