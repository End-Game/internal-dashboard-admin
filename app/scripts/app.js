/*global define */
define(['backbone','intranet','models','views'], function (backbone,intranet) {
    'use strict';
    var App = function(){
        this.intranet = intranet;
    };
    
    App.prototype.init = function(){
        new intranet.View();
    };
    
    return new App();
});
