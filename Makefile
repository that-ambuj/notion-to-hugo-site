# Setup a cronjob for this target
all: update_nginx deploy_nginx

# Run this first time before deploying to local nginx folder
prepare:
	sudo chmod u+rw -R /usr/share/nginx/html

node_deps:
	yarn install

clean:
	@echo "Cleaning Up Files..."
	@find ./hugo-site/static -type f -not -name wavy-bg.png -not -name wavy-bg-orange.png -not -name \*.svg -not -name robots.txt | xargs rm -f
	@find ./hugo-site/content -type f -not -name _index.md | xargs rm || true
	@rm -rf static-site

download: node_deps clean
	node index.js

build: hugo-site/content hugo-site/static
	cd hugo-site && hugo --minify -d ../static-site

clean_build: clean download build

# Not deleting old files in nginx but using -f to overwrite them
# To ensure zero downtime
# Also using -b flag to keep a backup in case any part of the node download script breaks
deploy_nginx:
	cp -rfb --suffix=.backup ./static-site/* /usr/share/nginx/html

update_nginx: clean_build deploy_nginx

gh_pages: 
	yarn build -b /notion-to-hugo-blog
	rm -rf docs
	mv static-site docs

gh_pages_deploy: gh_pages
	git add .
	git commit -m "updated github pages $(date -I'hours')"