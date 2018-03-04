tableDetail/* eslint-env browser */

import Halyard from 'halyard.js';
import angular from 'angular';
import enigma from 'enigma.js';
import enigmaMixin from 'halyard.js/dist/halyard-enigma-mixin';
import qixSchema from 'enigma.js/schemas/3.2.json';
import template from './app.html';
import Displayhandler from './displayHandler';

const halyard = new Halyard();


angular.module('app', []).component('app', {
  bindings: {},
  controller: ['$scope', '$q', '$http', function Controller($scope, $q, $http) {
    $scope.dataSelected = false;
    $scope.showFooter = false;

    $scope.toggleFooter = () => {
      $scope.showFooter = !$scope.showFooter;
      if (!$scope.showFooter && $scope.dataSelected) {
        this.clearAllSelections();
      }
    };

    $scope.openGithub = () => {
      window.open('https://github.com/newmans99');
    };

    this.connected = false;
    this.painted = false;
    this.connecting = true;

    let object = null;
    let app = null;

// This section enables the footer details to be displayed, change the
//   Movie field to represent your key/id field in your data.
    const select = (value) => {
      app.getField('Movie').then((field) => {
        field.select(value).then(() => {
          $scope.dataSelected = true;
          this.getDetails().then(() => {
            $scope.showFooter = true;
          });
        });
      });
    };

    const displayHandler = new Displayhandler();

    const paintDisplay = (layout) => {
      displayHandler.paintDisplay(document.getElementById('master-container'), layout, {
        select,
        clear: () => this.clearAllSelections(),
        hasSelected: $scope.dataSelected,
      });
      this.painted = true;
    };


    this.generateGUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      // eslint-disable-next-line no-bitwise
      const r = Math.random() * 16 | 0;
      // eslint-disable-next-line no-bitwise
      const v = c === 'x' ? r : ((r & 0x3) | 0x8);
      return v.toString(16);
    });

    this.$onInit = () => {
      const config = {
        Promise: $q,
        schema: qixSchema,
        mixins: enigmaMixin,
        url: `ws://192.168.56.66:19076/app/${this.generateGUID()}`,
      };

      // Add local master data
      const filePathMaster = '/data/movies.csv';
      const tableMaster = new Halyard.Table(filePathMaster, {
        name: 'Master',
//        fields: [
//          { src: 'Movie', name: 'Movie' },
//          { src: 'Year', name: 'Year' },
//          { src: 'Adjusted Costs', name: 'Adjusted Costs' },
//          { src: 'Description', name: 'Description' },
//          { src: 'Image', name: 'Image' }
        ],
        delimiter: ',',
      });
      halyard.addTable(tableMaster);

      // Add local detail data
      const filePathDetail = '/data/movieinfo.csv';
      const tableDetail = new Halyard.Table(filePathDetail, {
        name: 'Details',
        delimiter: ';',
        characterSet: 'utf8'
      });
      halyard.addTable(tableDetails);

      //Define Qlik Core application with halyard data above.
      enigma.create(config).open().then((qix) => {
        this.connected = true;
        this.connecting = false;
        qix.createSessionAppUsingHalyard(halyard).then((result) => {
app = result;
          result.getAppLayout()
            .then(() => {
              const masterProperties = {
                qInfo: {
                  qType: 'masterResults',
                  qId: '',
                },
                type: 'my-master-results',
                labels: true,
                qHyperCubeDef: {
                  qDimensions: [{
                    qDef: {
                      qFieldDefs: ['Movie'],
                      qSortCriterias: [{
                        qSortByAscii: 1,
                      }],
                    }},{
                    qDef: {
                      qFieldDefs: ["=text(floor([Year]/10)*10) & chr(39) & 's'"],
                      qLabel: 'Decade',
                      qFallbackTitle: 'Decade',
                      qSortCriterias: [{
                        qSortByAscii: 1,
                      }],
                    }
                  }],
                  qMeasures: [{
                    qDef: {
                      qDef: '[Adjusted Costs]',
                      qLabel: 'Adjusted cost ($)',
                    },
                    qSortBy: {
                      qSortByNumeric: -1,
                    },
                  },
                  {
                    qDef: {
                      qDef: '[imdbRating]',
                      qLabel: 'imdb rating',
                    },
                  }],
                  qInitialDataFetch: [{
                    qTop: 0, qHeight: 50, qLeft: 0, qWidth: 4,
                  }],
                  qSuppressZero: false,
                  qSuppressMissing: true,
                },
              };

              //Create the session application
              result.createSessionObject(masterProperties).then((model) => {
                object = model;
                const update = () => object.getLayout().then((layout) => {
                  paintDisplay(layout);
                });

                object.on('changed', update);
                update();
              });
            });
        }, () => {
          this.error = 'Could not create session app';
          this.connected = false;
          this.connecting = false;
        });
      }, () => {
        this.error = 'Could not connect to QIX Engine';
        this.connecting = false;
      });
    };

    this.clearAllSelections = () => {
      if ($scope.dataSelected) {
        $scope.dataSelected = false;
        app.clearAll();
      }
      $scope.showFooter = false;
    };


    //may not be 100% efficient without jQuery, but it works for a demo...
    window.onresize = function(e) {
      delay(function(){
        const update = () => object.getLayout().then((layout) => {
          paintDisplay(layout);
        });
        update();
      }, 250);
    }

    var delay = (function(){
    	var timer = 0;
    	return function(callback, ms){
    		clearTimeout (timer);
    		timer = setTimeout(callback, ms);
    	};
    })();


    this.getDetails = () => {
      const tableProperties = {
        qInfo: {
          qType: 'detailResults',
          qId: '',
        },
        type: 'my-detail-results',
        labels: true,
        qHyperCubeDef: {
          qDimensions: [{
            qDef: {
              qFieldDefs: ['Movie'],
            },
          },
          {
            qDef: {
              qFieldDefs: ['Image'],
            },
          },
          {
            qDef: {
              qFieldDefs: ['Year'],
            },
          },
          {
            qDef: {
              qFieldDefs: ['Genre'],
            },
          },
          {
            qDef: {
              qFieldDefs: ['Description'],
            },
          },
          ],
          qInitialDataFetch: [{
            qTop: 0, qHeight: 50, qLeft: 0, qWidth: 50,
          }],
          qSuppressZero: false,
          qSuppressMissing: true,
        },
      };
      return app.createSessionObject(tableProperties)
        .then(model => model.getLayout()
          .then((layout) => { Displayhandler.showDetails(layout); }));
    };
  }],
  template,
});

angular.bootstrap(document, ['app']);
