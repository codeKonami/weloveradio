#!/usr/bin/env bash

apt-get update
apt-get install -y nginx
sudo apt-get install -y git

useradd app
mkdir /home/app
ln -fs /vagrant /home/app/public_html
mkdir /home/app/logs
touch /home/app/logs/error.log
touch /home/app/logs/access.log
sudo apt-get install python-software-properties
sudo apt-get install software-properties-common
sudo add-apt-repository ppa:nginx/stable
sudo apt-get install software-properties-common
sudo apt-get update
sudo apt-get install nginx
apt-get install -y gearman-job-server libgearman-dev
apt-get install -y vim
apt-get install -y gearman-tools
apt-get install -y python-software-properties
add-apt-repository -y ppa:chris-lea/node.js
apt-get update -y
apt-get install -y nodejs
apt-get install -y mpd
apt-get install -y mpc
service mpd stop
update-rc.d mpd disable
rm -Rf /var/lib/mpd
ln -s /home/app/public_html/public/mpd /var/lib/mpd
mpd /var/lib/mpd/mpd.conf
mpc update
sleep 2
mpc add The_Black_Keys_-_Tighten_Up.m4a
mpc play
mpc repeat on
service nginx start
gearmand
sudo npm install -g forever

cd /home/app/public_html
sudo npm install

sudo wget http://yt-dl.org/downloads/latest/youtube-dl -O /usr/local/bin/youtube-dl
sudo chmod a+x /usr/local/bin/youtube-dl
sudo apt-get install -y ffmpeg


rm /etc/nginx/sites-enabled/default

echo 'server {
    listen 80;

    server_name radio.dev;

    location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header X-NginX-Proxy true;

        proxy_pass http://127.0.0.1:1337/;
        proxy_redirect off;

        # Socket.IO Support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}' > /etc/nginx/sites-available/app

sed -i 's/sendfile on;/sendfile off;/g' /etc/nginx/nginx.conf

ln -s /etc/nginx/sites-available/app /etc/nginx/sites-enabled/app

service nginx restart

cd /home/app/public_html

forever start worker.js
forever start server.js
