"use strict";

var selected;
var ncol = 4;
var nrow = 6;
var iswap_1;
var iswap_2;
var img_selected = 'dist/imgs/sample-1.jpg';
var point;
var hint_count;

function reset() {
	selected = 0;
	point = 0;
	hint_count = 3;

	$('#hint-count').text(hint_count);
	$('.board').removeClass('complete');
	$('.board').html('');
	$('#hint').css('pointer-events', 'auto');

	download(0);
	setImageSize($('.pick-land').find('.active img'));
}

function setDimension(cols, rows) {
	$(':root').css('--ncol', cols.toString());
	$(':root').css('--nrow', rows.toString());
}

function setLevel(level_item = null, level = 'medium') {
	switch (level) {
		case 'easy':
			ncol = 3; nrow = 5;
			setDimension(3, 5);
			break;
		case 'medium':
			ncol = 4; nrow = 6;
			setDimension(4, 6);
			break;
		case 'hard':
			ncol = 5; nrow = 8;
			setDimension(5, 8);
			break;
	}

	$('.level').removeClass('active');
	$(level_item).addClass('active');
}

function setImageSize(img) {
	let width = $(img)[0].naturalWidth;
	let height = $(img)[0].naturalHeight;

	$(':root').css('--img-width', width + 'px');
	$(':root').css('--img-height', height + 'px');
}

function setImage(pick) {
	$('.pick-item').removeClass('active');
	$(pick).addClass('active');

	var picked_img = $(pick).children('img');
	img_selected = $(picked_img).attr('src');

	setImageSize($(picked_img));
}

function submitImg() {
	var url = $('#url-submit').val();
	if (url != '') {
		$('#url-submit').val('');
		img_selected = url;
		$('.pick-item').removeClass('active');
		let item =  '<figure class="pick-item active" onclick="setImage(this)">' +
						'<img class="img-responsive" src="' + img_selected + '">' +
						'<figcaption>Picked</figcaption>' +
					'</figure>';
		$('.pick-land').prepend(item);
		setImageSize($(item).children('img'));
	}
}

function download(flag = 0) {
	if (flag == 1) {
		$('#download').removeClass('disabled');
		$('#download').attr('href', img_selected);
	} else {
		$('#download').addClass('disabled');
		$('#download').attr('href', '');
	}
}

function sound(sound_control) {
	if ($(sound_control).hasClass('active') == false) {
		$('body audio').each(function(){
			$(this).prop('muted', true);
		});
		$(sound_control).addClass('active');
	} else {
		$('body audio').each(function(){
			$(this).prop('muted', false);
		});
		$(sound_control).removeClass('active');
	}
}

function swap(iswap_1, iswap_2) {
	var tmp = $(iswap_1).children('.cell-content');
	$(iswap_1).html($(iswap_2).children('.cell-content'));
	$(iswap_2).html(tmp);
}

function check(cell) {
	selected++;
	if (selected == 1) {
		iswap_1 = cell;
		$(cell).toggleClass('active');
	}
	if (selected == 2) {
		$(cell).toggleClass('active');
		selected = 0;

		if ($(cell).attr('id') != $(iswap_1).attr('id')) {
			iswap_2 = cell;
			swap(iswap_1, iswap_2);
			checkPoint(iswap_1);
			checkPoint(iswap_2);
			$('.cell').removeClass('active').removeClass('highlight');
			$('#hint').css('pointer-events', 'auto');
		}
	}
}

function checkPoint(cell) {
	let cell_id = $(cell).attr('id');
	let child_id = $(cell).children('.cell-content').data('id');
	let data_fit = $(cell).attr('data-fit');

	if (data_fit == 1) {
		if (cell_id != child_id) {
			point--;
			$(cell).attr('data-fit', '0');
		}
	} else {
		if (cell_id == child_id) {
			point++;
			$(cell).attr('data-fit', '1');
		}
		if (point == nrow * ncol) complete();
	}
}

function complete() {
	$({ Counter: 1 }).animate({ Counter: ncol * nrow }, {
		duration: ncol * nrow * 100,
		easing: 'swing',
		step: function() {
			$('.cell:nth-child(' + Math.ceil(this.Counter) + ')').css('border', 'none');
		},
		complete: function() {
			$('.cell').css('pointer-events', 'none');
		}
	});
	download(1);
}

function hint() {
	if (hint_count > 0) {
		hint_count--;
		$('#hint-count').text(hint_count);
		$('#hint').css('pointer-events', 'none');

		let items = $('.board').find('.cell[data-fit=0]');
		let index = Math.floor(Math.random() * items.length);
		let item  = $(items).get(index);

		$(item).addClass('highlight');
		$('#' + $(item).children('.cell-content').data('id')).addClass('highlight');
	}
}

function shuffle(data) {
	var counter = data.length;

    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;

        let temp 		= data[counter];
        data[counter] 	= data[index];
        data[index] 	= temp;
    }

    return data;
}

function createPuzzle() {
	var puzzle_map = [];
	for (var i = 0, id = 0; i < nrow; i++) {
		for (var j = 0; j < ncol; j++, id++) {
			let item = '<div class="cell" id="cell-' + id + '" data-fit="0" onclick="check(this)"></div>';
			puzzle_map.push([id, i, j]);
			$('.board').append(item);
		}
	}

	shuffle(puzzle_map);
	for (var i = 0, leng = puzzle_map.length; i < leng; i++) {

		if (i == puzzle_map[i][0]) {
			point++;
			$('#cell-' + i).attr('data-fit', '1');
		}
		let item_content = '<div class="cell-content" data-id="cell-' + puzzle_map[i][0] + '">' +
								'<img src="' + img_selected + '" ' +
								'style="top: calc(-1 * var(--cell-width) * ' + puzzle_map[i][1] + ' - var(--pull-imgy)); left: calc(-1 * var(--cell-width) * ' + puzzle_map[i][2] + ' - var(--pull-imgx))">' +
							'</div>';
		
		$('#cell-' + i).append(item_content);
	}
}

function play() {
	reset();
	createPuzzle();
	openScreen('#in-process');
	$('#bg-music')[0].volume = 0.7;
	$('#bg-music')[0].play();
}

function replay() {
	reset();
	createPuzzle();
}

function openScreen(screen) {
	$('.screen').removeClass('open');
	$(screen).addClass('open');
}

$(window).on('load', function() {
	$('.preloader').fadeOut('fast');
});