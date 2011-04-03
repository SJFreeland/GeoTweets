Ext.setup({
    tabletStartupScreen: 'tablet_startup.png',
    phoneStartupScreen: 'phone_startup.png',
	icon: 'icon.png',
    glossOnIcon: false,
    onReady: function() {
    	
    	var timeline, mapPanel, panel, refresh, addMarker, tweetBubble;
    	
    	timeline = new Ext.Component({
    		title: 'Timeline',
			cls: 'timeline',
    		scroll: 'vertical',
            tpl: [
            	'<tpl for=".">',
                	'<div class="tweet">',
                		'<div class="avatar"><img src="{profile_image_url}" /></div>',
                		'<div class="tweet-content">',
                			'<h2>{from_user}</h2>',
                			'<p>{text}</p>',
                		'</div>',
                	'</div>',
                '</tpl>',
            ]
    	});
    	
    	mapPanel = new Ext.Map({
    		title: 'Map',
    		
    		// GEOLOCATION
    		useCurrentLocation: true,
    		
			mapOptions: {
				
				// FIXED LOCATION (602 Prichett Court, Fort Collins)
				// center: new google.maps.LatLng(40.486492, -105.086944),
				
				// FIXED LOCATION (DFW Airport)
				// center: new google.maps.LatLng(32.893100, -97.040342),
				
				zoom: 7
			}
    	});
    	
    	panel = new Ext.TabPanel({
            fullscreen: true,
            cardSwitchAnimation: 'slide',
            ui: 'light',
            items: [mapPanel, timeline]
        });
        
		addMarker = function(tweet) {
			var latLng = new google.maps.LatLng(tweet.geo.coordinates[0], tweet.geo.coordinates[1]);

			var marker = new google.maps.Marker({
				map: mapPanel.map,
				position: latLng
			});

			google.maps.event.addListener(marker, "click", function() {
				tweetBubble.setContent(tweet.text);
				tweetBubble.open(mapPanel.map, marker);
			});
		};

        refresh = function() {
        	
        	// GEOLOCATION
        	var coords = mapPanel.geo.coords;
        	
			Ext.util.JSONP.request({
				url: 'http://search.twitter.com/search.json',
				callbackKey: 'callback',
				params: {
					
					// GEOLOCATION
					geocode: coords.latitude + ',' + coords.longitude + ',' + '100mi',
					
					// FIXED LOCATION (602 Prichett Court, Fort Collins)
					// geocode: "40.486492, -105.086944, 100mi",
					
					// FIXED LOCATION (DFW Airport)
					// geocode: "32.893100, -97.040342, 100mi",
					
					rpp: 50
				},
				callback: function(data) {
					var tweetList = data.results;
        			timeline.update(tweetList);  // Update tweets in the timeline

        			// Add points to the map
        			for (var i = 0; i < tweetList.length; i++) {
        				var tweet = tweetList[i];
        				if (tweet.geo && tweet.geo.coordinates) {
        					addMarker(tweet);
        				}
        			}
				}
			});
        };

        panel.getTabBar().add([
        	{xtype: 'spacer'},
        	{
        		xtype: 'button',
        		iconMask: true,
        		iconCls: 'refresh',
        		ui: 'plain',
        		style: 'margin:0;',
        		handler: refresh
        	}
        ]);
        
        panel.getTabBar().doLayout();
        
		tweetBubble = new google.maps.InfoWindow();

		// GEOLOCATION
		mapPanel.geo.on('update', refresh);
		
		// FIXED LOCATION
		// refresh();
    }
});