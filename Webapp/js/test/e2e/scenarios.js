'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('2048 App', function() {

  describe('Play the game', function() {

    beforeEach(function() {
    	browser().navigateTo('/');
    });

    it('should filter the phone list as user types into the search box', function() {
      expect(repeater('.value').count()).toBe(2);

      pause();
      input('showvalue').check();
      pause();
      expect(repeater('.phones li').count()).toBe(1);

      input('query').enter('motorola');
      expect(repeater('.phones li').count()).toBe(2);
    });
  });
});
