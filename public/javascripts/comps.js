

function PublicConfigCard(config) {
	var publicConfigCard = $(
		'<div class="row flex">'+
			'<div class="col-lg-7">'+
				'<div class="card mb-2">'+
				  '<h5 class="card-header">'+config.configName+'</h5>'+
				  '<div class="card-body">'+
					'<p class="card-text">'+config.description+'</p>'+
					'<button class="btn btn-primary m-1">Save</button>'+
					'<button class="btn btn-secondary m-1" id="previewBtn" data-toggle="modal" data-target="#previewModal">View</button>'+
				  '</div>'+
				'</div>'+
			'</div>'+
		'</div>'
	);

	publicConfigCard.children()[0].children[0].children[1].children[1].onclick = function() {
		socket.emit('savePublicConfig', config);
	}

	publicConfigCard.children()[0].children[0].children[1].children[2].onclick = function() {
		$('#configName').html(config.configName);
		$('.led-rep').html('');
		initLeds(config.ledNum);
		previewLights(config.commandArray);
	}

	return publicConfigCard;
}

function ConfigCard(config) {
	var checked = "";
	if(config.isPublic) checked = "checked";

	var configCard = $(
		'<div class="row flex">'+
			'<div class="col-lg-7">'+
				'<div id="'+config._id+'" class="card mb-2">'+
				  '<h5 class="card-header">'+config.configName+'</h5>'+
				  '<div class="card-body">'+
				    '<p class="card-text">'+config.description+'</p>'+
					'<div class="row flex">'+
						'<div class="col">'+
							'<button class="editConfigBtn btn btn-primary m-1">Edit</button>'+
							'<button type="button" class="btn btn-danger" data-toggle="modal" data-target="#confirmDeleteModal">Delete</button>'+
						'</div>'+
						'<div class="col">'+
							'<input class="ml-auto" type="checkbox" id="publicCheckBox"'+checked+'>'+
							'<label class="ml-auto" for="publicCheckBox">Public</label>'+
						'</div>'+
					'</div>'+
				  '</div>'+
				'</div>'+
			'</div>'+
		'</div>'
	);

	configCard.children()[0].children[0].children[1].children[1].children[1].children[0].onclick = function() {
		config.isPublic = this.checked;
		socket.emit('saveConfig', config);
	}

	var deleteButton = $(configCard.children()[0].children[0].children[1].children[1].children[0].children[1]);
	deleteButton.data('config', config);

	var editButton = $(configCard.children()[0].children[0].children[1].children[1].children[0].children[0]);
	editButton.click(()=>{loadViewEditConfig(config)});

	return configCard;
}

function PiCard(pi) {
	var piCard = $(
		'<div class="row flex">'+
			'<div class="col-lg-7">'+
				'<div class="card mb-2">'+
				  '<h5 class="card-header">'+pi.piName+'</h5>'+
				  '<div class="card-body">'+
					'<p class="card-text">'+pi.description+'</p>'+
					'<button class="btn btn-primary m-1">Configure</button>'+
				  '</div>'+
				'</div>'+
			'</div>'+
		'</div>'
	);

	var configureBtn = $(piCard.children()[0].children[0].children[1].children[1]);

	configureBtn.click(() => {
		loadViewConfigPi(pi);
	});

	return piCard;
}

function ConfigDropDownItem(config) {
	var dropDownItem = $('<a class="dropdown-item">'+config.configName+'</a>');

	dropDownItem.click(() => {
		$('.led').css('background-color', 'black');
		clearAllIntervals();
		previewLights(config.commandArray);
	});

	return dropDownItem;
}
