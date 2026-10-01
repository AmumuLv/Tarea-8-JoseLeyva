<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    // Los catálogos mínimos de autorización se preparan una sola vez en la
    // base aislada helpdesk_testing antes de ejecutar PHPUnit. Las pruebas
    // usan DatabaseTransactions para revertir únicamente sus propios datos.
}
