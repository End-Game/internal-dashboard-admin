/* global define */

define(["jquery"], function(jQuery) {
    var Hoist = function() {

    };

    Hoist.prototype = {
        hoistUserKey: 'hoist-user',
        ajaxOptions: {},
        initialize: function(apiKey) {
            self.ajaxOptions = {
                headers: {
                    'Authorization': 'Hoist ' + apiKey
                },
                crossDomain: true,
                xhrFields: {
                    withCredentials: true
                }
            };
        },
        isLoggedIn: function() {
            if (self.currentUser()) {
                return true;
            }
            return false;
        },
        currentUser: function() {
            return JSON.parse(sessionStorage.getItem(self.hoistUserKey) || "null");
        },
        login: function(email, password, onSuccess, onFailure) {
            var options = jQuery.extend({
                url: 'https://auth.hoi.io/login',
                data: {
                    username: email,
                    password: password
                },
                type: 'POST',
                success: function(response) {
                    sessionStorage.setItem(self.hoistUserKey, JSON.stringify(response));
                    onSuccess();
                },
                error: onFailure
            }, self.ajaxOptions);
            $.ajax(options);
        },
        signup: function(name, email, password, onSuccess, onFailure) {
            var options = jQuery.extend({
                url: 'https://auth.hoi.io/user',
                data: {
                    name: name,
                    email: email,
                    password: password
                },
                type: 'POST',
                success: function(response) {
                    sessionStorage.setItem(self.hoistUserKey, JSON.stringify(response));
                    onSuccess();
                },
                error: onFailure
            }, self.ajaxOptions);
            $.ajax(options);
        },
        getData: function(onSuccess, onFailure) {
            var options = jQuery.extend({
                url: "https://data.hoi.io/EndGamePortal/data",
                type: "GET",
                dataType: "json",
                success: function(response) {
                    onSuccess(response);
                },
                error: function(request, status, error) {
                    console.log(error);
                    onFailure();
                }
            }, self.ajaxOptions);
            $.ajax(options);
        },
        postData: function(data, onSuccess, onFailure) {
            var options = jQuery.extend({
                url: "https://data.hoi.io/EndGamePortal/data",
                type: "POST",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(data),
                success: function() {
                    onSuccess();
                },
                error: function(request, status, error) {
                    console.log(error);
                    onFailure();
                }
            }, self.ajaxOptions);
            $.ajax(options);
        }
    };
    var self = new Hoist();
    return self;
});