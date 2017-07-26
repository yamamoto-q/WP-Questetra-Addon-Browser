(function($) {
  $(document).ready(function(){
  	var HASH_SEPARATOR = "__";
  	var catalogs = {};　// データ

    $(".addon-browser").each(function(index, el) {
    	var me = this;
    	var browserId = $(this).data('id');// = $(this).attr('id');

    	// - - - - - - - - - - - - - - - - - - - - - - - - - - 
    	// Modal を追加する
    	$header = $('<div class="addom-browser-modal-content-header"><div class="addom-browser-modal-content-header-title"></div><div class="addom-browser-modal-close">x</div></div>');
    	$body = $('<div class="addom-browser-modal-content-body">body</div>');
    	$footer = $('<div class="addom-browser-modal-content-footer"><div class="addom-browser-modal-close">Close</div></div>');

	  	$modalContent = $('<div class="addom-browser-modal-content"></div>');
	  	$modalInner = $('<div class="addom-browser-modal-inner" />');
	  	$modalOuter = $('<div class="addom-browser-modal-outer" />');
	  	$modal = $('<div class="addom-browser-modal" />').attr('id', browserId + "-modal");

	  	$modalContent.append($header);
	  	$modalContent.append($body);
	  	$modalContent.append($footer);
		$modalInner.append($modalContent);
	  	$modalOuter.append($modalInner);
	  	$modal.append($modalOuter);
	  	$("body").append($modal);

	  	// - - - - - - - - - - - - - - - - - - - - - - - - - - 
	  	// モーダルのコンテンツ部分をクリックしても何も起きない
	  	$modalContent.click(function(event) {
	  		event.preventDefault();
	  		event.stopPropagation();
	  	});

	  	// モーダルの背景をクリックしたらモーダルを消す
	  	$modal.click(function(event) {
	  		hideAddonModal();
	  	});

	  	// モーダルを消す
	  	$(".addom-browser-modal-close").click(function(event) {
	  		hideAddonModal();
	  	});

	  	// - - - - - - - - - - - - - - - - - - - - - - - - - - 
	  	// データを取得する
    	var catalogName = $(this).data('catalog');
    	if(!catalogName){
    		// data-catalog@DIV.addon-browserが無い
    		return;
    	}
        var catalogJson = window[catalogName]; // グローバルに保存しているはず
        if(!catalogJson){
        	// カタログが見つからない
        	return;
        }
        catalogs[browserId] = JSON.parse(catalogJson);

        // - - - - - - - - - - - - - - - - - - - - - - - - - - 
        // カタログを表示する
        $(me).html('');
        // Termのリストをブラウザに表示する
        for (var i = catalogs[browserId].terms.length - 1; i >= 0; i--) {
        	var term = catalogs[browserId].terms[i];

        	var itemHtml = '<div class="addon-browser-tax" data-slug="' + term.slug + '">';

        	itemHtml += '<div class="addon-browser-tax-content-wrapper">';
        	itemHtml += '<div class="addon-browser-tax-content">';

        	//itemHtml += '<div class="addon-browser-tax-content-i">';

        	itemHtml += '<div class="addon-browser-tax-content-img" style="background-image:url(' + term.img + ');">';// bg

        	itemHtml += '<div class="addon-browser-tax-content-name-desc">';
        	itemHtml += '<div class="addon-browser-tax-content-name-desc-i">';
        	itemHtml += term.description;
        	itemHtml += '</div>';
        	itemHtml += '</div>';

        	itemHtml += '<div class="addon-browser-tax-content-name-content">'
        	itemHtml += '<div class="addon-browser-tax-content-name">' + term.name + '</div>';
        	itemHtml += '<div class="addon-browser-tax-content-count">' + term.count + '</div>';
        	itemHtml += "</div>";

        	itemHtml += "</div>";//bg

        	//itemHtml += '</div>';

        	itemHtml += "</div>";
        	itemHtml += "</div>";

        	itemHtml += "</div>";

        	$(me).append(itemHtml);
        }
        
        // カタログのTermをクリックしたらモーダル表示
        $(".addon-browser-tax").click(function(event) {
  			var slug = $(this).data('slug');
  			showAddonModal(browserId, slug);
  		});
    });

    // - - - - - - - - - - - - - - - - - - - - - - - - - - 
    // モーダルを表示する（ハッシュを変更する）
    function showAddonModal(browserId, slug){
		location.hash = browserId + HASH_SEPARATOR + slug;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - 
	//　ハッシュが変更されたらモーダルを開く
	function onHashChange(){
		// ハッシュ処理
		var ha = location.hash.split(HASH_SEPARATOR);
		if(ha.length == 2){
			// ハッシュから対象カタログとTermスラグを推察する
			var browserId = ha[0].substr(1);
			var slug = ha[1];
			if(catalogs[browserId]){
				// カタログを発見
				// カタログの中から対象Termを探す
				var filtered = catalogs[browserId].terms.filter(function(element, index, array){
					return element.slug == slug;
				})
				if(filtered.length >= 1){
					// Termを発見
					var term = filtered[0];
					var headerTitle = term.name;

					// Term内Postリストを作成
					var posts = term.posts;
					var $posts = $('<div class="addom-browser-modal-content-body-posts" />');
					for (var i = posts.length - 1; i >= 0; i--) {
						var post = posts[i];
						console.log('post', i, post);

						var $addonName = $('<div>'+post.title+'</div>');

						var $addonExcW = $('<div class="addon-browser-addon-content-eyecatch-wrapper" />');
						var $addonExcContent = $('<div class="addon-browser-addon-content-eyecatch-content" />');
						var $addonExc = $('<div class="addon-browser-addon-content-eyecatch-content-exc" style="background-image:url(' + post.eyecatch + ');">'+post.excerpt+'</div>');

						var $addonContent = $('<div class="addon-browser-addon-content"/>');
						var $addon = $('<div class="addon-browser-addon" data-href="' + post.url + '"/>');

						$addonExcContent.append($addonExc);
						$addonExcW.append($addonExcContent);

						$addonContent.append($addonExcW).append($addonName);
						$addon.append($addonContent);
						$posts.append($addon);

						$($addon).one('click', function(event) {
							var url = $(this).data('href');
							location.href = url;
						});

					}
					$("#" + browserId + "-modal .addom-browser-modal-content-header-title").html(headerTitle);
					$("#" + browserId + "-modal .addom-browser-modal-content-body").html($posts);

					// 表示する
					$('body').css('overflow','hidden');	// モーダル表示中はスクロールさせない
					$("#" + browserId + "-modal").css('top', $('body').scrollTop()).show();

				}else{
					// Term が見つからない
				}
			}else{
				// カタログが見つからない
			}
		}else{
			//　ハッシュを解析できない or フォーマットに合わないもの
			hideAddonModal();
		}
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - 
	//　モーダルを非表示
	function hideAddonModal(){
		$(".addom-browser-modal").hide();
		$('body').css('overflow','auto');
		location.hash = '';
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - 
	//　初期表示
	window.onhashchange = onHashChange;　//ハッシュが変わったら
	onHashChange();
  });
})(window.jQuery);