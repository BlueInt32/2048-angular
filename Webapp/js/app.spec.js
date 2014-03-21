describe('2048 controllers', function ()
{
	beforeEach(module('app'));

	describe('Init', function ()
	{

		it('should init correctly', inject(function ($controller)
		{
			var scope = {}, ctrl = $controller('mainCtrl', { $scope: scope });
			
			scope.autoSetFirstValues = false;
			scope.setFirst2Values(1, 1, 2, 2, 3, 2);

			expect(scope.items.toBeDefined);
			 
			expect(scope.val[1][1]).toBe(2);
			expect(scope.val[2][3]).toBe(2);
			expect(scope.val[0][0]).toBe(0);
			expect(scope.val[3][0]).toBe(0);
			expect(scope.val[0][3]).toBe(0);
			expect(scope.val[3][3]).toBe(0);


			expect(scope.items.length).toBe(0);
		}));
	});


	describe('move Up', function ()
	{
		it('should have a move correct behaviour', inject(function ($controller)
		{
			var scope = {}, ctrl = $controller('mainCtrl', { $scope: scope });
			
			// tell controller not to add a value after each move. We do this ourselves to control the tests
			scope.addMode = false;
			scope.autoSetFirstValues = false;

			scope.setFirst2Values(1, 1, 2, 2, 3, 2);
			scope.globalMove('up');
			expect(scope.val[1][0]).toBe(2);
			expect(scope.val[2][0]).toBe(2);
			expect(scope.items.length).toBe(2);

			scope.addValue(2, 1, 2);
			scope.globalMove('up');
			expect(scope.val[1][0]).toBe(2);
			expect(scope.val[2][0]).toBe(4);
			expect(scope.items.length).toBe(2);

			scope.globalMove('left');

			expect(scope.val[1][0]).toBe(0);
			expect(scope.val[2][0]).toBe(0);
			expect(scope.val[0][0]).toBe(2);
			expect(scope.val[1][0]).toBe(4);
			expect(scope.items.length).toBe(1);
		})); 
	});


});