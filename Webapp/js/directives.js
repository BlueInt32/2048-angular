app.directive('square', function()
{
	return {
		restrict: 'E',
		scope:
		{
			bounditem: "=",
		},
		replace:true,
		template: "<div class='value x{{bounditem.x}} y{{bounditem.y}} v{{ bounditem.v }}' ng-transclude></div>",
		transclude: true	
	};
});