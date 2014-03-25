app.factory('gameService', function ($document, $scope)
{
	$scope.items = new Array();
	$scope.score = 0;
	$scope.showDebug = false;
	var addMode = true;
	var availableSquares = new Array();

	//#region initGame
	function initGame ()
	{
		for (var i = 0; i < 4; i++)
		{
			for (var j = 0; j < 4; j++)
			{
				this.setSquareState(i, j, true);
			}
		}
		addItems([{ x: 3, y: 0, v: 2 }, { x: 3, y: 1, v: 2 }, { x: 3, y: 2, v: 2 }]);
		$document.bind("keydown", keyboardHandler);
	};

	//#endregion

	//#region setSquareState 
	function setSquareState(x, y, isAvailable)
	{
		var key = x + 4 * y;
		var nbItemsInSquare = typeof availableSquares[key] == 'undefined' ? 0 : availableSquares[key].nbItemsInSquare;

		nbItemsInSquare = isAvailable ? 0 : nbItemsInSquare + 1;
		availableSquares[key] = { x: x, y: y, nbItemsInSquare: nbItemsInSquare };
	};
	//#endregion

	//#region pickAFreeSquare 
	function pickAFreeSquare ()
	{
		var picker = new Array();
		for (var i = 0; i < availableSquares.length; i++)
		{
			if (availableSquares[i].nbItemsInSquare == 0) { picker.push(i); }
		}
		var pick = Math.floor(Math.random() * picker.length);
		return availableSquares[picker[pick]];
	};
	//#endregion

	//#region addItems 
	function addItems (inputArray)
	{
		for (var i = 0; i < inputArray.length; i++)
		{
			$scope.items.push({ x: inputArray[i].x, y: inputArray[i].y, v: inputArray[i].v, fusion: false, destroy: false, justFusionned: false });
			this.setSquareState(inputArray[i].x, inputArray[i].y, false);
		}
	};
	//#endregion

	//#region keyboardHandler 
	function keyboardHandler (event)
	{
		switch (event.which)
		{
			case 37: this.globalMove("left"); break;
			case 38: this.globalMove("up"); break;
			case 39: this.globalMove("right"); break;
			case 40: this.globalMove("down"); break;
			default: break;
		}
		$scope.$digest();
	};
	//#endregion

	//#region globalMove 
	function globalMove (direction)
	{
		var someMoveOccured = true;

		var moves = 0;
		while (someMoveOccured)
		{
			someMoveOccured = false;
			var itemsLength = $scope.items.length;
			for (var i = 0; i < itemsLength; i++)
			{
				var item = $scope.items[i];
				if (this.canMove(item, direction))
				{
					this.oneMove(item, direction);
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
		if (moves > 1 && addMode)
		{
			// add a value somewhere
			var availableSquare = this.pickAFreeSquare();
			$timeout(function ()
			{
				this.addItems({ x: availableSquare.x, y: availableSquare.y, v: 2 });
			}, 200);
		}
	};
	//#endregion

	//#region oneMove 
	function oneMove(item, direction)
	{
		this.setSquareState(item.x, item.y, true);
		switch (direction)
		{
			case "left": item.x = item.x - 1; break;
			case "right": item.x = item.x + 1; break;
			case "up": item.y = item.y - 1; break;
			case "down": item.y = item.y + 1; break;
		}
		this.setSquareState(item.x, item.y, false);
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
	function canMove (item, direction)
	{
		// test if item is on the edge
		switch (direction)
		{
			case "left": if (item.x == 0) return false; break;
			case "right": if (item.x == 3) return false; break;
			case "up": if (item.y == 0) return false; break;
			case "down": if (item.y == 3) return false; break;
		}

		// then test is some other element is there
		var adjacentItem = this.getAdjacent(item, direction);
		if (typeof adjacentItem == 'undefined')
			return true; // ... we can move this way.

		if (adjacentItem.v != item.v || adjacentItem.justFusionned || item.justFusionned || item.destroy)
		{
			return false;
		} else
		{
			item.fusion = true;
			adjacentItem.destroy = true;
		}
		return true;
	};
	//#endregion

	//#region getAdjacent 
	function getAdjacent (item, direction)
	{
		var itemsLength = $scope.items.length;
		for (var i = 0; i < itemsLength; i++)
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

	//#endregion

});