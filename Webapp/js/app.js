var app = angular.module('app', ['textFilters', 'ngAnimate']);

app.value('gameServiceConfig', {addMode : true, autoInit : true, showDebug : true});

app.service('gameService', ['$timeout', 'gameServiceConfig', gameService]);

app.controller('mainCtrl', ['$document', '$scope', 'gameService', function mainCtrl($document, $scope, gameService)
{

	$scope.keyboardHandler = function (event)
	{
		console
		switch (event.which)
		{
			case 37: gameService.globalMove("left", function () { $scope.$digest(); }); break;
			case 38: gameService.globalMove("up", function () { $scope.$digest(); }); break;
			case 39: gameService.globalMove("right", function () { $scope.$digest(); }); break;
			case 40: gameService.globalMove("down", function () { $scope.$digest(); }); break;
			default: break;
		}

		$scope.$digest();
	};
	$document.bind("keydown", $scope.keyboardHandler);
	$scope.items = gameService._items;
}]);

angular.module('textFilters', []).filter('zeroEmpty', function ()
{
	return function (text)
{
		if (text == "0") return "";
		return text;
	};
});