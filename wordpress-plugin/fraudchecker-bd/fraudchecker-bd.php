<?php
/**
 * Plugin Name: FraudChecker BD — WooCommerce Courier Fraud & Risk Screener
 * Plugin URI: https://fraudchecker-bd.vercel.app
 * Description: Real-time customer delivery success rate screening across Steadfast, Pathao & RedX. Detect fake COD orders and 1-click book consignments directly from WooCommerce orders list.
 * Version: 1.0.0
 * Author: FraudChecker BD Team
 * Author URI: https://fraudchecker-bd.vercel.app
 * Text Domain: fraudchecker-bd
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * WC requires at least: 5.0
 * WC tested up to: 9.3
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class FraudCheckerBD {
    private static $instance = null;
    private $api_base_url = 'https://fraudchecker-bd.vercel.app/api/v1';

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct() {
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);

        // WooCommerce Orders Column (Legacy CPT & High-Performance Order Storage / HPOS)
        add_filter('manage_edit-shop_order_columns', [$this, 'add_order_fraud_column']);
        add_action('manage_shop_order_posts_custom_column', [$this, 'render_order_fraud_column'], 10, 2);

        // HPOS Compatibility (WooCommerce 8+)
        add_filter('woocommerce_shop_order_list_table_columns', [$this, 'add_order_fraud_column']);
        add_action('woocommerce_shop_order_list_table_custom_column', [$this, 'render_order_fraud_column_hpos'], 10, 2);

        // AJAX 1-Click Courier Booking Action
        add_action('wp_ajax_fraudchecker_book_parcel', [$this, 'ajax_book_parcel']);
    }

    public function add_admin_menu() {
        add_menu_page(
            'FraudChecker BD',
            'FraudChecker BD',
            'manage_woocommerce',
            'fraudchecker-bd',
            [$this, 'render_settings_page'],
            'dashicons-shield-alt',
            56
        );
    }

    public function register_settings() {
        register_setting('fraudchecker_settings_group', 'fraudchecker_api_key');
        register_setting('fraudchecker_settings_group', 'fraudchecker_default_courier');
        register_setting('fraudchecker_settings_group', 'fraudchecker_auto_screen');
    }

    public function render_settings_page() {
        $api_key = get_option('fraudchecker_api_key', '');
        $default_courier = get_option('fraudchecker_default_courier', 'steadfast');
        $auto_screen = get_option('fraudchecker_auto_screen', 'yes');
        ?>
        <div class="wrap" style="max-width: 850px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="background: #fff; padding: 25px 35px; border-radius: 12px; border: 1px solid #ccd0d4; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-top: 20px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
                    <div style="background: #085DAE; color: #fff; padding: 10px; border-radius: 8px; font-size: 20px;">
                        🛡️
                    </div>
                    <div>
                        <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #1d2327;">FraudChecker BD — WooCommerce Settings</h1>
                        <p style="margin: 4px 0 0; color: #646970; font-size: 13px;">Configure your API Key and 1-Click Courier Dispatch settings</p>
                    </div>
                </div>

                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">

                <form method="post" action="options.php">
                    <?php settings_fields('fraudchecker_settings_group'); ?>
                    <?php do_settings_sections('fraudchecker_settings_group'); ?>

                    <table class="form-table" style="font-size: 14px;">
                        <tr>
                            <th scope="row" style="width: 220px; font-weight: 600;">FraudChecker API Key</th>
                            <td>
                                <input type="password" name="fraudchecker_api_key" value="<?php echo esc_attr($api_key); ?>" style="width: 100%; max-width: 450px; padding: 8px 12px; border-radius: 6px; font-family: monospace;" placeholder="fc_live_..." />
                                <p class="description" style="margin-top: 6px; font-size: 12px;">Get your free API Key from <a href="https://fraudchecker-bd.vercel.app/dashboard" target="_blank">FraudChecker BD Merchant Dashboard</a>.</p>
                            </td>
                        </tr>

                        <tr>
                            <th scope="row" style="font-weight: 600;">Default 1-Click Courier</th>
                            <td>
                                <select name="fraudchecker_default_courier" style="padding: 6px 12px; border-radius: 6px;">
                                    <option value="steadfast" <?php selected($default_courier, 'steadfast'); ?>>Steadfast Courier</option>
                                    <option value="pathao" <?php selected($default_courier, 'pathao'); ?>>Pathao Courier</option>
                                </select>
                                <p class="description" style="margin-top: 6px; font-size: 12px;">Orders will be booked into this courier when you click "1-Click Dispatch". Ensure your courier keys are saved in your FraudChecker dashboard.</p>
                            </td>
                        </tr>

                        <tr>
                            <th scope="row" style="font-weight: 600;">Automatic Order Screening</th>
                            <td>
                                <label>
                                    <input type="checkbox" name="fraudchecker_auto_screen" value="yes" <?php checked($auto_screen, 'yes'); ?> />
                                    Automatically screen customer delivery rate upon loading the WooCommerce Orders list
                                </label>
                            </td>
                        </tr>
                    </table>

                    <p class="submit" style="margin-top: 25px;">
                        <input type="submit" name="submit" id="submit" class="button button-primary" value="Save Settings" style="background: #085DAE; border-color: #085DAE; padding: 6px 20px; border-radius: 6px; font-weight: 600;" />
                    </p>
                </form>
            </div>
        </div>
        <?php
    }

    public function add_order_fraud_column($columns) {
        $new_columns = [];
        foreach ($columns as $key => $column) {
            $new_columns[$key] = $column;
            if ($key === 'order_status') {
                $new_columns['fraud_risk'] = '🛡️ Fraud Risk';
            }
        }
        if (!isset($new_columns['fraud_risk'])) {
            $new_columns['fraud_risk'] = '🛡️ Fraud Risk';
        }
        return $new_columns;
    }

    public function render_order_fraud_column($column, $post_id) {
        if ($column === 'fraud_risk') {
            $order = wc_get_order($post_id);
            if ($order) {
                $this->display_fraud_badge($order);
            }
        }
    }

    public function render_order_fraud_column_hpos($column, $order) {
        if ($column === 'fraud_risk' && is_a($order, 'WC_Order')) {
            $this->display_fraud_badge($order);
        }
    }

    private function display_fraud_badge($order) {
        $phone = $order->get_billing_phone();
        if (empty($phone)) {
            echo '<span style="color: #999; font-size: 11px;">No Phone</span>';
            return;
        }

        $api_key = get_option('fraudchecker_api_key', '');
        if (empty($api_key)) {
            echo '<a href="' . admin_url('admin.php?page=fraudchecker-bd') . '" style="color: #085DAE; font-size: 11px; text-decoration: underline;">Setup Key</a>';
            return;
        }

        // Cache result in order meta for 48 hours to avoid repeated API calls
        $cached_score = $order->get_meta('_fraudchecker_score');
        $cached_risk = $order->get_meta('_fraudchecker_risk');

        if ($cached_score === '' || $cached_risk === '') {
            $response = wp_remote_post($this->api_base_url . '/fraud-check', [
                'timeout' => 5,
                'headers' => [
                    'Content-Type' => 'application/json',
                    'X-API-KEY'    => $api_key,
                ],
                'body' => json_encode(['phone' => $phone]),
            ]);

            if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
                $data = json_decode(wp_remote_retrieve_body($response), true);
                $cached_score = $data['score'] ?? 0;
                $cached_risk = $data['riskLevel'] ?? 'Safe';

                $order->update_meta_data('_fraudchecker_score', $cached_score);
                $order->update_meta_data('_fraudchecker_risk', $cached_risk);
                $order->save();
            } else {
                $cached_score = '--';
                $cached_risk = 'Unknown';
            }
        }

        // Render styled colored badge
        $bg = '#e6f4ea'; $color = '#137333'; $border = '#ceead6';
        if ($cached_risk === 'High Risk') {
            $bg = '#fce8e6'; $color = '#c5221f'; $border = '#fad2cf';
        } elseif ($cached_risk === 'Moderate Risk') {
            $bg = '#fef7e0'; $color = '#b06000'; $border = '#feefc3';
        } elseif ($cached_risk === 'New Customer') {
            $bg = '#e8f0fe'; $color = '#1a73e8'; $border = '#d2e3fc';
        }

        echo '<div style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; background: ' . $bg . '; color: ' . $color . '; border: 1px solid ' . $border . ';">';
        echo '<span>' . esc_html($cached_score) . '%</span>';
        echo '<span style="opacity: 0.8;">• ' . esc_html($cached_risk) . '</span>';
        echo '</div>';
    }

    public function ajax_book_parcel() {
        check_ajax_referer('fraudchecker_nonce', 'security');

        if (!current_user_can('manage_woocommerce')) {
            wp_send_json_error(['message' => 'Unauthorized']);
        }

        $order_id = intval($_POST['order_id'] ?? 0);
        $order = wc_get_order($order_id);
        if (!$order) {
            wp_send_json_error(['message' => 'Order not found']);
        }

        $api_key = get_option('fraudchecker_api_key', '');
        $default_courier = get_option('fraudchecker_default_courier', 'steadfast');

        $payload = [
            'courierCode'      => $default_courier,
            'invoiceId'        => (string)$order->get_id(),
            'recipientName'    => $order->get_formatted_billing_full_name(),
            'recipientPhone'   => $order->get_billing_phone(),
            'recipientAddress' => $order->get_billing_address_1() . ', ' . $order->get_billing_city(),
            'codAmount'        => (float)$order->get_total(),
            'note'             => 'WooCommerce Order #' . $order->get_id(),
        ];

        $response = wp_remote_post($this->api_base_url . '/courier/book', [
            'timeout' => 8,
            'headers' => [
                'Content-Type' => 'application/json',
                'X-API-KEY'    => $api_key,
            ],
            'body' => json_encode($payload),
        ]);

        if (is_wp_error($response)) {
            wp_send_json_error(['message' => $response->get_error_message()]);
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);
        if (!empty($data['success'])) {
            $tracking = $data['trackingCode'] ?? '';
            $order->add_order_note('Booked via FraudChecker BD with ' . ucfirst($default_courier) . '. Tracking Code: ' . $tracking);
            wp_send_json_success(['message' => 'Booked! Tracking: ' . $tracking]);
        } else {
            wp_send_json_error(['message' => $data['message'] ?? 'Failed to book parcel']);
        }
    }
}

add_action('plugins_loaded', ['FraudCheckerBD', 'get_instance']);
