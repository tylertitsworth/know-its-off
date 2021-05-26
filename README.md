# Know It's Off

The Know It's Off Capstone Project Web Interface Development Branch is primarily used for creating new features for the production branch.

## Requirements

- A minimum of Python 3.8 should be installed on the system, please update pip with ```python3 -m pip install --upgrade pip```. 


- The Yarn Package Manager must be installed, make sure you are manually installing the Alternatives section found on the [Yarn](https://classic.yarnpkg.com/en/docs/install/#windows-stable) site.


- A database constants.py and config.py while should be supplied with the proper options, secret key, and login information

## Getting Started

Create a python virutal environment with ```python3 -m venv venv```, source to the virtual environment using ```source ./venv/bin/activate```, and then install the required software using ```python3 -m pip install -r requirements.txt```. Afterwards, initialize yarn with ```yarn```.

To apply the /app/models.py file to your assigned database, perform the following:
- ```flask db migrate```
- ```flask db upgrade```

If the current migration is not supported, delete the /migrations folder and use ```flask db init``` before running the previous steps again.

## Usage
- ```yarn start``` will run the Flask API at localhost:5000.

- ```yarn start-dev``` will run the React Frontend at localhost:3000.

- ```yarn build``` will create a minified React frontend output at /build.


## Contributing

This is a private repository only intended to be used by Oregon State University EECS Capstone Students.
Students should create a separate branch to make changes to before submitting a pull request and assigning a reviewer to verify that the code submitted is valid and tested before performing a squash and merge.

## License
[MIT](https://choosealicense.com/licenses/mit/)
