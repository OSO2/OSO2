'use strict';

function CBuffer(length) {//constructor
	if(length > 0){
  	this.size = this.start = 0;
  	this.length = length;
  	this.data = new Array(length);
  	this.end = 0;
  	
	}else{
	  throw new Error('Missing Argument: You must pass a valid buffer length');
	}
}


// pop first item at start pointer
CBuffer.prototype.pop = function () {
		var item;
		if (this.size === 0) return;
		item = this.data[this.end];
		// remove the reference to the object so it can be garbage collected
		delete this.data[this.end];
		this.end = (this.end - 1 + this.length) % this.length;
		this.size--;
		return item;
}; 
// push item to the end at end pointer
CBuffer.prototype.push =function () {
		// recalculate size
		if (this.size < this.length) {
			this.size += 1;
			// recalculate start
		  this.start = (this.length + this.end - this.size + 1) % this.length;
		}
		// return number current number of items in CBuffer
		return this.size;
};

/* utility methods */
// reset pointers to buffer with zero items
// note: this will not remove values in cbuffer, so if for security values
//       need to be overwritten, run `.fill(null).empty()`
CBuffer.prototype.empty = function () {
	var i = 0;
	this.size = this.start = 0;
	this.end = 0;
	return this;
};
	
CBuffer.prototype.isFull = function () {
		return this.length === this.size;
};
