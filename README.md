# Used for personal assignment

## PRECONDITION
## You have opened a Powershell window 

## clone repo
git clone https://github.com/looking4ward/cloud-automation.git

## change directory
cd cloud-automation

## build Docker image
docker build -t drone2p .

## Run in normal mode using port definitions
## This requires another Powershell window to test
## If it already exists.. remove container first
## If you want to run it in background mode add -d after run
docker run --name my_drone2p -p 29588:29588/udp -p 80:80/tcp -p 443:443/tcp -p 43554:43554/udp drone2p

## Check your local ip-address
### docker inspect my_drone2p | grep Address  #linux
docker inspect my_drone2p | select-string Address  #powershell

## or check container using bash shell and type 'hostname -I' to see all IP-addresses
docker exec -it my_drone2p /bin/bash 
## type your commands inside the bash shell
hostname -I

## check on app.pm2.io to see if your app is running and check external ip-address
https://app.pm2.io/bucket/62236aa9690227971360179a/backend/overview/servers

## test your app using your own software on ip address 0.0.0.0 using port 29588. For example a node.js application:
node client.js 0.0.0.0 media1.zip
