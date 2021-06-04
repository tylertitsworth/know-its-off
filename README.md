# Know It's Off

The Know It's Off Capstone Project Microcontroller Branch is used for holding all code and resources needed to program the Know It's Off device.

## Requirements

- Arduino IDE 1.8.15 [Arduino](https://www.arduino.cc/en/software)


- ESP8266 Arduino Core [ESP8266 Arduino Core](https://arduino-esp8266.readthedocs.io/en/latest/installing.html)


- LittleFS for ESP8266 [ESP8266 Arduino Core](https://arduino-esp8266.readthedocs.io/en/latest/filesystem.html)


## Getting Started

Install ESP8266 2.7.4 (3.0+ not working) from Arduino Board Manager

Set board to Generic ESP8266 Module with Flash Size:4MB(FS:3MB OTA:~512KB)

Copy contents of Library folder to User/Documents/Arduino/Libraries

## Usage

Launch your Know It's Off device into bootload mode

Upload data with ```Tools > ESP8266 LittleFS Data Upload```

Program the device with ```Sketch > Upload```

## Contributing

This is a private repository only intended to be used by Oregon State University EECS Capstone Students.
Students should create a separate branch to make changes to before submitting a pull request and assigning a reviewer to verify that the code submitted is valid and tested before performing a squash and merge.

## Resources
Check out our Alternative Documentation source on [Google Docs](https://drive.google.com/drive/folders/168pbWIIE01XvCgvPQocodXuJtvq9ZIGi?usp=sharing).

## License
[MIT](https://choosealicense.com/licenses/mit/)
