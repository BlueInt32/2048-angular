describe('2048 controllers', function ()
{
	beforeEach(module('app'));

	describe('Init', function ()
	{

		it('Should have squares [1,1] and [2, 3]', inject(function ($controller)
		{
			var scope = {}, ctrl = $controller('mainCtrl', { $scope: scope });
			
			expect(scope.val[0][0]).toBe(0);
			expect(scope.val[1][1]).toBe(2);
			expect(scope.val[2][3]).toBe(2);
		}));
	});


	describe('move Up', function ()
	{

		it('Should have squares [1,1] and [2, 3]', inject(function ($controller)
		{
			var scope = {}, ctrl = $controller('mainCtrl', { $scope: scope });
			
			scope.globalMove('up');
             
			expect(scope.val[1][0]).toBe(2);
			expect(scope.val[2][0]).toBe(2);
			expect(scope.val[0][0]).toBe(0);
		})); 
	});


});