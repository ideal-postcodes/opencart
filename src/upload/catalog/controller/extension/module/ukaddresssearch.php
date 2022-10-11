<?php
class ControllerExtensionModuleUkaddresssearch extends Controller
{
    public function index()
    {
        $isSSL = $this->config->get('config_secure'); //Get the value whether website uses SSL
        if (isset($isSSL)) {
            $data['absolutePath'] = $this->config->get('config_ssl');
        } else {
            $data['absolutePath'] = $this->config->get('config_url');
        }

        $data['idpcConfig'] = $this->getConfig();
        $data['postcodeLookupOverride'] = $data['idpcConfig']['postcodeLookupOverride'];
        $data['autocompleteOverride'] = $data['idpcConfig']['autocompleteOverride'];
        $data['customFields'] = $data['idpcConfig']['customFields'];

        return $this->load->view('extension/module/ukaddresssearch', $data);
    }

    private function getConfig()
    {
        $this->load->model('setting/setting');
        $settings = $this->model_setting_setting->getSetting('module_ukaddresssearch');
        //override
        $settings = $settings['module_ukaddresssearch_settings'];
        return [
            "enabled" => $this->to_bool($settings['idealpostcodes_enabled']),
            "apiKey" => $settings['idealpostcodes_api_key'],
            "autocomplete" => $this->to_bool($settings['idealpostcodes_autocomplete']),
            "postcodeLookup" => $this->to_bool($settings['idealpostcodes_postcodelookup']),
            "populateOrganisation" => $this->to_bool($settings['idealpostcodes_populate_organisation']),
            "populateCounty" => $this->to_bool($settings['idealpostcodes_populate_county']),
            'postcodeLookupOverride' => html_entity_decode($settings['idealpostcodes_postcodelookup_override']),
            'autocompleteOverride' => html_entity_decode($settings['idealpostcodes_autocomplete_override']),
			'customFields' => html_entity_decode($settings['idealpostcodes_custom_fields'])
        ];
    }

    private function to_bool($value)
    {
        if (intval($value) === 1) {
            return true;
        } else {
            return false;
        }
    }
}
