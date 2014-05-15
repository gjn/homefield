.PHONY: all

publish: site
	cd _site; \
	rm -rf .git; \
	git init .; \
	git add .; \
	git commit -m "Publish"; \
	git push git@github.com:gjn/homefield master:gh-pages --force; \
	rm -rf .git;

all: site

site: games
	node_modules/.bin/metalsmith

games: node_modules
	node index.js -f data/pfr/all.csv

allgames: node_modules
	node index.js -f data/pfr/all.csv -t all

node_modules: package.json
		npm install

