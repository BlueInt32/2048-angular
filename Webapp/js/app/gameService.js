function gameService($timeout,  gameServiceConfig)
{
	var self = this;
	this._addMode = gameServiceConfig.addMode;
	this._autoInit = gameServiceConfig.autoInit;
	this._showDebug = gameServiceConfig.showDebug;
	this._stepbystepMode = false;
	this.timeout = $timeout;

	this._valuePick = [2, 2, 4];


	this.emptyGame = function ()
	{
		self._items = [];
		self._score = 0;
		self._availableSquares = [];

		self._lock = false;
		self._gameOver = false;
	};

	//#region initFirstItems
	this.initFirstItems = function (initValues)
	{
		//self.emptyGame();
		for (var i = 0; i < 4; i++)
		{
			for (var j = 0; j < 4; j++)
			{
				self.setSquareState(i, j, true);
			}
		}
		self.addItems(initValues);
		
	};

	//#endregion

	//#region setSquareState 
	this.setSquareState = function (x, y, isAvailable)
	{
		var key = x + 4 * y;
		self._availableSquares[key] = { x: x, y: y, isSquareOccupied: !isAvailable };
	};
	//#endregion

	//#region pickAFreeSquare 
	this.createItemInAFreeSquare = function ()
	{
		var picker = [];
		for (var i = 0; i < self._availableSquares.length; i++)
		{
			if (!self._availableSquares[i].isSquareOccupied) { picker.push(i); }
		}
		var pick = Math.floor(Math.random() * picker.length);

		var squarePicked = self._availableSquares[picker[pick]];

		var valuePicked = self._valuePick[Math.floor(Math.random() * self._valuePick.length)];

		self.addItems([{ x: squarePicked.x, y: squarePicked.y, v: valuePicked }]);
	};
	//#endregion

	//#region addItems 
	this.addItems = function (inputArray)
	{
		for (var i = 0; i < inputArray.length; i++)
		{
			self._items.push({ x: inputArray[i].x, y: inputArray[i].y, v: inputArray[i].v, fusion: false, destroy: false, justFusionned: false });
			self.setSquareState(inputArray[i].x, inputArray[i].y, false);
		}
	};
	//#endregion


	//#region globalMove 
	this.globalMove = function (direction, callBackFn)
	{
		if (self._lock)
			return;
		var someMoveOccured = true;

		var moves = 0;
		while (someMoveOccured)
		{
			someMoveOccured = false;
			var itemsLength = self._items.length, item;
			for (var i = 0; i < itemsLength; i++)
			{
				item = self._items[i];
				item.id = i;
				if (!item.destroy && self.canMove(item, direction, true))
				{
					self.oneMove(item, direction);
					someMoveOccured = true;
				}
			}
			var newItems = [];
			for (var j = 0; j < self._items.length; j++)
			{
				item = self._items[j];
				if (!item.destroy)
				{
					newItems.push(item);
				}
			}
			self._items = newItems;

			moves++;
			if (this._stepbystepMode)
				someMoveOccured = false;
		}
		for (var k = 0; k < self._items.length; k++)
		{
			self._items[k].justFusionned = false;
		}
		if (moves > 1 && self._addMode)
		{
			// add a value somewhere
			//var availableSquare = self.pickAFreeSquare();
			self._lock = true;
			
			self.timeout(function ()
			{
				self.createItemInAFreeSquare();
				//self.addItems([{ x: availableSquare.x, y: availableSquare.y, v: 2 }]);
				if (self._items.length == 16 && self.testGameOver())
				{
					self._gameOver = true; // gameOver = false
				}
				if ('undefined' == typeof callBackFn) { callBackFn = function () { };}
				callBackFn.call(null, self._gameOver);
				self._lock = false;
				

			}, 200);
		}
		return  false; // gameOver = false
	};
	//#endregion

	//#region oneMove 
	this.oneMove = function (item, direction)
	{
		self.setSquareState(item.x, item.y, true);
		switch (direction)
		{
			case "left": item.x = item.x - 1; break;
			case "right": item.x = item.x + 1; break;
			case "up": item.y = item.y - 1; break;
			case "down": item.y = item.y + 1; break;
		}
		self.setSquareState(item.x, item.y, false);
		if (item.fusion)
		{
			item.v = 2 * item.v;
			self._score = self._score + item.v;
			item.fusion = false;
			item.justFusionned = true;
		}
	};
	//#endregion

	//#region canMove 
	this.canMove = function (item, direction, canChangeState)
	{
		var specialPosition = false;
		// test if item is on the edge (it's false result directly)
		switch (direction)
		{
			case "left": if(item.x === 3) specialPosition = true; if (item.x === 0) return false;break;
			case "right": if (item.x === 0) specialPosition = true; if (item.x == 3) return false; break;
			case "up": if (item.y === 3) specialPosition = true; if (item.y === 0) return false; break;
			case "down": if (item.y === 0) specialPosition = true; if (item.y == 3) return false; break;
		}

		// then test is some other element is there
		var adjacentItems = self.getAdjacentItems(item, direction);

		var selfCanBeFusionned = !item.justFusionned;

		var inFront = adjacentItems[0];
		var inFrontExists = typeof inFront != 'undefined';
		var inFrontHasSameValue = inFrontExists && inFront.v == item.v;
		var canInFrontBeFusionned = inFrontExists && !inFront.justFusionned;
		
		var inJumpFront = adjacentItems[1];
		var inJumpFrontExists = typeof inJumpFront != 'undefined';
		var inJumpFrontHasSameValue = inJumpFrontExists && inJumpFront.v == item.v;

		// case 1 ; no adjacent element front
		if (!inFrontExists) 
			return true;
		if (inFrontExists && !inFrontHasSameValue)
			return false;
		if (specialPosition && selfCanBeFusionned && inFrontExists && inFrontHasSameValue && !inJumpFrontExists)
			return false; // quite unintuitive... when move can occur on front element, just wait before fusion
		if (selfCanBeFusionned && canInFrontBeFusionned && inFrontExists && inFrontHasSameValue && (!inJumpFrontExists || inJumpFrontExists && !inJumpFrontHasSameValue)) // case 2 : only one element front
		{
			item.fusion = canChangeState;// when the game is tested for gameOver, values should not change !
			inFront.destroy = canChangeState;
			return true;
		}
		if (inFrontExists && inJumpFrontExists && inFrontHasSameValue && inJumpFrontHasSameValue)// case 3 : two element front, you don't fusion, because they should fusion before
		{
			return false;
		}


	};
	//#endregion

	//#region getAdjacentItem 

	/// returns an array with 0, 1 or 2 items. 
	/// First item is the potential adjacent item in the given direction. 
	/// Second item is the potential adjacent item in the opposite direction.
	/// Third item is the potential 2nd adjacent item in the given direction (i.e : x0 y0 (2ndadjacent at right) -> x2 y0)
	this.getAdjacentItems = function (item, direction)
	{
		var adjacentItemInTheRightDirection;
		var adjacent2ndItemInTheRightDirection;
		var itemsLength = self._items.length;
		for (var i = 0; i < itemsLength; i++)
		{
			var testItem = self._items[i];
			if (testItem.x == item.x && testItem.y == item.y)
				continue;
			switch (direction)
			{
				case "left":
					if (testItem.x == item.x - 1 && testItem.y == item.y && !testItem.destroy) adjacentItemInTheRightDirection = testItem;
					if (testItem.x == item.x - 2 && testItem.y == item.y && !testItem.destroy) adjacent2ndItemInTheRightDirection = testItem;
					break;
				case "right":
					if (testItem.x == item.x + 1 && testItem.y == item.y && !testItem.destroy) adjacentItemInTheRightDirection = testItem;
					if (testItem.x == item.x + 2 && testItem.y == item.y && !testItem.destroy) adjacent2ndItemInTheRightDirection = testItem;
					break;
				case "up":
					if (testItem.y == item.y - 1 && testItem.x == item.x && !testItem.destroy) adjacentItemInTheRightDirection = testItem;
					if (testItem.y == item.y - 2 && testItem.x == item.x && !testItem.destroy) adjacent2ndItemInTheRightDirection = testItem;
					break;
				case "down":
					if (testItem.y == item.y + 1 && testItem.x == item.x && !testItem.destroy) adjacentItemInTheRightDirection = testItem;
					if (testItem.y == item.y + 2 && testItem.x == item.x && !testItem.destroy) adjacent2ndItemInTheRightDirection = testItem;
					break;
			}
		}
		return [adjacentItemInTheRightDirection, adjacent2ndItemInTheRightDirection];
	};
	//#endregion

	this.testGameOver = function()
	{
		var canMoveOr = false;
		for (var i = 0; i < self._items.length; i++)
		{
			canMoveOr = canMoveOr | self.canMove(self._items[i], "up", false);
			canMoveOr = canMoveOr | self.canMove(self._items[i], "down", false);
			canMoveOr = canMoveOr | self.canMove(self._items[i], "left", false);
			canMoveOr = canMoveOr | self.canMove(self._items[i], "right", false);
		}
		return !canMoveOr;
	};

	if (this._autoInit)
	{
		this.emptyGame();
		this.initFirstItems(
			[
	//{ x: 0, y: 0, v: 2 },
	//{ x: 1, y: 0, v: 4 },
	//{ x: 2, y: 0, v: 8 },
	//{ x: 3, y: 0, v: 16 },

	//{ x: 0, y: 1, v: 16 },
	//{ x: 1, y: 1, v: 8 },
	//{ x: 2, y: 1, v: 4 },
	//{ x: 3, y: 1, v: 2 },

	//{ x: 0, y: 2, v: 32 },
	//{ x: 1, y: 2, v: 8 },
	//{ x: 2, y: 2, v: 16 },

	//{ x: 0, y: 3, v: 16 },
	//{ x: 1, y: 3, v: 8 },
	//{ x: 2, y: 3, v: 4 },
	//{ x: 3, y: 3, v: 2 }
]
			);
		this.createItemInAFreeSquare();
		this.createItemInAFreeSquare();

	}
	else
	{
		this.emptyGame();
	}

}