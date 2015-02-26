OpenDisclosure.DailyContributionsChartView = OpenDisclosure.ChartView.extend({
  draw: function(el){
    var chart = this;
    chart.candidates = _.pluck(OpenDisclosure.BootstrappedData.candidates, "short_name");

    var svgWidth = chart.dimensions.width,
      svgHeight = chart.dimensions.height;

    // refold data for c3 - include name in each row
    // what it needs is one row per date, with each candidate name as a key and value as amount
    var rows = _.groupBy(
        _.flatten(
            _.map(chart.collection, function(v, k){
                var dates = _.map(v, function(row){
                    var data = {'date': row.date};
                    data[k] = row.amount;
                    return data;
                });
                return dates;
            })
        )
    , 'date')
    ;

    // merge all rows with the same date into a single object for that date
    // with all candidates
    rows = _.map(rows, function(v,i){
        return _.reduce(v, function(memo, row){
            return  _.extend(memo, row);
        }, {});
    })
    ;

    // map candidate names to colors.
    var colorMap = _.object(chart.candidates, ['#0087E5', '#26D5F5', '#A8E938', '#FED35E', '#FD2D2D', '#E1266C', '#DA9EE7', '#0A588f', '#8E34F4', '#2FB788', '#BA0012', '#B9A101', '#480A6A']);

    // make a container element
    d3.select(el).append('div')
        .attr('class', 'container');

    chart.chart = c3.generate({
        size: {
            height: svgHeight,
            width: svgWidth
        },
        bindto: '#' + el.id + ' .container',
        axis: {
            x: {
                type: 'timeseries',
                tick: {
                    format: '%Y-%m-%d'
                }
            },
            y: {
                min: 0,
                padding: {
                    bottom: 0
                },
                tick: {
                    format: d3.format("$,d")
                }
            }
        },
        point: {
            r: 0,
            focus: {
                expand: {
                    r: 6,
                }
            },
            // show: false,
        },
        line: {
            connectNull: true
        },
        data: {
            x: 'date',
            json: rows,
            keys: {
                value: chart.candidates.concat('date')
            },
            colors: colorMap
        }
    });

    chart.drawTitle();
  },

  drawTitle: function() {
    this.$el.prepend("<h3>Cumulative itemized campaign contributions</h3>");
    this.$el.append("<h5>The numbers in this graph are calculated from a different data set than the contributions table above. For more details, please check the <a href='faq'>FAQ</a>.</h5>");
  }
})
