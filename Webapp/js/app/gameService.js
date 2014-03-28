function gameService($timeout,  gameServiceConfig)
{
	var self = this;
	this._addMode = gameServiceConfig.addMode;
	this._autoInit = gameServiceConfig.autoInit;
	this._showDebug = gameServiceConfig.showDebug;
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
		self.emptyGame();
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
		var adjacentItem = self.getAdjacentItems(item, direction);

		//var canGoInRightDirection = adjacentItem[0].v === item.v && !adjacentItem[0].justFusionned && !item.justFusionned && !item.destroy;
		//var canBeDestroyed = adjacentItem[1].v === item.v && !adjacentItem[1].justFusionned && !item.justFusionned && !item.destroy;
		if (typeof adjacentItem[0] == 'undefined')
			return true; // ... we can move this way.
		//console.log(adjacentItem);
		if (adjacentItem[0].v != item.v || adjacentItem[0].justFusionned || item.justFusionned || item.destroy)
		{
			return false;
		} else
		{
			// last test before setting fusion : is there an item in the opposite direction ?
			if (typeof adjacentItem[1] != 'undefined' && adjacentItem[1].v === item.v && !adjacentItem[0].justFusionned)
			{
				return false;
			}
			else
			{
				item.fusion = canChangeState;// when the game is tested for gameOver, values should not change !
				adjacentItem[0].destroy = canChangeState;
			}
		}
		return true;
	};
	//#endregion

	//#region getAdjacentItem 

	/// returns an array with 0, 1 or 2 items. 
	/// First item is the potential adjacent item in the given direction. 
	/// Second item is the potential adjacent item in the opposite direction.
	this.getAdjacentItems = function (item, direction)
	{
		var adjacentItemInTheRightDirection;
		var adjacentItemInTheOppositeDirection;
		var itemsLength = self._items.length;
		for (var i = 0; i < itemsLength; i++)
		{
			var testItem = self._items[i];
			if (testItem.x == item.x && testItem.y == item.y)
				continue;
			switch (direction)
			{
				case "left":
					if (testItem.x == item.x - 1 && testItem.y == item.y) adjacentItemInTheRightDirection = testItem;
					if (testItem.x == item.x + 1 && testItem.y == item.y) adjacentItemInTheOppositeDirection = testItem;
					break;
				case "right":
					if (testItem.x == item.x + 1 && testItem.y == item.y) adjacentItemInTheRightDirection = testItem;
					if (testItem.x == item.x - 1 && testItem.y == item.y) adjacentItemInTheOppositeDirection = testItem;
					break;
				case "up":
					if (testItem.y == item.y - 1 && testItem.x == item.x) adjacentItemInTheRightDirection = testItem;
					if (testItem.y == item.y + 1 && testItem.x == item.x) adjacentItemInTheOppositeDirection = testItem;
					break;
				case "down":
					if (testItem.y == item.y + 1 && testItem.x == item.x) adjacentItemInTheRightDirection = testItem;
					if (testItem.y == item.y - 1 && testItem.x == item.x) adjacentItemInTheOppositeDirection = testItem;
					break;
			}
		}
		return [adjacentItemInTheRightDirection, adjacentItemInTheOppositeDirection];
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
		this.initFirstItems([]);
		this.createItemInAFreeSquare();
		this.createItemInAFreeSquare();

	}
	else
	{
		this.emptyGame();
	}

}