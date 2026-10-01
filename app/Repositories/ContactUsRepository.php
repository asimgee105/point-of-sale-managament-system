<?php

namespace App\Repositories;

use App\Models\ContactUs;

/**
 * Class ContactUsRepository
 */
class ContactUsRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'name',
        'email',
        'subject',
        'message',
        'created_at'
    ];

    /**
     * Return searchable fields
     */
    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    /**
     * Configure the Model
     **/
    public function model()
    {
        return ContactUs::class;
    }
}
