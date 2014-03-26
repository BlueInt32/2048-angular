'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('2048 App', function() {

  describe('Play the game', function() {

    beforeEach(function() {
    	browser().navigateTo('/');
    });

    it('should have two elements @ start', function() {
      expect(repeater('.value').count()).toBe(2);

      pause();



    });
  });
});
