define(function() {
    var expectToBeClose = (function() {
        var errorFactor = 0.000001;

        function expectToBeClose(input, assertion) {
            expect(input).to.be.within(assertion - errorFactor, assertion + errorFactor);
        }

        return expectToBeClose;
    }());

    return {
        expectToBeClose: expectToBeClose
    };
})