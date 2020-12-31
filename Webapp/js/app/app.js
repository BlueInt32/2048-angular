var app = angular.module('app', ['textFilters', 'ngAnimate', 'ngCookies']);

app.value('gameServiceConfig', {addMode : true, autoInit : true, showDebug : false});

app.service('gameService', ['$timeout', 'gameServiceConfig', gameService]);

app.controller('mainCtrl', ['$document', '$scope', 'gameService', 'gameServiceConfig', '$cookies', function mainCtrl($document, $scope, gameService, gameServiceConfig, $cookies)
{
	$scope.bestScore = 0;
	if (typeof $cookies.ng2048BestScore != 'undefined')
	{
		$scope.bestScore = $cookies.ng2048BestScore;
	}
	$scope.MoveDoneCallback = function(isGameOver)
	{
		$scope.isGameOver = isGameOver;
		if ($scope.isGameOver )
		{
			if (typeof $cookies.ng2048BestScore != 'undefined')
			{
				if ($scope.score > $cookies.ng2048BestScore)
				{
					$cookies.ng2048BestScore = $scope.score;
				}
			} else
			{
				$cookies.ng2048BestScore = $scope.score;
			}
		}
	};

	$scope.keyboardHandler = function (event)
	{
		gameService._stepbystepMode = $scope.stepbystepMode;
		if (!$scope.isGameOver)
		{
			console.log(event.which)
			switch (event.which)
			{
				case 37: gameService.globalMove("left", $scope.MoveDoneCallback); break;
				case 38: gameService.globalMove("up", $scope.MoveDoneCallback); break;
				case 39: gameService.globalMove("right", $scope.MoveDoneCallback); break;
				case 40: gameService.globalMove("down", $scope.MoveDoneCallback); break;
				default: break; 
			}
			$scope.updateScope();
			$scope.$digest();
		}
	};
	$scope.updateScope = function()
	{
		$scope.items = gameService._items;
		$scope.score = gameService._score;
		$scope.availableSquares = gameService._availableSquares;
		$scope.showDebug = gameServiceConfig.showDebug;
		$scope.isGameOver = gameServiceConfig._gameOver;

		if ($scope.score >= $scope.bestScore)
			$scope.bestScore = $scope.score;
	};

	$scope.sendMove = function (direction)
	{
		gameService.globalMove(direction, $scope.MoveDoneCallback);
		$scope.updateScope();
	};

	$scope.reInit = function ()
	{
		gameService.emptyGame();
		gameService.initFirstItems([]);
		gameService.createItemInAFreeSquare();
		gameService.createItemInAFreeSquare();

		$scope.updateScope();
	};
	$scope.updateScope();

	$document.bind("keydown", $scope.keyboardHandler);

	

}]);

angular.module('textFilters', []).filter('zeroEmpty', function ()
{
	return function (text)
{
		if (text == "0") return "";
		return text;
	};
});