OpenDisclosure.CandidateView = Backbone.View.extend({

  template: _.template("<div id='candidate'>\
    <h1><%= attributes.short_name %></h1>\
    <section class='candidateDetails clearfix'>\
        <div class='col-sm-4'>\
          <img class='mayor-picture' src='<%= attributes.imagePath %>' /> \
        </div>\
        <div class='col-sm-4'>\
          <p>Party Affiliation: <%= attributes.party_affiliation %></p>\
          <p><%= attributes.profession %></p>\
          <p><a id='twitter' href='https://twitter.com/'+ <%= attributes.twitter %>><%= attributes.twitter %></a></p>\
          <p><%= attributes.bio %></p>\
        </div>\
        <div class='col-sm-4'>\
          <% if (typeof attributes.summary !== 'undefined') { %>\
          <p>Total Raised:  <%= friendlySummaryNumber('total_contributions_received') %></p>\
          <p>Total Expenditures: <%= friendlySummaryNumber('total_expenditures_made') %></p>\
          <p>Ending Cash On Hand: <%= friendlySummaryNumber('ending_cash_balance') %></p>\
          <p>Last Updated: <%= attributes.summary.last_summary_date %> </p>\
          <% } %>\
      </section>\
      <section class='clearfix'><div id = 'category'></div></section>\
      <section class='clearfix'><div id = 'topContributors'></div></section>\
      <section class='clearfix'><div id = 'contributors'></div></section>\
     "),

  initialize: function(){
    if (this.model) {
      this.model.attributes.imagePath = this.model.imagePath();
      this.render();}
    else {
      app.navigate('',true);
    }
  },

  render: function(){
    this.updateNav();
    this.$el.html(this.template(this.model));

    if (app.employerContributions.loaded) {
      this.renderTopContributors();
    } else {
      this.listenTo(app.employerContributions, 'sync', this.renderTopContributors);
    }

    if (app.categoryContributions.loaded) {
      renderCategoryChart();
    } else {
      this.listenTo(app.categoryContributions, 'sync', this.renderCategoryChart);
    }

    if (app.contributions.loaded) {
      this.renderAllContributions();
    } else {
      this.listenTo(app.contributions, 'sync', this.renderAllContributions);
    }

  },

  renderTopContributors: function(){
    // Filter contributors based on cadidateId
    var count = 0;
    var candidateId = this.model.attributes.id;
    this.topContributions = _.filter(app.employerContributions.models, function(c) {
      return (c.attributes.recipient_id == candidateId) && (++count <= 10);
    });

    // Create a new subview
    new OpenDisclosure.TopContributorsView({
      el: "#topContributors",
      collection: this.topContributions
    });
  },

  renderCategoryChart: function() {
    var candidateId = this.model.attributes.id;
    this.categories = _.filter(app.categoryContributions.models, function(c) {
      return c.attributes.recipient_id == candidateId;
    });

    new OpenDisclosure.CategoryView({
      el: '#category',
      collection: this.categories,
      summary: this.model.attributes.summary
    });
  },

  renderAllContributions: function(){
    var candidateId = this.model.attributes.id;
    this.filteredContributions = _.filter(app.contributions.models, function(c) {
      return c.attributes.recipient.id == candidateId;
    });

    new OpenDisclosure.ContributorsView({el: "#contributors",
      collection: this.filteredContributions,
      headline: 'Contributions'
    });
  },

  updateNav: function(){
    $('.sidebar li').removeClass('active');
    $('#nav-'+this.model.attributes.id).addClass('active');
  }

});
