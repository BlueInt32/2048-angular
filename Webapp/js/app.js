var app = angular.module('app', ['textFilters', 'ngAnimate']);

app.value('gameServiceConfig', {addMode : true, autoInit : true, showDebug : false});

app.service('gameService', ['$timeout', 'gameServiceConfig', gameService]);

app.controller('mainCtrl', ['$document', '$scope', 'gameService', 'gameServiceConfig', function mainCtrl($document, $scope, gameService, gameServiceConfig)
{
	
	$scope.keyboardHandler = function (event)
	{

		switch (event.which)
		{
			case 37: gameService.globalMove("left", function () { $scope.$digest(); }); break;
			case 38: gameService.globalMove("up", function () { $scope.$digest(); }); break;
			case 39: gameService.globalMove("right", function () { $scope.$digest(); }); break;
			case 40: gameService.globalMove("down", function () { $scope.$digest(); }); break;
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