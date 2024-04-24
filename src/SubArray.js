class SubArray {
    constructor(arr, start, end) {
        if(start < 0 || start > arr.length) throw "Start index must be between 0 and array size";
        if(end < start || end > arr.length) throw "End index must be between start and array size";

        this.arr = arr;
        this.start = start;
        this.end = end;
        this.length = this.end - this.start;
    }

    at(index) {
        const trueIndex= index + this.start;
        if(index < 0 || index > this.length || trueIndex >= this.arr.length) throw "Invalid index";
        return this.arr.at(trueIndex);
    }

    print() {
        console.log("[")
        for(let i = 0; i < this.length; i++) {
            console.log("   ", this.at(i));
        }
        console.log("]")
    }

    map(f) {
        const result = [];
        for(let i = 0; i < this.length; i++) {
            const element = this.at(i);
            result.push(f(element, i, result));
        }
        return result;
    }
}

module.exports = { SubArray }