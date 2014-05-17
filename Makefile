BUILD_DIR := .artefacts
TOUCH_DIR := $(BUILD_DIR)/touch
MS := metalsmith.json
MS_DIR := ms
MS_SITE_CONFIG := ms/site.json
ANALYSE_FILES := $(wildcard lib/*.js)
ANALYSE_TARGET_DIR := $(BUILD_DIR)/res
ANALYSE := $(TOUCH_DIR)/analysed
DATAJS_TARGET_DIR := $(BUILD_DIR)/datajs
DATAJS := $(TOUCH_DIR)/datajs
#TODO: remove the special file stuff
SITE_FILES := $(shell find ./site -type f -name '*' -not -path './site/lib/2013-17.js')
SITE := $(TOUCH_DIR)/site
PUBLISH := $(TOUCH_DIR)/publish

default: site
publish: $(PUBLISH)
site: $(SITE)
datajs: $(DATAJS)
analyse: $(ANALYSE)

$(PUBLISH): $(SITE)
	mkdir -p $(dir $@)
	cd .artefacts/site; \
	rm -rf .git; \
	git init .; \
	git add .; \
	git commit -m "Publish"; \
	git push git@github.com:gjn/homefield master:gh-pages --force; \
	rm -rf .git;
	touch $@

$(SITE): $(MS_SITE_CONFIG) $(SITE_FILES) $(DATAJS)
	cp $(MS_SITE_CONFIG) $(MS)
	node_modules/.bin/metalsmith
	touch $@

$(DATAJS): scripts/create_datajs.js scripts/templates/statvar.hbar $(ANALYSE)
	mkdir -p $(DATAJS_TARGET_DIR)
	node scripts/create_datajs.js $(wildcard .artefacts/res/*.json)
#TODO: Remove copying of this file
	cp $(DATAJS_TARGET_DIR)/2013-17.js site/lib/2013-17.js
	touch $@

$(ANALYSE): node_modules data/pfr/all.csv $(ANALYSE_FILES) index.js
	mkdir -p $(ANALYSE_TARGET_DIR)
	node index.js -f data/pfr/all.csv -t all
	mkdir -p $(TOUCH_DIR)
	touch $@

node_modules: package.json
	npm install

