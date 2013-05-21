/**
* copyright stuff should go here to
*
* @author: bogdan.gradinariu@gmail.com
* @pluginName: myPlugin
* @description: a jquery plugin that does something
* @usage: 
*
*       //initialization
*       $('selector').myPlugin(options);
*
*       // method access (after initialization)
*       $('selector').myPlugin('destroy');
*
*       // raw api access (after initialization)
*       var api = $('selector').data('myPluginApi');
*       api.destroy();
*
*/
;(function(window, $, undefined){
 
    // name your plugin
    var pluginName = 'mySlideShowPlugin';
    var currentPosition = 0;
    var count = 0;    
    var process = false;
    var slideshow_length = 0;
    var timeout;
    // this is the api "class"
    function ApiClass(el, settings){
        this.el = el;
        this.$el = $(el);
        this.settings = settings;
        
        this._init();
    }
    
    // plugins must be very efficient so, make use of our oop knowledge 
    ApiClass.prototype = {
        
        _init : function(){
            this
                ._addDomElements()
                ._bindEventHandlers()
                // add a link to this api instance to the dom element
                .$el.data(this.settings.apiName, this);
        },

        destroy : function(){
            this
                ._removeDomElements()
                ._unbindEventHandlers()
                .$el.removeData(this.settings.apiName);
        },

        // utility function that sets the prefix to a given className
        _className : function(c){
            return this.settings.prefix + c;
        },

        // utility function that sets the namespace to a given event
        _event : function(ev){
            return ev + '.' + this.settings.namespace;
        },

        _addDomElements : function(){
        
            // to be implemented
            me = this;
            $('#' + this.settings.slidesContainer).css('overflow', 'hidden');
			$('.' + this.settings.itemTarget).wrapAll('<div id="slideInner"></div>')
				// Float left to display horizontally, readjust .slides width
				.css({
					'float' : 'left',
					'width' : me.settings.slideWidth
				});
            $('#slideInner').css('width', this.settings.slideWidth * parseInt($("." + this.settings.itemTarget).length));

            return this;
        },

        _removeDomElements : function(){
            $("[class*='"+ this.settings.prefix +"']", this.$el).remove();

            return this;
        },

        _bindEventHandlers : function(){
            // to be implemented

            // ex:            
            // this.$el.on(this._event('click'), this._className('next'), function(){});
            return this;
        },
		
		manageControls : function(position){
		
			numberOfSlides = parseInt($("." + this.settings.itemTarget).length);	
			//console.log(position);
			/*if(position == 0){ 
				$('#' + this.settings.leftControl).hide(); 
			} else{ 
				$('#' + this.settings.leftControl).show(); 
			}*/
			// Hide right arrow if position is last slide
			if(position == numberOfSlides){ 
				this.resetPosition();
			} /*else{ 
				this.resetPosition(); 
			}*/
			if(position < 0){
				this.setPositionToMax();
			}
			return this;
		
		},
		
		animateSlider: function(){			
			$('#slideInner').animate({
				'marginLeft' : this.settings.slideWidth*(-currentPosition)
			});
			
			return this;
		},
		
		controlsHandle : function(elem){
			
			currentPosition = ($(elem).attr('id')== this.settings.rightControl) ? currentPosition + 1 : currentPosition - 1;
			console.log($(elem).attr('id'), this.settings.rightControl);
			this.manageControls(currentPosition).animateSlider();
			// Move slideInner using margin-left
			//this.animateSlider();			
			return this;
		},
		
		loop: function(){
			timeout = this.settings.timeout;
			//console.log(currentPosition);
			//console.log("hooray");
			me = this;
			/*setInterval(
				function(){
					currentPosition += parseInt(me.settings.loop_step);
			
					if(currentPosition > $("." + me.$el[0].className).length -1){
						currentPosition = (currentPosition % (parseInt($("." + me.$el[0].className).length) - 1)) - 1;
						//currentPosition = 0;
					}	
					me.animateSlider();
					
				}, 3000
			);*/
			currentPosition += parseInt(me.settings.loop_step);
			
			if(currentPosition > $("." + me.settings.itemTarget).length -1){
				currentPosition = (currentPosition % (parseInt($("." + this.settings.itemTarget).length) - 1)) - 1;
				//currentPosition = 0;
			}	
			me.animateSlider();
			
			return this;
		},
		
		start: function(){
			//console.log(this.settings.timeout);
			me = this;	
			process = setInterval(function(){me.loop();}, me.settings.timeout);
			//console.log("cal")
			//this.loop();
			//return this;
		},
		
		pause: function(){
			//console.log(process);
			clearInterval(process);
			return this;
		},
		
		resume: function(){
			this.start();
			return this;
		},
		
		stop: function(){
			
			this.pause().resetPosition();
			return this;
		},		
		
		resetPosition: function(){
			currentPosition = 0;
			return this;
		},
		
		setPositionToMax: function(){
			currentPosition = parseInt($("." + this.settings.itemTarget).length) - 1;	
			console.log(currentPosition);	
		},
		
        _unbindEventHandlers : function(){
            this.$el.off('.' + this.settings.namespace);

            return this;
        }
    }

    // attach your plugin to the jQuery prototype
    $.fn[pluginName] = function(options, el){
        
        // merge defaults & options, without modifying defaults
        var settings = $.extend({}, $.fn[pluginName].defaults, options);
		//console.log(settings, options, el);
        // return the `this` object after iterating through it
        return this.each(function(i, el){
			//console.log("here");
            var $el = $(el),api = $el.data(settings.apiName);
			
            // the plugin hasn't been initialized yet
            if(!api) {
            
                // construct a new api for this element
                api = new ApiClass($el, settings);
                
            } else {
            
                // if the plugin has already been initialized
                // and the second argument is in fact a string
                // that describes a PUBLIC api method 
                // (by convention "_method" is considered private)
                if(typeof options == 'string' && typeof api[options] == 'function' && options.charAt(0) != '_') {
                    // call the method and pass any other arguments (coming after "options")
                    // as the method's parameters
                    console.log(api[options], [].slice.call(arguments, 2));
                    api[options].apply(api, [].slice.call(arguments, 2));                
                }
            }
            
            $('.' + api.settings.controlsTarget).unbind('click');
            $('.' + api.settings.controlsTarget).bind('click', function(){
            	//console.log("i am here");
            	api.controlsHandle(this);
            });
            
            $('.' + api.settings.stopTarget).bind('click', function(){
            	//console.log("i am here");
            	api.pause();
            	$('.' + api.settings.stopTarget).hide();
            	$('.' + api.settings.startTarget).show()
            });
            
            $('.' + api.settings.startTarget).bind('click', function(){
            	//console.log("i am here");
            	api.start();
            	$('.' + api.settings.startTarget).hide();
            	$('.' + api.settings.stopTarget).show()
            });
            api.start();
            
        });
    };
    
    // keep track of the plugin's version
    $.fn[pluginName].version = '0.0.1';

    //defaults
    $.fn[pluginName].defaults = {
        prefix : pluginName + '-',
        namespace : pluginName,
        apiName : pluginName + 'Api',
        leftControl: 'prevnav',
        rightControl: 'nextnav',
        stopTarget: 'stop',
        startTarget: 'start',
        timeout: 2000,
        loop_step: 1,
        itemTarget: 'slide',
        parentEl: "slidesContanier",
        controlsTarget: 'control',
        slideWidth: 215
    };

})(this, jQuery);
