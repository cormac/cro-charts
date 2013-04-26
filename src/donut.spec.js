describe('donut chart test suite', function () {
  var testData,
      inputData;
  beforeEach(function() {
    inputData = [
      {
        score: 63, 
        quartile: 1,
        userId: 1
      },
      {
        score: 45, 
        quartile: 2,
        userId: 1
      },
    ];
    testData = [
      {
        userId: 1,
        quartile: 1,
        scoreData: [
          {
            population: 37,
            label: 'not-match'
          }, 
          {
            population: 63,
            label: 'match'
          } 
        ]
      },
      {
        userId: 2,
        quartile: 2,
        scoreData: [
          {
            population: 55,
            label: 'not-match'
          }, 
          {
            population: 45,
            label: 'match'
          } 
        ]
      }
    ];
  });

  afterEach(function() {
    //clear the donuts after each test
    var donutDivs = document.querySelectorAll('.donut');
    _.each(donutDivs, function(element, index, list) {
      while(element.lastChild) {
        element.removeChild(element.lastChild);
      }
    });
  });
  
  it( 'should calculate the width of percentage number strings correctly', function() {
    var number = 76;
    var numberString = '85';
    expect(SQ.Utils.KernCalculator(number)).toEqual(31);
    expect(SQ.Utils.KernCalculator(numberString)).toEqual(34);
    expect(SQ.Utils.KernCalculator(numberString, true)).toEqual(42);
  });

  it( 'should format the data correctly', function() {
    var formattedData = SQ.Utils.DataFormatter(inputData);
    expect(formattedData[0].quartile)
                     .toEqual(testData[0].quartile);
    expect(formattedData[0].scoreData[0].population)
                     .toEqual(testData[0].scoreData[0].population);
    expect(formattedData[0].scoreData[0].label)
                     .toEqual(testData[0].scoreData[0].label);
  });
  it( 'should append an svg', function() {
    SQ.Charts.Donut.createDonutCharts(testData);
    var svgTags = document.getElementsByTagName('svg');
    expect(svgTags.length).toBeGreaterThan(0);
  });

  it ('should append an svg to the correct div', function() {
    SQ.Charts.Donut.createDonutCharts(testData);
    var donutDivOne = _.last(document.querySelectorAll('.donut-user-1'));
    // each donut div should only have one svg donut associated with it
    expect(donutDivOne.children.length).toEqual(1);
  });
});
