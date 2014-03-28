function gameService($timeout,  gameServiceConfig)
{
	var self = this;
	this._addMode = gameServiceConfig.addMode;
	this._autoInit = gameServiceConfig.autoInit;
	this._showDebug = gameServiceConfig.showDebug;

	this._items = [];
	this._score = 0;
	this._availableSquares = [];

	this._lock = false;

	this.timeout = $timeout;

	this._gameOver = false;


	//#region init
	this.init = function (initValues)
	{
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
	this.pickAFreeSquare = function ()
	{
		var picker = [];
		for (var i = 0; i < self._availableSquares.length; i++)
		{
			if (!self._availableSquares[i].isSquareOccupied) { picker.push(i); }
		}
		var pick = Math.floor(Math.random() * picker.length);
		return self._availableSquares[picker[pick]];
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

	//#region keyboardHandler 

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
				if (self.canMove(item, direction, true))
				{
					self.oneMove(item, direction);
					someMoveOccured = true;
				}
			}

			for (var j = 0; j < self._items.length; j++)
			{
				item = self._items[j];

				if (item.destroy && someMoveOccured)
				{
					self._items.splice(j, 1);
				}
			}

			moves++;
		}
		for (var k = 0; k < self._items.length; k++)
		{
			self._items[k].justFusionned = false;
		}
		if (moves > 1 && self._addMode)
		{
			// add a value somewhere
			var availableSquare = self.pickAFreeSquare();
			self._lock = true;
			
			self.timeout(function ()
			{
				self.addItems([{ x: availableSquare.x, y: availableSquare.y, v: 2 }]);
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

		return item;
	};
	//#endregion

	//#region canMove 
	this.canMove = function (item, direction, canChangeState)
	{
		// test if item is on the edge

		switch (direction)
		{
			case "left": if (item.x === 0) return false;break;
			case "right": if (item.x == 3) return false; break;
			case "up": if (item.y === 0) return false; break;
			case "down": if (item.y == 3) return false; break;
		}

		// then test is some other element is there
		var adjacentItem = self.getAdjacentItem(item, direction);
		if (typeof adjacentItem == 'undefined')
			return true; // ... we can move this way.
		//console.log(adjacentItem);
		if (adjacentItem.v != item.v || adjacentItem.justFusionned || item.justFusionned || item.destroy)
		{
			return false;
		} else
		{
			item.fusion = canChangeState;// when the game is tested for gameOver, values should not change !
			adjacentItem.destroy = canChangeState;
		}
		return true;
	};
	//#endregion

	//#region getAdjacentItem 
	this.getAdjacentItem = function (item, direction)
	{
		var itemsLength = self._items.length;
		for (var i = 0; i < itemsLength; i++)
		{
			var testItem = self._items[i];
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
			}
		}
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
		this.init(
			//[{ x: 3, y: 0, v: 2 }, { x: 3, y: 1, v: 2 }]
			//[{ x: 3, y: 3, v: 2 }, { x: 3, y: 2, v: 2 }, { x: 1, y: 1, v: 2 }, { x: 2, y: 1, v: 2 }]
			[
				{ x: 0, y: 0, v: 8 },
				{ x: 1, y: 0, v: 32 },
				{ x: 2, y: 0, v: 4 },
				{ x: 3, y: 0, v: 2 },

				{ x: 0, y: 1, v: 2 },
				{ x: 1, y: 1, v: 4 },
				{ x: 2, y: 1, v: 8 },
				{ x: 3, y: 1, v: 2 },

				{ x: 1, y: 2, v: 4 },
				{ x: 2, y: 2, v: 16 },
				{ x: 3, y: 2, v: 4 },

				{ x: 0, y: 3, v: 2 },
				{ x: 1, y: 3, v: 4 },
				{ x: 2, y: 3, v: 8 },
				{ x: 3, y: 3, v: 2 }
			]
			);
	}

}