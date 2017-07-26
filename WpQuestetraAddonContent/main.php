<?php
/*
Plugin Name: WP Questetra Addon Content
Plugin URI: https://github.com/Questetra/WP-Questetra-Addon-Shortcode
Description: Questetra Addon XML (機能拡張)　ページ関連についてのプラグイン
Version: 0.1
Author: June YAMAMOTO
Author URI: https://www.questetra.com/
License: GPL2
*/

class WP_QuestetraAddonContent{
	public $taxName = 'addon_cat';

	// コンストラクタ
	public function __construct(){
		add_action('init', array(&$this, 'initCategory'));
		add_action($this->taxName.'_edit_form_fields', array(&$this, 'addOptionToTerm'));	// タームに 画像URL INPUT　を追加する
		add_action('edited_term', array(&$this, 'saveTermOptionImg'));						// タームが編集されたとき

		add_shortcode('addon-browser', array(&$this, 'shortcodeA'));
	}

	// カスタムタクソノミ登録
	function initCategory(){
		register_taxonomy(
			$this->taxName,									// 新規カスタムタクソノミー名
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
?>
<tr class="form-field">
	<th><label for="addonTermImg">バナー画像URL</label></th>
	<td>
		<input id="addonTermImg" type="text" size="36" name="addonTermImg" value="<?php echo($termOptionImgVal); ?>" /><br />
	</td>
</tr>
<?php
	}

	// タームが編集されたとき
	function saveTermOptionImg($termId){
		if ( isset( $_POST['addonTermImg'] ) ) {
			update_option("term_option_img_".$termId, $_POST['addonTermImg']);
		}
	}

	// Browser Shotecode
	function shortcodeA($atts, $content = null){
		$style = plugin_dir_url( __FILE__ ) . 'addonBrowser.css';
		wp_enqueue_style('addonBrowser', $style, false, false, 'all');


		$script = plugin_dir_url( __FILE__ ) . 'addonBrowser.js';
		wp_enqueue_script( 'addonBrowser', $script, array('jquery'), "0.1", true);

		$items = array();

		$atts = shortcode_atts(array(
			'parent' => null
		), $atts);

		// 親ターム名からIDを検索する
		$parentTermId = 0;
		if(!empty($atts['parent'])){
			$parentTerm = get_term_by('name', $atts['parent'], $this->taxName);
			if(!empty($parentTerm)){
				$parentTermId = $parentTerm->term_id;
				$parentTermSlug = $parentTerm->slug;
			}
		}

		// 親タームに直下のタームを取得する
		$terms = get_terms($this->taxName, array('parent' => $parentTermId));
		if(!empty($terms)){
			foreach ( $terms as $term ){
				$termId = $term->term_id;
				$termSlug = $term->slug;
				$termName = $term->name;
				$termDesc = $term->description;
				$termCount = $term->count;

				$termOptionImgVal = get_option("term_option_img_".$termId);

				$termPosts = get_posts(array(
					'post_type' => 'page',
					'tax_query' => array(
						array(
						'taxonomy' => $this->taxName,
						'field' => 'slug',
						'terms' => $termSlug
						)
					)
				));

				$itemPosts = array();
				if(!empty($termPosts)){
					foreach ($termPosts as $termPost){
						$termPostId = $termPost->ID;
						$termPostTitle = $termPost->post_title;
						$termPostExcerpt = $termPost->post_excerpt;
						$termPostPermalink = get_permalink($termPostId);

						$termPostThumbnail = "";
						$termPostThumbnailId = get_post_thumbnail_id($termPostId);
						if($termPostThumbnailId){
							$termPostThumbnailArray = wp_get_attachment_image_src($termPostThumbnailId, 'large');
							$termPostThumbnail = $termPostThumbnailArray[0];
						}

						$itemPosts[] = array(
							'ID' => $termPostId,
							'title' => $termPostTitle,
							'excerpt' => $termPostExcerpt,
							'url' => $termPostPermalink,
							'eyecatch' => $termPostThumbnail
						);
						
					}
				}

				$items[] = array(
					'ID' => $termId,
					'slug' => $termSlug,
					'name' => $termName,
					'description' => $termDesc,
					'count' => $termCount,
					'img' => $termOptionImgVal,
					'posts' => $itemPosts
				);
			}
		}

		$resId = "addon-browser-" . $parentTermSlug;
		$resValname = "addon_browser_" . $parentTermId;

		$catalog = array(
			'terms' => $items
		);

		$res = '<script type="text/javascript">';
		$res .= 'var '.$resValname . "='".json_encode($catalog)."';";
		$res .= 'console.log(JSON.parse('.$resValname.'));';
		$res .= "</script>";
		$res .= '<div id="'.$resId.'"class="addon-browser" data-catalog="'.$resValname.'">Addon Browser</div>';
		return $res;
	}

}

$samplePlugin = new WP_QuestetraAddonContent();


