BUILD_DIR := .artefacts
TEMPLATE_DIR := $(BUILD_DIR)/templates
TOUCH_DIR := $(BUILD_DIR)/touch
ANALYSE_FILES := $(wildcard lib/*.js)
JS_FILES := $(shell find ./src -type f -name '*.js')
ANALYSE_TARGET_DIR := $(BUILD_DIR)/res
ANALYSE := $(TOUCH_DIR)/analysed
HOMEFIELD_CSS := $(BUILD_DIR)/_site/css/homefield.css
HOMEFIELD_MINCSS := $(BUILD_DIR)/_site/cssmin/homefield.css
HOMEFIELD_JS := $(TOUCH_DIR)/homefield.js
HOMEFIELD_MINJS := $(TOUCH_DIR)/homefield.min.js
SITE_FILES := $(shell find ./site -type f -name '*')
SITE := $(TOUCH_DIR)/site
SITE_DEBUG := $(TOUCH_DIR)/site_debug
SITE_PREPARE := $(TOUCH_DIR)/site_prepare
PUBLISH := $(TOUCH_DIR)/publish

default: all
publish: $(PUBLISH)
all: $(SITE_DEBUG) $(SITE)
site: $(SITE)
site_debug: $(SITE_DEBUG)
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

$(SITE): $(HOMEFIELD_MINCSS) $(HOMEFIELD_MINJS) $(SITE_PREPARE)
	cd $(BUILD_DIR)/ms/release && ../../../node_modules/.bin/metalsmith
	touch $@

$(SITE_DEBUG): $(HOMEFIELD_CSS) $(HOMEFIELD_JS) $(SITE_PREPARE)
	cd $(BUILD_DIR)/ms/debug && ../../../node_modules/.bin/metalsmith
	touch $@

$(SITE_PREPARE): $(SITE_FILES) ms/site/template/metalsmith.hbt ms/site/debug/metalsmith.json ms/site/release/metalsmith.json
	cd ms/site/debug && ../../../node_modules/.bin/metalsmith
	cd ms/site/release && ../../../node_modules/.bin/metalsmith
	cp -r site/* $(BUILD_DIR)/_site
	touch $@

$(HOMEFIELD_MINJS): $(HOMEFIELD_JS) ms/jsmini/metalsmith.json
	cd ms/jsmini && ../../node_modules/.bin/metalsmith
	cd .artefacts/_site/libmin && find . -type f -name '*.js' -not -path '*.min.js' -delete && rename s/min.// *.js
	touch $@

$(HOMEFIELD_MINCSS): site/less/styles.less
	mkdir -p $(dir $@)
	./node_modules/.bin/lessc -x $< > $@

$(HOMEFIELD_CSS): site/less/styles.less
	mkdir -p $(dir $@)
	./node_modules/.bin/lessc $< > $@

$(HOMEFIELD_JS): $(ANALYSE) $(JS_FILES) ms/jsbuild/metalsmith.json ms/jsbuild/templates/hf.hbt
	mkdir -p $(TEMPLATE_DIR)
	cd ms/jsbuild && ../../node_modules/.bin/metalsmith
	node_modules/.bin/smash src/homefield.js > $(BUILD_DIR)/_site/lib/homefield.js
	touch $@

$(ANALYSE): node_modules data/pfr/all.csv $(ANALYSE_FILES) index.js
	mkdir -p $(ANALYSE_TARGET_DIR)
	node index.js -f data/pfr/all.csv -t all
	mkdir -p $(TOUCH_DIR)
	touch $@

node_modules: package.json
	npm install

