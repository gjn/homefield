DUMMY := $(shell mkdir -p .artefacts/results)
CALC_JS_FILES := $(shell find ./lib -type f -name '*.js')
SITE_FILES := $(shell find ./site -type f -name '*' -not -path './site/lib/2013-17.js')

.PHONY: default
default: .artefacts/touch/site

.PHONY: publish
publish: .artefacts/touch/publish

.PHONY: games
games: .artefacts/touch/games

.PHONY: allgames
allgames: .artefacts/touch/allgames

.PHONY: datajs
datajs: .artefacts/touch/datajs

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

.artefacts/touch/site: metalsmith.json $(SITE_FILES) .artefacts/touch/datajs
	mkdir -p $(dir $@)
	node_modules/.bin/metalsmith
	touch $@

.artefacts/touch/datajs: scripts/create_datajs.js scripts/templates/statvar.hbar .artefacts/touch/allgames
	mkdir -p .artefacts/data
	node scripts/create_datajs.js $(shell find .artefacts/results -type f -name '*.json')
	cp .artefacts/data/2013-17.js site/lib/2013-17.js
	touch $@

.artefacts/touch/games: .artefacts/touch/g
	mkdir -p $(dir $@)
	node index.js -f data/pfr/all.csv
	touch $@

.artefacts/touch/allgames: .artefacts/touch/g
	mkdir -p $(dir $@)
	node index.js -f data/pfr/all.csv -t all
	touch $@

.artefacts/touch/g: node_modules data/pfr/all.csv $(CALC_JS_FILES)
	mkdir -p .artefacts/results
	mkdir -p $(dir $@)
	touch $@

node_modules: package.json
	npm install


