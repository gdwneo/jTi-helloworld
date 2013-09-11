(function(jTi) {
    // model folder
    var modelFolder = 'models',
    // view folder
    viewFolder = 'views',
    // controller folder
    controllerFolder = 'controllers',
    // controller catch
    moduleCache = {},
    // application cache
    appCache = {};

    jTi.mvc = function(appName) {
        if (appCache.hasOwnProperty(appName)) {
            return appCache[appName];
        }
        return appCache[appName] = new jTi.mvc.fn.init(appName);
    };

    jTi.mvc.fn = jTi.mvc.prototype = {
        appFolder : 'app',
        controllers : {},
        init : function(appName) {
            if (appName) {
                this.appFolder = appName;
            }
            return this;
        },
        controller : function(name) {
            if ( typeof (name) === 'string') {
                if (this.controllers.hasOwnProperty(name)) {
                    return this.controllers[name];
                }
                console.log('load ' + name);
                var moduleId = jTi.fixFolder(this.appFolder, controllerFolder, name),
                // load controller module
                module = jTi.mvc.load(moduleId);
                module.name = name;
                if (module.models && !jTi.isArray(module.models)) {
                    module.models = [module.models];
                }
                return this.controllers[name] = new jTi.mvc.controller(this, module);
            }
            return false;
        },
        loadView : function(name) {
            var module = jTi.mvc.load(jTi.fixFolder(this.appFolder, viewFolder, name));
            return jTi.ui(module.view());
        },
        dbContext : function(dbContextName) {
            var moduleId = jTi.fixFolder(this.appFolder, modelFolder, dbContextName);
            return jTi.mvc.load(moduleId);
        },
        dispose : function() {
            delete appCache[this.appFolder];
        }
    };

    jTi.mvc.fn.init.prototype = jTi.mvc.fn;

    jTi.extend(jTi.mvc, {
        load : function(moduleId) {
            var module;
            if (moduleCache.hasOwnProperty(moduleId)) {
                module = moduleCache[moduleId];
            } else {
                module = require(moduleId);
                moduleCache[moduleId] = module;
            }
            return module;
        },
        controller : function(app, module) {
            this.app = app;
            this.module = module;
            this.children = [];
            this.models = [];
            for (var i in module.models) {
                this.model(module.models[i]);
            }
            console.log('model load complete.');
            // load view for controller
            this.document = app.loadView(module.name);
            console.log('view load complete.');
            if (jTi.isFunction(module.init)) {
                module.init.call(this);
            }
            console.log('controller inited.');
            return this;
        }
    });

    jTi.mvc.controller.prototype = {
        controller : function(name) {
            var child;
            if ( child = this.app.controller(name)) {
                for (var i in this.children) {
                    if (this.children[i] === name)
                        return child;
                }
                this.children.push(name);
            }
            return child;
        },
        model : function(name) {
            if (jTi.type(name) === 'string') {
                if (jTi.store(name)) {
                    return jTi.store(name);
                }
                var module = jTi.mvc.load(jTi.fixFolder(this.app.appFolder, modelFolder, name));
                this.models.push(name);
                return jTi.store(name, module);
            }
            var module = jTi.mvc.load(jTi.fixFolder(this.app.appFolder, modelFolder, name.type));
            this.models.push(name.id);
            return jTi.store(name.id, module);
        },
        dispose : function(force) {
            for (var i = this.children.length; i > 0; i--) {
                this.app.controllers[this.children[i - 1]].dispose.apply(this.app.controllers[this.children[i - 1]], arguments);
            }

            for (var i in this.models) {
                jTi.store(this.models[i], null);
            }

            if (jTi.isFunction(this.module.dispose) && !force) {
                this.module.dispose.apply(this, arguments);
            } else {
                this.document.remove();
            }

            for (var name in this.app.controllers) {
                if (this.app.controllers[name].children.indexOf(this.module.name) > -1) {
                    this.app.controllers[name].children.splice(this.app.controllers[name].children.indexOf(this.module.name), 1);
                    break;
                }
            }
            delete this.app.controllers[this.module.name];
        }
    };
})($);
