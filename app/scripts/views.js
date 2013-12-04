define(['intranet', 'backbone', 'hoist'], function(Intranet, Backbone, hoist) {
    'use strict';

    Intranet.shadeColor = function(color, percent) {
        var R = parseInt(color.substring(1, 3), 16);
        var G = parseInt(color.substring(3, 5), 16);
        var B = parseInt(color.substring(5, 7), 16);

        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);

        R = (R < 255) ? R : 255;
        G = (G < 255) ? G : 255;
        B = (B < 255) ? B : 255;

        var RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
        var GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
        var BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

        return "#" + RR + GG + BB;
    };

    Intranet.drawGraph = function(ctx, percent, colour) {
        do {
            ctx.beginPath();
            ctx.arc(100, 100, 80, Math.PI * 3 / 2 + 2 * Math.PI * percent, Math.PI * 3 / 2, true);
            ctx.arc(100, 100, 100, Math.PI * 3 / 2, Math.PI * 3 / 2 + 2 * Math.PI * percent);
            ctx.fillStyle = colour;
            ctx.fill();
            colour = Intranet.shadeColor(colour, -40);
            percent -= 1;
        } while (percent > 0);
    };

    Intranet.writeJson = function(item, list, toPost) {
        Intranet.jsonData[item] = list.toJSON();
        if (toPost) {
            Intranet.post();
        } else {
            console.log(Intranet.jsonData);
        }
    };

    Intranet.post = function() {
        hoist.postData(Intranet.jsonData, function() {
            console.log("data post successful");
        }, function() {
            console.log("data post unsuccessful");
        });
    };

    Intranet.dateSort = function(model1, model2) {
        var date1 = model1.get("date").split(".");
        var date2 = model2.get("date").split(".");
        if (date1[2] === date2[2] || isNaN(date1[2]) || isNaN(date2[2]) || date1[2] === undefined || date2[2] === undefined) {
            if (date1[1] === date2[1] || isNaN(date1[1]) || isNaN(date2[1]) || date1[1] === undefined || date2[1] === undefined) {
                if (date1[0] === date2[0] || isNaN(date1[0]) || isNaN(date2[0]) || date1[0] === undefined || date2[0] === undefined) {
                    return 0;
                }
                return (date1[0] < date2[0]) ? -1 : 1;
            }
            return (date1[1] < date2[1]) ? -1 : 1;
        }
        return (date1[2] < date2[2]) ? -1 : 1;
    };

    Intranet.reverseDateSort = function(model1, model2) {
        return Intranet.dateSort(model2, model1);
    };

    Intranet.GraphDataView = Backbone.View.extend({
        tagName: "p",
        className: "textSC",
        template: _.template($("#graphDataTemplate").html()),
        editTemplate: _.template($("#graphDataEditTemplate").html()),

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        events: {
            "click button.delete": "del",
            "click button.edit": "editData",
            "click button.save": "saveEdit",
            "click button.cancel": "cancelEdit"
        },

        del: function() {
            this.model.destroy();
            this.remove();
        },

        editData: function() {
            this.$el.html(this.editTemplate(this.model.toJSON()));
        },

        saveEdit: function(e) {
            e.preventDefault();
            var formData = {};
            $(e.target).closest("form").find(":input").not("button").each(function() {
                var el = $(this);
                formData[el.attr("class")] = el.val();
            });
            this.model.set(formData);
            this.render();
        },

        cancelEdit: function() {
            this.render();
        }
    });

    Intranet.GraphDataListView = Backbone.View.extend({
        render: function() {
            var that = this;
            _.each(this.collection.models, function(item) {
                that.renderGraphData(item);
            }, this);
            this.renderGraph();
            var models = this.collection.models;
            for (var i = 0; i < models.length; i++) {
                models[i].on("change", this.renderGraph, this);
                models[i].on("change", this.write, this);
            }
        },

        renderGraphData: function(item) {
            var graphDataView = new Intranet.GraphDataView({
                model: item
            });
            this.$el.append(graphDataView.render().el);
        },

        write: function() {}
    });

    Intranet.BudgetView = Intranet.GraphDataListView.extend({
        el: "#budget",

        initialize: function() {
            this.collection = Intranet.collections.budgetList;
            this.render();
        },

        renderGraph: function() {
            var c = document.getElementById("budget_canvas");
            var ctx = c.getContext("2d");
            var target = this.collection.models[0].get("data");
            var actual = this.collection.models[1].get("data");
            target = parseFloat(target.substring(1, target.length));
            actual = parseFloat(actual.substring(1, actual.length));
            var percent = actual / target;
            var colour = "#80C99C";
            Intranet.drawGraph(ctx, percent, colour);
        },

        write: function() {
            Intranet.writeJson("budget", this.collection, true);
        }
    });

    Intranet.InvestmentView = Intranet.GraphDataListView.extend({
        el: "#investment",

        initialize: function() {
            this.collection = Intranet.collections.investmentList;
            this.render();
            this.renderGraph();
        },

        renderGraph: function() {
            var c = document.getElementById("investment_canvas");
            var ctx = c.getContext("2d");
            ctx.beginPath();
            var target = this.collection.models[1].get("data");
            var actual = this.collection.models[0].get("data");
            target = parseFloat(target.substring(0, target.length - 1));
            actual = parseFloat(actual.substring(0, actual.length - 1));
            var percent = actual / target;
            var colour = "#D82253";
            Intranet.drawGraph(ctx, percent, colour);
        },

        write: function() {
            Intranet.writeJson("investment", this.collection, true);
        }

    });

    Intranet.TeamSatisfactionView = Intranet.GraphDataListView.extend({
        el: "#team_satisfaction",

        initialize: function() {
            this.collection = Intranet.collections.teamSatisfactionList;
            this.render();
            this.renderGraph();
        },

        renderGraph: function() {
            var c = document.getElementById("team_satisfaction_canvas");
            var ctx = c.getContext("2d");
            var target = this.collection.models[0].get("data");
            var actual = this.collection.models[1].get("data");
            target = parseFloat(target.substring(0, target.length - 1));
            actual = parseFloat(actual.substring(0, actual.length - 1));
            var percent = actual / target;
            var colour = "#666666";
            Intranet.drawGraph(ctx, percent, colour);
        },

        write: function() {
            Intranet.writeJson("teamSatisfaction", this.collection, true);
        }
    });

    Intranet.DeadlineView = Backbone.View.extend({
        tagName: "div",
        template: _.template($("#deadlineTemplate").html()),
        editTemplate: _.template($("#deadlineEditTemplate").html()),

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        events: {
            "click button.delete": "del",
            "click button.edit": "editData",
            "click button.save": "saveEdit",
            "click button.cancel": "cancelEdit"
        },

        del: function() {
            this.model.destroy();
            this.remove();
        },

        editData: function() {
            this.$el.html(this.editTemplate(this.model.toJSON()));
        },

        saveEdit: function(e) {
            e.preventDefault();
            var formData = {};
            $(e.target).closest("form").find(":input").not("button").each(function() {
                var el = $(this);
                formData[el.attr("class")] = el.val();
            });
            this.model.set(formData);
            this.render();
        },

        cancelEdit: function() {
            this.render();
        }
    });

    Intranet.DeadlineListView = Backbone.View.extend({
        el: "#deadlines",

        initialize: function() {
            this.collection = Intranet.collections.deadlineList;
            this.collection.comparator = Intranet.dateSort;
            this.collection.sort();
            this.render();
            var models = this.collection.models;
            for (var i = 0; i < models.length; i++) {
                models[i].on("change", this.write, this);
            }
            this.collection.on("add", this.renderDeadline, this);
            this.collection.on("add", this.write, this);
            this.collection.on("remove", this.write, this);
            this.showForm();
        },

        events: {
            "click .add": "add",
            "click #showDeadlineForm": "showForm"
        },

        render: function() {
            var that = this;
            _.each(this.collection.models, function(item) {
                that.renderDeadline(item);
            }, this);
            return this;
        },

        renderDeadline: function(item) {
            var deadlineView = new Intranet.DeadlineView({
                model: item
            });
            this.$el.append(deadlineView.render().el);
        },

        add: function(e) {
            e.preventDefault();

            var newModel = {};
            $("#addDeadline").children("input").each(function(i, el) {
                if ($(el).val() !== "") {
                    newModel[el.id] = $(el).val();
                }
            });

            this.collection.add(new Intranet.Deadline(newModel));
        },

        showForm: function() {
            this.$el.find("#addDeadline").slideToggle();
        },

        write: function() {
            Intranet.writeJson("deadlines", this.collection, true);
        },

        writeTemp: function() {
            Intranet.writeJson("deadlines", this.collection, false);
        }
    });

    Intranet.NewsView = Backbone.View.extend({
        tagName: "div",
        template: _.template($("#newsTemplate").html()),
        editTemplate: _.template($("#newsEditTemplate").html()),

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        events: {
            "click button.delete": "del",
            "click button.edit": "editData",
            "click button.save": "saveEdit",
            "click button.cancel": "cancelEdit"
        },

        del: function() {
            this.model.destroy();
            this.remove();
        },

        editData: function() {
            this.$el.html(this.editTemplate(this.model.toJSON()));
        },

        saveEdit: function(e) {
            e.preventDefault();
            var formData = {};
            $(e.target).closest("form").find(":input").not("button").each(function() {
                var el = $(this);
                formData[el.attr("class")] = el.val();
            });
            this.model.set(formData);
            this.render();
        },

        cancelEdit: function() {
            this.render();
        }
    });

    Intranet.NewsListView = Backbone.View.extend({
        el: "#news_feed",

        initialize: function() {
            this.collection = Intranet.collections.newsList;
            this.collection.comparator = Intranet.reverseDateSort;
            this.collection.sort();
            this.render();
            var models = this.collection.models;
            for (var i = 0; i < models.length; i++) {
                models[i].on("change", this.write, this);
            }
            this.collection.on("add", this.renderNews, this);
            this.collection.on("add", this.write, this);
            this.collection.on("remove", this.write, this);
            this.showForm();
        },

        events: {
            "click .add": "add",
            "click #showNewsForm": "showForm"
        },

        render: function() {
            var that = this;
            _.each(this.collection.models, function(item) {
                that.renderNews(item);
            }, this);
            return this;
        },

        renderNews: function(item) {
            var newsView = new Intranet.NewsView({
                model: item
            });
            this.$el.append(newsView.render().el);
        },

        add: function(e) {
            e.preventDefault();

            var newModel = {};
            $("#addNews").children("input").each(function(i, el) {
                if ($(el).val() !== "") {
                    newModel[el.id] = $(el).val();
                }
            });

            this.collection.add(new Intranet.News(newModel));
        },

        showForm: function() {
            this.$el.find("#addNews").slideToggle();
        },

        write: function() {
            Intranet.writeJson("newsFeed", this.collection, true);
        },

        writeTemp: function() {
            Intranet.writeJson("newsFeed", this.collection, false);
        }
    });

    Intranet.LinkView = Backbone.View.extend({
        tagName: "div",
        template: _.template($("#linkTemplate").html()),
        editTemplate: _.template($("#linkEditTemplate").html()),

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        events: {
            "click button.delete": "del",
            "click button.edit": "editData",
            "click button.save": "saveEdit",
            "click button.cancel": "cancelEdit"
        },

        del: function() {
            this.model.destroy();
            this.remove();
        },

        editData: function() {
            this.$el.html(this.editTemplate(this.model.toJSON()));
        },

        saveEdit: function(e) {
            e.preventDefault();
            var formData = {};
            $(e.target).closest("form").find(":input").not("button").each(function() {
                var el = $(this);
                formData[el.attr("class")] = el.val();
            });
            this.model.set(formData);
            this.render();
        },

        cancelEdit: function() {
            this.render();
        }
    });

    Intranet.LinkListView = Backbone.View.extend({
        el: "#useful_links",

        initialize: function() {
            this.collection = Intranet.collections.linkList;
            this.render();
            var models = this.collection.models;
            for (var i = 0; i < models.length; i++) {
                models[i].on("change", this.write, this);
            }
            this.collection.on("add", this.renderLink, this);
            this.collection.on("add", this.write, this);
            this.collection.on("remove", this.write, this);
            this.showForm();
        },

        events: {
            "click .add": "add",
            "click #showLinkForm": "showForm"
        },

        render: function() {
            var that = this;
            _.each(this.collection.models, function(item) {
                that.renderLink(item);
            }, this);
        },

        renderLink: function(item) {
            var linkView = new Intranet.LinkView({
                model: item
            });
            this.$el.append(linkView.render().el);
        },

        add: function(e) {
            e.preventDefault();

            var newModel = {};
            $("#addLink").children("input").each(function(i, el) {
                if ($(el).val() !== "") {
                    newModel[el.id] = $(el).val();
                }
            });

            this.collection.add(new Intranet.UsefulLink(newModel));
        },

        showForm: function() {
            this.$el.find("#addLink").slideToggle();
        },

        write: function() {
            Intranet.writeJson("usefulLinks", this.collection, true);
        },

        writeTemp: function() {
            Intranet.writeJson("usefulLinks", this.collection, false);
        }
    });

    Intranet.ProductView = Backbone.View.extend({
        tagName: "div",
        template: _.template($("#productTemplate").html()),
        editTemplate: _.template($("#productEditTemplate").html()),

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        events: {
            "click button.delete": "del",
            "click button.edit": "editData",
            "click button.save": "saveEdit",
            "click button.cancel": "cancelEdit"
        },

        del: function() {
            this.model.destroy();
            this.remove();
        },

        editData: function() {
            this.$el.html(this.editTemplate(this.model.toJSON()));
        },

        saveEdit: function(e) {
            e.preventDefault();
            var formData = {};
            $(e.target).closest("form").find(":input").not("button").each(function() {
                var el = $(this);
                formData[el.attr("class")] = el.val();
            });
            this.model.set(formData);
            this.render();
        },

        cancelEdit: function() {
            this.render();
        }
    });

    Intranet.ProductListView = Backbone.View.extend({
        render: function() {
            var that = this;
            _.each(this.collection.models, function(item) {
                that.renderProduct(item);
            }, this);
        },

        renderProduct: function(item) {
            var productView = new Intranet.ProductView({
                model: item
            });
            this.$el.append(productView.render().el);
        }
    });

    Intranet.StartUpListView = Intranet.ProductListView.extend({
        el: "#start_up",

        initialize: function() {
            this.collection = Intranet.collections.startUpList;
            this.render();
            var models = this.collection.models;
            for (var i = 0; i < models.length; i++) {
                models[i].on("change", this.write, this);
            }
            this.collection.on("add", this.renderProduct, this);
            this.collection.on("add", this.write, this);
            this.collection.on("remove", this.write, this);
            this.showForm();
        },

        events: {
            "click .add": "add",
            "click #showStartUpForm": "showForm"
        },

        add: function(e) {
            e.preventDefault();

            var newModel = {};
            $("#addStartUp").children("input").each(function(i, el) {
                if ($(el).val() !== "") {
                    newModel[el.id] = $(el).val();
                }
            });

            this.collection.add(new Intranet.Product(newModel));
            this.collection.sort();
        },

        showForm: function() {
            this.$el.find("#addStartUp").slideToggle();
        },

        write: function() {
            Intranet.writeJson("startUp", this.collection, true);
        },

        writeTemp: function() {
            Intranet.writeJson("startUp", this.collection, false);
        }
    });

    Intranet.OperationalListView = Intranet.ProductListView.extend({
        el: "#operational",

        initialize: function() {
            this.collection = Intranet.collections.operationalList;
            this.render();
            var models = this.collection.models;
            for (var i = 0; i < models.length; i++) {
                models[i].on("change", this.write, this);
            }
            this.collection.on("add", this.renderProduct, this);
            this.collection.on("add", this.write, this);
            this.collection.on("remove", this.write, this);
            this.showForm();
        },

        events: {
            "click .add": "add",
            "click #showOperationalForm": "showForm"
        },

        add: function(e) {
            e.preventDefault();

            var newModel = {};
            $("#addOperational").children("input").each(function(i, el) {
                if ($(el).val() !== "") {
                    newModel[el.id] = $(el).val();
                }
            });

            this.collection.add(new Intranet.Product(newModel));
        },

        showForm: function() {
            this.$el.find("#addOperational").slideToggle();
        },

        write: function() {
            Intranet.writeJson("operational", this.collection, true);
        },

        writeTemp: function() {
            Intranet.writeJson("operational", this.collection, false);
        }
    });

    Intranet.PassiveListView = Intranet.ProductListView.extend({
        el: "#passive",

        initialize: function() {
            this.collection = Intranet.collections.passiveList;
            this.render();
            var models = this.collection.models;
            for (var i = 0; i < models.length; i++) {
                models[i].on("change", this.write, this);
            }
            this.collection.on("add", this.renderProduct, this);
            this.collection.on("add", this.write, this);
            this.collection.on("remove", this.write, this);
            this.showForm();
        },

        events: {
            "click .add": "add",
            "click #showPassiveForm": "showForm"
        },

        add: function(e) {
            e.preventDefault();

            var newModel = {};
            $("#addPassive").children("input").each(function(i, el) {
                if ($(el).val() !== "") {
                    newModel[el.id] = $(el).val();
                }
            });

            this.collection.add(new Intranet.Product(newModel));
        },

        showForm: function() {
            this.$el.find("#addPassive").slideToggle();
        },

        write: function() {
            Intranet.writeJson("passive", this.collection, true);
        },

        writeTemp: function() {
            Intranet.writeJson("passive", this.collection, false);
        }
    });

    Intranet.EndGameIntranetView = Backbone.View.extend({
        initialize: function() {
            Intranet.collections = new Intranet.Collections();
            Intranet.collections.fetchCollections(Intranet.jsonData);
            this.render();
        },

        render: function() {
            var bugetView = new Intranet.BudgetView();
            var investmentView = new Intranet.InvestmentView();
            var teamSatisfactionView = new Intranet.TeamSatisfactionView();
            var deadlineListView = new Intranet.DeadlineListView();
            var newsListView = new Intranet.NewsListView();
            var linkListView = new Intranet.LinkListView();
            var startUpListView = new Intranet.StartUpListView();
            var operationalListView = new Intranet.OperationalListView();
            var passiveListView = new Intranet.PassiveListView();
            return this;
        }
    });

    Intranet.View = Backbone.View.extend({

        initialize: function() {
            if (!this.$el.hasClass('modal')) {
                $('section').hide();
            }

            this.$el.show();
        },
    });

    Intranet.Login = Intranet.View.extend({

        events: {
            'click .login a': 'login',
            'click .signup a': 'signup'
        },

        el: '#Login',

        login: function() {
            hoist.login(this.$('#EmailAddress').val(), this.$('#Password').val(), function() {
                console.log("login successful");
                hoist.getData(function(data) {
                    $('section').hide();
                    Intranet.jsonData = data;
                    new Intranet.EndGameIntranetView();
                }, function() {
                    console.log("data get unsuccessful");
                });
            }, function() {
                console.log("login unsuccessful");
            });
            return false;

        },
        signup: function() {
            $('section').hide();
            new Intranet.SignUp();
        }

    });

    Intranet.SignUp = Intranet.View.extend({
        events: {
            'click .login a': 'login',
            'click .signup a': 'signup'
        },

        el: '#SignUp',

        signup: function() {
            hoist.signup(this.$('#Name').val(), this.$('#EmailAddress').val(), this.$('#Password').val(), function() {
                console.log("signup successful");
                hoist.getData(function(data) {
                    $('section').hide();
                    Intranet.jsonData = data;
                    new Intranet.EndGameIntranetView();
                }, function() {
                    console.log("data get unsuccessful");
                });
            }, function() {
                console.log("signup unsuccessful");
            });
            return false;
        },

        login: function() {
            $('section').hide();
            new Intranet.Login();
        }
    });

    return Intranet;
});