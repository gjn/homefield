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

site: allgames
	node_modules/.bin/metalsmith

allgames: node_modules
	node index.js data/pfr/all.csv

node_modules: package.json
		npm install

