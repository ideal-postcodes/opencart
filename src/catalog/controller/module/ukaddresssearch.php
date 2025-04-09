<?php
namespace Opencart\Catalog\Controller\Extension\idealpostcodes\Module;
class Ukaddresssearch extends \Opencart\System\Engine\Controller
{
    public function index()
    {
        // Get the value whether website uses SSL
        $isSSL = $this->config->get('config_ssl');
        
        if (!empty($isSSL)) {
            $data['absolutePath'] = $this->config->get('config_ssl');
        } else {
            $data['absolutePath'] = $this->config->get('config_url');
        }

        $data['idpcConfig'] = $this->getConfig();
        $data['postcodeLookupOverride'] = $data['idpcConfig']['postcodeLookupOverride'] ?? '{}';
        $data['autocompleteOverride'] = $data['idpcConfig']['autocompleteOverride'] ?? '{}';
        $data['customFields'] = $data['idpcConfig']['customFields'] ?? '[]';

        return $this->load->view('extension/idealpostcodes/module/ukaddresssearch', $data);
    }
    
    // This method will be called from the header controller
    public function injectConfig(&$route, &$data, &$output) 
    {
        // Load the setting model
        $this->load->model('setting/setting');
        
        // Only inject if module is enabled
        $settings = $this->model_setting_setting->getSetting('module_ukaddresssearch');
        if (!isset($settings['module_ukaddresssearch_status']) || !$settings['module_ukaddresssearch_status']) {
            return;
        }
        
        // Get the configuration
        $config = $this->getConfig();
        
        // Only proceed if API key is set and module is enabled
        if (empty($config['apiKey']) || !$config['enabled']) {
            return;
        }
        
        // Get the base URL
        $isSSL = $this->config->get('config_ssl');
        if (!empty($isSSL)) {
            $absolutePath = $this->config->get('config_ssl');
        } else {
            $absolutePath = $this->config->get('config_url');
        }
        
        // Create the script tag with configuration
        $script = "<script type=\"text/javascript\">\n";
        $script .= "window.idpcConfig = " . json_encode($config) . ";\n";
        $script .= "</script>\n";
        
        // Add the JavaScript libraries
        $script .= "<script type=\"text/javascript\" src=\"" . $absolutePath . "extension/idealpostcodes/catalog/view/javascript/opencart.js\"></script>\n";
        
        // Add the CSS files
        $script .= "<link rel=\"stylesheet\" type=\"text/css\" href=\"" . $absolutePath . "extension/idealpostcodes/catalog/view/css/ideal-postcodes-autocomplete.css\" />\n";
        $script .= "<link rel=\"stylesheet\" type=\"text/css\" href=\"" . $absolutePath . "extension/idealpostcodes/catalog/view/css/ideal-postcodes-lookup.css\" />\n";
        
        // Insert the script before the closing head tag
        $output = str_replace('</head>', $script . '</head>', $output);
    }

    private function getConfig()
    {
        $this->load->model('setting/setting');
        $settings = $this->model_setting_setting->getSetting('module_ukaddresssearch');
        
        // Check if settings exist
        if (!isset($settings['module_ukaddresssearch_settings'])) {
            return [
                "enabled" => false,
                "apiKey" => '',
                "autocomplete" => true,
                "postcodeLookup" => true,
                "populateOrganisation" => true,
                "populateCounty" => true,
                'postcodeLookupOverride' => '{}',
                'autocompleteOverride' => '{}',
                'customFields' => '[]'
            ];
        }
        
        // Get settings
        $settings = $settings['module_ukaddresssearch_settings'];
        
        return [
            "enabled" => $this->to_bool($settings['idealpostcodes_enabled'] ?? 0),
            "apiKey" => $settings['idealpostcodes_api_key'] ?? '',
            "autocomplete" => $this->to_bool($settings['idealpostcodes_autocomplete'] ?? 1),
            "postcodeLookup" => $this->to_bool($settings['idealpostcodes_postcodelookup'] ?? 1),
            "populateOrganisation" => $this->to_bool($settings['idealpostcodes_populate_organisation'] ?? 1),
            "populateCounty" => $this->to_bool($settings['idealpostcodes_populate_county'] ?? 1),
            'postcodeLookupOverride' => html_entity_decode($settings['idealpostcodes_postcodelookup_override'] ?? '{}'),
            'autocompleteOverride' => html_entity_decode($settings['idealpostcodes_autocomplete_override'] ?? '{}'),
            'customFields' => html_entity_decode($settings['idealpostcodes_custom_fields'] ?? '[]')
        ];
    }

    private function to_bool($value)
    {
        return (intval($value) === 1);
    }
}
