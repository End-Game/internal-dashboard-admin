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

    function writeJson() {
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
        console.log(jsonData);
        post();
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
            "click button.edit": "editData",
            "click button.save": "saveEdit"
            // "click button.cancel": "cancelEdit"
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
            writeJson();
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
            }
        },

        render: function() {
            var that = this;
            _.each(this.collection.models, function(item) {
                that.renderGraphData(item);
            }, this);
            this.renderGraph();
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
            }
        },

        render: function() {
            var that = this;
            _.each(this.collection.models, function(item) {
                that.renderGraphData(item);
            }, this);
            this.renderGraph();
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
            }

        },

        render: function() {
            var that = this;
            _.each(this.collection.models, function(item) {
                that.renderGraphData(item);
            }, this);
            this.renderGraph();
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
        template: $("#deadlineTemplate").html(),

        render: function() {
            var tmpl = _.template(this.template);
            this.$el.html(tmpl(this.model.toJSON()));
            return this;
        }
    });

    var DeadlineListView = Backbone.View.extend({
        el: "#deadlines",

        initialize: function() {
            this.collection = collections.deadlineList;
            this.render();
        },

        render: function() {
            var that = this;
            _.each(this.collection.models, function(item) {
                that.renderDeadline(item);
            }, this);
        },

        renderDeadline: function(item) {
            var deadlineView = new DeadlineView({
                model: item
            });
            this.$el.append(deadlineView.render().el);
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
        template: $("#newsTemplate").html(),

        render: function() {
            var tmpl = _.template(this.template);
            this.$el.html(tmpl(this.model.toJSON()));
            return this;
        }
    });

    var NewsListView = Backbone.View.extend({
        el: "#news_feed",

        initialize: function() {
            this.collection = collections.newsList;
            this.render();
        },

        render: function() {
            var that = this;
            _.each(this.collection.models, function(item) {
                that.renderNews(item);
            }, this);
        },

        renderNews: function(item) {
            var newsView = new NewsView({
                model: item
            });
            this.$el.append(newsView.render().el);
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
        template: $("#linkTemplate").html(),

        render: function() {
            var tmpl = _.template(this.template);
            this.$el.html(tmpl(this.model.toJSON()));
            return this;
        }
    });

    var LinkListView = Backbone.View.extend({
        el: "#useful_links",

        initialize: function() {
            this.collection = collections.linkList;
            this.render();
        },

        render: function() {
            var that = this;
            _.each(this.collection.models, function(item) {
                that.renderLink(item);
            }, this);
        },

        renderLink: function(item) {
            var linkView = new LinkView({
                model: item
            });
            this.$el.append(linkView.render().el);
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
        template: $("#productTemplate").html(),

        render: function() {
            var tmpl = _.template(this.template);
            this.$el.html(tmpl(this.model.toJSON()));
            return this;
        }
    });

    var StartUpListView = Backbone.View.extend({
        el: "#start_up",

        initialize: function() {
            this.collection = collections.startUpList;
            this.render();
        },

        render: function() {
            var that = this;
            _.each(this.collection.models, function(item) {
                that.renderProduct(item);
            }, this);
        },

        renderProduct: function(item) {
            var productView = new ProductView({
                model: item
            });
            this.$el.append(productView.render().el);
        }
    });

    var OperationalListView = Backbone.View.extend({
        el: "#operational",

        initialize: function() {
            this.collection = collections.operationalList;
            this.render();
        },

        render: function() {
            var that = this;
            _.each(this.collection.models, function(item) {
                that.renderProduct(item);
            }, this);
        },

        renderProduct: function(item) {
            var productView = new ProductView({
                model: item
            });
            this.$el.append(productView.render().el);
        }
    });

    var PassiveListView = Backbone.View.extend({
        el: "#passive",

        initialize: function() {
            this.collection = collections.passiveList;
            this.render();
        },

        render: function() {
            var that = this;
            _.each(this.collection.models, function(item) {
                that.renderProduct(item);
            }, this);
        },

        renderProduct: function(item) {
            var productView = new ProductView({
                model: item
            });
            this.$el.append(productView.render().el);
        }
    });

    var Collections = Backbone.Model.extend({
        initialize: function() {
            this.fetchCollections();
        },

        fetchCollections: function() {
            this.budgetList = new GraphDataList(jsonData.budget);
            this.investmentList = new GraphDataList(jsonData.investment);
            this.teamSatisfactionList = new GraphDataList(jsonData.teamSatisfaction);
            this.deadlineList = new DeadlineList(jsonData.deadlines);
            this.newsList = new NewsList(jsonData.newsFeed);
            this.linkList = new LinkList(jsonData.usefulLinks);
            this.startUpList = new ProductList(jsonData.startUp);
            this.operationalList = new ProductList(jsonData.operational);
            this.passiveList = new ProductList(jsonData.passive);
        }
    });

    var collections = "";

    var EndGameIntranetView = Backbone.View.extend({
        initialize: function() {
            collections = new Collections();
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
            console.log(jsonData);
            var masterView = new EndGameIntranetView();
        },
        error: function() {
            console.log("data get unsuccessful");
        }
    });


}(jQuery));