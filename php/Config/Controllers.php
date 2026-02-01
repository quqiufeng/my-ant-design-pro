<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

class Controllers extends BaseConfig
{
    public $defaultController = 'Api';

    public $defaultMethod = 'index';

    public $translateURIDashes = false;

    public $enable404 = true;

    public $indexPage = 'index.php';
}
