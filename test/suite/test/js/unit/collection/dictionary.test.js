define([
    'layer/collection/Dictionary'
], function(
    Dictionary
) {
    'use strict';
    
    describe('Dictionary', function() {
        var dictionary;
        
        beforeEach(function(done) {
            dictionary = new Dictionary();
            done();
        });
        
        // Dictionary
        it('should begin empty', function() {
            expect(dictionary.length).to.be(0);
        });
        
        it('can insert an element', function() {
            dictionary.addKeyValue(2, 3);
            expect(dictionary.hasKey(2)).to.be(true);
            expect(dictionary.hasValue(3)).to.be(true);
            expect(dictionary.length).to.be(1);
        });
        
        it('can get a value by key', function() {
            var key = { x: 2 };
            var value = { y: 23 };
            dictionary.addKeyValue(key, value);
            expect(dictionary.getValueForKey(key)).to.be(value);
        });
        
        it('can get a key by value', function() {
            var key = { x: 2 };
            var value = { y: 23 };
            dictionary.addKeyValue(key, value);
            expect(dictionary.getKeyForValue(value)).to.be(key);
        });
        
        it('can create a key-value set from a set of keys and values of equivalent size', function() {
            var keys = [1, 2, 3, 'wee', function() {}, 'happy', {}, { x: 23 }];
            var values = ['1', 'appple', 'banana', {}, Dictionary, 'smiley', { value: "arbitrary" }, { y: 23 }];
            
            dictionary = new Dictionary(keys, values);
            
            expect(dictionary.length).to.be(keys.length);
            
            dictionary.forEach(function(key, value) {
                expect(keys.indexOf(key)).to.not.be(-1);
                expect(values.indexOf(value)).to.not.be(-1);
            });
        });
        
        it('cannot accept a key-value set that have unequivalent lengths', function() {
            var keys = [];
            var values = [23];
            var didPass = true;
            
            try {
                dictionary = new Dictionary(keys, values);
            } catch (exception) {
                didPass = false;
            }
            
            expect(didPass).to.be(false);
        });
        
        it('cannot accept a non-array as a key value pair at initialization', function() {
            var keys = 'a';
            var values = 234;
            var didPass = true;
            
            try {
                dictionary = new Dictionary(keys, values);
            } catch (exception) {
                didPass = false;
            }
            
            expect(didPass).to.be(false);
        });
        
        it('cannot accept a key from an existing key-value pair', function() {
            var didPass = true;
            try {
                dictionary.addKeyValue(2, 3);
                dictionary.addKeyValue(2, 4);
            } catch (exception) {
                didPass = false;
            }
            
            expect(didPass).to.be(false);
        });
        
        it('cannot accept a value from an existing key-value pair', function() {
            var didPass = true;
            try {
                dictionary.addKeyValue(2, 3);
                dictionary.addKeyValue(3, 3);
            } catch (exception) {
                didPass = false;
            }
            
            expect(didPass).to.be(false);
        });
        
        it('cannot get a key that hasn\'t been added', function() {
            var didPass = true;
            try {
                dictionary.getValueForKey(2);
            } catch (exception) {
                didPass = false;
            }
            
            expect(didPass).to.be(false);
        });
        
        it('cannot get a value that hasn\'t been added', function() {
            var didPass = true;
            try {
                dictionary.getKeyForValue(2);
            } catch (exception) {
                didPass = false;
            }
            
            expect(didPass).to.be(false);
        });
        
        it('cannot remove a key that hasn\'t been added', function() {
            var didPass = true;
            try {
                dictionary.removeKeyValueByKey(2);
            } catch (exception) {
                didPass = false;
            }
            
            expect(didPass).to.be(false);
        });
        
        it('cannot remove a value that hasn\'t been added', function() {
            var didPass = true;
            try {
                dictionary.removeKeyValueByValue(2);
            } catch (exception) {
                didPass = false;
            }
            
            expect(didPass).to.be(false);
        });
        
        it('can clone itself with an equivalent number of elements, and the same set of elements', function() {
            var keys = [1, 2, 3, 'wee', function() {}, 'happy', {}, { x: 23 }];
            var values = ['1', 'appple', 'banana', {}, Dictionary, 'smiley', { value: "arbitrary" }, { y: 23 }];
            
            var i = 0;
            var length = keys.length;
            for (; i < length; i++) {
                dictionary.addKeyValue(keys[i], values[i]);
            }
            
            var otherDictionary = dictionary.clone();
            
            otherDictionary.forEach(function(key, value) {
                expect(dictionary.hasKey(key)).to.be(true);
                expect(dictionary.hasValue(value)).to.be(true);
            });
            
            dictionary.forEach(function(key, value) {
                expect(otherDictionary.hasKey(key)).to.be(true);
                expect(otherDictionary.hasValue(value)).to.be(true);
            });
            
            expect(dictionary.length).to.be(otherDictionary.length);
        });
    });
});