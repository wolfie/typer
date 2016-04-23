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

    var render = function(code) {
        codeElement.textContent = '';
        window.cancelAnimationFrame(renderRequest);

        var line = 0;
        var column = 0;
        var sourceIndex = 0;
        linemarker.style.top = 0;
        caret.style.left = 0;
        var codeBuffer = '';

        var renderNextLetter = function() {
            var c = code.charAt(sourceIndex++);
            column++;

            if (c === '') {
                send(EXIT);
                return;
            } else if (c === '\n') {
                line++;
                column = 0;
                linemarker.style.top = (line*lineHeight)+'px';
            }

            caret.style.left = (caretWidth*column)+'px';

            codeBuffer += c;
            codeElement.textContent = codeBuffer;
            preElement.className = 'prettyprint';
            PR.prettyPrint();

            send({event:'renderReady',msg:sourceIndex/code.length});
            renderRequest = window.requestAnimationFrame(renderNextLetter);
        };
        renderNextLetter();
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