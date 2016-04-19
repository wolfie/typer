var page = require('webpage').create();
var isOpen = false;
var frame = 0;
var PAD = '00000'; // over 27mins @ 60fps

var leftPad5 = function(num) {
    num = String(num);
    return (PAD+num).substring(num.length);
};

phantom.onError = function(msg, trace) {
    console.error(msg);
    phantom.exit(1);
};

page.viewportSize = {
    width: 1280,
    height: 720
};

page.open('test.html', function(status) {
    isOpen = true;
    if (status === 'fail') {
        console.error('Page open failed. exited.');
        phantom.exit(1);
    } else {
        console.log('Status: '+status);
    }
});

page.onCallback = function(data) {
    switch (data.msg) {
        case 'exit':
            console.log('Hot exit signal from client. All ok.');
            phantom.exit(0);
            break;
        case 'renderReady':
            if (isOpen) {
                var filename = 'frames/frame'+leftPad5(frame++)+'.png';
                console.log(filename, leftPad5((100*data.data).toFixed(1))+'%');
                page.render(filename, {format: 'png'});
            }
            else {
                console.error('Page was not open, but still got event. Sleep for a bit longer?');
                phantom.exit(1);
            }
            break;
        default:
            console.log('unknown data: '+JSON.stringify(data));
            phantom.exit(0);
    }
    return true;
};
