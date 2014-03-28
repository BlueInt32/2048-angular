describe('2048 Game Service', function ()
{
	var gameService;
	beforeEach(function()
	{
		module('app', function ($provide)
		{
			$provide.value('gameServiceConfig', { addMode: false, autoInit: false, showDebug: false });
		});
		inject(function(_gameService_)
		{
			gameService = _gameService_;
		});

	});


	it('should have an init function', function ()
	{
		expect(angular.isFunction(gameService.init)).toBe(true);
	});

	it('should have a globalMove function', function ()
	{
		expect(angular.isFunction(gameService.globalMove)).toBe(true);
	});

	it('should be empty at raw init', function ()
	{
		//var gameService = _gameService_;
		expect(gameService._items.length).toBe(0);
		expect(gameService._score).toBe(0);
	});

	it('should init normally', function ()
	{
		//var gameService = _gameService_;
		gameService.init([{ x: 3, y: 0, v: 2 }, { x: 3, y: 1, v: 2 }]);
		expect(gameService._items.length).toBe(2); // deux items ajoutés, le tableau doit refletter cela.
		expect(gameService._score).toBe(0); // aucun mouvement n'a été effectué, le score doit être nul.
		expect(gameService._availableSquares.length).toBe(16); // le tableau des cases donnant leur disponibilité doit toujours faire 16

	});
	
	it('should give correct adjacent items', function ()
	{

		gameService.init([{ x: 3, y: 3, v: 3 }, { x: 3, y: 2, v: 3 },{ x: 1, y: 1, v: 3 }, { x: 2, y: 1, v: 3 }] );

		var item = gameService.getAdjacentItem(gameService._items[0], "up");
		expect(item).toBe(gameService._items[1]);

		item = gameService.getAdjacentItem(gameService._items[1], "down");
		expect(item).toBe(gameService._items[0]);

		item = gameService.getAdjacentItem(gameService._items[2], "right");
		expect(item).toBe(gameService._items[3]);

		item = gameService.getAdjacentItem(gameService._items[3], "left");
		expect(item).toBe(gameService._items[2]);

		// but also when getAdjacentItem should return undefined : 
		item = gameService.getAdjacentItem(gameService._items[0], "down");
		expect(item).not.toBeDefined();
		item = gameService.getAdjacentItem(gameService._items[0], "right");
		expect(item).not.toBeDefined();

	});
	describe('CanMove function', function ()
{
		it('should give canMove results with fusion up', function ()
		{
			gameService.init([{ x: 3, y: 3, v: 3 }, { x: 3, y: 2, v: 3 }]);

			// when fusion
			var item0CanMoveUp = gameService.canMove(gameService._items[0], "up", true);
			expect(item0CanMoveUp).toBe(true);
			expect(gameService._items[0].fusion).toBe(true);
			expect(gameService._items[0].destroy).toBe(false);
			expect(gameService._items[1].fusion).toBe(false);
			expect(gameService._items[1].destroy).toBe(true);

		});

		it('should give canMove results when items cannot move', function ()
		{
			gameService.init([{ x: 3, y: 3, v: 3 }, { x: 3, y: 2, v: 3 }, { x: 3, y: 0, v: 3 }, { x: 1, y: 1, v: 3 }, { x: 2, y: 1, v: 3 }]);

			// when cannot move
			var item2CanMoveRight = gameService.canMove(gameService._items[1], "right", true);
			expect(item2CanMoveRight).toBe(false);
			expect(gameService._items[2].fusion).toBe(false);
			expect(gameService._items[2].destroy).toBe(false);
			var item0CanMoveDown = gameService.canMove(gameService._items[0], "down", true);
			expect(item0CanMoveDown).toBe(false);

		});
	});

	it('should have right available squares data', function ()
	{

		gameService.init([{ x: 3, y: 3, v: 3 }, { x: 3, y: 1, v: 3 }]);
		expect(gameService._availableSquares.length).toBe(16); // le tableau des cases donnant leur disponibilité doit toujours faire 16
		var p1 = gameService._items[0].x + 4 * gameService._items[0].y;
		var p2 = gameService._items[1].x + 4 * gameService._items[1].y;
		expect(gameService._availableSquares[p1].isSquareOccupied).toBe(true);
		expect(gameService._availableSquares[p2].isSquareOccupied).toBe(true);
	});
	it('should fusion items well', function ()
	{
		gameService.init([{ x: 3, y: 3, v: 3 }, { x: 3, y: 1, v: 3 }]);
		gameService.globalMove("down", null);
		expect(gameService._items.length).toBe(1); // deux items fusionnés, le tableau doit renvoyer 1 seul element.
		expect(gameService._score).toBe(6); // une fusion de 2 elements de valeur 3, ça donne 6
		//expect(gameService._availableSquares.length).toBe(16); // le tableau des cases donnant leur disponibilité doit toujours faire 16
		var p1 = gameService._items[0].x + 4 * gameService._items[0].y;

		expect(gameService._availableSquares[p1].isSquareOccupied).toBe(true);
		expect(gameService._items[0].x).toBe(3);
		expect(gameService._items[0].y).toBe(3);
	});

	it('should move items correctly', function ()
	{
		gameService.init([{ x: 2, y: 1, v: 3 }]);
		gameService.globalMove("up", null);
		expect([gameService._items[0].x, gameService._items[0].y]).toEqual([2, 0]);

		gameService.globalMove("left", null);
		expect([gameService._items[0].x, gameService._items[0].y]).toEqual([0, 0]);

		gameService.globalMove("down", null);
		expect([gameService._items[0].x, gameService._items[0].y]).toEqual([0, 3]);

		gameService.globalMove("right", null);
		expect([gameService._items[0].x, gameService._items[0].y]).toEqual([3, 3]);
		//expect().toBe(3);
	});


	it('should show game over correctly', function ()
	{
		var initFullArray = [];

		gameService.init([]);
		for (var i = 0; i < 4; i++)
		{
			for (var j = 0; j < 4; j++)
			{
				initFullArray.push({ x: i, y: j, v: i + j + 1 });
			}
		}
		gameService.addItems(initFullArray);
		expect(gameService.testGameOver()).toBe(true);
	});

});