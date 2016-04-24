/**
 * @param {string} source
 * @constructor
 */
function CodeListing(source) {
    /** @type {string} */
    this.source = source;

    /** @type {string[]} */
    this.sourcePerLines = CodeListing.splitByLineBreaks(source);

    /**
     * @private
     * @type {string}
     */
    this._language = null;

    /**
     * Use {@link getBuckets} to get the buckets
     * @private
     * @type {SourceBucket[]}
     */
    this._buckets = null;

    /**
     * Use {@link getCodeLength} to get accurate code length.
     * @type {number}
     * @private
     */
    this._codeLength = -1;
}

/**
 * Structure: "<code>[number] [additional commands] TAB [source]</code>"
 * @type {RegExp}
 */
CodeListing.SOURCE_LINE_SYNTAX = /^([0-9]+)([^\t]*)\t(.*)$/;

/**
 * @param {string} string
 * @returns {string[]}
 */
CodeListing.splitByLineBreaks = function (string) {
    return string.split(/\r?\n/);
};

/** @param {(string|string[])} source */
CodeListing.parseLanguage = function (source) {
    var lines = (typeof source === 'string') ? CodeListing.splitByLineBreaks(source) : source;
    var string = lines[0];
    var lang = (/^:([a-z]+)$/.exec(string))[1];
    if (lang) return lang;
    else throw new Error('Expected ":lang" format, got '+string+' instead');
};

/**
 * @private
 */
CodeListing.prototype._initBuckets = function() {
    /** @type {Object.<number, SourceBucket>} */
    var buckets = {};
    this.sourcePerLines.slice(1).forEach(function(string, lineNumber) {
        var parts = null;
        if (string.trim() === '') {
            return;
        } else if (string.match(/^[0-9]+$/)) {
            parts = [undefined, string, '', ''];
        } else {
            parts = CodeListing.SOURCE_LINE_SYNTAX.exec(string);
        }

        var bucketNumber = parseInt(parts[1]);

        var bucket = buckets[bucketNumber];
        if (bucket === undefined) {
            bucket = new SourceBucket(bucketNumber);
            buckets[bucketNumber] = bucket;
        }

        var source = parts[3];
        this._codeLength += source.length;
        bucket._add(lineNumber, parts[2], source);
    });

    this._buckets = [];
    for (var bucketNumber in buckets) {
        if (!buckets.hasOwnProperty(bucketNumber)) continue;
        this._buckets.push(buckets[bucketNumber]);
    }

};

/** @return string */
CodeListing.prototype.getLanguage = function () {
    if (this._language === null) this._language = CodeListing.parseLanguage(this.sourcePerLines);
    return this._language;
};

/** @return string */
CodeListing.prototype.getSource = function() {
    return this.source;
};

/** @return SourceBucket[] */
CodeListing.prototype.getBuckets = function() {
    if (this._buckets === null) {
        this._initBuckets();
    }
    return this._buckets;
};

/**
 * @param {number} n
 * @returns {SourceBucket}
 */
CodeListing.prototype.getBucket = function(n) {
    return this.getBuckets()[n];
};

/**
 * @returns {number}
 */
CodeListing.prototype.getCodeLength = function() {
    if (this._codeLength < 0) this._initBuckets();
    return this._codeLength;
};

/**
 * @param bucketNumber
 * @constructor
 */
function SourceBucket(bucketNumber) {
    /**
     * @private
     * @type {SourceBucketLine[]}
     */
    this._lines = [];

    /** @type {number} */
    this.bucketNumber = bucketNumber;
}

/**
 * @protected
 * @param {number} originalLineNumber
 * @param {string} commands
 * @param {string} source
 */
SourceBucket.prototype._add = function(originalLineNumber, commands, source) {
    this._lines.push(new SourceBucketLine(originalLineNumber, this.bucketNumber, commands, source));
};

/**
 * @returns {SourceBucketLine[]}
 */
SourceBucket.prototype.getLines = function() {
    if (!Object.isFrozen(this._lines)) this._lines = Object.freeze(this._lines);
    return this._lines;
};

/**
 * @param n
 * @returns {SourceBucketLine}
 */
SourceBucket.prototype.getLine = function(n) {
    return this.getLines()[n];
};

/**
 * @param {number} originalLineNumber
 * @param {number} bucketNumber
 * @param {string} commands
 * @param {string} source
 * @constructor
 */
function SourceBucketLine(originalLineNumber, bucketNumber, commands, source) {
    this.originalLineNumber = originalLineNumber;
    this.bucketNumber = bucketNumber;
    this.commands = commands;
    this.source = source;
}