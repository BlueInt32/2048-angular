app.directive('square', function()
{
	return {
		restrict: 'E',
		scope:
		{
			bounditem: "=",
		},
		replace:true,
		template: "<div class='value'></div>",
		transclude: true,
		link: function(scope, element, attrs)
		{
			console.log(element);
			element.addClass("x" + scope.bounditem.x);
			element.addClass("y" + scope.bounditem.y);
		}
	};
});