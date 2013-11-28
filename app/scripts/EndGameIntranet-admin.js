$(function() {

    function shadeColor(color, percent) {
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
    }

    function drawGraph(ctx, percent, colour) {
        do {
            ctx.beginPath();
            ctx.arc(100, 100, 80, Math.PI * 3 / 2 + 2 * Math.PI * percent, Math.PI * 3 / 2, true);
            ctx.arc(100, 100, 100, Math.PI * 3 / 2, Math.PI * 3 / 2 + 2 * Math.PI * percent);
            ctx.fillStyle = colour;
            ctx.fill();
            colour = shadeColor(colour, -40);
            percent -= 1;
        } while (percent > 0);
    }

    function writeFullJson() {
        jsonData = {};
        jsonData.budget = collections.budgetList.toJSON();
        jsonData.investment = collections.investmentList.toJSON();
        jsonData.teamSatisfaction = collections.teamSatisfactionList.toJSON();
        jsonData.deadlines = collections.deadlineList.toJSON();
        jsonData.newsFeed = collections.newsList.toJSON();
        jsonData.usefulLinks = collections.linkList.toJSON();
        jsonData.startUp = collections.startUpList.toJSON();
        jsonData.operational = collections.operationalList.toJSON();
        jsonData.passive = collections.passiveList.toJSON();
        post();
    }

    function writeJson(item, list, toPost) {
        jsonData[item] = list.toJSON();
        if (toPost) {
            post();
        } else {
            console.log(jsonData);
        }
    }

    function post() {
        $.ajax({
            url: "https://data.hoi.io/EndGamePortal/data",
            type: "POST",
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            headers: {
                "Authorization": "Hoist NTUOLFDMGAPGMVT[LOIX"
            },
            data: jsonData,
            success: function() {
                console.log("data post successful");
            },
            error: function() {
                console.log("data post unsuccessful");
            }
        });
    }

    var dateSort = function(model1, model2) {
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

    var reverseDateSort = function(model1, model2) {
        return dateSort(model2, model1);
    };

    var GraphData = Backbone.Model.extend({
        defaults: {
            dataTitle: "",
            data: ""
        }
    });

    var GraphDataList = Backbone.Collection.extend({
        model: GraphData
    });

    var GraphDataView = Backbone.View.extend({
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
            var formData = {},
                prev = this.model.previousAttributes();
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

    var BudgetView = Backbone.View.extend({
        el: "#budget",

        initialize: function() {
            this.collection = collections.budgetList;
            this.render();
            var models = this.collection.models;
            for (var i = 0; i < models.length; i++) {
                models[i].on("change", this.renderGraph, this);
                models[i].on("change", this.write, this);
            }
        },

        render: function() {
            var that = this;
            _.each(this.collection.models, function(item) {
                that.renderGraphData(item);
            }, this);
            this.renderGraph();
            return this;
        },

        renderGraphData: function(item) {
            var graphDataView = new GraphDataView({
                model: item
            });
            this.$el.append(graphDataView.render().el);
        },

        renderGraph: function() {
            var c = document.getElementById("budget_canvas");
            var ctx = c.getContext("2d");
            var target = this.collection.models[0].get("data");
            var actual = this.collection.models[1].get("data");
            target = parseFloat(target.substring(1, target.length));
            actual = parseFloat(actual.substring(1, actual.length));
            percent = actual / target;
            var colour = "#80C99C";
            drawGraph(ctx, percent, colour);
        },

        write: function() {
            writeJson("budget", this.collection, true);
        }
    });

    var InvestmentView = Backbone.View.extend({
        el: "#investment",

        initialize: function() {
            this.collection = collections.investmentList;
            this.render();
            var models = this.collection.models;
            for (var i = 0; i < models.length; i++) {
                models[i].on("change", this.renderGraph, this);
                models[i].on("change", this.write, this);
            }
        },

        render: function() {
            var that = this;
            _.each(this.collection.models, function(item) {
                that.renderGraphData(item);
            }, this);
            this.renderGraph();
            return this;
        },

        renderGraphData: function(item) {
            var graphDataView = new GraphDataView({
                model: item
            });
            this.$el.append(graphDataView.render().el);
        },

        renderGraph: function() {
            var c = document.getElementById("investment_canvas");
            var ctx = c.getContext("2d");
            ctx.beginPath();
            var target = this.collection.models[1].get("data");
            var actual = this.collection.models[0].get("data");
            target = parseFloat(target.substring(0, target.length - 1));
            actual = parseFloat(actual.substring(0, actual.length - 1));
            percent = actual / target;
            var colour = "#D82253";
            drawGraph(ctx, percent, colour);
        },

        write: function() {
            writeJson("investment", this.collection, true);
        }
    });

    var TeamSatisfactionView = Backbone.View.extend({
        el: "#team_satisfaction",

        initialize: function() {
            this.collection = collections.teamSatisfactionList;
            this.render();
            var models = this.collection.models;
            for (var i = 0; i < models.length; i++) {
                models[i].on("change", this.renderGraph, this);
                models[i].on("change", this.write, this);
            }

        },

        render: function() {
            var that = this;
            _.each(this.collection.models, function(item) {
                that.renderGraphData(item);
            }, this);
            this.renderGraph();
            return this;
        },

        renderGraphData: function(item) {
            var graphDataView = new GraphDataView({
                model: item
            });
            this.$el.append(graphDataView.render().el);
        },

        renderGraph: function() {
            var c = document.getElementById("team_satisfaction_canvas");
            var ctx = c.getContext("2d");
            var target = this.collection.models[0].get("data");
            var actual = this.collection.models[1].get("data");
            target = parseFloat(target.substring(0, target.length - 1));
            actual = parseFloat(actual.substring(0, actual.length - 1));
            percent = actual / target;
            var colour = "#666666";
            drawGraph(ctx, percent, colour);
        },

        write: function() {
            writeJson("teamSatisfaction", this.collection, true);
        }
    });

    var Deadline = Backbone.Model.extend({
        defaults: {
            date: "",
            task: ""
        }
    });

    var DeadlineList = Backbone.Collection.extend({
        model: Deadline
    });

    var DeadlineView = Backbone.View.extend({
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
            var formData = {},
                prev = this.model.previousAttributes();
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

    var DeadlineListView = Backbone.View.extend({
        el: "#deadlines",

        initialize: function() {
            this.collection = collections.deadlineList;
            this.collection.comparator = dateSort;
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
            var deadlineView = new DeadlineView({
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

            this.collection.add(new Deadline(newModel));
        },

        showForm: function() {
            this.$el.find("#addDeadline").slideToggle();
        },

        write: function() {
            writeJson("deadlines", this.collection, true);
        },

        writeTemp: function() {
            writeJson("deadlines", this.collection, false);
        }
    });

    var News = Backbone.Model.extend({
        defaults: {
            date: "",
            news: "",
            author: ""
        }
    });

    var NewsList = Backbone.Collection.extend({
        model: News
    });

    var NewsView = Backbone.View.extend({
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
            var formData = {},
                prev = this.model.previousAttributes();
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

    var NewsListView = Backbone.View.extend({
        el: "#news_feed",

        initialize: function() {
            this.collection = collections.newsList;
            this.collection.comparator = reverseDateSort;
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
            var newsView = new NewsView({
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

            this.collection.add(new News(newModel));
        },

        showForm: function() {
            this.$el.find("#addNews").slideToggle();
        },

        write: function() {
            writeJson("newsFeed", this.collection, true);
        },

        writeTemp: function() {
            writeJson("newsFeed", this.collection, false);
        }
    });

    var UsefulLink = Backbone.Model.extend({
        defaults: {
            link: "",
            name: "",
            description: ""
        }
    });

    var LinkList = Backbone.Collection.extend({
        model: UsefulLink
    });

    var LinkView = Backbone.View.extend({
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
            var formData = {},
                prev = this.model.previousAttributes();
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

    var LinkListView = Backbone.View.extend({
        el: "#useful_links",

        initialize: function() {
            this.collection = collections.linkList;
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
            return this;
        },

        renderLink: function(item) {
            var linkView = new LinkView({
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

            this.collection.add(new UsefulLink(newModel));
        },

        showForm: function() {
            this.$el.find("#addLink").slideToggle();
        },

        write: function() {
            writeJson("usefulLinks", this.collection, true);
        },

        writeTemp: function() {
            writeJson("usefulLinks", this.collection, false);
        }
    });

    var Product = Backbone.Model.extend({
        defaults: {
            name: "",
            dots: "",
            description: ""
        }
    });

    var ProductList = Backbone.Collection.extend({
        model: Product
    });

    var ProductView = Backbone.View.extend({
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
            var formData = {},
                prev = this.model.previousAttributes();
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

    var StartUpListView = Backbone.View.extend({
        el: "#start_up",

        initialize: function() {
            this.collection = collections.startUpList;
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

        render: function() {
            var that = this;
            _.each(this.collection.models, function(item) {
                that.renderProduct(item);
            }, this);
            return this;
        },

        renderProduct: function(item) {
            var productView = new ProductView({
                model: item
            });
            this.$el.append(productView.render().el);
        },

        add: function(e) {
            e.preventDefault();

            var newModel = {};
            $("#addStartUp").children("input").each(function(i, el) {
                if ($(el).val() !== "") {
                    newModel[el.id] = $(el).val();
                }
            });

            this.collection.add(new Product(newModel));
            this.collection.sort();
        },

        showForm: function() {
            this.$el.find("#addStartUp").slideToggle();
        },

        write: function() {
            writeJson("startUp", this.collection, true);
        },

        writeTemp: function() {
            writeJson("startUp", this.collection, false);
        }
    });

    var OperationalListView = Backbone.View.extend({
        el: "#operational",

        initialize: function() {
            this.collection = collections.operationalList;
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

        render: function() {
            var that = this;
            _.each(this.collection.models, function(item) {
                that.renderProduct(item);
            }, this);
            return this;
        },

        renderProduct: function(item) {
            var productView = new ProductView({
                model: item
            });
            this.$el.append(productView.render().el);
        },

        add: function(e) {
            e.preventDefault();

            var newModel = {};
            $("#addOperational").children("input").each(function(i, el) {
                if ($(el).val() !== "") {
                    newModel[el.id] = $(el).val();
                }
            });

            this.collection.add(new Product(newModel));
        },

        showForm: function() {
            this.$el.find("#addOperational").slideToggle();
        },

        write: function() {
            writeJson("operational", this.collection, true);
        },

        writeTemp: function() {
            writeJson("operational", this.collection, false);
        }
    });

    var PassiveListView = Backbone.View.extend({
        el: "#passive",

        initialize: function() {
            this.collection = collections.passiveList;
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

        render: function() {
            var that = this;
            _.each(this.collection.models, function(item) {
                that.renderProduct(item);
            }, this);
            return this;
        },

        renderProduct: function(item) {
            var productView = new ProductView({
                model: item
            });
            this.$el.append(productView.render().el);
        },

        add: function(e) {
            e.preventDefault();

            var newModel = {};
            $("#addPassive").children("input").each(function(i, el) {
                if ($(el).val() !== "") {
                    newModel[el.id] = $(el).val();
                }
            });

            this.collection.add(new Product(newModel));
        },

        showForm: function() {
            this.$el.find("#addPassive").slideToggle();
        },

        write: function() {
            writeJson("passive", this.collection, true);
        },

        writeTemp: function() {
            writeJson("passive", this.collection, false);
        }
    });

    var Collections = Backbone.Model.extend({

        fetchCollections: function(data) {
            this.budgetList = new GraphDataList(data.budget);
            this.investmentList = new GraphDataList(data.investment);
            this.teamSatisfactionList = new GraphDataList(data.teamSatisfaction);
            this.deadlineList = new DeadlineList(data.deadlines);
            this.newsList = new NewsList(data.newsFeed);
            this.linkList = new LinkList(data.usefulLinks);
            this.startUpList = new ProductList(data.startUp);
            this.operationalList = new ProductList(data.operational);
            this.passiveList = new ProductList(data.passive);
        }
    });

    var collections = "";

    var EndGameIntranetView = Backbone.View.extend({
        initialize: function() {
            collections = new Collections();
            collections.fetchCollections(jsonData);
            this.render();
        },

        render: function() {
            var bugetView = new BudgetView();
            var investmentView = new InvestmentView();
            var teamSatisfactionView = new TeamSatisfactionView();
            var deadlineListView = new DeadlineListView();
            var newsListView = new NewsListView();
            var linkListView = new LinkListView();
            var startUpListView = new StartUpListView();
            var operationalListView = new OperationalListView();
            var passiveListView = new PassiveListView();
            return this;
        }
    });

    var jsonData = "";
    $.ajax({
        url: "https://data.hoi.io/EndGamePortal/data",
        type: "GET",
        dataType: "json",
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        headers: {
            "Authorization": "Hoist NTUOLFDMGAPGMVT[LOIX"
        },
        success: function(data) {
            jsonData = data;
            var masterView = new EndGameIntranetView();
        },
        error: function() {
            console.log("data get unsuccessful");
        }
    });


}(jQuery));