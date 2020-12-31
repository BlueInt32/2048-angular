app.directive("square", function () {
  return {
    restrict: "E",
    scope: {
      bounditem: "=",
      showvalue: "@",
    },
    replace: true,
    template:
      "<div class='value x{{bounditem.x}} y{{bounditem.y}} v{{ bounditem.v }}'><div class='val' ng-if='showvalue'>{{bounditem.v}}</div></div>",
  };
});
