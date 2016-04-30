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

PHONY: cleanswap
cleanswap:
	find . -type f -name "*.swp" -exec rm -f {} \;

$(PUBLISH): $(SITE)
	mkdir -p $(dir $@)
	cd .artefacts/site; \
	rm -rf .git; \
	git init .; \
	git add .; \
	git commit -m "Publish"; \
	git push https://github.com/gjn/homefield master:gh-pages --force; \
	rm -rf .git;
	touch $@

$(SITE): $(HOMEFIELD_MINCSS) $(HOMEFIELD_MINJS) $(SITE_PREPARE)
	cd $(BUILD_DIR)/ms/release && ../../../node_modules/.bin/metalsmith
	touch $@

$(SITE_DEBUG): $(HOMEFIELD_CSS) $(HOMEFIELD_JS) $(SITE_PREPARE)
	cd $(BUILD_DIR)/ms/debug && ../../../node_modules/.bin/metalsmith
	touch $@

$(SITE_PREPARE): $(SITE_FILES) ms/site/template/metalsmith.hbt ms/site/debug/metalsmith.json ms/site/release/metalsmith.json site/templates/experimental.html site/templates/index.html site/templates/post.html
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

$(ANALYSE): $(ANALYSE_TARGET_DIR)/2016.js $(ANALYSE_TARGET_DIR)/2015.js $(ANALYSE_TARGET_DIR)/2014.js $(ANALYSE_TARGET_DIR)/2013.js $(ANALYSE_TARGET_DIR)/2012.js $(ANALYSE_TARGET_DIR)/2011.js $(ANALYSE_TARGET_DIR)/2010.js $(ANALYSE_TARGET_DIR)/2009.js $(ANALYSE_TARGET_DIR)/2008.js $(ANALYSE_TARGET_DIR)/2007.js $(ANALYSE_TARGET_DIR)/2006.js $(ANALYSE_TARGET_DIR)/2005.js $(ANALYSE_TARGET_DIR)/2004.js $(ANALYSE_TARGET_DIR)/2003.js $(ANALYSE_TARGET_DIR)/2002.js
	mkdir -p $(TOUCH_DIR)
	touch $@

$(ANALYSE_TARGET_DIR)/2016.js: node_modules data/pfr/2016.csv data/pfr/2015.csv data/pfr/2014.csv data/pfr/2013.csv $(ANALYSE_FILES) index.js
	mkdir -p $(ANALYSE_TARGET_DIR)
	node index.js -p data/pfr/ -s 2016

$(ANALYSE_TARGET_DIR)/2015.js: node_modules data/pfr/2015.csv data/pfr/2014.csv data/pfr/2013.csv data/pfr/2012.csv $(ANALYSE_FILES) index.js
	mkdir -p $(ANALYSE_TARGET_DIR)
	node index.js -p data/pfr/ -s 2015

$(ANALYSE_TARGET_DIR)/2014.js: node_modules data/pfr/2014.csv data/pfr/2013.csv data/pfr/2012.csv data/pfr/2011.csv $(ANALYSE_FILES) index.js
	mkdir -p $(ANALYSE_TARGET_DIR)
	node index.js -p data/pfr/ -s 2014

$(ANALYSE_TARGET_DIR)/2013.js: node_modules data/pfr/2013.csv data/pfr/2012.csv data/pfr/2011.csv data/pfr/2010.csv $(ANALYSE_FILES) index.js
	mkdir -p $(ANALYSE_TARGET_DIR)
	node index.js -p data/pfr/ -s 2013

$(ANALYSE_TARGET_DIR)/2012.js: node_modules data/pfr/2012.csv data/pfr/2011.csv data/pfr/2010.csv data/pfr/2009.csv $(ANALYSE_FILES) index.js
	mkdir -p $(ANALYSE_TARGET_DIR)
	node index.js -p data/pfr/ -s 2012

$(ANALYSE_TARGET_DIR)/2011.js: node_modules data/pfr/2011.csv data/pfr/2010.csv data/pfr/2009.csv data/pfr/2008.csv $(ANALYSE_FILES) index.js
	mkdir -p $(ANALYSE_TARGET_DIR)
	node index.js -p data/pfr/ -s 2011

$(ANALYSE_TARGET_DIR)/2010.js: node_modules data/pfr/2010.csv data/pfr/2009.csv data/pfr/2008.csv data/pfr/2007.csv $(ANALYSE_FILES) index.js
	mkdir -p $(ANALYSE_TARGET_DIR)
	node index.js -p data/pfr/ -s 2010

$(ANALYSE_TARGET_DIR)/2009.js: node_modules data/pfr/2009.csv data/pfr/2008.csv data/pfr/2007.csv data/pfr/2006.csv $(ANALYSE_FILES) index.js
	mkdir -p $(ANALYSE_TARGET_DIR)
	node index.js -p data/pfr/ -s 2009

$(ANALYSE_TARGET_DIR)/2008.js: node_modules data/pfr/2008.csv data/pfr/2007.csv data/pfr/2006.csv data/pfr/2005.csv $(ANALYSE_FILES) index.js
	mkdir -p $(ANALYSE_TARGET_DIR)
	node index.js -p data/pfr/ -s 2008

$(ANALYSE_TARGET_DIR)/2007.js: node_modules data/pfr/2007.csv data/pfr/2006.csv data/pfr/2005.csv data/pfr/2004.csv $(ANALYSE_FILES) index.js
	mkdir -p $(ANALYSE_TARGET_DIR)
	node index.js -p data/pfr/ -s 2007

$(ANALYSE_TARGET_DIR)/2006.js: node_modules data/pfr/2006.csv data/pfr/2005.csv data/pfr/2004.csv data/pfr/2003.csv $(ANALYSE_FILES) index.js
	mkdir -p $(ANALYSE_TARGET_DIR)
	node index.js -p data/pfr/ -s 2006

$(ANALYSE_TARGET_DIR)/2005.js: node_modules data/pfr/2005.csv data/pfr/2004.csv data/pfr/2003.csv data/pfr/2002.csv $(ANALYSE_FILES) index.js
	mkdir -p $(ANALYSE_TARGET_DIR)
	node index.js -p data/pfr/ -s 2005

$(ANALYSE_TARGET_DIR)/2004.js: node_modules data/pfr/2004.csv data/pfr/2003.csv data/pfr/2002.csv $(ANALYSE_FILES) index.js
	mkdir -p $(ANALYSE_TARGET_DIR)
	node index.js -p data/pfr/ -s 2004

$(ANALYSE_TARGET_DIR)/2003.js: node_modules data/pfr/2003.csv data/pfr/2002.csv $(ANALYSE_FILES) index.js
	mkdir -p $(ANALYSE_TARGET_DIR)
	node index.js -p data/pfr/ -s 2003

$(ANALYSE_TARGET_DIR)/2002.js: node_modules data/pfr/2002.csv $(ANALYSE_FILES) index.js
	mkdir -p $(ANALYSE_TARGET_DIR)
	node index.js -p data/pfr/ -s 2002

node_modules: package.json
	npm install

