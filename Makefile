.PHONY: all
all: site

allgames: node_modules
	node index.js data/pfr/all.csv

site: allgames
	node_modules/.bin/metalsmith

node_modules: package.json
		npm install

