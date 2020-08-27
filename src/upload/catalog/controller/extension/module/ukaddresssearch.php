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
        $data['postcodeLookupOverride'] =
            $data['idpcConfig']['postcodeLookupOverride'];
        $data['autocompleteOverride'] =
            $data['idpcConfig']['autocompleteOverride'];
        $this->document->addStyle(
            '/catalog/view/theme/default/stylesheet/ideal-postcodes-lookup.css'
        );
        $this->document->addStyle(
            '/catalog/view/theme/default/stylesheet/ideal-postcodes-autocomplete.css'
        );
        return $this->load->view('extension/module/ukaddresssearch', $data);
    }

    private function getConfig()
    {
        $this->load->model('setting/setting');
        $settings = $this->model_setting_setting->getSetting(
            'module_ukaddresssearch'
        );
        //override
        $settings = $settings['module_ukaddresssearch_settings'];
        return [
            "enabled" => $this->to_bool($settings['idealpostcodes_enabled']),
            "apiKey" => $settings['idealpostcodes_api_key'],
            "autocomplete" => $this->to_bool(
                $settings['idealpostcodes_autocomplete']
            ),
            "postcodeLookup" => $this->to_bool(
                $settings['idealpostcodes_postcodelookup']
            ),
            "populateOrganisation" => $this->to_bool(
                $settings['idealpostcodes_populate_organisation']
            ),
            "populateCounty" => $this->to_bool(
                $settings['idealpostcodes_populate_county']
            ),
            'postcodeLookupOverride' =>
                $settings['idealpostcodes_postcodelookup_override'],
            'autocompleteOverride' =>
                $settings['idealpostcodes_autocomplete_override'],
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
