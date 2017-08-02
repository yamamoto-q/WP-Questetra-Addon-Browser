(function($) {
  $(document).ready(function(){
  	var HASH_SEPARATOR = "__";
  	var catalogs = {};　// データ
  	var isClickModalOpen = false;
  	var currentBrowserId = null;

    $(".tax-term-browser").each(function(index, el) {
    	var me = this;
    	var browserId = $(this).data('id');
    	var view = $(this).data('view').toLowerCase();
    	//console.log(browserId, view);

    	if(view == 'term'){
	    	// - - - - - - - - - - - - - - - - - - - - - - - - - - 
	    	// Modal を追加する
	    	$header = $('<div class="ttb-m-header"><div class="ttb-m-title"></div><div class="ttb-m-close ttb-btn-x">×</div></div>');
	    	$body = $('<div class="ttb-m-body">body</div>');
	    	$footer = $('<div class="ttb-m-footer"><div class="ttb-m-close ttb-btn">Close</div></div>');

		  	$modalContent = $('<div class="ttb-m-pane"></div>');
		  	$modalInner = $('<div class="ttb-middle-i" />');
		  	$modalOuter = $('<div class="ttb-middle-o" />');
		  	$modal = $('<div class="ttb-modal" />').attr('id', browserId + "-modal");

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
		  		hideAddonModal(true);
		  	});

		  	// モーダルを消す
		  	$(".ttb-m-close").click(function(event) {
		  		hideAddonModal(true);
		  	});
	  	}

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

        if(view == 'term'){
	        // Termのリストをブラウザに表示する
	        for (var i = catalogs[browserId].terms.length - 1; i >= 0; i--) {
	        	var term = catalogs[browserId].terms[i];

	        	var itemHtml = '<div class="ttb-tax" data-slug="' + term.slug + '" data-id="' + browserId + '">';

	        	itemHtml += '<div class="ttb-cube-o">';
	        	itemHtml += '<div class="ttb-cube-i">';

	        	//itemHtml += '<div class="addon-browser-tax-content-i">';

	        	itemHtml += '<div class="ttb-tax-thumb" style="background-image:url(' + term.img + ');">';// bg

	        	itemHtml += '<div class="ttb-tax-exc">';
	        	itemHtml += '<div>' + term.description + '</div>';
	        	itemHtml += '</div>';

	        	itemHtml += '<div class="ttb-tax-name-count">'
	        	itemHtml += '<div class="ttb-tax-name">' + term.name + '</div>';
	        	itemHtml += '<div class="ttb-tax-count">' + term.count + '</div>';
	        	itemHtml += "</div>";

	        	itemHtml += "</div>";// .ttb-tax-thumb

	        	//itemHtml += '</div>';

	        	itemHtml += "</div>";
	        	itemHtml += "</div>";

	        	itemHtml += "</div>";

	        	$(me).append(itemHtml);
	        }
    	}else{
    		var $posts = $('<div class="ttb-posts" />');
    		for (var i = catalogs[browserId].posts.length - 1; i >= 0; i--) {
    			var postData = catalogs[browserId].posts[i];
    			var $post = buildPostHtml(postData);
    			$posts.append($post);

    			$($post).one('click', function(event) {
					var url = $(this).data('href');
					location.href = url;
				});
    		}
    		$(me).append($posts);
    	}
    });

    // - - - - - - - - - - - - - - - - - - - - - - - - - - 
    // モーダルを表示する（ハッシュを変更する）
    function showAddonModal(browserId, slug){
    	//isClickModalOpen = true;
		location.hash = browserId + HASH_SEPARATOR + slug;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - 
	//　モーダルを非表示
	function hideAddonModal(isHistoryBack){
		modalFitTimer(false);
		$(".ttb-modal").hide();
		$('body').css('overflow','auto');

		if(isHistoryBack){
			// isClickModalOpe
			// document.referrer
			//console.log("isClickModalOpen", isClickModalOpen);
			if(isClickModalOpen){
				history.back();
			}else if(currentBrowserId){
				location.hash = "tax-term-browser-" + currentBrowserId;
				currentBrowserId = null;
			}
		}
	}

	function buildPostHtml(postData){
		var $postTitle = $('<div class="ttb-post-title">'+postData.title+'</div>');
		var $postThumb = $('<div class="ttb-bgcover ttb-post-thumb" style="background-image:url(' + postData.eyecatch + ');"><div class="ttb-middle-o"><div class="ttb-middle-i ttb-post-exc">'+postData.excerpt+'</div></div></div>');
		var $postThumbIn = $('<div class="ttb-fbrate-i" />');
		var $postThumbOut = $('<div class="ttb-fbrate-o" />');
		var $postIn = $('<div class="ttb-post-content"/>');
		var $post = $('<div class="ttb-post" data-href="' + postData.url + '"/>');

		$postThumbIn.append($postThumb);
		$postThumbOut.append($postThumbIn);
		$postIn.append($postThumbOut).append($postTitle);
		$post.append($postIn);
		return $post;
	}

	/**
	 * 稀にモーダルがずれるので、タイマーで表示修正
	 **/
	var modalFitTimerId = false;
	function modalFitTimer(flg, browserId){
		if(flg){
			if(modalFitTimerId){
				//clearInterval(modalFitTimerId);
				modalFitTimerId = false;
			}
			modalFitTimerId = setInterval(function(){
				//console.log("modalFitTimer", browserId);
				$("#" + browserId + "-modal").css('top', $('body').scrollTop());
			}, 500);
		}else{
			//console.log("modalFitTimer", 'stop');
			if(modalFitTimerId){
				clearInterval(modalFitTimerId);
			}
			modalFitTimerId = false;
		}
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - 
	//　ハッシュが変更されたらモーダルを開く
	function onHashChange(){
		//console.log("onHashChange", location.hash);

		// ハッシュ処理
		var ha = location.hash.split(HASH_SEPARATOR);
		if(ha.length == 2){
			// ハッシュから対象カタログとTermスラグを推察する
			var browserId = ha[0].substr(1);
			var slug = ha[1];
			currentBrowserId = browserId;
			//console.log("currentBrowserId", currentBrowserId);

			if(catalogs[browserId]){
				// カタログを発見
				// カタログの中から対象Termを探す
				var filtered = catalogs[browserId].terms.filter(function(element, index, array){
					return element.slug == slug;
				})
				if(filtered.length >= 1){
					// Termを発見
					var termData = filtered[0];
					var termName = termData.name;

					// Term内Postリストを作成
					var postsDatas = termData.posts;

					var $posts = $('<div class="ttb-posts" />');
					for (var i = postsDatas.length - 1; i >= 0; i--) {
						var postData = postsDatas[i];

						var $post = buildPostHtml(postData);

						$posts.append($post);
						$($post).one('click', function(event) {
							var url = $(this).data('href');
							location.href = url;
						});

					}

					$("#" + browserId + "-modal .ttb-m-title").html(termName);
					$("#" + browserId + "-modal .ttb-m-body").html($posts);

					// 表示する
					$('body').css('overflow','hidden');	// モーダル表示中はスクロールさせない
					$("#" + browserId + "-modal").css('top', $('body').scrollTop()).show();

					modalFitTimer(true, browserId);

				}else{
					// Term が見つからない
				}
			}else{
				// カタログが見つからない
			}
		}else{
			//　ハッシュを解析できない or フォーマットに合わないもの
			hideAddonModal(false);
		}
	}

	// カタログのTermをクリックしたらモーダル表示
    $(".ttb-tax").click(function(event) {
		var slug = $(this).data('slug');
		var browserId = $(this).data('id');
		showAddonModal(browserId, slug);
		isClickModalOpen = true;
	});

	// - - - - - - - - - - - - - - - - - - - - - - - - - - 
	//　初期表示
	window.onhashchange = onHashChange;　//ハッシュが変わったら
	onHashChange();
  });
})(window.jQuery);