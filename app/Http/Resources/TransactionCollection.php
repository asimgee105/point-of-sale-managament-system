<?php

namespace App\Http\Resources;

/**
 * Class TransactionCollection
 */
class TransactionCollection extends BaseCollection
{
    public $collects = TransactionResource::class;
}
