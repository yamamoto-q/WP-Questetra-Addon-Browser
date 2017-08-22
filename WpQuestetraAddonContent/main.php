<?php
/*
Plugin Name: WP Taxonomy Browser
Plugin URI: https://github.com/yamamoto-q/WP-Questetra-Addon-Browser
Description: タクソノミ階層をリッチにブラウジングするためのショートコード
Version: 0.7
Author: June YAMAMOTO
Author URI: https://www.questetra.com/
License: GPL2
*/

class WP_QuestetraAddonContent{
	public $defaulTaxSlug = 'addon_cat';
	public $taxSlug;

	// コンストラクタ
	public function __construct(){
		add_action('init', array(&$this, 'initCategory'));
		add_action($this->defaulTaxSlug.'_edit_form_fields', array(&$this, 'addOptionToTerm'));	// タームに 画像URL INPUT　を追加する
		add_action('edited_term', array(&$this, 'saveTermOptionImg'));							// タームが編集されたとき

		add_shortcode('tax-browser', array(&$this, 'shortcodeA'));
	}

	// カスタムタクソノミ登録
	function initCategory(){
		register_taxonomy(
			$this->defaulTaxSlug,							// 新規カスタムタクソノミー名
			'page',											// 新規カスタムタクソノミーを反映させる投稿タイプの定義名
			array(
				'label' => __( 'アドオンカテゴリ' ),				// 表示するカスタムタクソノミー名
				'hierarchical' => true,
				'rewrite' => array('with_front'=>false)
			)
		);
	}

	// タームに 画像URL INPUT　を追加する
	function addOptionToTerm($tag){
		$termId = $tag->term_id;
		$termOptionImgVal = get_option("term_option_img_".$termId);
		$addonTermSortVal = get_option("term_option_sort_".$termId);
?>
<tr class="form-field">
	<th><label for="addonTermImg">カテゴリー画像　（WP Taxonomy Browser）</label></th>
	<td>
		「WP Taxonomy Browser」でカテゴリを表示する際のアイキャッチ画像になります。推奨:1200x600px<br />
		<input id="addonTermImg" type="text" size="36" name="addonTermImg" value="<?php echo($termOptionImgVal); ?>" /><br />
	</td>
</tr>
<tr class="form-field">
	<th><label for="addonTermSort">表示順　（WP Taxonomy Browser）</label></th>
	<td>
		「WP Taxonomy Browser」でカテゴリを表示する際の表示時順：小さいものほど優先<br />
		<input id="addonTermSort" type="number" size="36" name="addonTermSort" value="<?php echo($addonTermSortVal); ?>" /><br />
	</td>
</tr>
<?php
	}

	// タームが編集されたとき
	function saveTermOptionImg($termId){
		if ( isset( $_POST['addonTermImg'] ) ) {
			update_option("term_option_img_".$termId, $_POST['addonTermImg']);
		}
		if ( isset( $_POST['addonTermSort'] ) ) {
			$sort = intval($_POST['addonTermSort'], 10);
			update_option("term_option_sort_".$termId, $sort);
		}
	}

	/**
	 * ページデータをJSON化するために配列に変換する
	 **/
	function _postToArr($_post){
		$_postId = $_post->ID;
		$_postTitle = $this->_stripBr($_post->post_title);
		$_postExcerpt = $this->_stripBr($_post->post_excerpt);
		$_postPermalink = get_permalink($_postId);

		$_postThumbnail = "";
		$_postThumbnailId = get_post_thumbnail_id($_postId);
		if($_postThumbnailId){
			$_postThumbnailArray = wp_get_attachment_image_src($_postThumbnailId, 'large');
			$_postThumbnail = $_postThumbnailArray[0];
		}

		return array(
			'ID' => $_postId,
			'title' => $_postTitle,
			'excerpt' => $_postExcerpt,
			'url' => $_postPermalink,
			'eyecatch' => $_postThumbnail
		);
	}

	/**
	 * 文字列から改行を取り除く
	 **/
	function _stripBr($str){
		return str_replace(array("\r\n", "\r", "\n"), '', $str);
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
	// Browser Shotecode
	function shortcodeA($atts, $content = null){
		$atts = shortcode_atts(array(
			'parent' => null,
			'view' => 'term',
			'taxonomy_slug' => null
		), $atts);

		// CSS と JS を読み込む
		$style = plugin_dir_url( __FILE__ ) . 'addonBrowser.css';
		wp_enqueue_style('addonBrowser', $style, false, false, 'all');

		$script = plugin_dir_url( __FILE__ ) . 'addonBrowser.js';
		wp_enqueue_script( 'addonBrowser', $script, array('jquery'), "0.1", true);

		// JSON に詰めるデータ (catalog)
		$termsArr = array();
		$sortIndexArr = array();
		$directlyUnderPostsArr = array();

		if(empty($atts['taxonomy_slug'])){
			$this->taxSlug = $this->defaulTaxSlug;
		}else{
			$this->taxSlug = $atts['taxonomy_slug'];
		}

		// 親ターム名からIDを検索する
		$parentTermId = 0;
		if(!empty($atts['parent'])){
			$parentTerm = get_term_by('name', $atts['parent'], $this->taxSlug);
			if(!empty($parentTerm)){
				$parentTermId = $parentTerm->term_id;
				$parentTermSlug = $parentTerm->slug;
			}
		}

		// . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
		// カタログデータ作成
		// 親タームに直下のタームを取得する
		//$directlyUnder
		$directlyUnderTerms = get_terms($this->taxSlug, array('parent' => $parentTermId));

		if(!empty($directlyUnderTerms)){
			foreach ($directlyUnderTerms as $directlyUnderTerm){
				$termId = $directlyUnderTerm->term_id;
				$termSlug = $directlyUnderTerm->slug;
				$termName = $this->_stripBr($directlyUnderTerm->name);
				$termDesc = $this->_stripBr($directlyUnderTerm->description);
				$termCount = $directlyUnderTerm->count;
				$termOptionImgVal = get_option("term_option_img_".$termId);
				$termOptionSortVal = get_option("term_option_sort_".$termId);

				// Term配下の投稿を詰める
				$termPosts = get_posts(array(
					'post_type' => 'page',
					'posts_per_page' => -1,
					'orderby' => 'menu_order',
					'tax_query' => array(
						array(
						'taxonomy' => $this->taxSlug,
						'field' => 'slug',
						'terms' => $termSlug
						)
					)
				));
				$itemPosts = array();
				if(!empty($termPosts)){
					foreach ($termPosts as $termPost){
						$itemPosts[] = $this->_postToArr($termPost);
					}
				}

				// ソート順を決定する
				$index = $termOptionSortVal;
				if(empty($index)){
					$index = 0;
				};
				$index = intval($index);
				while(!empty($sortIndexArr[$index])){
					$index++;
				};

				// JSON用に配列化
				$termData = array(
					'ID' => $termId,
					'slug' => $termSlug,
					'name' => $termName,
					'description' => $termDesc,
					'count' => $termCount,
					'img' => $termOptionImgVal,
					'posts' => $itemPosts,
					'sort' => $index
				);

				$termsArr[] = $termData;
				$sortIndexArr[$index] = $termData;
			}

			// ソート
			usort($termsArr, function($a, $b) {
				if($a['sort'] == $b['sort']){
					return 0;
				}
				if($a['sort'] < $b['sort']){
					return 1;
				}
				return -1;
			});
		}


		// 直下Post
		$directlyUnderPosts = get_posts(array(
			'posts_per_page' => -1,
			'post_type' => 'page',
			'orderby' => 'menu_order',
			'tax_query' => array(
				array(
				'taxonomy' => $this->taxSlug,
				'field' => 'slug',
				'terms' => $parentTermSlug,
				'include_children' => false
				)
			)
		));
		if(!empty($directlyUnderPosts)){
			foreach ($directlyUnderPosts as $directlyUnderPost){
				$directlyUnderPostsArr[] = $this->_postToArr($directlyUnderPost);
			}
		}

		$catalog = array(
			'terms' => $termsArr,
			'posts' => $directlyUnderPostsArr
		);

		$resId = $parentTermSlug;
		$resValname = "addon_browser_" . $parentTermId;

		$res = '<script type="text/javascript">';

		//　JSON String 'をエスケープ
		$jsonString = json_encode($catalog);
		$jsonString = str_replace("'", "\'", $jsonString);
		$res .= 'var '.$resValname . " ='" . $jsonString . "'";

		$res .= "</script>";

		$res .= '<div id="tax-term-browser-'.$resId.'" class="tax-term-browser" data-id="'.$resId.'" data-catalog="'.$resValname.'" data-view="'.$atts['view'].'">Addon Browser</div>';
		return $res;
	}

}

$samplePlugin = new WP_QuestetraAddonContent();