/**
    DateCalculator Widget
    ========================

    @file      : DateCalculator.js
    @version   : 1.0.0
    @author    : Christopher James Hodges
    @date      : 25-02-2015
    @copyright : Mendix

    Documentation
    =============

*/
dojo.provide("DateCalculator.widget.DateCalculator");

mendix.widget.declare("DateCalculator.widget.DateCalculator", {
	addons: [
		dijit._Templated,
		mendix.addon._Contextable
	],
	
	inputargs: {
                    maxDate: '',
                    dateAttr: ''
	},
	
	templateString :'<div class="metric-container"><div class="main-metric"><label dojoAttachPoint="metricValue"></label></div><label class="metric-unit" dojoAttachPoint="metricUnit"></label></div>',
	_hasStarted		    : false,

	startup: function () {
        
        if (this._hasStarted)
            return;
  
        this.initContext();
        this.actLoaded();
    },

    update : function(obj, callback){
        
        this.setDataobject(obj);
        
        callback && callback();
    },
    
    setDataobject : function(dataobject) {

        var self = this;
        var object = dataobject;

        var dateValue = object.get(self.dateAttr);
        
        dateValue = new Date(dateValue);
        
        var currentDate = new Date(); 
        
        self.greaterThanToday(currentDate,dateValue);
         
    },
    
    daysOrMonths : function(noOfDays){
        
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
    
    greaterThanToday : function(currentDate, variableDate){
        
        if (currentDate < variableDate){
            
            var noOfDays = Math.round(this.dayDiff(currentDate,variableDate));
            this.daysOrMonths(noOfDays);
            
        }
        else{
            
            this.metricValue.innerHTML = "-";
            this.metricUnit.innerHTML = "days";
        }
    },
    
    dayDiff : function(currentDate, variableDate){
        
        var oneDay = 24*60*60*1000;	// hours*minutes*seconds*milliseconds
        var diffDays = Math.abs((currentDate.getTime() - variableDate.getTime())/(oneDay));
        
        return diffDays;
        
    },

    applyContext : function(context, callback){
        logger.debug(this.id + ".applyContext");
        
        if (context) {
            mx.processor.getObject(context.getActiveGUID(), dojo.hitch(this, this.setDataobject));        
            
        } else
            logger.warn(this.id + ".applyContext received empty context");

        if (context && !!context.getTrackId()) {
            var obj =  context.getTrackObject();
            
            if (obj != null){
                this.setDataobject(obj);
            }
            else {
                mx.processor.get({
                    guid : context.getTrackID(),
                    callback : this.setDataobject
                }, this);
                mx.data.subscribe({
                        guid    :  context.getTrackID(),
                        callback : dojo.hitch(this, this.setDataobjectGUID)
                });
            }
        }
        callback && callback();
    },

    setDataobjectGUID :function(objID){
            mx.processor.get({
                    guid : objID,
                    callback : this.setDataobject
                }, this);
    },


	uninitialize : function() {
		
	},
});