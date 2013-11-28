define(['intranet', 'backbone', "jquery", "hoist"], function(Intranet, Backbone, $, hoist) {
    'use strict';

    Intranet.GraphData = Backbone.Model.extend({
        defaults: {
            dataTitle: "",
            data: ""
        }
    });

    Intranet.GraphDataList = Backbone.Collection.extend({
        model: Intranet.GraphData
    });

    Intranet.Deadline = Backbone.Model.extend({
        defaults: {
            date: "",
            task: ""
        }
    });

    Intranet.DeadlineList = Backbone.Collection.extend({
        model: Intranet.Deadline
    });

    Intranet.News = Backbone.Model.extend({
        defaults: {
            date: "",
            news: "",
            author: ""
        }
    });

    Intranet.NewsList = Backbone.Collection.extend({
        model: Intranet.News
    });

    Intranet.UsefulLink = Backbone.Model.extend({
        defaults: {
            link: "",
            name: "",
            description: ""
        }
    });

    Intranet.LinkList = Backbone.Collection.extend({
        model: Intranet.UsefulLink
    });

    Intranet.Product = Backbone.Model.extend({
        defaults: {
            name: "",
            dots: "",
            description: ""
        }
    });

    Intranet.ProductList = Backbone.Collection.extend({
        model: Intranet.Product
    });

    Intranet.Collections = Backbone.Model.extend({
        fetchCollections: function(data) {
            this.budgetList = new Intranet.GraphDataList(data.budget);
            this.investmentList = new Intranet.GraphDataList(data.investment);
            this.teamSatisfactionList = new Intranet.GraphDataList(data.teamSatisfaction);
            this.deadlineList = new Intranet.DeadlineList(data.deadlines);
            this.newsList = new Intranet.NewsList(data.newsFeed);
            this.linkList = new Intranet.LinkList(data.usefulLinks);
            this.startUpList = new Intranet.ProductList(data.startUp);
            this.operationalList = new Intranet.ProductList(data.operational);
            this.passiveList = new Intranet.ProductList(data.passive);
        }
    });

    return Intranet;
});