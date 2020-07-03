import { CheckTimeout } from "../../src/events/presenceUpdate";
import sinon from "sinon";

describe('PresenceUpdate', function () {
  describe('#CheckTimeout()', function () {
    it('should be timed out', function (done) {
      var spy = sinon.spy()
      CheckTimeout(spy, "1", 1);
    });
  });
});