# Used for personal assignment

# PRECONDITION
# You have opened a Powershell window 

# clone repo
git clone https://github.com/looking4ward/cloud-automation.git

# change directory
cd cloud-automation

# build Docker image
docker build -t drone2p .
# Run in background mode using port definitions
// docker run -ti --name my_drone2p -p 29588:29588/udp -p 80:80/tcp -p 443:443/tcp -p 43554:43554/udp drone2p

# Run in normal mode using port definitions
# This requires another Powershell window to test
docker run --name my_drone2p -p 29588:29588/udp -p 80:80/tcp -p 443:443/tcp -p 43554:43554/udp drone2p

# Check your local ip-address
#docker inspect my_drone2p | grep Address  #linux
docker inspect my_drone2p | select-string Address  #powershell


# look for your corresponding external ip address on app.pm2.io
https://app.pm2.io/bucket/62236aa9690227971360179a/backend/metrics-histograms?app=DRONE2P

# test your app using your own software
