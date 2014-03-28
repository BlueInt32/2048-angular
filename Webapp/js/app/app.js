var app = angular.module('app', ['textFilters', 'ngAnimate']);

app.value('gameServiceConfig', {addMode : true, autoInit : true, showDebug : true});

app.service('gameService', ['$timeout', 'gameServiceConfig', gameService]);

app.controller('mainCtrl', ['$document', '$scope', 'gameService', 'gameServiceConfig', function mainCtrl($document, $scope, gameService, gameServiceConfig)
{
	$scope.MoveDoneCallback = function(isGameOver)
	{
		$scope.isGameOver = isGameOver;
		$scope.$digest();
	};

	$scope.keyboardHandler = function (event)
	{
		switch (event.which)
		{
			case 37: console.log(37); gameService.globalMove("left", $scope.MoveDoneCallback); break;
			case 38: console.log(38); gameService.globalMove("up", $scope.MoveDoneCallback); break;
			case 39: console.log(39); gameService.globalMove("right", $scope.MoveDoneCallback); break;
			case 40: console.log(40); gameService.globalMove("down", $scope.MoveDoneCallback); break;
			default: break; 
		}
		$scope.updateScope();
		$scope.$digest();
	};
	$scope.updateScope = function()
	{
		$scope.items = gameService._items;
		$scope.score = gameService._score;
		$scope.availableSquares = gameService._availableSquares;
		$scope.showDebug = gameServiceConfig.showDebug;
	};

	$scope.sendMove = function (direction)
	{
		gameService.globalMove(direction, function () { $scope.$digest(); });

		$scope.updateScope();
		$scope.$digest();
	};

	$scope.reInit = function()
	{
		gameService.emptyGame();	
		gameService.initFirstItems([]);
	}

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