/*global mx, mxui, mendix, dojo, require, console, define, module */

(function() {
    'use strict';

    // test
    require([

        'mxui/widget/_WidgetBase', 'mxui/mixin/_ValidationHelper', 'dijit/_Widget', 'dijit/_TemplatedMixin',
        'mxui/dom', 'dojo/dom', 'dojo/query', 'dojo/dom-prop', 'dojo/dom-geometry', 'dojo/dom-attr', 'dojo/dom-class', 'dojo/dom-style',  'dojo/dom-construct',  'dojo/on', 'dojo/_base/lang', 'dojo/_base/declare', 'dojo/text',
        'dojo/_base/array'

    ], function (_WidgetBase, _ValidationHelper, _Widget, _Templated, domMx, dom, domQuery, domProp, domGeom, domAttr, domClass, domStyle, domConstruct, on, lang, declare, text, array) {

        // Provide widget.
        dojo.provide('DateCalculator.widget.DateCalculator');

        // Declare widget.
        return declare('DateCalculator.widget.DateCalculator', [ _WidgetBase, _ValidationHelper, _Widget, _Templated], {

            // Template path
            templateString :'<div class="metric-container"><div class="main-metric"><label dojoAttachPoint="metricValue"></label></div><label class="metric-unit" dojoAttachPoint="metricUnit"></label></div>',
	       _hasStarted		    : false,

            /**
             * Mendix Widget methods.
             * ======================
             */

            // DOJO.WidgetBase -> PostCreate is fired after the properties of the widget are set.
            postCreate: function () {

                // Load CSS ... automaticly from ui directory

                // Setup widgets
                this._setupWidget();

                // Setup events
                this._setupEvents();

            },

            // DOJO.WidgetBase -> Startup is fired after the properties of the widget are set.
            startup: function () {

            },

            /**
             * What to do when data is loaded?
             */

            update: function (obj, callback) {

                this.removeError();

                if(this.handles){
                    array.forEach(this.handles, function (handle, i) {
                        mx.data.unsubscribe(handle);
                    });
                }
                //load embedded
                var loaded = false;
                var errorhandled = false;

                if (obj) {

                    this.mendixobject = obj;
                    try {
                        if (this.dateAttr !== '') {
                            
                            this._setupDateCalculator(obj);
                            loaded = true;
                            
                        }
                    }
                    catch (err) {
                        console.error(this.id +'.update: error while loading attr ' + err);
                        loaded = false;
                    }

                    var validationhandle = mx.data.subscribe({
                        guid     : obj.getGuid(),
                        val      : true,
                        callback : lang.hitch(this,function(validations) {
                            var val = validations[0],
                            msg = val.getReasonByAttribute(this.dateAttr);                                  
                            if (msg) {
                                this.addError(msg);
                                val.removeAttribute(this.dateAttr);
                            }
                        })
                    });

                    var refreshhandle = mx.data.subscribe({
                        guid     : obj.getGuid(),
                        callback : lang.hitch(this, function(guid) {
                            this.update(obj, callback);
                        })
                    });

                    var refreshAttHandle = mx.data.subscribe({
                        guid    : obj.getGuid(),
                        attr    : this.dateAttr,
                        callback : lang.hitch(this, function(guid) {
                            this.update(obj, callback);
                        })
                    });

                    this.handles = [validationhandle, refreshhandle, refreshAttHandle];

                } else {
                    console.log(this.id + '.update: received null object');
                }

                // Execute callback.
                if(typeof callback !== 'undefined'){
                    callback();
                }
            },
            
            //summary : stub function, will be used or replaced by the client environment
            onChange : function(){
                
                this.removeError();
            },
            
            uninitialize : function(){
                
                if(this.handles){
                    array.forEach(this.handles, function (handle, i) {
                        mx.data.unsubscribe(handle);
                    });
                }
            },


            /**
             * Extra setup widget methods.
             * ======================
             */
            _setupWidget: function () {

                this.mendixobject = null;
                this.handles = null;
                this.metricValue.innerHTML = "";
                this.metricUnit.innerHTML = "";

            },


            // Attach events to newly created nodes.
            _setupEvents: function () {

                console.log('DateCalculator - setup events');
                
            },


            /**
             * Interaction widget methods.
             * ======================
             */
            
            _setupDateCalculator : function(obj){
                
                var dateValue;
                
                //Get the date attribute
                dateValue = obj.get(this.dateAttr);
                dateValue = new Date(dateValue);
                
                //Get today's date            
                var currentDate = new Date();
                
                //Set time to 00:00:00
                currentDate.setHours(0,0,0,0);
                dateValue.setHours(0,0,0,0);
                
                //Initiate Date Calculator
                this._initDateCalculator(currentDate, dateValue);
                
            },
            
            _initDateCalculator : function(currentDate, dateVariable){
                
                // Is the date in the future
                if (currentDate < dateVariable){
            
                    var noOfDays = Math.round(this._dayDiff(currentDate,dateVariable));
                    this._daysOrMonths(noOfDays);
            
                }
                
                //Is the date today
                else if (this._datesEqual(currentDate, dateVariable)){
            
                    this.metricValue.innerHTML = "0";
                    this.metricUnit.innerHTML = "days";
            
                }
                
                //Is the date in the past
                else{
            
                    this.metricValue.innerHTML = this.expiredMsg;
                    this.metricUnit.innerHTML = this.expiredMetric;
                }
            },

            _dayDiff : function(currentDate, variableDate) {

                var oneDay = 24*60*60*1000;	// hours*minutes*seconds*milliseconds
                var diffDays = Math.abs((currentDate.getTime() - variableDate.getTime())/(oneDay));
        
                return diffDays;
            },
            
            _datesEqual : function(dateA, dateB){
                return this._dayDiff(dateA, dateB) == 0;
            },
            
            _daysOrMonths : function(noOfDays){
        
                if (noOfDays > this.maxDate){
                    
                    var noOfMonths = Math.floor(noOfDays/30);
                    this.metricValue.innerHTML = noOfMonths;
                    this.metricUnit.innerHTML = "months";
                }
        
                else{
                    this.metricValue.innerHTML = noOfDays;
                    
                    if (noOfDays == 1)
                    {
                        this.metricUnit.innerHTML = "day";
                    }
                    else{
                        this.metricUnit.innerHTML = "days";
                    }
                }
            },

        });
    });

}());
