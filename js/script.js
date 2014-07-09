// JS file for Greeder theme
//
// Index :
// =======
// Parameters
// Initialization
// Misc
// Back to top button
// Options
// Lazy loading
// Internationalization
// Folders
// hamburger icon Feed List
// Favorites
// Read / Unread
// Live display mode modification
// Feed settings
// Synchronization
// Settings page functions
// Verbose feeds

// Note on minification :
// ======================
// When you edit this file, you must "make" on greeder folder to launch the minification

// ==========
// Parameters
// ==========
// Handle hamburger status
var hamburger_status = 0;

// ==============
// Initialization
// ==============

// Mask back to top button if JS is enabled
// (and display it later if needed)
// => This avoids making him blinking fastly
if($('#backtop').length) {
	$('#backtop').hide();
}

var nbUnreadArticles = 0;

$(document).ready(function() {
	// Back to top button handling
	toggleBacktop();
	$('#pagination').remove();

	// Initialize ajaxready at first function load
	if($('#main').length) {
		$(window).data('ajaxready', true);
		$('#main').append('<div id="loader">'+_t('LOADING')+'</div>');
		$(window).data('page', 1);
		$(window).data('nblus', 0);
	}

	if($(window).scrollTop() == 0)
		scrollInfini(true);

	// Settings page
	// Handle the blocks display for settings page
	if($('.settingsPage').length) {
				// Handling partial or complete articles display block
				if($("input[name='articleDisplayContent']").length){
					$("input[name='articleDisplayContent']").click(function(){
						toggleArticleView();
					});
				}

		var hash = window.location.hash;
		if(hash.length) {
			toggleBlocks(hash);
		}
	}

    nbUnreadArticles = parseInt($("#nbUnreadArticles").html());
});

$(document).scroll(function() {
	toggleBacktop(); // Back to top button

    scrollInfini();
});

// ====
// Misc
// ====
// Parse GET parameters in the URL
function getUrlVars()
{
	var vars = [], hash;
	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for(var i = 0; i < hashes.length; i++)
	{
		hash = hashes[i].split('=');
		vars.push(hash[0]);
		if (hash[1]){
			rehash = hash[1].split('#');
			vars[hash[0]] = rehash[0];
		}
		else {
			vars[hash[0]] = '';
		}
	}
	return vars;
}

// ==================
// Back to top button
// ==================
function toggleBacktop() {
	var screen_height = parseInt($(window).height());

	if($(document).scrollTop() >= screen_height / 3) {
		$('#backtop').show();
	}
	else {
		$('#backtop').hide();
	}
}

// ============
// Lazy loading
// ============

// no_scroll_test is used to force the ajax query without testing if the view has been scrolled
function scrollInfini(no_scroll_test) {
	if (typeof(no_scroll_test)==='undefined') no_scroll_test = false;
	var deviceAgent = navigator.userAgent.toLowerCase();
	var agentID = deviceAgent.match(/(iphone|ipod|ipad)/);

	if($('#main').length) {
		// Test if ajaxready is false, and exit in this case (block multiple calls)
		if ($(window).data('ajaxready') == false)
			return;

		if(($(window).scrollTop() + $(window).height()) + 1 >= $(document).height()
		   || agentID && ($(window).scrollTop() + $(window).height()) + 150 > $(document).height() || no_scroll_test)
		{
			// Set ajaxready to false before request sending
			$(window).data('ajaxready', false);

			// Display the loader to indicate the loading
			$('#main #loader').show();

			// Get vars sent as GET
			var action = getUrlVars()['action'];
			var folder = getUrlVars()['folder'];
			var feed = getUrlVars()['feed'];
			var order = getUrlVars()['order'];
			if (order) {
				order = '&order='+order
			} else {
				order = ''
			}

			// Make the ajax request
			$.ajax({
				url: './article.php',
				type: 'post',
				data: 'scroll='+$(window).data('page')+'&nblus='+$(window).data('nblus')+'&hightlighted=1&action='+action+'&folder='+folder+'&feed='+feed+order,

				success: function(data) {
					if (data.replace(/^\s+/g,'').replace(/\s+$/g,'') != '')
					{
						// Insert new articles right before the loader
						$('#main #loader').before(data);
						// Delete script from page to prevent interaction with next and prev
						$('#main .scriptaddbutton').remove();
						// Display events with a fadeIn
						$('#main article.scroll').fadeIn(600);
						// Delete scroll tag for next scroll
						$('#main article.scroll').removeClass('scroll');
						$(window).data('ajaxready', true);
						$(window).data('page', $(window).data('page')+1);
						$(window).data('enCoursScroll',0);
						// Recursive call until a scroll is detected
						if($(window).scrollTop() == 0)
							scrollInfini();
					}
					else {
						$('#loader').remove();
					}
				}
			});
			// When loading is finished, remove the loader
			$('#main #loader').fadeOut(400);
		}
	}
};

// ====================
// Internationalization
// ====================
function _t(key,args){
	value = i18n[key];
	if(args!=null){
		for(i=0;i<args.length;i++){
			value = value.replace('$'+(i+1),args[i]);
		}
	}
	return value;
}

// =======
// Folders
// =======
function toggleFolder(element, folder) {
	var feedBloc = $('ul', $(element).parent());

	var open = 0;
	if(feedBloc.css('display') == 'none') {
		open = 1;
	}

	feedBloc.slideToggle(200);
	$(element).html((!open ? '►' : '▼'));
	if (open == true)
		$(element).parent().addClass("isOpen");
	else
		$(element).parent().removeClass("isOpen");
}

// Rename a folder on settings page
function renameFolder(element, folder) {
	var folderLine = $(element).parent().parent();
	var folderNameCase = $('h1:first span',folderLine);
	var folderNameInnerCase = $('h1:first',folderLine);
	var value = folderNameCase.html();

	$(element).html(_t('SAVE'));
	$(element).attr('onclick','saveRenameFolder(this,'+folder+')');
	folderNameInnerCase.replaceWith('<td><input type="text" class="rename" name="folderName" value="'+value+'"/></td>');
}

// Save the new name for a folder on settings page
function saveRenameFolder(element, folder) {
	var folderLine = $(element).parent().parent();
	var folderNameCase = $('td:first',folderLine);
	var value = $('input',folderNameCase).val();

	$(element).html(_t('RENAME'));
	$(element).attr('onclick','renameFolder(this,'+folder+')');
	folderNameCase.replaceWith('<td><h1><span>'+value+'</span></h1></td>');

	$.ajax({
		url: "./action.php?action=renameFolder",
		data:{id:folder,name:value}
	});
}

// ========================
// Hamburger icon Feed List
// ========================
$("#feedList").addClass("js").before('<div id="menu"><img src="./templates/greeder/img/ham.svg" alt="Feed list" onerror="this.removeAttribute(\'onerror\'); this.src=\'./templates/greeder/img/ham.png\'"></div>');

$("#menu").click(function(){
	$("#feedList").slideToggle(200);
	hamburger_status = 1 - hamburger_status;
});

$(window).resize(function() {
	if(hamburger_status == 1 && window.innerWidth < 850) {
		$("#feedList").css("display", "block");
	}
	else if(window.innerWidth < 850) {
		$("#feedList").css("display", "none");
	}

	if(window.innerWidth > 850) {
		$("#feedList").css("display", "block");
	}
});

// =========
// Favorites
// =========
function addFavorite(element, id) {
	var activeScreen = $('#pageTop').html();
	$.ajax({
		url: "./action.php?action=addFavorite",
		data:{id:id},
		success:function(msg){
			if(msg.status == 'noconnect') {
				alert(msg.texte)
			} else {
				$('.favs', $(element).parent().parent()).attr('onclick','removeFavorite(this,'+id+');');
				$(element).parent().parent().addClass('favorised');
				// We count how many articles have been set to favorites on the favorite page (infinite scroll)
				if (activeScreen == 'favorites') {
					$(window).data('nblus', $(window).data('nblus') - 1);
					$('#nbarticle').html(parseInt($('#nbarticle').html()) + 1);
				}
			}
		}
	});
}

function removeFavorite(element, id) {
	var activeScreen = $('#pageTop').html();
	$.ajax({
		url: "./action.php?action=removeFavorite",
		data:{id:id},
		success:function(msg){
			if(msg.status == 'noconnect') {
				alert(msg.texte)
			} else {
				$('.favs', $(element).parent().parent()).attr('onclick','addFavorite(this,'+id+');');
				$(element).parent().parent().removeClass('favorised');
				// We count how many articles have been set to favorites on the favorite page (infinite scroll)
				if (activeScreen == 'favorites') {
					$(window).data('nblus', $(window).data('nblus') + 1);
					$('#nbarticle').html(parseInt($('#nbarticle').html()) - 1);
				}
			}
		}
	});
}

// =============
// Read / Unread
// =============
function readThis(element, id, from, callback) {
	if(typeof(callback) === 'undefined') callback = false;

	var activeScreen = $('#pageTop').html();
	var parent = $(element).parent().parent();
	var nextEvent = $('#'+id).next();

	// On unread events
	if(!parent.hasClass('eventRead')) {
		$.ajax({
			url: "./action.php?action=readContent",
			data:{id:id},
			success:function(msg){
				if(msg.status == 'noconnect') {
					alert(msg.texte)
				} else {
                    // Update number of unread articles
                    window.nbUnreadArticles--;
                    $("#nbUnreadArticles").html(window.nbUnreadArticles);

					switch (activeScreen){
						case '':
							// Index page
							parent.addClass('eventRead');
							parent.fadeOut(200,function(){
								if(callback){
									callback();
								}
								// Simulate a scroll if all events are masked
								if($('article section:last').attr('style') == 'display: none;') {
									$(window).scrollTop($(document).height());
								}
							});
							// We count how many articles have been read to substract them to the infinite scroll query
							$(window).data('nblus', $(window).data('nblus')+1);
							// Diminish the number of article on top of the page
							$('#nbarticle').html(parseInt($('#nbarticle').html()) - 1)
							break;
						case 'selectedFolder':
							parent.addClass('eventRead');
							// We count how many articles have been read to substract them to the infinite scroll query
							$(window).data('nblus', $(window).data('nblus')+1);
							if(callback){
								callback();
							}
							break;
						default:
							// Any other case : favorites, selectedFeed, ...
							parent.addClass('eventRead');
							if(callback){
								callback();
							}
							break;
					}
				}
			}
		});
	}
	// On read events
	else {
		// If not a click on event title
		if(from!='title'){
			$.ajax({
				url: "./action.php?action=unreadContent",
				data:{id:id},
				success:function(msg){
					if(msg.status == 'noconnect') {
						alert(msg.texte)
					} else {
                        // Update number of unread articles
                        window.nbUnreadArticles++;
                        $("#nbUnreadArticles").html(window.nbUnreadArticles);

						parent.removeClass('eventRead');
						// Count how many articles have been set to unread
						if ( (activeScreen=='') || (activeScreen=='selectedFolder') ) $(window).data('nblus', $(window).data('nblus') - 1);

						if(callback){
							callback();
						}
					}
				}
			});
		}
	}
}

// ==============================
// Live display mode modification
// ==============================
function toggleArticleDisplayMode(button, target){
    var summary = $('.summary', $('#'+target).parent());
    var content = $('.content', $('#'+target).parent());
    var articleDetails = $('.articleDetails', $('#'+target).parent());
	if(summary.length > 0 && summary.attr('style') != 'display: none;')
	{
		// Summary mode and passing to full content mode
		action = 'content';
		/*summary.hide();*/
		// Loading the full content of the article
		if ($.trim(content.text()).length == 0)
		{
			$.ajax({
				url: "./action.php?action=articleDisplayMode&articleDisplayMode="+action+'&event_id='+target,
				success:function(msg){
					if(msg.status == 'noconnect')
					{
						alert(msg.texte);
					}
					else
					{
						if(console && console.log && msg != "")
						{
			                            console.log(msg);
			                        }
						summary.hide(); //it creates a little visual glitch when et disappears.
						content.html(msg);
						content.show(200);
						// Button to pass to title mode
						button.innerHTML = '-';
						button.title = _t('EVENT_DISPLAY_CONTENT');
						articleDetails.last().show(200);
					}
				}
			});
		}
		else
		{
			summary.hide();
			content.show(200);
			// Button to pass to title mode
			button.innerHTML = '-';
			button.title = _t('EVENT_DISPLAY_CONTENT');
			articleDetails.last().show(200);
		}

	}
	else
	{
		if(content.length > 0 && content.attr('style') != 'display: none;')
		{
			// Full content mode and passing to title mode
			content.hide(200);
			// Button to pass to summary mode
			button.innerHTML = '+';
			button.title = _t('EVENT_DISPLAY_TITLE');
			if(articleDetails.length > 1)
			{
		                articleDetails.last().hide(200);
			}

		}
		else
		{
			// Title mode and passing to summary mode
			action = 'summary';
			// Loading the summary (description)
			if ($.trim(summary.text()).length==0)
			{
				$.ajax({
					url: "./action.php?action=articleDisplayMode&articleDisplayMode="+action+'&event_id='+target,
					success:function(msg){
						if(msg.status == 'noconnect')
						{
							alert(msg.texte);
						}
						else
						{
							if( console && console.log && msg!="" )
							{
				                                console.log(msg);
							}
	    						summary.html(msg);
							summary.show(200);
							// Button to pass to full content mode
							button.innerHTML = '++';
							button.title = _t('EVENT_DISPLAY_SUMMARY');
						}
					}
				});
			}
			else
			{
				summary.show(200);
		                // Button to pass to full content mode
				button.innerHTML = '++';
				button.title = _t('EVENT_DISPLAY_SUMMARY');
			}
		}
	}
}

// =============
// Feed settings
// =============
function renameFeed(element, feed) {
	var feedLine = $(element).parent().parent();
	var feedNameCase = $('td.loopFoldersSettingsName',feedLine);
	var feedNameValue = $('a', feedNameCase).html();
	var feedUrlCase = $('td.loopFoldersSettingsLink',feedLine);
	var feedUrlValue = $('a', feedUrlCase).html();
	var url = feedNameCase.attr('href');

	$(element).html(_t('SAVE'));
	$(element).attr('onclick','saveRenameFeed(this,'+feed+',"'+url+'")');
	feedNameCase.replaceWith('<td class="loopFoldersSettingsName"><input type="text" name="feedName" value="'+feedNameValue+'"/></td>');
	feedUrlCase.replaceWith('<td class="loopFoldersSettingsLink shorten"><input type="text" name="feedUrl" value="'+feedUrlValue+'" /></td>');
}

function saveRenameFeed(element, feed, url) {
	var feedLine = $(element).parent().parent();
	var feedNameCase = $('td.loopFoldersSettingsName input[name="feedName"]',feedLine);
	var feedNameValue = feedNameCase.val();
	var feedUrlCase = $('td.loopFoldersSettingsLink input[name="feedUrl"]',feedLine);
	var feedUrlValue = feedUrlCase.val();

	$(element).html(_t('RENAME'));
	$(element).attr('onclick','renameFeed(this,'+feed+')');
	feedNameCase.replaceWith('<a href="'+url+'">'+feedNameValue+'</a>');
	feedUrlCase.replaceWith('<a href="'+feedUrlValue+'">'+feedUrlValue+'</a></span>');

	$.ajax({
		url: "./action.php?action=renameFeed",
		data:{id:feed,name:feedNameValue,url:feedUrlValue}
	});
}

function changeFeedFolder(element, id) {
	var value = $(element).val();
	window.location = "./action.php?action=changeFeedFolder&feed="+id+"&folder="+value;
}


// ===============
// Synchronization
// ===============
function synchronize(code, callback) {
	if(code != '') {
		$('main').html('<article>'+
				'<iframe class="importFrame" src="action.php?action=synchronize&amp;format=html&amp;code='+code+'" name="idFrameSynchro" id="idFrameSynchro" height="400"></iframe>'+
				'</article>');

		if(typeof(callback) === 'undefined') callback = false;

		if(callback) {
			$('iframe#idFrameSynchro').load(function () {
				callback();
			});
		}
	}
	else {
		alert(_t('YOU_MUST_BE_CONNECTED_FEED'));
	}
}

// =======================
// Settings page functions
// =======================
function toggleBlocks(target) {
	if($(target).length) {
		$('main section').hide();
		$('section'+target).fadeToggle(200, function() {
			window.location.hash = target;
		});
	}
	else {
		window.location.hash = "";
	}
}


// =======================
// Verbose Feeds
// =======================
// affiche ou cache les feeds n'ayant pas d'article non lus.
function toggleFeedVerbose(button,action,idFeed){
	$.ajax({
		url: "./action.php?action=displayFeedIsVerbose&displayFeedIsVerbose="+action+"&idFeed="+idFeed,
		success:function(msg){
			if(msg.status == 'noconnect') {
				alert(msg.texte);
			} else {
				if( console && console.log && msg!="" ) console.log(msg);
				//changement de l'évènement onclick pour faire l'inverse lors du prochain clic
				var reverseaction = 0;
				if (action==0) { reverseaction = 1; }
				$(button).attr('onclick','toggleFeedVerbose(this,'+reverseaction+', '+idFeed+');');
			}
		}
	});
}
// Bouton permettant l'affichage des options d'affichage et de non affichage des flux souhaités en page d'accueil
function toggleOptionFeedVerbose(button,action){
	$.ajax({
		url: "./action.php?action=optionFeedIsVerbose&optionFeedIsVerbose="+action,
		success:function(msg){
			if(msg.status == 'noconnect') {
				alert(msg.texte);
			} else {
				if( console && console.log && msg!="" ) console.log(msg);
				//changement de l'évènement onclick pour faire l'inverse lors du prochain clic
				var reverseaction = 0;
				if (action==0) { reverseaction = 1; }
				$(button).attr('onclick','toggleOptionFeedVerbose(this,'+reverseaction+');');
				//Changement du statut des cases à cocher sur les feed (afficher ou cacher)
				if (action==1){
					$('.feedVerbose').hide();
				}else{
					$('.feedVerbose').show();
				}
			}
		}
	});
}
