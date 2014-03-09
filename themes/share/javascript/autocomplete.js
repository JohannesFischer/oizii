var AutoComplete = {

	form_field: null,
	list: null,
	json_response: {},
	max_results: 10,
	search_term: '',
	target: null,

	init: function (input, target) {
		this.form_field = input;
		this.target = target;
		
		this.attach();
		this.prepareTarget();
	},
	
	attach: function () {
		jQuery(this.form_field).keyup(function(e) {
			
			if (e.key === 'Tab') {
				return AutoComplete.form_field.blur();
			}
			
			AutoComplete.search_term = $(this).val().toLowerCase();
			
			if (AutoComplete.search_term.length > 2) {
				if (AutoComplete.json_response.data !== undefined) {
					AutoComplete.populateList();
				} else {
					$.ajax({
						data: $(this).serialize(),
						dataType: 'json',
						success: function (data) {
							AutoComplete.json_response.data = data;
							AutoComplete.populateList();
						},
						type: 'get',
						url: '/autocomplete/'
					});
				}
			} else {
				AutoComplete.clearList();
				AutoComplete.json_response = {};
			}
		});
		
		jQuery(this.form_field).blur(function() {
			window.setTimeout(function () {
				AutoComplete.clearList();
			}, 1000);
		});
	},
	
	clearList: function () {
		this.list.html('').css({
			opacity: 0
		});
	},
	
	populateList: function () {
		this.clearList();
		
		this.list.css({
			opacity: 1
		});
		
		// loop through child objects posts / genres
		
		// could be more elegant by using child keys :S
		
		var groups = ['Posts', 'Genre'];
		var actions = ['post', 'genre']
		
		for (var o = 0; o < groups.length; o++) {
			var result = this.json_response.data[groups[o]];
			
			var matches = [];
			
			for (var i = 0; i < result.length; i++) {
				if (i >= this.max_results) {
					break;
				}
				if ((result[i].Title).toLowerCase().indexOf(this.search_term) > -1) {
					matches.push(result[i]);
				}
			}
			
			if (matches.length > 0) {
				jQuery('<li/>').append(jQuery('<strong/>', {
					html: groups[o]
				})).appendTo(this.list);
				
				for (var i = 0; i < matches.length; i++) {
					jQuery('<li/>').append(jQuery('<a/>', {
						html: matches[i].Title,
						href: '/#/' + actions[o] +'/' + matches[i].ID
					})).appendTo(this.list);
				}
			}	
		}
	},
	
	prepareTarget: function () {
		this.list = jQuery('<ul/>').addClass('autocomplete-list').appendTo(this.target);
	}
	
};