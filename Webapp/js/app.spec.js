describe('2048 controllers', function ()
{
	beforeEach(module('app'));

	describe('Init', function ()
	{

		it('should init correctly with 2 items', inject(function ($controller)
		{
			var scope = {}, ctrl = $controller('mainCtrl', { $scope: scope });
			expect(scope.items.length).toBe(3);
		}));
	});

	//describe('move Up', function ()
	//{
	//	it('should still have 2 items, or one with 4', inject(function ($controller)
	//	{
	//		var scope = {}, ctrl = $controller('mainCtrl', { $scope: scope });
			
	//		// tell controller not to add a value after each move. We do this ourselves to control the tests
	//		scope.addMode = false;
	//		scope.autoSetFirstValues = false;

	//		expect(scope.items.length).toBe(2);
	//		scope.setFirst2Values(1, 1, 2, 2, 3, 2);
	//		expect(scope.items.length).toBe(2);
	//	})); 
	//});
});