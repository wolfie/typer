@ECHO OFF
SETLOCAL
SET OUTPUT_FILE=video.mp4

ffmpeg.exe -framerate 60 -i frames/frame%%05d.png -codec:v libx264 -crf 21 -bf 2 -flags +cgop -pix_fmt yuv420p -codec:a aac -strict -2 -b:a 384k -r:a 48000 -movflags faststart %OUTPUT_FILE%

IF %ERRORLEVEL% EQU 0 (
    start %OUTPUT_FILE%
)
