define(function() {
    "use strict";
    
    var Array_slice = Array.prototype.slice;
    var NOT_FOUND_INDEX = -1;
    var id = 0;
    
    var Set = function() {
        this.elements = null;
        this.length = 0;
        var elements;
        this.id = id++;
        
        if (arguments.length > 0) {
            elements = Array_slice.call(arguments, 0);
        }
        
        this.init.apply(this, elements);
    };
    
    Set.prototype.init = function(elements) {
        this.elements = [];
        
        if (!elements) {
            return;
        }
        
        this.insertElements(elements);
    };
    
    Set.prototype.hasElement = function(element) {
        return this.elements.indexOf(element) !== NOT_FOUND_INDEX;
    };
    
    Set.prototype.insertElement = function(element) {
        if (this.hasElement(element)) {
            return;
        }
        
        this.elements.push(element);
    };
    
    Set.prototype.insertElements = function() {
        if (arguments.length < 1) {
            return;
        }
        
        var elements = Array_slice.call(arguments, 0);
        
        var i = 0;
        var length = elements.length;
        
        if (length === 1) {
            this.insertElement(elements[0]);
        } else {
            for (; i < length; i++) {
                this.insertElement(elements[i]);
            }
        }
    };
    
    Set.prototype.clone = function() {
        return new Set.apply(null, this.elements);
    };
    
    Set.prototype.intersects = function(set) {
        if (!(set instanceof Set)) {
            return 
        }
    }
    
    return Set;
});