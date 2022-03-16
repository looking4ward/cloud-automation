https://hub.docker.com/r/keymetrics/pm2
https://pm2.keymetrics.io/docs/usage/docker-pm2-nodejs/
https://github.com/SaxionACT/2019-2020-Project-Netwerken-Drone2P
https://app.pm2.io/bucket/62236aa9690227971360179a/backend/metrics-histograms?app=DRONE2P


Build and Run your image
From your Node.js app project folder launch those commands:


# Exposing UDP ports in Dockerfile
https://linuxhint.com/dockerfile_expose_ports/


# Open Powershell window !!!!

$ docker build -t drone2p .

# Run in normal mode using port definitions
$ // docker run --name my_drone2p -p 29588:29588/udp -p 80:80/tcp -p 443:443/tcp -p 43554:43554/udp drone2p
 
# Run in background mode using port definitions
$ // docker run -ti --name my_drone2p -p 29588:29588/udp -p 80:80/tcp -p 443:443/tcp -p 43554:43554/udp drone2p

# look for extenal ip address on app.pm2.io
https://app.pm2.io/bucket/62236aa9690227971360179a/backend/metrics-histograms?app=DRONE2P

#docker inspect my_drone2p | grep Address  #linux
docker inspect my_drone2p | select-string Address  #powershell

# open new powershell and go to ./test\2019-2020-Project-Netwerken-Drone2P
cd test
cd 2019-2020-Project-Netwerken-Drone2P

# test client
node client.js 172.17.0.2 media1.zip


# Run in host mode using --network host
$ //docker run -d -it --network host --name my_drone2p drone2p 

# Show IPaddress
$ #docker inspect drone2p | grep Address  #linux
$ docker inspect my_drone2p | Select-String Address

# Open Bash shell in docker image using container name
$ docker exec -it my_drone2p /bin/bash

# Open Bash shell in docker image using container id
$ docker ps
$ docker exec -it 4064dd98508d /bin/bash
>pm2 monit
or
>pm2 logs DRONE2P

Useful commands
Command	Description
$ docker exec -it <container-id> pm2 monit	Monitoring CPU/Usage of each process
$ docker exec -it <container-id> pm2 list	Listing managed processes
$ docker exec -it <container-id> pm2 show	Get more information about a process
$ docker exec -it <container-id> pm2 reload all	0sec downtime reload all applications





