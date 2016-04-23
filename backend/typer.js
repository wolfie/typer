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

var page = require('webpage').create();
var fs = require('fs');
var isOpen = false;
var frame = 0;
var PAD = '00000'; // over 27mins @ 60fps

var leftPad5 = function(num) {
    num = String(num);
    return (PAD+num).substring(num.length);
};

page.viewportSize = {
    width: 1280,
    height: 720
};

page.open('frontend/index.html', function(status) {
    isOpen = true;
    if (status === 'fail') {
        console.error('Page open failed. exited.');
        phantom.exit(1);
    } else {
        console.log('Status: '+status);
    }
});

page.onCallback = function(data) {
    switch (data.event) {
        case 'waitForPhantomJsReady':
            return !isOpen;
        case 'exit':
            console.log('Got exit signal from client. All ok.');
            phantom.exit(0);
            break;
        case 'renderReady':
            if (isOpen) {
                var filename = 'frames/frame'+leftPad5(frame++)+'.png';
                console.log(filename, leftPad5((100*data.msg).toFixed(1))+'%');
                page.render(filename, {format: 'png'});
            }
            else {
                console.error('wait for waitForPhantomJsReady before rendering');
                phantom.exit(1);
            }
            break;
        case 'provideCode':
            return fs.read('CODE.txt');
        default:
            console.log('unknown event: '+JSON.stringify(data));
            phantom.exit(0);
    }
    return true;
};
