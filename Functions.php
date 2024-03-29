<?php
/**
 * grit functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package grit
 * 
 */

if ( ! defined( '_S_VERSION' ) ) {
    // Replace the version number of the theme on each release.
    define( '_S_VERSION', '1.0.0' );
}

if( function_exists('acf_add_options_page') ) {

    acf_add_options_page(array(
        'page_title' 	=> 'Grit General Settings',
        'menu_title'	=> 'Grit Settings',
        'menu_slug' 	=> 'theme-general-settings',
        'capability'	=> 'edit_posts',
        'redirect'		=> false
    ));

    acf_add_options_sub_page(array(
        'page_title' 	=> 'Grit Header Settings',
        'menu_title'	=> 'Header',
        'parent_slug'	=> 'theme-general-settings',
    ));

    acf_add_options_sub_page(array(
        'page_title' 	=> 'Grit Footer Settings',
        'menu_title'	=> 'Footer',
        'parent_slug'	=> 'theme-general-settings',
    ));

}

/**
 * Sets up theme defaults and registers support for various WordPress features.
 *
 * Note that this function is hooked into the after_setup_theme hook, which
 * runs before the init hook. The init hook is too late for some features, such
 * as indicating support for post thumbnails.
 */
function grit_setup() {
    /*
        * Make theme available for translation.
        * Translations can be filed in the /languages/ directory.
        * If you're building a theme based on grit, use a find and replace
        * to change 'grit' to the name of your theme in all the template files.
        */
    load_theme_textdomain( 'grit', get_template_directory() . '/languages' );

    // Add default posts and comments RSS feed links to head.
    add_theme_support( 'automatic-feed-links' );

    /*
        * Let WordPress manage the document title.
        * By adding theme support, we declare that this theme does not use a
        * hard-coded <title> tag in the document head, and expect WordPress to
        * provide it for us.
        */
    add_theme_support( 'title-tag' );

    /*
        * Enable support for Post Thumbnails on posts and pages.
        *
        * @link https://developer.wordpress.org/themes/functionality/featured-images-post-thumbnails/
        */
    add_theme_support( 'post-thumbnails' );

    // This theme uses wp_nav_menu() in one location.
    register_nav_menus(
        array(
            'menu-1' => esc_html__( 'Primary', 'grit' ),
        )
    );

    /*
        * Switch default core markup for search form, comment form, and comments
        * to output valid HTML5.
        */
    add_theme_support(
        'html5',
        array(
            'search-form',
            'comment-form',
            'comment-list',
            'gallery',
            'caption',
            'style',
            'script',
        )
    );

    // Set up the WordPress core custom background feature.
    add_theme_support(
        'custom-background',
        apply_filters(
            'grit_custom_background_args',
            array(
                'default-color' => 'ffffff',
                'default-image' => '',
            )
        )
    );

    // Add theme support for selective refresh for widgets.
    add_theme_support( 'customize-selective-refresh-widgets' );

    /**
     * Add support for core custom logo.
     *
     * @link https://codex.wordpress.org/Theme_Logo
     */
    add_theme_support(
        'custom-logo',
        array(
            'height'      => 250,
            'width'       => 250,
            'flex-width'  => true,
            'flex-height' => true,
        )
    );
}

add_action( 'after_setup_theme', 'grit_setup' );

/**
 * Set the content width in pixels, based on the theme's design and stylesheet.
 *
 * Priority 0 to make it available to lower priority callbacks.
 *
 * @global int $content_width
 */
function grit_content_width() {
    $GLOBALS['content_width'] = apply_filters( 'grit_content_width', 640 );
}
add_action( 'after_setup_theme', 'grit_content_width', 0 );

/**
 * Register widget area.
 *
 * @link https://developer.wordpress.org/themes/functionality/sidebars/#registering-a-sidebar
 */
function grit_widgets_init() {
    register_sidebar(
        array(
            'name'          => esc_html__( 'Sidebar', 'grit' ),
            'id'            => 'sidebar-1',
            'description'   => esc_html__( 'Add widgets here.', 'grit' ),
            'before_widget' => '<section id="%1$s" class="widget %2$s">',
            'after_widget'  => '</section>',
            'before_title'  => '<h2 class="widget-title">',
            'after_title'   => '</h2>',
        )
    );
}
add_action( 'widgets_init', 'grit_widgets_init' );

/**
 * Enqueue scripts and styles.
 */
function grit_scripts() {
    wp_enqueue_style( 'grit-style', get_stylesheet_uri(), array(), _S_VERSION );
    wp_style_add_data( 'grit-style', 'rtl', 'replace' );

    wp_enqueue_script( 'grit-navigation', get_template_directory_uri() . '/js/navigation.js', array(), _S_VERSION, true );

    if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
        wp_enqueue_script( 'comment-reply' );
    }
}
add_action( 'wp_enqueue_scripts', 'grit_scripts' );

/**
 * Implement the Custom Header feature.
 */
require get_template_directory() . '/inc/custom-header.php';

/**
 * Custom template tags for this theme.
 */
require get_template_directory() . '/inc/template-tags.php';

/**
 * Functions which enhance the theme by hooking into WordPress.
 */
require get_template_directory() . '/inc/template-functions.php';

/**
 * Customizer additions.
 */
require get_template_directory() . '/inc/customizer.php';

/**
 * Load Jetpack compatibility file.
 */
if ( defined( 'JETPACK__VERSION' ) ) {
    require get_template_directory() . '/inc/jetpack.php';
}


/* CUSTOM FUNCTION */

function get_link_by_slug($slug, $type = 'post', $hash = '')
{
    $post = get_page_by_path($slug, OBJECT, $type);
    if(!empty($hash) && isset($hash)) {
        $hash = '#'.$hash;
    }
    return get_permalink($post->ID). $hash;
}

function getCurrentUrl(){
    $actual_link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
    return $actual_link;
}

// Outputs the contact form that supports zoho connection

function grit_event_form() {
    ob_start();
    ?>
    <form action="#" name="grit_event_form" method="post" class="wpcf7-form sent" novalidate="novalidate" data-status="sent" aria-label="Form">
        <div class="form-row form-fields">
            <span class="wpcf7-form-control-wrap" data-name="Name">
                  <input type="hidden" name="Name" id="name" value="" aria-required="true">
            </span>
        </div>
        <div class="form-row form-fields">
            <span class="wpcf7-form-control-wrap" data-name="First_Name">
                <span class="error" style="color: #db0d1a; font-size: 14px;position: absolute; top: 27px;padding-left:12px;"></span>
                <input type="text" name="First_Name" value="" size="40" class="wpcf7-form-control wpcf7-text wpcf7-validates-as-required text-field-2 w-input" id="fname" aria-required="true" aria-invalid="false" placeholder="My first name is...">
            </span>
            <span class="wpcf7-form-control-wrap" data-name="Last_Name">
                <span class="error" style="color: #db0d1a; font-size: 14px;position: absolute; top: 27px;padding-left:12px;"></span>
                <input type="text" name="Last_Name" value="" size="40" class="wpcf7-form-control wpcf7-text wpcf7-validates-as-required text-field-2 w-input" id="lname" aria-required="true" aria-invalid="false" placeholder="My last name is...">
            </span>
        </div>
        <div class="form-row- form-fields">
            <span class="wpcf7-form-control-wrap" data-name="Email">
                <span class="error" style="color: #db0d1a; font-size: 14px;position: absolute; top: 27px;padding-left:12px;"></span>
                <input type="email" name="Email" value="" size="40" class="wpcf7-form-control wpcf7-text wpcf7-email wpcf7-validates-as-required wpcf7-validates-as-email text-field-2 last-field w-input" id="Email-4" aria-required="true" aria-invalid="false" placeholder="Email address">
            </span>
            <span class="wpcf7-form-control-wrap" data-name="Phone">
                <span class="error" style="color: #db0d1a; font-size: 14px;position: absolute; top: 27px;padding-left:12px;"></span>
                <input type="Phone" name="Phone" value="" size="40" class="wpcf7-form-control wpcf7-text wpcf7-tel wpcf7-validates-as-required wpcf7-validates-as-tel text-field-2 w-input" id="phone" aria-required="true" aria-invalid="false" placeholder="Contact no...">
            </span>
        </div>
        <div class="submit-button-container">
            <div class="submit-button-wrapper">
                <div class="svg-button w-embed"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 365.571 97.469">
                        <path id="Union_5" data-name="Union 5" d="M312.336,97.46H0V0h259.11l0-.008H365.569Z" transform="translate(0.002 0.009)" fill="#2d7f79"></path></svg></div>
                <div><input type="button" value="Submit" id="eventSubmit" class="wpcf7-form-control has-spinner wpcf7-submit submit-button w-button"><span class="wpcf7-spinner"></span></div>
                <div class="button-shadow"></div>
            </div>
            <div class="wpcf7-response-output" aria-hidden="true" style="display: none;">Thank you for your message. It has been sent.</div>
        </div>
    </form>

    <?php

    return ob_get_clean();
}
function grit_contact_form_home() {
    ob_start();
    ?>
    <form action="#" name="grit_contact_form" method="post" class="wpcf7-form sent" novalidate="novalidate" data-status="sent" aria-label="Form">

        <div class="form-row form-fields">
            <span class="wpcf7-form-control-wrap" data-name="First_Name">
                <span class="error" style="color: #db0d1a; font-size: 14px;position: absolute; top: 27px;padding-left:12px;"></span>
                <input type="text" name="First_Name" value="" size="40" class="wpcf7-form-control wpcf7-text wpcf7-validates-as-required text-field-2 w-input" id="fname" aria-required="true" aria-invalid="false" placeholder="My first name is...">
            </span>
            <span class="wpcf7-form-control-wrap" data-name="Last_Name">
                <span class="error" style="color: #db0d1a; font-size: 14px;position: absolute; top: 27px;padding-left:12px;"></span>
                <input type="text" name="Last_Name" value="" size="40" class="wpcf7-form-control wpcf7-text wpcf7-validates-as-required text-field-2 w-input" id="lname" aria-required="true" aria-invalid="false" placeholder="My last name is...">
            </span>
        </div>
        <div class="form-row- form-fields">
            <span class="wpcf7-form-control-wrap" data-name="Email">
                <span class="error" style="color: #db0d1a; font-size: 14px;position: absolute; top: 27px;padding-left:12px;"></span>
                <input type="email" name="Email" value="" size="40" class="wpcf7-form-control wpcf7-text wpcf7-email wpcf7-validates-as-required wpcf7-validates-as-email text-field-2 last-field w-input" id="Email-4" aria-required="true" aria-invalid="false" placeholder="Email address">
            </span>
            <span class="wpcf7-form-control-wrap" data-name="Phone">
                <span class="error" style="color: #db0d1a; font-size: 14px;position: absolute; top: 27px;padding-left:12px;"></span>
                <input type="Phone" name="Phone" value="" size="40" class="wpcf7-form-control wpcf7-text wpcf7-tel wpcf7-validates-as-required wpcf7-validates-as-tel text-field-2 w-input" id="phone" aria-required="true" aria-invalid="false" placeholder="Contact no...">
            </span>
        </div>
        <div class="form-fields">
            <span class="wpcf7-form-control-wrap" data-name="Description">
                <span class="error" style="color: #db0d1a; font-size: 14px;position: absolute; top: 27px;padding-left:12px;"></span>
                <input type="text" name="Description" value="" size="40" class="wpcf7-form-control wpcf7-text wpcf7-validates-as-required text-field-2 last-field w-input" id="Description" aria-required="true" aria-invalid="false" placeholder="I m looking to...">
            </span>
        </div>
        <div class="submit-button-container">
            <div class="submit-button-wrapper">
                <div class="svg-button w-embed"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 365.571 97.469">
                        <path id="Union_5" data-name="Union 5" d="M312.336,97.46H0V0h259.11l0-.008H365.569Z" transform="translate(0.002 0.009)" fill="#2d7f79"></path></svg></div>
                <div><input type="button" value="Submit" id="contactSubmit" class="wpcf7-form-control has-spinner wpcf7-submit submit-button w-button"><span class="wpcf7-spinner"></span></div>
                <div class="button-shadow"></div>
            </div>
            <div class="wpcf7-response-output" aria-hidden="true" style="display: none;">Thank you for your message. It has been sent.</div>
        </div>
    </form>

    <?php

    return ob_get_clean();
}

add_shortcode('grit_contact_form_home', 'grit_contact_form_home');
add_shortcode('grit_event_form', 'grit_event_form');

wp_enqueue_script( 'grit-contact-forms', get_template_directory_uri() . '/js/contact_forms.js', array('jquery'), _S_VERSION, false );

wp_add_inline_script( 'grit-contact-forms', 'const FORMVARS = ' . json_encode( array(
        '_ajax_url' => admin_url( 'admin-ajax.php' ),
        '_ajax_nonce' => wp_create_nonce( '_ajax_nonce' ),
    ) ), 'before' );

// Send grit form to backend
add_action('wp_ajax_send_grit_contact_form', 'send_grit_contact_form');
add_action('wp_ajax_nopriv_send_grit_contact_form', 'send_grit_contact_form');

add_action('wp_ajax_send_grit_event_form', 'send_grit_event_form');
add_action('wp_ajax_nopriv_send_grit_event_form', 'send_grit_event_form');

function send_grit_event_form()
{
    check_ajax_referer( '_ajax_nonce_grit_contact', 'security', false );

    $form_fields = [
        "First_Name",
        "Last_Name",
        "Phone",
        "Email"
    ];
    $form_errors = [];

    foreach ($form_fields as $form_field) {
        if ( empty( $_POST[$form_field] ) ) {
            $form_errors[] = [$form_field => ["{$form_field} is empty"]];
        }
    }
    if (!empty($_POST["Email"]) && !filter_var($_POST["Email"], FILTER_VALIDATE_EMAIL)){
        $form_errors[] = ["Email" => ["Email is invalid"]];
    }

    if (count($form_errors) > 0) {
        wp_send_json_error(['errors' => $form_errors]);
        wp_die();
    } else {
        $result = grit_send_api_zoho([
            "Name" => $_POST["Name"],
            "First_Name" => $_POST["First_Name"],
            "Last_Name" => $_POST["Last_Name"],
            "Email" => $_POST["Email"],
            "Phone" => $_POST["Phone"],
            "Source" => "Website"
        ], 'Grit_Events');

        if ($result[0] == 'error') {
            wp_send_json_error(['server_error' => $result[1]]);
            wp_die();
        }

        if ($result[0] == 'success'){
            wp_send_json_success($result[1]);
            wp_die();
        }
    }
}
function send_grit_contact_form()
{
    check_ajax_referer( '_ajax_nonce_grit_contact', 'security', false );

    $form_fields = [
        "First_Name",
        "Last_Name",
        "Phone",
        "Email"
    ];
    $form_errors = [];

    foreach ($form_fields as $form_field) {
        if ( empty( $_POST[$form_field] ) ) {
            $form_errors[] = [$form_field => ["{$form_field} is empty"]];
        }
    }
    if (!empty($_POST["Email"]) && !filter_var($_POST["Email"], FILTER_VALIDATE_EMAIL)){
        $form_errors[] = ["Email" => ["Email is invalid"]];
    }

    if (count($form_errors) > 0) {
        wp_send_json_error(['errors' => $form_errors]);
        wp_die();
    } else {
        $result = grit_send_api_zoho([
                "First_Name" => $_POST["First_Name"],
                "Last_Name" => $_POST["Last_Name"],
                "Email" => $_POST["Email"],
                "Phone" => $_POST["Phone"],
                "Description" => $_POST["Description"],
                "Lead_Source" => "Website"
        ], 'Leads');

        if ($result[0] == 'error') {
            wp_send_json_error(['server_error' => $result[1]]);
            wp_die();
        }

        if ($result[0] == 'success'){
            wp_send_json_success($result[1]);
            wp_die();
        }
    }
}
function grit_send_api_zoho($formData, $module){
    $refresh_token = '1000.3d353d0acfad6673b8c85ec048a6e1f6.3d75bebe450ceb22d9e342bafd023e1d';
    $client_id = '1000.M9M2MHLDWYGLIOPXUWZG3PU9FT2MOH';
    $client_secret = 'ceeb87f87b567da653f1b74abaf4e60fff63c93efd';
    $redirect_url = 'https://gritproperty.com.au';

    $params = [
        'refresh_token' => $refresh_token,
        'grant_type'    => 'refresh_token',
        'client_id'     => $client_id,
        'client_secret' => $client_secret,
        'redirect_uri'  => $redirect_url,
        'scope'         => 'ZohoCRM.modules.CREATE'
    ];


    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://accounts.zoho.com/oauth/v2/token');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
    $response = curl_exec($ch);
    if (curl_errno($ch)) {
        $error_msg = curl_error($ch);
    }
    curl_close ($ch);

    if (!isset($error_msg)) {
        $data = json_decode($response, true);
        $token = $data['access_token'];

        $data = $formData;
        $data_string = json_encode(array("data" => array($data)));
        $ch = curl_init();


        curl_setopt($ch, CURLOPT_URL, 'https://www.zohoapis.com/crm/v2/'.$module);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_FAILONERROR, true);

        $headers = array();
        $headers[] = "Content-Type: application/json";
        $headers[] = "Authorization: Zoho-oauthtoken $token";
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);


        $response = curl_exec($ch);
        if (curl_errno($ch)) {
            $error_msg = curl_error($ch);
        }
        curl_close($ch);

        if(!$response && isset($error_msg)){
            return ['error',$error_msg];
        } else {
            return ['success',$response];
        }
    }

}

/**
 * @param   int     $post_id    The ID of the post.
 * @param   WP_Post $post       The post object.
 * @param   bool    $update     True if the post already exists and is being updated
 */
function wpse_185340_post_ping( $post_id, $post, $update) {
    //if ( $post->post_status === 'publish' ) { // Only fire when published
       if($post->post_type=='agent' && get_post_meta($post_id,'uniquelistingagentid',true) == ""){
		   update_post_meta($post_id,'uniquelistingagentid',vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex(random_bytes(16)), 4)),'');
	   }
	if($post->post_type=='residential_home' && get_post_meta($post_id,'uniqueid',true) == ""){
		   update_post_meta($post_id,'uniqueid',vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex(random_bytes(16)), 4)),'');
	   }
	if($post->post_type=='residential_rental' && get_post_meta($post_id,'uniqueid',true) == ""){
		   update_post_meta($post_id,'uniqueid',vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex(random_bytes(16)), 4)),'');
	   }
	if($post->post_type=='residential_land' && get_post_meta($post_id,'uniqueid',true) == ""){
		   update_post_meta($post_id,'uniqueid',vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex(random_bytes(16)), 4)),'');
	   }
	if(get_post_meta($post_id,'publish-to-realestateau',true)=="true"){
		
		$response = wp_remote_post(
            'http://34.228.13.110:3000/api/exportproperty/export',
            array(
                'timeout'     => 45,
				'headers'=>array('Content-Type' => 'application/json' ),
                // https://codex.wordpress.org/HTTP_API
                'blocking' => true, // If you don't need to know the response, disable blocking for an "async" request
                'body' => json_encode(array(
                    'post_id' => $post_id,
					'post_type' =>  $post->post_type,
					'publish'=> get_post_meta($post_id,'publish-to-realestateau',true)
                    // or whatever
                ))
            )
        );
        if(!is_wp_error($response)){
            if(json_decode($response['body'])->status == 'Unsuccessful'){
			    update_post_meta($post_id, 'uploadid', json_decode($response['body'])->msg,'');
		    }else{
			    update_post_meta($post_id, 'uploadid', json_decode($response['body'])->uploadId,'');
		    }
        }else{
             update_post_meta($post_id, 'upload-error', $response->get_error_message(),'');
             update_post_meta($post_id, 'uploadid', "",'');
        }
		//update_post_meta($post_id, 'uploadid', json_decode($response['body'])->uploadId,'');
		
	}
    //}  
	//wp_remote_get('http://34.228.13.110:3000/api/postproperty/a');
}

add_action( 'wp_insert_post', 'wpse_185340_post_ping', 10,3 );


function file_renamer( $filename ) {
    $info = pathinfo( $filename );
    $ext  = empty( $info['extension'] ) ? '' : '.' . $info['extension'];
    $name = basename( $filename, $ext );


    if( $post_id = array_key_exists("post_id", $_POST) ? $_POST["post_id"] : null) {
        if($post = get_post($post_id)) {
            return get_post_meta($post_id,'uniqueid',true) . $ext;
        }
    }
    
    $my_image_title = $post;
    

    $file['name'] = $my_image_title  . - uniqid() . $ext; // uniqid method
    // $file['name'] = md5($name) . $ext; // md5 method
    // $file['name'] = base64_encode($name) . $ext; // base64 method

    return  $filename;


  }
add_filter( 'sanitize_file_name', 'file_renamer', 10, 1 ); 


/*
add_action( 'post_submitbox_misc_actions', 'wpdocs_post_submitbox_misc_actions' );


function wpdocs_post_submitbox_misc_actions($post){
	echo '<script>
			uploadStatus = function(){
				var element = document.getElementById("upload-status-text")
				element.innerText =  "' . $post->ID .'"
			}
		</script>
		<div class="misc-pub-section my-options">
			<input class="button" type="button" value="Upload Status" style="cursor:pointer" onClick="uploadStatus()" />
			<p id="upload-status-text"></p>
		</div>';
}
*/

function add_content_after_editor() {
	global $post;
	if($post->post_type == "residential_home" || $post->post_type == "residential_rental" || $post->post_type == "residential_land"){
		if((get_post_meta($post->ID,'uploadid',true) && get_post_meta($post->ID,'uploadid',true) != "")|| 
		    (get_post_meta($post->ID,'upload-error',true) && get_post_meta($post->ID,'upload-error',true) != "")){
		        if(get_post_meta($post->ID,'uploadid',true) != ""){
		            $response = wp_remote_get('http://34.228.13.110:3000/api/exportproperty/uploaddetails?uploadid='. get_post_meta($post->ID,'uploadid',true), array('blocking' => true));
		        }
		        
			echo '<button type="button" style="margin-top:20px;border: 1px solid rgb(195, 196, 199);color: #1d2327;
			            display: block;background: rgb(255, 255, 255);" class="collapsible" 
			                        onclick="(function(){
                                        var tab = document.getElementById(\'content\');
	                                    if(!tab.style.display || tab.style.display===\'none\'){
		                                    tab.style.display=\'block\';
	                                    }else{
		                                      tab.style.display=\'none\';
	                                    }
                                        return false;
                                    })();return false;">
                    <h2 class="hndle ui-sortable-handle">Upload Details - Click to Open/Close</h2>
                </button>';
                
			echo '<div id="content" class="postbox content" style="border:1px solid #c3c4c7;border-top: 0px solid black;color:black;display:block; background:#ffffff;">
						<div class="inside">';
						
			echo 			'<pre id="result-sentence">';
			
			if(get_post_meta($post->ID,"uploadid",true) != ""){
			    if(json_decode($response['body'])->status == 'Unsuccessful'){
				    echo json_decode($response['body'])->msg;
			    }else{
				    echo json_encode(json_decode($response['body'])->result,JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
			    }
			}else{
			    echo get_post_meta($post->ID,'upload-error',true);
			}
			
			echo 			'</pre>';
			echo      '</div>';
			echo '</div>';
		}
	}
}
add_action( 'edit_form_after_title', 'add_content_after_editor' );

function import_axios_js() {
    //$url = get_bloginfo('template_directory') . '/js/wp-admin.js';
    echo '<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>';
    echo 
        '<script>
            function syntaxHighlight(json) {
                json = json.replace(/&/g, \'&amp;\').replace(/</g, \'&lt;\').replace(/>/g, \'&gt;\');
                return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                var cls = \'number\';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = \'key\';
                    } else {
                        cls = \'string\';
                    }
                } else if (/true|false/.test(match)) {
                    cls = \'boolean\';
                } else if (/null/.test(match)) {
                    cls = \'null\';
                }
                return \'<span class="\' + cls + \'">\' + match + \'</span>\';
            });
        }
        document.addEventListener("DOMContentLoaded", function () {
            const para = document.getElementById("result-sentence");
            para.innerHTML = syntaxHighlight(para.innerHTML);
        });
        </script>';
}
add_action('admin_footer', 'import_axios_js');

function import_style(){
    echo '<style>.collapsible {
  background-color: #fff;
  color: #1d2327;
  cursor: pointer;
  padding: 0px;
  width: 100%;
  border: none;
  text-align: left;
  outline: none;
  font-size: 15px;
}

.active, .collapsible:hover {
  background-color: #555;
}

.content {
  padding: 0 18px;
  display: none;
  overflow: hidden;
  background-color: #f1f1f1;
  
 .string {
            color: rgb(0, 168, 0);
        }

        .number {
            color: rgb(171, 94, 0);
        }

        .boolean {
            color: rgb(0, 0, 156);
        }

        .null {
            color: rgb(151, 1, 151);
        }

        .key {
            color: rgb(147, 0, 0);
        }
}</style>';
}
add_action('admin_head', 'import_style');