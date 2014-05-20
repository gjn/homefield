BUILD_DIR := .artefacts
TEMP_DIR := $(BUILD_DIR)/temp
TEMPLATE_DIR := $(BUILD_DIR)/templates
TOUCH_DIR := $(BUILD_DIR)/touch
MS := metalsmith.json
MS_DIR := ms
MS_SITE_CONFIG := ms/site.json
ANALYSE_FILES := $(wildcard lib/*.js)
JS_FILES := $(shell find ./src -type f -name '*.js')
ANALYSE_TARGET_DIR := $(BUILD_DIR)/res
ANALYSE := $(TOUCH_DIR)/analysed
HOMEFIELD_JS := $(TOUCH_DIR)/homefield.js
HOMEFIELD_MINJS := $(TOUCH_DIR)/homefield.min.js
SITE_FILES := $(shell find ./site -type f -name '*')
SITE := $(TOUCH_DIR)/site
PUBLISH := $(TOUCH_DIR)/publish

default: site
publish: $(PUBLISH)
site: $(SITE)
jsmin: $(HOMEFIELD_MINJS)
js: $(HOMEFIELD_JS)
minjs: $(HOMEFIELD_MINJS)
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

$(SITE): $(MS_SITE_CONFIG) $(SITE_FILES) $(HOMEFIELD_MINJS)
	cp $(MS_SITE_CONFIG) $(MS)
	node_modules/.bin/metalsmith
	touch $@

$(HOMEFIELD_MINJS): $(HOMEFIELD_JS) ms/jsmini/metalsmith.json
	cd ms/jsmini && ../../node_modules/.bin/metalsmith
	find .artefacts/_site/libmin -type f -name '*.js' -not -path '.*min*.' -delete
	touch $@

$(HOMEFIELD_JS): $(ANALYSE) $(JS_FILES) ms/jsbuild/metalsmith.json
	mkdir -p $(TEMPLATE_DIR)
	node_modules/.bin/smash src/homefield.js > $(TEMPLATE_DIR)/hf.js
	cd ms/jsbuild && ../../node_modules/.bin/metalsmith
	touch $@

$(ANALYSE): node_modules data/pfr/all.csv $(ANALYSE_FILES) index.js
	mkdir -p $(ANALYSE_TARGET_DIR)
	node index.js -f data/pfr/all.csv -t all
	mkdir -p $(TOUCH_DIR)
	touch $@

node_modules: package.json
	npm install

