DUMMY := $(shell mkdir -p .artefacts/results)
SRC_FILES := $(shell find . -type f -name '*.js' -not -path './node_modules/*')
SITE_FILES := $(shell find ./site .artefacts/results -type f -name '*')

.PHONY: default
default: .artefacts/touch/site

.PHONY: publish
publish: .artefacts/touch/publish

.PHONY: games
games: .artefacts/touch/games

.PHONY: allgames
allgames: .artefacts/touch/allgames

.artefacts/touch/site: .artefacts/touch/allgames metalsmith.json $(SITE_FILES)
	mkdir -p $(dir $@)
	node_modules/.bin/metalsmith
	touch $@

.artefacts/touch/games: .artefacts/touch/g
	mkdir -p $(dir $@)
	node index.js -f data/pfr/all.csv
	touch $@

.artefacts/touch/allgames: .artefacts/touch/g
	mkdir -p $(dir $@)
	node index.js -f data/pfr/all.csv -t all
	touch $@

.artefacts/touch/g: node_modules data/pfr/all.csv $(SRC_FILES) .artefacts/results
	mkdir -p $(dir $@)
	touch $@

.artefacts/results:
	mkdir -p $(dir $@)

node_modules: package.json
	npm install

.artefacts/touch/publish: .artefacts/touch/site
	mkdir -p $(dir $@)
	cd .artefacts/site; \
	rm -rf .git; \
	git init .; \
	git add .; \
	git commit -m "Publish"; \
	git push git@github.com:gjn/homefield master:gh-pages --force; \
	rm -rf .git;
	touch $@

