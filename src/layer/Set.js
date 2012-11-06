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
            this.init.apply(this, arguments);
        } else {
            this.init();
        }
    };
    
    Set.prototype.init = function() {
        this.elements = [];
        
        if (arguments.length === 0) {
            return this;
        }
        
        return this.insertElements.apply(this, arguments);
    };
    
    Set.prototype.hasElement = function(element) {
        return this.elements.indexOf(element) !== NOT_FOUND_INDEX;
    };
    
    Set.prototype.insertElement = function(element) {
        if (this.hasElement(element)) {
            return this;
        }
        
        this.elements.push(element);
        this.length = this.elements.length;
        
        return this;
    };
    
    Set.prototype.insertElements = function() {
        if (arguments.length === 0) {
            return;
        }
        
        var elements = Array_slice.call(arguments, 0);
        
        var i = 0;
        var length = elements.length;
        
        for (; i < length; i++) {
            this.insertElement(elements[i]);
        }
        
        return this;
    };
    
    Set.prototype.removeElement = function(element) {
        var elements = this.elements;
        var index = elements.indexOf(element);
        if (index === NOT_FOUND_INDEX) {
            return this;
        }
        
        elements.splice(index, 1);
        this.length = elements.length;
        
        return this;
    };
    
    Set.prototype.forEach = function(operation) {
        var i = 0;
        var elements = this.elements.slice(0);
        var length = elements.length;
        var boundOperation = operation.bind(this);
        var shouldComplete = false;
        
        for (; i < length; i++) {
            boundOperation(elements[i]);
        }
        
        return this;
    }
    
    Set.prototype.clone = function() {
        var set = new Set();
        this.forEach(function(element) {
            set.insertElement(element);
        });
        
        return set;
    };
    
    Set.prototype.intersection = function(set) {
        if (!(set instanceof Set)) {
            return this;
        }
        
        this.forEach(function(element) {
            if (!set.hasElement(element)) {
                this.removeElement(element);
            }
        });
        
        return this;
    };
    
    Set.prototype.getIntersection = function(set) {
        return this.clone().intersection(set);
    };
    
    Set.prototype.union = function(set) {
        if (!(set instanceof Set)) {
            return this;
        }
        
        this.forEach(function(element) {
            this.insertElement(element);
        });
        
        return this;
    };
    
    Set.prototype.getUnion = function(set) {
        return this.clone().union(set);
    };
    
    Set.prototype.complement = function(set) {
        if (!(set instanceof Set)) {
            return this;
        }
        
        this.forEach(function(element) {
            if (set.hasElement(element)) {
                this.removeElement(element);
            }
        });
        
        return this;
    };
    
    Set.prototype.getComplement = function(set) {
        return this.clone().complement(set);
    };
    
    Set.prototype.isSuperset = function(set) {
        if (!(set instanceof Set)) {
            return false;
        }
        
        var hasAll = true;
        var self = this;
        
        set.forEach(function(element) {
            if (!self.hasElement(element)) {
                hasAll = false;
            }
        });
        
        return this.length >= set.length && hasAll;
    };
    
    Set.prototype.isSubset = function(set) {
        if (!(set instanceof Set)) {
            return false;
        }
        
        var hasAll = true;
        
        this.forEach(function(element) {
            if (!set.hasElement(element)) {
                hasAll = false;
            }
        });
        
        return set.length <= this.length && !hasAll;
    };
    
    return Set;
});