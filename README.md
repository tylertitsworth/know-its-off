# Know It's Off

The Know It's Off Capstone Project Web Interface Production Branch features stable code for use in public releases.

## Requirements
- Any Linux Distro, but preferably a Raspberry Pi.


- A minimum of Python 3.8 on the system, update pip with ```python3 -m pip install --upgrade pip```. 


- The Yarn Package Manager must be installed, make sure you are manually installing the Alternatives section found on the [Yarn](https://classic.yarnpkg.com/en/docs/install/#windows-stable) site.


- A database constants.py and config.py while should be supplied with the proper options, secret key, and login information
## Getting Started

Create a python virutal environment with ```python3 -m venv venv```, source to the virtual environment using ```source ./venv/bin/activate```, and then install the required software using ```python3 -m pip install -r requirements.txt```. Afterwards, initialize yarn with ```yarn```.

To apply the /app/models.py file to your assigned database, perform the following:
- ```flask db migrate```
- ```flask db upgrade```

If the current migration is not supported, delete the /migrations folder and use ```flask db init``` before running the previous steps again.

Then go to `src/axios` and change the baseURL to a domain that you own.

Next run `yarn build` to make the static files for the website. 

Copy the default file in `/nginx` to `/etc/nginx/sites-available` and restart the nginx service.

Then copy the contents of the `build` folder to `/var/www/html`.

Lastly, run the service with`flask run &`.

## AWS Legacy Code

This folder contains files for running Know Its Off on Amazon's cloud servers. It's dockerized for easy setup and teardown, however, updating the files will require the developer to port over all Flask files from another branch, and move a premade `build` folder built with the correct baseURL into the `flask` folder.

## Contributing

This is a private repository only intended to be used by Oregon State University EECS Capstone Students.
Students should create a separate branch to make changes to before submitting a pull request and assigning a reviewer to verify that the code submitted is valid and tested before performing a squash and merge.

## Resources
Check out our Alternative Documentation source on [Google Docs](https://drive.google.com/drive/folders/168pbWIIE01XvCgvPQocodXuJtvq9ZIGi?usp=sharing).

## License
[MIT](https://choosealicense.com/licenses/mit/)

