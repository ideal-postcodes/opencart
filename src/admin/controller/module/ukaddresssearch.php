<?php
namespace Opencart\Admin\Controller\Extension\idealpostcodes\Module;
class Ukaddresssearch extends \Opencart\System\Engine\Controller
{
    private $error = [];

    public function index()
    {
        $this->load->language('extension/idealpostcodes/module/ukaddresssearch');
        $this->document->setTitle($this->language->get('heading_title'));
        $this->load->model('setting/setting');
        //POST
        if (
            $this->request->server['REQUEST_METHOD'] == 'POST' &&
            $this->validate()
        ) {
            //Save posted configuration data
            $this->setConfig($this->request->post);

            //display success message
            $this->session->data['success'] = $this->language->get(
                'text_success'
            );
            //redirect to
            $this->response->redirect(
                $this->url->link(
                    'marketplace/extension',
                    'user_token=' .
                        $this->session->data['user_token'] .
                        '&type=module',
                    true
                )
            );
        } else {
            //GET
            $data = $this->getConfig();
        }
        //ERRORS
        if (isset($this->error['warning'])) {
            $data['error_warning'] = $this->error['warning'];
        } else {
            $data['error_warning'] = '';
        }
        if (isset($this->error['api_key'])) {
            $data['error_api_key'] = $this->error['api_key'];
        } else {
            $data['error_api_key'] = '';
        }
        //BREADCRUMBS
        $data['breadcrumbs'] = [];
        $data['breadcrumbs'][] = [
            'text' => $this->language->get('text_home'),
            'href' => $this->url->link(
                'common/dashboard',
                'user_token=' . $this->session->data['user_token'],
                true
            ),
        ];
        $data['breadcrumbs'][] = [
            'text' => $this->language->get('text_extension'),
            'href' => $this->url->link(
                'marketplace/extension',
                'user_token=' .
                    $this->session->data['user_token'] .
                    '&type=module',
                true
            ),
        ];
        $data['breadcrumbs'][] = [
            'text' => $this->language->get('heading_title'),
            'href' => $this->url->link(
                'extension/idealpostcodes/module/ukaddresssearch',
                'user_token=' . $this->session->data['user_token'],
                true
            ),
        ];
        //ACTIONS
        $data['action'] = $this->url->link(
            'extension/idealpostcodes/module/ukaddresssearch',
            'user_token=' . $this->session->data['user_token'],
            true
        );
        $data['cancel'] = $this->url->link(
            'marketplace/extension',
            'user_token=' . $this->session->data['user_token'] . '&type=module',
            true
        );
        //LANGUAGE ENTRIES
        $data['entry_api_key'] = $this->language->get('entry_api_key');
        //LANGUAGES
        $this->load->model('localisation/language');
        $data['languages'] = $this->model_localisation_language->getLanguages();
        //CONTROLLERS AND VIEWS
        $data['header'] = $this->load->controller('common/header');
        $data['column_left'] = $this->load->controller('common/column_left');
        $data['footer'] = $this->load->controller('common/footer');
        $this->response->setOutput(
            $this->load->view('extension/idealpostcodes/module/ukaddresssearch', $data)
        );
    }

    protected function validate()
    {
        if (
            !$this->user->hasPermission(
                'modify',
                'extension/idealpostcodes/module/ukaddresssearch'
            )
        ) {
            $this->error['warning'] = $this->language->get('error_permission');
        }

        if (!$this->request->post['idealpostcodes_api_key']) {
            $this->error['api_key'] = $this->language->get('error_api_key');
        }
        return !$this->error;
    }

    public function install()
    {
        try {
            $this->load->model('setting/setting');
            $this->model_setting_setting->editSetting('module_ukaddresssearch', [
                'module_ukaddresssearch_status' => 1,
                'module_ukaddresssearch_settings' => [
                    'idealpostcodes_enabled' => 0,
                    'idealpostcodes_api_key' => '',
                    'idealpostcodes_autocomplete' => 1,
                    'idealpostcodes_postcodelookup' => 1,
                    'idealpostcodes_populate_organisation' => 1,
                    'idealpostcodes_populate_county' => 1,
                    'idealpostcodes_postcodelookup_override' => '{}',
                    'idealpostcodes_autocomplete_override' => '{}',
                    'idealpostcodes_custom_fields' => '[]'
                ],
            ]);
            
            // Register event to inject the configuration into the page header
            $this->load->model('setting/event');
            $this->model_setting_event->addEvent([
                'code' => 'ukaddresssearch',
                'description' => 'Add UK Address Search to pages',
                'trigger' => 'catalog/view/common/header/after',
                'action' => 'extension/idealpostcodes/module/ukaddresssearch.injectConfig',
                'status' => 1,
                'sort_order' => 0
            ]);
        } catch (\Exception $e) {
            $this->log->write('Failed to install UK Address Search module: ' . $e->getMessage());
            throw $e;
        }
    }

    public function uninstall()
    {
        try {
            $this->load->model('setting/setting');
            $this->model_setting_setting->deleteSetting('module_ukaddresssearch');
            
            // Remove the event when uninstalling
            $this->load->model('setting/event');
            $this->model_setting_event->deleteEventByCode('ukaddresssearch');
        } catch (\Exception $e) {
            $this->log->write('Failed to uninstall UK Address Search module: ' . $e->getMessage());
            throw $e;
        }
    }

    private function setConfig(array $config)
    {
        $this->load->model('setting/setting');
        $this->model_setting_setting->editSetting('module_ukaddresssearch', [
            'module_ukaddresssearch_status' => 1,
            'module_ukaddresssearch_settings' => $config,
        ]);
    }

    private function getConfig()
    {
        $this->load->model('setting/setting');
        $settings = $this->model_setting_setting->getSetting(
            'module_ukaddresssearch'
        );
        
        // Default values if settings aren't found
        $defaults = [
            'idealpostcodes_enabled' => 0,
            'idealpostcodes_api_key' => '',
            'idealpostcodes_autocomplete' => 1,
            'idealpostcodes_postcodelookup' => 1,
            'idealpostcodes_populate_organisation' => 1,
            'idealpostcodes_populate_county' => 1,
            'idealpostcodes_postcodelookup_override' => '{}',
            'idealpostcodes_autocomplete_override' => '{}',
            'idealpostcodes_custom_fields' => '[]'
        ];
        
        return isset($settings['module_ukaddresssearch_settings']) 
            ? $settings['module_ukaddresssearch_settings'] 
            : $defaults;
    }
}
