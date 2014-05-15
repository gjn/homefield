SRC_FILES := $(shell find . -type f -name '*.js' -not -path './node_modules/*')
SITE_FILES := $(shell find ./site ./results -type f -name '*')

.PHONY: default
default: _build/site

.PHONY: publish
publish: _build/publish

.PHONY: games
games: _build/games

.PHONY: allgames
allgames: _build/allgames

_build/site: _build/allgames metalsmith.json $(SITE_FILES)
	mkdir -p $(dir $@)
	node_modules/.bin/metalsmith
	touch $@

_build/games: _build/g
	mkdir -p $(dir $@)
	node index.js -f data/pfr/all.csv

_build/allgames: _build/g
	mkdir -p $(dir $@)
	node index.js -f data/pfr/all.csv -t all
	touch $@

_build/g: node_modules data/pfr/all.csv $(SRC_FILES)
	mkdir -p $(dir $@)
	echo $(SRC_FILES)
	echo "games have chanaged"
	touch $@

node_modules: package.json
	npm install

_build/publish: _build/site
	mkdir -p $(dir $@)
	cd _site; \
	rm -rf .git; \
	git init .; \
	git add .; \
	git commit -m "Publish"; \
	git push git@github.com:gjn/homefield master:gh-pages --force; \
	rm -rf .git;
	touch $@

