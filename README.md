# Typer

**Typer creates videos out of code** with the following assumptions:
 
1. It is easier for a viewer to follow code as it is being typed out, 
   rather than having all of the code at once on-screen. 
1. The code is typed in a brisk pace, to keep the A) viewer engaged, B) 
   video as short and low-threshold as possible.
1. It is preferable to, in post processing, make a perfect source video 
   less perfect (by adding pauses, cuts, etc) than it is to make an 
   imperfect source video more perfect.

This is inspired by [Bisqwit's programming videos](https://www.youtube.com/user/Bisqwit/videos)

## Caveats

* Scripts are curretly only for Windows, but I don't see a reason to why 
  this wouldn't work on a POSIX system as well. 
* Things are also kinda hard coded for JavaScript for now, but that will 
  change.
* There's a huge uncanny valley in the produced video.

## Installing

1. Run `npm install` to install [PhantomJS](http://phantomjs.org/) 
   (installing requires [Node.js](https://nodejs.org/))
1. Make sure you have [ffmpeg](https://ffmpeg.org/download.html).exe in 
   your path
1. Put your JavaScript into the `CODE.txt` file
1. run `type.bat` to clean up previously generated frames and videofile, 
   and generate new frames (will be placed under `frames/` as png files)
1. run `render.bat` to create a 1280x720 60fps, YouTube optimized, 
   video.mp4 from the frames

You can also just open the local `test.html` file in your browser and 
play around with the input there. It tries to render at 60fps, but that 
all depends on the computer and code length.

## Demo

[![Typer test 3](http://img.youtube.com/vi/nbAicv7o2QM/0.jpg)](http://www.youtube.com/watch?v=nbAicv7o2QM "Typer test 3")

## License

[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)