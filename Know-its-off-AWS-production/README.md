# Know It's Off AWS

The Know It's Off Capstone Project AWS Production Implementation Folder contains the necessary files to setup Know It's Off in an Amazon ECS Container.

## Requirements
- An ECS Container with Ports 443 and 80 open.

- A valid SSL certificate found at ```/etc/nginx/ssl.crt/certificate.crt``` and ```/etc/nginx/ssl.crt/private.key```.

- An Amazon RDS Database on the same security channel. Add the proper information to a config.py and constants.py files.

## Getting Started

Create a python virutal environment with ```python3 -m venv venv```, source to the virtual environment using ```source ./venv/bin/activate```, and then install the required software using ```python3 -m pip install -r requirements.txt```.

To apply the /app/models.py file to your assigned database, perform the following:
- ```flask db migrate```
- ```flask db upgrade```

If the current migration is not supported, delete the /migrations folder and use ```flask db init``` before running the previous steps again.

Next add a /build implementation that fits the current domain name and version.

Finally, run a test compose with ```docker-compose up --build```.

## Final Production Implementation
Run the compose with nohup as a background process like so: ```nohup docker-compose up --build &```. Check the logs of the implementation in the ```nohup.out``` file now located at the root of the folder. To reset the docker configuration do the following:
- Get a list of the current docker images running with ```docker container ls``` and copy the hashes associated with both processes.
- Stop those processes with ```docker container stop <hash_1> <hash_2>```.
- Prune the entire docker service ```docker system prune -a```. Type ```Y``` to verify.
- View the status of the reset docker service with ```docker status```.

## Contributing

This is a private repository only intended to be used by Oregon State University EECS Capstone Students.
Students should create a separate branch to make changes to before submitting a pull request and assigning a reviewer to verify that the code submitted is valid and tested before performing a squash and merge.

## Resources
Check out our Alternative Documentation source on [Google Docs](https://drive.google.com/drive/folders/168pbWIIE01XvCgvPQocodXuJtvq9ZIGi?usp=sharing).

## License
[MIT](https://choosealicense.com/licenses/mit/)

