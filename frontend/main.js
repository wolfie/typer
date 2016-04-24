/*
 * Copyright 2016 Henrik Paul
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

window.start = function() {
    var linemarker = document.getElementById('linemarker');
    var caret = document.getElementById('caret');
    var codeElement = document.getElementById('code');
    var preElement = document.querySelector('pre');

    // init styles

    codeElement.textContent = '123456789012345678901234567890';
    var lineHeight = codeElement.offsetHeight;
    linemarker.style.height = lineHeight+"px";
    linemarker.style.top = 0;

    var caretWidth = codeElement.offsetWidth / codeElement.textContent.length;
    caret.style.width = caretWidth+'px';
    caret.style.left = 0;

    codeElement.textContent = '';


    // start rendering

    var ERROR = {event:'error'};
    var EXIT = {event:'exit'};
    var PROVIDE_CODE = {event:'provideCode'};
    var WAIT_FOR_PHANTOMJS_READY = {event:'waitForPhantomJsReady'};
    var renderRequest = 0;

    var phantomIsPresent = function() { return typeof window.callPhantom === 'function'; };
    var send = phantomIsPresent() ? window.callPhantom : function(data){console.log(JSON.stringify(data))};

    var moveCaretTo = function(line, column) {
        linemarker.style.top = (lineHeight * line) + 'px';
        caret.style.left = (caretWidth * column) + 'px';
    };


    var render = function(code) {
        var listing = new CodeListing(code);
        codeElement.className = '_language-'+listing.getLanguage();
        codeElement.textContent = '';
        window.cancelAnimationFrame(renderRequest);

        var line = 0;
        var column = 0;
        var rawBuiltSource = '';
        var bucketOrdinal = 0;
        var bucketLineOrdinal = 0;

        var renderFrame = function() {
            moveCaretTo(line, column);
            codeElement.textContent = rawBuiltSource;
            preElement.className = 'prettyprint';
            PR.prettyPrint();

            var progress = rawBuiltSource.length / listing.getSource().length;
            send({event:'renderReady',msg:progress});
        };

        var renderLoop = function() {
            var bucket = listing.getBucket(bucketOrdinal);
            if (bucket) {
                var bucketLine = bucket.getLine(bucketLineOrdinal);
                if (bucketLine) {
                    var char = bucketLine.source.charAt(column);
                    if (char !== '') {
                        rawBuiltSource += char;
                        column++;
                    } else {
                        rawBuiltSource += '\n';
                        bucketLineOrdinal++;
                        line++;
                        column = 0;
                    }

                    renderFrame();
                } else {
                    bucketOrdinal++;
                    bucketLineOrdinal = 0;
                }
                window.requestAnimationFrame(renderLoop);
            } else {
                send(EXIT);
            }
        };
        renderLoop();
    };

    if (phantomIsPresent()) {

        // busy loop until phantomjs realizes that it already has connected to the page
        while (send(WAIT_FOR_PHANTOMJS_READY)) {}

        var listing = send(PROVIDE_CODE);
        if (!listing) send(ERROR);
        else render(listing);
    }

    else {
        var textarea = document.createElement('textarea');
        textarea.style.width = '600px';
        textarea.style.height = '300px';

        var button = document.createElement('button');
        button.textContent = 'Type';
        button.addEventListener('click', function() {
            render(textarea.value);
        });

        document.body.insertBefore(button, document.body.firstChild);
        document.body.insertBefore(textarea, document.body.firstChild);
    }
};